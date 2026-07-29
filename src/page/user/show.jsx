import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
const ArrowLeftIcon = () => <Icon d="M19 12H5M12 19l-7-7 7-7" />;
const CheckIcon     = () => <Icon d="M20 6 9 17l-5-5" />;
const XIcon         = () => <Icon d="M18 6 6 18M6 6l12 12" />;
const ShieldIcon    = () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const UserIcon      = () => <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const MailIcon      = () => <Icon d="M4 4h16v16H4V4zm0 0 8 8 8-8" size={15} />;
const PhoneIcon     = () => <Icon d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" size={15} />;
const CalendarIcon  = () => <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} />;
const StoreIcon     = () => <Icon d="M3 9l1-6h16l1 6M3 9a2 2 0 0 0 4 0m-4 0a2 2 0 0 0 2 2m2-2a2 2 0 0 0 4 0m-4 0a2 2 0 0 0 2 2m2-2a2 2 0 0 0 4 0m-4 0a2 2 0 0 0 2 2m2-2a2 2 0 0 0 4 0m-4 0a2 2 0 0 0 2 2M5 11v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" size={15} />;
const WalletIcon    = ({ size = 15 }) => <Icon d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4h-4z" size={size} />;
const PlusIcon      = ({ size }) => <Icon d="M12 5v14M5 12h14" size={size} />;
const PaletteIcon   = () => <Icon d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10a1.5 1.5 0 0 0 1.06-2.56 1.5 1.5 0 0 1 1.06-2.56H16a4 4 0 0 0 4-4c0-5.52-3.58-10-8-10z M6.5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M8.5 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M13 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M17 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" size={15} />;
const SearchIcon    = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} />;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b" };
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", background: colors[type] ?? colors.warning, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.2)", animation: "ush-slideUp .25s ease" }}>
      {msg}
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: .8, padding: 0 }}><XIcon /></button>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14 };

