"use client";
import { useState, useEffect } from "react";
import { Save, Settings, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

interface Setting { id: string; key: string; value: string; label: string; type: string; group: string }

const ANNOUNCEMENT_TYPES = ["info", "warning", "danger", "success"] as const;
type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[number];

const TYPE_LABELS: Record<AnnouncementType, string> = {
  info: "Info (blue)",
  warning: "Warning (yellow)",
  danger: "Alert (red)",
  success: "Success (green)",
};

const DEFAULT_SETTINGS: Omit<Setting, "id">[] = [
  { key: "site_name", value: "NEWGEN STORE", label: "Site Name", type: "text", group: "general" },
  { key: "site_tagline", value: "Wholesale Electronics Rwanda & DRC", label: "Site Tagline", type: "text", group: "general" },
  { key: "contact_phone", value: "+250 788 000 000", label: "Contact Phone", type: "text", group: "contact" },
  { key: "contact_email", value: "info@newgen.com", label: "Contact Email", type: "email", group: "contact" },
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

  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>("info");
  const [announcementDismissible, setAnnouncementDismissible] = useState(true);
  const [savingAnn, setSavingAnn] = useState(false);
  const [savedAnn, setSavedAnn] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      const map: { [key: string]: string } = {};
      DEFAULT_SETTINGS.forEach((s) => { map[s.key] = s.value; });
      if (d.success) d.data.forEach((s: Setting) => { map[s.key] = s.value; });
      setSettings(map);
    }).finally(() => setLoading(false));

    fetch("/api/announcement").then((r) => r.json()).then((d) => {
      setAnnouncementEnabled(d.enabled ?? false);
      setAnnouncementMessage(d.message ?? "");
      setAnnouncementType(d.type ?? "info");
      setAnnouncementDismissible(d.dismissible ?? true);
    });
  }, []);

  async function saveAnnouncement() {
    setSavingAnn(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings: [
          { key: "announcement_enabled", value: String(announcementEnabled) },
          { key: "announcement_message", value: announcementMessage },
          { key: "announcement_type", value: announcementType },
          { key: "announcement_dismissible", value: String(announcementDismissible) },
        ],
      }),
    });
    setSavingAnn(false);
    setSavedAnn(true);
    setTimeout(() => setSavedAnn(false), 2000);
  }

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

      {/* Announcement Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#2563EB]" />
            <h2 className="font-bold text-slate-900 dark:text-white">Announcement Banner</h2>
          </div>
          <Button onClick={saveAnnouncement} loading={savingAnn} size="sm">
            {savedAnn ? "✓ Saved!" : <><Save className="w-3.5 h-3.5" /> Save</>}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Enable toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setAnnouncementEnabled((v) => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative ${announcementEnabled ? "bg-[#2563EB]" : "bg-slate-200 dark:bg-slate-700"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${announcementEnabled ? "translate-x-5" : ""}`} />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {announcementEnabled ? "Banner is ON — visible to all customers" : "Banner is OFF"}
            </span>
          </label>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Message</label>
            <textarea
              rows={3}
              placeholder="e.g. We are under maintenance. Orders will be processed after 6 PM."
              value={announcementMessage}
              onChange={(e) => setAnnouncementMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Banner Type</label>
            <div className="flex flex-wrap gap-2">
              {ANNOUNCEMENT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setAnnouncementType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    announcementType === t
                      ? t === "info" ? "bg-blue-600 text-white border-blue-600"
                        : t === "warning" ? "bg-amber-500 text-white border-amber-500"
                        : t === "danger" ? "bg-red-600 text-white border-red-600"
                        : "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Dismissible */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={announcementDismissible}
              onChange={(e) => setAnnouncementDismissible(e.target.checked)}
              className="w-4 h-4 accent-[#2563EB]"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Allow customers to dismiss the banner</span>
          </label>

          {/* Preview */}
          {announcementMessage && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Preview</p>
              <div className={`rounded-xl px-4 py-3 text-sm font-medium text-white flex items-center gap-2 ${
                announcementType === "info" ? "bg-blue-600"
                : announcementType === "warning" ? "bg-amber-500"
                : announcementType === "danger" ? "bg-red-600"
                : "bg-emerald-600"
              }`}>
                {announcementMessage}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
