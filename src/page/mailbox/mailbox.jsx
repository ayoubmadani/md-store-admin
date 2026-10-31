// البريد: عدة صناديق (IMAP) — قراءة «الوارد» والرد من نفس الصندوق. كلمات السر تبقى في الـ API (مشفرة).
// الحاسوب: القائمة بجانب الرسالة · الهاتف: القائمة ثم الرسالة في صفحة كاملة
import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Inbox, Loader2, Paperclip, Plus, RefreshCw, Reply, Search, Send, Trash2, X } from 'lucide-react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, headers: { 'Content-Type': 'application/json' } });
const errText = (e, fallback) => { const m = e?.response?.data?.message; return (Array.isArray(m) ? m[0] : m) || fallback; };
const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const person = (p) => (p ? p.name || p.address : '');
const input = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white';

function AddMailbox({ onClose, onAdded }) {
  const { t } = useTranslation();
  const [f, setF] = useState({ email: '', password: '', imapHost: '', imapPort: '', smtpHost: '', smtpPort: '' });
  const [advanced, setAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    const body = { email: f.email.trim(), password: f.password };
    for (const k of ['imapHost', 'smtpHost']) if (f[k].trim()) body[k] = f[k].trim();
    for (const k of ['imapPort', 'smtpPort']) if (f[k]) body[k] = Number(f[k]);
    try {
      const { data } = await api.post('/admin/mailboxes', body);
      onAdded(data);
    } catch (err) {
      setError(errText(err, t('mail.add_failed')));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:p-4" onClick={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <form onSubmit={submit} className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-900">{t('mail.add')}</p>
          <button type="button" onClick={onClose} className="text-gray-400"><X size={18} /></button>
        </div>
        <input type="email" required dir="ltr" autoComplete="off" value={f.email} onChange={set('email')} placeholder="support@mdstore.top" className={input} />
        <input type="password" required dir="ltr" autoComplete="new-password" value={f.password} onChange={set('password')} placeholder={t('mail.password')} className={input} />
        <p className="text-xs text-gray-400">{t('mail.servers_hint')}</p>
        <button type="button" onClick={() => setAdvanced((a) => !a)} className="text-xs font-bold text-blue-600">{t('mail.advanced')}</button>
        {advanced && (
          <div className="grid grid-cols-3 gap-2" dir="ltr">
            <input value={f.imapHost} onChange={set('imapHost')} placeholder="imap.hostinger.com" className={`${input} col-span-2`} />
            <input type="number" value={f.imapPort} onChange={set('imapPort')} placeholder="993" className={input} />
            <input value={f.smtpHost} onChange={set('smtpHost')} placeholder="smtp.hostinger.com" className={`${input} col-span-2`} />
            <input type="number" value={f.smtpPort} onChange={set('smtpPort')} placeholder="465" className={input} />
          </div>
        )}
        {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
        <button disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl disabled:opacity-60">
          {saving && <Loader2 size={15} className="animate-spin" />}{saving ? t('mail.checking') : t('mail.add')}
        </button>
      </form>
    </div>
  );
}

function Reader({ box, uid, onBack, onRead }) {
  const { t } = useTranslation();
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setMsg(null); setError(null); setReply(''); setNotice(null);
    api.get(`/admin/mailboxes/${box.id}/messages/${uid}`)
      .then(({ data }) => { setMsg(data); onRead(uid); })
      .catch((e) => setError(errText(e, t('mail.load_failed'))));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box.id, uid]);

  const download = async (a) => {
    try {
      const { data } = await api.get(`/admin/mailboxes/${box.id}/messages/${uid}/attachments/${a.index}`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const link = Object.assign(document.createElement('a'), { href: url, download: a.filename });
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setNotice({ ok: false, text: errText(e, t('mail.load_failed')) }); }
  };

  const send = async () => {
    setSending(true); setNotice(null);
    try {
      await api.post(`/admin/mailboxes/${box.id}/messages/${uid}/reply`, { body: reply });
      setReply('');
      setNotice({ ok: true, text: t('mail.sent') });
    } catch (e) {
      setNotice({ ok: false, text: errText(e, t('mail.send_failed')) });
    } finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <button type="button" onClick={onBack} className="lg:hidden p-2 -ms-2 rounded-lg text-gray-500"><span className="inline-block mail-chev"><ArrowRight size={18} /></span></button>
        <p className="font-bold text-gray-900 truncate flex-1">{msg?.subject || (error ? '' : '…')}</p>
      </div>
      {error && <p className="text-sm text-red-500 py-6 text-center">{error}</p>}
      {!msg && !error && <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>}
      {msg && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pt-3">
          <div className="text-sm space-y-0.5">
            <p><b className="text-gray-900">{person(msg.from)}</b> <bdi dir="ltr" className="text-gray-400">&lt;{msg.from?.address}&gt;</bdi></p>
            {msg.to?.length > 0 && <p className="text-xs text-gray-400">{t('mail.to')}: <bdi dir="ltr">{msg.to.map((p) => p.address).join(', ')}</bdi></p>}
            <p className="text-xs text-gray-400"><bdi dir="ltr">{fmtDate(msg.date)}</bdi></p>
          </div>
          {msg.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {msg.attachments.map((a) => (
                <button key={a.index} type="button" onClick={() => download(a)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700 max-w-full">
                  <Paperclip size={13} className="shrink-0" /><bdi dir="ltr" className="truncate">{a.filename}</bdi>
                </button>
              ))}
            </div>
          )}
          {/* HTML الرسالة في إطار معزول: لا سكربت، والروابط تُفتح في نافذة جديدة */}
          {msg.html
            ? <iframe title="mail" sandbox="allow-popups allow-popups-to-escape-sandbox" srcDoc={`<base target="_blank">${msg.html}`} className="w-full min-h-[50vh] rounded-xl border border-gray-100 bg-white" />
            : <pre dir="auto" className="whitespace-pre-wrap break-words text-sm text-gray-700 font-sans">{msg.text}</pre>}
        </div>
      )}
      {msg && (
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <textarea dir="auto" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder={t('mail.reply_ph', { to: msg.from?.address || '' })} className={`${input} resize-y`} />
          <div className="flex items-center gap-3">
            <button type="button" disabled={sending || !reply.trim()} onClick={send} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl disabled:opacity-50">
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}{t('mail.send')}
            </button>
            {notice && <span className={`text-sm font-semibold ${notice.ok ? 'text-green-600' : 'text-red-500'}`}>{notice.text}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MailboxPage() {
  const { t } = useTranslation();
  const [boxes, setBoxes] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [list, setList] = useState(null); // { items, total, hasMore, page }
  const [loadingMore, setLoadingMore] = useState(false);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [uid, setUid] = useState(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const box = boxes?.find((b) => b.id === activeId) || null;

  const loadBoxes = useCallback(() => api.get('/admin/mailboxes')
    .then(({ data }) => { setBoxes(data); setActiveId((id) => (data.some((b) => b.id === id) ? id : data[0]?.id ?? null)); })
    .catch((e) => { setBoxes([]); setError(errText(e, t('mail.load_failed'))); }), [t]);
  useEffect(() => { loadBoxes(); }, [loadBoxes]);

  const loadPage = useCallback((page) => {
    if (!activeId) return Promise.resolve();
    return api.get(`/admin/mailboxes/${activeId}/messages`, { params: { page, q: search || undefined } })
      .then(({ data }) => setList((old) => (page > 1 && old ? { ...data, items: [...old.items, ...data.items] } : data)))
      .catch((e) => { setList({ items: [], total: 0, hasMore: false, page: 1 }); setError(errText(e, t('mail.load_failed'))); });
  }, [activeId, search, t]);
  useEffect(() => { loadPage(1); }, [loadPage]);
  // تبديل الصندوق أو البحث: قائمة جديدة من الصفحة الأولى
  const reset = () => { setList(null); setUid(null); setError(null); };
  const pickBox = (id) => { if (id !== activeId) { reset(); setActiveId(id); } };

  const more = async () => { setLoadingMore(true); await loadPage((list?.page || 1) + 1); setLoadingMore(false); };
  // رسالة فُتحت: نقطة «غير مقروء» تختفي وعدد التبويب ينقص مرة واحدة فقط لكل رسالة
  const counted = useRef(new Set());
  const markRead = (u) => {
    const key = `${activeId}:${u}`;
    const wasUnseen = list?.items.some((m) => m.uid === u && !m.seen);
    setList((l) => l && { ...l, items: l.items.map((m) => (m.uid === u ? { ...m, seen: true } : m)) });
    if (!wasUnseen || counted.current.has(key)) return;
    counted.current.add(key);
    setBoxes((bs) => bs && bs.map((b) => (b.id === activeId && b.unseen > 0 ? { ...b, unseen: b.unseen - 1 } : b)));
  };
  const remove = async () => {
    if (!box || !window.confirm(t('mail.remove_confirm', { email: box.email }))) return;
    try { await api.delete(`/admin/mailboxes/${box.id}`); reset(); setActiveId(null); loadBoxes(); } catch (e) { setError(errText(e, t('mail.load_failed'))); }
  };

  return (
    <div className="space-y-4">
      <style>{'[dir="rtl"] .mail-chev{transform:scaleX(1)} [dir="ltr"] .mail-chev{transform:scaleX(-1)}'}</style>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900">{t('mail.title')}</h1>
          <p className="text-sm text-gray-400">{t('mail.subtitle')}</p>
        </div>
        <button type="button" onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shrink-0">
          <Plus size={15} /><span className="hidden sm:inline">{t('mail.add')}</span>
        </button>
      </div>

      {boxes === null ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : boxes.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-white">
          <Inbox size={28} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500 mb-4">{t('mail.empty_boxes')}</p>
          <button type="button" onClick={() => setAdding(true)} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl">{t('mail.add')}</button>
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </div>
      ) : (
        <>
          {/* تبويب لكل صندوق + عدد غير المقروء */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {boxes.map((b) => (
              <button key={b.id} type="button" onClick={() => pickBox(b.id)}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border ${b.id === activeId ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}>
                <bdi dir="ltr">{b.email}</bdi>
                {b.error ? <span className="w-2 h-2 rounded-full bg-red-500" title={t('mail.box_error')} />
                  : b.unseen > 0 && <span className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] grid place-items-center ${b.id === activeId ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>{b.unseen}</span>}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[minmax(320px,400px)_1fr] gap-4 lg:h-[calc(100dvh-260px)] lg:min-h-[480px]">
            {/* القائمة (تختفي على الهاتف عند فتح رسالة) */}
            <div className={`${uid ? 'hidden lg:flex' : 'flex'} flex-col min-h-0 bg-white border border-gray-200 rounded-2xl overflow-hidden`}>
              <div className="flex items-center gap-2 p-3 border-b border-gray-100">
                <form onSubmit={(e) => { e.preventDefault(); if (q.trim() !== search) { reset(); setSearch(q.trim()); } }} className="relative flex-1">
                  <Search size={15} className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('mail.search')} className={`${input} ps-9`} />
                </form>
                <button type="button" onClick={() => { setList(null); loadPage(1); loadBoxes(); }} title={t('common.refresh')} className="p-2 rounded-lg text-gray-400 hover:text-blue-600"><RefreshCw size={16} /></button>
                <button type="button" onClick={remove} title={t('mail.remove')} className="p-2 rounded-lg text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-100">
                {list === null && <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>}
                {list && list.items.length === 0 && <p className="text-center text-sm text-gray-400 py-12">{error || t('mail.empty')}</p>}
                {list?.items.map((m) => (
                  <button key={m.uid} type="button" onClick={() => setUid(m.uid)}
                    className={`w-full text-start px-4 py-3 hover:bg-gray-50 ${m.uid === uid ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-center gap-2">
                      {!m.seen && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                      <span className={`flex-1 min-w-0 truncate text-sm ${m.seen ? 'text-gray-600' : 'font-bold text-gray-900'}`}><bdi>{person(m.from)}</bdi></span>
                      <span className="text-[11px] text-gray-400 shrink-0"><bdi dir="ltr">{fmtDate(m.date)}</bdi></span>
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${m.seen ? 'text-gray-500' : 'font-semibold text-gray-800'}`}><bdi>{m.subject || t('mail.no_subject')}</bdi></p>
                  </button>
                ))}
                {list?.hasMore && (
                  <button type="button" onClick={more} disabled={loadingMore} className="w-full py-3 text-sm font-bold text-blue-600 flex items-center justify-center gap-2">
                    {loadingMore && <Loader2 size={14} className="animate-spin" />}{t('mail.more')}
                  </button>
                )}
              </div>
            </div>

            {/* الرسالة */}
            <div className={`${uid ? 'flex' : 'hidden lg:flex'} flex-col min-h-0 bg-white border border-gray-200 rounded-2xl p-4`}>
              {uid && box
                ? <Reader box={box} uid={uid} onBack={() => setUid(null)} onRead={markRead} />
                : <div className="m-auto text-center text-gray-400"><Reply size={26} className="mx-auto mb-2 text-gray-300" /><p className="text-sm">{t('mail.pick')}</p></div>}
            </div>
          </div>
        </>
      )}
      {adding && <AddMailbox onClose={() => setAdding(false)} onAdded={(b) => { setAdding(false); reset(); setActiveId(b.id); loadBoxes(); }} />}
    </div>
  );
}
