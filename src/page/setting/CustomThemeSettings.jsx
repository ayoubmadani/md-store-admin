import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Loader2, Save, Sparkles } from 'lucide-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const FIELDS = [
  { key: 'customThemePrice', step: 100 },
  { key: 'customThemeRevisions', step: 1 },
  { key: 'customThemeRevisionPrice', step: 100 },
  { key: 'customThemeDelayHours', step: 0.5 },
];

// ثيم خاص يصنعه Claude للتاجر (بمفتاح Anthropic الخاص بالمنصة): السعر والمراجعات ومدة المراجعة
export default function CustomThemeSettings() {
  const { t } = useTranslation();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => setForm(data))
      .catch(() => setMessage({ type: 'error', text: t('settings.load_failed') }));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = { customThemeEnabled: !!form.customThemeEnabled };
      FIELDS.forEach((f) => { payload[f.key] = Number(form[f.key]); });
      const { data } = await api.put('/admin/settings', payload);
      setForm(data);
      setMessage({ type: 'success', text: t('settings.saved') });
    } catch (err) {
      const msg = err.response?.data?.message;
      setMessage({ type: 'error', text: (Array.isArray(msg) ? msg[0] : msg) || t('settings.save_failed') });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors';

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles size={17} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-[15px]">{t('settings.ct_title')}</p>
            <p className="text-sm text-gray-400 mt-0.5">{t('settings.ct_desc')}</p>
          </div>
        </div>
        {form && (
          <button type="button" dir="ltr" onClick={() => setForm({ ...form, customThemeEnabled: !form.customThemeEnabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${form.customThemeEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            title={form.customThemeEnabled ? t('settings.enabled') : t('settings.disabled')}>
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.customThemeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        )}
      </div>

      {!form ? (
        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-600" size={20} /></div>
      ) : (
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{t(`settings.${f.key}`)}</label>
                <input type="number" min="0" step={f.step} required value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className={inputCls} />
                <p className="text-[11px] text-gray-400">{t(`settings.${f.key}_hint`)}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {t('common.save')}
            </button>
            {message && (
              <span className={`text-sm font-semibold ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{message.text}</span>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
