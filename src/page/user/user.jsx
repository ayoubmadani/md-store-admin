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
const SearchIcon  = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />;
const CheckIcon   = () => <Icon d="M20 6 9 17l-5-5" />;
const XIcon       = () => <Icon d="M18 6 6 18M6 6l12 12" />;
const ShieldIcon  = () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const UserIcon    = () => <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const ChevronIcon = ({ dir = "right" }) => <Icon d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />;
const RefreshIcon = () => <Icon d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b" };
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", background: colors[type] ?? colors.warning, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.2)", animation: "usr-slideUp .25s ease" }}>
      {msg}
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: .8, padding: 0 }}><XIcon /></button>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const inp = { width: "100%", padding: "9px 11px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#0f172a", fontSize: 14, outline: "none", boxSizing: "border-box" };
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14 };

// ─── Role & verified badges ───────────────────────────────────────────────────
function RoleBadge({ role }) {
  const isAdmin = role === "ADMIN";
  return (
    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: isAdmin ? "#fef3c7" : "#f1f5f9", color: isAdmin ? "#d97706" : "#64748b" }}>
      {role}
    </span>
  );
}
function VerifiedBadge({ verified }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: verified ? "#dcfce7" : "#f1f5f9", color: verified ? "#16a34a" : "#94a3b8" }}>
      {verified ? <><CheckIcon /> Yes</> : "No"}
    </span>
  );
}
function ProviderBadge({ provider }) {
  const colors = { GOOGLE: { bg: "#fce7f3", color: "#db2777" }, CREDENTIALS: { bg: "#eff6ff", color: "#2563eb" }, CREDENTIALS_GOOGLE: { bg: "#f5f3ff", color: "#7c3aed" } };
  const c = colors[provider] ?? colors.CREDENTIALS;
  return <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: c.bg, color: c.color }}>{provider}</span>;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 36 }) {
  const initials = (name ?? "?").slice(0, 2).toUpperCase();
  const hue = (name ?? "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{ width: size, height: size, borderRadius: 10, background: `hsl(${hue},60%,90%)`, color: `hsl(${hue},60%,35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 800, flexShrink: 0 }}>
      {initials}
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
        <ChevronIcon dir="left" />
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
        <ChevronIcon dir="right" />
      </button>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
const thStyle = { padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" };
const tdStyle = { padding: "13px 16px", fontSize: 13, borderBottom: "1px solid #f8fafc", verticalAlign: "middle" };

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Users() {
  const [users, setUsers]       = useState([]);
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 });
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);
  const [acting, setActing]     = useState(null); // id of row in progress

  const showToast = (msg, type = "success") => setToast({ msg, type });

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = debouncedQ
        ? `/admin/users/search?q=${encodeURIComponent(debouncedQ)}&page=${page}&limit=15`
        : `/admin/users?page=${page}&limit=15`;
      const res = await api.get(url);
      setUsers(res.data.data ?? []);
      setMeta({ total: res.data.total ?? 0, totalPages: res.data.totalPages ?? 1 });
    } catch { showToast("Failed to load users", "error"); }
    finally { setLoading(false); }
  }, [page, debouncedQ]);

  useEffect(() => { load(); }, [load]);

  const toggleVerify = async (id, current) => {
    setActing(id);
    try {
      await api.patch(`/admin/users/${id}/verify`);
      showToast(current ? "Unverified" : "Verified ✓");
      load();
    } catch { showToast("Action failed", "error"); }
    setActing(null);
  };

  const toggleRole = async (id, current) => {
    setActing(id);
    const role = current === "ADMIN" ? "NORMAL_USER" : "ADMIN";
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      showToast(`Role changed to ${role}`);
      load();
    } catch { showToast("Action failed", "error"); }
    setActing(null);
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

  return (
    <>
      <style>{`
        @keyframes usr-slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes usr-fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .usr-row:hover { background: #f8fafc !important; }
        .usr-btn:hover { background: #eff6ff !important; border-color: #93c5fd !important; color: #1d4ed8 !important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "usr-fadeIn .3s ease" }}>

        {/* ── Toolbar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}><SearchIcon /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
              style={{ ...inp, paddingLeft: 36, maxWidth: 360 }} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{meta.total.toLocaleString()} users</div>
            <button onClick={load} title="Refresh"
              style={{ padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.color = "#2563eb"}
              onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
              <RefreshIcon />
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ ...card, overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f1f5f9" }} />
                  <div style={{ flex: 1, height: 14, borderRadius: 6, background: "#f1f5f9" }} />
                  <div style={{ width: 80, height: 14, borderRadius: 6, background: "#f1f5f9" }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Provider</th>
                    <th style={thStyle}>Verified</th>
                    <th style={thStyle}>Phone</th>
                    <th style={thStyle}>Stores</th>
                    <th style={thStyle}>Joined</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                      No users found
                    </td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="usr-row" style={{ background: "#fff" }}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={u.username} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{u.username}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}><RoleBadge role={u.role} /></td>
                      <td style={tdStyle}><ProviderBadge provider={u.provider} /></td>
                      <td style={tdStyle}><VerifiedBadge verified={u.isVerified} /></td>
                      <td style={tdStyle}><span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{u.phone ?? "—"}</span></td>
                      <td style={tdStyle}>
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#2563eb" }}>
                          {u.stores?.length ?? 0}
                        </span>
                      </td>
                      <td style={tdStyle}><span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{fmtDate(u.createdAt)}</span></td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            disabled={acting === u.id}
                            onClick={() => toggleVerify(u.id, u.isVerified)}
                            title={u.isVerified ? "Unverify" : "Verify"}
                            style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", cursor: acting === u.id ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, transition: "all .15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = u.isVerified ? "#fee2e2" : "#dcfce7"; e.currentTarget.style.color = u.isVerified ? "#dc2626" : "#16a34a"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; }}
                          >
                            {u.isVerified ? <XIcon /> : <CheckIcon />}
                          </button>
                          <button
                            disabled={acting === u.id}
                            onClick={() => toggleRole(u.id, u.role)}
                            title={u.role === "ADMIN" ? "Demote to user" : "Promote to admin"}
                            style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", cursor: acting === u.id ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, transition: "all .15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fef3c7"; e.currentTarget.style.color = "#d97706"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; }}
                          >
                            {u.role === "ADMIN" ? <UserIcon /> : <ShieldIcon />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ padding: "4px 16px 12px" }}>
            <Pagination page={page} totalPages={meta.totalPages} onPage={setPage} />
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}