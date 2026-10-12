import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, PhoneCall, Save } from 'lucide-react';
import McpKeys from './McpKeys';
import CustomThemeSettings from './CustomThemeSettings';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Platform settings — confirmation fee charged to the confirmation company per confirmed order,
// and the admin MCP keys.
export default function Setting() {
  const [fee, setFee] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => setFee(String(data.confirmationFee ?? '')))
      .catch(() => setMessage({ type: 'error', text: 'Could not load settings' }))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await api.put('/admin/settings', { confirmationFee: Number(fee) });
      setFee(String(data.confirmationFee));
      setMessage({ type: 'success', text: 'Saved' });
    } catch (err) {
      const msg = err.response?.data?.message;
      setMessage({ type: 'error', text: (Array.isArray(msg) ? msg[0] : msg) || 'Could not save' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-black text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Platform-wide settings and admin access for Claude</p>
      </div>

      {/* Confirmation fee */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <PhoneCall size={17} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-[15px]">Confirmation fee</p>
            <p className="text-sm text-gray-400 mt-0.5">
              Charged once per confirmed order to the confirmation company's wallet. The company's own fee is agreed with
              the merchant outside the platform. 0 = no fee.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-600" size={20} /></div>
        ) : (
          <form onSubmit={save} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Amount per confirmed order (DZD)</label>
              <input
                type="number" min="0" max="10000" step="0.5" required
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-48 px-3 py-2 text-sm font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
            </button>
            {message && (
              <span className={`text-sm font-semibold ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {message.text}
              </span>
            )}
          </form>
        )}
      </section>

      <CustomThemeSettings />

      <McpKeys />
    </div>
  );
}
