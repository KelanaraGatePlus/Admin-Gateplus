"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ============================================================
// HELPERS
// ============================================================
function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function formatRp(n) {
  if (!n && n !== 0) return "Rp0";
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `Rp${(n / 1_000).toFixed(1)}K`;
  return `Rp${n.toLocaleString("id-ID")}`;
}
function formatViews(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("id-ID");
}
function formatSecs(s) {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

async function fetchWithAuth(url, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

// ============================================================
// TOAST SYSTEM
// ============================================================
let toastListeners = [];
let toastId = 0;

function emitToast(toast) {
  const id = ++toastId;
  toastListeners.forEach((fn) => fn({ ...toast, id }));
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== toast.id)),
        3500
      );
    };
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, []);
  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  return { toasts, remove };
}

const TOAST_STYLES = {
  success: {
    bar: "border-green-500",
    iconBg: "bg-green-50",
    iconColor: "#16a34a",
    title: "text-green-800",
    msg: "text-green-600",
  },
  error: {
    bar: "border-red-500",
    iconBg: "bg-red-50",
    iconColor: "#dc2626",
    title: "text-red-800",
    msg: "text-red-600",
  },
  warning: {
    bar: "border-orange-500",
    iconBg: "bg-orange-50",
    iconColor: "#d97706",
    title: "text-orange-800",
    msg: "text-orange-600",
  },
  info: {
    bar: "border-[#1297DC]",
    iconBg: "bg-blue-50",
    iconColor: "#1297DC",
    title: "text-blue-800",
    msg: "text-blue-600",
  },
};

