import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Search, Download, Loader2, AlertTriangle, CheckCircle2, Wallet } from "lucide-react";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// السجل المالي للتجار: كل حركة محفظة بالرصيد قبل وبعد ومن قام بها (لا يُعدَّل ولا يُحذف)،
// تنزيل CSV لأي شهر، وقائمة المحافظ غير المتطابقة. الأرشيف الليلي في دلو R2 خاص.

const TYPE_AR = {
  top_up: "شحن المحفظة", refund: "استرجاع", plan_subscription: "اشتراك في خطة", plan_upgrade: "ترقية الخطة",
  sell_theme: "شراء ثيم", confirmation_fee: "عمولة التأكيد", confirmation_earning: "أرباح التأكيد",
  custom_theme: "ثيم خاص", custom_theme_revisions: "مراجعات الثيم الخاص", store_fee: "رسوم المتجر", opening_balance: "رصيد افتتاحي",
};
const ACTOR_AR = { merchant: "التاجر", team: "عضو الفريق", admin: "الأدمن", support: "الدعم", system: "النظام" };
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14 };
const inp = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, outline: "none" };
const errMsg = (e) => { const m = e?.response?.data?.message; return (Array.isArray(m) ? m[0] : m) || e?.message || "Error"; };
const thisMonth = () => new Date(Date.now() + 3600_000).toISOString().slice(0, 7); // توقيت الجزائر
const fmt = (n) => Number(n).toLocaleString("fr-DZ", { maximumFractionDigits: 2 });
const when = (d) => new Date(d).toLocaleString("fr-DZ", { timeZone: "Africa/Algiers", dateStyle: "short", timeStyle: "short" });

export default function LedgerPage() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [month, setMonth] = useState(thisMonth());
  const [rows, setRows] = useState(null);
  const [mismatches, setMismatches] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { api.get("admin/ledger/mismatches").then((r) => setMismatches(r.data ?? [])).catch((e) => setError(errMsg(e))); }, []);

  useEffect(() => {
    if (q.trim().length < 2) { setUsers([]); return undefined; }
    const t = setTimeout(() => {
      api.get("admin/users/search", { params: { q: q.trim(), limit: 8 } }).then((r) => setUsers(r.data?.data ?? [])).catch(() => setUsers([]));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    if (!user) return;
    setRows(null); setError(null);
    try { const r = await api.get(`admin/ledger/${user.id}`, { params: { month } }); setRows(r.data ?? []); }
    catch (e) { setError(errMsg(e)); setRows([]); }
  }, [user, month]);
  useEffect(() => { load(); }, [load]);

  const download = async () => {
    try {
      const r = await api.get(`admin/ledger/${user.id}/csv`, { params: { month }, responseType: "blob" });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a");
      a.href = url; a.download = `ledger-${user.email || user.id}-${month}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setError(errMsg(e)); }
  };

  return (
    <div style={{ padding: 24 }} dir="rtl">
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}><Wallet size={22} color="#2563eb" /> السجل المالي</h1>
      <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 16px" }}>كل حركة في محفظة التاجر بالرصيد قبل وبعد ومن قام بها — لا تُعدَّل ولا تُحذف. نسخة CSV شهرية تُحفظ كل ليلة في دلو R2 خاص.</p>

      {/* المحافظ غير المتطابقة */}
      <div style={{ ...card, padding: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 10, background: mismatches?.length ? "#fef2f2" : "#f0fdf4", borderColor: mismatches?.length ? "#fecaca" : "#bbf7d0" }}>
        {mismatches === null ? <Loader2 size={16} className="animate-spin" />
          : mismatches.length ? <AlertTriangle size={18} color="#dc2626" /> : <CheckCircle2 size={18} color="#16a34a" />}
        <span style={{ fontSize: 13, fontWeight: 700 }}>
          {mismatches === null ? "فحص التطابق…" : mismatches.length ? `${mismatches.length} محفظة رصيدها لا يساوي آخر حركة في السجل` : "كل المحافظ متطابقة مع السجل"}
        </span>
      </div>
      {mismatches?.length > 0 && (
        <div style={{ ...card, padding: 12, marginBottom: 16, fontSize: 12 }}>
          {mismatches.slice(0, 30).map((m) => (
            <div key={m.userId} style={{ display: "flex", gap: 12, padding: "4px 0" }}>
              <code dir="ltr">{m.userId}</code><span>الرصيد: {fmt(m.balance)}</span><span>السجل: {m.ledger === null ? "—" : fmt(m.ledger)}</span>
              <button onClick={() => setUser({ id: m.userId })} style={{ border: "none", background: "none", color: "#2563eb", cursor: "pointer", fontWeight: 700 }}>عرض</button>
            </div>
          ))}
        </div>
      )}

      {/* اختيار التاجر والشهر */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ position: "relative", width: 320 }}>
          <Search size={15} style={{ position: "absolute", top: 11, right: 10, color: "#94a3b8" }} />
          <input style={{ ...inp, width: "100%", paddingRight: 32, boxSizing: "border-box" }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن تاجر بالاسم أو البريد…" />
          {users.length > 0 && (
            <div style={{ ...card, position: "absolute", top: 42, insetInline: 0, zIndex: 10, padding: 4, boxShadow: "0 8px 24px rgba(0,0,0,.08)" }}>
              {users.map((u) => (
                <button key={u.id} onClick={() => { setUser(u); setUsers([]); setQ(u.email || u.username); }}
                  style={{ display: "block", width: "100%", textAlign: "right", padding: "8px 10px", border: "none", background: "none", cursor: "pointer", borderRadius: 8, fontSize: 13 }}>
                  <b>{u.username}</b> <span dir="ltr" style={{ color: "#64748b" }}>{u.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={inp} />
        {user && <button onClick={download} style={{ ...inp, display: "inline-flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}><Download size={15} /> تنزيل CSV</button>}
      </div>

      {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}

      <div style={{ ...card, overflowX: "auto" }}>
        {!user ? <p style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>اختر تاجراً لعرض سجله المالي</p>
          : rows === null ? <div style={{ padding: 30, textAlign: "center" }}><Loader2 className="animate-spin" /></div>
          : !rows.length ? <p style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>لا حركات في هذا الشهر</p>
          : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ color: "#64748b", textAlign: "right" }}>
                {["التاريخ", "العملية", "المبلغ", "قبل", "بعد", "السبب", "المرجع", "من قام بها"].map((h) => <th key={h} style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f0" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>{when(r.createdAt)}</td>
                    <td style={{ padding: "8px 12px" }}>{TYPE_AR[r.type] ?? r.type}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 800, color: r.direction === "SUB" ? "#dc2626" : "#16a34a" }} dir="ltr">{r.direction === "SUB" ? "-" : "+"}{fmt(r.amount)}</td>
                    <td style={{ padding: "8px 12px" }}>{fmt(r.balanceBefore)}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 700 }}>{fmt(r.balanceAfter)}</td>
                    <td style={{ padding: "8px 12px", color: "#475569" }}>{r.reason ?? "—"}</td>
                    <td style={{ padding: "8px 12px", color: "#94a3b8", fontFamily: "monospace", fontSize: 11 }} dir="ltr">{r.reference ?? "—"}</td>
                    <td style={{ padding: "8px 12px" }}>{ACTOR_AR[r.actorType] ?? r.actorType}{r.actorName ? ` (${r.actorName})` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
