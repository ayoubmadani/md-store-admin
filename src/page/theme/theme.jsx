import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:7000",
    headers: { "Content-Type": "application/json" },
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, stroke = "currentColor", fill = "none" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);
const SearchIcon = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />;
const PlusIcon = () => <Icon d="M12 5v14M5 12h14" />;
const TrashIcon = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const EditIcon = () => <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />;
const TagIcon = () => <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />;
const ChevronIcon = ({ dir = "right" }) => <Icon d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />;
const XIcon = () => <Icon d="M18 6 6 18M6 6l12 12" />;
const GridIcon = () => <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />;
const ListIcon = () => <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />;
const SlidersIcon = () => <Icon d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    const colors = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b" };
    return (
        <div style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 18px", background: colors[type] ?? colors.warning,
            color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,.2)", animation: "tm-slideUp .25s ease",
        }}>
            {msg}
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: .8, padding: 0 }}><XIcon /></button>
        </div>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
    return (
        <div
            style={{ position: "fixed", inset: 0, background: "rgba(15,17,23,.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: wide ? 720 : 540, maxHeight: "92vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.15)", animation: "tm-modalIn .2s ease" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 6 }}><XIcon /></button>
                </div>
                <div style={{ padding: 24 }}>{children}</div>
            </div>
        </div>
    );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────
const inp = {
    width: "100%", padding: "9px 11px", background: "#f8fafc",
    border: "1px solid #e2e8f0", borderRadius: 8, color: "#0f172a",
    fontSize: 14, outline: "none", boxSizing: "border-box",
};

function Field({ label, required, children }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em" }}>
                {label}{required && <span style={{ color: "#3b82f6", marginLeft: 3 }}>*</span>}
            </label>
            {children}
        </div>
    );
}

