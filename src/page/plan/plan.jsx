import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  CheckCircle2, XCircle, X, Loader2,
  Store, Package, FileText, Bell, TrendingUp,
} from 'lucide-react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

const api = {
  getAll: ()        => axios.get(`${BASE_URL}/plans`).then(r => r.data),
  create: (dto)     => axios.post(`${BASE_URL}/plans`, dto).then(r => r.data),
  update: (id, dto) => axios.patch(`${BASE_URL}/plans/${id}`, dto).then(r => r.data),
  remove: (id)      => axios.delete(`${BASE_URL}/plans/${id}`),
  toggle: (id)      => axios.patch(`${BASE_URL}/plans/${id}/toggle`).then(r => r.data),
};

const INITIAL_FEATURES = {
  storeNumber: 1, productNumber: 10, landingPageNumber: 0,
  isNtfy: false, pixelTiktokNumber: 0, pixelFacebookNumber: 0,
  commission: 0, theme: null,
};

const INITIAL_FORM = {
  name: '', monthlyPrice: 0, yearlyPrice: 0,
  currency: 'DZD', isActive: true, stripePriceId: '',
  features: { ...INITIAL_FEATURES },
};

const planToForm = (plan) => ({
  name:          plan.name,
  monthlyPrice:  Number(plan.monthlyPrice),
  yearlyPrice:   Number(plan.yearlyPrice),
  currency:      plan.currency,
  isActive:      plan.isActive,
  stripePriceId: plan.stripePriceId || '',
  features: {
    storeNumber:         plan.features?.storeNumber         ?? 1,
    productNumber:       plan.features?.productNumber       ?? 10,
    landingPageNumber:   plan.features?.landingPageNumber   ?? 0,
    isNtfy:              plan.features?.isNtfy              ?? false,
    pixelTiktokNumber:   plan.features?.pixelTiktokNumber   ?? 0,
    pixelFacebookNumber: plan.features?.pixelFacebookNumber ?? 0,
    commission:          Number(plan.features?.commission   ?? 0),
    theme:               plan.features?.theme               ?? null,
  },
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const Badge = ({ children, variant }) => {
  const styles = {
    green: 'bg-green-50 text-green-700',
    gray:  'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
};

const FeaturePill = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-1.5">
    <Icon size={12} className="text-blue-500 shrink-0" />
    <span className="text-[11px] font-semibold text-gray-700">{value} {label}</span>
  </div>
);

// ─── Plan Card ────────────────────────────────────────────────────────────────

const PlanCard = ({ plan, onEdit, onDelete, onToggle }) => {
  const [showYearly, setShowYearly] = useState(false);
  const f = plan.features || {};
  const price = showYearly ? Number(plan.yearlyPrice) : Number(plan.monthlyPrice);
  const savings = plan.monthlyPrice > 0
    ? Math.round((1 - Number(plan.yearlyPrice) / (Number(plan.monthlyPrice) * 12)) * 100)
    : 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 transition-opacity ${plan.isActive ? '' : 'opacity-60'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-gray-900 text-[15px]">{plan.name}</p>
        <Badge variant={plan.isActive ? 'green' : 'gray'}>
          {plan.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Interval toggle */}
      <div className="flex items-center gap-1 self-start bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setShowYearly(false)}
          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors ${!showYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setShowYearly(true)}
          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors ${showYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
        >
          Yearly
        </button>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-gray-900 leading-none">
          {price.toLocaleString()}
        </span>
        <span className="text-sm text-gray-400 font-medium">
          {plan.currency} / {showYearly ? 'yr' : 'mo'}
        </span>
      </div>

      {/* Savings badge */}
      {showYearly && savings > 0 && (
        <div className="text-[11px] font-bold text-green-600 bg-green-50 rounded-lg px-2.5 py-1.5 self-start">
          Save {savings}% vs monthly
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-2 gap-1.5">
        <FeaturePill icon={Store}      label="Stores"        value={f.storeNumber ?? 0} />
        <FeaturePill icon={Package}    label="Products"      value={f.productNumber ?? 0} />
        <FeaturePill icon={FileText}   label="Landing pages" value={f.landingPageNumber ?? 0} />
        <FeaturePill icon={TrendingUp} label="% Commission"  value={Number(f.commission ?? 0).toFixed(1)} />
        {f.isNtfy && (
          <div className="col-span-2 flex items-center gap-1.5 bg-blue-50 rounded-xl px-2.5 py-1.5">
            <Bell size={12} className="text-blue-500" />
            <span className="text-[11px] font-semibold text-blue-700">Notifications enabled</span>
          </div>
        )}
        {(f.pixelFacebookNumber > 0 || f.pixelTiktokNumber > 0) && (
          <div className="col-span-2 text-[11px] text-gray-400 font-medium px-1">
            Pixels: {f.pixelFacebookNumber} FB · {f.pixelTiktokNumber} TT
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <button onClick={onEdit} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
          <Pencil size={13} /> Edit
        </button>
        <button onClick={onToggle} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors ml-auto">
          {plan.isActive
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

const NumberInput = ({ value, onChange, min = 0, step = 1 }) => (
  <input type="number" min={min} step={step} value={value}
    onChange={e => onChange(parseFloat(e.target.value) || 0)}
    className={inputCls} />
);

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

const PlanModal = ({ initial, mode, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState(initial);
  const isEditing = mode === 'edit';

  useEffect(() => { setForm(initial); }, [initial]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const setFeature = (key, value) =>
    setForm(prev => ({ ...prev, features: { ...prev.features, [key]: value } }));

  const savings = form.monthlyPrice > 0
    ? Math.round((1 - form.yearlyPrice / (form.monthlyPrice * 12)) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 sticky top-0 bg-white border-b border-gray-100 z-10">
          <h2 className="text-[15px] font-black text-gray-900">
            {isEditing ? 'Edit Plan' : 'Create Plan'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={async e => { e.preventDefault(); await onSubmit(form); }}
          className="px-6 py-5 flex flex-col gap-5">

          {/* Plan Info */}
          <section className="flex flex-col gap-4">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Plan Info</p>

            <Field label="Plan name">
              <input required value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Pro Plan" className={inputCls} />
            </Field>

            {/* Dual pricing block */}
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 border border-gray-100">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Pricing</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Monthly price">
                  <NumberInput value={form.monthlyPrice} onChange={v => set('monthlyPrice', v)} />
                </Field>
                <Field label="Yearly price">
                  <NumberInput value={form.yearlyPrice} onChange={v => set('yearlyPrice', v)} />
                </Field>
              </div>

              {/* Live savings preview */}
              {form.monthlyPrice > 0 && form.yearlyPrice > 0 && savings > 0 && (
                <p className="text-[11px] text-green-600 font-bold bg-green-50 rounded-lg px-2.5 py-1.5">
                  ✓ Yearly saves {savings}% vs monthly ({(form.monthlyPrice * 12 - form.yearlyPrice).toLocaleString()} {form.currency})
                </p>
              )}

              <Field label="Currency">
                <select value={form.currency} onChange={e => set('currency', e.target.value)} className={inputCls}>
                  <option value="DZD">DZD</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </Field>
            </div>

            <Field label="Stripe price ID (optional)">
              <input value={form.stripePriceId || ''} onChange={e => set('stripePriceId', e.target.value)}
                placeholder="price_xxxx" className={`${inputCls} font-mono`} />
            </Field>

            <Toggle checked={form.isActive} onChange={v => set('isActive', v)} label="Active" />
          </section>

          {/* Features */}
          <section className="flex flex-col gap-4 pt-4 border-t border-gray-100">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Features & Limits</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stores">
                <NumberInput value={form.features.storeNumber} onChange={v => setFeature('storeNumber', v)} />
              </Field>
              <Field label="Products">
                <NumberInput value={form.features.productNumber} onChange={v => setFeature('productNumber', v)} />
              </Field>
              <Field label="Landing pages">
                <NumberInput value={form.features.landingPageNumber} onChange={v => setFeature('landingPageNumber', v)} />
              </Field>
              <Field label="Commission %">
                <NumberInput value={form.features.commission} onChange={v => setFeature('commission', v)} step={0.1} />
              </Field>
              <Field label="Facebook pixels">
                <NumberInput value={form.features.pixelFacebookNumber} onChange={v => setFeature('pixelFacebookNumber', v)} />
              </Field>
              <Field label="TikTok pixels">
                <NumberInput value={form.features.pixelTiktokNumber} onChange={v => setFeature('pixelTiktokNumber', v)} />
              </Field>
            </div>
            <Toggle checked={form.features.isNtfy} onChange={v => setFeature('isNtfy', v)} label="Push notifications (ntfy)" />
          </section>

          <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEditing ? 'Save changes' : 'Create plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm ───────────────────────────────────────────────────────────

const DeleteConfirm = ({ planName, onCancel, onConfirm, loading }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <Trash2 size={16} className="text-red-500" />
        </div>
        <div>
          <p className="font-black text-gray-900 text-[15px]">Delete "{planName}"?</p>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            The API will block deletion if there are active subscribers.
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

const PlanPage = () => {
  const [plans, setPlans]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalMode, setModalMode]       = useState('create');
  const [editingPlan, setEditingPlan]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try { setPlans(await api.getAll()); }
    catch { showToast('Failed to load plans', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handleCreate = () => { setEditingPlan(null); setModalMode('create'); setModalOpen(true); };
  const handleEdit   = (plan) => { setEditingPlan(plan); setModalMode('edit'); setModalOpen(true); };

  const handleModalSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (modalMode === 'edit' && editingPlan) {
        const updated = await api.update(editingPlan.id, formData);
        setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
        showToast('Plan updated successfully');
      } else {
        const created = await api.create(formData);
        setPlans(prev => [...prev, created]);
        showToast('Plan created successfully');
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (plan) => {
    try {
      const updated = await api.toggle(plan.id);
      setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast(`Plan ${updated.isActive ? 'activated' : 'deactivated'}`);
    } catch { showToast('Failed to update plan', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await api.remove(deleteTarget.id);
      setPlans(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('Plan deleted');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete plan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const modalInitial = modalMode === 'edit' && editingPlan
    ? planToForm(editingPlan)
    : { ...INITIAL_FORM, features: { ...INITIAL_FEATURES } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Subscription Plans</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage the plans your users can subscribe to</p>
        </div>
        <button onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={16} /> New plan
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total plans', value: plans.length },
          { label: 'Active',      value: plans.filter(p => p.isActive).length },
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
      ) : plans.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center">
          <p className="text-gray-400 text-sm font-medium">No plans yet.</p>
          <button onClick={handleCreate} className="mt-3 text-sm font-bold text-blue-600 hover:underline">
            Create your first plan →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan}
              onEdit={() => handleEdit(plan)}
              onDelete={() => setDeleteTarget(plan)}
              onToggle={() => handleToggle(plan)}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <PlanModal initial={modalInitial} mode={modalMode}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          loading={actionLoading}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm planName={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default PlanPage;