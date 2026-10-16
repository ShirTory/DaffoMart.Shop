"use client";
import { useEffect, useState } from "react";
import { api, ApiClientError } from "@/lib/api";
import { Empty, ErrorBox, Field, Icon, Modal, PageHeader, PageLoader, Spinner, StatusBadge, Toggle, useConfirm, useList, useToast } from "@/components/admin/ui";
import type { CustomPaymentMethod, StoreSettings } from "@/lib/types";

const Row = ({ title, desc, on, onChange, children }: { title: string; desc: string; on: boolean; onChange: (v: boolean) => void; children?: React.ReactNode }) => (
  <section className="card p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{title}</h2><p className="text-sm text-gray-500">{desc}</p></div><Toggle checked={on} onChange={onChange} /></div>{on && children && <div className="mt-4 grid gap-4 border-t pt-4">{children}</div>}</section>
);

type F = Pick<StoreSettings, "payCod" | "payBkash" | "bkashNumber" | "payNagad" | "nagadNumber" | "payOnline" | "payInstructions">;
type MethodForm = { label: string; hint: string; number: string; icon: string; active: boolean; sortOrder: number; requireTrx: boolean };

export default function PaymentsPage() {
  const toast = useToast(); const { confirm, node } = useConfirm();
  const { data, loading, error, reload } = useList<StoreSettings>("/api/settings");
  const methods = useList<CustomPaymentMethod[]>("/api/payment-methods");
  const sys = useList<{ gateway: { connected: boolean; name: string; test: boolean } }>("/api/admin/system"); const gw = sys.data?.gateway;
  const [f, setF] = useState<F | null>(null); const [busy, setBusy] = useState(false); const [errs, setErrs] = useState<Record<string, string>>({});
  const [edit, setEdit] = useState<{ id?: string; f: MethodForm } | null>(null);
  useEffect(() => { if (data) setF({ payCod: data.payCod, payBkash: data.payBkash, bkashNumber: data.bkashNumber, payNagad: data.payNagad, nagadNumber: data.nagadNumber, payOnline: data.payOnline, payInstructions: data.payInstructions }); }, [data]);
  if (loading) return <PageLoader />; if (error || !f) return <ErrorBox msg={error || "Failed to load"} retry={reload} />;
  const set = <K extends keyof F>(k: K, v: F[K]) => setF({ ...f, [k]: v });
  const save = async () => {
    if (!f.payCod && !f.payBkash && !f.payNagad && !f.payOnline && !(methods.data ?? []).some((m) => m.active)) return toast("Keep at least one payment method enabled", "err");
    setBusy(true); setErrs({});
    try { await api("/api/settings", { method: "PUT", body: f }); toast("Payment settings saved"); } catch (x: any) { if (x instanceof ApiClientError) setErrs(x.fields); toast(x.message, "err"); } finally { setBusy(false); }
  };

  const openMethod = (m?: CustomPaymentMethod) => {
    setErrs({});
    setEdit(m
      ? { id: m.id, f: { label: m.label, hint: m.hint || "", number: m.number || "", icon: m.icon || "", active: m.active, sortOrder: m.sortOrder, requireTrx: m.requireTrx } }
      : { f: { label: "", hint: "Send money, then enter the TrxID.", number: "", icon: "💳", active: true, sortOrder: 0, requireTrx: true } });
  };
  const setM = <K extends keyof MethodForm>(k: K, v: MethodForm[K]) => setEdit((x) => (x ? { ...x, f: { ...x.f, [k]: v } } : x));
  const saveMethod = async () => {
    if (!edit) return; setBusy(true); setErrs({});
    try {
      const s = await api<CustomPaymentMethod>(edit.id ? `/api/payment-methods/${edit.id}` : "/api/payment-methods", { method: edit.id ? "PUT" : "POST", body: edit.f });
      methods.setData((d) => edit.id ? (d ?? []).map((x) => (x.id === s.id ? s : x)) : [...(d ?? []), s]);
      toast("Payment method saved"); setEdit(null);
    } catch (e: any) { if (e instanceof ApiClientError) setErrs(e.fields); toast(e.message, "err"); } finally { setBusy(false); }
  };
  const delMethod = async (m: CustomPaymentMethod) => {
    if (!(await confirm(`Delete payment method “${m.label}”?`))) return;
    try { await api(`/api/payment-methods/${m.id}`, { method: "DELETE" }); methods.setData((d) => (d ?? []).filter((x) => x.id !== m.id)); toast("Deleted"); } catch (e: any) { toast(e.message, "err"); }
  };

  const list = (methods.data ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));

  return (
    <>
      {node}
      <PageHeader title="Payments" subtitle="Built-in methods + any custom option (Rocket, Upay, bank transfer…)"><button className="btn-primary" onClick={save} disabled={busy}>{busy && <Spinner className="h-4 w-4" />}Save built-in settings</button></PageHeader>
      <div className="grid gap-5 lg:grid-cols-2">
        <Row title="💵 Cash on delivery" desc="Customer pays the rider in cash. Marked “paid” automatically when delivered." on={f.payCod} onChange={(v) => set("payCod", v)} />
        <Row title="bKash (manual)" desc="Customer sends money to your number and enters the TrxID. You verify it on the order." on={f.payBkash} onChange={(v) => set("payBkash", v)}>
          <Field label="Your bKash number" error={errs.bkashNumber} hint="Required — shown to customers at checkout"><input className="input" value={f.bkashNumber} onChange={(e) => set("bkashNumber", e.target.value)} placeholder="01XXXXXXXXX" /></Field></Row>
        <Row title="Nagad (manual)" desc="Same as bKash, with your Nagad number." on={f.payNagad} onChange={(v) => set("payNagad", v)}>
          <Field label="Your Nagad number" error={errs.nagadNumber} hint="Required — shown to customers at checkout"><input className="input" value={f.nagadNumber} onChange={(e) => set("nagadNumber", e.target.value)} placeholder="01XXXXXXXXX" /></Field></Row>
        <Row title="💳 Online payment gateway" desc="Card / mobile banking through a payment gateway (SSLCommerz, AamarPay, bKash PGW…)." on={f.payOnline} onChange={(v) => set("payOnline", v)}>
          {gw?.connected && !gw.test ? <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"><StatusBadge status="active" label={`Connected: ${gw.name}`} /><p className="mt-2">Customers can pay by card / mobile banking at checkout.</p></div>
            : gw?.test ? <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><StatusBadge status="low" label="TEST MODE (sandbox)" /><p className="mt-2">Checkout shows a fake payment page — <b>no real money moves</b> and anyone can “pay” for free. Remove <code>PAYMENT_TEST_MODE</code> from the environment before going live.</p></div>
            : <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><StatusBadge status="low" label="No gateway connected yet" /><p className="mt-2">Customers already see <b>Online payment</b> at checkout as “coming soon” (not selectable). When you pick a provider, the developer adds one adapter file — see <code>PAYMENTS.md</code> — and it turns on automatically. To try the full flow now, set <code>PAYMENT_TEST_MODE=true</code>.</p></div>}
          </Row>
        <section className="card p-5 lg:col-span-2"><h2 className="font-bold">Instructions shown for manual payments</h2>
          <textarea className="input mt-3" rows={3} value={f.payInstructions} onChange={(e) => set("payInstructions", e.target.value)} />
          <p className="mt-2 text-xs text-gray-500">Verify manual payments in <b>Orders → open an order → Payment</b> and press “Mark as paid”.</p></section>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Custom payment methods</h2>
            <p className="text-sm text-gray-500">Add Rocket, Upay, bank transfer, or any other option. Customers see them at checkout.</p>
          </div>
          <button className="btn-primary" onClick={() => openMethod()}><Icon name="plus" className="h-4 w-4" />Add payment method</button>
        </div>
        {methods.loading ? <PageLoader /> : list.length === 0 ? (
          <Empty title="No custom methods yet" hint="Add Rocket, Upay, bank account, or any payment option your customers use." action={<button className="btn-primary" onClick={() => openMethod()}>Add first method</button>} />
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Method</th><th className="px-4 py-3">Number / account</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
              <tbody>
                {list.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-4 py-3"><span className="mr-1.5">{m.icon || "💳"}</span><b>{m.label}</b>{m.hint && <span className="mt-0.5 block text-xs text-gray-500">{m.hint}</span>}</td>
                    <td className="px-4 py-3 font-mono text-xs">{m.number || "—"}</td>
                    <td className="px-4 py-3">{m.active ? <StatusBadge status="active" label="Visible" /> : <StatusBadge status="low" label="Hidden" />}</td>
                    <td className="px-4 py-3 text-right"><button className="btn-outline mr-2 text-xs" onClick={() => openMethod(m)}>Edit</button><button className="btn-outline text-xs text-red-600" onClick={() => delMethod(m)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {edit && (
        <Modal open={!!edit} title={edit?.id ? "Edit payment method" : "Add payment method"} onClose={() => !busy && setEdit(null)}
          footer={<><button className="btn-outline" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary" onClick={saveMethod} disabled={busy}>{busy && <Spinner className="h-4 w-4" />}Save</button></>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label" error={errs.label} hint="e.g. Rocket, Upay, Bank transfer"><input className="input" value={edit.f.label} onChange={(e) => setM("label", e.target.value)} placeholder="Rocket" /></Field>
            <Field label="Icon / emoji"><input className="input" value={edit.f.icon} onChange={(e) => setM("icon", e.target.value)} placeholder="💳" maxLength={4} /></Field>
            <Field label="Account / number" hint="Shown to customer so they can send money"><input className="input" value={edit.f.number} onChange={(e) => setM("number", e.target.value)} placeholder="01XXXXXXXXX or account no." /></Field>
            <Field label="Sort order"><input className="input" type="number" value={edit.f.sortOrder} onChange={(e) => setM("sortOrder", Number(e.target.value))} /></Field>
            <div className="sm:col-span-2"><Field label="Hint shown at checkout"><input className="input" value={edit.f.hint} onChange={(e) => setM("hint", e.target.value)} placeholder="Send money, then enter the TrxID." /></Field></div>
            <label className="flex items-center gap-2 text-sm"><Toggle checked={edit.f.active} onChange={(v) => setM("active", v)} /><span>Visible at checkout</span></label>
            <label className="flex items-center gap-2 text-sm"><Toggle checked={edit.f.requireTrx} onChange={(v) => setM("requireTrx", v)} /><span>Require TrxID + payer number</span></label>
          </div>
        </Modal>
      )}
    </>
  );
}
