import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Globe2, Plus, Upload, Search, X, Pencil, Loader2, Trash2 } from "lucide-react";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// المواقع (خدمة mdstore-locations): الدول ← المناطق (ولايات) ← البلديات.
// الحفظ يكتب بيانات الخدمة في R2 ويزامن جدولي wilayas/communes في المنصة (إضافة/تحديث بلا حذف).
// أرقام المناطق والبلديات فريدة عبر كل الدول: الجزائر بأرقامها، وغيرها برمز ISO الرقمي (تونس 788 ← 788011 / 78801101).

const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14 };
const input = { width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" };
const btn = (bg = "#2563eb", color = "#fff") => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: "none", background: bg, color, fontSize: 13, fontWeight: 700, cursor: "pointer" });
const pill = (bg, color) => ({ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color, whiteSpace: "nowrap" });
const flag = (cc) => cc.replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
const errMsg = (e) => { const m = e?.response?.data?.message; return (Array.isArray(m) ? m[0] : m) || e?.message || "Error"; };

const EMPTY_COUNTRY = {
  code: "", name: "", ar_name: "", fr_name: "", currency: "", phone_prefix: "+", phone_pattern: "",
  levels: { region: { ar: "الولاية", fr: "", en: "" }, locality: { ar: "البلدية", fr: "", en: "" } }, active: false,
};

