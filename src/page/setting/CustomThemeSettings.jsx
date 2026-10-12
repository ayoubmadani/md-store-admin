import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Save, Sparkles } from 'lucide-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const FIELDS = [
  { key: 'customThemePrice', label: 'Price (DZD)', step: 100, hint: 'Charged from the merchant wallet when ordering' },
  { key: 'customThemeRevisions', label: 'Included revisions', step: 1, hint: 'Change requests included in the price' },
  { key: 'customThemeRevisionPrice', label: 'Extra revision price (DZD)', step: 100, hint: 'Per revision, after included ones run out' },
  { key: 'customThemeDelayHours', label: 'Review window (hours)', step: 0.5, hint: 'Ready themes go live after this delay unless you reject them. 0 = immediately' },
];

// ثيم خاص يصنعه Claude للتاجر (بمفتاح Anthropic الخاص بالمنصة): السعر والمراجعات ومدة المراجعة
export default function CustomThemeSettings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => setForm(data))
      .catch(() => setMessage({ type: 'error', text: 'Could not load settings' }));
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
      setMessage({ type: 'success', text: 'Saved' });
    } catch (err) {
      const msg = err.response?.data?.message;
      setMessage({ type: 'error', text: (Array.isArray(msg) ? msg[0] : msg) || 'Could not save' });
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
            <p className="font-bold text-gray-900 text-[15px]">Custom themes by Claude</p>
            <p className="text-sm text-gray-400 mt-0.5">Merchants order a theme made for their store, generated with the platform's Anthropic key.</p>
          </div>
        </div>
        {form && (
          <button type="button" onClick={() => setForm({ ...form, customThemeEnabled: !form.customThemeEnabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${form.customThemeEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            title={form.customThemeEnabled ? 'Enabled' : 'Disabled'}>
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
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{f.label}</label>
                <input type="number" min="0" step={f.step} required value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className={inputCls} />
                <p className="text-[11px] text-gray-400">{f.hint}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
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
