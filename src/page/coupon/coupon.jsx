import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  CheckCircle2, XCircle, X, Loader2,
  Percent, Tag, Users, Calendar, Layers,
} from 'lucide-react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

const api = {
  getAll: ()        => axios.get(`${BASE_URL}/coupons`).then(r => r.data),
  create: (dto)     => axios.post(`${BASE_URL}/coupons`, dto).then(r => r.data),
  update: (id, dto) => axios.patch(`${BASE_URL}/coupons/${id}`, dto).then(r => r.data),
  remove: (id)      => axios.delete(`${BASE_URL}/coupons/${id}`),
  toggle: (id)      => axios.patch(`${BASE_URL}/coupons/${id}/toggle`).then(r => r.data),
};

const INITIAL_FORM = {
  code: '', discountType: 'percentage', discountValue: 10,
  scope: 'both',
  maxUsesPlan: '', maxUsesPerUserPlan: '',
  maxUsesTheme: '', maxUsesPerUserTheme: '',
  startsAt: '', expiresAt: '', isActive: true, description: '',
};

const toDateInputValue = (isoString) => (isoString ? isoString.slice(0, 10) : '');

const couponToForm = (coupon) => ({
  code:                 coupon.code,
  discountType:         coupon.discountType,
  discountValue:        Number(coupon.discountValue),
  scope:                coupon.scope,
  maxUsesPlan:          coupon.maxUsesPlan ?? '',
  maxUsesPerUserPlan:   coupon.maxUsesPerUserPlan ?? '',
  maxUsesTheme:         coupon.maxUsesTheme ?? '',
  maxUsesPerUserTheme:  coupon.maxUsesPerUserTheme ?? '',
  startsAt:             toDateInputValue(coupon.startsAt),
  expiresAt:            toDateInputValue(coupon.expiresAt),
  isActive:             coupon.isActive,
  description:          coupon.description || '',
});

const formToDto = (form) => ({
  code: form.code.trim().toUpperCase(),
  discountType: form.discountType,
  discountValue: Number(form.discountValue),
  scope: form.scope,
  maxUsesPlan: form.maxUsesPlan === '' ? null : Number(form.maxUsesPlan),
  maxUsesPerUserPlan: form.maxUsesPerUserPlan === '' ? null : Number(form.maxUsesPerUserPlan),
  maxUsesTheme: form.maxUsesTheme === '' ? null : Number(form.maxUsesTheme),
  maxUsesPerUserTheme: form.maxUsesPerUserTheme === '' ? null : Number(form.maxUsesPerUserTheme),
  startsAt: form.startsAt || null,
  expiresAt: form.expiresAt || null,
  isActive: form.isActive,
  description: form.description || undefined,
});

const formatDiscount = (coupon) =>
  coupon.discountType === 'percentage'
    ? `${Number(coupon.discountValue)}% OFF`
    : `${Number(coupon.discountValue).toLocaleString()} DZD OFF`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const Badge = ({ children, variant }) => {
  const styles = {
    green: 'bg-green-50 text-green-700',
    gray:  'bg-gray-100 text-gray-500',
    blue:  'bg-blue-50 text-blue-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
};

const Pill = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-1.5">
    <Icon size={12} className="text-blue-500 shrink-0" />
    <span className="text-[11px] font-semibold text-gray-700">{children}</span>
  </div>
);

// ─── Coupon Card ──────────────────────────────────────────────────────────────