function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,.45)" }} />
      <div style={{ ...card, position: "relative", width: "100%", maxWidth: width, maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #e2e8f0" }}>
          <b style={{ fontSize: 15 }}>{title}</b>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b" }}><X size={18} /></button>
        </div>
        <div style={{ padding: 18, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <label style={{ display: "block", marginBottom: 10 }}>
    <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>{label}</span>
    {children}
  </label>
);

function CountryForm({ initial, onSave, onClose }) {
  const [c, setC] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setC((x) => ({ ...x, [k]: v }));
  const setLevel = (lvl, lang, v) => setC((x) => ({ ...x, levels: { ...x.levels, [lvl]: { ...x.levels[lvl], [lang]: v } } }));
  const isNew = !initial.code;
  const submit = async () => {
    setBusy(true); setError(null);
    try {
      const body = { ...c, code: c.code.toUpperCase(), currency: c.currency.toUpperCase() };
      if (!body.fr_name) delete body.fr_name;
      if (!body.phone_pattern) delete body.phone_pattern;
      await onSave(body);
      onClose();
    } catch (e) { setError(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <Modal title={isNew ? "New country" : `Edit ${initial.code}`} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <Field label="Code (ISO-2)"><input style={input} value={c.code} disabled={!isNew} maxLength={2} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="MA" /></Field>
        <Field label="Currency (ISO-3)"><input style={input} value={c.currency} maxLength={3} onChange={(e) => set("currency", e.target.value.toUpperCase())} placeholder="MAD" /></Field>
        <Field label="Name (EN)"><input style={input} value={c.name} onChange={(e) => set("name", e.target.value)} placeholder="Morocco" /></Field>
        <Field label="الاسم (AR)"><input style={{ ...input, direction: "rtl" }} value={c.ar_name} onChange={(e) => set("ar_name", e.target.value)} placeholder="المغرب" /></Field>
        <Field label="Nom (FR)"><input style={input} value={c.fr_name || ""} onChange={(e) => set("fr_name", e.target.value)} placeholder="Maroc" /></Field>
        <Field label="Phone prefix"><input style={input} value={c.phone_prefix} onChange={(e) => set("phone_prefix", e.target.value)} placeholder="+212" /></Field>
        <div style={{ gridColumn: "1 / -1" }}><Field label="Phone pattern (regex, local number)"><input style={{ ...input, fontFamily: "monospace" }} value={c.phone_pattern || ""} onChange={(e) => set("phone_pattern", e.target.value)} placeholder="^0[67]\d{8}$" /></Field></div>
        {["region", "locality"].map((lvl) => (
          <div key={lvl} style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {["ar", "fr", "en"].map((lang) => (
              <Field key={lang} label={`${lvl === "region" ? "Region" : "Locality"} name (${lang})`}>
                <input style={{ ...input, direction: lang === "ar" ? "rtl" : "ltr" }} value={c.levels[lvl][lang] || ""} onChange={(e) => setLevel(lvl, lang, e.target.value)} />
              </Field>
            ))}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 14px" }}>{isNew ? "New countries start stopped — activate them from the list once their regions are added." : "Activate / stop the country with the switch in the list."}</p>
      {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 10 }}>{error}</p>}
      <button onClick={submit} disabled={busy} style={btn()}>{busy && <Loader2 size={14} className="animate-spin" />} Save</button>
    </Modal>
  );
}

function RegionForm({ country, initial, onSave, onClose }) {
  const [r, setR] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const setLoc = (i, k, v) => setR((x) => ({ ...x, localities: x.localities.map((l, j) => (j === i ? { ...l, [k]: v } : l)) }));
  const nextId = () => Math.max(Number(r.id) * 100, ...r.localities.map((l) => Number(l.id) || 0)) + 1;
  const submit = async () => {
    setBusy(true); setError(null);
    try {
      const region = {
        id: Number(r.id), name: r.name, ar_name: r.ar_name, ...(r.code ? { code: r.code } : {}),
        localities: r.localities.map((l) => ({ id: Number(l.id), name: l.name, ar_name: l.ar_name, ...(l.post_code ? { post_code: String(l.post_code) } : {}) })),
      };
      await onSave(region);
      onClose();
    } catch (e) { setError(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <Modal title={initial.name ? `${country} · ${initial.name}` : `${country} · New region`} onClose={onClose} width={760}>
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 120px", gap: 10 }}>
        <Field label="ID"><input style={input} type="number" value={r.id} disabled={!!initial.name} onChange={(e) => setR({ ...r, id: e.target.value })} /></Field>
        <Field label="Name"><input style={input} value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} /></Field>
        <Field label="الاسم"><input style={{ ...input, direction: "rtl" }} value={r.ar_name} onChange={(e) => setR({ ...r, ar_name: e.target.value })} /></Field>
        <Field label="Code"><input style={input} value={r.code || ""} onChange={(e) => setR({ ...r, code: e.target.value })} placeholder={`${country}-…`} /></Field>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "6px 0 8px" }}>
        <b style={{ fontSize: 13 }}>Localities ({r.localities.length})</b>
        <button onClick={() => setR({ ...r, localities: [...r.localities, { id: nextId(), name: "", ar_name: "", post_code: "" }] })} style={btn("#eff6ff", "#2563eb")}><Plus size={14} /> Add</button>
      </div>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, maxHeight: 340, overflowY: "auto" }}>
        {r.localities.map((l, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr 90px 32px", gap: 6, padding: 6, borderBottom: "1px solid #f1f5f9" }}>
            <input style={input} type="number" value={l.id} onChange={(e) => setLoc(i, "id", e.target.value)} />
            <input style={input} value={l.name} placeholder="Name" onChange={(e) => setLoc(i, "name", e.target.value)} />
            <input style={{ ...input, direction: "rtl" }} value={l.ar_name} placeholder="الاسم" onChange={(e) => setLoc(i, "ar_name", e.target.value)} />
            <input style={input} value={l.post_code || ""} placeholder="Post" onChange={(e) => setLoc(i, "post_code", e.target.value)} />
            <button onClick={() => setR({ ...r, localities: r.localities.filter((_, j) => j !== i) })} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "#64748b", margin: "10px 0" }}>Removed localities disappear from the service but stay in the platform tables (existing orders keep their address).</p>
      {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 10 }}>{error}</p>}
      <button onClick={submit} disabled={busy} style={btn()}>{busy && <Loader2 size={14} className="animate-spin" />} Save region</button>
    </Modal>
  );
}

export default function LocationsAdmin() {
  const [countries, setCountries] = useState([]);
  const [shippable, setShippable] = useState([]);
  const [selected, setSelected] = useState("DZ");
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [countryModal, setCountryModal] = useState(null);
  const [regionModal, setRegionModal] = useState(null);
  const [toast, setToast] = useState(null);

  const say = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const loadCountries = useCallback(async () => {
    try {
      const [{ data }, ship] = await Promise.all([api.get("/admin/locations/countries"), api.get("/shipping/countries").catch(() => ({ data: [] }))]);
      setCountries(data || []); setShippable(ship.data || []);
    } catch (e) { say(errMsg(e), "error"); }
  }, []);

  const loadRegions = useCallback(async (cc) => {
    setLoading(true);
    try { const { data } = await api.get(`/admin/locations/countries/${cc}/regions`); setRegions(data || []); }
    catch (e) { setRegions([]); say(errMsg(e), "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCountries(); }, [loadCountries]);
  useEffect(() => { if (selected) loadRegions(selected); }, [selected, loadRegions]);

  const country = countries.find((c) => c.code === selected);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? regions.filter((r) => r.name.toLowerCase().includes(s) || (r.ar_name || "").includes(q.trim()) || String(r.id).includes(s)) : regions;
  }, [regions, q]);

  const [togglingCode, setTogglingCode] = useState(null);
  const toggleActive = async (c) => {
    if (c.code === "DZ") return;
    setTogglingCode(c.code);
    try {
      const { localities_count: _l, regions_count: _r, ...meta } = c;
      await api.post("/admin/locations/countries", { ...EMPTY_COUNTRY, ...meta, active: !c.active, ...(meta.fr_name ? {} : { fr_name: undefined }), ...(meta.phone_pattern ? {} : { phone_pattern: undefined }) });
      await loadCountries();
      say(`${c.code} ${c.active ? "stopped" : "activated"}`);
    } catch (e) { say(errMsg(e), "error"); } finally { setTogglingCode(null); }
  };

  const saveCountry = async (body) => {
    await api.post("/admin/locations/countries", body);
    await loadCountries(); setSelected(body.code); say(`${body.code} saved`);
  };
  const saveRegion = async (region) => {
    const { data } = await api.post(`/admin/locations/countries/${selected}/region`, { region });
    await Promise.all([loadRegions(selected), loadCountries()]);
    say(`${data.created ? "Added" : "Updated"} region ${region.id} · ${data.localities} localities in ${selected}`);
  };
  const openRegion = async (r) => {
    try { const { data } = await api.get(`/admin/locations/countries/${selected}/regions`, { params: { regionId: r.id } }); setRegionModal(data); }
    catch (e) { say(errMsg(e), "error"); }
  };
  const importJson = (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result);
        const cc = (json.country || selected).toUpperCase();
        if (!window.confirm(`Replace ALL regions of ${cc} with ${json.regions?.length ?? 0} regions from this file?`)) return;
        const { data } = await api.post(`/admin/locations/countries/${cc}/regions`, { regions: json.regions });
        await Promise.all([loadRegions(cc), loadCountries()]); setSelected(cc);
        say(`${cc}: ${data.regions} regions, ${data.localities} localities imported`);
      } catch (e) { say(errMsg(e), "error"); }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Globe2 size={22} color="#2563eb" />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Locations</h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Countries → regions → localities (mdstore-locations). Saving syncs the platform tables.</p>
          </div>
        </div>
        <button onClick={() => setCountryModal(EMPTY_COUNTRY)} style={btn()}><Plus size={15} /> New country</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ ...card, overflow: "hidden" }}>
          {countries.map((c) => (
            <div key={c.code} onClick={() => setSelected(c.code)}
              style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: selected === c.code ? "#eff6ff" : "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{flag(c.code)}</span>
                <b style={{ fontSize: 14 }}>{c.name}</b>
                <span style={{ fontSize: 13, color: "#64748b" }}>{c.ar_name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 8 }}>
                <span style={pill("#f1f5f9", "#475569")}>{c.code} · {c.currency} · {c.phone_prefix}</span>
                {/* حالة واحدة: مفعّلة = متاحة للتجار (حسابات الشحن والمتجر)، متوقفة = مخفية — الجزائر دائماً مفعّلة */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleActive(c); }}
                  disabled={c.code === "DZ" || togglingCode === c.code}
                  title={c.code === "DZ" ? "Algeria is always available" : c.active ? "Stop this country" : "Activate this country"}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", background: "none", cursor: c.code === "DZ" ? "default" : "pointer", padding: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.active || c.code === "DZ" ? "#16a34a" : "#b45309" }}>{c.active || c.code === "DZ" ? "Active" : "Stopped"}</span>
                  <span style={{ position: "relative", width: 34, height: 20, borderRadius: 10, background: c.active || c.code === "DZ" ? "#22c55e" : "#cbd5e1", opacity: c.code === "DZ" ? 0.6 : 1 }}>
                    <span style={{ position: "absolute", top: 3, left: c.active || c.code === "DZ" ? 17 : 3, width: 14, height: 14, borderRadius: 7, background: "#fff", transition: "left .15s" }} />
                  </span>
                </button>
              </div>
              {!shippable.includes(c.code) && c.active && c.code !== "DZ" && regions.length === 0 && selected === c.code && (
                <p style={{ fontSize: 11, color: "#b45309", margin: "6px 0 0" }}>No regions yet — add them (Region / Import JSON) before merchants can use it.</p>
              )}
            </div>
          ))}
          {!countries.length && <p style={{ padding: 14, fontSize: 13, color: "#64748b" }}>No countries</p>}
        </div>

        <div style={{ ...card, padding: 16 }}>
          {country && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <div>
                <b style={{ fontSize: 16 }}>{flag(country.code)} {country.name}</b>
                <span style={{ fontSize: 13, color: "#64748b", marginInlineStart: 8 }}>{regions.length} {country.levels?.region?.en || "regions"} · {regions.reduce((n, r) => n + (r.localities_count || 0), 0)} {country.levels?.locality?.en || "localities"}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setCountryModal({ ...EMPTY_COUNTRY, ...country })} style={btn("#f1f5f9", "#0f172a")}><Pencil size={14} /> Edit country</button>
                <label style={btn("#f1f5f9", "#0f172a")}><Upload size={14} /> Import JSON
                  <input type="file" accept="application/json" hidden onChange={(e) => { if (e.target.files?.[0]) importJson(e.target.files[0]); e.target.value = ""; }} />
                </label>
                <button onClick={() => setRegionModal({ id: "", name: "", ar_name: "", code: "", localities: [] })} style={btn()}><Plus size={14} /> Region</button>
              </div>
            </div>
          )}
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Search size={15} style={{ position: "absolute", top: 10, left: 10, color: "#94a3b8" }} />
            <input style={{ ...input, paddingLeft: 32 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search regions…" />
          </div>
          {loading ? <div style={{ padding: 30, textAlign: "center" }}><Loader2 className="animate-spin" /></div> : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ textAlign: "left", color: "#64748b" }}>
                {["ID", "Code", "Name", "الاسم", "Localities", ""].map((h) => <th key={h} style={{ padding: "8px 6px", borderBottom: "1px solid #e2e8f0" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "7px 6px", fontFamily: "monospace" }}>{r.id}</td>
                    <td style={{ padding: "7px 6px" }}>{r.code}</td>
                    <td style={{ padding: "7px 6px", fontWeight: 600 }}>{r.name}</td>
                    <td style={{ padding: "7px 6px", direction: "rtl", textAlign: "left" }}>{r.ar_name}</td>
                    <td style={{ padding: "7px 6px" }}>{r.localities_count}</td>
                    <td style={{ padding: "7px 6px", textAlign: "right" }}>
                      <button onClick={() => openRegion(r)} style={btn("#eff6ff", "#2563eb")}><Pencil size={13} /> Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {countryModal && <CountryForm initial={countryModal} onSave={saveCountry} onClose={() => setCountryModal(null)} />}
      {regionModal && <RegionForm country={selected} initial={regionModal} onSave={saveRegion} onClose={() => setRegionModal(null)} />}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, padding: "12px 18px", background: toast.type === "error" ? "#ef4444" : "#22c55e", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
