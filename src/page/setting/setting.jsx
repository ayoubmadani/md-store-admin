import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, PhoneCall, Save } from 'lucide-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// إعدادات المنصة — أولها رسوم التأكيد التي تُخصم من محفظة شركة التأكيد عن كل طلب تؤكده
export default function Setting() {
  const [fee, setFee] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => setFee(String(data.confirmationFee ?? '')))
      .catch(() => setMessage({ type: 'error', text: 'تعذر تحميل الإعدادات' }))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await api.put('/admin/settings', { confirmationFee: Number(fee) });
      setFee(String(data.confirmationFee));
      setMessage({ type: 'success', text: 'تم الحفظ' });
    } catch (err) {
      const msg = err.response?.data?.message;
      setMessage({ type: 'error', text: (Array.isArray(msg) ? msg[0] : msg) || 'تعذر الحفظ' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-xl space-y-6" dir="rtl">
      <h1 className="text-xl font-black text-gray-900">إعدادات المنصة</h1>

      <form onSubmit={save} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 font-black text-gray-800">
          <PhoneCall size={18} className="text-blue-600" /> رسوم التأكيد
        </div>
        <p className="text-sm text-gray-500">
          تُخصم من محفظة شركة التأكيد عن كل طلب تؤكده، مرة واحدة لكل طلب. أجر الشركة نفسه يتفق عليه التاجر معها خارج المنصة.
          القيمة 0 تعني بدون رسوم.
        </p>
        <label className="block">
          <span className="text-sm font-bold text-gray-700">المبلغ عن كل طلب مؤكد (د.ج)</span>
          <input
            type="number"
            min="0"
            max="10000"
            step="0.5"
            required
            dir="ltr"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="mt-1 w-40 border border-gray-300 rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-blue-500"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold rounded-xl px-5 py-2.5 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} حفظ
          </button>
          {message && (
            <span className={`text-sm font-bold ${message.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
              {message.text}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
