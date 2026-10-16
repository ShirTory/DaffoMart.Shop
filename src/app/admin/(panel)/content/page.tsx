"use client";
import { useEffect, useState } from "react";
import { api, ApiClientError } from "@/lib/api";
import { ErrorBox, Field, Icon, ImageUpload, PageHeader, PageLoader, Spinner, Toggle, useList, useToast } from "@/components/admin/ui";
import type { Feature, StoreSettings } from "@/lib/types";

type F = Pick<StoreSettings, "logo" | "heroTitle" | "heroSubtitle" | "heroCta" | "features" | "showMedicine" | "medicineTitle" | "medicineSubtitle" | "medicineNotice" | "footerText">;
export default function ContentPage() {
  const toast = useToast(); const { data, loading, error, reload } = useList<StoreSettings>("/api/settings");
  const [f, setF] = useState<F | null>(null); const [busy, setBusy] = useState(false); const [errs, setErrs] = useState<Record<string, string>>({});
  useEffect(() => { if (data) setF({ logo: data.logo, heroTitle: data.heroTitle, heroSubtitle: data.heroSubtitle, heroCta: data.heroCta, features: data.features, showMedicine: data.showMedicine, medicineTitle: data.medicineTitle, medicineSubtitle: data.medicineSubtitle, medicineNotice: data.medicineNotice, footerText: data.footerText }); }, [data]);
  if (loading) return <PageLoader />; if (error || !f) return <ErrorBox msg={error || "Failed to load"} retry={reload} />;
  const set = <K extends keyof F>(k: K, v: F[K]) => setF({ ...f, [k]: v });
  const txt = (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value as never);
  const feat = (i: number, patch: Partial<Feature>) => set("features", f.features.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const save = async () => {
    setBusy(true); setErrs({});
    try { await api("/api/settings", { method: "PUT", body: f }); toast("Website content saved"); } catch (x: any) { if (x instanceof ApiClientError) setErrs(x.fields); toast(x.message, "err"); } finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader title="Website content" subtitle="Edit the texts, logo and sections customers see on your website"><a href="/" target="_blank" className="btn-outline"><Icon name="external" className="h-4 w-4" />Preview store</a><button className="btn-primary" onClick={save} disabled={busy}>{busy && <Spinner className="h-4 w-4" />}Save changes</button></PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-4 p-5"><h2 className="font-bold">Logo</h2>
          <ImageUpload kind="general" label="Store logo (optional)" value={f.logo || undefined} onChange={(v) => set("logo", v ?? "")} aspect="aspect-[4/1]" rounded="rounded-lg" hint="Wide logo on a transparent or white background. Leave empty to use the default DaffoMart logo." />
          <Field label="Footer description" hint="Short text under the logo in the footer. Empty = use tagline."><textarea className="input" rows={2} value={f.footerText} onChange={txt("footerText")} /></Field>
        </section>
        <section className="card space-y-4 p-5"><h2 className="font-bold">Home page banner text</h2>
          <p className="-mt-2 text-xs text-gray-500">Shown when there are no cover images. Manage sliders in “Cover Images”.</p>
          <Field label="Heading" error={errs.heroTitle} hint="Press Enter for a new line"><textarea className="input" rows={2} value={f.heroTitle} onChange={txt("heroTitle")} /></Field>
          <Field label="Sub-heading"><input className="input" value={f.heroSubtitle} onChange={txt("heroSubtitle")} /></Field>
          <Field label="Button text"><input className="input" value={f.heroCta} onChange={txt("heroCta")} placeholder="Shop now" /></Field>
        </section>
        <section className="card space-y-4 p-5 lg:col-span-2"><div className="flex items-center justify-between"><h2 className="font-bold">💊 Medicine section</h2><Toggle checked={f.showMedicine} onChange={(v) => set("showMedicine", v)} label="Show on website" /></div>
          <p className="-mt-2 text-xs text-gray-500">Create categories with section type “Medicine” in Categories, then add medicine products — they appear here, highlighted in green, and on the /medicine page.</p>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Section title"><input className="input" value={f.medicineTitle} onChange={txt("medicineTitle")} /></Field><Field label="Section sub-title"><input className="input" value={f.medicineSubtitle} onChange={txt("medicineSubtitle")} /></Field>
            <Field label="Notice (e.g. prescription rule)" className="sm:col-span-2"><textarea className="input" rows={2} value={f.medicineNotice} onChange={txt("medicineNotice")} /></Field></div>
        </section>
        <section className="card space-y-4 p-5 lg:col-span-2"><div className="flex items-center justify-between"><h2 className="font-bold">Highlights strip</h2>{f.features.length < 6 && <button className="btn-outline btn-sm" onClick={() => set("features", [...f.features, { icon: "⭐", title: "", text: "" }])}><Icon name="plus" className="h-4 w-4" />Add</button>}</div>
          <div className="space-y-3">{f.features.map((x, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[80px_1fr_1fr_auto]"><input className="input text-center text-lg" value={x.icon} maxLength={8} onChange={(e) => feat(i, { icon: e.target.value })} aria-label="Emoji" /><input className="input" placeholder="Title" value={x.title} onChange={(e) => feat(i, { title: e.target.value })} /><input className="input" placeholder="Short text" value={x.text} onChange={(e) => feat(i, { text: e.target.value })} />
              <button className="btn-ghost btn-sm text-red-600" onClick={() => set("features", f.features.filter((_, k) => k !== i))} aria-label="Remove"><Icon name="trash" className="h-4 w-4" /></button></div>))}</div>
        </section>
      </div>
    </>
  );
}
