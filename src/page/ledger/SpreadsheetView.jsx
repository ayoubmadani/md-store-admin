import { useMemo, useState } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { colName } from "../../lib/csv";

// عرض ملف CSV مثل Excel: أحرف الأعمدة (A، B…) وأرقام الأسطر، رأس ثابت، ترتيب بالنقر على العمود،
// بحث في كل الخانات، وسطر مجاميع للأعمدة الرقمية (المبلغ بإشارته + أو -).
const border = "1px solid #d4d4d8";
const asNumber = (v) => {
  const t = String(v ?? "").replace(/\s/g, "").replace(",", ".");
  return /^[+-]?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
};

// sumHeaders: أسماء الأعمدة التي تُجمع (مثل «المبلغ»)؛ بدونها تُجمع كل الأعمدة الرقمية
export default function SpreadsheetView({ rows, sumHeaders = null }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(null); // { col, dir }
  const header = rows[0] ?? [];
  const body = rows.slice(1);
  const width = Math.max(header.length, ...body.map((r) => r.length));

  const numericCols = useMemo(() => {
    const out = new Set();
    for (let c = 0; c < width; c++) {
      const vals = body.map((r) => r[c]).filter((v) => v !== undefined && v !== "");
      if (vals.length && vals.every((v) => asNumber(v) !== null)) out.add(c);
    }
    return out;
  }, [body, width]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = body.map((r, i) => ({ r, n: i + 2 })); // رقم السطر الأصلي كما في Excel (1 = الرأس)
    if (s) list = list.filter(({ r }) => r.some((v) => String(v).toLowerCase().includes(s)));
    if (sort) {
      list = [...list].sort((a, b) => {
        const x = a.r[sort.col] ?? ""; const y = b.r[sort.col] ?? "";
        const nx = asNumber(x); const ny = asNumber(y);
        const cmp = nx !== null && ny !== null ? nx - ny : String(x).localeCompare(String(y), "ar");
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [body, q, sort]);

  const totals = useMemo(() => {
    const t = {};
    for (const c of numericCols) if (!sumHeaders || sumHeaders.includes(header[c])) t[c] = shown.reduce((sum, { r }) => sum + (asNumber(r[c]) ?? 0), 0);
    return t;
  }, [shown, numericCols]);

  const toggleSort = (col) => setSort((s) => (s?.col !== col ? { col, dir: "asc" } : s.dir === "asc" ? { col, dir: "desc" } : null));
  const cell = { border, padding: "5px 9px", whiteSpace: "nowrap", fontSize: 12.5 };
  const gutter = { ...cell, background: "#f4f4f5", color: "#71717a", textAlign: "center", fontWeight: 600, position: "sticky", right: 0, zIndex: 1, minWidth: 38 };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderBottom: border, background: "#fafafa" }}>
        <div style={{ position: "relative", width: 260 }}>
          <Search size={14} style={{ position: "absolute", top: 9, right: 9, color: "#a1a1aa" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في الخانات…"
            style={{ width: "100%", boxSizing: "border-box", padding: "6px 30px 6px 10px", border, borderRadius: 6, fontSize: 12.5, outline: "none" }} />
        </div>
        <span style={{ fontSize: 12, color: "#71717a" }}>{shown.length} سطر{q ? ` من ${body.length}` : ""} · {width} أعمدة</span>
      </div>
      <div style={{ overflow: "auto", maxHeight: "65vh" }}>
        <table style={{ borderCollapse: "collapse", minWidth: "100%", background: "#fff" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
            <tr>
              <th style={{ ...gutter, zIndex: 3 }} />
              {Array.from({ length: width }, (_, c) => (
                <th key={c} style={{ ...cell, background: "#f4f4f5", color: "#71717a", fontWeight: 600, textAlign: "center" }}>{colName(c)}</th>
              ))}
            </tr>
            <tr>
              <th style={{ ...gutter, zIndex: 3 }}>1</th>
              {Array.from({ length: width }, (_, c) => (
                <th key={c} onClick={() => toggleSort(c)} title="ترتيب"
                  style={{ ...cell, background: "#e0f2fe", color: "#0c4a6e", fontWeight: 800, textAlign: "right", cursor: "pointer", userSelect: "none" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {header[c] ?? ""}
                    {sort?.col === c ? (sort.dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} style={{ opacity: 0.35 }} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map(({ r, n }) => (
              <tr key={n}>
                <td style={gutter}>{n}</td>
                {Array.from({ length: width }, (_, c) => {
                  const v = r[c] ?? "";
                  const num = numericCols.has(c) ? asNumber(v) : null;
                  return (
                    <td key={c} dir={num !== null ? "ltr" : "auto"}
                      style={{ ...cell, textAlign: num !== null ? "left" : "right", color: num !== null && String(v).startsWith("-") ? "#dc2626" : num !== null && String(v).startsWith("+") ? "#16a34a" : "#18181b" }}>
                      {v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {numericCols.size > 0 && shown.length > 0 && (
            <tfoot style={{ position: "sticky", bottom: 0 }}>
              <tr>
                <td style={{ ...gutter, background: "#fef9c3" }}>Σ</td>
                {Array.from({ length: width }, (_, c) => (
                  <td key={c} dir="ltr" style={{ ...cell, background: "#fef9c3", fontWeight: 800, textAlign: "left" }}>
                    {c in totals ? Math.round(totals[c] * 100) / 100 : c === 0 ? "المجموع" : ""}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