const CouponCard = ({ coupon, onEdit, onDelete, onToggle }) => {
  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 transition-opacity ${coupon.isActive ? '' : 'opacity-60'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono font-black text-gray-900 text-[15px] tracking-wide">{coupon.code}</p>
        <div className="flex items-center gap-1.5">
          {isExpired && <Badge variant="gray">Expired</Badge>}
          <Badge variant={coupon.isActive ? 'green' : 'gray'}>{coupon.isActive ? 'Active' : 'Inactive'}</Badge>
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-gray-900 leading-none">{formatDiscount(coupon)}</span>
      </div>

      {coupon.description && <p className="text-xs text-gray-400">{coupon.description}</p>}

      {/* Usage count — how many times this coupon was actually redeemed, per type */}
      <div className="grid grid-cols-2 gap-1.5">
        {(coupon.scope === 'plan' || coupon.scope === 'both') && (
          <div className="bg-blue-50 rounded-xl px-3 py-2">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">Used for plans</p>
            <p className="text-lg font-black text-blue-700 leading-tight">{coupon.usedCountPlan}</p>
          </div>
        )}
        {(coupon.scope === 'theme' || coupon.scope === 'both') && (
          <div className="bg-purple-50 rounded-xl px-3 py-2">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">Used for themes</p>
            <p className="text-lg font-black text-purple-700 leading-tight">{coupon.usedCountTheme}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <Pill icon={Layers}>{coupon.scope}</Pill>
        {coupon.expiresAt && (
          <Pill icon={Calendar}>exp {toDateInputValue(coupon.expiresAt)}</Pill>
        )}
        {(coupon.scope === 'plan' || coupon.scope === 'both') && (
          <Pill icon={Users}>
            Plan limit: {coupon.maxUsesPlan ?? '∞'} · {coupon.maxUsesPerUserPlan ?? '∞'}/user
          </Pill>
        )}
        {(coupon.scope === 'theme' || coupon.scope === 'both') && (
          <Pill icon={Percent}>
            Theme limit: {coupon.maxUsesTheme ?? '∞'} · {coupon.maxUsesPerUserTheme ?? '∞'}/user
          </Pill>
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <button onClick={onEdit} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
          <Pencil size={13} /> Edit
        </button>
        <button onClick={onToggle} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors ml-auto">
          {coupon.isActive
            ? <><ToggleRight size={14} className="text-blue-500" /> Deactivate</>
            : <><ToggleLeft size={14} /> Activate</>}
        </button>
        <button onClick={onDelete} className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── Modal helpers ────────────────────────────────────────────────────────────

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors";

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className={`w-9 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`} />
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </div>
    <span className="text-sm text-gray-600 font-medium">{label}</span>
  </label>
);

// ─── Modal ────────────────────────────────────────────────────────────────────

const CouponModal = ({ initial, mode, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState(initial);
  const isEditing = mode === 'edit';

  useEffect(() => { setForm(initial); }, [initial]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 sticky top-0 bg-white border-b border-gray-100 z-10">
          <h2 className="text-[15px] font-black text-gray-900">
            {isEditing ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={async e => { e.preventDefault(); await onSubmit(form); }}
          className="px-6 py-5 flex flex-col gap-5">

          <section className="flex flex-col gap-4">
            <Field label="Code">
              <input required value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20" className={`${inputCls} font-mono uppercase`} />
            </Field>

            <Field label="Description (optional, admin-facing)">
              <input value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="e.g. Launch promo" className={inputCls} />
            </Field>

            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 border border-gray-100">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Discount</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                  <select value={form.discountType} onChange={e => set('discountType', e.target.value)} className={inputCls}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </Field>
                <Field label={form.discountType === 'percentage' ? 'Value (%)' : 'Value (DZD)'}>
                  <input type="number" min={0} max={form.discountType === 'percentage' ? 100 : undefined}
                    step={form.discountType === 'percentage' ? 1 : 0.01}
                    value={form.discountValue}
                    onChange={e => set('discountValue', parseFloat(e.target.value) || 0)}
                    className={inputCls} />
                </Field>
              </div>

              <Field label="Applies to">
                <select value={form.scope} onChange={e => set('scope', e.target.value)} className={inputCls}>
                  <option value="both">Plans & Themes</option>
                  <option value="plan">Plans only</option>
                  <option value="theme">Themes only</option>
                </select>
              </Field>
            </div>

            {(form.scope === 'plan' || form.scope === 'both') && (
              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 border border-gray-100">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Plan purchase limits</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Total use limit (blank = unlimited)">
                    <input type="number" min={1} value={form.maxUsesPlan}
                      onChange={e => set('maxUsesPlan', e.target.value)}
                      placeholder="∞" className={inputCls} />
                  </Field>
                  <Field label="Per-user limit (blank = unlimited)">
                    <input type="number" min={1} value={form.maxUsesPerUserPlan}
                      onChange={e => set('maxUsesPerUserPlan', e.target.value)}
                      placeholder="∞" className={inputCls} />
                  </Field>
                </div>
              </div>
            )}

            {(form.scope === 'theme' || form.scope === 'both') && (
              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 border border-gray-100">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Theme purchase limits</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Total use limit (blank = unlimited)">
                    <input type="number" min={1} value={form.maxUsesTheme}
                      onChange={e => set('maxUsesTheme', e.target.value)}
                      placeholder="∞" className={inputCls} />
                  </Field>
                  <Field label="Per-user limit (blank = unlimited)">
                    <input type="number" min={1} value={form.maxUsesPerUserTheme}
                      onChange={e => set('maxUsesPerUserTheme', e.target.value)}
                      placeholder="∞" className={inputCls} />
                  </Field>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Starts at (optional)">
                <input type="date" value={form.startsAt} onChange={e => set('startsAt', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Expires at (optional)">
                <input type="date" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} className={inputCls} />
              </Field>
            </div>

            <Toggle checked={form.isActive} onChange={v => set('isActive', v)} label="Active" />
          </section>

          <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEditing ? 'Save changes' : 'Create coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm ───────────────────────────────────────────────────────────

const DeleteConfirm = ({ couponCode, onCancel, onConfirm, loading }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <Trash2 size={16} className="text-red-500" />
        </div>
        <div>
          <p className="font-black text-gray-900 text-[15px]">Delete "{couponCode}"?</p>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            The API will block deletion if this coupon has already been used — deactivate it instead.
          </p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-60 transition-colors">
          {loading && <Loader2 size={14} className="animate-spin" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

const Toast = ({ message, type }) => (
  <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-sm font-bold ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
    {type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
    {message}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const CouponPage = () => {
  const [coupons, setCoupons]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen]         = useState(false);
  const [modalMode, setModalMode]         = useState('create');
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [toast, setToast]                 = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try { setCoupons(await api.getAll()); }
    catch { showToast('Failed to load coupons', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleCreate = () => { setEditingCoupon(null); setModalMode('create'); setModalOpen(true); };
  const handleEdit   = (coupon) => { setEditingCoupon(coupon); setModalMode('edit'); setModalOpen(true); };

  const handleModalSubmit = async (formData) => {
    setActionLoading(true);
    try {
      const dto = formToDto(formData);
      if (modalMode === 'edit' && editingCoupon) {
        const updated = await api.update(editingCoupon.id, dto);
        setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
        showToast('Coupon updated successfully');
      } else {
        const created = await api.create(dto);
        setCoupons(prev => [created, ...prev]);
        showToast('Coupon created successfully');
      }
      setModalOpen(false);
    } catch (err) {
      const message = err?.response?.data?.message;
      showToast(Array.isArray(message) ? message.join(', ') : (message || 'Operation failed'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (coupon) => {
    try {
      const updated = await api.toggle(coupon.id);
      setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
      showToast(`Coupon ${updated.isActive ? 'activated' : 'deactivated'}`);
    } catch { showToast('Failed to update coupon', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await api.remove(deleteTarget.id);
      setCoupons(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('Coupon deleted');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete coupon', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const modalInitial = modalMode === 'edit' && editingCoupon
    ? couponToForm(editingCoupon)
    : { ...INITIAL_FORM };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage discount codes for plan & theme purchases</p>
        </div>
        <button onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={16} /> New coupon
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total coupons',      value: coupons.length },
          { label: 'Active',             value: coupons.filter(c => c.isActive).length },
          { label: 'Plan redemptions',   value: coupons.reduce((sum, c) => sum + (c.usedCountPlan ?? 0), 0) },
          { label: 'Theme redemptions',  value: coupons.reduce((sum, c) => sum + (c.usedCountTheme ?? 0), 0) },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center">
          <p className="text-gray-400 text-sm font-medium">No coupons yet.</p>
          <button onClick={handleCreate} className="mt-3 text-sm font-bold text-blue-600 hover:underline">
            Create your first coupon →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {coupons.map(coupon => (
            <CouponCard key={coupon.id} coupon={coupon}
              onEdit={() => handleEdit(coupon)}
              onDelete={() => setDeleteTarget(coupon)}
              onToggle={() => handleToggle(coupon)}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <CouponModal initial={modalInitial} mode={modalMode}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          loading={actionLoading}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm couponCode={deleteTarget.code}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default CouponPage;
