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
const RefreshIcon = () => <Icon d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />;
const EyeIcon     = () => <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />;
const EditIcon    = () => <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b" };
  return (
    <div style={{ position: "fixed", bottom: 90, insetInlineEnd: 16, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", background: colors[type] ?? colors.warning, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.2)", animation: "ord-slideUp .25s ease" }}>
      {msg}
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: .8, padding: 0 }}><XIcon /></button>
    </div>
  );
}

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_LIST = ["all", "pending", "appl1", "appl2", "appl3", "confirmed", "shipping", "delivered", "cancelled", "returned", "postponed"];
const STATUS_COLORS = {
  pending:   { bg: "#fef3c7", color: "#d97706", border: "#fcd34d" },
  appl1:     { bg: "#dbeafe", color: "#2563eb", border: "#93c5fd" },
  appl2:     { bg: "#dbeafe", color: "#2563eb", border: "#93c5fd" },
  appl3:     { bg: "#dbeafe", color: "#2563eb", border: "#93c5fd" },
  confirmed: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  shipping:  { bg: "#fce7f3", color: "#db2777", border: "#f9a8d4" },
  delivered: { bg: "#dcfce7", color: "#16a34a", border: "#86efac" },
  cancelled: { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  returned:  { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  postponed: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
};

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.postponed;
  return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: "nowrap" }}>{t(`status.${status}`, { defaultValue: status })}</span>;
}

