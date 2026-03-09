import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const XIcon     = () => <Icon d="M18 6 6 18M6 6l12 12" />;
const TrashIcon = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const EditIcon  = () => <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />;
const PlusIcon  = () => <Icon d="M12 5v14M5 12h14" />;
const GlobeIcon = () => <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b" };
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", background: colors[type] ?? colors.warning, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.2)", animation: "nch-slideUp .25s ease" }}>
      {msg}
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: .8, padding: 0 }}><XIcon /></button>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,17,23,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.15)", animation: "nch-modalIn .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><XIcon /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inp = {
  width: "100%", padding: "10px 12px", background: "#f8fafc",
  border: "1px solid #e2e8f0", borderRadius: 8, color: "#0f172a",
  fontSize: 14, outline: "none", boxSizing: "border-box",
};

const Label = ({ children, required }) => (
  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em" }}>
    {children} {required && <span style={{ color: "#2563eb" }}>*</span>}
  </label>
);

const Field = ({ label, required, children, style }) => (
  <div style={{ marginBottom: 14, ...style }}>
    <Label required={required}>{label}</Label>
    {children}
  </div>
);

/** Auto-generate slug from English name */
const toSlug = str =>
  str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

// ─── Form ─────────────────────────────────────────────────────────────────────
const EMPTY = { name_en: "", name_ar: "", name_fr: "", slug: "", icon: "" };

const POPULAR_ICONS = ["👗","👟","💄","🏠","📱","💻","⌚","🎮","🍔","☕","🌿","🐾","📚","🎵","🏋️","✈️","🧴","🛠️","🎨","🪴"];

