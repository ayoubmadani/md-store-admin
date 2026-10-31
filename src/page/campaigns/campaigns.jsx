// رسائل جماعية للتجار بشروط: الشروط ← المعاينة (العدد + عينة) ← الرسالة ← تجربة ← إرسال على دفعات (الصفحة مفتوحة)
import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Filter, Loader2, Megaphone, Send, Users } from 'lucide-react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, headers: { 'Content-Type': 'application/json' } });
const errText = (e, f) => { const m = e?.response?.data?.message; return (Array.isArray(m) ? m[0] : m) || f; };
const input = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white';
const label = 'text-[11px] font-bold text-gray-400 uppercase tracking-wide';
const card = 'bg-white border border-gray-200 rounded-2xl p-4 sm:p-5';
const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');

const EMPTY = { registeredFrom: '', registeredTo: '', verified: '', hasStore: '', subscription: '', planId: '', walletMin: '', walletMax: '', noOrdersDays: '' };

/** حقول النموذج ← شروط الـ API (الفارغ لا يُرسل) */
function toFilters(f) {
  const out = {};
  for (const k of ['registeredFrom', 'registeredTo', 'subscription', 'planId']) if (f[k]) out[k] = f[k];
  for (const k of ['verified', 'hasStore']) if (f[k] !== '') out[k] = f[k] === 'yes';
  for (const k of ['walletMin', 'walletMax', 'noOrdersDays']) if (f[k] !== '') out[k] = Number(f[k]);
  return out;
}