// ─── Shared ───────────────────────────────────────────────────────────────────
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14 };
const thStyle = { padding: "10px 16px", textAlign: "start", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" };
const tdStyle = { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #f8fafc", verticalAlign: "middle" };
const inp = { width: "100%", padding: "9px 11px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#0f172a", fontSize: 14, outline: "none", boxSizing: "border-box" };

// ─── Update Status Modal ──────────────────────────────────────────────────────
function UpdateModal({ order, onClose, onSave }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(order.id, status);
    setSaving(false);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,17,23,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, boxShadow: "0 24px 60px rgba(0,0,0,.15)", animation: "ord-modalIn .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{t("orders.update_title")}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><XIcon /></button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: "#64748b" }}>{t("orders.customer")}: <span style={{ color: "#0f172a" }}>{order.customerName}</span></div>
          <div style={{ marginBottom: 16, fontSize: 12, fontWeight: 600, color: "#64748b" }}>{t("orders.current")}: <StatusBadge status={order.status} /></div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>{t("orders.new_status")}</label>
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inp, marginBottom: 16 }}>
            {STATUS_LIST.filter(s => s !== "all").map(s => <option key={s} value={s}>{t(`status.${s}`, { defaultValue: s })}</option>)}
          </select>
          <button onClick={handleSave} disabled={saving || status === order.status}
            style={{ width: "100%", padding: "11px 0", background: saving || status === order.status ? "#e2e8f0" : "#2563eb", border: "none", borderRadius: 8, color: saving || status === order.status ? "#94a3b8" : "#fff", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? t("common.saving") : t("orders.update")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ order, onClose }) {
  const { t } = useTranslation();
  const fmt = n => Number(n ?? 0).toLocaleString("en-DZ");
  const fmtDate = d => d ? new Date(d).toLocaleString("en-GB") : "—";

  const rows = [
    ["customer",       order.customerName],
    ["phone",          order.customerPhone],
    ["wilaya",         order.customerWilaya?.ar_name ?? order.customerWilayaId],
    ["commune",        order.customerCommune?.name ?? order.customerCommuneId],
    ["product",        order.product?.name ?? order.productId],
    ["store",          order.store?.name ?? order.storeId],
    ["quantity",       order.quantity],
    ["unit_price",     `${fmt(order.unityPrice)} DZD`],
    ["ship_price",     `${fmt(order.priceShip)} DZD`],
    ["loss",           `${fmt(order.priceLoss)} DZD`],
    ["total",          `${fmt(order.totalPrice)} DZD`],
    ["ship_type",      order.typeShip ? t(`orders.ship_${order.typeShip}`, { defaultValue: order.typeShip }) : "—"],
    ["platform",       order.platform ?? "—"],
    ["status",         null],
    ["created",        fmtDate(order.createdAt)],
    ["confirmed",      fmtDate(order.confirmedAt)],
    ["shipped",        fmtDate(order.shippingAt)],
    ["delivered",      fmtDate(order.deliveredAt)],
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,17,23,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.15)", animation: "ord-modalIn .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{t("orders.details")}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><XIcon /></button>
        </div>
        <div style={{ padding: 24 }}>
          {rows.map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f8fafc" }}>
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{t(`orders.f_${label}`)}</span>
              {label === "status"
                ? <StatusBadge status={order.status} />
                : <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", textAlign: "end", maxWidth: "60%", wordBreak: "break-word" }}>{value}</span>}
            </div>
          ))}
          {order.variantDetail && (
            <div style={{ marginTop: 12, padding: 12, background: "#f8fafc", borderRadius: 8, fontSize: 12, color: "#475569" }}>
              <strong>{t("orders.variant")}:</strong> {JSON.stringify(order.variantDetail.name)}
            </div>
          )}
          {order.offer && (
            <div style={{ marginTop: 8, padding: 12, background: "#eff6ff", borderRadius: 8, fontSize: 12, color: "#2563eb" }}>
              <strong>{t("orders.offer")}:</strong> {order.offer.name} — {t("orders.offer_text", { q: order.offer.quantity, price: fmt(order.offer.price) })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "16px 0 4px" }}>
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1}
        style={{ padding: "7px 11px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: page <= 1 ? "#cbd5e1" : "#475569", cursor: page <= 1 ? "not-allowed" : "pointer" }}>
        <span className="ord-chev"><ChevronIcon dir="left" /></span>
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
        <span className="ord-chev"><ChevronIcon dir="right" /></span>
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders]       = useState([]);
  const [meta, setMeta]           = useState({ total: 0, totalPages: 1 });
  const [page, setPage]           = useState(1);
  const [tab, setTab]             = useState("all");
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState(null);
  const [detailOrder, setDetail]  = useState(null);
  const [editOrder, setEdit]      = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = tab === "all"
        ? `/admin/orders?page=${page}&limit=15`
        : `/admin/orders/by-status?status=${tab}&page=${page}&limit=15`;
      const res = await api.get(url);
      setOrders(res.data.data ?? []);
      setMeta({ total: res.data.total ?? 0, totalPages: res.data.totalPages ?? 1 });
    } catch { showToast(t("orders.load_failed"), "error"); }
    finally { setLoading(false); }
  }, [page, tab, t]);

  useEffect(() => { load(); }, [load]);

  const handleTabChange = t => { setTab(t); setPage(1); };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      showToast(t("orders.updated"));
      load();
    } catch { showToast(t("orders.update_failed"), "error"); }
  };

  const fmt = n => Number(n ?? 0).toLocaleString("en-DZ");
  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

  return (
    <>
      <style>{`
        @keyframes ord-slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ord-fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes ord-modalIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        .ord-row:hover { background: #f8fafc !important; }
        [dir="rtl"] .ord-chev { display:inline-flex; transform:scaleX(-1) }
        /* الهاتف: بطاقات بدل الجدول، والتبويبات تمرّر أفقياً */
        .ord-tabs { display:flex; gap:6px; align-items:center; overflow-x:auto; scrollbar-width:none; padding-bottom:2px }
        .ord-tabs::-webkit-scrollbar { display:none }
        .ord-tabs > button { flex-shrink:0 }
        .ord-table { display:none }
        @media (min-width: 1024px) { .ord-table { display:block } .ord-cards { display:none } .ord-tabs { flex-wrap:wrap; overflow:visible } }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "ord-fadeIn .3s ease" }}>

        {/* ── Status Tabs ── */}
        <div className="ord-tabs">
          {STATUS_LIST.map(s => {
            const c = STATUS_COLORS[s] ?? STATUS_COLORS.postponed;
            const active = tab === s;
            return (
              <button key={s} onClick={() => handleTabChange(s)}
                style={{ padding: "7px 14px", border: "1px solid", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .15s", textTransform: "capitalize",
                  borderColor: active ? c.color : "#e2e8f0",
                  background: active ? c.bg : "#fff",
                  color: active ? c.color : "#64748b",
                }}>
                {t(`status.${s}`, { defaultValue: s })}
              </button>
            );
          })}
          <button onClick={load} title={t("common.refresh")} style={{ marginInlineStart: "auto", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#2563eb"}
            onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
            <RefreshIcon />
          </button>
        </div>

        {/* ── Summary strip ── */}
        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
          {t("orders.total_n", { n: meta.total.toLocaleString() })}{tab !== "all" ? ` · ${t(`status.${tab}`, { defaultValue: tab })}` : ""}
        </div>

        {/* ── Table ── */}
        <div style={{ ...card, overflow: "hidden" }}>
          {loading ? (
            <div>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ flex: 1, height: 14, borderRadius: 6, background: "#f1f5f9" }} />
                  <div style={{ width: 80, height: 14, borderRadius: 6, background: "#f1f5f9" }} />
                </div>
              ))}
            </div>
          ) : (
            <>
            <div className="ord-table" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={thStyle}>{t("orders.f_customer")}</th>
                    <th style={thStyle}>{t("orders.f_product")}</th>
                    <th style={thStyle}>{t("orders.f_store")}</th>
                    <th style={thStyle}>{t("orders.f_total")}</th>
                    <th style={thStyle}>{t("orders.qty")}</th>
                    <th style={thStyle}>{t("orders.f_status")}</th>
                    <th style={thStyle}>{t("orders.ship")}</th>
                    <th style={thStyle}>{t("orders.f_wilaya")}</th>
                    <th style={thStyle}>{t("orders.date")}</th>
                    <th style={thStyle}>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={10} style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                      {t("orders.empty")}
                    </td></tr>
                  ) : orders.map(o => (
                    <tr key={o.id} className="ord-row" style={{ background: "#fff" }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{o.customerName}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{o.customerPhone}</div>
                      </td>
                      <td style={tdStyle}><span style={{ fontSize: 12, color: "#475569", maxWidth: 140, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.product?.name ?? o.productId?.slice(0, 8)}</span></td>
                      <td style={tdStyle}><span style={{ fontSize: 12, color: "#475569" }}>{o.store?.name ?? "—"}</span></td>
                      <td style={tdStyle}><span style={{ fontWeight: 800, fontSize: 13, color: "#0f172a" }}>{fmt(o.totalPrice)}<span style={{ fontSize: 10, color: "#94a3b8", marginInlineStart: 3 }}>DZD</span></span></td>
                      <td style={tdStyle}><span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>{o.quantity}</span></td>
                      <td style={tdStyle}><StatusBadge status={o.status} /></td>
                      <td style={tdStyle}>
                        <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#f1f5f9", color: "#475569" }}>{o.typeShip ? t(`orders.ship_${o.typeShip}`, { defaultValue: o.typeShip }) : "—"}</span>
                      </td>
                      <td style={tdStyle}><span style={{ fontSize: 12, color: "#475569" }}>{o.customerWilaya?.ar_name ?? "—"}</span></td>
                      <td style={tdStyle}><bdi dir="ltr" style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", whiteSpace: "nowrap" }}>{fmtDate(o.createdAt)}</bdi></td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setDetail(o)} title={t("orders.details")}
                            style={{ padding: "5px 9px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", cursor: "pointer", transition: "all .15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; }}>
                            <EyeIcon />
                          </button>
                          <button onClick={() => setEdit(o)} title={t("orders.update")}
                            style={{ padding: "5px 9px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", cursor: "pointer", transition: "all .15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fef3c7"; e.currentTarget.style.color = "#d97706"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; }}>
                            <EditIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* الهاتف: بطاقة لكل طلب */}
            <div className="ord-cards">
              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 0", color: "#94a3b8", fontSize: 14 }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>📦</div>{t("orders.empty")}
                </div>
              ) : orders.map(o => (
                <div key={o.id} style={{ padding: 14, borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{o.customerName}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }} dir="ltr">{o.customerPhone}</div>
                    </div>
                    <div style={{ textAlign: "end", flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{fmt(o.totalPrice)} <span style={{ fontSize: 10, color: "#94a3b8" }}>DZD</span></div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}><bdi dir="ltr">{fmtDate(o.createdAt)}</bdi></div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {o.quantity}× {o.product?.name ?? o.productId?.slice(0, 8)} · {o.store?.name ?? "—"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <StatusBadge status={o.status} />
                    {o.customerWilaya?.ar_name && <span style={{ fontSize: 11, color: "#64748b" }}>{o.customerWilaya.ar_name}</span>}
                    <span style={{ flex: 1 }} />
                    <button onClick={() => setDetail(o)} title={t("orders.details")} style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b" }}><EyeIcon /></button>
                    <button onClick={() => setEdit(o)} title={t("orders.update")} style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#d97706" }}><EditIcon /></button>
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

      {detailOrder && <DetailModal order={detailOrder} onClose={() => setDetail(null)} />}
      {editOrder && <UpdateModal order={editOrder} onClose={() => setEdit(null)} onSave={updateStatus} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}