function NicheForm({ initial = {}, onSubmit, loading, onClose }) {
  const [form, setForm]         = useState({ ...EMPTY, ...initial });
  const [slugManual, setSlugManual] = useState(!!initial.slug);

  const set = k => e => {
    const val = e.target.value;
    setForm(p => {
      const next = { ...p, [k]: val };
      // Auto-derive slug from name_en unless user manually edited it
      if (k === "name_en" && !slugManual) next.slug = toSlug(val);
      return next;
    });
  };

  const handleSlugChange = e => {
    setSlugManual(true);
    setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }));
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>

      {/* ── Icon ── */}
      <Field label="Icon" required>
        <input style={{ ...inp, fontSize: 20 }} value={form.icon} onChange={set("icon")} placeholder="Paste emoji or text icon" required />
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Quick pick:</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {POPULAR_ICONS.map(ico => (
              <button key={ico} type="button" onClick={() => setForm(p => ({ ...p, icon: ico }))}
                style={{ width: 34, height: 34, fontSize: 18, background: form.icon === ico ? "#eff6ff" : "#f8fafc", border: `1px solid ${form.icon === ico ? "#93c5fd" : "#e2e8f0"}`, borderRadius: 8, cursor: "pointer", transition: "all .15s" }}>
                {ico}
              </button>
            ))}
          </div>
        </div>
      </Field>

      {/* ── Divider ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 14px" }}>
        <GlobeIcon />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em" }}>Names</span>
        <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
      </div>

      {/* ── Name EN ── */}
      <Field label="Name (English)" required>
        <input
          style={inp} value={form.name_en} onChange={set("name_en")}
          placeholder="e.g. Fashion" required
        />
      </Field>

      {/* ── Name AR ── */}
      <Field label="Name (Arabic)" required>
        <input
          style={{ ...inp, direction: "rtl", fontFamily: "inherit" }}
          value={form.name_ar} onChange={set("name_ar")}
          placeholder="مثال: الموضة" required
        />
      </Field>

      {/* ── Name FR ── */}
      <Field label="Name (French)" required>
        <input
          style={inp} value={form.name_fr} onChange={set("name_fr")}
          placeholder="e.g. Mode" required
        />
      </Field>

      {/* ── Slug ── */}
      <Field label="Slug" required>
        <div style={{ position: "relative" }}>
          <input
            style={{ ...inp, paddingLeft: 12, fontFamily: "monospace", color: "#2563eb" }}
            value={form.slug} onChange={handleSlugChange}
            placeholder="auto-generated from English name"
            required
          />
          {!slugManual && (
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#94a3b8", pointerEvents: "none" }}>
              auto
            </span>
          )}
        </div>
        {slugManual && (
          <button type="button" onClick={() => { setSlugManual(false); setForm(p => ({ ...p, slug: toSlug(p.name_en) })); }}
            style={{ marginTop: 5, fontSize: 11, color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            ↺ Reset to auto
          </button>
        )}
      </Field>

      {/* ── Actions ── */}
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <button type="button" onClick={onClose}
          style={{ flex: 1, padding: "10px 0", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b", fontWeight: 600, cursor: "pointer" }}>
          Cancel
        </button>
        <button type="submit" disabled={loading}
          style={{ flex: 1, padding: "10px 0", background: loading ? "#cbd5e1" : "#2563eb", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Saving…" : "Save Niche"}
        </button>
      </div>
    </form>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Niche() {
  const [niches, setNiches]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);
  const [modal, setModal]     = useState(null); // "create" | "edit"
  const [editing, setEditing] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/niches");
      setNiches(res.data ?? []);
    } catch { showToast("Failed to load niches", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async form => {
    setSaving(true);
    try {
      await api.post("/admin/niches", form);
      showToast("Niche created!");
      setModal(null);
      load();
    } catch { showToast("Create failed", "error"); }
    setSaving(false);
  };

  const handleUpdate = async form => {
    setSaving(true);
    try {
      await api.put(`/admin/niches/${editing.id}`, form);
      showToast("Niche updated!");
      setModal(null);
      setEditing(null);
      load();
    } catch { showToast("Update failed", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete niche "${name}"?`)) return;
    try {
      await api.delete(`/admin/niches/${id}`);
      showToast("Niche deleted");
      load();
    } catch { showToast("Delete failed", "error"); }
  };

  return (
    <>
      <style>{`
        @keyframes nch-slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nch-fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes nch-modalIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        .nch-card:hover { box-shadow: 0 6px 20px rgba(37,99,235,.1) !important; transform: translateY(-2px) !important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "nch-fadeIn .3s ease" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>
            {niches.length} niche{niches.length !== 1 ? "s" : ""}
          </div>
          <button
            onClick={() => setModal("create")}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#2563eb", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,.25)" }}>
            <PlusIcon /> New Niche
          </button>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
            {Array(8).fill(0).map((_, i) => (
              <div key={i} style={{ height: 130, borderRadius: 14, background: "#f1f5f9", animation: "nch-fadeIn .3s ease" }} />
            ))}
          </div>
        ) : niches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🧩</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8" }}>No niches yet</div>
            <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>Create your first niche to get started</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
            {niches.map(n => (
              <div key={n.id} className="nch-card"
                style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 10, transition: "all .2s", boxShadow: "none" }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 34, lineHeight: 1 }}>{n.icon}</span>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#2563eb" }}>
                    {n.stores?.length ?? 0} stores
                  </span>
                </div>

                {/* Primary name (EN) + AR sub-label */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{n.name_en}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, direction: "rtl", textAlign: "right" }}>{n.name_ar}</div>
                </div>

                {/* Slug */}
                <div style={{ fontSize: 11, fontFamily: "monospace", color: "#93c5fd", background: "#eff6ff", borderRadius: 6, padding: "3px 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  /{n.slug}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                  <button
                    onClick={() => { setEditing(n); setModal("edit"); }}
                    style={{ flex: 1, padding: "7px 0", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600, transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.color = "#1d4ed8"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}>
                    <EditIcon /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(n.id, n.name_en)}
                    style={{ padding: "7px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#475569", cursor: "pointer", transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.color = "#dc2626"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal === "create" && (
        <Modal title="Create New Niche" onClose={() => setModal(null)}>
          <NicheForm onSubmit={handleCreate} loading={saving} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === "edit" && editing && (
        <Modal title={`Edit — ${editing.name_en}`} onClose={() => { setModal(null); setEditing(null); }}>
          <NicheForm initial={editing} onSubmit={handleUpdate} loading={saving} onClose={() => { setModal(null); setEditing(null); }} />
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}