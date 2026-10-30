import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

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
const XIcon       = () => <Icon d="M18 6 6 18M6 6l12 12" />;
const ChevronIcon = ({ dir = "right" }) => <Icon d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />;
const TrashIcon   = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const Trash2Icon  = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />;
const ToggleIcon  = () => <Icon d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />; // تفعيل / إيقاف
const EyeIcon     = () => <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />;
const RefreshIcon = () => <Icon d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b" };
  return (
    <div style={{ position: "fixed", bottom: 90, insetInlineEnd: 16, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", background: colors[type] ?? colors.warning, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.2)", animation: "prd-slideUp .25s ease" }}>
      {msg}
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: .8, padding: 0 }}><XIcon /></button>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ product, onClose }) {
  const { t } = useTranslation();
  const fmt = n => Number(n ?? 0).toLocaleString("en-DZ");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,17,23,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.15)", animation: "prd-modalIn .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{product.name}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><XIcon /></button>
        </div>
        <div style={{ padding: 24 }}>
          {product.productImage && (
            <img src={product.productImage} alt="" onError={e => e.target.style.display = "none"}
              style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10, marginBottom: 18, border: "1px solid #f1f5f9" }} />
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              [t("products.price"),    `${fmt(product.price)} DZD`, "#16a34a"],
              [t("products.original"), product.priceOriginal ? `${fmt(product.priceOriginal)} DZD` : "—", "#94a3b8"],
              [t("products.stock"),    product.stock, product.stock > 0 ? "#16a34a" : "#dc2626"],
              ["SKU",      product.sku ?? "—", "#475569"],
              [t("products.store"),    product.store?.name ?? "—", "#0f172a"],
              [t("products.category"), product.category?.name ?? "—", "#7c3aed"],
            ].map(([label, value, color]) => (
              <div key={label} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>
          {product.desc && <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: "0 0 16px" }}>{product.desc}</p>}
          {(product.attributes ?? []).length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>{t("products.attributes")}</div>
              {product.attributes.map(a => (
                <div key={a.id} style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{a.name}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", marginInlineStart: 6 }}>({a.type})</span>
                  <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                    {(a.variants ?? []).map(v => (
                      <span key={v.id} style={{ padding: "2px 8px", background: "#f1f5f9", borderRadius: 6, fontSize: 11, color: "#475569" }}>{v.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {(product.offers ?? []).length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>{t("products.offers")}</div>
              {product.offers.map(o => (
                <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#eff6ff", borderRadius: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8" }}>{o.name}</span>
                  <span style={{ fontSize: 12, color: "#2563eb" }}>{o.quantity}x — {fmt(o.price)} DZD</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14 };
const thStyle = { padding: "10px 16px", textAlign: "start", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" };
const tdStyle = { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #f8fafc", verticalAlign: "middle" };

function ActiveBadge({ active }) {
  const { t } = useTranslation();
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: active ? "#dcfce7" : "#f1f5f9", color: active ? "#16a34a" : "#94a3b8" }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#22c55e" : "#cbd5e1", display: "inline-block" }} />
    {active ? t("stores.active") : t("stores.inactive")}
  </span>;
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "16px 0 4px" }}>
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1}
        style={{ padding: "7px 11px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: page <= 1 ? "#cbd5e1" : "#475569", cursor: page <= 1 ? "not-allowed" : "pointer" }}>
        <span className="prd-chev"><ChevronIcon dir="left" /></span>
      </button>
      {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
        const p = Math.max(1, Math.min(totalPages - 6, page - 3)) + i;
        if (p < 1 || p > totalPages) return null;
        return (
          <button key={p} onClick={() => onPage(p)}
            style={{ padding: "7px 13px", border: "1px solid", borderColor: p === page ? "#2563eb" : "#e2e8f0", borderRadius: 8, background: p === page ? "#eff6ff" : "#fff", color: p === page ? "#2563eb" : "#64748b", fontWeight: p === page ? 700 : 500, cursor: "pointer", fontSize: 13, minWidth: 36 }}>
            {p}
          </button>
        );
      })}
      <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
        style={{ padding: "7px 11px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: page >= totalPages ? "#cbd5e1" : "#475569", cursor: page >= totalPages ? "not-allowed" : "pointer" }}>
        <span className="prd-chev"><ChevronIcon dir="right" /></span>
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Products() {
  const { t } = useTranslation();
  const [products, setProducts]   = useState([]);
  const [meta, setMeta]           = useState({ total: 0, totalPages: 1 });
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState(null);
  const [acting, setActing]       = useState(null);
  const [detail, setDetail]       = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/products?page=${page}&limit=15`);
      setProducts(res.data.data ?? []);
      setMeta({ total: res.data.total ?? 0, totalPages: res.data.totalPages ?? 1 });
    } catch { showToast(t("products.load_failed"), "error"); }
    finally { setLoading(false); }
  }, [page, t]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (id, current) => {
    setActing(id);
    try {
      await api.patch(`/admin/products/${id}/toggle`);
      showToast(current ? t("products.deactivated") : t("products.activated"));
      load();
    } catch { showToast(t("users.action_failed"), "error"); }
    setActing(null);
  };

  const softDelete = async (id, name) => {
    if (!confirm(t("products.confirm_soft", { name }))) return;
    setActing(id);
    try {
      await api.delete(`/admin/products/${id}`);
      showToast(t("products.soft_deleted"));
      load();
    } catch { showToast("Delete failed", "error"); }
    setActing(null);
  };

  const hardDelete = async (id, name) => {
    if (!confirm(t("products.confirm_hard", { name }))) return;
    setActing(id);
    try {
      await api.delete(`/admin/products/${id}/hard`);
      showToast(t("products.hard_deleted"));
      load();
    } catch { showToast("Delete failed", "error"); }
    setActing(null);
  };

  const fmt = n => Number(n ?? 0).toLocaleString("en-DZ");
  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

  return (
    <>
      <style>{`
        @keyframes prd-slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes prd-fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes prd-modalIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        .prd-row:hover { background: #f8fafc !important; }
        [dir="rtl"] .prd-chev { display:inline-flex; transform:scaleX(-1) }
        /* الهاتف: بطاقات بدل الجدول */
        .prd-table { display:none }
        @media (min-width: 1024px) { .prd-table { display:block } .prd-cards { display:none } }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "prd-fadeIn .3s ease" }}>

        {/* ── Toolbar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginInlineStart: "auto" }}>
            {t("products.total_n", { n: meta.total.toLocaleString() })}
          </div>
          <button onClick={load} title={t("common.refresh")}
            style={{ padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#2563eb"}
            onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
            <RefreshIcon />
          </button>
        </div>

        {/* ── Table ── */}
        <div style={{ ...card, overflow: "hidden" }}>
          {loading ? (
            <div>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f1f5f9" }} />
                  <div style={{ flex: 1, height: 14, borderRadius: 6, background: "#f1f5f9" }} />
                  <div style={{ width: 80, height: 14, borderRadius: 6, background: "#f1f5f9" }} />
                </div>
              ))}
            </div>
          ) : (
            <>
            <div className="prd-table" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={thStyle}>{t("products.product")}</th>
                    <th style={thStyle}>{t("products.store")}</th>
                    <th style={thStyle}>{t("products.category")}</th>
                    <th style={thStyle}>{t("products.price")}</th>
                    <th style={thStyle}>{t("products.stock")}</th>
                    <th style={thStyle}>{t("stores.status")}</th>
                    <th style={thStyle}>{t("stores.created")}</th>
                    <th style={thStyle}>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🛍️</div>
                      {t("products.empty")}
                    </td></tr>
                  ) : products.map(p => (
                    <tr key={p.id} className="prd-row" style={{ background: "#fff" }}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {p.productImage ? (
                            <img src={p.productImage} alt="" onError={e => e.target.style.display = "none"}
                              style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0", flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📦</div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{p.sku ?? "no-sku"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}><span style={{ fontSize: 12, color: "#475569" }}>{p.store?.name ?? "—"}</span></td>
                      <td style={tdStyle}>
                        {p.category
                          ? <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#f5f3ff", color: "#7c3aed" }}>{p.category.name}</span>
                          : <span style={{ color: "#cbd5e1" }}>—</span>}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: "#0f172a" }}>{fmt(p.price)} <span style={{ fontSize: 10, fontWeight: 500, color: "#94a3b8" }}>DZD</span></div>
                        {p.priceOriginal && <div style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through" }}>{fmt(p.priceOriginal)}</div>}
                      </td>
                      <td style={tdStyle}>
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: p.stock > 0 ? "#dcfce7" : "#fee2e2", color: p.stock > 0 ? "#16a34a" : "#dc2626" }}>
                          {p.stock > 0 ? p.stock : t("products.out")}
                        </span>
                      </td>
                      <td style={tdStyle}><ActiveBadge active={p.isActive} /></td>
                      <td style={tdStyle}><bdi dir="ltr" style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", whiteSpace: "nowrap" }}>{fmtDate(p.createdAt)}</bdi></td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button onClick={() => setDetail(p)} title={t("users.view")}
                            style={{ padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", cursor: "pointer", transition: "all .15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; }}>
                            <EyeIcon />
                          </button>
                          <button
                            disabled={acting === p.id}
                            onClick={() => toggleStatus(p.id, p.isActive)}
                            title={p.isActive ? t("stores.deactivate") : t("stores.activate")}
                            style={{ padding: "5px 8px", border: "1px solid", borderColor: p.isActive ? "#bbf7d0" : "#e2e8f0", borderRadius: 7, background: p.isActive ? "#f0fdf4" : "#fff", color: p.isActive ? "#16a34a" : "#64748b", cursor: acting === p.id ? "not-allowed" : "pointer", transition: "all .15s" }}>
                            <ToggleIcon />
                          </button>
                          <button
                            disabled={acting === p.id}
                            onClick={() => softDelete(p.id, p.name)}
                            title={t("products.soft_delete")}
                            style={{ padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", cursor: acting === p.id ? "not-allowed" : "pointer", transition: "all .15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fef3c7"; e.currentTarget.style.color = "#d97706"; e.currentTarget.style.borderColor = "#fcd34d"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                            <TrashIcon />
                          </button>
                          <button
                            disabled={acting === p.id}
                            onClick={() => hardDelete(p.id, p.name)}
                            title={t("products.hard_delete")}
                            style={{ padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", cursor: acting === p.id ? "not-allowed" : "pointer", transition: "all .15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                            <Trash2Icon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* الهاتف: بطاقة لكل منتج */}
            <div className="prd-cards">
              {products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 0", color: "#94a3b8", fontSize: 14 }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>🛍️</div>{t("products.empty")}
                </div>
              ) : products.map(p => (
                <div key={p.id} style={{ padding: 14, borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {p.productImage
                      ? <img src={p.productImage} alt="" onError={e => e.target.style.display = "none"} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", border: "1px solid #e2e8f0", flexShrink: 0 }} />
                      : <div style={{ width: 48, height: 48, borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📦</div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{p.store?.name ?? "—"}{p.category && <span style={{ color: "#7c3aed" }}> · {p.category.name}</span>}</div>
                    </div>
                    <div style={{ textAlign: "end", flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{fmt(p.price)} <span style={{ fontSize: 10, color: "#94a3b8" }}>DZD</span></div>
                      {p.priceOriginal && <div style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through" }}>{fmt(p.priceOriginal)}</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <ActiveBadge active={p.isActive} />
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: p.stock > 0 ? "#dcfce7" : "#fee2e2", color: p.stock > 0 ? "#16a34a" : "#dc2626" }}>{p.stock > 0 ? t("products.stock_n", { n: p.stock }) : t("products.out")}</span>
                    <span style={{ flex: 1 }} />
                    <button onClick={() => setDetail(p)} title={t("users.view")} style={{ padding: "6px 9px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b" }}><EyeIcon /></button>
                    <button disabled={acting === p.id} onClick={() => toggleStatus(p.id, p.isActive)} title={p.isActive ? t("stores.deactivate") : t("stores.activate")} style={{ padding: "6px 9px", border: "1px solid", borderColor: p.isActive ? "#bbf7d0" : "#e2e8f0", borderRadius: 8, background: p.isActive ? "#f0fdf4" : "#fff", color: p.isActive ? "#16a34a" : "#64748b" }}><ToggleIcon /></button>
                    <button disabled={acting === p.id} onClick={() => softDelete(p.id, p.name)} title={t("products.soft_delete")} style={{ padding: "6px 9px", border: "1px solid #fcd34d", borderRadius: 8, background: "#fffbeb", color: "#d97706" }}><TrashIcon /></button>
                    <button disabled={acting === p.id} onClick={() => hardDelete(p.id, p.name)} title={t("products.hard_delete")} style={{ padding: "6px 9px", border: "1px solid #fca5a5", borderRadius: 8, background: "#fef2f2", color: "#dc2626" }}><Trash2Icon /></button>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
          <div style={{ padding: "4px 16px 12px" }}>
            <Pagination page={page} totalPages={meta.totalPages} onPage={setPage} />
          </div>
        </div>
      </div>

      {detail && <DetailModal product={detail} onClose={() => setDetail(null)} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}