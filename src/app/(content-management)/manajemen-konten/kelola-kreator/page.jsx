"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  useGetCreatorStatsQuery,
  useGetCreatorsQuery,
  useUpdateCreatorStatusMutation,
  useGetOverviewStatsQuery,
} from "@/hooks/api/contentManagementSliceAPI";
import backendUrl from "@/const/backendUrl";

// ============================================================
// FORMAT HELPERS
// ============================================================
function formatRupiah(num) {
  if (!num && num !== 0) return "Rp0";
  if (num >= 1_000_000_000) return `Rp${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `Rp${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `Rp${(num / 1_000).toFixed(0)}K`;
  return `Rp${num.toLocaleString("id-ID")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ============================================================
// SVG ICON SYSTEM
// ============================================================
const SvgIcon = ({ size = 16, color = "currentColor", sw = 2, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Icons = {
  Search: ({ s = 16, c = "currentColor" }) => <SvgIcon size={s} color={c}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></SvgIcon>,
  Download: ({ s = 16, c = "currentColor" }) => <SvgIcon size={s} color={c}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></SvgIcon>,
  Filter: ({ s = 15, c = "currentColor" }) => <SvgIcon size={s} color={c}><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></SvgIcon>,
  X: ({ s = 14, c = "currentColor" }) => <SvgIcon size={s} color={c}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></SvgIcon>,
  ChevronD: ({ s = 14, c = "currentColor" }) => <SvgIcon size={s} color={c}><polyline points="6 9 12 15 18 9" /></SvgIcon>,
  ChevronU: ({ s = 14, c = "currentColor" }) => <SvgIcon size={s} color={c}><polyline points="18 15 12 9 6 15" /></SvgIcon>,
  SortAsc: ({ s = 14, c = "currentColor" }) => <SvgIcon size={s} color={c}><path d="M11 5h10M11 9h7M11 13h4" /><path d="M3 7l3-3 3 3M6 4v12" /></SvgIcon>,
  SortDesc: ({ s = 14, c = "currentColor" }) => <SvgIcon size={s} color={c}><path d="M11 5h10M11 9h7M11 13h4" /><path d="M3 17l3 3 3-3M6 20V8" /></SvgIcon>,
  Shield: ({ s = 14, c = "currentColor" }) => <SvgIcon size={s} color={c}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></SvgIcon>,
  ShieldOff: ({ s = 14, c = "currentColor" }) => <SvgIcon size={s} color={c}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></SvgIcon>,
  ShieldChk: ({ s = 14, c = "currentColor" }) => <SvgIcon size={s} color={c}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></SvgIcon>,
  Alert: ({ s = 14, c = "currentColor" }) => <SvgIcon size={s} color={c}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></SvgIcon>,
  Calendar: ({ s = 13, c = "currentColor" }) => <SvgIcon size={s} color={c}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></SvgIcon>,
  Revenue: ({ s = 13, c = "currentColor" }) => <SvgIcon size={s} color={c}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></SvgIcon>,
  Content: ({ s = 13, c = "currentColor" }) => <SvgIcon size={s} color={c}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></SvgIcon>,
  Users: ({ s = 20, c = "currentColor" }) => <SvgIcon size={s} color={c}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></SvgIcon>,
  Active: ({ s = 20, c = "#22C55E" }) => <SvgIcon size={s} color={c}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></SvgIcon>,
  Suspended: ({ s = 20, c = "#F97316" }) => <SvgIcon size={s} color={c}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></SvgIcon>,
  HighRisk: ({ s = 20, c = "#EF4444" }) => <SvgIcon size={s} color={c}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></SvgIcon>,
  TrendUp: ({ s = 20, c = "#22C55E" }) => <SvgIcon size={s} color={c}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></SvgIcon>,
  Spin: ({ s = 14, c = "currentColor" }) => <svg className="animate-spin" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
  Info: ({ s = 14, c = "currentColor" }) => <SvgIcon size={s} color={c}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></SvgIcon>,
  Eye: ({ s = 17, c = "currentColor" }) => <SvgIcon size={s} color={c}><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><circle cx="12" cy="12" r="3" /></SvgIcon>,
};

// ============================================================
// TOAST SYSTEM
// ============================================================
let toastListeners = [];
let toastId = 0;
function emitToast(toast) {
  const id = ++toastId;
  toastListeners.forEach((fn) => fn({ ...toast, id }));
  return id;
}
function useToasts() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), toast.duration || 3500);
    };
    toastListeners.push(handler);
    return () => { toastListeners = toastListeners.filter((fn) => fn !== handler); };
  }, []);
  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  return { toasts, remove };
}
const TOAST_STYLES = {
  success: { bar: "border-green-500", iconBg: "bg-green-50", iconColor: "#16a34a", title: "text-green-800", msg: "text-green-600" },
  error: { bar: "border-red-500", iconBg: "bg-red-50", iconColor: "#dc2626", title: "text-red-800", msg: "text-red-600" },
  warning: { bar: "border-orange-500", iconBg: "bg-orange-50", iconColor: "#d97706", title: "text-orange-800", msg: "text-orange-600" },
  info: { bar: "border-[#1297DC]", iconBg: "bg-blue-50", iconColor: "#1297DC", title: "text-blue-800", msg: "text-blue-600" },
};
function ToastContainer() {
  const { toasts, remove } = useToasts();
  if (typeof window === "undefined") return null;
  return createPortal(
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none" style={{ maxWidth: 380 }}>
      {toasts.map((t) => {
        const s = TOAST_STYLES[t.type] || TOAST_STYLES.info;
        return (
          <div key={t.id} className={`pointer-events-auto flex items-start gap-3 rounded-xl shadow-2xl px-4 py-3.5 bg-white border-l-4 ${s.bar}`}
            style={{ animation: "slideInRight 0.3s cubic-bezier(.17,.84,.44,1) both" }}>
            <div className={`w-8 h-8 rounded-full ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icons.Info s={14} c={s.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              {t.title && <p className={`text-xs font-bold uppercase tracking-wide ${s.title}`}>{t.title}</p>}
              {t.message && <p className={`text-sm mt-0.5 ${s.msg}`}>{t.message}</p>}
            </div>
            <button onClick={() => remove(t.id)} className="text-gray-300 hover:text-gray-500 transition mt-0.5">
              <Icons.X s={12} c="currentColor" />
            </button>
          </div>
        );
      })}
      <style>{`@keyframes slideInRight { from{opacity:0;transform:translateX(60px) scale(0.95)} to{opacity:1;transform:translateX(0) scale(1)} }`}</style>
    </div>,
    document.body
  );
}

