"use client";
import { useState } from "react";
import { api, ApiClientError } from "@/lib/api";
import { Empty, ErrorBox, Field, Icon, Modal, PageHeader, PageLoader, Spinner, Toggle, useConfirm, useList, useToast } from "@/components/admin/ui";
import type { CourierPartner } from "@/lib/types";

type Form = { name: string; phone: string; contactPerson: string; areas: string; chargeNote: string; trackingUrl: string; active: boolean; sortOrder: string; notes: string };

export default function CouriersPage() {
  const toast = useToast(); const { confirm, node } = useConfirm();
  const { data, setData, loading, error, reload } = useList<CourierPartner[]>("/api/couriers");
  const [edit, setEdit] = useState<{ id?: string; f: Form } | null>(null);
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});

  const open = (c?: CourierPartner) => {
    setErrs({});
    setEdit(c
      ? { id: c.id, f: { name: c.name, phone: c.phone, contactPerson: c.contactPerson || "", areas: c.areas, chargeNote: c.chargeNote || "", trackingUrl: c.trackingUrl || "", active: c.active, sortOrder: String(c.sortOrder), notes: c.notes || "" } }
      : { f: { name: "", phone: "", contactPerson: "", areas: "Outside Dhaka", chargeNote: "", trackingUrl: "", active: true, sortOrder: String((data?.length ?? 0) + 1), notes: "" } });
  };
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setEdit((e) => (e ? { ...e, f: { ...e.f, [k]: v } } : e));
  const sorted = (l: CourierPartner[]) => [...l].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  const save = async () => {
    if (!edit) return; setBusy(true); setErrs({});
    try {
      const s = await api<CourierPartner>(edit.id ? `/api/couriers/${edit.id}` : "/api/couriers", { method: edit.id ? "PUT" : "POST", body: edit.f });
      setData((d) => sorted(edit.id ? d!.map((x) => (x.id === s.id ? s : x)) : [...(d ?? []), s]));
      toast("Courier partner saved"); setEdit(null);
    } catch (e: any) { if (e instanceof ApiClientError) setErrs(e.fields); toast(e.message, "err"); } finally { setBusy(false); }
  };
  const del = async (c: CourierPartner) => {
    if (!(await confirm(`Delete courier "${c.name}"?`))) return;
    try { await api(`/api/couriers/${c.id}`, { method: "DELETE" }); setData((d) => d!.filter((x) => x.id !== c.id)); toast("Courier deleted"); } catch (e: any) { toast(e.message, "err"); }
  };
  const quick = async (c: CourierPartner, active: boolean) => {
    try { const s = await api<CourierPartner>(`/api/couriers/${c.id}`, { method: "PUT", body: { ...c, active } }); setData((d) => d!.map((x) => (x.id === s.id ? s : x))); } catch (e: any) { toast(e.message, "err"); }
  };

  return (
    <>
      <PageHeader title="Courier partners (outside Dhaka)" subtitle="Manage courier services used for deliveries outside Dhaka and other cities. Shown in admin; customers see the outside-Dhaka note from Settings.">
        <button className="btn-primary" onClick={() => open()}><Icon name="plus" className="h-4 w-4" />Add courier</button>
      </PageHeader>
      {loading ? <PageLoader /> : error ? <ErrorBox msg={error} retry={reload} /> : !data?.length ? (
        <div className="card"><Empty icon="delivery" title="No courier partners yet" hint="Add partners like Pathao Parcel, Sundarban, SA Paribahan for outside-Dhaka orders." action={<button className="btn-primary" onClick={() => open()}>Add courier</button>} /></div>
      ) : (
        <div className="card overflow-hidden"><div className="scroll-thin overflow-x-auto"><table className="w-full min-w-[700px]">
          <thead className="bg-gray-50"><tr><th className="th">Name</th><th className="th">Phone</th><th className="th">Areas</th><th className="th">Charge note</th><th className="th">Active</th><th className="th text-right">Actions</th></tr></thead>
          <tbody className="divide-y">{data.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="td"><p className="font-semibold">{c.name}</p>{c.contactPerson && <p className="text-xs text-gray-500">{c.contactPerson}</p>}</td>
              <td className="td text-gray-600">{c.phone}</td>
              <td className="td text-gray-600">{c.areas}</td>
              <td className="td text-gray-600">{c.chargeNote || "—"}</td>
              <td className="td"><Toggle checked={c.active} onChange={(v) => quick(c, v)} /></td>
              <td className="td text-right">
                <button className="btn-ghost btn-sm" onClick={() => open(c)} aria-label="Edit"><Icon name="edit" className="h-4 w-4" /></button>
                <button className="btn-ghost btn-sm text-red-600" onClick={() => del(c)} aria-label="Delete"><Icon name="trash" className="h-4 w-4" /></button>
              </td>
            </tr>
          ))}</tbody>
        </table></div></div>
      )}
      <p className="mt-3 text-xs text-gray-500">Tip: set the public “Outside Dhaka / courier note” under Settings so customers know courier delivery is available. Use this list when assigning outside orders.</p>

      <Modal open={!!edit} onClose={() => !busy && setEdit(null)} title={edit?.id ? "Edit courier" : "Add courier partner"}
        footer={<><button className="btn-outline" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary" onClick={save} disabled={busy}>{busy && <Spinner className="h-4 w-4" />}Save</button></>}>
        {edit && <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" error={errs.name} className="sm:col-span-2"><input className="input" value={edit.f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Pathao Parcel" /></Field>
          <Field label="Phone" error={errs.phone}><input className="input" value={edit.f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Contact person"><input className="input" value={edit.f.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} /></Field>
          <Field label="Service areas" className="sm:col-span-2"><input className="input" value={edit.f.areas} onChange={(e) => set("areas", e.target.value)} placeholder="Outside Dhaka, Chattogram, Sylhet" /></Field>
          <Field label="Charge note"><input className="input" value={edit.f.chargeNote} onChange={(e) => set("chargeNote", e.target.value)} placeholder="From ৳120 / kg" /></Field>
          <Field label="Tracking URL"><input className="input" value={edit.f.trackingUrl} onChange={(e) => set("trackingUrl", e.target.value)} placeholder="https://..." /></Field>
          <Field label="Sort order"><input className="input" type="number" value={edit.f.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} /></Field>
          <Field label="Internal notes" className="sm:col-span-2"><textarea className="input min-h-[72px]" value={edit.f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          <div className="sm:col-span-2"><Toggle checked={edit.f.active} onChange={(v) => set("active", v)} label="Active partner" /></div>
        </div>}
      </Modal>
      {node}
    </>
  );
}
