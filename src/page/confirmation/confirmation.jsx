import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// ─── Shared styles (نفس أسلوب صفحة المستخدمين) ────────────────────────────────
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14 };
const pill = (bg, color) => ({ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color, whiteSpace: "nowrap" });

const ACCESS = {
  requested: { label: "Requested", bg: "#fef3c7", color: "#b45309" },
  granted: { label: "Granted", bg: "#dcfce7", color: "#16a34a" },
  revoked: { label: "Revoked", bg: "#fee2e2", color: "#dc2626" },
};
const COMPANY = {
  pending: { label: "Pending", bg: "#fef3c7", color: "#b45309" },
  approved: { label: "Approved", bg: "#dcfce7", color: "#16a34a" },
  suspended: { label: "Suspended", bg: "#fee2e2", color: "#dc2626" },
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, padding: "12px 18px", background: type === "error" ? "#ef4444" : "#22c55e", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.2)" }}>
      {msg}
    </div>
  );
}

function Tabs({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 10, padding: 4 }}>
      {options.map(([key, label, count]) => (
        <button key={key} onClick={() => onChange(key)}
          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
            background: value === key ? "#fff" : "transparent", color: value === key ? "#2563eb" : "#64748b",
            boxShadow: value === key ? "0 1px 3px rgba(0,0,0,.08)" : "none" }}>
          {label}{count != null ? ` (${count})` : ""}
        </button>
      ))}
    </div>
  );
}

function Btn({ onClick, disabled, kind = "ok", children }) {
  const s = kind === "ok"
    ? { background: "#16a34a", color: "#fff", border: "none" }
    : { background: "#fff", color: "#dc2626", border: "1px solid #fecaca" };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...s, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: disabled ? "default" : "pointer", opacity: disabled ? .5 : 1 }}>
      {children}
    </button>
  );
}

const th = { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .4, borderBottom: "1px solid #e2e8f0" };
const td = { padding: "12px 14px", fontSize: 13, color: "#0f172a", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };
const fmt = (d) => (d ? new Date(d).toLocaleString() : "—");

export default function ConfirmationAdmin() {
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(null);

  const [accessTab, setAccessTab] = useState("requested");
  const [users, setUsers] = useState(null);
  const [companyTab, setCompanyTab] = useState("pending");
  const [companies, setCompanies] = useState(null);

  const notify = (msg, type = "success") => setToast({ msg, type });
  const errMsg = (e) => {
    const m = e.response?.data?.message;
    return Array.isArray(m) ? m.join(", ") : m || "Request failed";
  };

  const loadUsers = useCallback(async () => {
    setUsers(null);
    try {
      const { data } = await api.get("/confirmation/admin/access", { params: { access: accessTab || undefined } });
      setUsers(data);
    } catch (e) { notify(errMsg(e), "error"); setUsers([]); }
  }, [accessTab]);

  const loadCompanies = useCallback(async () => {
    setCompanies(null);
    try {
      const { data } = await api.get("/confirmation/admin/companies", { params: { status: companyTab || undefined } });
      setCompanies(data);
    } catch (e) { notify(errMsg(e), "error"); setCompanies([]); }
  }, [companyTab]);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { loadCompanies(); }, [loadCompanies]);

  const setAccess = async (u, access) => {
    setBusy(u.id);
    try {
      await api.patch(`/confirmation/admin/access/${u.id}`, { access });
      notify(access === "granted" ? `Access granted to ${u.username}` : `Access revoked for ${u.username}`);
      loadUsers();
    } catch (e) { notify(errMsg(e), "error"); } finally { setBusy(null); }
  };

  const setStatus = async (c, status) => {
    setBusy(c.id);
    try {
      await api.patch(`/confirmation/admin/companies/${c.id}/status`, { status });
      notify(`${c.name}: ${COMPANY[status].label}`);
      loadCompanies();
    } catch (e) { notify(errMsg(e), "error"); } finally { setBusy(null); }
  };

  const empty = (cols) => <tr><td colSpan={cols} style={{ ...td, textAlign: "center", color: "#94a3b8", padding: 40 }}>Nothing here</td></tr>;
  const loading = (cols) => <tr><td colSpan={cols} style={{ ...td, textAlign: "center", color: "#94a3b8", padding: 40 }}>Loading…</td></tr>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>Order confirmation</h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
          Who may work as an order confirmer (confirm app), and which confirmation companies merchants can see.
        </p>
      </div>

      {/* ── Confirmer access ── */}
      <section style={card}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Confirmer access</h2>
          <Tabs value={accessTab} onChange={setAccessTab}
            options={[["requested", "Requests"], ["granted", "Granted"], ["revoked", "Revoked"], ["", "All"]]} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>User</th><th style={th}>Phone</th><th style={th}>Company</th><th style={th}>Access</th><th style={th}></th></tr></thead>
            <tbody>
              {users === null ? loading(5) : users.length === 0 ? empty(5) : users.map((u) => {
                const a = ACCESS[u.access] ?? { label: u.access, bg: "#f1f5f9", color: "#64748b" };
                return (
                  <tr key={u.id}>
                    <td style={td}><div style={{ fontWeight: 700 }}>{u.username}</div><div style={{ fontSize: 12, color: "#64748b" }}>{u.email}</div></td>
                    <td style={td}>{u.phone || "—"}</td>
                    <td style={td}>{u.company ? <>{u.company.name} <span style={{ fontSize: 11, color: "#64748b" }}>({u.company.role})</span></> : "—"}</td>
                    <td style={td}><span style={pill(a.bg, a.color)}>{a.label}</span></td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        {u.access !== "granted" && <Btn disabled={busy === u.id} onClick={() => setAccess(u, "granted")}>Grant</Btn>}
                        {u.access !== "revoked" && <Btn kind="danger" disabled={busy === u.id} onClick={() => setAccess(u, "revoked")}>{u.access === "requested" ? "Reject" : "Revoke"}</Btn>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Confirmation companies ── */}
      <section style={card}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Confirmation companies</h2>
          <Tabs value={companyTab} onChange={setCompanyTab}
            options={[["pending", "Pending"], ["approved", "Approved"], ["suspended", "Suspended"], ["", "All"]]} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Company</th><th style={th}>Owner</th><th style={th}>Commission</th><th style={th}>Created</th><th style={th}>Status</th><th style={th}></th></tr></thead>
            <tbody>
              {companies === null ? loading(6) : companies.length === 0 ? empty(6) : companies.map((c) => {
                const s = COMPANY[c.status] ?? { label: c.status, bg: "#f1f5f9", color: "#64748b" };
                return (
                  <tr key={c.id}>
                    <td style={td}>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{c.phone}{c.wilaya ? ` · ${c.wilaya.name}` : ""}</div>
                    </td>
                    <td style={td}><div>{c.owner?.username}</div><div style={{ fontSize: 12, color: "#64748b" }}>{c.owner?.email}</div></td>
                    <td style={td}>{c.commissionPerDelivered} DA / delivered</td>
                    <td style={td}>{fmt(c.createdAt)}</td>
                    <td style={td}><span style={pill(s.bg, s.color)}>{s.label}</span></td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        {c.status !== "approved" && <Btn disabled={busy === c.id} onClick={() => setStatus(c, "approved")}>Approve</Btn>}
                        {c.status !== "suspended" && <Btn kind="danger" disabled={busy === c.id} onClick={() => setStatus(c, "suspended")}>Suspend</Btn>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
