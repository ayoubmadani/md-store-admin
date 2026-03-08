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
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: "0 24px 60px rgba(0,0,0,.15)", animation: "nch-modalIn .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><XIcon /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────
const inp = { width: "100%", padding: "10px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#0f172a", fontSize: 14, outline: "none", boxSizing: "border-box" };

function NicheForm({ initial = {}, onSubmit, loading, onClose }) {
  const [form, setForm] = useState({ name: "", icon: "", ...initial });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const POPULAR_ICONS = ["👗","👟","💄","🏠","📱","💻","⌚","🎮","🍔","☕","🌿","🐾","📚","🎵","🏋️","✈️","🧴","🛠️","🎨","🪴"];

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em" }}>
          Name <span style={{ color: "#2563eb" }}>*</span>
        </label>
        <input style={inp} value={form.name} onChange={set("name")} placeholder="e.g. Fashion" required />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em" }}>
          Icon <span style={{ color: "#2563eb" }}>*</span>
        </label>
        <input style={{ ...inp, fontSize: 20 }} value={form.icon} onChange={set("icon")} placeholder="Paste emoji or text icon" required />
      </div>
      <div style={{ marginBottom: 18 }}>
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
      <div style={{ display: "flex", gap: 10 }}>
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
    console.log(form);
    
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
          <div>
            <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>{niches.length} niche{niches.length !== 1 ? "s" : ""}</div>
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
              <div key={i} style={{ height: 110, borderRadius: 14, background: "#f1f5f9", animation: "nch-fadeIn .3s ease" }} />
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
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{n.name}</div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.id}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                  <button
                    onClick={() => { setEditing(n); setModal("edit"); }}
                    style={{ flex: 1, padding: "7px 0", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600, transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.color = "#1d4ed8"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}>
                    <EditIcon /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(n.id, n.name)}
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
        <Modal title={`Edit — ${editing.name}`} onClose={() => { setModal(null); setEditing(null); }}>
          <NicheForm initial={editing} onSubmit={handleUpdate} loading={saving} onClose={() => { setModal(null); setEditing(null); }} />
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}