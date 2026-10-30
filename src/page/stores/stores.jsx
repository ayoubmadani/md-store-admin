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
const SearchIcon   = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />;
const XIcon        = () => <Icon d="M18 6 6 18M6 6l12 12" />;
const ChevronIcon  = ({ dir = "right" }) => <Icon d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />;
const RefreshIcon  = () => <Icon d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />;
const TrashIcon    = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const ToggleIcon   = () => <Icon d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />; // تفعيل / إيقاف
const EyeIcon      = () => <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0" />;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b" };
  return (
    <div style={{ position: "fixed", bottom: 90, insetInlineEnd: 16, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", background: colors[type] ?? colors.warning, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.2)", animation: "st-slideUp .25s ease" }}>
      {msg}
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: .8, padding: 0 }}><XIcon /></button>
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14 };
const thStyle = { padding: "10px 16px", textAlign: "start", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" };
const tdStyle = { padding: "13px 16px", fontSize: 13, borderBottom: "1px solid #f8fafc", verticalAlign: "middle" };

function ActiveBadge({ active }) {
  const { t } = useTranslation();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: active ? "#dcfce7" : "#f1f5f9", color: active ? "#16a34a" : "#94a3b8" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#22c55e" : "#cbd5e1", display: "inline-block" }} />
      {active ? t("stores.active") : t("stores.inactive")}
    </span>
  );
}

function Avatar({ name, size = 36 }) {
  const hue = (name ?? "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{ width: size, height: size, borderRadius: 10, background: `hsl(${hue},55%,90%)`, color: `hsl(${hue},55%,35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 800, flexShrink: 0 }}>
      {(name ?? "?")[0].toUpperCase()}
    </div>
  );
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "16px 0 4px" }}>
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1}
        style={{ padding: "7px 11px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: page <= 1 ? "#cbd5e1" : "#475569", cursor: page <= 1 ? "not-allowed" : "pointer" }}>
        <span className="st-chev"><ChevronIcon dir="left" /></span>
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
        <span className="st-chev"><ChevronIcon dir="right" /></span>
      </button>
    </div>
  );
}

