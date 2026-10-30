import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// ─── Shared styles (نفس أسلوب صفحة المستخدمين) ────────────────────────────────
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14 };
const pill = (bg, color) => ({ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color, whiteSpace: "nowrap" });

const ACCESS = {
  requested: { bg: "#fef3c7", color: "#b45309" },
  granted: { bg: "#dcfce7", color: "#16a34a" },
  revoked: { bg: "#fee2e2", color: "#dc2626" },
};
const COMPANY = {
  pending: { bg: "#fef3c7", color: "#b45309" },
  approved: { bg: "#dcfce7", color: "#16a34a" },
  suspended: { bg: "#fee2e2", color: "#dc2626" },
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 90, insetInlineEnd: 16, zIndex: 9999, padding: "12px 18px", background: type === "error" ? "#ef4444" : "#22c55e", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.2)" }}>
      {msg}
    </div>
  );
}

function Tabs({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 10, padding: 4, overflowX: "auto", maxWidth: "100%" }}>
      {options.map(([key, label, count]) => (
        <button key={key} onClick={() => onChange(key)}
          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
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

const th = { textAlign: "start", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .4, borderBottom: "1px solid #e2e8f0" };
const td = { padding: "12px 14px", fontSize: 13, color: "#0f172a", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—");

export default function ConfirmationAdmin() {
  const { t } = useTranslation();
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(null);

  const [accessTab, setAccessTab] = useState("requested");
  const [users, setUsers] = useState(null);
  const [companyTab, setCompanyTab] = useState("pending");
  const [companies, setCompanies] = useState(null);

  const notify = (msg, type = "success") => setToast({ msg, type });
  const errMsg = (e) => {
    const m = e.response?.data?.message;
    return Array.isArray(m) ? m.join(", ") : m || t("users.action_failed");
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
      notify(t(access === "granted" ? "confirm.granted_to" : "confirm.revoked_for", { name: u.username }));
      loadUsers();
    } catch (e) { notify(errMsg(e), "error"); } finally { setBusy(null); }
  };

  const setStatus = async (c, status) => {
    setBusy(c.id);
    try {
      await api.patch(`/confirmation/admin/companies/${c.id}/status`, { status });
      notify(`${c.name}: ${t(`confirm.c_${status}`)}`);
      loadCompanies();
    } catch (e) { notify(errMsg(e), "error"); } finally { setBusy(null); }
  };

  const accessActions = (u) => (
    <div style={{ display: "inline-flex", gap: 6 }}>
      {u.access !== "granted" && <Btn disabled={busy === u.id} onClick={() => setAccess(u, "granted")}>{t("confirm.grant")}</Btn>}
      {u.access !== "revoked" && <Btn kind="danger" disabled={busy === u.id} onClick={() => setAccess(u, "revoked")}>{u.access === "requested" ? t("confirm.reject") : t("confirm.revoke")}</Btn>}
    </div>
  );
  const companyActions = (c) => (
    <div style={{ display: "inline-flex", gap: 6 }}>
      {c.status !== "approved" && <Btn disabled={busy === c.id} onClick={() => setStatus(c, "approved")}>{t("confirm.approve")}</Btn>}
      {c.status !== "suspended" && <Btn kind="danger" disabled={busy === c.id} onClick={() => setStatus(c, "suspended")}>{t("confirm.suspend")}</Btn>}
    </div>
  );
  const cardRow = { padding: 14, borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 8 };
  const cardMsg = { textAlign: "center", color: "#94a3b8", padding: 40, fontSize: 13, margin: 0 };

  const empty = (cols) => <tr><td colSpan={cols} style={{ ...td, textAlign: "center", color: "#94a3b8", padding: 40 }}>{t("confirm.nothing")}</td></tr>;
  const loading = (cols) => <tr><td colSpan={cols} style={{ ...td, textAlign: "center", color: "#94a3b8", padding: 40 }}>{t("common.loading")}</td></tr>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        /* الهاتف: بطاقات بدل الجداول */
        .cf-table { display:none }
        @media (min-width: 1024px) { .cf-table { display:block } .cf-cards { display:none } }
      `}</style>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>{t("confirm.title")}</h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
          {t("confirm.subtitle")}
        </p>
      </div>

      {/* ── Confirmer access ── */}
      <section style={card}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>{t("confirm.access_title")}</h2>
          <Tabs value={accessTab} onChange={setAccessTab}
            options={[["requested", t("confirm.a_requested")], ["granted", t("confirm.a_granted")], ["revoked", t("confirm.a_revoked")], ["", t("status.all")]]} />
        </div>
        <div className="cf-table" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>{t("users.user")}</th><th style={th}>{t("users.phone")}</th><th style={th}>{t("confirm.company")}</th><th style={th}>{t("confirm.access")}</th><th style={th}></th></tr></thead>
            <tbody>
              {users === null ? loading(5) : users.length === 0 ? empty(5) : users.map((u) => {
                const a = ACCESS[u.access] ?? { bg: "#f1f5f9", color: "#64748b" };
                return (
                  <tr key={u.id}>
                    <td style={td}><div style={{ fontWeight: 700 }}>{u.username}</div><div style={{ fontSize: 12, color: "#64748b" }}><bdi dir="ltr">{u.email}</bdi></div></td>
                    <td style={td}><bdi dir="ltr">{u.phone || "—"}</bdi></td>
                    <td style={td}>{u.company ? <>{u.company.name} <span style={{ fontSize: 11, color: "#64748b" }}>({u.company.role})</span></> : "—"}</td>
                    <td style={td}><span style={pill(a.bg, a.color)}>{t(`confirm.s_${u.access}`, { defaultValue: u.access })}</span></td>
                    <td style={{ ...td, textAlign: "end" }}>{accessActions(u)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="cf-cards">
          {users === null ? <p style={cardMsg}>{t("common.loading")}</p> : users.length === 0 ? <p style={cardMsg}>{t("confirm.nothing")}</p> : users.map((u) => {
            const a = ACCESS[u.access] ?? { bg: "#f1f5f9", color: "#64748b" };
            return (
              <div key={u.id} style={cardRow}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{u.username}</div>
                    <div style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis" }}><bdi dir="ltr">{u.email}</bdi>{u.phone && <> · <bdi dir="ltr">{u.phone}</bdi></>}</div>
                  </div>
                  <span style={pill(a.bg, a.color)}>{t(`confirm.s_${u.access}`, { defaultValue: u.access })}</span>
                </div>
                {u.company && <div style={{ fontSize: 12, color: "#475569" }}>{t("confirm.company")}: <b>{u.company.name}</b> ({u.company.role})</div>}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{accessActions(u)}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Confirmation companies ── */}
      <section style={card}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>{t("confirm.companies_title")}</h2>
          <Tabs value={companyTab} onChange={setCompanyTab}
            options={[["pending", t("confirm.c_pending")], ["approved", t("confirm.c_approved")], ["suspended", t("confirm.c_suspended")], ["", t("status.all")]]} />
        </div>
        <div className="cf-table" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>{t("confirm.company")}</th><th style={th}>{t("stores.owner")}</th><th style={th}>{t("confirm.commission")}</th><th style={th}>{t("stores.created")}</th><th style={th}>{t("stores.status")}</th><th style={th}></th></tr></thead>
            <tbody>
              {companies === null ? loading(6) : companies.length === 0 ? empty(6) : companies.map((c) => {
                const st = COMPANY[c.status] ?? { bg: "#f1f5f9", color: "#64748b" };
                return (
                  <tr key={c.id}>
                    <td style={td}>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}><bdi dir="ltr">{c.phone}</bdi>{c.wilaya ? ` · ${c.wilaya.name}` : ""}</div>
                    </td>
                    <td style={td}><div>{c.owner?.username}</div><div style={{ fontSize: 12, color: "#64748b" }}><bdi dir="ltr">{c.owner?.email}</bdi></div></td>
                    <td style={td}>{t("confirm.commission_value", { n: c.commissionPerDelivered })}</td>
                    <td style={td}><bdi dir="ltr">{fmt(c.createdAt)}</bdi></td>
                    <td style={td}><span style={pill(st.bg, st.color)}>{t(`confirm.c_${c.status}`, { defaultValue: c.status })}</span></td>
                    <td style={{ ...td, textAlign: "end" }}>{companyActions(c)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="cf-cards">
          {companies === null ? <p style={cardMsg}>{t("common.loading")}</p> : companies.length === 0 ? <p style={cardMsg}>{t("confirm.nothing")}</p> : companies.map((c) => {
            const st = COMPANY[c.status] ?? { bg: "#f1f5f9", color: "#64748b" };
            return (
              <div key={c.id} style={cardRow}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}><bdi dir="ltr">{c.phone}</bdi>{c.wilaya ? ` · ${c.wilaya.name}` : ""}</div>
                  </div>
                  <span style={pill(st.bg, st.color)}>{t(`confirm.c_${c.status}`, { defaultValue: c.status })}</span>
                </div>
                <div style={{ fontSize: 12, color: "#475569" }}>
                  {t("stores.owner")}: <b>{c.owner?.username ?? "—"}</b> · {t("confirm.commission_value", { n: c.commissionPerDelivered })} · <bdi dir="ltr">{fmt(c.createdAt)}</bdi>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{companyActions(c)}</div>
              </div>
            );
          })}
        </div>
      </section>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
