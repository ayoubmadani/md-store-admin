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
const XIcon = () => <Icon d="M18 6 6 18M6 6l12 12" />;
const TrashIcon = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const PlusIcon = () => <Icon d="M12 5v14M5 12h14" />;
const GlobeIcon = () => <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />;
const FolderIcon = () => <Icon d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />;

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

// تحويل الشجرة إلى قائمة مسطحة لتسهيل اختيار "الأب" في الـ Dropdown
const flattenTree = (nodes, level = 0) => {
  let result = [];
  nodes.forEach(node => {
    result.push({ ...node, level });
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenTree(node.children, level + 1));
    }
  });
  return result;
};

// ─── Form ─────────────────────────────────────────────────────────────────────
const EMPTY = { name_en: "", name_ar: "", name_fr: "", nicheId: "", parentId: "" };

function CategoryNicheForm({ onSubmit, loading, onClose, niches, flatCategories }) {
  const [form, setForm] = useState({ ...EMPTY });

  const set = k => e => {
    setForm(p => ({ ...p, [k]: e.target.value }));
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>

      {/* ── Relations ── */}
      <Field label="Main Niche" required>
        <select style={inp} value={form.nicheId} onChange={set("nicheId")} required>
          <option value="" disabled>Select a Niche...</option>
          {niches.map(n => <option key={n.id} value={n.id}>{n.icon} {n.name_en}</option>)}
        </select>
      </Field>

      <Field label="Parent Category (Optional)">
        <select style={inp} value={form.parentId || ""} onChange={set("parentId")}>
          <option value="">-- None (Top Level) --</option>
          {flatCategories.map(c => (
            <option key={c.id} value={c.id}>
              {"\u00A0".repeat(c.level * 4)} {c.level > 0 ? "↳ " : ""}{c.name_en}
            </option>
          ))}
        </select>
      </Field>

      {/* ── Divider ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 14px" }}>
        <GlobeIcon />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em" }}>Names</span>
        <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
      </div>

      {/* ── Names ── */}
      <Field label="Name (English)" required>
        <input style={inp} value={form.name_en} onChange={set("name_en")} placeholder="e.g. Smartphones" required />
      </Field>
      <Field label="Name (Arabic)" required>
        <input style={{ ...inp, direction: "rtl", fontFamily: "inherit" }} value={form.name_ar} onChange={set("name_ar")} placeholder="مثال: هواتف ذكية" required />
      </Field>
      <Field label="Name (French)" required>
        <input style={inp} value={form.name_fr} onChange={set("name_fr")} placeholder="e.g. Smartphones" required />
      </Field>

      {/* ── Actions ── */}
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <button type="button" onClick={onClose}
          style={{ flex: 1, padding: "10px 0", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b", fontWeight: 600, cursor: "pointer" }}>
          Cancel
        </button>
        <button type="submit" disabled={loading}
          style={{ flex: 1, padding: "10px 0", background: loading ? "#cbd5e1" : "#2563eb", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Saving…" : "Save Category"}
        </button>
      </div>
    </form>
  );
}

// ─── Tree Node Component ──────────────────────────────────────────────────────
function TreeNode({ node, level = 0, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ animation: "nch-fadeIn .2s ease" }}>
      <div style={{ 
        display: "flex", alignItems: "center", justifyContent: "space-between", 
        padding: "12px 16px", background: "#fff", border: "1px solid #e2e8f0", 
        borderRadius: 10, marginBottom: 8, marginLeft: level * 24,
        boxShadow: "0 1px 2px rgba(0,0,0,.02)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {hasChildren ? (
            <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 4 }}>
              <span style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .2s" }}>▶</span>
            </button>
          ) : (
            <div style={{ width: 24 }} /> // مسافة للحفاظ على المحاذاة
          )}
          <span style={{ color: "#94a3b8" }}><FolderIcon /></span>
          <div>
            <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{node.name_en}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{node.name_ar} • {node.name_fr}</div>
          </div>
        </div>

        <button
          onClick={() => onDelete(node.id, node.name_en)}
          style={{ padding: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, color: "#64748b", cursor: "pointer", transition: "all .15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#64748b"; }}>
          <TrashIcon />
        </button>
      </div>

      {expanded && hasChildren && (
        <div style={{ position: "relative" }}>
          {/* خط التوصيل الشجري */}
          <div style={{ position: "absolute", left: level * 24 + 35, top: -8, bottom: 12, width: 2, background: "#e2e8f0", borderRadius: 2 }} />
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} level={level + 1} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CategoryNiche() {
  const [treeData, setTreeData] = useState([]);
  const [niches, setNiches]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);
  const [modal, setModal]       = useState(null); // "create"

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [treeRes, nichesRes] = await Promise.all([
        api.get("/admin/category-niche/tree"),
        api.get("/admin/niches")
      ]);
      setTreeData(treeRes.data ?? []);
      setNiches(nichesRes.data ?? []);
    } catch { showToast("Failed to load data", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async form => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.parentId) delete payload.parentId; // تجنب إرسال سلسلة فارغة إذا كان التصنيف أساسياً

      await api.post("/admin/category-niche", payload);
      showToast("Category Niche created!");
      setModal(null);
      loadData();
    } catch { showToast("Create failed", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? \nWarning: This will also delete all its child categories!`)) return;
    try {
      await api.delete(`/admin/category-niche/${id}`);
      showToast("Category deleted");
      loadData();
    } catch { showToast("Delete failed", "error"); }
  };

  const flatCategories = flattenTree(treeData);

  return (
    <>
      <style>{`
        @keyframes nch-slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nch-fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes nch-modalIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "nch-fadeIn .3s ease" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>
            {flatCategories.length} categor{flatCategories.length !== 1 ? "ies" : "y"} total
          </div>
          <button
            onClick={() => setModal("create")}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#2563eb", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,.25)" }}>
            <PlusIcon /> New Category
          </button>
        </div>

        {/* ── Tree View ── */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ height: 60, borderRadius: 10, background: "#f1f5f9", animation: "nch-fadeIn .3s ease" }} />
            ))}
          </div>
        ) : treeData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>📂</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8" }}>No categories yet</div>
            <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>Create your first nested category to get started</div>
          </div>
        ) : (
          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 14, border: "1px solid #e2e8f0" }}>
            {treeData.map(node => (
              <TreeNode key={node.id} node={node} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {modal === "create" && (
        <Modal title="Create New Category" onClose={() => setModal(null)}>
          <CategoryNicheForm 
            onSubmit={handleCreate} 
            loading={saving} 
            onClose={() => setModal(null)} 
            niches={niches}
            flatCategories={flatCategories}
          />
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}