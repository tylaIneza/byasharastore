"use client";
import { useState, useEffect } from "react";
import { Plus, Users2, Shield } from "lucide-react";
import { AdminUser } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function TeamPage() {
  const [team, setTeam] = useState<AdminUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "ADMIN" });
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/team").then((r) => r.json()).then((d) => { if (d.success) setTeam(d.data); });
  useEffect(() => { load(); }, []);

  async function handleAdd() {
    setSaving(true);
    const res = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) { setShowForm(false); setForm({ name: "", email: "", role: "ADMIN" }); load(); }
    else alert(data.error);
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Team</h1>
          <p className="text-sm text-slate-500">{team.length} admin members</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Member</Button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4">Add Team Member</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Full Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Email Address" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Select label="Role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              options={[{ value: "ADMIN", label: "Admin" }, { value: "SUPER_ADMIN", label: "Super Admin" }]} />
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.name || !form.email}>Add Member</Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {["Member", "Email", "Role", "Status", "Joined"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
            {team.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{member.name.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{member.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-500">{member.email}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <Shield className={`w-3.5 h-3.5 ${member.role === "SUPER_ADMIN" ? "text-[#FF6B00]" : "text-[#2563EB]"}`} />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{member.role.replace("_", " ")}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge variant={member.isActive ? "success" : "danger"}>
                    {member.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(member.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