// ─── Stats Modal ──────────────────────────────────────────────────────────────
function StatsModal({ storeId, storeName, onClose }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/stores/${storeId}/stats`)
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId]);

  const fmt = n => Number(n ?? 0).toLocaleString("en-DZ");

  const STATUS_COLORS = { pending: "#d97706", confirmed: "#2563eb", shipping: "#db2777", delivered: "#16a34a", cancelled: "#dc2626", returned: "#dc2626", postponed: "#64748b" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,17,23,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,.15)", animation: "st-modalIn .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{t("stores.stats_title", { name: storeName })}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><XIcon /></button>
        </div>
        <div style={{ padding: 24 }}>
          {loading ? (
            <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
              {Array(4).fill(0).map((_, i) => <div key={i} style={{ height: 36, borderRadius: 8, background: "#f1f5f9" }} />)}
            </div>
          ) : stats ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10, marginBottom: 20 }}>
                {[
                  { label: t("stores.products"),   value: fmt(stats.totalProducts),   color: "#2563eb" },
                  { label: t("stores.orders"),     value: fmt(stats.totalOrders),     color: "#d97706" },
                  { label: t("stores.revenue"),    value: `${fmt(stats.totalRevenue)} DZD`, color: "#16a34a" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>{t("stores.by_status")}</div>
              {Object.entries(stats.byStatus ?? {}).filter(([, v]) => v > 0).map(([status, count]) => (
                <div key={status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                  <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${STATUS_COLORS[status] ?? "#64748b"}18`, color: STATUS_COLORS[status] ?? "#64748b" }}>{t(`status.${status}`, { defaultValue: status })}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{count}</span>
                </div>
              ))}
            </>
          ) : <div style={{ color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>{t("stores.stats_failed")}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Stores() {
  const { t } = useTranslation();
  const [stores, setStores]     = useState([]);
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 });
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);
  const [acting, setActing]     = useState(null);
  const [statsFor, setStatsFor] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/stores?page=${page}&limit=15`);
      setStores(res.data.data ?? []);
      setMeta({ total: res.data.total ?? 0, totalPages: res.data.totalPages ?? 1 });
    } catch { showToast(t("stores.load_failed"), "error"); }
    finally { setLoading(false); }
  }, [page, t]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (id, current) => {
    if (!confirm(current ? t("stores.confirm_deactivate") : t("stores.confirm_activate"))) return;
    setActing(id);
    try {
      await api.patch(`/admin/stores/${id}/toggle`);
      showToast(current ? t("stores.deactivated") : t("stores.activated"));
      load();
    } catch { showToast(t("users.action_failed"), "error"); }
    setActing(null);
  };

  const deleteStore = async (id, name) => {
    if (!confirm(t("stores.confirm_delete", { name }))) return;
    setActing(id);
    try {
      await api.delete(`/admin/stores/${id}`);
      showToast(t("stores.deleted"));
      load();
    } catch { showToast(t("stores.delete_failed"), "error"); }
    setActing(null);
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

  return (
    <>
      <style>{`
        @keyframes st-slideUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes st-fadeIn   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes st-modalIn  { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        .st-row:hover { background: #f8fafc !important; }
        [dir="rtl"] .st-chev { display:inline-flex; transform:scaleX(-1) }
        /* الهاتف: بطاقات بدل الجدول */
        .st-table { display:none }
        @media (min-width: 1024px) { .st-table { display:block } .st-cards { display:none } }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "st-fadeIn .3s ease" }}>

        {/* ── Toolbar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginInlineStart: "auto" }}>
            {t("stores.total_n", { n: meta.total.toLocaleString() })}
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
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f1f5f9" }} />
                  <div style={{ flex: 1, height: 14, borderRadius: 6, background: "#f1f5f9" }} />
                  <div style={{ width: 80, height: 14, borderRadius: 6, background: "#f1f5f9" }} />
                </div>
              ))}
            </div>
          ) : (
            <>
            <div className="st-table" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={thStyle}>{t("stores.store")}</th>
                    <th style={thStyle}>{t("stores.owner")}</th>
                    <th style={thStyle}>{t("stores.niche")}</th>
                    <th style={thStyle}>{t("stores.currency")}</th>
                    <th style={thStyle}>{t("stores.theme")}</th>
                    <th style={thStyle}>{t("stores.status")}</th>
                    <th style={thStyle}>{t("stores.created")}</th>
                    <th style={thStyle}>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🏪</div>
                      {t("stores.empty")}
                    </td></tr>
                  ) : stores.map(s => (
                    <tr key={s.id} className="st-row" style={{ background: "#fff" }}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={s.name} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{s.subdomain}</div>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{s.user?.username ?? "—"}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{s.user?.email ?? ""}</div>
                      </td>
                      <td style={tdStyle}>
                        {s.niche ? (
                          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#f5f3ff", color: "#7c3aed" }}>{s.niche.name}</span>
                        ) : <span style={{ color: "#cbd5e1" }}>—</span>}
                      </td>
                      <td style={tdStyle}><span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#475569" }}>{s.currency}</span></td>
                      <td style={tdStyle}>
                        {s.themeUser?.theme
                          ? <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#2563eb" }}>{s.themeUser.theme.slug}</span>
                          : <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>}
                      </td>
                      <td style={tdStyle}><ActiveBadge active={s.isActive} /></td>
                      <td style={tdStyle}><bdi dir="ltr" style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace", whiteSpace: "nowrap" }}>{fmtDate(s.createdAt)}</bdi></td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setStatsFor(s)} title={t("stores.view_stats")}
                            style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", cursor: "pointer", transition: "all .15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; }}>
                            <EyeIcon />
                          </button>
                          <button
                            disabled={acting === s.id}
                            onClick={() => toggleStatus(s.id, s.isActive)}
                            title={s.isActive ? t("stores.deactivate") : t("stores.activate")}
                            style={{ padding: "6px 10px", border: "1px solid", borderColor: s.isActive ? "#bbf7d0" : "#e2e8f0", borderRadius: 7, background: s.isActive ? "#f0fdf4" : "#fff", color: s.isActive ? "#16a34a" : "#64748b", cursor: acting === s.id ? "not-allowed" : "pointer", transition: "all .15s" }}>
                            <ToggleIcon />
                          </button>
                          <button
                            disabled={acting === s.id}
                            onClick={() => deleteStore(s.id, s.name)}
                            title={t("stores.delete")}
                            style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", cursor: acting === s.id ? "not-allowed" : "pointer", transition: "all .15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* الهاتف: بطاقة لكل متجر */}
            <div className="st-cards">
              {stores.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 0", color: "#94a3b8", fontSize: 14 }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>🏪</div>{t("stores.empty")}
                </div>
              ) : stores.map(s => (
                <div key={s.id} style={{ padding: 14, borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={s.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}><bdi dir="ltr">{s.subdomain}</bdi></div>
                    </div>
                    <ActiveBadge active={s.isActive} />
                  </div>
                  <div style={{ fontSize: 12, color: "#475569" }}>
                    {t("stores.owner")}: <b style={{ color: "#0f172a" }}>{s.user?.username ?? "—"}</b>
                    {s.user?.email && <span style={{ color: "#94a3b8" }}> · <bdi dir="ltr">{s.user.email}</bdi></span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    {s.niche && <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#f5f3ff", color: "#7c3aed" }}>{s.niche.name}</span>}
                    {s.themeUser?.theme && <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#2563eb" }}>{s.themeUser.theme.slug}</span>}
                    <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#475569" }}>{s.currency}</span>
                    <span style={{ flex: 1 }} />
                    <bdi dir="ltr" style={{ fontSize: 11, color: "#94a3b8" }}>{fmtDate(s.createdAt)}</bdi>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setStatsFor(s)} title={t("stores.view_stats")}
                      style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", cursor: "pointer", transition: "all .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; }}>
                      <EyeIcon />
                    </button>
                    <button
                      disabled={acting === s.id}
                      onClick={() => toggleStatus(s.id, s.isActive)}
                      title={s.isActive ? t("stores.deactivate") : t("stores.activate")}
                      style={{ padding: "6px 10px", border: "1px solid", borderColor: s.isActive ? "#bbf7d0" : "#e2e8f0", borderRadius: 7, background: s.isActive ? "#f0fdf4" : "#fff", color: s.isActive ? "#16a34a" : "#64748b", cursor: acting === s.id ? "not-allowed" : "pointer", transition: "all .15s" }}>
                      <ToggleIcon />
                    </button>
                    <button
                      disabled={acting === s.id}
                      onClick={() => deleteStore(s.id, s.name)}
                      title={t("stores.delete")}
                      style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", cursor: acting === s.id ? "not-allowed" : "pointer", transition: "all .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                      <TrashIcon />
                    </button>
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

      {statsFor && <StatsModal storeId={statsFor.id} storeName={statsFor.name} onClose={() => setStatsFor(null)} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}