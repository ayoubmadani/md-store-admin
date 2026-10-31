import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Loader2, MailPlus, Save, Send } from 'lucide-react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, headers: { 'Content-Type': 'application/json' } });
const errText = (e, f) => { const m = e?.response?.data?.message; return (Array.isArray(m) ? m[0] : m) || f; };
const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors';

// رسالة الترحيب (أول تفعيل للحساب) + عنوان المرسِل لكل بريد التجار
export default function WelcomeEmailSettings() {
  const { t } = useTranslation();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testTo, setTestTo] = useState('me@mdstore.top');
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => setForm(data)).catch(() => setMessage({ type: 'error', text: t('settings.load_failed') }));
  }, [t]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage(null);
    try {
      const { data } = await api.put('/admin/settings', {
        welcomeEmailEnabled: !!form.welcomeEmailEnabled, welcomeEmailSubject: form.welcomeEmailSubject,
        welcomeEmailBody: form.welcomeEmailBody, senderEmail: form.senderEmail,
      });
      setForm(data);
      setMessage({ type: 'success', text: t('settings.saved') });
    } catch (err) {
      setMessage({ type: 'error', text: errText(err, t('settings.save_failed')) });
    } finally { setSaving(false); }
  };

  const test = async () => {
    setTesting(true); setMessage(null);
    try {
      await api.post('/admin/campaigns/welcome/test', { to: testTo });
      setMessage({ type: 'success', text: t('settings.welcome_test_sent', { to: testTo }) });
    } catch (err) {
      setMessage({ type: 'error', text: errText(err, t('settings.welcome_test_failed')) });
    } finally { setTesting(false); }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><MailPlus size={17} /></div>
          <div>
            <p className="font-bold text-gray-900 text-[15px]">{t('settings.welcome_title')}</p>
            <p className="text-sm text-gray-400 mt-0.5">{t('settings.welcome_desc')}</p>
          </div>
        </div>
        {form && (
          <button type="button" dir="ltr" onClick={() => setForm({ ...form, welcomeEmailEnabled: !form.welcomeEmailEnabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${form.welcomeEmailEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            title={form.welcomeEmailEnabled ? t('settings.enabled') : t('settings.disabled')}>
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.welcomeEmailEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        )}
      </div>

      {!form ? (
        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-600" size={20} /></div>
      ) : (
        <form onSubmit={save} className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{t('settings.sender_email')}</label>
            <input type="email" dir="ltr" required value={form.senderEmail ?? ''} onChange={set('senderEmail')} className={inputCls} />
            <p className="text-[11px] text-gray-400">{t('settings.sender_hint')}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{t('settings.welcome_subject')}</label>
            <input dir="auto" required maxLength={255} value={form.welcomeEmailSubject ?? ''} onChange={set('welcomeEmailSubject')} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{t('settings.welcome_body')}</label>
            <textarea dir="auto" required rows={8} value={form.welcomeEmailBody ?? ''} onChange={set('welcomeEmailBody')} className={`${inputCls} resize-y`} />
            <p className="text-[11px] text-gray-400">{t('settings.vars_hint')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {t('common.save')}
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <input type="email" dir="ltr" value={testTo} onChange={(e) => setTestTo(e.target.value)} className={inputCls} />
              <button type="button" onClick={test} disabled={testing || !testTo} className="shrink-0 flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 disabled:opacity-50">
                {testing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} {t('settings.send_test')}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-gray-400">{t('settings.test_uses_saved')}</p>
          {message && <p className={`text-sm font-semibold ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{message.text}</p>}
        </form>
      )}
    </section>
  );
}