export default function CampaignsPage() {
  const { t } = useTranslation();
  const [f, setF] = useState(EMPTY);
  const [plans, setPlans] = useState([]);
  const [preview, setPreview] = useState(null); // { count, sample } | 'loading' | { error }
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [testTo, setTestTo] = useState('me@mdstore.top');
  const [busy, setBusy] = useState(null); // 'test' | 'send'
  const [progress, setProgress] = useState(null); // { id, total, sent, failed, remaining, status }
  const [notice, setNotice] = useState(null);
  const [history, setHistory] = useState([]);
  const stop = useRef(false);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const loadHistory = useCallback(() => api.get('/admin/campaigns').then(({ data }) => setHistory(data)).catch(() => {}), []);
  useEffect(() => {
    loadHistory();
    api.get('/plans').then(({ data }) => setPlans(Array.isArray(data) ? data : data?.data || [])).catch(() => {});
  }, [loadHistory]);

  // المعاينة تتحدث بعد توقف الكتابة
  const filters = JSON.stringify(toFilters(f));
  useEffect(() => {
    let live = true;
    const id = setTimeout(() => {
      setPreview('loading');
      api.post('/admin/campaigns/preview', { filters: JSON.parse(filters) })
        .then(({ data }) => live && setPreview(data))
        .catch((e) => live && setPreview({ error: errText(e, t('camp.preview_failed')) }));
    }, 400);
    return () => { live = false; clearTimeout(id); };
  }, [filters, t]);

  // إرسال على دفعات حتى ينتهي (أو حتى «إيقاف»)
  const run = async (campaign) => {
    stop.current = false;
    setBusy('send');
    setProgress({ id: campaign.id, total: campaign.total, sent: campaign.sent || 0, failed: campaign.failed || 0, remaining: campaign.total, status: 'sending' });
    try {
      for (;;) {
        const { data } = await api.post(`/admin/campaigns/${campaign.id}/send`, { size: 20 });
        setProgress((p) => ({ ...p, ...data }));
        if (data.status === 'done' || stop.current) break;
      }
    } catch (e) {
      setNotice({ ok: false, text: errText(e, t('camp.send_failed')) });
    } finally {
      setBusy(null);
      loadHistory();
    }
  };

  // لا نغادر الصفحة أثناء الإرسال بالخطأ
  useEffect(() => {
    if (busy !== 'send') return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);

  const sendTest = async () => {
    setBusy('test'); setNotice(null);
    try { await api.post('/admin/campaigns/test', { subject, body, to: testTo }); setNotice({ ok: true, text: t('camp.test_sent', { to: testTo }) }); }
    catch (e) { setNotice({ ok: false, text: errText(e, t('camp.send_failed')) }); }
    finally { setBusy(null); }
  };

  const start = async () => {
    const n = preview?.count || 0;
    if (!window.confirm(t('camp.confirm', { n }))) return;
    setNotice(null);
    try {
      const { data } = await api.post('/admin/campaigns', { subject, body, filters: JSON.parse(filters) });
      await run(data);
    } catch (e) { setNotice({ ok: false, text: errText(e, t('camp.send_failed')) }); }
  };

  const count = preview && preview !== 'loading' && !preview.error ? preview.count : null;
  const canSend = !busy && subject.trim() && body.trim() && count > 0;
  const pct = progress ? Math.round(((progress.sent + progress.failed) / Math.max(progress.total, 1)) * 100) : 0;

  const yesNo = (k) => (
    <select value={f[k]} onChange={set(k)} className={input}>
      <option value="">{t('camp.any')}</option><option value="yes">{t('camp.yes')}</option><option value="no">{t('camp.no')}</option>
    </select>
  );

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="text-xl font-black text-gray-900">{t('camp.title')}</h1>
        <p className="text-sm text-gray-400">{t('camp.subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {/* الشروط */}
        <section className={`${card} space-y-3`}>
          <p className="flex items-center gap-2 font-bold text-gray-900"><Filter size={16} className="text-blue-600" />{t('camp.conditions')}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5"><span className={label}>{t('camp.registered_from')}</span><input type="date" value={f.registeredFrom} onChange={set('registeredFrom')} className={input} /></div>
            <div className="flex flex-col gap-1.5"><span className={label}>{t('camp.registered_to')}</span><input type="date" value={f.registeredTo} onChange={set('registeredTo')} className={input} /></div>
            <div className="flex flex-col gap-1.5"><span className={label}>{t('camp.verified')}</span>{yesNo('verified')}</div>
            <div className="flex flex-col gap-1.5"><span className={label}>{t('camp.has_store')}</span>{yesNo('hasStore')}</div>
            <div className="flex flex-col gap-1.5"><span className={label}>{t('camp.subscription')}</span>
              <select value={f.subscription} onChange={set('subscription')} className={input}>
                <option value="">{t('camp.any')}</option>
                {['active', 'trial', 'expired', 'none'].map((s) => <option key={s} value={s}>{t(`camp.sub_${s}`)}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5"><span className={label}>{t('camp.plan')}</span>
              <select value={f.planId} onChange={set('planId')} className={input}>
                <option value="">{t('camp.any')}</option>
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5"><span className={label}>{t('camp.wallet_min')}</span><input type="number" min="0" dir="ltr" value={f.walletMin} onChange={set('walletMin')} className={input} /></div>
            <div className="flex flex-col gap-1.5"><span className={label}>{t('camp.wallet_max')}</span><input type="number" min="0" dir="ltr" value={f.walletMax} onChange={set('walletMax')} className={input} /></div>
            <div className="flex flex-col gap-1.5 col-span-2"><span className={label}>{t('camp.no_orders_days')}</span><input type="number" min="1" dir="ltr" value={f.noOrdersDays} onChange={set('noOrdersDays')} className={input} /></div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <button type="button" onClick={() => setF(EMPTY)} className="text-xs font-bold text-gray-400 hover:text-gray-600">{t('camp.clear')}</button>
          </div>
          {/* المعاينة */}
          <div className="rounded-xl bg-blue-50 p-3">
            {preview === 'loading' || preview === null ? <Loader2 size={16} className="animate-spin text-blue-600" />
              : preview.error ? <p className="text-sm text-red-500">{preview.error}</p>
              : (
                <>
                  <p className="flex items-center gap-2 font-bold text-blue-700"><Users size={16} />{t('camp.matches', { n: preview.count })}</p>
                  {preview.sample?.length > 0 && <p className="text-xs text-blue-600/80 mt-1 truncate">{preview.sample.map((s) => s.name || s.email).join('، ')}{preview.count > preview.sample.length ? '…' : ''}</p>}
                </>
              )}
          </div>
          <p className="text-[11px] text-gray-400">{t('camp.excluded_note')}</p>
        </section>

        {/* الرسالة */}
        <section className={`${card} space-y-3`}>
          <p className="flex items-center gap-2 font-bold text-gray-900"><Megaphone size={16} className="text-blue-600" />{t('camp.message')}</p>
          <div className="flex flex-col gap-1.5"><span className={label}>{t('camp.subject')}</span><input dir="auto" maxLength={255} value={subject} onChange={(e) => setSubject(e.target.value)} className={input} /></div>
          <div className="flex flex-col gap-1.5"><span className={label}>{t('camp.body')}</span><textarea dir="auto" rows={10} value={body} onChange={(e) => setBody(e.target.value)} className={`${input} resize-y`} /></div>
          <p className="text-[11px] text-gray-400">{t('settings.vars_hint')} {t('camp.unsub_note')}</p>
          <div className="flex items-center gap-2">
            <input type="email" dir="ltr" value={testTo} onChange={(e) => setTestTo(e.target.value)} className={input} />
            <button type="button" onClick={sendTest} disabled={!!busy || !subject.trim() || !body.trim() || !testTo}
              className="shrink-0 flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 disabled:opacity-50">
              {busy === 'test' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}{t('settings.send_test')}
            </button>
          </div>
          <button type="button" onClick={start} disabled={!canSend}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
            {busy === 'send' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}{t('camp.send_to', { n: count ?? 0 })}
          </button>
          {notice && <p className={`text-sm font-semibold ${notice.ok ? 'text-green-600' : 'text-red-500'}`}>{notice.text}</p>}

          {/* التقدم */}
          {progress && (
            <div className="rounded-xl border border-gray-100 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-800">{progress.status === 'done' ? <span className="flex items-center gap-1.5 text-green-600"><CheckCircle2 size={16} />{t('camp.done')}</span> : t('camp.sending')}</span>
                <span dir="ltr" className="text-gray-500">{progress.sent + progress.failed} / {progress.total}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} /></div>
              <p className="text-xs text-gray-500">{t('camp.stats', { sent: progress.sent, failed: progress.failed })}</p>
              {busy === 'send' && <p className="text-[11px] text-amber-600">{t('camp.keep_open')}</p>}
              {busy === 'send' && <button type="button" onClick={() => { stop.current = true; }} className="text-xs font-bold text-red-500">{t('camp.pause')}</button>}
            </div>
          )}
        </section>
      </div>

      {/* السجل */}
      <section className={card}>
        <p className="font-bold text-gray-900 mb-3">{t('camp.history')}</p>
        {history.length === 0 ? <p className="text-sm text-gray-400">{t('camp.no_history')}</p> : (
          <div className="divide-y divide-gray-100">
            {history.map((c) => (
              <div key={c.id} className="py-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className="flex-1 min-w-[180px] font-semibold text-sm text-gray-800 truncate"><bdi>{c.subject}</bdi></p>
                <span className="text-xs text-gray-400"><bdi dir="ltr">{fmtDate(c.createdAt)}</bdi></span>
                <span className="text-xs text-gray-600">{t('camp.stats', { sent: c.sent, failed: c.failed })} · <span dir="ltr">{c.total}</span></span>
                {c.status === 'done'
                  ? <span className="text-[11px] font-bold rounded-lg px-2 py-1 bg-green-50 text-green-700">{t('camp.done')}</span>
                  : <button type="button" disabled={!!busy} onClick={() => run(c)} className="text-[11px] font-bold rounded-lg px-2 py-1 bg-amber-50 text-amber-700 disabled:opacity-50">{t('camp.resume')}</button>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
