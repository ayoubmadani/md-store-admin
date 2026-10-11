import React, { useCallback, useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

// شاشة القفل: الخادم يختار 3 أسماء عشوائية، مثلاً ZZMMHH، والمدير يُدخل
// الرقمين 1-2 من رمز ZZ + الرقمين 3-4 من MM + الرقمين 5-6 من HH
export default function PinLock() {
  const { user, getPinChallenge, unlock, logout } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadChallenge = useCallback(async () => {
    setPin('');
    try {
      setChallenge(await getPinChallenge());
    } catch {
      setError('تعذر الاتصال بالخادم');
    }
  }, [getPinChallenge]);

  useEffect(() => { loadChallenge(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!challenge || pin.length !== 6) return;
    setLoading(true);
    try {
      await unlock(challenge.challenge_token, pin);
    } catch (err) {
      setError(err.message);
      loadChallenge(); // رمز جديد بعد كل محاولة خاطئة
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm p-8 flex flex-col items-center gap-5"
      >
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
          <Lock className="text-blue-600" size={22} />
        </div>

        <p className="text-sm font-bold text-gray-500 text-center">{user?.email}</p>

        <p className="text-base font-black text-gray-800 text-center">
          أدخل الرمز{' '}
          <span className="text-blue-600 tracking-widest" dir="ltr">{challenge?.label ?? '…'}</span>
        </p>

        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          maxLength={6}
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
          dir="ltr"
          className="w-full text-center text-2xl tracking-[0.5em] font-black border border-gray-300 rounded-xl py-3 focus:outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={loading || !challenge || pin.length !== 6}
          className="w-full bg-blue-600 text-white font-bold rounded-xl py-3 disabled:opacity-50"
        >
          {loading ? '…' : 'دخول'}
        </button>

        {error && <p className="text-sm font-bold text-red-500 text-center">{error}</p>}

        <button type="button" onClick={logout} className="text-xs font-bold text-gray-400 hover:text-gray-600">
          تسجيل الخروج
        </button>
      </form>
    </div>
  );
}
