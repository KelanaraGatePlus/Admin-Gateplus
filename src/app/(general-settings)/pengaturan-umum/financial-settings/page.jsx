"use client";

// ============================================================
// FILE REPLACE PENUH:
// C:\Users\ALIEF MUZAKHI\Project_Kelanara\Admin-Gateplus\src\app\(general-settings)\pengaturan-umum\financial-settings\page.jsx
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  Save, Plus, Pencil, Trash2, X, Check,
  Loader2, AlertCircle, CheckCircle2,
} from "lucide-react";
import {
  useGetFinancialSettingsQuery,
  useUpdateFinancialSettingsMutation,
  useGetSubscriptionTiersQuery,
  useCreateSubscriptionTierMutation,
  useUpdateSubscriptionTierMutation,
  useDeleteSubscriptionTierMutation,
} from "@/hooks/api/financialSliceAPI";

// ── Helper: parse error dari RTK Query ───────────────────────────────────────
// Menangani: network error (tanpa .data), validasi Zod (errors array),
// dan error message biasa dari server
function parseRTKError(err, fallback = "Terjadi kesalahan. Coba lagi.") {
  if (!err) return fallback;
  // Network error / server down — tidak ada .data sama sekali
  if (!err.data && err.error) return "Tidak dapat terhubung ke server. Periksa koneksi Anda.";
  if (!err.data) return fallback;
  // Validasi Zod — array errors
  if (Array.isArray(err.data.errors) && err.data.errors.length > 0) {
    return err.data.errors.join(", ");
  }
  return err.data.message || fallback;
}

// ── Toast notification ────────────────────────────────────────────────────
function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error:   "bg-red-50 border-red-200 text-red-800",
  };
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className={`fixed top-5 right-5 z-[100] flex items-start gap-3 px-4 py-3
                     border rounded-xl shadow-lg max-w-sm animate-in fade-in
                     slide-in-from-top-2 ${styles[type]}`}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <p className="text-sm font-medium leading-snug">{message}</p>
      <button onClick={onClose} className="ml-auto opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

// ── Badge persentase ───────────────────────────────────────────────────────
function PercentBadge({ value, color = "blue" }) {
  const cls = {
    blue:  "bg-blue-50 text-blue-600 border border-blue-200",
    green: "bg-green-50 text-green-600 border border-green-200",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${cls[color]}`}>
      {value}%
    </span>
  );
}

// ── Input field ────────────────────────────────────────────────────────────
function SettingInput({ label, value, onChange, placeholder, disabled = false, error }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800
                   focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent
                   disabled:bg-gray-50 disabled:text-gray-400 transition-colors
                   ${error ? "border-red-400 bg-red-50" : "border-gray-300"}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Toggle checkbox ────────────────────────────────────────────────────────
function ToggleCheckbox({ checked, onChange, disabled = false }) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${checked ? "bg-green-500 border-green-500" : "bg-white border-gray-300"}`}
    >
      {checked && <Check size={12} className="text-white" strokeWidth={3} />}
    </div>
  );
}

