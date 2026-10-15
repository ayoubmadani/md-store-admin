import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle2, Link2, Loader2, RefreshCw, Unplug } from 'lucide-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');

// The platform AliExpress account used by every merchant to import products.
// Connect / disconnect happen here only; the approval page opens in a new tab and closes itself.
export default function AliexpressSettings() {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/aliexpress');
      setStatus(data);
    } catch {
      setStatus({ error: true });
    }
  }, []);

  useEffect(() => {
    load();
    // The callback page notifies us before closing; also refresh when the admin comes back to this tab
    const onMessage = (e) => {
      if (e.data?.type !== 'aliexpress-connect') return;
      setMessage(e.data.ok ? { type: 'success', text: 'AliExpress account connected' } : { type: 'error', text: 'Connection failed' });
      load();
    };
    window.addEventListener('message', onMessage);
    window.addEventListener('focus', load);
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('focus', load);
    };
  }, [load]);

  const connect = async () => {
    setBusy('connect');
    setMessage(null);
    // Open the tab synchronously so the popup blocker allows it, then point it at AliExpress
    const tab = window.open('', '_blank');
    try {
      const { data } = await api.get('/admin/aliexpress/connect');
      if (tab) tab.location.href = data.url;
      else window.location.href = data.url;
    } catch (err) {
      tab?.close();
      const msg = err.response?.data?.message;
      setMessage({ type: 'error', text: (Array.isArray(msg) ? msg[0] : msg) || 'Could not start the connection' });
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async () => {
    if (!window.confirm('Disconnect the platform AliExpress account? Merchants will not be able to import until you connect again.')) return;
    setBusy('disconnect');
    setMessage(null);
    try {
      await api.delete('/admin/aliexpress/connect');
      await load();
    } catch {
      setMessage({ type: 'error', text: 'Could not disconnect' });
    } finally {
      setBusy(null);
    }
  };

  const expired = status?.expired;

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF4747] text-white flex items-center justify-center shrink-0 text-xs font-black">AE</div>
          <div>
            <p className="font-bold text-gray-900 text-[15px]">AliExpress</p>
            <p className="text-sm text-gray-400 mt-0.5">
              Platform account used by all merchants to import products. Connecting and disconnecting is only possible here.
            </p>
          </div>
        </div>
        <button onClick={load} title="Refresh" className="text-gray-400 hover:text-blue-600 shrink-0"><RefreshCw size={16} /></button>
      </div>

      {!status ? (
        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-600" size={20} /></div>
      ) : status.error ? (
        <p className="text-sm text-red-500">Could not load the AliExpress status</p>
      ) : status.configured === false ? (
        <p className="text-sm text-amber-600">AliExpress is not configured on the server (ALIEXPRESS_APP_KEY / APP_SECRET / CALLBACK_URL).</p>
      ) : (
        <div className="space-y-3">
          {status.connected ? (
            <div className={`rounded-xl px-3 py-2.5 text-sm ${expired ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <p className="flex items-center gap-1.5 font-bold">
                {expired ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                {expired ? 'Token expired — merchants cannot import. Reconnect the account.' : `Connected as ${status.account || '—'}`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 mt-1.5 text-xs opacity-80">
                <span>Access token expires: {fmt(status.expiresAt)}</span>
                <span>Refresh token expires: {fmt(status.refreshExpiresAt)}</span>
                <span>Connected: {fmt(status.connectedAt)}</span>
                <span>Last renewed: {fmt(status.updatedAt)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No account connected — merchants cannot import from AliExpress.</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={connect} disabled={!!busy}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF4747] text-white text-sm font-bold rounded-xl hover:bg-[#e63c3c] transition-colors disabled:opacity-50">
              {busy === 'connect' ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
              {status.connected ? 'Reconnect' : 'Connect AliExpress'}
            </button>
            {status.connected && (
              <button onClick={disconnect} disabled={!!busy}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50">
                {busy === 'disconnect' ? <Loader2 size={15} className="animate-spin" /> : <Unplug size={15} />} Disconnect
              </button>
            )}
            {message && (
              <span className={`text-sm font-semibold ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{message.text}</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