function ToastContainer() {
  const { toasts, remove } = useToasts();
  if (typeof window === "undefined") return null;
  return createPortal(
    <div
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none"
      style={{ maxWidth: 380 }}
    >
      {toasts.map((t) => {
        const s = TOAST_STYLES[t.type] || TOAST_STYLES.info;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl shadow-2xl px-4 py-3.5 bg-white border-l-4 ${s.bar}`}
            style={{
              animation: "slideInRight 0.3s cubic-bezier(.17,.84,.44,1) both",
            }}
          >
            <div
              className={`w-8 h-8 rounded-full ${s.iconBg} flex items-center justify-center flex-shrink-0`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={s.iconColor}
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              {t.title && (
                <p className={`text-xs font-bold uppercase tracking-wide ${s.title}`}>
                  {t.title}
                </p>
              )}
              {t.message && (
                <p className={`text-sm mt-0.5 ${s.msg}`}>{t.message}</p>
              )}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="text-gray-300 hover:text-gray-500 transition mt-0.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
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
// ICONS
// ============================================================
const Icon = ({
  d,
  size = 16,
  color = "currentColor",
  sw = 1.5,
  fill = "none",
  viewBox = "0 0 24 24",
}) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill={fill}
    stroke={color}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(d) ? (
      d.map((p, i) => <path key={i} d={p} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);

const Icons = {
  Back: (p) => <Icon {...p} d="M19 12H5M12 5l-7 7 7 7" />,
  Eye: (p) => (
    <Icon
      {...p}
      d={[
        "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
        "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
      ]}
    />
  ),
  ThumbUp: (p) => (
    <Icon
      {...p}
      d={[
        "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z",
        "M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3",
      ]}
    />
  ),
  Share: (p) => (
    <Icon
      {...p}
      d={[
        "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",
        "M16 6l-4-4-4 4",
        "M12 2v13",
      ]}
    />
  ),
  Bookmark: (p) => (
    <Icon {...p} d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  ),
  Activity: (p) => <Icon {...p} d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  DollarSign: (p) => (
    <Icon
      {...p}
      d={[
        "M12 1v22",
        "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
      ]}
    />
  ),
  Flame: (p) => (
    <Icon
      {...p}
      d="M12 2c0 0-5.5 5.5-5.5 10 0 3 2.5 5.5 5.5 5.5s5.5-2.5 5.5-5.5C17.5 7.5 12 2 12 2z"
    />
  ),
  Shield: (p) => (
    <Icon {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  ),
  Edit: (p) => (
    <Icon
      {...p}
      d={[
        "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
        "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
      ]}
    />
  ),
  Star: (p) => (
    <Icon
      {...p}
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
    />
  ),
  Zap: (p) => <Icon {...p} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  Mail: (p) => (
    <Icon
      {...p}
      d={[
        "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
        "M22 6l-10 7L2 6",
      ]}
    />
  ),
  Lock: (p) => (
    <Icon
      {...p}
      d={[
        "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z",
        "M7 11V7a5 5 0 0 1 10 0v4",
      ]}
    />
  ),
  Ban: (p) => (
    <Icon
      {...p}
      d={[
        "M18.364 5.636A9 9 0 1 1 5.636 18.364 9 9 0 0 1 18.364 5.636z",
        "M5.636 5.636l12.728 12.728",
      ]}
    />
  ),
  Trash: (p) => (
    <Icon
      {...p}
      d={[
        "M3 6h18",
        "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
      ]}
    />
  ),
  ChevronDown: (p) => <Icon {...p} d="M6 9l6 6 6-6" />,
  ExternalLink: (p) => (
    <Icon
      {...p}
      d={[
        "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
        "M15 3h6v6",
        "M10 14L21 3",
      ]}
    />
  ),
  AlertTriangle: (p) => (
    <Icon
      {...p}
      d={[
        "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
        "M12 9v4",
        "M12 17h.01",
      ]}
    />
  ),
  TrendingUp: (p) => (
    <Icon {...p} d={["M23 6L13.5 15.5 8.5 10.5 1 18", "M17 6h6v6"]} />
  ),
  Users: (p) => (
    <Icon
      {...p}
      d={[
        "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
        "M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0",
        "M23 21v-2a4 4 0 0 0-3-3.87",
        "M16 3.13a4 4 0 0 1 0 7.75",
      ]}
    />
  ),
  Play: (p) => <Icon {...p} d="M5 3l14 9-14 9V3z" />,
  X: (p) => <Icon {...p} d={["M18 6L6 18", "M6 6l12 12"]} />,
  // ── BARU: icon CheckCircle untuk Activate Content ──
  CheckCircle: (p) => (
    <Icon
      {...p}
      d={[
        "M22 11.08V12a10 10 0 1 1-5.93-9.14",
        "M22 4L12 14.01l-3-3",
      ]}
    />
  ),
  Spin: ({ size = 16, color = "currentColor" }) => (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
};

// ============================================================
// STATUS CONFIG (Content)
// ============================================================
const STATUS_CONFIG = {
  Active: {
    cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  Reported: {
    cls: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  Suspended: {
    cls: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Active;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cfg.cls}`}
    >
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ============================================================
// CREATOR STATUS CONFIG — sama persis dengan kelola-kreator
// ============================================================
const CREATOR_STATUS_OPTIONS = [
  { action: "activate",   label: "Active",    cls: "text-green-700 hover:bg-green-50" },
  { action: "deactivate", label: "Inactive",  cls: "text-gray-500 hover:bg-gray-50" },
  { action: "suspend",    label: "Suspended", cls: "text-orange-600 hover:bg-orange-50" },
  { action: "block",      label: "Blocked",   cls: "text-gray-900 hover:bg-gray-100" },
  { action: "delete",     label: "Deleted",   cls: "text-red-600 hover:bg-red-50" },
];

const CREATOR_STATUS_BADGE = {
  Active:    { pill: "bg-green-100 text-green-700 border border-green-300",    chevron: "#15803d" },
  Inactive:  { pill: "bg-gray-100 text-gray-500 border border-gray-300",       chevron: "#6b7280" },
  Suspended: { pill: "bg-orange-100 text-orange-600 border border-orange-300", chevron: "#ea580c" },
  Blocked:   { pill: "bg-gray-900 text-white border border-gray-900",          chevron: "#ffffff" },
  Deleted:   { pill: "bg-red-100 text-red-600 border border-red-300",          chevron: "#dc2626" },
};

function getCreatorConfirmConfig(action, creatorName) {
  const configs = {
    activate: {
      accentBar: "bg-green-500", iconBg: "bg-green-100",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
      title: "Aktifkan Creator", message: `Anda yakin ingin mengaktifkan kembali akun creator ${creatorName}?`,
      confirmLabel: "Ya, Aktifkan", confirmCls: "bg-green-500 hover:bg-green-600",
    },
    deactivate: {
      accentBar: "bg-gray-400", iconBg: "bg-gray-100",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
      title: "Nonaktifkan Creator", message: `Anda yakin ingin menonaktifkan akun creator ${creatorName}?`,
      confirmLabel: "Ya, Nonaktifkan", confirmCls: "bg-gray-600 hover:bg-gray-700",
    },
    block: {
      accentBar: "bg-gray-900", iconBg: "bg-gray-100",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
      title: "Blokir Creator", message: `Anda yakin ingin memblokir ${creatorName}? Akun akan diblokir permanen.`,
      confirmLabel: "Blokir", confirmCls: "bg-gray-900 hover:bg-gray-800",
    },
    delete: {
      accentBar: "bg-red-500", iconBg: "bg-red-100",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
      title: "Hapus Creator", message: `⚠️ Tindakan ini tidak dapat dibatalkan. Yakin ingin menghapus ${creatorName}?`,
      confirmLabel: "Hapus Permanen", confirmCls: "bg-red-600 hover:bg-red-700",
    },
  };
  return configs[action] || null;
}

function getCreatorToastConfig(action, creatorName, success) {
  if (!success) return { type: "error", title: "Gagal", message: "Perubahan status gagal diterapkan. Coba lagi." };
  const msgs = {
    activate:   { type: "success", title: "Creator Diaktifkan",    message: `${creatorName} kini dapat mengakses platform.` },
    deactivate: { type: "info",    title: "Creator Dinonaktifkan", message: `${creatorName} tidak dapat login sementara.` },
    suspend:    { type: "warning", title: "Creator Disuspend",     message: `${creatorName} telah disuspend sesuai durasi.` },
    block:      { type: "warning", title: "Creator Diblokir",      message: `${creatorName} diblokir dari platform.` },
    delete:     { type: "error",   title: "Creator Dihapus",       message: `Akun ${creatorName} telah dihapus permanen.` },
  };
  return msgs[action] || { type: "success", title: "Berhasil", message: "Status creator diperbarui." };
}

// ============================================================
// CONFIRM DIALOG — sama persis dengan kelola-kreator
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
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${config?.iconBg || "bg-gray-100"}`}>
            {config?.icon}
          </div>
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
// SUSPEND DIALOG (untuk creator) — sama persis dengan kelola-kreator
// ============================================================
function CreatorSuspendDialog({ open, onClose, onConfirm, creatorName }) {
  const [suspendDays, setSuspendDays] = useState("7");
  const parsedDays = parseInt(suspendDays, 10);
  const validDays  = parsedDays >= 1 && parsedDays <= 365;
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
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
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
// CREATOR STATUS SELECT — IDENTIK dengan kelola-kreator/page.jsx
// ============================================================
function CreatorStatusSelect({ creatorStatus, creatorName, onUpdateStatus, loading }) {
  const [open, setOpen]                   = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [showSuspend, setShowSuspend]     = useState(false);
  const [pos, setPos]                     = useState({ top: 0, left: 0 });
  const triggerRef                        = React.useRef(null);

  const badge = CREATOR_STATUS_BADGE[creatorStatus] || CREATOR_STATUS_BADGE["Inactive"];

  const calcPos = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
  };

  const handleOpen = () => { calcPos(); setOpen(true); };

  const handleSelect = (opt) => {
    setOpen(false);
    if (opt.action === "suspend") {
      setShowSuspend(true);
    } else {
      const cfg = getCreatorConfirmConfig(opt.action, creatorName);
      if (cfg) { setPendingAction(opt.action); setShowConfirm(true); }
      else onUpdateStatus(opt.action, 0);
    }
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        disabled={loading}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold border transition ${badge.pill} ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-75 cursor-pointer"}`}
      >
        <span className="flex items-center gap-1.5">
          {loading
            ? <Icons.Spin size={12} color={badge.chevron} />
            : <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="12"/></svg>
          }
          {loading ? "Memperbarui…" : (creatorStatus || "Unknown")}
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={badge.chevron} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && typeof window !== "undefined" && createPortal(
        <div
          style={{ position: "absolute", top: pos.top - window.scrollY, left: pos.left, zIndex: 9999, width: 180 }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden py-1"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-gray-100 mb-0.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ubah Status Creator</p>
          </div>
          {CREATOR_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.action}
              onClick={() => handleSelect(opt)}
              className={`w-full text-left px-3 py-2.5 text-xs font-semibold transition flex items-center gap-2 ${opt.cls} ${creatorStatus === opt.label ? "bg-blue-50" : ""}`}
            >
              {creatorStatus === opt.label && (
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="12"/></svg>
              )}
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}

      <ConfirmDialog
        open={showConfirm}
        onClose={() => { setShowConfirm(false); setPendingAction(null); }}
        onConfirm={() => { if (pendingAction) onUpdateStatus(pendingAction, 0); setPendingAction(null); }}
        config={pendingAction ? getCreatorConfirmConfig(pendingAction, creatorName) : null}
      />

      <CreatorSuspendDialog
        open={showSuspend}
        onClose={() => setShowSuspend(false)}
        onConfirm={(days) => onUpdateStatus("suspend", days)}
        creatorName={creatorName}
      />
    </>
  );
}

// ============================================================
// SCORE CARD
// ============================================================
function ScoreCard({ icon, label, value, sub, color, bg, border }) {
  return (
    <div className={`rounded-2xl border p-5 ${bg} ${border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center">{icon}</div>
        <span className={`text-3xl font-black ${color}`}>{value}</span>
      </div>
      <p className={`text-sm font-bold ${color}`}>{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

// ============================================================
// CUSTOM TOOLTIP
// ============================================================
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="text-gray-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {formatter ? formatter(p.value) : p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ============================================================
// ADMIN ACTION BUTTON
// ============================================================
function ActionBtn({ icon, label, variant = "default", onClick, loading = false, disabled = false }) {
  const variants = {
    default: "bg-white border border-gray-200 text-gray-700 hover:border-[#1297DC]/50 hover:text-[#1297DC]",
    blue:    "bg-[#1297DC]/10 border border-[#1297DC]/30 text-[#1297DC] hover:bg-[#1297DC] hover:text-white",
    purple:  "bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white",
    orange:  "bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white",
    yellow:  "bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-500 hover:text-white",
    amber:   "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-500 hover:text-white",
    red:     "bg-red-50 border border-red-200 text-red-600 hover:bg-red-500 hover:text-white",
    darkred: "bg-red-600 border border-red-700 text-white hover:bg-red-700",
    // ── BARU: green untuk Activate Content ──
    green:   "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-500 hover:text-white",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${variants[variant]} ${loading || disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? <Icons.Spin size={14} color="currentColor" /> : icon}
      {label}
    </button>
  );
}

// ============================================================
// PIE CHART TRAFFIC
// ============================================================
const TRAFFIC_COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899"];
const TRAFFIC_SOURCES = [
  { name: "Homepage", value: 35 },
  { name: "Search", value: 28 },
  { name: "Recommendation", value: 22 },
  { name: "Social Media", value: 10 },
  { name: "External", value: 5 },
];

// ============================================================
// SEND WARNING MODAL
// ============================================================
function SendWarningModal({ open, onClose, onSubmit, loading }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) { setTitle(""); setMessage(""); }
    if (!open) return;
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);

  if (!open || typeof window === "undefined") return null;
  const canSubmit = title.trim() && message.trim() && !loading;

  return createPortal(
    <div className="fixed inset-0 z-[99990] flex items-center justify-center" style={{ animation: "fadeInBackdrop 0.2s ease both" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" style={{ animation: "popIn 0.25s cubic-bezier(.17,.84,.44,1) both" }}>
        <div className="h-1 w-full bg-yellow-400" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-900">Send Warning</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
              <Icons.X size={14} color="currentColor" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Isi Artikel</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Jelaskan secara detail masalah atau masukan Anda" rows={5}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button onClick={() => canSubmit && onSubmit(title.trim(), message.trim())} disabled={!canSubmit}
              className="flex-1 py-2.5 rounded-xl bg-[#1297DC] hover:bg-[#0e7ab8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition flex items-center justify-center gap-2">
              {loading ? <Icons.Spin size={14} color="white" /> : null}
              Send
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
// SUSPEND CONTENT MODAL
// ── DIUBAH: tambah field "reason" (textarea, required) ──
// ============================================================
function SuspendContentModal({ open, onClose, onConfirm, contentTitle, loading }) {
  const [days, setDays] = useState("7");
  const [reason, setReason] = useState("");
  const parsed = parseInt(days, 10);
  const valid = parsed >= 1 && parsed <= 365;
  // Tombol submit hanya aktif jika durasi valid DAN alasan terisi
  const canSubmit = valid && reason.trim().length > 0 && !loading;
  const QUICK = [3, 7, 14, 30];

  useEffect(() => {
    if (open) { setDays("7"); setReason(""); }
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
        <div className="h-1 w-full bg-red-500" />
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Icons.Ban size={22} color="#dc2626" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Suspend Content</h3>
          <p className="text-sm text-gray-500 mb-4">
            Tentukan durasi suspend untuk konten <span className="font-semibold text-gray-800">"{contentTitle}"</span>.
          </p>

          {/* Quick duration buttons */}
          <div className="flex gap-2 mb-3">
            {QUICK.map((d) => (
              <button key={d} onClick={() => setDays(String(d))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${parsed === d ? "bg-red-500 text-white border-red-500" : "border-gray-200 text-gray-600 hover:border-red-300"}`}>
                {d}h
              </button>
            ))}
          </div>

          {/* Custom duration input */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <input type="text" inputMode="numeric" pattern="[0-9]*" value={days}
                onChange={(e) => setDays(e.target.value.replace(/\D/g, ""))}
                onBlur={() => { if (!days || parsed < 1) setDays("7"); else if (parsed > 365) setDays("365"); }}
                className={`w-full border-2 rounded-xl px-3 py-2.5 text-center text-lg font-bold focus:outline-none transition ${valid || days === "" ? "border-red-200 focus:border-red-500 text-red-600" : "border-red-300 text-red-500"}`} />
            </div>
            <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">hari (1–365)</span>
          </div>

          {/* ── BARU: Alasan suspend (required) ── */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Alasan Suspend <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan mengapa konten ini disuspend. Creator akan menerima notifikasi beserta alasan ini."
              rows={3}
              className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 resize-none transition ${
                reason.trim()
                  ? "border-red-200 focus:ring-red-400/30 focus:border-red-400"
                  : "border-gray-200 focus:ring-red-400/30 focus:border-red-300"
              }`}
            />
            {!reason.trim() && (
              <p className="text-xs text-red-400 mt-1">Alasan wajib diisi sebelum suspend.</p>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Batal</button>
            <button
              onClick={() => canSubmit && onConfirm(parsed, reason.trim())}
              disabled={!canSubmit}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition flex items-center justify-center gap-2"
            >
              {loading ? <Icons.Spin size={14} color="white" /> : null}
              Suspend {valid ? parsed : "–"} Hari
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
// DELETE CONTENT MODAL
// ============================================================
function DeleteContentModal({ open, onClose, onConfirm, contentTitle, loading }) {
  const [inputVal, setInputVal] = useState("");
  const matches = inputVal.trim().toLowerCase() === contentTitle?.trim().toLowerCase();

  useEffect(() => {
    if (open) setInputVal("");
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
        <div className="h-1 w-full bg-red-700" />
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Content</h3>
          <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
            placeholder="[verifikasi dengan ketik judul konten]"
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 mb-3" />
          <p className="text-sm text-gray-600 text-center mb-5">
            Apakah kamu yakin menghapus konten <span className="font-semibold">"{contentTitle}"</span>?
          </p>
          <div className="flex gap-3">
            <button onClick={() => matches && !loading && onConfirm()} disabled={!matches || loading}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition flex items-center justify-center gap-2">
              {loading ? <Icons.Spin size={14} color="white" /> : null}
              Delete
            </button>
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeInBackdrop{from{opacity:0}to{opacity:1}}@keyframes popIn{from{opacity:0;transform:scale(0.88) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>,
    document.body
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function ContentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const contentId = params?.contentId;
  const contentType = searchParams?.get("type") || "Film";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusValue, setStatusValue] = useState("Active");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Creator status state
  const [creatorStatus, setCreatorStatus] = useState("Active");
  const [creatorStatusLoading, setCreatorStatusLoading] = useState(false);

  const [showWarning, setShowWarning] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  // ── BARU: loading state khusus untuk activate content ──
  const [activateLoading, setActivateLoading] = useState(false);

  // ── FETCH DETAIL (dibuat sebagai fungsi agar bisa di-refetch) ──
const fetchDetail = useCallback(() => {
  if (!contentId || !contentType) return;
  fetchWithAuth(
    `${API_BASE}/management/content/${contentId}/detail?type=${contentType}`
  )
    .then(async (r) => {
      setData(r.data);
      setStatusValue(r.data?.status || "Active");

      // ── Ambil creator status dari endpoint /creators/:creatorId/detail ──
      const creatorId = r.data?.creator?.creatorId || r.data?.creator?.id;
      if (creatorId) {
        try {
          const creatorRes = await fetchWithAuth(
            `${API_BASE}/management/creators/${creatorId}/detail`
          );
          setCreatorStatus(creatorRes?.data?.status || "Active");
        } catch {
          // fallback ke data nested jika endpoint gagal
          setCreatorStatus(r.data?.creator?.status || "Active");
        }
      } else {
        setCreatorStatus(r.data?.creator?.status || "Active");
      }

      setLoading(false);
    })
    .catch((e) => {
      setError(e.message);
      setLoading(false);
    });
}, [contentId, contentType]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchDetail();
  }, [fetchDetail]);

  // Close content status dropdown when clicking outside
  useEffect(() => {
    if (!showStatusDropdown) return;
    const handler = (e) => {
      if (!e.target.closest("[data-status-dropdown]")) setShowStatusDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showStatusDropdown]);

  const handleStatusChange = async (newStatus) => {
    setShowStatusDropdown(false);
    setStatusLoading(true);
    try {
      await fetchWithAuth(
        `${API_BASE}/management/content/${contentId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus, type: contentType }),
        }
      );
      setStatusValue(newStatus);
      emitToast({
        type: "success",
        title: "Status Diperbarui",
        message: `Status konten diubah ke ${newStatus}`,
      });
    } catch (e) {
      emitToast({ type: "error", title: "Gagal", message: e.message });
    } finally {
      setStatusLoading(false);
    }
  };

  // ── HANDLER UPDATE CREATOR STATUS ──