// ── Skeleton loader ────────────────────────────────────────────────────────
function SectionSkeleton({ rows = 2 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-64 mb-6" />
      <div className={`grid grid-cols-${rows} gap-4`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ── Error section ──────────────────────────────────────────────────────────
function SectionError({ onRetry }) {
  return (
    <div className="bg-white rounded-xl border border-red-200 p-6 flex items-center
                    justify-between">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle size={16} />
        <p className="text-sm">Gagal memuat data. Periksa koneksi ke server.</p>
      </div>
      {onRetry && (
        <button onClick={onRetry}
          className="text-sm text-red-600 underline hover:no-underline">
          Coba lagi
        </button>
      )}
    </div>
  );
}

// ── Modal Add / Edit Tier ──────────────────────────────────────────────────
function TierModal({ tier, onClose, onSave, isLoading }) {
  const [form, setForm] = useState(
    tier
      ? { name: tier.name, price: String(tier.price), description: tier.description }
      : { name: "", price: "", description: "" }
  );
  const [formErrors, setFormErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.name.trim())        errs.name        = "Nama tier wajib diisi";
    if (!form.price)              errs.price       = "Harga wajib diisi";
    else if (isNaN(parseInt(form.price)) || parseInt(form.price) < 0)
                                  errs.price       = "Harga harus berupa angka positif";
    if (!form.description.trim()) errs.description = "Deskripsi wajib diisi";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      name:        form.name.trim(),
      price:       parseInt(String(form.price).replace(/[^0-9]/g, "")),
      description: form.description.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">
            {tier ? "Edit Tier" : "Add Subscription Tier"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <SettingInput
            label="Tier Name"
            value={form.name}
            onChange={(v) => { setForm((p) => ({ ...p, name: v })); setFormErrors((p) => ({ ...p, name: "" })); }}
            placeholder="e.g. Basic"
            error={formErrors.name}
          />
          <SettingInput
            label="Price (IDR)"
            value={form.price}
            onChange={(v) => { setForm((p) => ({ ...p, price: v })); setFormErrors((p) => ({ ...p, price: "" })); }}
            placeholder="e.g. 49000"
            error={formErrors.price}
          />
          <SettingInput
            label="Description"
            value={form.description}
            onChange={(v) => { setForm((p) => ({ ...p, description: v })); setFormErrors((p) => ({ ...p, description: "" })); }}
            placeholder="e.g. SD Quality, 1 Device"
            error={formErrors.description}
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600
                       disabled:opacity-60 flex items-center gap-2"
          >
            {isLoading && <Loader2 size={13} className="animate-spin" />}
            Save Tier
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tier Card ──────────────────────────────────────────────────────────────
function TierCard({ tier, onEdit, onDelete, isDeleting }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex-1 min-w-[180px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-800">{tier.name}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(tier)}
            className="text-blue-400 hover:text-blue-600 p-0.5 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(tier.id)} disabled={isDeleting}
            className="text-red-400 hover:text-red-600 p-0.5 disabled:opacity-50 transition-colors">
            {isDeleting
              ? <Loader2 size={14} className="animate-spin" />
              : <Trash2 size={14} />}
          </button>
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900 mt-1">
        Rp {Number(tier.price).toLocaleString("id-ID")}
      </div>
      <div className="text-xs text-gray-400 mt-1">{tier.description}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function FinancialSettingsPage() {

  // ── Backend data ─────────────────────────────────────────────────────
  const {
    data:      settingsRes,
    isLoading: loadingSettings,
    isError:   errorSettings,
    refetch:   refetchSettings,
  } = useGetFinancialSettingsQuery();

  const {
    data:      tiersRes,
    isLoading: loadingTiers,
    isError:   errorTiers,
    refetch:   refetchTiers,
  } = useGetSubscriptionTiersQuery();

  const [updateSettings, { isLoading: isSaving }]  = useUpdateFinancialSettingsMutation();
  const [createTier,     { isLoading: isCreating }] = useCreateSubscriptionTierMutation();
  const [updateTier,     { isLoading: isUpdating }] = useUpdateSubscriptionTierMutation();
  const [deleteTier]                                = useDeleteSubscriptionTierMutation();

  // ── Form state ────────────────────────────────────────────────────────
  const [platformFee,    setPlatformFee]    = useState(10);
  const [creatorShare,   setCreatorShare]   = useState(90);
  const [transactionFee, setTransactionFee] = useState("2.5%");
  const [minimumPayout,  setMinimumPayout]  = useState("50000");
  const [payoutSchedule, setPayoutSchedule] = useState("");
  const [refundPolicy,   setRefundPolicy]   = useState("7");
  const [autoPayout,     setAutoPayout]     = useState(false);
  const [taxEnabled,     setTaxEnabled]     = useState(true);
  const [taxRate,        setTaxRate]        = useState("11");

  // Sync form dari backend
  useEffect(() => {
    if (!settingsRes?.data) return;
    const s = settingsRes.data;
    setPlatformFee(s.platformFee        ?? 10);
    setCreatorShare(s.creatorShare      ?? 90);
    setTransactionFee(s.transactionFee  ?? "2.5%");
    setMinimumPayout(String(s.minimumPayout ?? 50000));
    setPayoutSchedule(s.payoutSchedule  ?? "");
    setRefundPolicy(String(s.refundPolicy   ?? 7));
    setAutoPayout(s.autoPayout          ?? false);
    setTaxEnabled(s.taxEnabled          ?? true);
    setTaxRate(String(s.taxRate         ?? 11));
  }, [settingsRes]);

  // ── Toast ─────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = useCallback((type, message) => setToast({ type, message }), []);

  // ── Modal ─────────────────────────────────────────────────────────────
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);

  // ── Handler: platform fee slider ──────────────────────────────────────
  function handlePlatformFeeChange(val) {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setPlatformFee(num);
    setCreatorShare(100 - num);
  }

  // ── Handler: save settings ────────────────────────────────────────────
  async function handleSaveChanges() {
    const pf = parseFloat(platformFee);
    const cs = parseFloat(creatorShare);
    if (isNaN(pf) || isNaN(cs) || Math.abs(pf + cs - 100) > 0.001) {
      showToast("error", "Platform Fee + Creator Share harus sama dengan 100%");
      return;
    }
    const tr = parseFloat(taxRate);
    if (taxEnabled && (isNaN(tr) || tr < 0 || tr > 100)) {
      showToast("error", "Tax Rate harus berupa angka antara 0 dan 100");
      return;
    }

    try {
      await updateSettings({
        platformFee:    pf,
        creatorShare:   cs,
        transactionFee: transactionFee.trim(),
        minimumPayout:  parseInt(String(minimumPayout).replace(/[^0-9]/g, "")) || 0,
        payoutSchedule: payoutSchedule.trim(),
        refundPolicy:   parseInt(refundPolicy) || 7,
        autoPayout,
        taxEnabled,
        taxRate: tr,
      }).unwrap();
      showToast("success", "Pengaturan finansial berhasil disimpan");
    } catch (err) {
      showToast("error", parseRTKError(err, "Gagal menyimpan. Coba lagi."));
    }
  }

  // ── Handler: tier CRUD ────────────────────────────────────────────────
  async function handleSaveTier(form) {
    try {
      if (editingTier) {
        await updateTier({ id: editingTier.id, ...form }).unwrap();
        showToast("success", `Tier "${form.name}" berhasil diupdate`);
      } else {
        await createTier(form).unwrap();
        showToast("success", `Tier "${form.name}" berhasil ditambahkan`);
      }
      setModalOpen(false);
      setEditingTier(null);
    } catch (err) {
      showToast("error", parseRTKError(err, "Gagal menyimpan tier"));
    }
  }

  async function handleDeleteTier(id) {
    const tier = (tiersRes?.data ?? []).find((t) => t.id === id);
    if (!confirm(`Yakin hapus tier "${tier?.name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteTier(id).unwrap();
      showToast("success", `Tier "${tier?.name}" berhasil dihapus`);
    } catch (err) {
      showToast("error", parseRTKError(err, "Gagal menghapus tier"));
    } finally {
      setDeletingId(null);
    }
  }

  // ── Preview split ─────────────────────────────────────────────────────
  const platformAmount = Math.round(100000 * (platformFee / 100));
  const creatorAmount  = 100000 - platformAmount;
  const tiers          = tiersRes?.data ?? [];

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Modal */}
      {modalOpen && (
        <TierModal
          tier={editingTier}
          onClose={() => { setModalOpen(false); setEditingTier(null); }}
          onSave={handleSaveTier}
          isLoading={isCreating || isUpdating}
        />
      )}

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="bg-green-600 px-6 py-5 flex items-center justify-between rounded-t-xl">
        <div>
          <h1 className="text-white text-xl font-bold">Financial Settings</h1>
          <p className="text-green-100 text-sm mt-0.5">
            Platform fees, revenue share, and payout configuration
          </p>
        </div>
        <button
          onClick={handleSaveChanges}
          disabled={isSaving || loadingSettings || errorSettings}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold
            transition-all border bg-white/20 hover:bg-white/30 text-white border-white/40
            disabled:opacity-60"
        >
          {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="p-6 space-y-6">

        {/* ── Revenue Split ────────────────────────────────────────── */}
        {loadingSettings ? <SectionSkeleton rows={2} /> :
         errorSettings   ? <SectionError onRetry={refetchSettings} /> : (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-800">
              Revenue Split Configuration Default
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 mb-5">
              Configure platform and creator revenue share
            </p>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Fee (%)
                </label>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={100} value={platformFee}
                    onChange={(e) => handlePlatformFeeChange(e.target.value)}
                    className="flex-1 accent-green-500" />
                  <PercentBadge value={platformFee} color="blue" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Creator Revenue Share (%)
                </label>
                <div className="flex justify-end">
                  <PercentBadge value={creatorShare} color="green" />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3
                            flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Revenue Split Example (Rp 100,000)
                </p>
                <p className="text-xs text-gray-400">Based on current configuration</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Platform</p>
                  <p className="text-sm font-bold text-green-600">
                    Rp {platformAmount.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Creator</p>
                  <p className="text-sm font-bold text-green-600">
                    Rp {creatorAmount.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SettingInput label="Transaction Fee" value={transactionFee}
                onChange={setTransactionFee} placeholder="e.g. 2.5%" />
              <SettingInput label="Minimum Payout (IDR)" value={minimumPayout}
                onChange={setMinimumPayout} placeholder="e.g. 50000" />
            </div>
          </div>
        )}

        {/* ── Payout Configuration ─────────────────────────────────── */}
        {loadingSettings ? <SectionSkeleton rows={2} /> :
         errorSettings   ? null : (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-800">Payout Configuration</h2>
            <p className="text-xs text-gray-400 mt-0.5 mb-5">
              Creator payout schedule and settings
            </p>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <SettingInput label="Payout Schedule" value={payoutSchedule}
                onChange={setPayoutSchedule} placeholder="e.g. Monthly / Weekly" />
              <SettingInput label="Refund Policy (days)" value={refundPolicy}
                onChange={setRefundPolicy} placeholder="e.g. 7" />
            </div>

            <div className="flex items-center justify-between border border-gray-100
                            rounded-lg px-4 py-3 bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-800">Auto Payout</p>
                <p className="text-xs text-gray-400">
                  Automatically process payouts based on schedule
                </p>
              </div>
              <ToggleCheckbox checked={autoPayout} onChange={setAutoPayout} />
            </div>
          </div>
        )}

        {/* ── Tax Configuration ────────────────────────────────────── */}
        {loadingSettings ? <SectionSkeleton rows={1} /> :
         errorSettings   ? null : (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-800">Tax Configuration</h2>
            <p className="text-xs text-gray-400 mt-0.5 mb-5">
              Configure tax collection and reporting
            </p>

            <div className="flex items-center justify-between border border-gray-100
                            rounded-lg px-4 py-3 bg-gray-50 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-800">Enable Tax Collection</p>
                <p className="text-xs text-gray-400">
                  Collect tax on transactions, base on price before taxes
                </p>
              </div>
              <ToggleCheckbox checked={taxEnabled} onChange={setTaxEnabled} />
            </div>

            {taxEnabled && (
              <SettingInput label="Tax Rate (%)" value={taxRate}
                onChange={setTaxRate} placeholder="e.g. 11" />
            )}
          </div>
        )}

        {/* ── Subscription Tiers ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-base font-bold text-gray-800">Subscription Tiers</h2>
              <p className="text-xs text-gray-400 mt-0.5">Manage subscription plans and pricing</p>
            </div>
            <button
              onClick={() => { setEditingTier(null); setModalOpen(true); }}
              disabled={loadingTiers || errorTiers}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600
                         text-white text-sm font-semibold rounded-lg transition-colors
                         disabled:opacity-60"
            >
              <Plus size={14} />
              Add Tier
            </button>
          </div>

          {loadingTiers ? (
            <div className="flex gap-4 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : errorTiers ? (
            <div className="mt-4">
              <SectionError onRetry={refetchTiers} />
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 mt-4">
              {tiers.length === 0 && (
                <p className="text-sm text-gray-400">
                  Belum ada tier. Klik &quot;+ Add Tier&quot; untuk membuat.
                </p>
              )}
              {tiers.map((tier) => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  onEdit={(t) => { setEditingTier(t); setModalOpen(true); }}
                  onDelete={handleDeleteTier}
                  isDeleting={deletingId === tier.id}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}