import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bot, Check, Copy, KeyRound, Loader2, Plus, ShieldCheck, Trash2, X } from 'lucide-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// نفس خادم MCP الذي تستعمله لوحة التاجر — الرابط الكامل = MCP_URL/<المفتاح>
const MCP_URL = import.meta.env.VITE_MCP_URL || 'https://mcp.mdstore.top/mcp';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const STATUS = {
  active: 'bg-green-50 text-green-700',
  expired: 'bg-gray-100 text-gray-500',
  revoked: 'bg-red-50 text-red-600',
};

const errText = (err, fallback) => {
  const msg = err.response?.data?.message;
  if (err.response?.status === 404) return 'The API does not have this feature yet — restart / redeploy md-store-api.';
  return (Array.isArray(msg) ? msg[0] : msg) || fallback;
};

// Admin MCP keys (mdsa_…): let Claude use admin tools (create themes, theme types).
// Merchant keys never see these tools, and every admin action asks for a fresh PIN.
export default function McpKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [newKey, setNewKey] = useState(null);

  const load = () =>
    api.get('/admin/mcp-keys')
      .then(({ data }) => { setKeys(data); setError(null); })
      .catch((err) => setError(errText(err, 'Could not load keys')));

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const revoke = async (k) => {
    if (!window.confirm(`Revoke "${k.name}"? Claude will lose admin access with this key.`)) return;
    try { await api.delete(`/admin/mcp-keys/${k.id}`); await load(); }
    catch (err) { setError(errText(err, 'Could not revoke key')); }
  };

  const activeCount = keys.filter((k) => k.status === 'active').length;

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Bot size={17} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-[15px]">Admin MCP keys</p>
            <p className="text-sm text-gray-400 mt-0.5">
              Connect Claude to admin tools (create themes and theme types).
            </p>
          </div>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus size={15} /> New key
        </button>
      </div>

      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-4">
        <ShieldCheck size={14} className="text-blue-500 shrink-0" />
        <p className="text-[12px] text-gray-500">
          Merchant keys can't reach these tools. Every admin action asks you for a fresh PIN (same as login), valid once for 5 minutes.
        </p>
      </div>

      {newKey && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-amber-800">Copy now — it won't be shown again</p>
            <button onClick={() => setNewKey(null)} className="text-amber-500 hover:text-amber-700"><X size={15} /></button>
          </div>
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-1">Connection URL for Claude (MCP)</p>
          <CopyField value={`${MCP_URL}/${newKey}`} />
          <p className="text-[11px] text-amber-700 mt-1.5 mb-3">
            Paste it in the “URL” field when adding a custom connector in Claude, with “No authentication”. Don't share it.
          </p>
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-1">Key only</p>
          <CopyField value={newKey} />
        </div>
      )}

      {error && <p className="text-sm font-semibold text-red-500 mb-3">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={20} /></div>
      ) : keys.length === 0 ? (
        !error && (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
            <KeyRound size={20} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No keys yet</p>
          </div>
        )
      ) : (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">Key</th>
                <th className="text-left px-4 py-2.5 hidden sm:table-cell">Last used</th>
                <th className="text-left px-4 py-2.5 hidden sm:table-cell">Expires</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="px-2 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keys.map((k) => (
                <tr key={k.id} className={k.status === 'active' ? '' : 'opacity-60'}>
                  <td className="px-4 py-3 font-semibold text-gray-900">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{k.prefix}…</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{fmtDate(k.lastUsedAt)}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{fmtDate(k.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold rounded-lg px-2 py-1 capitalize ${STATUS[k.status] ?? STATUS.active}`}>{k.status}</span>
                  </td>
                  <td className="px-2 py-3 text-right">
                    {k.status === 'active' && (
                      <button onClick={() => revoke(k)} title="Revoke" className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-2 text-[11px] text-gray-400 bg-gray-50 border-t border-gray-100">{activeCount} active of {keys.length}</p>
        </div>
      )}

      {modal && (
        <CreateKeyModal
          onClose={() => setModal(false)}
          onCreated={async (key) => { setModal(false); setNewKey(key); await load(); }}
        />
      )}
    </section>
  );
}

function CopyField({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 min-w-0 truncate bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs text-gray-700">{value}</code>
      <button onClick={copy} className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors">
        {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function CreateKeyModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [days, setDays] = useState(30);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.post('/admin/mcp-keys', { name: name.trim(), expiresInDays: Number(days) });
      await onCreated(data.key);
    } catch (err) {
      setError(errText(err, 'Could not create key'));
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => !saving && onClose()} />
      <form onSubmit={submit} className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-900">New admin key</p>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Name</label>
          <input autoFocus required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Claude Code" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Expires in</label>
          <select value={days} onChange={(e) => setDays(e.target.value)} className={inputCls}>
            {[7, 30, 60, 90].map((d) => <option key={d} value={d}>{d} days</option>)}
          </select>
        </div>
        {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
          <button type="submit" disabled={saving || !name.trim()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving && <Loader2 size={14} className="animate-spin" />} Create key
          </button>
        </div>
      </form>
    </div>
  );
}