const handleUpdateCreatorStatus = async (action, suspendDays) => {
  if (!data?.creator?.userId) return;
  const creatorName =
    data.creator?.profileName || data.creator?.username || "Creator";

  const ACTION_TO_STATUS = {
    activate:   "Active",
    deactivate: "Inactive",
    suspend:    "Suspended",
    block:      "Blocked",
    delete:     "Deleted",
  };

  setCreatorStatusLoading(true);
  try {
    await fetchWithAuth(
      `${API_BASE}/management/creators/${data.creator.userId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ action, suspendDays }),
      }
    );
    const newStatus = ACTION_TO_STATUS[action];
    if (newStatus) setCreatorStatus(newStatus);
    emitToast(getCreatorToastConfig(action, creatorName, true));
  } catch {
    emitToast(getCreatorToastConfig(action, creatorName, false));
  } finally {
    setCreatorStatusLoading(false);
  }
};

  const handleSendWarning = async (title, message) => {
    setActionLoading(true);
    try {
      await fetchWithAuth(
        `${API_BASE}/management/content/${contentId}/send-warning`,
        {
          method: "POST",
          body: JSON.stringify({ type: contentType, title, message }),
        }
      );
      setShowWarning(false);
      emitToast({
        type: "success",
        title: "Peringatan Terkirim",
        message: "Notifikasi telah dikirim ke creator",
      });
    } catch (e) {
      emitToast({ type: "error", title: "Gagal", message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // ── DIUBAH: handleSuspend sekarang menerima days DAN reason ──
  const handleSuspend = async (days, reason) => {
    setActionLoading(true);
    try {
      await fetchWithAuth(
        `${API_BASE}/management/content/${contentId}/suspend`,
        {
          method: "POST",
          body: JSON.stringify({ type: contentType, days, reason }),
        }
      );
      setShowSuspend(false);
      setStatusValue("Suspended");
      emitToast({
        type: "warning",
        title: "Konten Disuspend",
        message: `Konten disuspend selama ${days} hari`,
      });
    } catch (e) {
      emitToast({ type: "error", title: "Gagal", message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // ── BARU: handleActivateContent — aktifkan konten yang sedang disuspend ──
  const handleActivateContent = async () => {
    setActivateLoading(true);
    try {
      await fetchWithAuth(
        `${API_BASE}/management/content/${contentId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: "Active", type: contentType }),
        }
      );
      setStatusValue("Active");
      emitToast({
        type: "success",
        title: "Konten Diaktifkan",
        message: "Konten berhasil diaktifkan kembali sebelum masa suspend berakhir.",
      });
    } catch (e) {
      emitToast({ type: "error", title: "Gagal", message: e.message });
    } finally {
      setActivateLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await fetchWithAuth(
        `${API_BASE}/management/content/${contentId}?type=${contentType}`,
        { method: "DELETE" }
      );
      setShowDelete(false);
      emitToast({
        type: "error",
        title: "Konten Dihapus",
        message: "Konten telah berhasil dihapus",
      });
      setTimeout(() => router.back(), 1500);
    } catch (e) {
      emitToast({ type: "error", title: "Gagal", message: e.message });
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#1297DC] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400">Memuat detail konten…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">Gagal memuat data</p>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#1297DC] text-white rounded-xl text-sm font-semibold"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const d = data || {};

  const TYPE_COLOR = {
    Film: "bg-blue-500", Series: "bg-purple-500", Ebook: "bg-green-500",
    Comic: "bg-orange-500", Podcast: "bg-pink-500",
  };
  const TYPE_BG = {
    Film: "bg-blue-50 text-blue-700", Series: "bg-purple-50 text-purple-700",
    Ebook: "bg-emerald-50 text-emerald-700", Comic: "bg-orange-50 text-orange-700",
    Podcast: "bg-pink-50 text-pink-700",
  };

  const genres = d.genre
    ? d.genre.split(",").map((g) => g.trim()).filter(Boolean)
    : [];

  const retentionCurve  = d.retentionCurve  || [];
  const growth72h       = d.growth72h       || [];
  const revenueTrend    = d.revenueTrend    || [];
  const hourlyActivity  = d.hourlyActivity  || [];

  const creatorName  = d.creator?.profileName || d.creator?.username || "—";
  // ── FIX #3: gunakan creatorId (bukan userId) untuk navigasi ke halaman creator ──
  // Backend mengembalikan creator.id (yang adalah Creator.id = creatorId), bukan userId
  const creatorIdVal = d.creator?.creatorId || d.creator?.id || d.creator?.userId;

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <ToastContainer />

{/* TOP NAV */}
<div className="z-30 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
  <div className="flex items-center gap-4">
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#1297DC] transition"
    >
      <Icons.Back size={16} color="currentColor" />
      Back
    </button>
    <div className="border-l border-gray-200 pl-4">
      <h1 className="text-sm font-bold text-gray-900 leading-tight">Dashboard Evaluasi Konten</h1>
      <p className="text-[11px] text-gray-400 leading-tight">Ringkasan performa, keamanan, dan kontrol administratif dalam satu panel</p>
    </div>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
      <Icons.Users size={14} color="#6b7280" />
    </div>
  </div>
</div>

      <div className="max-w-[1400px] mx-auto px-6 py-6 flex gap-6">
        {/* MAIN COLUMN */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ── HERO CARD ── */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex gap-6">
              <div className="relative w-60 h-44 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 shadow">
                {d.coverUrl ? (
                  <img src={d.coverUrl} alt={d.title} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full ${TYPE_COLOR[d.type] || "bg-blue-500"} flex items-center justify-center`}>
                    <Icons.Play size={40} color="white" fill="white" />
                  </div>
                )}
                {d.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded">
                    {d.duration}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">
                  {d.title || "—"}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  {/*
                    ── FIX #3: klik nama creator → navigasi ke halaman kelola-kreator/[creatorId]
                    Backend mengembalikan creator.id = Creator.id (bukan userId),
                    route frontend: /manajemen-konten/kelola-kreator/[creatorId]
                  ──*/}
                  <button
                    onClick={() => {
                      if (creatorIdVal) {
                        router.push(`/manajemen-konten/kelola-kreator/${creatorIdVal}`);
                      }
                    }}
                    className="text-[#1297DC] text-sm font-semibold hover:underline flex items-center gap-1"
                  >
                    {creatorName}
                    <Icons.ExternalLink size={12} color="#1297DC" />
                  </button>
                  <span className="text-gray-300">·</span>
                  {genres.map((g, i) => (
                    <span key={i} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${i === 0 ? TYPE_BG[d.type] || "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                      {g}
                    </span>
                  ))}
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{formatDate(d.uploadDate)}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">ID: {d.id?.slice(0, 8)?.toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-5 mb-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Icons.Eye size={14} color="#9ca3af" />
                    <strong className="text-gray-900">{formatViews(d.views)}</strong> Views
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icons.ThumbUp size={14} color="#9ca3af" />
                    <strong className="text-gray-900">{d.likeRatio ?? 0}%</strong> Like Ratio
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icons.Share size={14} color="#9ca3af" />
                    <strong className="text-gray-900">{formatViews(d.shareCount)}</strong> Shares
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icons.Bookmark size={14} color="#9ca3af" />
                    <strong className="text-gray-900">{formatViews(d.saveCount)}</strong> Saves
                  </span>
                </div>

                <StatusBadge status={statusValue} />
              </div>
            </div>
          </div>

          {/* ── SCORE CARDS ── */}
          <div className="grid grid-cols-4 gap-4">
            <ScoreCard icon={<Icons.Activity size={18} color="#22c55e" />} label="Performance Score" value={d.perfScore ?? 0} sub="Engagement & retention" color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
            <ScoreCard icon={<Icons.DollarSign size={18} color="#22c55e" />} label="Revenue Integrity" value={d.revIntegrity ?? 0} sub="Fraud detection" color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
            <ScoreCard icon={<Icons.Flame size={18} color="#f97316" />} label="Viral Probability" value={`${d.viralProb ?? 0}%`} sub="Predicted virality" color="text-orange-500" bg="bg-orange-50" border="border-orange-200" />
            <ScoreCard
              icon={<Icons.Shield size={18} color={d.riskScore > 10 ? "#ef4444" : "#22c55e"} />}
              label="Risk Score" value={d.riskScore ?? 0} sub="AI moderation"
              color={d.riskScore > 10 ? "text-red-500" : "text-emerald-600"}
              bg={d.riskScore > 10 ? "bg-red-50" : "bg-emerald-50"}
              border={d.riskScore > 10 ? "border-red-100" : "border-emerald-100"}
            />
          </div>

          {/* ── PERFORMANCE ANALYTICS ── */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Performance Analytics</h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { bg: "bg-blue-50",    tc: "text-xs font-medium text-blue-500",    vc: "text-2xl font-black text-blue-900 mt-1",    label: "Total Views",       val: formatViews(d.views) },
                { bg: "bg-emerald-50", tc: "text-xs font-medium text-emerald-600", vc: "text-2xl font-black text-emerald-900 mt-1", label: "Unique Viewers",    val: formatViews(d.uniqueViewers) },
                { bg: "bg-purple-50",  tc: "text-xs font-medium text-purple-600",  vc: "text-2xl font-black text-purple-900 mt-1",  label: "Completion Rate",   val: `${d.completionRate ?? 0}%` },
                { bg: "bg-orange-50",  tc: "text-xs font-medium text-orange-600",  vc: "text-2xl font-black text-orange-900 mt-1",  label: "Avg Watch Time",    val: formatSecs(d.avgWatchTime) },
                { bg: "bg-rose-50",    tc: "text-xs font-medium text-rose-600",    vc: "text-2xl font-black text-rose-900 mt-1",    label: "Returning Viewers", val: `${d.returningViewers ?? 0}%` },
                { bg: "bg-indigo-50",  tc: "text-xs font-medium text-indigo-600",  vc: "text-2xl font-black text-indigo-900 mt-1",  label: "Like Ratio",        val: `${d.likeRatio ?? 0}%` },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl p-4`}>
                  <p className={s.tc}>{s.label}</p>
                  <p className={s.vc}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Retention Curve */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800">Retention Curve</h3>
                <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full font-semibold">
                  <Icons.AlertTriangle size={11} color="currentColor" />
                  Drop {Math.round(100 - (d.completionRate || 0))}% at minute 12:00
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={retentionCurve}>
                  <defs>
                    <linearGradient id="retContent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(0)}%`} />} />
                  <Area type="monotone" dataKey="content" stroke="#3B82F6" strokeWidth={2} fill="url(#retContent)" name="This Content" dot={{ r: 3, fill: "#3B82F6" }} />
                  <Area type="monotone" dataKey="avg" stroke="#22C55E" strokeWidth={2} fill="none" name="Genre Avg" dot={{ r: 3, fill: "#22C55E" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Growth Acceleration */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3">Growth Acceleration (First 72 Hours)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={growth72h}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip formatter={(v) => v.toLocaleString()} />} />
                  <Area type="monotone" dataKey="views" stroke="#8B5CF6" strokeWidth={2} fill="url(#growthGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── MONETIZATION ── */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Monetization & Revenue</h2>
              {d.hasAnomaly && (
                <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
                  <Icons.AlertTriangle size={11} color="currentColor" /> Revenue Anomaly
                </span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-4 mb-5">
              {[
                { label: "Gross Revenue", value: formatRp(d.grossRevenue), color: "text-gray-900" },
                { label: "Creator Share", value: formatRp(d.creatorShare), color: "text-emerald-600" },
                { label: "Platform Fee",  value: formatRp(d.platformFee),  color: "text-orange-500" },
                { label: "Refunds",       value: formatRp(d.refunds),      color: "text-red-500" },
                { label: "Net Revenue",   value: formatRp(d.netRevenue),   color: "text-blue-700" },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  <p className={`text-xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {d.hasAnomaly && (
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 mb-5 text-sm text-yellow-700 font-semibold">
                <Icons.AlertTriangle size={14} color="#ca8a04" />
                <span><strong>Anomaly Alert:</strong> Sudden spike in day 3</span>
              </div>
            )}

            <h3 className="text-sm font-bold text-gray-800 mb-3">Revenue Trend (30 Days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : `${(v / 1_000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip formatter={formatRp} />} />
                <Area type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── VIRALITY & TREND ── */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Virality & Trend Analytics</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-orange-500">Viral Probability</p>
                <p className="text-3xl font-black text-orange-500 mt-1 flex items-center gap-1.5">🔥 {d.viralProb ?? 0}%</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-medium text-blue-500">Share Rate</p>
                <p className="text-3xl font-black text-blue-700 mt-1">{d.shareRate ?? 0}%</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-xs font-medium text-purple-500">Save Rate</p>
                <p className="text-3xl font-black text-purple-700 mt-1">{d.saveRate ?? 0}%</p>
              </div>
            </div>

            {/* Traffic Source Breakdown */}
            <h3 className="text-sm font-bold text-gray-800 mb-4">Traffic Source Breakdown</h3>
            <div className="flex items-center gap-8 mb-6">
              <div className="flex-shrink-0">
                <PieChart width={160} height={160}>
                  <Pie data={TRAFFIC_SOURCES} cx={75} cy={75} innerRadius={0} outerRadius={75} dataKey="value" startAngle={90} endAngle={-270}>
                    {TRAFFIC_SOURCES.map((_, i) => <Cell key={i} fill={TRAFFIC_COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </div>
              <div className="flex-1 space-y-2">
                {TRAFFIC_SOURCES.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: TRAFFIC_COLORS[i] }} />
                      <span className="text-sm text-gray-600">{s.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Activity */}
            <h3 className="text-sm font-bold text-gray-800 mb-3">Viewer Activity Heatmap (Peak Hours)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => v.toLocaleString()} />} />
                <Bar dataKey="viewers" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── BENCHMARK PERFORMANCE ── */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Benchmark Performance</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <p className="text-xs font-medium text-purple-600">Genre Rank</p>
                <p className="text-4xl font-black text-purple-700 mt-1">{d.genreRank != null ? `#${d.genreRank}` : "—"}</p>
                <p className="text-xs text-purple-400 mt-0.5">of {(d.genreTotal || 0).toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-xs font-medium text-emerald-600">Percentile</p>
                <p className="text-4xl font-black text-emerald-600 mt-1">{d.percentile ?? 0}%</p>
                <p className="text-xs text-emerald-400 mt-0.5">Top performer</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                <p className="text-xs font-medium text-yellow-600">Status</p>
                <p className="text-2xl font-black text-yellow-600 mt-1 flex items-center gap-1.5">⭐ Top {100 - Math.floor(d.percentile || 0)}%</p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-800 mb-4">Performance vs Genre Average</h3>
            <div className="space-y-4">
              {[
                { label: "views",       value: d.vsAvgViews      || 0 },
                { label: "engagement",  value: d.vsAvgEngagement || 0 },
                { label: "retention",   value: d.vsAvgRetention  || 0 },
                { label: "revenue",     value: d.vsAvgRevenue    || 0 },
              ].map((m, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{m.label}</span>
                    <span className={`text-xs font-bold ${m.value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {m.value >= 0 ? "+" : ""}{m.value}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, (m.value / 400) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="w-[280px] flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-20">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Admin Actions</h3>

            {/* ── CREATOR STATUS — identik dengan kelola-kreator ── */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Creator Status</p>
              <p className="text-[11px] text-gray-400 mb-2 truncate">
                <span className="font-semibold text-gray-600">{creatorName}</span>
              </p>
              <CreatorStatusSelect
                creatorStatus={creatorStatus}
                creatorName={creatorName}
                onUpdateStatus={handleUpdateCreatorStatus}
                loading={creatorStatusLoading}
              />
              <p className="text-[11px] text-gray-400 mt-2">Change creator account status</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <ActionBtn icon={<Icons.Edit size={14} color="currentColor" />}  label="Edit Metadata"   variant="blue" />
              <ActionBtn icon={<Icons.Star size={14} color="currentColor" />}  label="Feature Content" variant="purple" />
              <ActionBtn icon={<Icons.Zap size={14} color="currentColor" />}   label="Boost Content"   variant="orange" />
              <ActionBtn icon={<Icons.Mail size={14} color="currentColor" />}  label="Send Warning"    variant="yellow" onClick={() => setShowWarning(true)} />
              <ActionBtn icon={<Icons.Lock size={14} color="currentColor" />}  label="Freeze Revenue"  variant="amber" />
              <ActionBtn icon={<Icons.Ban size={14} color="currentColor" />}   label="Suspend Content" variant="red"     onClick={() => setShowSuspend(true)} />
              {/* ── BARU: Activate Content — tampil tepat di bawah Suspend Content ── */}
              <ActionBtn
                icon={<Icons.CheckCircle size={14} color="currentColor" />}
                label="Activate Content"
                variant="green"
                onClick={handleActivateContent}
                loading={activateLoading}
              />
              <ActionBtn icon={<Icons.Trash size={14} color="currentColor" />} label="Delete Content"  variant="darkred" onClick={() => setShowDelete(true)} />
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      <SendWarningModal
        open={showWarning}
        onClose={() => !actionLoading && setShowWarning(false)}
        onSubmit={handleSendWarning}
        loading={actionLoading}
      />

      {/* ── DIUBAH: SuspendContentModal meneruskan (days, reason) ke handleSuspend ── */}
      <SuspendContentModal
        open={showSuspend}
        onClose={() => !actionLoading && setShowSuspend(false)}
        onConfirm={handleSuspend}
        contentTitle={d.title || ""}
        loading={actionLoading}
      />

      <DeleteContentModal
        open={showDelete}
        onClose={() => !actionLoading && setShowDelete(false)}
        onConfirm={handleDelete}
        contentTitle={d.title || ""}
        loading={actionLoading}
      />
    </div>
  );
}