import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Folder, FolderPlus, Upload, Copy, Trash2, Pencil, ChevronLeft, Home, Loader2, MoveRight, X, Check, Image as ImageIcon } from "lucide-react";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// مدير ملفات الأدمن (منفصل عن ملفات المتاجر): مجلدات داخل مجلدات، رفع صور إلى المجلد الحالي، نقل، نسخ الرابط.
// المجلدات افتراضية: إعادة التسمية والنقل لا تغيّر روابط الصور.

const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14 };
const btn = (bg = "#2563eb", color = "#fff") => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: "none", background: bg, color, fontSize: 13, fontWeight: 700, cursor: "pointer" });
const iconBtn = { cursor: "pointer", padding: 6, background: "rgba(255,255,255,.92)", border: "1px solid #e2e8f0", borderRadius: 8, display: "flex", color: "#64748b" };
const errMsg = (e) => { const m = e?.response?.data?.message; return (Array.isArray(m) ? m[0] : m) || e?.message || "Error"; };
const fmtSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export default function ImageAdminPage() {
  const [folderId, setFolderId] = useState(null);
  const [data, setData] = useState({ path: [], folders: [], files: [] });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [moving, setMoving] = useState(null); // { ids } أو { folder }
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);

  const say = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async (id = folderId) => {
    setLoading(true);
    try {
      const { data: d } = await api.get("admin-files", { params: { folderId: id || "root" } });
      setData(d);
      setSelected(new Set());
    } catch (e) { say(errMsg(e), "error"); } finally { setLoading(false); }
  }, [folderId]);

  useEffect(() => { load(folderId); }, [folderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const upload = async (list) => {
    const files = [...(list || [])].filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    setUploading(true);
    try {
      await api.post("admin-files/upload", form, { params: { folderId: folderId || "root" }, headers: { "Content-Type": "multipart/form-data" } });
      say(`تم رفع ${files.length} صورة`);
      load();
    } catch (e) { say(errMsg(e), "error"); } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const newFolder = async () => {
    const name = window.prompt("اسم المجلد الجديد");
    if (!name?.trim()) return;
    try { await api.post("admin-files/folders", { name, parentId: folderId }); load(); } catch (e) { say(errMsg(e), "error"); }
  };
  const renameFolder = async (f) => {
    const name = window.prompt("الاسم الجديد", f.name);
    if (!name?.trim() || name === f.name) return;
    try { await api.patch(`admin-files/folders/${f.id}`, { name }); load(); } catch (e) { say(errMsg(e), "error"); }
  };
  const deleteFolder = async (f) => {
    if (!window.confirm(`حذف المجلد «${f.name}»؟ (يجب أن يكون فارغاً)`)) return;
    try { await api.delete(`admin-files/folders/${f.id}`); load(); } catch (e) { say(errMsg(e), "error"); }
  };
  const deleteFile = async (img) => {
    if (!window.confirm("حذف هذه الصورة نهائياً؟ إن كانت مستعملة في مكان ما ستختفي منه.")) return;
    try { await api.delete(`admin-images/${img.id}`); load(); } catch (e) { say(errMsg(e), "error"); }
  };
  const copy = (url) => { navigator.clipboard.writeText(url); say("تم نسخ الرابط"); };
  const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="m-pad" style={{ padding: 24 }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 }}>ملفات الأدمن</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>مجلدات وصور خاصة بالأدمن — منفصلة عن ملفات المتاجر. اسحب الصور إلى الصفحة لرفعها هنا.</p>
        </div>
        <div className="m-wrap" style={{ display: "flex", gap: 8 }}>
          {selected.size > 0 && <button onClick={() => setMoving({ ids: [...selected] })} style={btn("#f1f5f9", "#0f172a")}><MoveRight size={15} /> نقل ({selected.size})</button>}
          <button onClick={newFolder} style={btn("#f1f5f9", "#0f172a")}><FolderPlus size={15} /> مجلد جديد</button>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={btn(uploading ? "#94a3b8" : "#2563eb")}>
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} {uploading ? "جاري الرفع…" : "رفع صور"}
          </button>
          <input ref={fileRef} type="file" multiple hidden accept="image/*" onChange={(e) => upload(e.target.files)} />
        </div>
      </div>

      {/* المسار */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", fontSize: 13, marginBottom: 14 }}>
        <button onClick={() => setFolderId(null)} style={{ ...btn(folderId ? "transparent" : "#eff6ff", "#2563eb"), padding: "5px 9px" }}><Home size={14} /> الجذر</button>
        {data.path.map((f) => (
          <span key={f.id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <ChevronLeft size={14} color="#94a3b8" />
            <button onClick={() => setFolderId(f.id)} style={{ ...btn(f.id === folderId ? "#eff6ff" : "transparent", "#2563eb"), padding: "5px 9px" }}>{f.name}</button>
          </span>
        ))}
      </div>

      <div style={{ ...card, padding: 16, outline: dragOver ? "2px dashed #2563eb" : "none", minHeight: 300 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 50 }}><Loader2 className="animate-spin" color="#94a3b8" /></div>
        ) : !data.folders.length && !data.files.length ? (
          <div style={{ textAlign: "center", padding: 70, color: "#64748b" }}>
            <ImageIcon size={30} color="#cbd5e1" />
            <p style={{ marginTop: 10 }}>المجلد فارغ — أنشئ مجلداً أو اسحب الصور هنا</p>
          </div>
        ) : (
          <>
            {data.folders.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10, marginBottom: 18 }}>
                {data.folders.map((f) => (
                  <div key={f.id} onDoubleClick={() => setFolderId(f.id)} style={{ ...card, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setFolderId(f.id)}>
                    <Folder size={20} color="#f59e0b" fill="#fde68a" />
                    <span style={{ flex: 1, fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                    <button title="إعادة التسمية" onClick={(e) => { e.stopPropagation(); renameFolder(f); }} style={{ ...iconBtn, padding: 4 }}><Pencil size={12} /></button>
                    <button title="نقل" onClick={(e) => { e.stopPropagation(); setMoving({ folder: f }); }} style={{ ...iconBtn, padding: 4 }}><MoveRight size={12} /></button>
                    <button title="حذف (فارغ فقط)" onClick={(e) => { e.stopPropagation(); deleteFolder(f); }} style={{ ...iconBtn, padding: 4, color: "#ef4444" }}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            {data.files.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
                {data.files.map((img) => {
                  const on = selected.has(img.id);
                  return (
                    <div key={img.id} style={{ ...card, overflow: "hidden", position: "relative", outline: on ? "2px solid #2563eb" : "none" }}>
                      <div style={{ position: "absolute", top: 8, insetInline: 8, display: "flex", justifyContent: "space-between", zIndex: 2 }}>
                        <button title="تحديد" onClick={() => toggle(img.id)} style={{ ...iconBtn, background: on ? "#2563eb" : iconBtn.background, color: on ? "#fff" : "#64748b" }}><Check size={13} /></button>
                        <span style={{ display: "flex", gap: 6 }}>
                          <button title="نسخ الرابط" onClick={() => copy(img.url)} style={iconBtn}><Copy size={13} /></button>
                          <button title="حذف" onClick={() => deleteFile(img)} style={{ ...iconBtn, color: "#ef4444" }}><X size={13} /></button>
                        </span>
                      </div>
                      <a href={img.url} target="_blank" rel="noreferrer" style={{ display: "block", height: 140, background: "#f8fafc" }}>
                        <img src={img.url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </a>
                      <div style={{ padding: "7px 10px", fontSize: 11, color: "#64748b", display: "flex", justifyContent: "space-between", gap: 6 }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} dir="ltr">{img.name || img.key?.split("/").pop()}</span>
                        <span style={{ flexShrink: 0 }}>{fmtSize(img.size || 0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {moving && <MoveModal moving={moving} onClose={() => setMoving(null)} onDone={(msg) => { setMoving(null); say(msg); load(); }} onError={(e) => say(errMsg(e), "error")} />}
      {toast && <div className="m-toast" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, padding: "12px 18px", background: toast.type === "error" ? "#ef4444" : "#22c55e", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>{toast.msg}</div>}
    </div>
  );
}

// اختيار مجلد الوجهة بالتصفح (لنقل صور محددة أو مجلد كامل)
function MoveModal({ moving, onClose, onDone, onError }) {
  const [at, setAt] = useState(null);
  const [view, setView] = useState({ path: [], folders: [] });
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get("admin-files", { params: { folderId: at || "root" } }).then((r) => setView(r.data)).catch(onError); }, [at]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = async () => {
    setBusy(true);
    try {
      if (moving.folder) await api.patch(`admin-files/folders/${moving.folder.id}`, { parentId: at });
      else await api.patch("admin-files/files/move", { ids: moving.ids, folderId: at });
      onDone("تم النقل");
    } catch (e) { onError(e); setBusy(false); }
  };

  return (
    <div className="m-sheet" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,.45)" }} />
      <div className="m-sheet-card" style={{ ...card, position: "relative", width: "100%", maxWidth: 440, padding: 18 }}>
        <b style={{ fontSize: 15 }}>نقل {moving.folder ? `المجلد «${moving.folder.name}»` : `${moving.ids.length} صورة`} إلى…</b>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", fontSize: 12, margin: "12px 0" }}>
          <button onClick={() => setAt(null)} style={{ ...btn("transparent", "#2563eb"), padding: "4px 8px" }}><Home size={13} /> الجذر</button>
          {view.path.map((f) => <span key={f.id} style={{ display: "inline-flex", alignItems: "center" }}><ChevronLeft size={13} color="#94a3b8" /><button onClick={() => setAt(f.id)} style={{ ...btn("transparent", "#2563eb"), padding: "4px 8px" }}>{f.name}</button></span>)}
        </div>
        <div style={{ maxHeight: 260, overflowY: "auto", display: "grid", gap: 6, marginBottom: 14 }}>
          {view.folders.filter((f) => f.id !== moving.folder?.id).map((f) => (
            <button key={f.id} onClick={() => setAt(f.id)} style={{ ...card, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              <Folder size={17} color="#f59e0b" fill="#fde68a" /> {f.name}
            </button>
          ))}
          {!view.folders.length && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>لا مجلدات فرعية هنا</p>}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btn("#f1f5f9", "#0f172a")}>إلغاء</button>
          <button onClick={go} disabled={busy} style={btn()}>{busy && <Loader2 size={14} className="animate-spin" />} النقل إلى هنا</button>
        </div>
      </div>
    </div>
  );
}
