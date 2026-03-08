import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

const api = axios.create({
  baseURL:  import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const UsersIcon   = () => <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;
const StoreIcon   = () => <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const BoxIcon     = () => <Icon d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />;
const DollarIcon  = () => <Icon d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />;
const TagIcon     = () => <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />;
const TrendIcon   = () => <Icon d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" />;
const PaletteIcon = () => <Icon d="M12 2a10 10 0 1 0 10 10c0-5.52-4.48-10-10-10zM7.39 16A4.5 4.5 0 0 1 12 12a4.5 4.5 0 0 1 2.61.84" />;
const AlertIcon   = () => <Icon d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />;
const PhoneIcon   = () => <Icon d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.63a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />;
const MapPinIcon  = () => <Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />;
const PackageIcon = () => <Icon d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />;
const GridIcon    = () => <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />;
const ShopIcon    = () => <Icon d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />;

// ─── Shared ───────────────────────────────────────────────────────────────────
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" };
const fmt  = n => Number(n ?? 0).toLocaleString("en-DZ");

function Skeleton({ h = 80, style = {} }) {
  return <div style={{ background: "#f1f5f9", borderRadius: 12, height: h, animation: "db-pulse 1.4s ease infinite", ...style }} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent = "#2563eb", bg = "#eff6ff" }) {
  return (
    <div style={{ ...card, padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14, transition: "box-shadow .2s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: bg, color: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-.02em", lineHeight: 1 }}>{value ?? "—"}</div>
        {sub && <div style={{ fontSize: 12, color: "#64748b", marginTop: 5 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────
function RevenueChart({ data = [] }) {
  if (!data.length) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 150, color: "#cbd5e1", fontSize: 13 }}>
      No revenue data
    </div>
  );
  const sliced = data.slice(-30).map(d => ({
    ...d, label: d.date ? d.date.slice(5) : d.date, revenue: Number(d.revenue),
  }));
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "#0f172a", color: "#fff", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
        <div style={{ color: "#94a3b8", marginBottom: 2 }}>{label}</div>
        <div>{Number(payload[0].value).toLocaleString("en-DZ")} DZD</div>
      </div>
    );
  };
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={sliced} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#eff6ff" }} />
        <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Status breakdown ─────────────────────────────────────────────────────────
const STATUS_COLORS = {
  pending:   { bg: "#fef3c7", color: "#d97706" },
  confirmed: { bg: "#dbeafe", color: "#2563eb" },
  shipping:  { bg: "#fce7f3", color: "#db2777" },
  delivered: { bg: "#dcfce7", color: "#16a34a" },
  cancelled: { bg: "#fee2e2", color: "#dc2626" },
  returned:  { bg: "#fee2e2", color: "#dc2626" },
  postponed: { bg: "#f1f5f9", color: "#64748b" },
};
function StatusPill({ status }) {
  const c = STATUS_COLORS[status] ?? { bg: "#f1f5f9", color: "#64748b" };
  return <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.bg, color: c.color }}>{status}</span>;
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, accent = "#2563eb" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${accent}18`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// ─── Rank row (reusable for all top-10 lists) ─────────────────────────────────
function RankRow({ rank, label, sub, value, valueSub, accent = "#2563eb", max = 1, danger = false }) {
  const pct = Math.round((value / max) * 100);
  const rankColors = ["#f59e0b", "#94a3b8", "#cd7f32"];
  const rankBg     = rank <= 3 ? rankColors[rank - 1] : "#e2e8f0";
  const rankText   = rank <= 3 ? "#fff" : "#64748b";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #f8fafc" }}>
      {/* rank badge */}
      <div style={{ width: 22, height: 22, borderRadius: 6, background: rankBg, color: rankText, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
        {rank}
      </div>
      {/* label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{sub}</div>}
        <div style={{ marginTop: 4, background: "#f1f5f9", borderRadius: 99, height: 4, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: danger ? "#ef4444" : accent, borderRadius: 99, transition: "width .6s ease" }} />
        </div>
      </div>
      {/* value */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: danger ? "#dc2626" : "#0f172a" }}>{fmt(value)}</div>
        {valueSub && <div style={{ fontSize: 10, color: "#94a3b8" }}>{valueSub}</div>}
      </div>
    </div>
  );
}

// ─── Analytics Panel (card + rank list) ──────────────────────────────────────
function AnalyticsPanel({ icon, title, subtitle, accent, danger, rows, loading, emptyMsg, renderRow }) {
  return (
    <div style={{ ...card, padding: 20 }}>
      <SectionHeader icon={icon} title={title} subtitle={subtitle} accent={accent} />
      {loading
        ? Array(5).fill(0).map((_, i) => <Skeleton key={i} h={44} style={{ marginBottom: 8 }} />)
        : rows.length === 0
          ? <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8", fontSize: 13 }}>{emptyMsg ?? "No data"}</div>
          : rows.map((row, i) => renderRow(row, i))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats,           setStats]           = useState(null);
  const [revenue,         setRevenue]         = useState([]);
  const [topPhones,       setTopPhones]       = useState([]);
  const [topWilayas,      setTopWilayas]      = useState([]);
  const [topRetWilayas,   setTopRetWilayas]   = useState([]);
  const [topProducts,     setTopProducts]     = useState([]);
  const [topCategories,   setTopCategories]   = useState([]);
  const [topStores,       setTopStores]       = useState([]);
  const [loadingMain,     setLoadingMain]     = useState(true);
  const [loadingAnalytics,setLoadingAnalytics]= useState(true);

  const loadMain = useCallback(async () => {
    setLoadingMain(true);
    try {
      const [sRes, rRes] = await Promise.all([
        api.get("/admin/dashboard/stats"),
        api.get("/admin/dashboard/revenue"),
      ]);
      setStats(sRes.data);
      setRevenue(rRes.data ?? []);
    } catch { /* silent */ }
    finally { setLoadingMain(false); }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const [ph, wi, rw, pr, ca, st] = await Promise.all([
        api.get("/admin/analytics/top-returned-phones"),
        api.get("/admin/analytics/top-wilayas"),
        api.get("/admin/analytics/top-returned-wilayas"),
        api.get("/admin/analytics/top-products"),
        api.get("/admin/analytics/top-categories"),
        api.get("/admin/analytics/top-stores"),
      ]);
      setTopPhones(ph.data ?? []);
      setTopWilayas(wi.data ?? []);
      setTopRetWilayas(rw.data ?? []);
      setTopProducts(pr.data ?? []);
      setTopCategories(ca.data ?? []);
      setTopStores(st.data ?? []);
    } catch { /* silent */ }
    finally { setLoadingAnalytics(false); }
  }, []);

  useEffect(() => { loadMain(); loadAnalytics(); }, [loadMain, loadAnalytics]);

  const s = stats;
  const statCards = s ? [
    { label: "Total Users",   value: fmt(s.users?.total),            sub: `+${fmt(s.users?.newThisMonth)} this month`,       icon: <UsersIcon />,  accent: "#7c3aed", bg: "#f5f3ff" },
    { label: "Active Stores", value: fmt(s.stores?.active),          sub: `${fmt(s.stores?.total)} total`,                   icon: <StoreIcon />,  accent: "#2563eb", bg: "#eff6ff" },
    { label: "Total Orders",  value: fmt(s.orders?.total),           sub: `${fmt(s.orders?.byStatus?.pending)} pending`,     icon: <BoxIcon />,    accent: "#d97706", bg: "#fffbeb" },
    { label: "Revenue",       value: `${fmt(s.orders?.totalRevenue)} DZD`, sub: `${fmt(s.orders?.revenueThisMonth)} this month`, icon: <DollarIcon />, accent: "#16a34a", bg: "#f0fdf4" },
    { label: "Products",      value: fmt(s.products?.total),         sub: `${fmt(s.products?.outOfStock)} out of stock`,     icon: <TagIcon />,    accent: "#db2777", bg: "#fdf2f8" },
    { label: "Themes",        value: fmt(s.themes?.total),           sub: `${fmt(s.themes?.totalPurchases)} purchases`,      icon: <PaletteIcon />,accent: "#0891b2", bg: "#ecfeff" },
  ] : [];

  const pendingOrders = s
    ? Object.entries(s.orders?.byStatus ?? {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
    : [];

  // max helpers
  const maxPhone   = topPhones[0]?.total       || 1;
  const maxWilaya  = topWilayas[0]?.total      || 1;
  const maxRetW    = topRetWilayas[0]?.total   || 1;
  const maxProduct = topProducts[0]?.totalOrders || 1;
  const maxCat     = topCategories[0]?.totalOrders || 1;
  const maxStore   = topStores[0]?.totalOrders || 1;

  return (
    <>
      <style>{`
        @keyframes db-pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes db-fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 22, animation: "db-fadeIn .3s ease" }}>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
          {loadingMain
            ? Array(6).fill(0).map((_, i) => <Skeleton key={i} h={90} />)
            : statCards.map(c => <StatCard key={c.label} {...c} />)
          }
        </div>

        {/* ── Revenue + status ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Revenue (last 30 days)</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Daily DZD income</div>
              </div>
              <div style={{ color: "#94a3b8" }}><TrendIcon /></div>
            </div>
            {loadingMain ? <Skeleton h={150} /> : <RevenueChart data={revenue} />}
          </div>
          <div style={{ ...card, padding: 20 }}>
            <SectionHeader icon={<BoxIcon />} title="Orders by Status" accent="#d97706" />
            {loadingMain
              ? Array(5).fill(0).map((_, i) => <Skeleton key={i} h={26} style={{ marginBottom: 8 }} />)
              : pendingOrders.length === 0
                ? <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No orders yet</div>
                : pendingOrders.map(([status, count]) => {
                  const total = s.orders?.total || 1;
                  const c = STATUS_COLORS[status] ?? { color: "#64748b" };
                  return (
                    <div key={status} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <StatusPill status={status} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{count.toLocaleString()}</span>
                      </div>
                      <div style={{ background: "#f1f5f9", borderRadius: 99, height: 4, overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((count / total) * 100)}%`, height: "100%", background: c.color, borderRadius: 99, transition: "width .6s ease" }} />
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* ── Analytics title ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".1em", whiteSpace: "nowrap" }}>
            Analytics — Top 10
          </span>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        </div>

        {/* ── Row 1: returned phones + top wilayas ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* الأرقام الأكثر إرجاعاً */}
          <AnalyticsPanel
            icon={<PhoneIcon />}
            title="الأرقام الأكثر إرجاعاً"
            subtitle="Top 10 phone numbers — most returns"
            accent="#dc2626"
            danger
            rows={topPhones}
            loading={loadingAnalytics}
            emptyMsg="No returned orders"
            renderRow={(r, i) => (
              <RankRow key={r.phone}
                rank={i + 1}
                label={r.phone}
                sub={r.name}
                value={r.total}
                valueSub="returns"
                accent="#dc2626"
                danger
                max={maxPhone}
              />
            )}
          />

          {/* الولايات الأكثر طلباً بدون إرجاع */}
          <AnalyticsPanel
            icon={<MapPinIcon />}
            title="الولايات الأكثر طلباً"
            subtitle="Top 10 wilayas — excluding returns & cancellations"
            accent="#16a34a"
            rows={topWilayas}
            loading={loadingAnalytics}
            renderRow={(r, i) => (
              <RankRow key={r.wilaya}
                rank={i + 1}
                label={r.wilaya}
                sub={`${fmt(r.revenue)} DZD`}
                value={r.total}
                valueSub="orders"
                accent="#16a34a"
                max={maxWilaya}
              />
            )}
          />
        </div>

        {/* ── Row 2: returned wilayas + top products ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* الولايات الأكثر إرجاعاً */}
          <AnalyticsPanel
            icon={<MapPinIcon />}
            title="الولايات الأكثر إرجاعاً"
            subtitle="Top 10 wilayas — most returned orders"
            accent="#ef4444"
            danger
            rows={topRetWilayas}
            loading={loadingAnalytics}
            emptyMsg="No returns recorded"
            renderRow={(r, i) => (
              <RankRow key={r.wilaya}
                rank={i + 1}
                label={r.wilaya}
                value={r.total}
                valueSub="returns"
                accent="#ef4444"
                danger
                max={maxRetW}
              />
            )}
          />

          {/* المنتجات الأكثر طلباً */}
          <AnalyticsPanel
            icon={<PackageIcon />}
            title="المنتجات الأكثر طلباً"
            subtitle="Top 10 most ordered products"
            accent="#7c3aed"
            rows={topProducts}
            loading={loadingAnalytics}
            renderRow={(r, i) => (
              <RankRow key={r.productId}
                rank={i + 1}
                label={r.name}
                sub={`${fmt(r.revenue)} DZD revenue`}
                value={r.totalOrders}
                valueSub={`${fmt(r.totalQty)} units`}
                accent="#7c3aed"
                max={maxProduct}
              />
            )}
          />
        </div>

        {/* ── Row 3: top categories + top stores ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* الأصناف الأكثر طلباً */}
          <AnalyticsPanel
            icon={<GridIcon />}
            title="الأصناف الأكثر طلباً"
            subtitle="Top 10 categories by order volume"
            accent="#0891b2"
            rows={topCategories}
            loading={loadingAnalytics}
            renderRow={(r, i) => (
              <RankRow key={r.categoryId}
                rank={i + 1}
                label={r.name}
                sub={`${fmt(r.revenue)} DZD`}
                value={r.totalOrders}
                valueSub="orders"
                accent="#0891b2"
                max={maxCat}
              />
            )}
          />

          {/* المتاجر الأكثر طلباً */}
          <AnalyticsPanel
            icon={<ShopIcon />}
            title="المتاجر الأكثر طلباً"
            subtitle="Top 10 stores by order volume"
            accent="#d97706"
            rows={topStores}
            loading={loadingAnalytics}
            renderRow={(r, i) => (
              <RankRow key={r.storeId}
                rank={i + 1}
                label={r.name}
                sub={`${r.subdomain} · ${fmt(r.revenue)} DZD`}
                value={r.totalOrders}
                valueSub="orders"
                accent="#d97706"
                max={maxStore}
              />
            )}
          />
        </div>

        {/* ── User + Health summary ── */}
        {!loadingMain && s && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ ...card, padding: 20 }}>
              <SectionHeader icon={<UsersIcon />} title="User Summary" accent="#7c3aed" />
              {[
                { label: "Total Users",    value: fmt(s.users?.total),        color: "#7c3aed" },
                { label: "Verified",       value: fmt(s.users?.verified),     color: "#16a34a" },
                { label: "Admins",         value: fmt(s.users?.admins),       color: "#d97706" },
                { label: "New This Month", value: fmt(s.users?.newThisMonth), color: "#2563eb" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f8fafc" }}>
                  <span style={{ fontSize: 13, color: "#475569" }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ ...card, padding: 20 }}>
              <SectionHeader icon={<TagIcon />} title="Product & Store Health" accent="#db2777" />
              {[
                { label: "Total Products",  value: fmt(s.products?.total),      color: "#0f172a" },
                { label: "Active Products", value: fmt(s.products?.active),     color: "#16a34a" },
                { label: "Out of Stock",    value: fmt(s.products?.outOfStock), color: s.products?.outOfStock > 0 ? "#dc2626" : "#16a34a" },
                { label: "Total Stores",    value: fmt(s.stores?.total),        color: "#0f172a" },
                { label: "Inactive Stores", value: fmt(s.stores?.inactive),     color: s.stores?.inactive > 0 ? "#d97706" : "#16a34a" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f8fafc" }}>
                  <span style={{ fontSize: 13, color: "#475569" }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: row.color }}>{row.value}</span>
                </div>
              ))}
              {s.products?.outOfStock > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "10px 12px", background: "#fef3c7", borderRadius: 8, color: "#d97706", fontSize: 12, fontWeight: 600 }}>
                  <AlertIcon /> {fmt(s.products.outOfStock)} products need restocking
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}