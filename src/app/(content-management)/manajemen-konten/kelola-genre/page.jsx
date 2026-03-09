"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  useGetGenreStatsQuery,
  useGetGenresQuery,
  useCreateGenresMutation,
  useUpdateGenreMutation,
  useDeleteGenreMutation,
} from "@/hooks/api/contentManagementSliceAPI";

function formatNumber(n) {
  if (!n && n !== 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatRupiah(n) {
  if (!n && n !== 0) return "Rp0";
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(0)}B`;
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `Rp${(n / 1_000).toFixed(0)}K`;
  return `Rp${n}`;
}

// ============================================================
// TOAST NOTIFICATION SYSTEM — Clean White Premium
// ============================================================
function Toast({ toasts, removeToast }) {
  const meta = {
    success: { bar: "#22c55e", icon: "#22c55e", iconBg: "#f0fdf4" },
    error:   { bar: "#ef4444", icon: "#ef4444", iconBg: "#fef2f2" },
    warning: { bar: "#f59e0b", icon: "#f59e0b", iconBg: "#fffbeb" },
    info:    { bar: "#1297DC", icon: "#1297DC", iconBg: "#eff9ff" },
  };
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => {
        const m = meta[t.type] || meta.info;
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-stretch min-w-[320px] max-w-sm rounded-xl overflow-hidden animate-[slideIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
            style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 8px 30px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)" }}
          >
            {/* Left accent bar */}
            <div className="w-1 flex-shrink-0" style={{ background: m.bar }} />
            <div className="flex items-start gap-3 px-4 py-3.5 flex-1">
              <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: m.iconBg }}>
                {t.type === "success" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={m.icon} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {t.type === "error"   && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={m.icon} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                {t.type === "warning" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={m.icon} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01"/></svg>}
                {t.type === "info"    && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={m.icon} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
              </span>
              <div className="flex-1 min-w-0">
                {t.title && <p className="text-sm font-semibold text-gray-900 leading-tight">{t.title}</p>}
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{t.message}</p>
              </div>
              <button onClick={() => removeToast(t.id)} className="flex-shrink-0 ml-1 mt-0.5 text-gray-300 hover:text-gray-500 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (type, title, message, duration = 3800) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  };
  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  return {
    toasts,
    removeToast: remove,
    success: (title, msg) => add("success", title, msg),
    error: (title, msg) => add("error", title, msg),
    warning: (title, msg) => add("warning", title, msg),
    info: (title, msg) => add("info", title, msg),
  };
}

// ============================================================
// SVG ICONS
// ============================================================
function IconFileText({ size = 18, color = "#6b7280" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function IconEye({ size = 18, color = "#6b7280" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconDollarSign({ size = 18, color = "#6b7280" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function IconSearch({ size = 15, color = "#9ca3af" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconEdit({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconTrash({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
function IconActivity({ size = 14, color = "#ef4444" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function IconTag({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}
function IconPlus({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconWarning({ size = 22, color = "#f59e0b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconClose({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconSpinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      className="animate-spin">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ============================================================
// MODAL BASE — Clean White Premium
// ============================================================
function ModalBase({ onClose, children, maxWidth = "max-w-md" }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full ${maxWidth} overflow-hidden rounded-2xl animate-[modalIn_0.28s_cubic-bezier(0.34,1.56,0.64,1)_forwards]`}
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================
// MODAL HEADER — Clean White
// ============================================================
function ModalHeader({ icon, title, subtitle, onClose }) {
  return (
    <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-xs mt-0.5 leading-relaxed text-gray-400">{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ml-4 mt-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
      >
        <IconClose size={14} />
      </button>
    </div>
  );
}

// ============================================================
// MODAL TAMBAH GENRE — Clean White Premium
// ============================================================
function AddGenreModal({ onClose, onSave, loading }) {
  const [names, setNames] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const preview = names.trim()
    ? names.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <ModalBase onClose={onClose}>
      <ModalHeader
        icon={<IconPlus size={17} color="#1297DC" />}
        title="Tambah Genre Baru"
        subtitle="Masukkan satu atau beberapa genre sekaligus"
        onClose={onClose}
      />
      <div className="p-6">
        {/* Tip */}
        <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-5 bg-blue-50 border border-blue-100">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1297DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-xs text-blue-600 leading-relaxed">
            Pisahkan dengan <span className="font-semibold">koma (,)</span> untuk menambahkan banyak genre sekaligus. Contoh: <em className="text-blue-400">Action, Horror, Romance</em>
          </p>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold uppercase tracking-wider block mb-2 text-gray-500">
            Nama Genre <span className="text-red-400">*</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            placeholder="Contoh: Action, Horror, Romance"
            value={names}
            onChange={(e) => setNames(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && names.trim()) onSave(names); }}
            className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 focus:outline-none transition-all bg-gray-50 border-2 border-gray-200 focus:border-[#1297DC] focus:bg-white placeholder-gray-400"
          />
        </div>

        {/* Preview tags */}
        {preview.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2.5 text-gray-400">Preview</p>
            <div className="flex flex-wrap gap-2">
              {preview.map((g, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700">
                  <IconTag size={10} color="#1297DC" />
                  {g}
                </span>
              ))}
            </div>
            <p className="text-xs mt-2 text-gray-400">{preview.length} genre akan ditambahkan</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => onSave(names)}
            disabled={!names.trim() || loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed bg-[#1297DC] hover:bg-[#0e7db8] text-white"
          >
            {loading ? <><IconSpinner size={14} /> Menyimpan...</> : <><IconPlus size={14} /> Simpan Genre</>}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

// ============================================================
// MODAL EDIT GENRE — Clean White Premium
// ============================================================
function EditGenreModal({ genre, onClose, onSave, loading }) {
  const [name, setName] = useState(genre.name || "");
  const inputRef = useRef(null);
  const hasChanged = name.trim() !== (genre.name || "").trim();

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <ModalBase onClose={onClose}>
      <ModalHeader
        icon={<IconEdit size={16} color="#1297DC" />}
        title="Ubah Nama Genre"
        subtitle={`Mengedit "${genre.name}"`}
        onClose={onClose}
      />
      <div className="p-6">
        <div className="mb-5">
          <label className="text-xs font-semibold uppercase tracking-wider block mb-2 text-gray-500">
            Nama Genre <span className="text-red-400">*</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && name.trim() && hasChanged) onSave({ id: genre.id, name, isActive: genre.isActive }); }}
            className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 focus:outline-none transition-all bg-gray-50 border-2 border-gray-200 focus:border-[#1297DC] focus:bg-white"
          />
          {hasChanged && name.trim() && (
            <p className="text-xs mt-2 flex items-center gap-1.5 text-gray-400">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1297DC" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span className="text-gray-400">Dari</span>
              <span className="font-medium text-gray-500">{genre.name}</span>
              <span className="text-gray-300">→</span>
              <span className="font-semibold text-gray-800">{name.trim()}</span>
            </p>
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-6 bg-amber-50 border border-amber-100">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-xs text-amber-700 leading-relaxed">
            Status <strong>aktif/nonaktif</strong> dapat diubah langsung melalui toggle di tabel.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => onSave({ id: genre.id, name, isActive: genre.isActive })}
            disabled={!name.trim() || !hasChanged || loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed bg-[#1297DC] hover:bg-[#0e7db8] text-white"
          >
            {loading ? <><IconSpinner size={14} /> Menyimpan...</> : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

// ============================================================
// MODAL CONFIRM DELETE — White + subtle red border only
// ============================================================
function DeleteConfirmModal({ genre, onClose, onConfirm, loading }) {
  const [confirmText, setConfirmText] = useState("");
  const required = genre.name;
  const isMatch = confirmText.trim().toLowerCase() === required.toLowerCase();

  return (
    <ModalBase onClose={onClose} maxWidth="max-w-sm">
      <div className="p-6">
        {/* Icon zone */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-50 border border-red-100">
            <IconTrash size={22} color="#ef4444" />
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 text-center mb-1">Hapus Genre?</h2>
        <p className="text-sm text-center mb-5 leading-relaxed text-gray-500">
          <span className="font-semibold text-gray-800">&ldquo;{genre.name}&rdquo;</span> akan dihapus permanen dan tidak dapat dipulihkan.
        </p>

        {/* Warning if has data */}
        {(genre.contentCount > 0 || genre.revenue > 0) && (
          <div className="rounded-xl px-4 py-3 mb-5 bg-amber-50 border border-amber-100">
            <p className="text-xs font-semibold mb-1.5 text-amber-700">Data terkait yang akan terpengaruh</p>
            <div className="space-y-1 text-xs text-amber-600">
              {genre.contentCount > 0 && <p>· {genre.contentCount} konten terhubung ke genre ini</p>}
              {genre.revenue > 0 && <p>· Revenue {formatRupiah(genre.revenue)} akan terlepas</p>}
            </div>
          </div>
        )}

        {/* Type to confirm */}
        <div className="mb-5">
          <label className="text-xs font-medium block mb-2 text-gray-500">
            Ketik <span className="font-bold text-red-500">{required}</span> untuk konfirmasi
          </label>
          <input
            type="text"
            placeholder={`Ketik "${required}"`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-900 focus:outline-none transition-all bg-gray-50
              ${confirmText && !isMatch
                ? "border-2 border-red-300 focus:border-red-400"
                : isMatch
                ? "border-2 border-red-300"
                : "border-2 border-gray-200 focus:border-gray-300"}`}
          />
          {confirmText && !isMatch && (
            <p className="text-xs mt-1.5 text-red-500">Nama tidak cocok</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={!isMatch || loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed bg-red-500 hover:bg-red-600 text-white"
          >
            {loading ? <><IconSpinner size={14} /> Menghapus...</> : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

// ============================================================
// MODAL CONFIRM TOGGLE STATUS — White + subtle color border only
// ============================================================
function ToggleStatusModal({ genre, onClose, onConfirm, loading }) {
  const willActivate = !genre.isActive;

  return (
    <ModalBase onClose={onClose} maxWidth="max-w-sm">
      <div className="p-6">
        <div className="flex justify-center mb-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border
            ${willActivate ? "bg-green-50 border-green-100" : "bg-gray-100 border-gray-200"}`}>
            {willActivate ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            )}
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
          {willActivate ? "Aktifkan Genre?" : "Nonaktifkan Genre?"}
        </h2>
        <p className="text-sm text-center mb-6 leading-relaxed text-gray-500">
          <span className="font-semibold text-gray-800">&ldquo;{genre.name}&rdquo;</span>{" "}
          {willActivate
            ? "akan diaktifkan dan dapat digunakan kembali dalam konten."
            : "akan disembunyikan dari pilihan konten baru."}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-40 text-white
              ${willActivate ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}`}
          >
            {loading
              ? <><IconSpinner size={14} /> Memproses...</>
              : willActivate ? "Ya, Aktifkan" : "Ya, Nonaktifkan"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

// ============================================================
// TOGGLE SWITCH COMPONENT
// ============================================================
function ToggleSwitch({ isActive, onToggle, loading }) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      title={isActive ? "Klik untuk nonaktifkan" : "Klik untuk aktifkan"}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
        ${isActive ? "bg-[#1297DC] focus:ring-[#1297DC]/40" : "bg-gray-300 focus:ring-gray-400/40"}
        ${loading ? "opacity-50 cursor-wait" : "cursor-pointer hover:opacity-90"}
      `}
    >
      {loading
        ? <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-3 h-3 border-2 border-white/60 border-t-white rounded-full animate-spin" />
          </span>
        : <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200
              ${isActive ? "translate-x-5" : "translate-x-0"}
            `}
          />
      }
    </button>
  );
}

// ============================================================
// BADGE STATUS
// ============================================================
function StatusBadge({ isActive }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
        Aktif
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
      Nonaktif
    </span>
  );
}

// ============================================================
// STAT CARD
// ============================================================
function StatCard({ icon, iconBg, label, value, sub, accent }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200
      ${accent ? "ring-1 ring-inset " + accent : ""}`}>
      <div className="flex items-center gap-2.5 text-gray-500 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ============================================================
// SKELETON ROW
// ============================================================
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded-lg w-32" /></td>
      <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded-lg w-20" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded-lg w-24" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded-lg w-20" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded-lg w-16" /></td>
      <td className="px-4 py-4"><div className="flex gap-2 justify-center"><div className="h-8 w-8 bg-gray-100 rounded-lg" /><div className="h-8 w-8 bg-gray-100 rounded-lg" /></div></td>
    </tr>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function KelolaGenrePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [deletingGenre, setDeletingGenre] = useState(null);
  const [togglingGenre, setTogglingGenre] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const { data: statsData, isLoading: statsLoading } = useGetGenreStatsQuery();
  const { data: genresData, isLoading: listLoading, isFetching } = useGetGenresQuery({
    page, limit: 10, search, statusFilter,
  });

  const [createGenres, { isLoading: createLoading }] = useCreateGenresMutation();
  const [updateGenre, { isLoading: updateLoading }] = useUpdateGenreMutation();
  const [deleteGenre] = useDeleteGenreMutation();

  const stats = statsData?.data;
  const genres = genresData?.data || [];
  const topPerforming = genresData?.topPerforming || [];
  const pagination = genresData?.pagination;
  const totalPages = pagination?.totalPages || 1;

  // ── Handlers ──────────────────────────────────────────────
  const handleAddGenre = async (names) => {
    const count = names.split(",").map((s) => s.trim()).filter(Boolean).length;
    try {
      await createGenres({ names }).unwrap();
      setShowAddModal(false);
      toast.success("Genre Berhasil Ditambahkan", `${count} genre baru telah disimpan`);
    } catch (err) {
      toast.error("Gagal Menambahkan Genre", err?.data?.message || "Terjadi kesalahan, coba lagi");
    }
  };

  const handleEditGenre = async ({ id, name, isActive }) => {
    try {
      await updateGenre({ id, name, isActive }).unwrap();
      setEditingGenre(null);
      toast.success("Genre Diperbarui", `Nama genre berhasil diubah menjadi "${name}"`);
    } catch (err) {
      toast.error("Gagal Memperbarui", err?.data?.message || "Terjadi kesalahan, coba lagi");
    }
  };

  const handleToggleConfirm = async () => {
    if (!togglingGenre) return;
    setTogglingId(togglingGenre.id);
    const willActivate = !togglingGenre.isActive;
    try {
      await updateGenre({ id: togglingGenre.id, name: togglingGenre.name, isActive: willActivate }).unwrap();
      setTogglingGenre(null);
      toast.success(
        willActivate ? "Genre Diaktifkan" : "Genre Dinonaktifkan",
        `"${togglingGenre.name}" berhasil ${willActivate ? "diaktifkan" : "dinonaktifkan"}`
      );
    } catch (err) {
      toast.error("Gagal Mengubah Status", err?.data?.message || "Terjadi kesalahan, coba lagi");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGenre) return;
    setDeleteLoading(true);
    try {
      await deleteGenre(deletingGenre.id).unwrap();
      setDeletingGenre(null);
      toast.success("Genre Dihapus", `"${deletingGenre.name}" telah dihapus secara permanen`);
    } catch (err) {
      toast.error("Gagal Menghapus", err?.data?.message || "Terjadi kesalahan, coba lagi");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* TOAST */}
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* MODALS */}
      {showAddModal && (
        <AddGenreModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddGenre}
          loading={createLoading}
        />
      )}
      {editingGenre && (
        <EditGenreModal
          genre={editingGenre}
          onClose={() => setEditingGenre(null)}
          onSave={handleEditGenre}
          loading={updateLoading}
        />
      )}
      {deletingGenre && (
        <DeleteConfirmModal
          genre={deletingGenre}
          onClose={() => setDeletingGenre(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
      {togglingGenre && (
        <ToggleStatusModal
          genre={togglingGenre}
          onClose={() => setTogglingGenre(null)}
          onConfirm={handleToggleConfirm}
          loading={togglingId === togglingGenre?.id}
        />
      )}

      <div className="min-h-screen bg-[#F5F5F5] p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Genre Management</h1>
            <p className="text-gray-500 text-sm mt-1">Organize and optimize content categories</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1297DC] text-white rounded-xl font-semibold text-sm hover:bg-[#0e7db8] active:scale-[.98] transition-all shadow-sm shadow-[#1297DC]/20"
          >
            <IconPlus size={16} color="white" />
            Add New Genre
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<IconFileText size={18} color="#3B82F6" />}
            iconBg="bg-blue-50"
            label="Total Content"
            value={statsLoading ? "..." : (stats?.totalContent ?? 0).toLocaleString("id-ID")}
            sub="Across all genres"
          />
          <StatCard
            icon={<IconEye size={18} color="#8B5CF6" />}
            iconBg="bg-purple-50"
            label="Total Views"
            value={statsLoading ? "..." : formatNumber(stats?.totalViews ?? 0)}
            sub="Monthly views"
          />
          <StatCard
            icon={<IconDollarSign size={18} color="#22C55E" />}
            iconBg="bg-green-50"
            label="Total Revenue"
            value={statsLoading ? "..." : formatRupiah(stats?.totalRevenue ?? 0)}
            sub="Total earnings"
          />
          <StatCard
            icon={<IconTag size={18} color="#F97316" />}
            iconBg="bg-orange-50"
            label="Genre Aktif"
            value={statsLoading ? "..." : `${stats?.activeGenres ?? 0} / ${stats?.totalGenres ?? 0}`}
            sub={statsLoading ? "" : `${stats?.inactiveGenres ?? 0} genre nonaktif`}
          />
        </div>

        {/* TOP PERFORMING GENRES */}
        {topPerforming.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Top Performing Genres</h2>
              <span className="text-xs text-gray-400 font-medium">This Month</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topPerforming.map((g) => (
                <div key={g.id}
                  className="rounded-xl p-4 border border-blue-100 bg-gradient-to-br from-blue-50/60 to-blue-50/20 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-extrabold
                      ${g.rank === 1 ? "text-amber-500" : g.rank === 2 ? "text-gray-400" : "text-orange-400"}`}>
                      #{g.rank}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
                      ${g.growth > 0 ? "bg-green-50 text-green-600 border border-green-100" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {g.growth > 0
                          ? <><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>
                          : <><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></>}
                      </svg>
                      {Math.abs(g.growth)}%
                    </span>
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-3 truncate">{g.name}</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Revenue</span>
                      <span className="font-semibold text-gray-800">{formatRupiah(g.revenue)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Content</span>
                      <span className="font-semibold text-gray-800">{g.contentCount} items</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GENRE TABLE */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <input
                type="text"
                placeholder="Cari genre..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1297DC] focus:ring-2 focus:ring-[#1297DC]/10 bg-gray-50 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <IconSearch size={15} color="#9ca3af" />
              </span>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {[
                { value: "all", label: "Semua" },
                { value: "active", label: "Aktif" },
                { value: "inactive", label: "Nonaktif" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === opt.value
                      ? "bg-white text-[#1297DC] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {opt.label}
                  {opt.value === "active" && stats?.activeGenres != null && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                      {stats.activeGenres}
                    </span>
                  )}
                  {opt.value === "inactive" && stats?.inactiveGenres != null && stats.inactiveGenres > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">
                      {stats.inactiveGenres}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {isFetching && !listLoading && (
              <div className="flex items-center gap-1.5 text-xs text-[#1297DC] font-medium">
                <IconSpinner size={12} />
                Memperbarui...
              </div>
            )}
          </div>

          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Genre Hierarchy</h3>
            {pagination?.total != null && (
              <span className="text-xs text-gray-400">{pagination.total} total genre</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Genre Name</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Growth</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listLoading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : genres.length === 0
                  ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <IconTag size={22} color="#d1d5db" />
                          </div>
                          <p className="font-semibold text-gray-500">
                            {statusFilter === "inactive" ? "Tidak ada genre nonaktif" : "Belum ada genre"}
                          </p>
                          <p className="text-sm mt-1">
                            {statusFilter === "all" ? "Mulai dengan menambah genre baru" : "Coba ubah filter pencarian"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                  : genres.map((genre) => (
                    <tr
                      key={genre.id}
                      className={`border-b border-gray-50 transition-colors duration-100
                        ${genre.isActive
                          ? "hover:bg-blue-50/20"
                          : "bg-gray-50/60 hover:bg-gray-100/50"
                        }
                      `}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`font-semibold ${genre.isActive ? "text-gray-900" : "text-gray-400"}`}>
                            {genre.name}
                          </span>
                          {genre.isTrending && genre.isActive && (
                            <span className="flex items-center gap-1 text-xs text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                              <IconActivity size={11} color="#ef4444" />
                              Trending
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <StatusBadge isActive={genre.isActive} />
                          <ToggleSwitch
                            isActive={genre.isActive}
                            loading={togglingId === genre.id}
                            onToggle={() => setTogglingGenre(genre)}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        <span className={genre.isActive ? "" : "opacity-60"}>{genre.contentCount} content</span>
                      </td>

                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        <span className={genre.isActive ? "" : "opacity-60"}>{formatNumber(genre.views)} views</span>
                      </td>

                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                        <span className={genre.isActive ? "" : "opacity-60"}>{formatRupiah(genre.revenue)}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
                          ${genre.growth > 0
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : genre.growth < 0
                            ? "bg-red-50 text-red-500 border border-red-100"
                            : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {genre.growth > 0
                              ? <><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>
                              : genre.growth < 0
                              ? <><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></>
                              : <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></>}
                          </svg>
                          {Math.abs(genre.growth)}%
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingGenre(genre)}
                            title="Edit nama genre"
                            className="group w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#1297DC] hover:bg-blue-50 transition-all text-gray-400 hover:text-[#1297DC]"
                          >
                            <IconEdit size={14} />
                          </button>
                          <button
                            onClick={() => setDeletingGenre(genre)}
                            title="Hapus genre"
                            className="group w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all text-gray-400 hover:text-red-500"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/40">
              <p className="text-sm text-gray-500">
                Menampilkan <strong className="text-gray-700">{genres.length}</strong> dari{" "}
                <strong className="text-gray-700">{pagination?.total || 0}</strong> genre
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-[#1297DC] hover:text-[#1297DC] transition-colors disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                        p === page
                          ? "bg-[#1297DC] text-white shadow-sm shadow-[#1297DC]/20"
                          : "border border-gray-200 hover:border-[#1297DC] hover:text-[#1297DC] text-gray-600"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-[#1297DC] hover:text-[#1297DC] transition-colors disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}