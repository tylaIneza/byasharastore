"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Grid3x3 } from "lucide-react";
import { Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", emoji: "", color: "#2563EB", isActive: true, sortOrder: 0 });

  const load = () => fetch("/api/categories").then((r) => r.json()).then((d) => { if (d.success) setCategories(d.data); });
  useEffect(() => { load(); }, []);

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description ?? "", emoji: cat.emoji ?? "", color: cat.color ?? "#2563EB", isActive: cat.isActive, sortOrder: cat.sortOrder });
    setShowForm(true);
  }

  function openNew() { setEditing(null); setForm({ name: "", description: "", emoji: "", color: "#2563EB", isActive: true, sortOrder: 0 }); setShowForm(true); }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/categories/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      } else {
        await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      }
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500">{categories.length} categories</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4" /> New Category</Button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-5">{editing ? "Edit Category" : "New Category"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Emoji" placeholder="📱" value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                <span className="font-mono text-sm text-slate-500">{form.color}</span>
              </div>
            </div>
            <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
            <div className="sm:col-span-2">
              <Textarea label="Description" value={form.description} rows={2} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? "Save Changes" : "Create"}</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${cat.color ?? "#2563EB"}15` }}>
                {cat.emoji ?? <Grid3x3 className="w-6 h-6" style={{ color: cat.color ?? "#2563EB" }} />}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#2563EB]"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{cat.name}</h3>
            {cat.description && <p className="text-xs text-slate-400 mb-2 line-clamp-2">{cat.description}</p>}
            <p className="text-xs text-slate-400">{cat._count?.products ?? 0} products</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${cat.isActive ? "bg-emerald-400" : "bg-slate-300"}`} />
              <span className="text-xs text-slate-400">{cat.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
