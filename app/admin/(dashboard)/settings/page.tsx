"use client";
import { useState, useEffect } from "react";
import { Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

interface Setting { id: string; key: string; value: string; label: string; type: string; group: string }

const DEFAULT_SETTINGS: Omit<Setting, "id">[] = [
  { key: "site_name", value: "BYASHARA STORE", label: "Site Name", type: "text", group: "general" },
  { key: "site_tagline", value: "Wholesale Electronics Rwanda & DRC", label: "Site Tagline", type: "text", group: "general" },
  { key: "contact_phone", value: "+250 788 000 000", label: "Contact Phone", type: "text", group: "contact" },
  { key: "contact_email", value: "info@byashara.rw", label: "Contact Email", type: "email", group: "contact" },
  { key: "contact_address", value: "KN 4 Ave, Kigali, Rwanda", label: "Address", type: "text", group: "contact" },
  { key: "delivery_kigali", value: "2000", label: "Delivery Fee — Kigali (RWF)", type: "number", group: "delivery" },
  { key: "delivery_rwanda", value: "5000", label: "Delivery Fee — Rwanda (RWF)", type: "number", group: "delivery" },
  { key: "delivery_drc", value: "10000", label: "Delivery Fee — DRC (RWF)", type: "number", group: "delivery" },
  { key: "free_delivery_threshold", value: "500000", label: "Free Delivery Threshold (RWF)", type: "number", group: "delivery" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      const map: { [key: string]: string } = {};
      DEFAULT_SETTINGS.forEach((s) => { map[s.key] = s.value; });
      if (d.success) d.data.forEach((s: Setting) => { map[s.key] = s.value; });
      setSettings(map);
    }).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    const payload = Object.entries(settings).map(([key, value]) => ({ key, value }));
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: payload }) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const groups = [...new Set(DEFAULT_SETTINGS.map((s) => s.group))];

  if (loading) return <div className="text-slate-400 text-center py-12">Loading settings…</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500">Store configuration</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          {saved ? "✓ Saved!" : <><Save className="w-4 h-4" /> Save Settings</>}
        </Button>
      </div>

      {groups.map((group) => (
        <div key={group} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="font-bold text-slate-900 dark:text-white capitalize mb-5">{group}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DEFAULT_SETTINGS.filter((s) => s.group === group).map((s) => (
              <div key={s.key} className={s.type === "textarea" ? "sm:col-span-2" : ""}>
                <Input
                  label={s.label}
                  type={s.type === "number" ? "number" : s.type === "email" ? "email" : "text"}
                  value={settings[s.key] ?? s.value}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [s.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