// ============================================================
// CONFIRM DIALOG
// ============================================================
function ConfirmDialog({ open, onClose, onConfirm, config }) {
  useEffect(() => {
    if (!open) return;
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);
  if (!open || typeof window === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[99990] flex items-center justify-center" style={{ animation: "fadeInBackdrop 0.2s ease both" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" style={{ animation: "popIn 0.25s cubic-bezier(.17,.84,.44,1) both" }}>
        <div className={`h-1 w-full ${config?.accentBar || "bg-gray-400"}`} />
        <div className="p-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${config?.iconBg || "bg-gray-100"}`}>{config?.icon}</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{config?.title || "Konfirmasi"}</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">{config?.message}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Batal</button>
            <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition ${config?.confirmCls || "bg-gray-800 hover:bg-gray-900"}`}>{config?.confirmLabel || "Konfirmasi"}</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeInBackdrop{from{opacity:0}to{opacity:1}}@keyframes popIn{from{opacity:0;transform:scale(0.88) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>,
    document.body
  );
}

// ============================================================
// SUSPEND DIALOG
// ============================================================
function SuspendDialog({ open, onClose, onConfirm, creatorName }) {
  const [suspendDays, setSuspendDays] = useState("7");
  const parsedDays = parseInt(suspendDays, 10);
  const validDays = parsedDays >= 1 && parsedDays <= 365;
  const QUICK = [3, 7, 14, 30];
  useEffect(() => { if (open) setSuspendDays("7"); }, [open]);
  useEffect(() => {
    if (!open) return;
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);
  if (!open || typeof window === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[99990] flex items-center justify-center" style={{ animation: "fadeInBackdrop 0.2s ease both" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" style={{ animation: "popIn 0.25s cubic-bezier(.17,.84,.44,1) both" }}>
        <div className="h-1 w-full bg-orange-500" />
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4"><Icons.Alert s={22} c="#ea580c" /></div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Suspend Creator</h3>
          <p className="text-sm text-gray-500 mb-5">Tentukan durasi suspend untuk <span className="font-semibold text-gray-800">{creatorName}</span>.</p>
          <div className="flex gap-2 mb-3">
            {QUICK.map((d) => (
              <button key={d} onClick={() => setSuspendDays(String(d))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${parsedDays === d ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}>
                {d}h
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 relative">
              <input type="text" inputMode="numeric" pattern="[0-9]*" value={suspendDays}
                onChange={(e) => setSuspendDays(e.target.value.replace(/\D/g, ""))}
                onBlur={() => { if (!suspendDays || parsedDays < 1) setSuspendDays("7"); else if (parsedDays > 365) setSuspendDays("365"); }}
                className={`w-full border-2 rounded-xl px-3 py-2.5 text-center text-lg font-bold focus:outline-none transition ${validDays || suspendDays === "" ? "border-orange-200 focus:border-orange-500 text-orange-600" : "border-red-300 text-red-500"}`} />
            </div>
            <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">hari (1–365)</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Batal</button>
            <button onClick={() => { if (!validDays) return; onConfirm(parsedDays); onClose(); }} disabled={!validDays}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition">
              Suspend {validDays ? parsedDays : "–"} Hari
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeInBackdrop{from{opacity:0}to{opacity:1}}@keyframes popIn{from{opacity:0;transform:scale(0.88) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>,
    document.body
  );
}

// ============================================================
// EXPORT DIALOG
// ============================================================
function ExportDialog({ open, onClose, done, filename }) {
  useEffect(() => {
    if (!open) return;
    const esc = (e) => { if (e.key === "Escape" && done) onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, done, onClose]);
  if (!open || typeof window === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[99990] flex items-center justify-center" style={{ animation: "fadeInBackdrop 0.2s ease both" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs mx-4 overflow-hidden" style={{ animation: "popIn 0.25s cubic-bezier(.17,.84,.44,1) both" }}>
        <div className={`h-1 w-full transition-all duration-700 ${done ? "bg-green-500" : "bg-[#1297DC]"}`} />
        <div className="p-6 text-center">
          {!done ? (
            <>
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4"><Icons.Spin s={28} c="#1297DC" /></div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Mengekspor Data…</h3>
              <p className="text-sm text-gray-400">Sedang menyiapkan file CSV kreator</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4"><Icons.Active s={28} c="#16a34a" /></div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Export Berhasil!</h3>
              <p className="text-sm text-gray-400 mb-1">File telah diunduh otomatis</p>
              <p className="text-xs text-green-600 font-semibold mb-5 truncate">{filename}</p>
              <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition">Tutup</button>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeInBackdrop{from{opacity:0}to{opacity:1}}@keyframes popIn{from{opacity:0;transform:scale(0.88) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>,
    document.body
  );
}

// ============================================================
// STATUS CONFIG
// ============================================================
const STATUS_OPTIONS = [
  { action: "activate", label: "Active", cls: "text-green-700 hover:bg-green-50" },
  { action: "deactivate", label: "Inactive", cls: "text-gray-500 hover:bg-gray-50" },
  { action: "suspend", label: "Suspended", cls: "text-orange-600 hover:bg-orange-50" },
  { action: "block", label: "Blocked", cls: "text-gray-900 hover:bg-gray-100" },
  { action: "delete", label: "Deleted", cls: "text-red-600 hover:bg-red-50" },
];
const STATUS_BADGE = {
  Active: { pill: "bg-green-100 text-green-700 border border-green-300", chevron: "#15803d" },
  Inactive: { pill: "bg-gray-100 text-gray-500 border border-gray-300", chevron: "#6b7280" },
  Suspended: { pill: "bg-orange-100 text-orange-600 border border-orange-300", chevron: "#ea580c" },
  Blocked: { pill: "bg-gray-900 text-white border border-gray-900", chevron: "#ffffff" },
  Deleted: { pill: "bg-red-100 text-red-600 border border-red-300", chevron: "#dc2626" },
};
function getConfirmConfig(action, creatorName) {
  const configs = {
    activate: { accentBar: "bg-green-500", iconBg: "bg-green-100", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>, title: "Aktifkan Creator", message: `Anda yakin ingin mengaktifkan kembali akun creator ${creatorName}?`, confirmLabel: "Ya, Aktifkan", confirmCls: "bg-green-500 hover:bg-green-600" },
    deactivate: { accentBar: "bg-gray-400", iconBg: "bg-gray-100", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>, title: "Nonaktifkan Creator", message: `Anda yakin ingin menonaktifkan akun creator ${creatorName}?`, confirmLabel: "Ya, Nonaktifkan", confirmCls: "bg-gray-600 hover:bg-gray-700" },
    block: { accentBar: "bg-gray-900", iconBg: "bg-gray-100", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>, title: "Blokir Creator", message: `Anda yakin ingin memblokir ${creatorName}? Akun akan diblokir permanen.`, confirmLabel: "Blokir", confirmCls: "bg-gray-900 hover:bg-gray-800" },
    delete: { accentBar: "bg-red-500", iconBg: "bg-red-100", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>, title: "Hapus Creator", message: `⚠️ Tindakan ini tidak dapat dibatalkan. Yakin ingin menghapus ${creatorName}?`, confirmLabel: "Hapus Permanen", confirmCls: "bg-red-600 hover:bg-red-700" },
  };
  return configs[action] || null;
}
function getToastConfig(action, creatorName, success) {
  if (!success) return { type: "error", title: "Gagal", message: "Perubahan status gagal diterapkan. Coba lagi." };
  const msgs = {
    activate: { type: "success", title: "Creator Diaktifkan", message: `${creatorName} kini dapat mengakses platform.` },
    deactivate: { type: "info", title: "Creator Dinonaktifkan", message: `${creatorName} tidak dapat login sementara.` },
    suspend: { type: "warning", title: "Creator Disuspend", message: `${creatorName} telah disuspend sesuai durasi.` },
    block: { type: "warning", title: "Creator Diblokir", message: `${creatorName} diblokir dari platform.` },
    delete: { type: "error", title: "Creator Dihapus", message: `Akun ${creatorName} telah dihapus permanen.` },
  };
  return msgs[action] || { type: "success", title: "Berhasil", message: "Status creator diperbarui." };
}

// ============================================================
// STATUS SELECT
// ============================================================
function StatusSelect({ creator, onUpdate, loading }) {
  const [open, setOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);
  const currentStatus = creator.status;
  const badge = STATUS_BADGE[currentStatus] || STATUS_BADGE["Inactive"];
  const creatorName = creator.profileName || creator.username;

  const calcPos = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 4, right: window.innerWidth - rect.right - window.scrollX });
  };
  const handleOpen = () => { calcPos(); setOpen(true); };
  const handleSelect = (opt) => {
    setOpen(false);
    if (opt.action === "suspend") { calcPos(); setShowSuspend(true); }
    else {
      const cfg = getConfirmConfig(opt.action, creatorName);
      if (cfg) { setPendingAction(opt.action); setShowConfirm(true); }
      else onUpdate(creator, opt.action, 0);
    }
  };
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (triggerRef.current?.contains(e.target)) return; setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <button ref={triggerRef} onClick={handleOpen} disabled={loading}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none transition-opacity ${badge.pill} ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-75 cursor-pointer"}`}>
        {loading
          ? <Icons.Spin s={10} c={badge.chevron} />
          : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={badge.chevron} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        }
        {currentStatus}
      </button>
      {open && typeof window !== "undefined" && createPortal(
        <div style={{ position: "fixed", top: pos.top - window.scrollY, right: pos.right, zIndex: 9999, width: 130 }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden py-1"
          onMouseDown={(e) => e.stopPropagation()}>
          <div className="px-3 py-1.5 border-b border-gray-100 mb-0.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ubah Status</p>
          </div>
          {STATUS_OPTIONS.map((opt) => (
            <button key={opt.action} onClick={() => handleSelect(opt)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold transition flex items-center gap-2 ${opt.cls} ${currentStatus === opt.label ? "bg-blue-50" : ""}`}>
              {currentStatus === opt.label && <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="12" /></svg>}
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
      <ConfirmDialog open={showConfirm}
        onClose={() => { setShowConfirm(false); setPendingAction(null); }}
        onConfirm={() => { if (pendingAction) onUpdate(creator, pendingAction, 0); setPendingAction(null); }}
        config={pendingAction ? getConfirmConfig(pendingAction, creatorName) : null} />
      <SuspendDialog open={showSuspend} onClose={() => setShowSuspend(false)}
        onConfirm={(days) => onUpdate(creator, "suspend", days)} creatorName={creatorName} />
    </>
  );
}

// ============================================================
// RISK BADGE
// ============================================================
function RiskBadge({ risk, reportCount }) {
  const map = {
    "High Risk": { cls: "bg-red-50 text-red-600 border-red-200", Icon: () => <Icons.ShieldOff s={12} c="#dc2626" /> },
    "Warning": { cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: () => <Icons.Alert s={12} c="#d97706" /> },
    "Healthy": { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: () => <Icons.ShieldChk s={12} c="#16a34a" /> },
  };
  const cfg = map[risk] || map["Healthy"];
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
        <cfg.Icon />{risk}
      </span>
      {reportCount > 0 && <span className="text-[10px] text-red-500 font-semibold">{reportCount} laporan</span>}
    </div>
  );
}

// ============================================================
// FILTER STATE & HELPERS
// ============================================================
const EMPTY_FILTERS = {
  statuses: [], risks: [],
  joinPreset: "", joinFrom: "", joinTo: "",
  minRevenue: "", maxRevenue: "",
  minContent: "", maxContent: "",
  minReports: "", maxReports: "",
  sortBy: "joinDate", sortDir: "desc",
};
const JOIN_PRESETS = [
  { label: "30 hari terakhir", value: "30d" },
  { label: "3 bulan terakhir", value: "90d" },
  { label: "6 bulan terakhir", value: "180d" },
  { label: "Tahun ini", value: "year" },
];
const JOIN_PRESET_MAP = Object.fromEntries(JOIN_PRESETS.map(p => [p.value, p.label]));
const SORT_OPTIONS = [
  { value: "joinDate", label: "Tanggal Bergabung" },
  { value: "revenue", label: "Revenue" },
  { value: "content", label: "Jumlah Konten" },
  { value: "reports", label: "Jumlah Laporan" },
  { value: "name", label: "Nama (A–Z)" },
];
function countActiveFilters(f) {
  return [
    f.statuses.length > 0,
    f.risks.length > 0,
    !!(f.joinPreset || f.joinFrom || f.joinTo),
    !!(f.minRevenue || f.maxRevenue),
    !!(f.minContent || f.maxContent),
    !!(f.minReports || f.maxReports),
    f.sortBy !== "joinDate" || f.sortDir !== "desc",
  ].filter(Boolean).length;
}
function buildFilterSummary(f, search) {
  const parts = [];
  if (search) parts.push(`kata kunci "${search}"`);
  if (f.statuses.length) parts.push(`status ${f.statuses.join(", ")}`);
  if (f.risks.length) parts.push(`risiko ${f.risks.join(", ")}`);
  if (f.joinPreset) parts.push(JOIN_PRESET_MAP[f.joinPreset] || f.joinPreset);
  else if (f.joinFrom || f.joinTo) parts.push(`gabung ${f.joinFrom || "…"} — ${f.joinTo || "…"}`);
  if (f.minRevenue || f.maxRevenue) parts.push(`revenue ${f.minRevenue || "0"}K–${f.maxRevenue || "∞"}K`);
  if (f.minContent || f.maxContent) parts.push(`konten ${f.minContent || "0"}–${f.maxContent || "∞"}`);
  if (f.minReports || f.maxReports) parts.push(`laporan ${f.minReports || "0"}–${f.maxReports || "∞"}`);
  return parts;
}

// ============================================================
// FILTER CHIP
// ============================================================
function FilterChip({ icon, label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-white border border-[#1297DC]/30 text-[#0c6da1] text-xs font-semibold rounded-full shadow-sm">
      <span className="opacity-60">{icon}</span>
      {label}
      <button onClick={onRemove} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-500 text-gray-400 transition ml-0.5">
        <Icons.X s={10} c="currentColor" />
      </button>
    </span>
  );
}

// ============================================================
// FILTER RESULT BANNER
// ============================================================
function FilterResultBanner({ totalFiltered, totalAll, filterParts, onClearAll }) {
  if (!filterParts.length) return null;
  const ratio = totalAll > 0 ? Math.round((totalFiltered / totalAll) * 100) : 0;
  return (
    <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-[#1297DC]/20 rounded-2xl px-5 py-3.5 mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#1297DC]/10 flex items-center justify-center flex-shrink-0">
          <Icons.Filter s={14} c="#1297DC" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-800">Hasil Filter</span>
            <span className="px-2 py-0.5 bg-[#1297DC] text-white text-xs font-bold rounded-full">
              {totalFiltered.toLocaleString("id-ID")} kreator
            </span>
            {totalAll > 0 && <span className="text-xs text-gray-400">dari {totalAll.toLocaleString("id-ID")} ({ratio}%)</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Filter: {filterParts.map((p, i) => (
              <React.Fragment key={i}>
                <span className="font-semibold text-gray-700">{p}</span>
                {i < filterParts.length - 1 && <span className="text-gray-300"> · </span>}
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>
      <button onClick={onClearAll}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition">
        <Icons.X s={10} c="currentColor" /> Hapus Filter
      </button>
    </div>
  );
}

// ============================================================
// TOGGLE CHIP
// ============================================================
function ToggleChip({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${active ? "bg-[#1297DC] text-white border-[#1297DC] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-[#1297DC]/60 hover:text-[#1297DC]"
        }`}>
      {children}
    </button>
  );
}
function FilterSection({ title, hint, children }) {
  return (
    <div className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
      {hint && <p className="text-[11px] text-gray-400 mb-3">{hint}</p>}
      {!hint && <div className="mb-3" />}
      {children}
    </div>
  );
}
function NumInput({ label, value, onChange, placeholder, min = "0" }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-1 font-medium">{label}</p>
      <input type="number" min={min} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1297DC]/20 focus:border-[#1297DC]" />
    </div>
  );
}

// ============================================================
// ADVANCED FILTER DRAWER
// ============================================================
const RISK_OPTIONS = ["High Risk", "Warning", "Healthy"];
const STATUS_FILTER_OPTIONS = ["Active", "Inactive", "Suspended", "Blocked", "Deleted"];

function AdvancedFilterDrawer({ isOpen, onClose, filters, onApply }) {
  const [local, setLocal] = useState(filters);
  useEffect(() => { if (isOpen) setLocal(filters); }, [isOpen, filters]);
  const toggle = (key, val) => setLocal(p => ({
    ...p, [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val]
  }));
  const activeCount = countActiveFilters(local);
  const handleReset = () => { onApply(EMPTY_FILTERS); onClose(); };
  const handleApply = () => { onApply(local); onClose(); };
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[460px] bg-white shadow-2xl flex flex-col"
        style={{ animation: "drawerIn .2s cubic-bezier(.4,0,.2,1)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1297DC]/10 flex items-center justify-center"><Icons.Filter s={15} c="#1297DC" /></div>
            <div>
              <p className="text-sm font-bold text-gray-900">Filter & Urutkan</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {activeCount > 0 ? <span className="text-[#1297DC] font-semibold">{activeCount} filter aktif</span> : "Saring kreator berdasarkan kriteria"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
            <Icons.X s={14} c="currentColor" />
          </button>
        </div>
        <div className="px-6 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2 flex-shrink-0">
          <Icons.Info s={13} c="#1297DC" />
          <p className="text-[11px] text-blue-600">Filter diterapkan di server. Klik <strong>Terapkan</strong> untuk melihat hasil.</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <FilterSection title="Urutkan Berdasarkan" hint="Pilih kolom pengurutan dan arah.">
            <div className="grid grid-cols-2 gap-2 mb-2">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setLocal(p => ({ ...p, sortBy: opt.value }))}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition ${local.sortBy === opt.value ? "bg-[#1297DC] text-white border-[#1297DC]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1297DC]/60"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setLocal(p => ({ ...p, sortDir: "desc" }))}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${local.sortDir === "desc" ? "bg-[#1297DC] text-white border-[#1297DC]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1297DC]/60"}`}>
                <Icons.SortDesc s={12} c="currentColor" /> Terbesar / Terbaru
              </button>
              <button onClick={() => setLocal(p => ({ ...p, sortDir: "asc" }))}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${local.sortDir === "asc" ? "bg-[#1297DC] text-white border-[#1297DC]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1297DC]/60"}`}>
                <Icons.SortAsc s={12} c="currentColor" /> Terkecil / Terlama
              </button>
            </div>
          </FilterSection>
          <FilterSection title="Status Kreator" hint="Kosong = semua status.">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTER_OPTIONS.map(s => (
                <ToggleChip key={s} active={local.statuses.includes(s)} onClick={() => toggle("statuses", s)}>{s}</ToggleChip>
              ))}
            </div>
          </FilterSection>
          <FilterSection title="Risk Level" hint="Berdasarkan jumlah laporan konten kreator.">
            <div className="flex flex-wrap gap-2">
              {RISK_OPTIONS.map(r => (
                <ToggleChip key={r} active={local.risks.includes(r)} onClick={() => toggle("risks", r)}>
                  {r === "High Risk" ? "🔴 High Risk" : r === "Warning" ? "🟡 Warning" : "🟢 Healthy"}
                </ToggleChip>
              ))}
            </div>
          </FilterSection>
          <FilterSection title="Tanggal Bergabung">
            <p className="text-[11px] text-gray-500 mb-2 font-medium">Pilih cepat:</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {JOIN_PRESETS.map(p => (
                <ToggleChip key={p.value} active={local.joinPreset === p.value}
                  onClick={() => setLocal(prev => ({ ...prev, joinPreset: prev.joinPreset === p.value ? "" : p.value, joinFrom: "", joinTo: "" }))}>
                  {p.label}
                </ToggleChip>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mb-2 font-medium">Atau rentang kustom:</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Dari tanggal</p>
                <input type="date" value={local.joinFrom}
                  onChange={e => setLocal(p => ({ ...p, joinFrom: e.target.value, joinPreset: "" }))}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1297DC]/20 focus:border-[#1297DC]" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Sampai tanggal</p>
                <input type="date" value={local.joinTo}
                  onChange={e => setLocal(p => ({ ...p, joinTo: e.target.value, joinPreset: "" }))}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1297DC]/20 focus:border-[#1297DC]" />
              </div>
            </div>
          </FilterSection>
          <FilterSection title="Revenue (dalam ribuan Rp)" hint="Contoh: min 100 = Rp100K, max 5000 = Rp5M.">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <NumInput label="Minimal (K)" value={local.minRevenue} onChange={v => setLocal(p => ({ ...p, minRevenue: v }))} placeholder="0" />
              <NumInput label="Maksimal (K)" value={local.maxRevenue} onChange={v => setLocal(p => ({ ...p, maxRevenue: v }))} placeholder="∞" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { l: "Rp0 (belum ada)", min: "0", max: "0" },
                { l: "< Rp1M", min: "1", max: "999" },
                { l: "Rp1M – Rp10M", min: "1000", max: "9999" },
                { l: "Rp10M+", min: "10000", max: "" },
              ].map(q => (
                <button key={q.l} onClick={() => setLocal(p => ({ ...p, minRevenue: q.min, maxRevenue: q.max }))}
                  className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-lg text-xs font-medium border transition ${local.minRevenue === q.min && local.maxRevenue === q.max ? "bg-[#1297DC] text-white border-[#1297DC]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1297DC]/60"}`}>
                  {q.l}
                </button>
              ))}
            </div>
          </FilterSection>
          <FilterSection title="Jumlah Konten" hint="Filter kreator berdasarkan produktivitas konten.">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <NumInput label="Minimal konten" value={local.minContent} onChange={v => setLocal(p => ({ ...p, minContent: v }))} placeholder="0" />
              <NumInput label="Maksimal konten" value={local.maxContent} onChange={v => setLocal(p => ({ ...p, maxContent: v }))} placeholder="∞" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { l: "Belum ada (0)", min: "0", max: "0" },
                { l: "1–9 konten", min: "1", max: "9" },
                { l: "10–49 konten", min: "10", max: "49" },
                { l: "50+ konten", min: "50", max: "" },
              ].map(q => (
                <button key={q.l} onClick={() => setLocal(p => ({ ...p, minContent: q.min, maxContent: q.max }))}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition ${local.minContent === q.min && local.maxContent === q.max ? "bg-[#1297DC] text-white border-[#1297DC]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1297DC]/60"}`}>
                  {q.l}
                </button>
              ))}
            </div>
          </FilterSection>
          <FilterSection title="Jumlah Laporan" hint="Berguna untuk menemukan kreator bermasalah.">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <NumInput label="Minimal laporan" value={local.minReports} onChange={v => setLocal(p => ({ ...p, minReports: v }))} placeholder="0" />
              <NumInput label="Maksimal laporan" value={local.maxReports} onChange={v => setLocal(p => ({ ...p, maxReports: v }))} placeholder="∞" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { l: "Bersih (0)", min: "0", max: "0" },
                { l: "1–4 laporan", min: "1", max: "4" },
                { l: "5–9 laporan", min: "5", max: "9" },
                { l: "10+", min: "10", max: "" },
              ].map(q => (
                <button key={q.l} onClick={() => setLocal(p => ({ ...p, minReports: q.min, maxReports: q.max }))}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition ${local.minReports === q.min && local.maxReports === q.max ? "bg-[#1297DC] text-white border-[#1297DC]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1297DC]/60"}`}>
                  {q.l}
                </button>
              ))}
            </div>
          </FilterSection>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          {activeCount > 0 && (
            <p className="text-xs text-center text-[#1297DC] font-semibold mb-3">{activeCount} kategori filter/urutan aktif</p>
          )}
          <div className="flex gap-3">
            <button onClick={handleReset} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition">Reset Semua</button>
            <button onClick={handleApply} className="flex-1 px-4 py-2.5 rounded-xl bg-[#1297DC] text-white text-sm font-semibold hover:bg-[#0e7ab8] transition flex items-center justify-center gap-2 shadow-sm">
              <Icons.Filter s={13} c="white" /> Terapkan
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes drawerIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </>
  );
}

// ============================================================
// SORT COLUMN HEADER
// ============================================================
function SortHeader({ label, sortKey, currentSort, currentDir, onChange }) {
  const isActive = currentSort === sortKey;
  return (
    <button onClick={() => onChange(sortKey, isActive && currentDir === "desc" ? "asc" : "desc")}
      className={`flex items-center gap-1 group ${isActive ? "text-[#1297DC]" : "text-gray-500 hover:text-gray-700"}`}>
      <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      <span className="opacity-60">
        {isActive
          ? (currentDir === "desc" ? <Icons.ChevronD s={12} c="currentColor" /> : <Icons.ChevronU s={12} c="currentColor" />)
          : <Icons.ChevronD s={12} c="#9ca3af" />}
      </span>
    </button>
  );
}

// ============================================================
// STAT CARD
// ============================================================
function StatCard({ icon, iconBg, label, value, sub, subColor = "text-gray-400" }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-3 hover:shadow-md transition">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 tabular-nums">{value}</p>
        {sub && <p className={`text-xs mt-0.5 font-semibold ${subColor}`}>{sub}</p>}
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE  ←  BAGIAN YANG BERUBAH
// ============================================================
const LIMIT = 10;

export default function KelolaKreatorPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showDrawer, setShowDrawer] = useState(false);

  const [loadingCreatorId, setLoadingCreatorId] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [exportFilename, setExportFilename] = useState("");

  const { data: statsData, isLoading: statsLoading } = useGetCreatorStatsQuery();
  const { data: overviewData, isLoading: overviewLoading } = useGetOverviewStatsQuery();

  // ── BACKEND-SIDE FILTER: kirim semua params ke server ──
  const { data: creatorsData, isLoading: listLoading, isFetching } =
    useGetCreatorsQuery({
      page,
      limit: LIMIT,
      search,
      statuses: filters.statuses,
      risks: filters.risks,
      joinPreset: filters.joinPreset,
      joinFrom: filters.joinFrom,
      joinTo: filters.joinTo,
      minRevenue: filters.minRevenue,
      maxRevenue: filters.maxRevenue,
      minContent: filters.minContent,
      maxContent: filters.maxContent,
      minReports: filters.minReports,
      maxReports: filters.maxReports,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
    });

  const [updateStatus] = useUpdateCreatorStatusMutation();

  // ── Baca langsung dari response backend ──
  const displayed = creatorsData?.data || [];
  const totalFiltered = creatorsData?.total ?? 0;
  const totalPages = creatorsData?.totalPages ?? 1;
  // totalAll untuk banner (total tanpa filter — bisa dari stats)
  const totalAll = statsData?.data?.totalCreators ?? totalFiltered;

  const activeFilterCount = countActiveFilters(filters);
  const isFiltered = activeFilterCount > 0 || !!search;
  const filterParts = buildFilterSummary(filters, search);

  const handleApplyFilters = (f) => { setFilters(f); setPage(1); };
  const handleClearAll = () => { setFilters(EMPTY_FILTERS); setSearch(""); setSearchInput(""); setPage(1); };
  const handleColumnSort = (key, dir) => { setFilters(f => ({ ...f, sortBy: key, sortDir: dir })); setPage(1); };

  // Reset ke page 1 saat search berubah
  useEffect(() => { setPage(1); }, [search]);

  const handleExport = useCallback(async () => {
    const filename = `creators_${Date.now()}.csv`;
    setExportFilename(filename); setExportDone(false); setExportOpen(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ search });
      filters.statuses.forEach(s => params.append("status", s));
      const res = await fetch(`${backendUrl}/management/creators/export?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob); link.download = filename; link.click();
      setExportDone(true);
    } catch {
      setExportOpen(false);
      emitToast({ type: "error", title: "Export Gagal", message: "Terjadi kesalahan saat mengekspor data." });
    }
  }, [search, filters.statuses]);

  const handleUpdateStatus = async (creator, action, suspendDays) => {
    if (!action) return;
    const creatorName = creator.profileName || creator.username;
    setLoadingCreatorId(creator.userId);
    try {
      await updateStatus({ userId: creator.userId, action, suspendDays }).unwrap();
      emitToast(getToastConfig(action, creatorName, true));
    } catch {
      emitToast(getToastConfig(action, creatorName, false));
    } finally {
      setLoadingCreatorId(null);
    }
  };

  // Active filter chips
  const chips = [
    filters.statuses.length && { key: "statuses", icon: <Icons.Shield s={10} c="#1297DC" />, label: filters.statuses.join(", "), clear: () => handleApplyFilters({ ...filters, statuses: [] }) },
    filters.risks.length && { key: "risks", icon: <Icons.ShieldOff s={10} c="#1297DC" />, label: filters.risks.join(", "), clear: () => handleApplyFilters({ ...filters, risks: [] }) },
    (filters.joinPreset || filters.joinFrom || filters.joinTo) && {
      key: "join", icon: <Icons.Calendar s={10} c="#1297DC" />,
      label: filters.joinPreset ? JOIN_PRESET_MAP[filters.joinPreset] : `${filters.joinFrom || "…"} — ${filters.joinTo || "…"}`,
      clear: () => handleApplyFilters({ ...filters, joinPreset: "", joinFrom: "", joinTo: "" }),
    },
    (filters.minRevenue || filters.maxRevenue) && { key: "rev", icon: <Icons.Revenue s={10} c="#1297DC" />, label: `Revenue: ${filters.minRevenue || "0"}K – ${filters.maxRevenue || "∞"}K`, clear: () => handleApplyFilters({ ...filters, minRevenue: "", maxRevenue: "" }) },
    (filters.minContent || filters.maxContent) && { key: "cnt", icon: <Icons.Content s={10} c="#1297DC" />, label: `Konten: ${filters.minContent || "0"} – ${filters.maxContent || "∞"}`, clear: () => handleApplyFilters({ ...filters, minContent: "", maxContent: "" }) },
    (filters.minReports || filters.maxReports) && { key: "rep", icon: <Icons.Alert s={10} c="#1297DC" />, label: `Laporan: ${filters.minReports || "0"} – ${filters.maxReports || "∞"}`, clear: () => handleApplyFilters({ ...filters, minReports: "", maxReports: "" }) },
    (filters.sortBy !== "joinDate" || filters.sortDir !== "desc") && {
      key: "sort", icon: <Icons.SortDesc s={10} c="#1297DC" />,
      label: `Urut: ${SORT_OPTIONS.find(s => s.value === filters.sortBy)?.label || ""} (${filters.sortDir === "desc" ? "↓" : "↑"})`,
      clear: () => handleApplyFilters({ ...filters, sortBy: "joinDate", sortDir: "desc" }),
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F4F6F9] p-6">
      <ToastContainer />
      <ExportDialog open={exportOpen} done={exportDone} filename={exportFilename}
        onClose={() => { setExportOpen(false); setExportDone(false); }} />

      {/* ── HEADER ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kelola Kreator</h1>
        <p className="text-gray-400 text-sm mt-0.5">Monitor, filter, dan kelola status kreator platform</p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Icons.Users s={20} c="#3B82F6" />} iconBg="bg-blue-50"
          label="Total Kreator"
          value={statsLoading ? "…" : (statsData?.data?.totalCreators ?? 0).toLocaleString("id-ID")}
          sub={statsData?.data ? `+${statsData.data.newThisMonth ?? 0} bulan ini` : undefined} subColor="text-emerald-600" />
        <StatCard icon={<Icons.Active s={20} c="#22C55E" />} iconBg="bg-emerald-50"
          label="Kreator Aktif"
          value={statsLoading ? "…" : (statsData?.data?.activeCreators ?? 0).toLocaleString("id-ID")}
          sub={statsData?.data ? `${statsData.data.activePercentage ?? 0}% dari total` : undefined} />
        <StatCard
          icon={<Icons.TrendUp s={20} c="#22C55E" />}
          iconBg="bg-green-50"
          label="Creator Earning"
          value={statsLoading ? "…" : formatRupiah(statsData?.data?.totalRevenue ?? 0)}
          sub={!overviewLoading && overviewData?.data ? `${overviewData.data.revenueGrowthPct ?? 0}% Pertumbuhan` : undefined}
          subColor={overviewData?.data?.revenueGrowthPct >= 0 ? "text-emerald-600" : "text-red-500"}
        />
        <StatCard icon={<Icons.Suspended s={20} c="#F97316" />} iconBg="bg-orange-50"
          label="Rasio Suspend"
          value={statsLoading ? "…" : `${statsData?.data?.suspendedRatio ?? 0}%`}
          sub="Metrik manajemen risiko" />
      </div>

      {/* ── TOOLBAR ── */}
      <div className="bg-white rounded-2xl shadow-sm mb-4">
        <div className="flex gap-3 items-center p-4">
          <div className="flex-1 relative">
            <input type="text" placeholder="Cari nama atau username kreator… (Enter)"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1297DC] bg-gray-50 focus:bg-white transition" />
            <button onClick={() => { setSearch(searchInput); setPage(1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1297DC] transition">
              <Icons.Search s={15} c="currentColor" />
            </button>
            {searchInput && (
              <button onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <Icons.X s={12} c="currentColor" />
              </button>
            )}
          </div>
          <button onClick={() => setShowDrawer(true)}
            className={`relative flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition ${activeFilterCount > 0 ? "border-[#1297DC] text-[#1297DC] bg-[#1297DC]/5" : "border-gray-200 text-gray-600 hover:border-[#1297DC]/50"}`}>
            <Icons.Filter s={14} c={activeFilterCount > 0 ? "#1297DC" : "#6b7280"} />
            Filter & Urut
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1297DC] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1297DC]/50 hover:text-[#1297DC] transition">
            <Icons.Download s={14} c="currentColor" /> Export CSV
          </button>
        </div>
        {chips.length > 0 && (
          <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
            <span className="text-[11px] text-gray-400 font-semibold">Aktif:</span>
            {chips.map(c => <FilterChip key={c.key} icon={c.icon} label={c.label} onRemove={c.clear} />)}
            <button onClick={handleClearAll} className="text-[11px] text-red-400 hover:text-red-600 font-bold transition ml-1 underline underline-offset-2">
              Hapus semua
            </button>
          </div>
        )}
      </div>

      {/* ── FILTER RESULT BANNER ── */}
      <FilterResultBanner
        totalFiltered={totalFiltered} totalAll={totalAll}
        filterParts={filterParts} onClearAll={handleClearAll}
      />

      {/* ── TABLE ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-bold text-gray-800">
              {isFiltered ? "Hasil Filter" : "Semua Kreator"}
              <span className="text-gray-400 font-normal text-xs ml-2">
                {displayed.length > 0
                  ? `— menampilkan ${((page - 1) * LIMIT + 1).toLocaleString()}–${Math.min(page * LIMIT, totalFiltered).toLocaleString()} dari ${totalFiltered.toLocaleString()} kreator`
                  : "— tidak ada hasil"}
              </span>
            </p>
            {isFiltered && totalFiltered === 0 && (
              <p className="text-xs text-gray-400 mt-0.5">Tidak ada kreator yang cocok. Coba ubah filter.</p>
            )}
          </div>
          {totalPages > 1 && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
              Hal. {page} / {totalPages}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-6 py-3.5">
                  <SortHeader label="Kreator" sortKey="name" currentSort={filters.sortBy} currentDir={filters.sortDir} onChange={handleColumnSort} />
                </th>
                <th className="text-left px-4 py-3.5">
                  <SortHeader label="Bergabung" sortKey="joinDate" currentSort={filters.sortBy} currentDir={filters.sortDir} onChange={handleColumnSort} />
                </th>
                <th className="text-center px-4 py-3.5">
                  <SortHeader label="Konten" sortKey="content" currentSort={filters.sortBy} currentDir={filters.sortDir} onChange={handleColumnSort} />
                </th>
                <th className="text-left px-4 py-3.5">
                  <SortHeader label="Revenue" sortKey="revenue" currentSort={filters.sortBy} currentDir={filters.sortDir} onChange={handleColumnSort} />
                </th>
                <th className="text-center px-4 py-3.5">
                  <SortHeader label="Risk" sortKey="reports" currentSort={filters.sortBy} currentDir={filters.sortDir} onChange={handleColumnSort} />
                </th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {listLoading || isFetching ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                        <div><div className="h-3.5 w-32 bg-gray-200 rounded mb-1.5" /><div className="h-3 w-20 bg-gray-100 rounded" /></div>
                      </div>
                    </td>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-16 mx-auto" /></td>
                    ))}
                  </tr>
                ))
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <Icons.Users s={26} c="#d1d5db" />
                      </div>
                      <p className="text-base font-semibold text-gray-500">Tidak ada kreator ditemukan</p>
                      <p className="text-sm text-gray-400 mt-1 text-center max-w-xs">
                        {isFiltered ? "Coba ubah atau hapus beberapa filter." : "Belum ada kreator terdaftar."}
                      </p>
                      {isFiltered && (
                        <button onClick={handleClearAll}
                          className="mt-4 px-5 py-2 bg-[#1297DC] text-white text-sm font-semibold rounded-xl hover:bg-[#0e7ab8] transition">
                          Hapus Semua Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                displayed.map(creator => (
                  <tr key={creator.userId} className="border-b border-gray-50 hover:bg-[#1297DC]/[0.02] transition group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {creator.imageUrl
                          ? <img src={creator.imageUrl} alt={creator.profileName} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-100" />
                          : <div className="w-10 h-10 rounded-full bg-[#1297DC] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {(creator.profileName || creator.username || "?")[0].toUpperCase()}
                          </div>
                        }
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-[#1297DC] transition line-clamp-1">
                            {creator.profileName || creator.username}
                          </p>
                          <p className="text-[11px] text-gray-400">@{creator.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-gray-700 font-medium">{formatDate(creator.joinDate)}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-sm font-bold ${creator.contentCount === 0 ? "text-gray-300" : "text-gray-800"}`}>
                        {creator.contentCount ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-bold text-gray-900">{formatRupiah(creator.revenue)}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <RiskBadge risk={creator.risk} reportCount={creator.reportCount} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[creator.status]?.pill || ''}`}>
                        {creator.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => router.push(`/manajemen-konten/kelola-kreator/${creator.creatorId}`)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1297DC] border border-[#1297DC]/30 hover:bg-[#1297DC] hover:text-white transition mx-auto"
                        title="Lihat detail kreator">
                        <Icons.Eye s={15} c="currentColor" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/40">
          <p className="text-xs text-gray-500">
            {totalFiltered === 0
              ? "Tidak ada hasil"
              : `${((page - 1) * LIMIT + 1).toLocaleString("id-ID")} – ${Math.min(page * LIMIT, totalFiltered).toLocaleString("id-ID")} dari ${totalFiltered.toLocaleString("id-ID")} kreator`}
            {isFiltered && totalAll > totalFiltered && (
              <span className="text-gray-400"> (dari {totalAll.toLocaleString("id-ID")} total)</span>
            )}
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-30 hover:border-[#1297DC]/50 transition">«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold disabled:opacity-30 hover:border-[#1297DC]/50 transition">‹ Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                acc.push(p); return acc;
              }, [])
              .map((p, i) => p === "…"
                ? <span key={`e${i}`} className="px-1 text-gray-300 text-xs">…</span>
                : <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${p === page ? "bg-[#1297DC] text-white shadow-sm" : "border border-gray-200 hover:border-[#1297DC]/50 text-gray-600"}`}>
                  {p}
                </button>
              )
            }
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold disabled:opacity-30 hover:border-[#1297DC]/50 transition">Next ›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-30 hover:border-[#1297DC]/50 transition">»</button>
          </div>
        </div>
      </div>

      {/* ── FILTER DRAWER ── */}
      <AdvancedFilterDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </div>
  );
}