// ─── Badges ───────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const isAdmin = role === "ADMIN";
  return (
    <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: isAdmin ? "#fef3c7" : "#f1f5f9", color: isAdmin ? "#d97706" : "#64748b" }}>
      {role}
    </span>
  );
}
function VerifiedBadge({ verified }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: verified ? "#dcfce7" : "#f1f5f9", color: verified ? "#16a34a" : "#94a3b8" }}>
      {verified ? <><CheckIcon /> Verified</> : "Unverified"}
    </span>
  );
}
function ProviderBadge({ provider }) {
  const colors = { GOOGLE: { bg: "#fce7f3", color: "#db2777" }, CREDENTIALS: { bg: "#eff6ff", color: "#2563eb" }, CREDENTIALS_GOOGLE: { bg: "#f5f3ff", color: "#7c3aed" } };
  const c = colors[provider] ?? colors.CREDENTIALS;
  return <span style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: c.bg, color: c.color }}>{provider}</span>;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 64 }) {
  const initials = (name ?? "?").slice(0, 2).toUpperCase();
  const hue = (name ?? "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{ width: size, height: size, borderRadius: 16, background: `hsl(${hue},60%,90%)`, color: `hsl(${hue},60%,35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 800, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─── Info stat box ────────────────────────────────────────────────────────────
function InfoBox({ icon, label, value }) {
  return (
    <div style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtNum  = n => Number(n ?? 0).toLocaleString("en-DZ");

const STATUS_COLORS = { pending: "#d97706", confirmed: "#2563eb", shipping: "#db2777", delivered: "#16a34a", cancelled: "#dc2626", returned: "#dc2626", postponed: "#64748b" };

// ─── Stat box ─────────────────────────────────────────────────────────────────
function StatBox({ label, value, color }) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(15,17,23,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" };
const modalCardStyle = { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, maxHeight: "85vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.15)", animation: "ush-modalIn .2s ease" };
const modalHeaderStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff" };
const inp = { width: "100%", padding: "9px 11px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#0f172a", fontSize: 14, outline: "none", boxSizing: "border-box" };

function ModalShell({ title, onClose, children }) {
  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalCardStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><XIcon /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Recharge wallet modal ────────────────────────────────────────────────────
function RechargeModal({ onClose, onSubmit, loading }) {
  const [amount, setAmount] = useState("");
  return (
    <ModalShell title="Recharge Wallet" onClose={onClose}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>Amount (DZD)</label>
      <input type="number" min="0" step="1" value={amount} onChange={e => setAmount(e.target.value)}
        placeholder="0.00" style={inp} autoFocus />
      <button
        disabled={loading || !amount || Number(amount) <= 0}
        onClick={() => onSubmit(Number(amount))}
        style={{ width: "100%", marginTop: 16, padding: "10px 0", border: "none", borderRadius: 8, background: (!amount || Number(amount) <= 0) ? "#e2e8f0" : "#16a34a", color: "#fff", fontWeight: 700, fontSize: 13, cursor: (loading || !amount || Number(amount) <= 0) ? "not-allowed" : "pointer" }}
      >
        {loading ? "Processing…" : "Recharge"}
      </button>
    </ModalShell>
  );
}

// ─── Assign theme modal ───────────────────────────────────────────────────────
function AssignThemeModal({ onClose, onAssign, assigning }) {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/admin/themes?page=1&limit=100")
      .then(r => setThemes(r.data.data ?? r.data ?? []))
      .catch(() => setThemes([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = themes.filter(t => {
    const query = q.toLowerCase();
    return (t.name_en ?? "").toLowerCase().includes(query)
      || (t.slug ?? "").toLowerCase().includes(query)
      || (t.id ?? "").toLowerCase().includes(query);
  });

  return (
    <ModalShell title="Assign Theme to User" onClose={onClose}>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}><SearchIcon /></span>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, slug or id…" style={{ ...inp, paddingLeft: 34 }} />
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array(4).fill(0).map((_, i) => <div key={i} style={{ height: 44, borderRadius: 8, background: "#f1f5f9" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>No themes found</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflow: "auto" }}>
          {filtered.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#f8fafc", borderRadius: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name_en}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{t.price ? `${t.price} DZD` : "Free"}</div>
              </div>
              <button
                disabled={assigning}
                onClick={() => onAssign(t.id)}
                style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#2563eb", cursor: assigning ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 700, flexShrink: 0 }}
              >
                Assign
              </button>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function UserShow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast]     = useState(null);
  const [acting, setActing]   = useState(false);
  const [storeStats, setStoreStats]   = useState({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [wallet, setWallet]           = useState(null);
  const [walletAvailable, setWalletAvailable] = useState(false);
  const [walletLoading, setWalletLoading]     = useState(true);
  const [transactions, setTransactions]       = useState([]);
  const [txAvailable, setTxAvailable]         = useState(false);
  const [txLoading, setTxLoading]             = useState(true);
  const [showRecharge, setShowRecharge]       = useState(false);
  const [recharging, setRecharging]           = useState(false);
  const [showAssignTheme, setShowAssignTheme] = useState(false);
  const [assigning, setAssigning]             = useState(false);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const res = await api.get(`/admin/users/${id}`);
      setUser(res.data.data ?? res.data);
    } catch (err) {
      if (err?.response?.status === 404) setNotFound(true);
      else showToast("Failed to load user", "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const loadWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const r = await api.get(`/admin/users/${id}/wallet`);
      setWallet(r.data.data ?? r.data);
      setWalletAvailable(true);
    } catch { setWalletAvailable(false); }
    setWalletLoading(false);

    setTxLoading(true);
    try {
      const r2 = await api.get(`/admin/users/${id}/transactions`);
      setTransactions(r2.data.data ?? r2.data ?? []);
      setTxAvailable(true);
    } catch { setTxAvailable(false); }
    setTxLoading(false);
  }, [id]);

  useEffect(() => { loadWallet(); }, [loadWallet]);

  const submitRecharge = async (amount) => {
    setRecharging(true);
    try {
      await api.post(`/admin/users/${id}/wallet/recharge`, { amount });
      showToast("Wallet recharged ✓");
      setShowRecharge(false);
      loadWallet();
    } catch {
      showToast("Recharge failed — endpoint not available on the backend yet", "error");
    }
    setRecharging(false);
  };

  const submitAssignTheme = async (themeId) => {
    setAssigning(true);
    try {
      await api.post(`/admin/users/${id}/theme`, { themeId });
      showToast("Theme assigned ✓");
      setShowAssignTheme(false);
      load();
    } catch {
      showToast("Assign failed — endpoint not available on the backend yet", "error");
    }
    setAssigning(false);
  };

  const storeIds = user?.stores?.map(s => s.id).join(",") ?? "";
  useEffect(() => {
    if (!storeIds) { setStoreStats({}); return; }
    setStatsLoading(true);
    Promise.all(
      storeIds.split(",").map(sid =>
        api.get(`/admin/stores/${sid}/stats`).then(r => [sid, r.data]).catch(() => [sid, null])
      )
    ).then(entries => setStoreStats(Object.fromEntries(entries)))
      .finally(() => setStatsLoading(false));
  }, [storeIds]);

  const aggStats = { totalProducts: 0, totalOrders: 0, totalRevenue: 0, byStatus: {} };
  for (const s of Object.values(storeStats)) {
    if (!s) continue;
    aggStats.totalProducts += s.totalProducts ?? 0;
    aggStats.totalOrders += s.totalOrders ?? 0;
    aggStats.totalRevenue += Number(s.totalRevenue ?? 0);
    for (const [k, v] of Object.entries(s.byStatus ?? {})) aggStats.byStatus[k] = (aggStats.byStatus[k] ?? 0) + v;
  }

  const toggleVerify = async () => {
    setActing(true);
    try {
      await api.patch(`/admin/users/${id}/verify`);
      showToast(user.isVerified ? "Unverified" : "Verified ✓");
      load();
    } catch { showToast("Action failed", "error"); }
    setActing(false);
  };

  const toggleRole = async () => {
    setActing(true);
    const role = user.role === "ADMIN" ? "NORMAL_USER" : "ADMIN";
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      showToast(`Role changed to ${role}`);
      load();
    } catch { showToast("Action failed", "error"); }
    setActing(false);
  };

  return (
    <>
      <style>{`
        @keyframes ush-slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ush-fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes ush-modalIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        .ush-back:hover { background: #eff6ff !important; border-color: #93c5fd !important; color: #1d4ed8 !important; }
        .ush-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 18px; align-items: start; }
        @media (max-width: 900px) { .ush-grid { grid-template-columns: 1fr; } }
        .ush-scroll::-webkit-scrollbar { width: 6px; }
        .ush-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .ush-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "ush-fadeIn .3s ease", width: "100%" }}>

        {/* ── Back ── */}
        <button onClick={() => navigate(-1)} className="ush-back"
          style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s" }}>
          <ArrowLeftIcon /> Back to users
        </button>

        {loading ? (
          <div style={{ ...card, padding: 24, display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "#f1f5f9" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ width: "40%", height: 16, borderRadius: 6, background: "#f1f5f9" }} />
              <div style={{ width: "25%", height: 12, borderRadius: 6, background: "#f1f5f9" }} />
            </div>
          </div>
        ) : notFound ? (
          <div style={{ ...card, padding: "60px 0", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
            User not found
          </div>
        ) : user && (
          <>
            {/* ── Header: identity ── */}
            <div style={{ ...card, padding: 24, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <Avatar name={user.username} />
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: "#0f172a" }}>{user.username}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 13, fontFamily: "monospace", marginTop: 2 }}>
                  <MailIcon /> {user.email}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  <RoleBadge role={user.role} />
                  <ProviderBadge provider={user.provider} />
                  <VerifiedBadge verified={user.isVerified} />
                </div>
              </div>
            </div>

            {/* ── Actions bar ── */}
            <div style={{ ...card, padding: "14px 24px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", marginRight: 4 }}>Actions</span>
              <button
                onClick={() => setShowAssignTheme(true)}
                style={{ padding: "9px 16px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.color = "#7c3aed"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; }}
              >
                <PaletteIcon /> Assign Theme
              </button>
              <button
                disabled={acting}
                onClick={toggleVerify}
                style={{ padding: "9px 16px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b", cursor: acting ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = user.isVerified ? "#fee2e2" : "#dcfce7"; e.currentTarget.style.color = user.isVerified ? "#dc2626" : "#16a34a"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; }}
              >
                {user.isVerified ? <XIcon /> : <CheckIcon />} {user.isVerified ? "Unverify" : "Verify"}
              </button>
              <button
                disabled={acting}
                onClick={toggleRole}
                style={{ padding: "9px 16px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b", cursor: acting ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fef3c7"; e.currentTarget.style.color = "#d97706"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; }}
              >
                {user.role === "ADMIN" ? <UserIcon /> : <ShieldIcon />} {user.role === "ADMIN" ? "Demote" : "Promote"}
              </button>
            </div>

            {/* ── Wallet ── */}
            <div style={{ ...card, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap", background: "linear-gradient(135deg,#f0fdf4,#f8fafc)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <WalletIcon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em" }}>Wallet Balance</div>
                  {walletLoading ? (
                    <div style={{ width: 90, height: 22, borderRadius: 6, background: "#e2e8f0", marginTop: 4 }} />
                  ) : walletAvailable ? (
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#16a34a" }}>{fmtNum(wallet?.balance)} {wallet?.currency ?? "DZD"}</div>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }} title="Wallet endpoint not implemented on the backend yet">Not available yet</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowRecharge(true)}
                style={{ padding: "10px 18px", border: "none", borderRadius: 9, background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
                onMouseEnter={e => e.currentTarget.style.background = "#15803d"}
                onMouseLeave={e => e.currentTarget.style.background = "#16a34a"}
              >
                <PlusIcon size={14} /> Recharge Wallet
              </button>
            </div>

            {/* ── Info grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <InfoBox icon={<PhoneIcon />} label="Phone" value={user.phone ?? "—"} />
              <InfoBox icon={<CalendarIcon />} label="Joined" value={fmtDate(user.createdAt)} />
              <InfoBox icon={<StoreIcon />} label="Stores" value={user.stores?.length ?? 0} />
              <InfoBox icon={<UserIcon />} label="User ID" value={<span style={{ fontFamily: "monospace", fontSize: 12 }}>{user.id}</span>} />
            </div>

            {/* ── Left: stats + wallet · Right: stores ── */}
            <div className="ush-grid">
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* ── Store statistics (aggregated across all stores) ── */}
                {user.stores?.length > 0 && (
                  <div style={{ ...card, padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Store Statistics</div>
                    {statsLoading ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                        {Array(3).fill(0).map((_, i) => <div key={i} style={{ height: 58, borderRadius: 10, background: "#f1f5f9" }} />)}
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                          <StatBox label="Products" value={fmtNum(aggStats.totalProducts)} color="#2563eb" />
                          <StatBox label="Orders" value={fmtNum(aggStats.totalOrders)} color="#d97706" />
                          <StatBox label="Revenue" value={`${fmtNum(aggStats.totalRevenue)} DZD`} color="#16a34a" />
                        </div>
                        {Object.entries(aggStats.byStatus).some(([, v]) => v > 0) && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                            {Object.entries(aggStats.byStatus).filter(([, v]) => v > 0).map(([status, count]) => (
                              <span key={status} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${STATUS_COLORS[status] ?? "#64748b"}18`, color: STATUS_COLORS[status] ?? "#64748b" }}>
                                {status} · {count}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ── Wallet transactions ── */}
                <div style={{ ...card, padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Wallet Transactions</div>
                  {txLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {Array(3).fill(0).map((_, i) => <div key={i} style={{ height: 40, borderRadius: 8, background: "#f1f5f9" }} />)}
                    </div>
                  ) : !txAvailable ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>💳</div>
                      No wallet data available — this endpoint isn't implemented on the backend yet.
                    </div>
                  ) : transactions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>No transactions yet</div>
                  ) : (
                    <div className="ush-scroll" style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
                      {transactions.map((t, i) => (
                        <div key={t.id ?? i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#f8fafc", borderRadius: 8, fontSize: 13 }}>
                          <div>
                            <div style={{ fontWeight: 600, color: "#0f172a" }}>{t.type ?? t.description ?? "Transaction"}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{fmtDate(t.createdAt)}</div>
                          </div>
                          <span style={{ fontWeight: 700, color: Number(t.amount ?? 0) < 0 ? "#dc2626" : "#16a34a" }}>
                            {Number(t.amount ?? 0) > 0 ? "+" : ""}{fmtNum(t.amount)} {t.currency ?? "DZD"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Stores ── */}
              <div style={{ ...card, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Stores</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", background: "#f1f5f9", padding: "2px 8px", borderRadius: 20 }}>{user.stores?.length ?? 0}</span>
                </div>
                {user.stores?.length > 0 ? (
                  <div className="ush-scroll" style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 540, overflowY: "auto", paddingRight: 4 }}>
                    {user.stores.map((s, i) => {
                      const stats = storeStats[s.id];
                      return (
                        <div key={s.id ?? i} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, fontSize: 13 }}>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{s.name ?? s.title ?? `Store #${s.id ?? i + 1}`}</div>
                          {s.id && <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace", marginTop: 2 }}>{s.id}</div>}
                          {stats && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6, fontSize: 11, color: "#64748b" }}>
                              <span>{fmtNum(stats.totalProducts)} products</span>
                              <span>{fmtNum(stats.totalOrders)} orders</span>
                              <span>{fmtNum(stats.totalRevenue)} DZD</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>No stores yet</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} onSubmit={submitRecharge} loading={recharging} />}
      {showAssignTheme && <AssignThemeModal onClose={() => setShowAssignTheme(false)} onAssign={submitAssignTheme} assigning={assigning} />}
    </>
  );
}