// ─── ThemeForm ────────────────────────────────────────────────────────────────
function ThemeForm({ initial = {}, types = [], onSubmit, loading }) {
    const [f, setF] = useState({
        name_en: "", name_ar: "", name_fr: "", slug: "", price: 0,
        desc_en: "", desc_ar: "", desc_fr: "", imageUrl: "", tag: "", typeId: "",
        ...initial,
    });
    const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
    const handleSubmit = e => {
        e.preventDefault();
        onSubmit({ ...f, price: Number(f.price), tag: f.tag ? String(f.tag).split(",").map(t => t.trim()).filter(Boolean) : [] });
    };
    const col2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
    const ta = { ...inp, resize: "vertical", minHeight: 72 };

    return (
        <form onSubmit={handleSubmit}>
            <div style={col2}>
                <Field label="Name EN" required><input style={inp} value={f.name_en} onChange={set("name_en")} required /></Field>
                <Field label="Name AR"><input style={inp} value={f.name_ar} onChange={set("name_ar")} dir="rtl" /></Field>
            </div>
            <div style={col2}>
                <Field label="Name FR"><input style={inp} value={f.name_fr} onChange={set("name_fr")} /></Field>
                <Field label="Slug" required><input style={inp} value={f.slug} onChange={set("slug")} required /></Field>
            </div>
            <div style={col2}>
                <Field label="Price" required>
                    <input style={inp} type="number" step="0.01" min="0" value={f.price} onChange={set("price")} required />
                </Field>
                <Field label="Type">
                    <select style={inp} value={f.typeId} onChange={set("typeId")}>
                        <option value="">— None —</option>
                        {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </Field>
            </div>
            <Field label="Image URL">
                <input style={inp} type="url" value={f.imageUrl} onChange={set("imageUrl")} placeholder="https://…" />
            </Field>
            <Field label="Description EN">
                <textarea style={ta} value={f.desc_en} onChange={set("desc_en")} />
            </Field>
            <div style={col2}>
                <Field label="Desc AR"><textarea style={ta} value={f.desc_ar} onChange={set("desc_ar")} dir="rtl" /></Field>
                <Field label="Desc FR"><textarea style={ta} value={f.desc_fr} onChange={set("desc_fr")} /></Field>
            </div>
            <Field label="Tags (comma-separated)">
                <input style={inp} value={Array.isArray(f.tag) ? f.tag.join(", ") : f.tag} onChange={set("tag")} placeholder="tag1, tag2, …" />
            </Field>
            <button
                type="submit" disabled={loading}
                style={{ width: "100%", padding: "11px 0", marginTop: 6, background: loading ? "#cbd5e1" : "#2563eb", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}
            >
                {loading ? "Saving…" : "Save Theme"}
            </button>
        </form>
    );
}

// ─── ThemeCard ────────────────────────────────────────────────────────────────
function ThemeCard({ theme, types, onEdit, onDelete, toggleActive }) {
    // ✅ أضف التحقق Array.isArray لضمان عدم الانهيار
    const typeName = Array.isArray(types)
        ? types.find(t => t.id === theme.typeId)?.name
        : null;
    return (
        <div
            style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", transition: "box-shadow .2s, transform .2s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
            <div style={{ position: "relative", height: 148, background: "#f1f5f9", overflow: "hidden" }}>
                {theme.imageUrl
                    ? <img src={theme.imageUrl} alt={theme.name_en} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1" }}><TagIcon /></div>
                }
                {typeName && (
                    <span style={{ position: "absolute", top: 8, left: 8, background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>
                        {typeName}
                    </span>
                )}
            </div>
            <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {theme.name_en || theme.name_ar}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, fontFamily: "monospace" }}>{theme.slug}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#2563eb", flexShrink: 0 }}>
                        ${Number(theme.price).toFixed(2)}
                    </div>
                </div>
                {theme.desc_en && (
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {theme.desc_en}
                    </p>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>

                    <button
                        onClick={() => onEdit(theme)}
                        style={{ flex: 1, padding: "7px 0", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600, transition: "all .15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.color = "#1d4ed8"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
                    >
                        <EditIcon /> Edit
                    </button>

                    <button
                        className="cursor-pointer"
                        // ✅ التغيير هنا: استخدم onClick ومرر المعاملات الصحيحة
                        onClick={() => toggleActive(theme.id, theme.isActive)}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: theme.isActive ? "#f0fdf4" : "#f8fafc", border: `1px solid ${theme.isActive ? "#bbf7d0" : "#e2e8f0"}`, borderRadius: "20px", color: theme.isActive ? "#16a34a" : "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <span style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: theme.isActive ? "#22c55e" : "#94a3b8",
                            display: "inline-block"
                        }} />
                        {theme.isActive ? "Active" : "Inactive"}
                    </button>

                    <button
                        onClick={() => onDelete(theme.id)}
                        style={{ padding: "7px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#475569", cursor: "pointer", transition: "all .15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.color = "#dc2626"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────
function Stat({ label, value, accent }) {
    return (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 18px", display: "flex", flexDirection: "column", gap: 2, minWidth: 90 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: accent ?? "#0f172a" }}>{value}</span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ThemePage() {
    const [themes, setThemes] = useState([]);
    const [types, setTypes] = useState([]);
    const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });
    const [query, setQuery] = useState("");
    const [filterType, setFilterType] = useState("");
    const [page, setPage] = useState(1);
    const LIMIT = 12;

    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState("grid");
    const [modal, setModal] = useState(null);
    const [editing, setEditing] = useState(null);
    const [toast, setToast] = useState(null);
    const [typeName, setTypeName] = useState("");
    const [saving, setSaving] = useState(false);

    const showToast = (msg, type = "success") => setToast({ msg, type });

    const loadTypes = useCallback(async () => {
        try {
            const res = await api.get("/theme/type");
            setTypes(res.data);
        } catch { /* silent */ }
    }, []);

    const loadThemes = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (query) params.query = query;
            if (filterType) params.type = filterType;
            params.page = page;
            params.limit = LIMIT;
            const res = await api.get("/theme?isAdmin=true", { params });
            setThemes(res.data.data ?? []);
            setMeta(res.data.meta ?? { totalItems: 0, totalPages: 1, currentPage: 1 });
        } catch { showToast("Failed to load themes", "error"); }
        finally { setLoading(false); }
    }, [query, filterType, page]);

    useEffect(() => { loadTypes(); }, [loadTypes]);
    useEffect(() => { loadThemes(); }, [loadThemes]);

    useEffect(() => {
        const t = setTimeout(() => setPage(1), 350);
        return () => clearTimeout(t);
    }, [query, filterType]);

    const handleCreate = async dto => {
        console.log(dto)        
        setSaving(true);
        try {
            await api.post("/theme", [dto]);
            showToast("Theme created!"); setModal(null); loadThemes();
        } catch { showToast("Create failed", "error"); }
        setSaving(false);
    };

    const handleUpdate = async dto => {
        setSaving(true);
        try {
            await api.patch(`/theme/${editing.id}`, dto);
            showToast("Theme updated!"); setModal(null); setEditing(null); loadThemes();
        } catch { showToast("Update failed", "error"); }
        setSaving(false);
    };

    const handleDelete = async id => {
        if (!confirm("Delete this theme?")) return;
        try { await api.delete(`/theme/${id}`); showToast("Deleted"); loadThemes(); }
        catch { showToast("Delete failed", "error"); }
    };

    const handleToggle = async (id, currentStatus) => {
        // اختياري: تأكيد التفعيل أو الإيقاف
        const action = currentStatus ? "deactivate" : "activate";
        if (!confirm(`Are you sure you want to ${action} this theme?`)) return;
        console.log({ isActive: !currentStatus });
        
        try {
            await api.patch(`/theme/${id}`, { isActive: !currentStatus });
            showToast(`Theme ${!currentStatus ? 'Activated' : 'Deactivated'}!`);
            loadThemes(); // إعادة تحميل البيانات لتحديث الواجهة
        } catch (err) {
            showToast("Update failed", "error");
        }
    };

    const handleCreateType = async () => {
        if (!typeName.trim()) return;
        setSaving(true);
        try {
            await api.post("/theme/type", { name: typeName });
            setTypeName(""); showToast("Type added!"); loadTypes();
        } catch { showToast("Failed", "error"); }
        setSaving(false);
    };

    const handleDeleteType = async id => {
        if (!confirm("Delete type?")) return;
        try { await api.delete(`/theme/type/${id}`); showToast("Type deleted"); loadTypes(); }
        catch { showToast("Failed", "error"); }
    };

    const btnPrimary = {
        padding: "9px 18px", background: "#2563eb", border: "none", borderRadius: 8,
        color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 7,
        boxShadow: "0 2px 8px rgba(37,99,235,.2)",
    };
    const btnOutline = active => ({
        padding: "8px 10px", border: "1px solid",
        borderColor: active ? "#2563eb" : "#e2e8f0",
        borderRadius: 8,
        background: active ? "#eff6ff" : "#fff",
        color: active ? "#2563eb" : "#94a3b8",
        cursor: "pointer",
    });

    return (
        <>
            <style>{`
        @keyframes tm-slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tm-modalIn { from{opacity:0;transform:scale(.96)}       to{opacity:1;transform:scale(1)}    }
        @keyframes tm-fadeIn  { from{opacity:0}                             to{opacity:1}                       }
      `}</style>

            <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "tm-fadeIn .3s ease" }}>

                {/* ── Toolbar ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    {/* Search */}
                    <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
                        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}><SearchIcon /></span>
                        <input
                            value={query} onChange={e => setQuery(e.target.value)}
                            placeholder="Search themes…"
                            style={{ ...inp, paddingLeft: 36, width: "100%", maxWidth: 340 }}
                        />
                    </div>

                    {/* Type filter pills */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {[{ id: "", name: "All" }, ...types].map(t => (
                            <button
                                key={t.id}
                                onClick={() => { setFilterType(t.id); setPage(1); }}
                                style={{
                                    padding: "7px 14px", border: "1px solid", borderRadius: 20,
                                    fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .15s",
                                    borderColor: filterType === t.id ? "#2563eb" : "#e2e8f0",
                                    background: filterType === t.id ? "#2563eb" : "#fff",
                                    color: filterType === t.id ? "#fff" : "#64748b",
                                }}
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>

                    {/* Right side */}
                    <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                        <button style={btnOutline(viewMode === "grid")} onClick={() => setViewMode("grid")} title="Grid view"><GridIcon /></button>
                        <button style={btnOutline(viewMode === "list")} onClick={() => setViewMode("list")} title="List view"><ListIcon /></button>
                        <button style={btnOutline(false)} onClick={() => setModal("type")} title="Manage types"><SlidersIcon /></button>
                        <button style={btnPrimary} onClick={() => setModal("create")}><PlusIcon /> New Theme</button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div style={{ display: "flex", gap: 10 }}>
                    <Stat label="Total" value={meta.totalItems} accent="#2563eb" />
                    <Stat label="Page" value={`${meta.currentPage} / ${meta.totalPages}`} />
                    <Stat label="Types" value={types.length} />
                </div>

                {/* ── Content ── */}
                {loading ? (
                    <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill,minmax(240px,1fr))" : "1fr", gap: 14 }}>
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} style={{ height: viewMode === "grid" ? 268 : 68, background: "#f1f5f9", borderRadius: 12, animation: `tm-fadeIn ${.1 * i + .2}s ease` }} />
                        ))}
                    </div>
                ) : themes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <div style={{ fontSize: 44, marginBottom: 10 }}>◈</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8" }}>No themes found</div>
                        <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>Try adjusting your search or filters</div>
                    </div>
                ) : viewMode === "grid" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
                        {themes.map(t => (
                            <ThemeCard key={t.id} theme={t} types={types}
                                onEdit={th => { setEditing(th); setModal("edit"); }}
                                onDelete={handleDelete}
                                toggleActive={handleToggle}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {themes.map(t => {
                            const tName = types.find(x => x.id === t.typeId)?.name;
                            return (
                                <div key={t.id}
                                    style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 14, transition: "box-shadow .15s" }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(37,99,235,.08)"}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                                >
                                    <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f1f5f9", overflow: "hidden", flexShrink: 0 }}>
                                        {t.imageUrl && <img src={t.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name_en || t.name_ar}</div>
                                        <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{t.slug}</div>
                                    </div>
                                    {tName && <span style={{ padding: "3px 10px", background: "#eff6ff", color: "#2563eb", borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{tName}</span>}
                                    <div style={{ fontSize: 14, fontWeight: 800, color: "#2563eb", minWidth: 56, textAlign: "right" }}>${Number(t.price).toFixed(2)}</div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <button onClick={() => { setEditing(t); setModal("edit"); }}
                                            style={{ padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", cursor: "pointer" }}
                                            onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.color = "#1d4ed8"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; }}>
                                            <EditIcon />
                                        </button>
                                        <button onClick={() => handleDelete(t.id)}
                                            style={{ padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", cursor: "pointer" }}
                                            onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; }}>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Pagination ── */}
                {meta.totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, paddingTop: 8 }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                            style={{ padding: "7px 11px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: page <= 1 ? "#cbd5e1" : "#475569", cursor: page <= 1 ? "not-allowed" : "pointer" }}>
                            <ChevronIcon dir="left" />
                        </button>
                        {Array.from({ length: Math.min(7, meta.totalPages) }, (_, i) => {
                            const p = meta.currentPage <= 4 ? i + 1 : meta.currentPage - 3 + i;
                            if (p < 1 || p > meta.totalPages) return null;
                            return (
                                <button key={p} onClick={() => setPage(p)}
                                    style={{ padding: "7px 13px", border: "1px solid", borderColor: p === page ? "#2563eb" : "#e2e8f0", borderRadius: 8, background: p === page ? "#eff6ff" : "#fff", color: p === page ? "#2563eb" : "#64748b", fontWeight: p === page ? 700 : 500, cursor: "pointer", fontSize: 13, minWidth: 36 }}>
                                    {p}
                                </button>
                            );
                        })}
                        <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
                            style={{ padding: "7px 11px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: page >= meta.totalPages ? "#cbd5e1" : "#475569", cursor: page >= meta.totalPages ? "not-allowed" : "pointer" }}>
                            <ChevronIcon dir="right" />
                        </button>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {modal === "create" && (
                <Modal title="Create New Theme" onClose={() => setModal(null)} wide>
                    <ThemeForm types={types} onSubmit={handleCreate} loading={saving} />
                </Modal>
            )}
            {modal === "edit" && editing && (
                <Modal title={`Edit — ${editing.name_en || editing.slug}`} onClose={() => { setModal(null); setEditing(null); }} wide>
                    <ThemeForm initial={editing} types={types} onSubmit={handleUpdate} loading={saving} />
                </Modal>
            )}
            {modal === "type" && (
                <Modal title="Manage Theme Types" onClose={() => setModal(null)}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                        <input
                            value={typeName} onChange={e => setTypeName(e.target.value)}
                            placeholder="New type name…" style={{ ...inp, flex: 1 }}
                            onKeyDown={e => e.key === "Enter" && handleCreateType()}
                        />
                        <button onClick={handleCreateType} disabled={saving || !typeName.trim()}
                            style={{ padding: "9px 18px", background: saving || !typeName.trim() ? "#e2e8f0" : "#2563eb", border: "none", borderRadius: 8, color: saving || !typeName.trim() ? "#94a3b8" : "#fff", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
                            Add
                        </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {types.length === 0
                            ? <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No types yet</div>
                            : types.map(t => (
                                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                                    <span style={{ fontSize: 14, color: "#0f172a", fontWeight: 600 }}>{t.name}</span>
                                    <button onClick={() => handleDeleteType(t.id)}
                                        style={{ padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", color: "#94a3b8", cursor: "pointer" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))
                        }
                    </div>
                </Modal>
            )}

            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}