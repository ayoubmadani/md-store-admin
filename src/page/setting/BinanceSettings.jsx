import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Save, Coins } from 'lucide-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// شحن محفظة التاجر بـ USDT: إيداع على عنوان Binance الخاص بالمنصة ثم TxID — السعر يحدده الأدمن
export default function BinanceSettings() {
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
      const { data } = await api.put('/admin/settings', {
        binanceEnabled: !!form.binanceEnabled,
        usdtRateDzd: Number(form.usdtRateDzd),
        binanceTrc20Address: (form.binanceTrc20Address || '').trim(),
        binanceBep20Address: (form.binanceBep20Address || '').trim(),
        binanceUid: (form.binanceUid || '').trim(),
      });
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
          <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
            <Coins size={17} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-[15px]">Wallet top-up with USDT (Binance)</p>
            <p className="text-sm text-gray-400 mt-0.5">Merchants send a unique USDT amount to your Binance deposit address, then paste the TxID. Needs BINANCE_API_KEY / BINANCE_SECRET (read-only) on the API.</p>
          </div>
        </div>
        {form && (
          <button type="button" onClick={() => setForm({ ...form, binanceEnabled: !form.binanceEnabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${form.binanceEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            title={form.binanceEnabled ? 'Enabled' : 'Disabled'}>
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.binanceEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        )}
      </div>

      {!form ? (
        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-600" size={20} /></div>
      ) : (
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">1 USDT = ? DZD</label>
              <input type="number" min="1" step="0.5" required value={form.usdtRateDzd ?? ''}
                onChange={(e) => setForm({ ...form, usdtRateDzd: e.target.value })} className={inputCls} />
              <p className="text-[11px] text-gray-400">The merchant pays amount ÷ this rate in USDT.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Binance UID (Binance Pay)</label>
              <input dir="ltr" inputMode="numeric" value={form.binanceUid ?? ''} placeholder="535950835"
                onChange={(e) => setForm({ ...form, binanceUid: e.target.value })} className={`${inputCls} font-mono`} />
              <p className="text-[11px] text-gray-400">Merchants send USDT with Binance Pay to this UID — instant, no fee. Your UID is on the Binance dashboard.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">TRC20 address (Tron)</label>
              <input dir="ltr" value={form.binanceTrc20Address ?? ''} placeholder="T…"
                onChange={(e) => setForm({ ...form, binanceTrc20Address: e.target.value })} className={`${inputCls} font-mono`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">BEP20 address (BNB Smart Chain)</label>
              <input dir="ltr" value={form.binanceBep20Address ?? ''} placeholder="0x…"
                onChange={(e) => setForm({ ...form, binanceBep20Address: e.target.value })} className={`${inputCls} font-mono`} />
              <p className="text-[11px] text-gray-400">Use your Binance deposit addresses for USDT. Leave one empty to hide that network.</p>
            </div>
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
