"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Grid3x3, X, ChevronDown } from "lucide-react";
import { Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

const EMOJIS = [
  "📱","💻","🖥️","⌨️","🖱️","📷","📹","🎧","🎮","🕹️",
  "👕","👖","👗","👠","👟","🧢","👒","🧣","👜","💍",
  "🛋️","🪑","🛏️","🚿","🪞","🏠","🔑","🪟","🪴","🧹",
  "🍎","🥕","🍞","🥛","☕","🍕","🍔","🌮","🥗","🧃",
  "💊","🏥","🩺","🧬","💆","🧴","🧼","💄","🌡️","🩹",
  "📚","📖","✏️","📝","🎒","🏫","🎓","📐","🖊️","📏",
  "🎸","🎨","🎭","🎯","⚽","🏀","🎾","🎪","🎹","🖌️",
  "🚗","🏍️","🚲","✈️","🚢","🛵","🏎️","🚐","⛽","🚀",
  "💐","🌿","🌸","🌻","🌲","🍀","🌺","🪷","🌵","🌾",
  "💎","⌚","🕶️","👓","🛍️","🎁","💰","🏷️","📦","🛒",
];

function EmojiPicker({ value, onChange }: { value: string; onChange: (e: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Emoji</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-10 px-3 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#2563EB] transition-colors text-left"
      >
        <span className="text-xl w-7 text-center leading-none">{value || "➕"}</span>
        <span className="text-sm text-slate-400 flex-1">{value ? "Click to change" : "Pick an emoji"}</span>
        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 w-72">
          <div className="grid grid-cols-10 gap-0.5 max-h-52 overflow-y-auto">
            {EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => { onChange(em); setOpen(false); }}
                className={`w-7 h-7 flex items-center justify-center text-lg rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors leading-none ${value === em ? "bg-blue-100 dark:bg-blue-900/30 ring-1 ring-[#2563EB]" : ""}`}
              >
                {em}
              </button>
            ))}
          </div>
          {value && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="mt-2 text-xs text-red-500 hover:underline w-full text-left"
            >
              Remove emoji
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const BLANK_FORM = { name: "", description: "", emoji: "", color: "#2563EB", isActive: true, sortOrder: 0 };

export default function CategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);

  const load = async () => {
    const res = await fetch("/api/categories");
    const d = await res.json();
    if (d.success) setCategories(d.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description ?? "", emoji: cat.emoji ?? "", color: cat.color ?? "#2563EB", isActive: cat.isActive, sortOrder: cat.sortOrder });
    setShowForm(true);
    setDeleteTarget(null);
  }

  function openNew() {
    setEditing(null);
    setForm({ ...BLANK_FORM, sortOrder: categories.length });
    setShowForm(true);
    setDeleteTarget(null);
  }

  function closeForm() { setShowForm(false); setEditing(null); }

  async function handleSave() {
    if (!form.name.trim()) return addToast("Name is required", "error");
    setSaving(true);
    try {
      const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) { addToast(data.error ?? "Failed to save", "error"); return; }
      addToast(editing ? "Category updated" : "Category created", "success");
      closeForm();
      load();
    } catch {
      addToast("Something went wrong", "error");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) { addToast(data.error ?? "Failed to delete", "error"); setDeleteTarget(null); return; }
      addToast(`"${deleteTarget.name}" deleted`, "success");
      setDeleteTarget(null);
      load();
    } catch {
      addToast("Something went wrong", "error");
    } finally { setDeleting(false); }
  }

  const hasProducts = (deleteTarget?._count?.products ?? 0) > 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500">
            {loading ? "Loading…" : `${categories.length} categor${categories.length === 1 ? "y" : "ies"}`}
          </p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4" /> New Category</Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">{editing ? "Edit Category" : "New Category"}</h2>
            <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Live preview */}
          <div className="flex items-center gap-4 mb-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 transition-all"
              style={{ background: `${form.color}22` }}
            >
              {form.emoji || <Grid3x3 className="w-7 h-7" style={{ color: form.color }} />}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{form.name || <span className="text-slate-400 font-normal">Category name</span>}</p>
              <p className="text-xs text-slate-400 mt-0.5">{form.description || "No description"}</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${form.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
                {form.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name *" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Electronics" />
            <EmojiPicker value={form.emoji} onChange={(em) => setForm((f) => ({ ...f, emoji: em }))} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                />
                <span className="font-mono text-sm text-slate-500 dark:text-slate-400">{form.color}</span>
              </div>
            </div>
            <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
            <div className="sm:col-span-2">
              <Textarea label="Description" value={form.description} rows={2} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description of this category…" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-[#2563EB] rounded"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active — visible in store</span>
            </label>
          </div>

          <div className="flex gap-3 mt-5">
            <Button variant="secondary" onClick={closeForm}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? "Save Changes" : "Create Category"}</Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${deleteTarget.color ?? "#2563EB"}22` }}
              >
                {deleteTarget.emoji || "📁"}
              </div>
              <div>
                <p className="font-bold text-red-700 dark:text-red-400">Delete &quot;{deleteTarget.name}&quot;?</p>
                <p className="text-xs text-red-500 mt-0.5">
                  {hasProducts
                    ? `⚠️ This category has ${deleteTarget._count?.products} product${deleteTarget._count?.products !== 1 ? "s" : ""}. Reassign them before deleting.`
                    : "This action cannot be undone."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              {!hasProducts && (
                <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 skeleton" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <Grid3x3 className="w-12 h-12" />
          <p className="text-sm font-medium">No categories yet</p>
          <Button onClick={openNew} size="sm"><Plus className="w-4 h-4" /> Create first category</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 group hover:shadow-md transition-all duration-200 ${
                deleteTarget?.id === cat.id
                  ? "border-red-300 dark:border-red-700 shadow-sm"
                  : "border-slate-100 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{ background: `${cat.color ?? "#2563EB"}18` }}
                >
                  {cat.emoji || <Grid3x3 className="w-6 h-6" style={{ color: cat.color ?? "#2563EB" }} />}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#2563EB] transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(deleteTarget?.id === cat.id ? null : cat)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{cat.name}</h3>
              {cat.description && <p className="text-xs text-slate-400 mb-2 line-clamp-2">{cat.description}</p>}

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">
                  {cat._count?.products ?? 0} product{cat._count?.products !== 1 ? "s" : ""}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  cat.isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  {cat.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
