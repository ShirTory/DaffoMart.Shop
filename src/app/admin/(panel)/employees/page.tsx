"use client";
import { useMemo, useState } from "react";
import { api, ApiClientError } from "@/lib/api";
import { Empty, ErrorBox, Field, Icon, Modal, PageHeader, PageLoader, Spinner, Toggle, useConfirm, useList, useToast } from "@/components/admin/ui";
import { EMPLOYEE_ROLES, ROLE_LABEL, type AttendanceRecord, type Employee, type EmployeeRole } from "@/lib/types";

type EmpForm = { name: string; phone: string; email: string; role: EmployeeRole; department: string; active: boolean; joinedAt: string; notes: string };
type AttForm = { employeeId: string; date: string; checkIn: string; checkOut: string; status: AttendanceRecord["status"]; note: string };

const today = () => new Date().toISOString().slice(0, 10);

export default function EmployeesPage() {
  const toast = useToast(); const { confirm, node } = useConfirm();
  const emps = useList<Employee[]>("/api/employees");
  const atts = useList<AttendanceRecord[]>("/api/attendance");
  const [tab, setTab] = useState<"staff" | "attendance">("staff");
  const [edit, setEdit] = useState<{ id?: string; f: EmpForm } | null>(null);
  const [attEdit, setAttEdit] = useState<{ id?: string; f: AttForm } | null>(null);
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState(today());

  const openEmp = (e?: Employee) => {
    setErrs({});
    setEdit(e
      ? { id: e.id, f: { name: e.name, phone: e.phone, email: e.email || "", role: e.role, department: e.department || "", active: e.active, joinedAt: e.joinedAt || "", notes: e.notes || "" } }
      : { f: { name: "", phone: "", email: "", role: "staff", department: "", active: true, joinedAt: today(), notes: "" } });
  };
  const setE = <K extends keyof EmpForm>(k: K, v: EmpForm[K]) => setEdit((x) => (x ? { ...x, f: { ...x.f, [k]: v } } : x));

  const saveEmp = async () => {
    if (!edit) return; setBusy(true); setErrs({});
    try {
      const s = await api<Employee>(edit.id ? `/api/employees/${edit.id}` : "/api/employees", { method: edit.id ? "PUT" : "POST", body: edit.f });
      emps.setData((d) => edit.id ? (d ?? []).map((x) => (x.id === s.id ? s : x)) : [...(d ?? []), s]);
      toast("Employee saved"); setEdit(null);
    } catch (e: any) { if (e instanceof ApiClientError) setErrs(e.fields); toast(e.message, "err"); } finally { setBusy(false); }
  };
  const delEmp = async (e: Employee) => {
    if (!(await confirm(`Delete employee "${e.name}"? Attendance history is kept.`))) return;
    try { await api(`/api/employees/${e.id}`, { method: "DELETE" }); emps.setData((d) => (d ?? []).filter((x) => x.id !== e.id)); toast("Employee deleted"); } catch (ex: any) { toast(ex.message, "err"); }
  };
  const quickEmp = async (e: Employee, active: boolean) => {
    try { const s = await api<Employee>(`/api/employees/${e.id}`, { method: "PUT", body: { ...e, active } }); emps.setData((d) => (d ?? []).map((x) => (x.id === s.id ? s : x))); } catch (ex: any) { toast(ex.message, "err"); }
  };

  const openAtt = (a?: AttendanceRecord) => {
    setErrs({});
    setAttEdit(a
      ? { id: a.id, f: { employeeId: a.employeeId, date: a.date, checkIn: a.checkIn || "", checkOut: a.checkOut || "", status: a.status, note: a.note || "" } }
      : { f: { employeeId: emps.data?.[0]?.id || "", date: dateFilter || today(), checkIn: "", checkOut: "", status: "present", note: "" } });
  };
  const setA = <K extends keyof AttForm>(k: K, v: AttForm[K]) => setAttEdit((x) => (x ? { ...x, f: { ...x.f, [k]: v } } : x));

  const saveAtt = async () => {
    if (!attEdit) return; setBusy(true); setErrs({});
    try {
      const s = await api<AttendanceRecord>(attEdit.id ? `/api/attendance/${attEdit.id}` : "/api/attendance", { method: attEdit.id ? "PUT" : "POST", body: attEdit.f });
      atts.setData((d) => attEdit.id ? (d ?? []).map((x) => (x.id === s.id ? s : x)) : [...(d ?? []), s]);
      toast("Attendance saved"); setAttEdit(null);
    } catch (e: any) { if (e instanceof ApiClientError) setErrs(e.fields); toast(e.message, "err"); } finally { setBusy(false); }
  };
  const delAtt = async (a: AttendanceRecord) => {
    if (!(await confirm(`Delete attendance for ${a.employeeName} on ${a.date}?`))) return;
    try { await api(`/api/attendance/${a.id}`, { method: "DELETE" }); atts.setData((d) => (d ?? []).filter((x) => x.id !== a.id)); toast("Record deleted"); } catch (ex: any) { toast(ex.message, "err"); }
  };

  const staffList = useMemo(() => (emps.data ?? []).filter((e) => roleFilter === "all" || e.role === roleFilter), [emps.data, roleFilter]);
  const attList = useMemo(() => (atts.data ?? []).filter((a) => !dateFilter || a.date === dateFilter), [atts.data, dateFilter]);

  const markToday = async (emp: Employee, status: AttendanceRecord["status"] = "present") => {
    setBusy(true);
    try {
      const existing = (atts.data ?? []).find((a) => a.employeeId === emp.id && a.date === today());
      const body = { employeeId: emp.id, date: today(), checkIn: status === "present" || status === "late" ? new Date().toTimeString().slice(0, 5) : "", checkOut: "", status, note: "" };
      const s = await api<AttendanceRecord>(existing ? `/api/attendance/${existing.id}` : "/api/attendance", { method: existing ? "PUT" : "POST", body });
      atts.setData((d) => existing ? (d ?? []).map((x) => (x.id === s.id ? s : x)) : [...(d ?? []), s]);
      toast(`${emp.name}: ${status}`);
    } catch (e: any) { toast(e.message, "err"); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Employees & Attendance" subtitle="Full operations roster — CEO to rider. Mark daily attendance and manage roles.">
        {tab === "staff"
          ? <button className="btn-primary" onClick={() => openEmp()}><Icon name="plus" className="h-4 w-4" />Add employee</button>
          : <button className="btn-primary" onClick={() => openAtt()}><Icon name="plus" className="h-4 w-4" />Add record</button>}
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        <button className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === "staff" ? "bg-primary text-white" : "bg-white text-gray-700 shadow-sm"}`} onClick={() => setTab("staff")}>Staff roster</button>
        <button className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === "attendance" ? "bg-primary text-white" : "bg-white text-gray-700 shadow-sm"}`} onClick={() => setTab("attendance")}>Attendance</button>
      </div>

      {tab === "staff" && (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            <select className="input w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All roles</option>
              {EMPLOYEE_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </div>
          {emps.loading ? <PageLoader /> : emps.error ? <ErrorBox msg={emps.error} retry={emps.reload} /> : !staffList.length ? (
            <div className="card"><Empty icon="users" title="No employees yet" hint="Add CEO, managers, staff, warehouse, support and riders for full operations tracking." action={<button className="btn-primary" onClick={() => openEmp()}>Add employee</button>} /></div>
          ) : (
            <div className="card overflow-hidden"><div className="scroll-thin overflow-x-auto"><table className="w-full min-w-[720px]">
              <thead className="bg-gray-50"><tr><th className="th">Name</th><th className="th">Role</th><th className="th">Phone</th><th className="th">Department</th><th className="th">Active</th><th className="th">Today</th><th className="th text-right">Actions</th></tr></thead>
              <tbody className="divide-y">{staffList.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="td font-semibold">{e.name}</td>
                  <td className="td"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{ROLE_LABEL[e.role]}</span></td>
                  <td className="td text-gray-600">{e.phone}</td>
                  <td className="td text-gray-600">{e.department || "—"}</td>
                  <td className="td"><Toggle checked={e.active} onChange={(v) => quickEmp(e, v)} /></td>
                  <td className="td">
                    <div className="flex flex-wrap gap-1">
                      <button className="btn-ghost btn-sm text-emerald-700" disabled={busy} onClick={() => markToday(e, "present")}>Present</button>
                      <button className="btn-ghost btn-sm text-amber-700" disabled={busy} onClick={() => markToday(e, "late")}>Late</button>
                      <button className="btn-ghost btn-sm text-red-600" disabled={busy} onClick={() => markToday(e, "absent")}>Absent</button>
                    </div>
                  </td>
                  <td className="td text-right">
                    <button className="btn-ghost btn-sm" onClick={() => openEmp(e)} aria-label="Edit"><Icon name="edit" className="h-4 w-4" /></button>
                    <button className="btn-ghost btn-sm text-red-600" onClick={() => delEmp(e)} aria-label="Delete"><Icon name="trash" className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}</tbody>
            </table></div></div>
          )}
        </>
      )}

      {tab === "attendance" && (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="text-sm text-gray-600">Date</label>
            <input type="date" className="input w-auto" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            <button className="btn-outline btn-sm" onClick={() => setDateFilter(today())}>Today</button>
          </div>
          {atts.loading ? <PageLoader /> : atts.error ? <ErrorBox msg={atts.error} retry={atts.reload} /> : !attList.length ? (
            <div className="card"><Empty icon="users" title="No attendance for this date" hint="Mark staff present/late/absent from the Staff roster, or add a record here." action={<button className="btn-primary" onClick={() => openAtt()}>Add record</button>} /></div>
          ) : (
            <div className="card overflow-hidden"><div className="scroll-thin overflow-x-auto"><table className="w-full min-w-[640px]">
              <thead className="bg-gray-50"><tr><th className="th">Employee</th><th className="th">Role</th><th className="th">Date</th><th className="th">Check-in</th><th className="th">Check-out</th><th className="th">Status</th><th className="th text-right">Actions</th></tr></thead>
              <tbody className="divide-y">{attList.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="td font-semibold">{a.employeeName}</td>
                  <td className="td text-gray-600">{ROLE_LABEL[a.role]}</td>
                  <td className="td">{a.date}</td>
                  <td className="td">{a.checkIn || "—"}</td>
                  <td className="td">{a.checkOut || "—"}</td>
                  <td className="td"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${a.status === "present" ? "bg-emerald-100 text-emerald-800" : a.status === "late" ? "bg-amber-100 text-amber-800" : a.status === "leave" || a.status === "half" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>{a.status}</span></td>
                  <td className="td text-right">
                    <button className="btn-ghost btn-sm" onClick={() => openAtt(a)} aria-label="Edit"><Icon name="edit" className="h-4 w-4" /></button>
                    <button className="btn-ghost btn-sm text-red-600" onClick={() => delAtt(a)} aria-label="Delete"><Icon name="trash" className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}</tbody>
            </table></div></div>
          )}
        </>
      )}

      <Modal open={!!edit} onClose={() => !busy && setEdit(null)} title={edit?.id ? "Edit employee" : "Add employee"}
        footer={<><button className="btn-outline" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary" onClick={saveEmp} disabled={busy}>{busy && <Spinner className="h-4 w-4" />}Save</button></>}>
        {edit && <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errs.name} className="sm:col-span-2"><input className="input" value={edit.f.name} onChange={(e) => setE("name", e.target.value)} /></Field>
          <Field label="Phone" error={errs.phone}><input className="input" value={edit.f.phone} onChange={(e) => setE("phone", e.target.value)} placeholder="01XXXXXXXXX" /></Field>
          <Field label="Email"><input className="input" value={edit.f.email} onChange={(e) => setE("email", e.target.value)} /></Field>
          <Field label="Role" error={errs.role}>
            <select className="input" value={edit.f.role} onChange={(e) => setE("role", e.target.value as EmployeeRole)}>
              {EMPLOYEE_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </Field>
          <Field label="Department"><input className="input" value={edit.f.department} onChange={(e) => setE("department", e.target.value)} placeholder="Operations / Warehouse" /></Field>
          <Field label="Joined on"><input className="input" type="date" value={edit.f.joinedAt} onChange={(e) => setE("joinedAt", e.target.value)} /></Field>
          <Field label="Notes" className="sm:col-span-2"><textarea className="input min-h-[72px]" value={edit.f.notes} onChange={(e) => setE("notes", e.target.value)} /></Field>
          <div className="sm:col-span-2"><Toggle checked={edit.f.active} onChange={(v) => setE("active", v)} label="Active employee" /></div>
        </div>}
      </Modal>

      <Modal open={!!attEdit} onClose={() => !busy && setAttEdit(null)} title={attEdit?.id ? "Edit attendance" : "Add attendance"}
        footer={<><button className="btn-outline" onClick={() => setAttEdit(null)}>Cancel</button><button className="btn-primary" onClick={saveAtt} disabled={busy}>{busy && <Spinner className="h-4 w-4" />}Save</button></>}>
        {attEdit && <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Employee" error={errs.employeeId} className="sm:col-span-2">
            <select className="input" value={attEdit.f.employeeId} onChange={(e) => setA("employeeId", e.target.value)}>
              <option value="">— Select —</option>
              {(emps.data ?? []).filter((e) => e.active).map((e) => <option key={e.id} value={e.id}>{e.name} · {ROLE_LABEL[e.role]}</option>)}
            </select>
          </Field>
          <Field label="Date" error={errs.date}><input className="input" type="date" value={attEdit.f.date} onChange={(e) => setA("date", e.target.value)} /></Field>
          <Field label="Status">
            <select className="input" value={attEdit.f.status} onChange={(e) => setA("status", e.target.value as AttendanceRecord["status"])}>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="half">Half day</option>
              <option value="leave">Leave</option>
              <option value="absent">Absent</option>
            </select>
          </Field>
          <Field label="Check-in"><input className="input" type="time" value={attEdit.f.checkIn} onChange={(e) => setA("checkIn", e.target.value)} /></Field>
          <Field label="Check-out"><input className="input" type="time" value={attEdit.f.checkOut} onChange={(e) => setA("checkOut", e.target.value)} /></Field>
          <Field label="Note" className="sm:col-span-2"><input className="input" value={attEdit.f.note} onChange={(e) => setA("note", e.target.value)} /></Field>
        </div>}
      </Modal>
      {node}
    </>
  );
}
