"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import {
  useGetCreatorDetailQuery,
  useUpdateCreatorStatusMutation,
} from "@/hooks/api/contentManagementSliceAPI";
import { useGetReportsQuery } from "@/hooks/api/reportManagementAPI";

// ============================================================
// API HELPER
// ============================================================
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
            style={{ animation: "slideInRight 0.3s cubic-bezier(.17,.84,.44,1) both" }}
          >
            <div className={`w-8 h-8 rounded-full ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.iconColor} strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              {t.title && (
                <p className={`text-xs font-bold uppercase tracking-wide ${s.title}`}>{t.title}</p>
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
// FORMAT HELPERS
// ============================================================
function formatRupiah(num) {
  if (!num && num !== 0) return "Rp0";
  if (num >= 1_000_000_000) return `Rp${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `Rp${(num / 1_000_000).toFixed(0)}M`;
  if (num >= 1_000) return `Rp${(num / 1_000).toFixed(0)}K`;
  return `Rp${num.toLocaleString("id-ID")}`;
}

function formatRupiahFull(num) {
  if (!num && num !== 0) return "Rp0";
  return `Rp${Math.round(num).toLocaleString("id-ID")}`;
}

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dt.getMonth()]} ${yyyy}`;
}

function formatViews(n) {
  if (!n && n !== 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ============================================================
// SCORE CALCULATIONS
// ============================================================
function calcPerformanceScore(creator) {
  if (!creator) return 0;
  const catalog = creator.catalog || [];
  const totalViews = catalog.reduce((s, c) => s + (c.views || 0), 0);
  const totalLikes = catalog.reduce((s, c) => s + (c.likes || 0), 0);
  const totalComments = creator.totalComments || 0;
  const totalShares = creator.totalShares || 0;
  const totalSaves = creator.totalSaves || 0;
  const avgWatchTime = creator.avgWatchTime || 0;
  const avgDuration = creator.avgDuration || 1;
  const completedViews = creator.completedViews || 0;
  const subscribers = creator.subscriberCount || 0;

  if (totalViews === 0) return 0;

  const er = (totalLikes + totalComments + totalShares) / Math.max(totalViews, 1);
  const er_norm = Math.min(er * 1000, 100);

  const wtr = avgDuration > 0 ? avgWatchTime / avgDuration : 0;
  const wtr_norm = Math.min(wtr * 100, 100);

  const cr = totalViews > 0 ? completedViews / totalViews : 0;
  const cr_norm = Math.min(cr * 100, 100);

  const ssr = (totalSaves + totalShares) / Math.max(totalViews, 1);
  const ssr_norm = Math.min(ssr * 2000, 100);

  const aq = subscribers / Math.max(totalViews, 1);
  const aq_norm = Math.min(aq * 5000, 100);

  const score = (er_norm * 0.30) + (wtr_norm * 0.25) + (cr_norm * 0.20) + (ssr_norm * 0.15) + (aq_norm * 0.10);
  return Math.round(Math.min(score, 100));
}

function calcRevenueIntegrityScore(creator) {
  if (!creator) return 0;
  const totalTx = creator.totalTransactions || 0;
  const successTx = creator.successTransactions || 0;
  const refundTx = creator.refundTransactions || 0;
  const fraudTx = creator.fraudTransactions || 0;
  const clicks = creator.totalClicks || 0;
  const monthlyRevenues = creator.monthlyRevenue || [];

  if (totalTx === 0) return 85;

  const convRate = clicks > 0 ? successTx / clicks : 0.5;
  const conv_norm = Math.min(convRate * 200, 100);

  let stability_norm = 80;
  if (monthlyRevenues.length > 2) {
    const vals = monthlyRevenues.map((m) => m.gross || 0);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / vals.length;
    const stddev = Math.sqrt(variance);
    const cv = avg > 0 ? stddev / avg : 1;
    stability_norm = Math.max(0, 100 - cv * 50);
  }

  const refundRate = totalTx > 0 ? refundTx / totalTx : 0;
  const refund_norm = Math.min(refundRate * 500, 100);

  const fraudRate = totalTx > 0 ? fraudTx / totalTx : 0;
  const fraud_norm = Math.min(fraudRate * 1000, 100);

  const txQuality = totalTx > 0 ? successTx / totalTx : 0.9;
  const txQuality_norm = Math.min(txQuality * 100, 100);

  const score =
    (conv_norm * 0.30) +
    (stability_norm * 0.25) +
    ((100 - refund_norm) * 0.20) +
    ((100 - fraud_norm) * 0.20) +
    (txQuality_norm * 0.05);

  return Math.round(Math.min(score, 100));
}

function calcGrowthScore(creator) {
  if (!creator) return 0;
  const followerGrowth = creator.followerGrowthData || [];
  const viewGrowthRate = creator.viewGrowthRate || 0;
  const engagementGrowth = creator.engagementGrowthRate || 0;
  const shareVelocity = creator.shareVelocity || 0;

  const viewGrowth_norm = Math.min(Math.max(viewGrowthRate * 100 + 50, 0), 100);

  let followerGrowth_norm = 50;
  if (followerGrowth.length >= 2) {
    const first = followerGrowth[0]?.count || 0;
    const last = followerGrowth[followerGrowth.length - 1]?.count || 0;
    const growthRate = first > 0 ? (last - first) / first : 0;
    followerGrowth_norm = Math.min(Math.max(growthRate * 200 + 50, 0), 100);
  }

  const engGrowth_norm = Math.min(Math.max(engagementGrowth * 100 + 50, 0), 100);
  const shareVelocity_norm = Math.min(shareVelocity * 10, 100);

  const catalog = creator.catalog || [];
  const recentContent = catalog.filter((c) => {
    const d = new Date(c.uploadDate);
    return (Date.now() - d.getTime()) < 30 * 24 * 3600 * 1000;
  }).length;
  const trend_norm = Math.min(recentContent * 20, 100);

  const score =
    (viewGrowth_norm * 0.30) +
    (followerGrowth_norm * 0.25) +
    (engGrowth_norm * 0.20) +
    (shareVelocity_norm * 0.15) +
    (trend_norm * 0.10);

  return Math.round(Math.min(score, 100));
}

// ============================================================
// SVG ICONS
// ============================================================
function IconActivity({ size = 16, color = "#22c55e" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function IconDollar({ size = 16, color = "#22c55e" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function IconTrendUp({ size = 16, color = "#f59e0b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
function IconShield({ size = 16, color = "#22c55e" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconShieldCheck({ size = 14, color = "#ffffff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
function IconMail({ size = 16, color = "#9ca3af" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function IconPhone({ size = 16, color = "#9ca3af" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.09a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function IconMapPin({ size = 16, color = "#9ca3af" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconUsers({ size = 16, color = "#6b7280" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconThumbUp({ size = 16, color = "#6b7280" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}
function IconLayers({ size = 16, color = "#6b7280" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
function IconFilm({ size = 14, color = "#ffffff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  );
}
function IconMonitor({ size = 14, color = "#ffffff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
function IconMic({ size = 14, color = "#ffffff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
function IconBookOpen({ size = 14, color = "#ffffff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function IconPenTool({ size = 14, color = "#ffffff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}
function IconLock({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconWarning({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconBan({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}
function IconTrash({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
function IconCheck({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconChevronDown({ size = 14, color = "#6b7280" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function IconSearch({ size = 14, color = "#ffffff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconAlertTriangle({ size = 16, color = "#f59e0b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconStar({ size = 16, color = "#f59e0b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconBarChart({ size = 16, color = "#9ca3af" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function IconX({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconSpin({ size = 14, color = "currentColor" }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ============================================================
// TYPE META
// ============================================================
const TYPE_META = {
  Movie: { label: "Movie", icon: <IconFilm />, color: "bg-[#1297DC]" },
  Series: { label: "Series", icon: <IconMonitor />, color: "bg-[#1297DC]" },
  Podcast: { label: "Podcast", icon: <IconMic />, color: "bg-[#1297DC]" },
  Ebook: { label: "Ebook", icon: <IconBookOpen />, color: "bg-[#1297DC]" },
  Comic: { label: "Comic", icon: <IconPenTool />, color: "bg-[#1297DC]" },
};

const TYPE_COLORS = {
  Movie: "#22c55e",
  Series: "#8b5cf6",
  Podcast: "#f97316",
  Ebook: "#1297DC",
  Comic: "#f59e0b",
};

const TYPE_ORDER = ["Movie", "Series", "Podcast", "Ebook", "Comic"];

// ============================================================
// RISK BADGE
// ============================================================
function RiskBadge({ reportCount = 0 }) {
  const risk =
    reportCount >= 10 ? "High Risk" :
      reportCount >= 1 ? "Warning" : "Healthy";

  const map = {
    "High Risk": {
      cls: "bg-red-50 text-red-600 border-red-200",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      ),
    },
    "Warning": {
      cls: "bg-amber-50 text-amber-700 border-amber-200",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    "Healthy": {
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
  };

  const cfg = map[risk];

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
        {cfg.icon}
        {risk}
      </span>
      {reportCount > 0 && (
        <span className="text-xs text-red-500 font-semibold">{reportCount} laporan</span>
      )}
    </div>
  );
}

// ============================================================
// PIE CHART
// ============================================================
function PieChart({ data, size = 200, showLabels = true }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 10} fill="#e5e7eb" />
        <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="11" fill="#9ca3af">No data</text>
      </svg>
    );
  }
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  let startAngle = -Math.PI / 2;
  const slices = [];
  data.forEach((d) => {
    if (d.value === 0) return;
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle);
    const y2 = cy + r * Math.sin(startAngle + angle);
    const midAngle = startAngle + angle / 2;
    const lr = r * 0.72;
    slices.push({
      d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${x2},${y2} Z`,
      color: d.color,
      label: d.label,
      pct: Math.round((d.value / total) * 100),
      lx: cx + lr * Math.cos(midAngle),
      ly: cy + lr * Math.sin(midAngle),
    });
    startAngle += angle;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.color} stroke="white" strokeWidth="1.5" />
      ))}
      {showLabels && slices.map((s, i) => (
        s.pct > 5 && (
          <text key={i} x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fill="white" fontWeight="bold">{s.label} {s.pct}%</text>
        )
      ))}
    </svg>
  );
}

// ============================================================
// RETENTION CURVE CHART
// ============================================================
function RetentionCurveChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 580, H = 200;
  const PAD = { top: 20, right: 20, bottom: 36, left: 40 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;
  const points = data.map((d, i) => ({
    x: PAD.left + (i / Math.max(data.length - 1, 1)) * iW,
    y: PAD.top + iH - (d.retention / 100) * iH,
    ...d,
  }));
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${acc} C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
  }, "");
  const areaD = pathD
    ? `${pathD} L${points[points.length - 1]?.x},${PAD.top + iH} L${PAD.left},${PAD.top + iH} Z`
    : "";
  const yTicks = [0, 25, 50, 75, 100];
  const xTicks = ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" onMouseLeave={() => setHovered(null)}>
      <defs>
        <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1297DC" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1297DC" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map((t) => {
        const y = PAD.top + iH - (t / 100) * iH;
        return (
          <g key={t}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,3" />
            <text x={PAD.left - 6} y={y + 4} fontSize="9" fill="#9ca3af" textAnchor="end">{t}</text>
          </g>
        );
      })}
      {xTicks.map((t, i) => {
        const x = PAD.left + (i / (xTicks.length - 1)) * iW;
        return <text key={t} x={x} y={H - 6} fontSize="8" fill="#9ca3af" textAnchor="middle">{t}</text>;
      })}
      {areaD && <path d={areaD} fill="url(#retGrad)" />}
      {pathD && <path d={pathD} fill="none" stroke="#1297DC" strokeWidth="2.5" strokeLinecap="round" />}
      {points.map((p, i) => (
        <g key={i} onMouseEnter={() => setHovered(i)}>
          <circle cx={p.x} cy={p.y} r={hovered === i ? 5 : 3} fill="#1297DC" stroke="white" strokeWidth="1.5" style={{ cursor: "pointer" }} />
          {hovered === i && (
            <g>
              <rect x={p.x - 32} y={p.y - 30} width={64} height={20} rx="5" fill="#1e293b" />
              <text x={p.x} y={p.y - 16} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
                {p.retention}% • {p.label}
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

// ============================================================
// FOLLOWER GROWTH CHART (30 days)
// ============================================================
function FollowerGrowthChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 580, H = 180;
  const PAD = { top: 20, right: 20, bottom: 32, left: 52 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const minVal = Math.min(...data.map((d) => d.count), 0);
  const range = Math.max(maxVal - minVal, 1);
  const points = data.map((d, i) => ({
    x: PAD.left + (i / Math.max(data.length - 1, 1)) * iW,
    y: PAD.top + iH - ((d.count - minVal) / range) * iH,
    ...d,
  }));
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${acc} C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
  }, "");
  const yTicks = [minVal, Math.round((minVal + maxVal) / 2), maxVal];
  const xLabels = ["D1", "D7", "D14", "D21", "D30"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" onMouseLeave={() => setHovered(null)}>
      <defs>
        <linearGradient id="follGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => {
        const y = PAD.top + iH - ((t - minVal) / range) * iH;
        return (
          <g key={i}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,3" />
            <text x={PAD.left - 6} y={y + 4} fontSize="9" fill="#9ca3af" textAnchor="end">
              {t >= 1000 ? `${(t / 1000).toFixed(0)}K` : t}
            </text>
          </g>
        );
      })}
      {xLabels.map((lbl, i) => {
        const x = PAD.left + (i / (xLabels.length - 1)) * iW;
        return <text key={lbl} x={x} y={H - 6} fontSize="9" fill="#9ca3af" textAnchor="middle">{lbl}</text>;
      })}
      {pathD && (
        <>
          <path d={`${pathD} L${points[points.length - 1]?.x},${PAD.top + iH} L${PAD.left},${PAD.top + iH} Z`} fill="url(#follGrad)" />
          <path d={pathD} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {points.map((p, i) => (
        <g key={i} onMouseEnter={() => setHovered(i)}>
          <circle cx={p.x} cy={p.y} r={hovered === i ? 5 : 3} fill="#22c55e" stroke="white" strokeWidth="1.5" style={{ cursor: "pointer" }} />
          {hovered === i && (
            <g>
              <rect x={p.x - 40} y={p.y - 32} width={80} height={24} rx="6" fill="#1e293b" />
              <text x={p.x} y={p.y - 17} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
                {p.count >= 1000 ? `${(p.count / 1000).toFixed(1)}K` : p.count}
              </text>
              <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="8" fill="#94a3b8">{p.label}</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

// ============================================================
// REVENUE BAR CHART
// ============================================================
function RevenueBarChart({ data, anomalyMonth }) {
  const [hovered, setHovered] = useState(null);
  const W = 560, H = 220;
  const PAD = { top: 20, right: 20, bottom: 36, left: 52 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.map((d) => Math.max(d.gross || 0, d.platformFee || 0)), 1);
  const barW = (iW / data.length) * 0.35;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({ val: maxVal * t, y: PAD.top + iH - t * iH }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" onMouseLeave={() => setHovered(null)}>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,3" />
          <text x={PAD.left - 6} y={t.y + 4} fontSize="9" fill="#9ca3af" textAnchor="end">
            {t.val >= 1_000_000 ? `${(t.val / 1_000_000).toFixed(0)}M` : t.val >= 1000 ? `${(t.val / 1000).toFixed(0)}K` : Math.round(t.val)}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = PAD.left + (i + 0.5) * (iW / data.length);
        const grossH = maxVal > 0 ? ((d.gross || 0) / maxVal) * iH : 0;
        const platH = maxVal > 0 ? ((d.platformFee || 0) / maxVal) * iH : 0;
        const isAnomaly = d.label === anomalyMonth;
        return (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <rect
              x={cx - barW - 2} y={PAD.top + iH - grossH} width={barW} height={grossH}
              fill={isAnomaly ? "#16a34a" : "#22c55e"} rx="3"
            />
            <rect
              x={cx + 2} y={PAD.top + iH - platH} width={barW} height={platH}
              fill="#f97316" rx="3"
            />
            <text x={cx} y={H - 8} fontSize="9" fill="#6b7280" textAnchor="middle">{d.label}</text>
            {hovered === i && (
              <g>
                <rect x={cx - 52} y={PAD.top + iH - Math.max(grossH, platH) - 50} width={104} height={46} rx="6" fill="#1e293b" />
                <text x={cx} y={PAD.top + iH - Math.max(grossH, platH) - 34} textAnchor="middle" fontSize="9" fill="#22c55e" fontWeight="bold">
                  {d.gross?.toLocaleString("id-ID")}
                </text>
                <text x={cx} y={PAD.top + iH - Math.max(grossH, platH) - 22} textAnchor="middle" fontSize="8" fill="#9ca3af">{d.label} [month]</text>
                <text x={cx} y={PAD.top + iH - Math.max(grossH, platH) - 10} textAnchor="middle" fontSize="9" fill="#f97316" fontWeight="bold">
                  {d.platformFee?.toLocaleString("id-ID")}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================
// STATUS CONFIG (sama persis dengan kelola-kreator/page.jsx)
// ============================================================
const STATUS_OPTIONS_LIST = [
  { action: "activate", label: "Active", cls: "text-green-700 hover:bg-green-50" },
  { action: "deactivate", label: "Inactive", cls: "text-gray-500 hover:bg-gray-50" },
  { action: "suspend", label: "Suspended", cls: "text-orange-600 hover:bg-orange-50" },
  { action: "block", label: "Blocked", cls: "text-gray-900 hover:bg-gray-100" },
  { action: "delete", label: "Deleted", cls: "text-red-600 hover:bg-red-50" },
];

const STATUS_BADGE_MAP = {
  Active: { pill: "bg-green-100 text-green-700 border border-green-300", chevron: "#15803d" },
  Inactive: { pill: "bg-gray-100 text-gray-500 border border-gray-300", chevron: "#6b7280" },
  Suspended: { pill: "bg-orange-100 text-orange-600 border border-orange-300", chevron: "#ea580c" },
  Blocked: { pill: "bg-gray-900 text-white border border-gray-900", chevron: "#ffffff" },
  Deleted: { pill: "bg-red-100 text-red-600 border border-red-300", chevron: "#dc2626" },
};

function getConfirmConfig(action, creatorName) {
  const configs = {
    activate: {
      accentBar: "bg-green-500", iconBg: "bg-green-100",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>,
      title: "Aktifkan Creator", message: `Anda yakin ingin mengaktifkan kembali akun creator ${creatorName}?`,
      confirmLabel: "Ya, Aktifkan", confirmCls: "bg-green-500 hover:bg-green-600",
    },
    deactivate: {
      accentBar: "bg-gray-400", iconBg: "bg-gray-100",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
      title: "Nonaktifkan Creator", message: `Anda yakin ingin menonaktifkan akun creator ${creatorName}?`,
      confirmLabel: "Ya, Nonaktifkan", confirmCls: "bg-gray-600 hover:bg-gray-700",
    },
    block: {
      accentBar: "bg-gray-900", iconBg: "bg-gray-100",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>,
      title: "Blokir Creator", message: `Anda yakin ingin memblokir ${creatorName}? Akun akan diblokir permanen.`,
      confirmLabel: "Blokir", confirmCls: "bg-gray-900 hover:bg-gray-800",
    },
    delete: {
      accentBar: "bg-red-500", iconBg: "bg-red-100",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>,
      title: "Hapus Creator", message: `⚠️ Tindakan ini tidak dapat dibatalkan. Yakin ingin menghapus ${creatorName}?`,
      confirmLabel: "Hapus Permanen", confirmCls: "bg-red-600 hover:bg-red-700",
    },
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
// CONFIRM DIALOG (sama persis dengan kelola-kreator/page.jsx)
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
// SUSPEND DIALOG (sama persis dengan kelola-kreator/page.jsx)
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
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
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
// STATUS SELECT — sama persis dengan kelola-kreator/page.jsx
// Dipakai di Admin Controls (detail kreator)
// ============================================================
function StatusSelect({ currentStatus, creatorName, onUpdate, loading }) {
  const [open, setOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const badge = STATUS_BADGE_MAP[currentStatus] || STATUS_BADGE_MAP["Inactive"];

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
      const cfg = getConfirmConfig(opt.action, creatorName);
      if (cfg) { setPendingAction(opt.action); setShowConfirm(true); }
      else onUpdate(opt.action, 0);
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
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition ${badge.pill} ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-75 cursor-pointer"}`}
      >
        <span className="font-semibold text-sm">
          {loading ? "Memperbarui…" : currentStatus}
        </span>
        {loading
          ? <IconSpin size={14} color={badge.chevron} />
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={badge.chevron} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        }
      </button>

      {open && typeof window !== "undefined" && createPortal(
        <div
          style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999, width: 180 }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden py-1"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-gray-100 mb-0.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ubah Status</p>
          </div>
          {STATUS_OPTIONS_LIST.map((opt) => (
            <button
              key={opt.action}
              onClick={() => handleSelect(opt)}
              className={`w-full text-left px-3 py-2.5 text-sm font-semibold transition flex items-center gap-2 ${opt.cls} ${currentStatus === opt.label ? "bg-blue-50" : ""}`}
            >
              {currentStatus === opt.label && (
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="12" /></svg>
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
        onConfirm={() => { if (pendingAction) onUpdate(pendingAction, 0); setPendingAction(null); }}
        config={pendingAction ? getConfirmConfig(pendingAction, creatorName) : null}
      />

      <SuspendDialog
        open={showSuspend}
        onClose={() => setShowSuspend(false)}
        onConfirm={(days) => onUpdate("suspend", days)}
        creatorName={creatorName}
      />
    </>
  );
}

// ============================================================
// SEND WARNING MODAL
// ============================================================
function SendWarningModal({ open, onClose, onSubmit, loading }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setMessage("");
    }
    if (!open) return;
    const esc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);

  if (!open || typeof window === "undefined") return null;

  const canSubmit = title.trim() && message.trim() && !loading;

  return createPortal(
    <div
      className="fixed inset-0 z-[99990] flex items-center justify-center"
      style={{ animation: "fadeInBackdrop 0.2s ease both" }}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        style={{ animation: "popIn 0.25s cubic-bezier(.17,.84,.44,1) both" }}
      >
        <div className="h-1 w-full bg-yellow-400" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-900">Send Warning</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
            >
              <IconX size={14} color="currentColor" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Judul
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Isi Artikel
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Jelaskan secara detail masalah atau masukan Anda"
                rows={5}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => canSubmit && onSubmit(title.trim(), message.trim())}
              disabled={!canSubmit}
              className="flex-1 py-2.5 rounded-xl bg-[#1297DC] hover:bg-[#0e7ab8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition flex items-center justify-center gap-2"
            >
              {loading ? <IconSpin size={14} color="white" /> : null}
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
// CONTENT CATALOG TABLE
// ============================================================
const CATALOG_PER_PAGE = 10;

function ContentCatalog({ catalog = [] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("uploadDate");
  const [sortDir, setSortDir] = useState("desc");

  const filtered = useMemo(() => {
    return catalog
      .filter((c) => {
        const matchSearch = search ? c.title?.toLowerCase().includes(search.toLowerCase()) : true;
        const matchType = filter === "all" ? true : c.type === filter;
        return matchSearch && matchType;
      })
      .sort((a, b) => {
        let va, vb;
        if (sortKey === "uploadDate") { va = new Date(a.uploadDate); vb = new Date(b.uploadDate); }
        else if (sortKey === "views") { va = a.views || 0; vb = b.views || 0; }
        else if (sortKey === "revenue") { va = a.revenue || 0; vb = b.revenue || 0; }
        else { va = a.title; vb = b.title; }
        return sortDir === "desc" ? (vb > va ? 1 : -1) : (va > vb ? 1 : -1);
      });
  }, [catalog, search, filter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / CATALOG_PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * CATALOG_PER_PAGE, page * CATALOG_PER_PAGE);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }) => (
    <span className={`ml-1 text-xs ${sortKey === k ? "text-[#1297DC]" : "text-gray-400"}`}>
      {sortKey === k ? (sortDir === "desc" ? "↓" : "↑") : "↕"}
    </span>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 pb-0">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Content Catalog</h2>
        <div className="flex gap-3 items-center pb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
              className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none border-0"
            />
            <button
              onClick={() => { setSearch(searchInput); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#1297DC] rounded-lg flex items-center justify-center hover:bg-[#0e7db8] transition"
            >
              <IconSearch size={13} color="#fff" />
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-5 py-3 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition min-w-[120px] justify-between"
            >
              <span>{filter === "all" ? "Filter" : filter}</span>
              <IconChevronDown size={13} color="#9ca3af" />
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-20 min-w-36 py-1">
                {["all", ...TYPE_ORDER].map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setShowFilter(false); setPage(1); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition ${filter === f ? "text-[#1297DC] font-semibold" : "text-gray-700"}`}
                  >
                    {f === "all" ? "All Types" : f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y border-gray-100 bg-gray-50/60">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Content</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer" onClick={() => handleSort("uploadDate")}>
                Upload Date <SortIcon k="uploadDate" />
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer" onClick={() => handleSort("views")}>
                Views <SortIcon k="views" />
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer" onClick={() => handleSort("revenue")}>
                Revenue <SortIcon k="revenue" />
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">No content found</td>
              </tr>
            ) : (
              paginated.map((item) => {
                const tm = TYPE_META[item.type] || TYPE_META["Movie"];
                const totalLikeDislike = (item.likes || 0) + (item.dislikes || 0);
                const likePct = totalLikeDislike > 0 ? Math.round((item.likes / totalLikeDislike) * 100) : 90;
                const revenueGrowth = item.revenueGrowth || 12.5;
                return (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-[#1297DC] flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {item.coverUrl ? (
                            <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-xs font-bold">IMG</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 max-w-[220px]">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white ${tm.color}`}>
                        {tm.icon}{tm.label}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {item.uploadDate
                        ? (() => {
                          const d = new Date(item.uploadDate);
                          return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}-${d.getFullYear()}`;
                        })()
                        : "-"}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{(item.views || 0).toLocaleString("id-ID")}</span>
                        <span className="text-xs text-gray-400">{likePct}%</span>
                      </div>
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full bg-[#1297DC]" style={{ width: `${likePct}%` }} />
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatRupiahFull(item.revenue || 0)}</p>
                      {revenueGrowth !== undefined && (
                        <p className="text-xs text-green-500 mt-0.5 flex items-center gap-0.5">
                          <span>↗</span> {revenueGrowth}%
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <span className={`text-sm font-semibold ${item.status === "Active" ? "text-green-500" :
                        item.status === "Private" ? "text-gray-500" : "text-orange-500"
                        }`}>
                        {item.status || "Active"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <button
                        onClick={() => router.push(`/manajemen-konten/kelola-konten/${item.id}?type=${item.type}`)}
                        className="text-sm text-[#1297DC] font-semibold hover:underline transition"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Showing {filtered.length === 0 ? 0 : (page - 1) * CATALOG_PER_PAGE + 1} to {Math.min(page * CATALOG_PER_PAGE, filtered.length)} of {filtered.length} results
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${p === page ? "bg-[#1297DC] text-white shadow-sm" : "border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function KreatorAkunPage() {
  const { creatorId } = useParams();
  const router = useRouter();

  const [creatorStatus, setCreatorStatus] = useState("Active");
  const [statusLoading, setStatusLoading] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningLoading, setWarningLoading] = useState(false);
  const [monetizationActive, setMonetizationActive] = useState(true);

  const { data, isLoading, error } = useGetCreatorDetailQuery(creatorId);
  const [updateStatus] = useUpdateCreatorStatusMutation();

  const creator = data?.data;

  // Sync status from API
  useEffect(() => {
    if (creator?.status) setCreatorStatus(creator.status);
    if (creator?.monetizationActive !== undefined) setMonetizationActive(creator.monetizationActive);
  }, [creator]);

  // ---- Score calculations ----
  const performanceScore = useMemo(() => calcPerformanceScore(creator), [creator]);
  const revenueIntegrityScore = useMemo(() => calcRevenueIntegrityScore(creator), [creator]);
  const growthScore = useMemo(() => calcGrowthScore(creator), [creator]);
  const riskScore = creator?.riskScore || 12;

  // ---- Revenue Intelligence ----
  const grossRevenue = useMemo(() => creator?.grossRevenue || 0, [creator]);
  const creatorSharePct = 0.70;
  const platformFeePct = 0.30;
  const creatorShare = Math.round(grossRevenue * creatorSharePct);
  const platformFee = Math.round(grossRevenue * platformFeePct);
  const totalWithdrawal = useMemo(() => creator?.totalWithdrawal || 0, [creator]);

  // Monthly revenue data (last 6 months)
  const monthlyRevenue = useMemo(() => creator?.monthlyRevenue || [], [creator]);

  // Anomaly: month with > 15% spike vs previous
  const anomalyMonth = useMemo(() => {
    if (monthlyRevenue.length < 2) return null;
    for (let i = 1; i < monthlyRevenue.length; i++) {
      const prev = monthlyRevenue[i - 1].gross || 0;
      const cur = monthlyRevenue[i].gross || 0;
      if (prev > 0 && (cur - prev) / prev > 0.15) return monthlyRevenue[i].label;
    }
    return null;
  }, [monthlyRevenue]);

  // ---- Retention Curve ----
  const retentionCurve = useMemo(() => {
    if (creator?.retentionCurve && creator.retentionCurve.length > 0) return creator.retentionCurve;
    const cr = (creator?.completionRate || 72) / 100;
    return Array.from({ length: 11 }, (_, i) => ({
      label: `${i * 10}%`,
      retention: Math.round(100 * Math.pow(cr + (1 - cr) * (1 - i / 10), i * 0.4)),
    }));
  }, [creator]);

  // ---- Follower Growth 30 days ----
  const followerGrowthData = useMemo(() => {
    if (creator?.followerGrowthData && creator.followerGrowthData.length > 0) return creator.followerGrowthData;
    const base = creator?.subscriberCount || 9000;
    return Array.from({ length: 8 }, (_, i) => ({
      label: `D${[1, 3, 5, 7, 10, 14, 21, 30][i]}`,
      count: Math.round(base * (0.88 + i * 0.02 + Math.random() * 0.01)),
    }));
  }, [creator]);

  // ---- Pie: Distribution Konten Kategori ----
  const distPieData = useMemo(() => {
    if (!creator) return [];
    const dist = creator.contentDistribution || {};
    return TYPE_ORDER.map((t) => ({
      label: t,
      value: dist[t] || 0,
      color: TYPE_COLORS[t],
    })).filter((d) => d.value > 0);
  }, [creator]);

  // ---- Pie: Revenue Popularity ----
  const revPieData = useMemo(() => {
    if (!creator?.monthlyRevenue) return distPieData;
    const revenueByType = creator.revenueByType || {};
    const result = TYPE_ORDER.map((t) => ({
      label: t,
      value: revenueByType[t] || 0,
      color: TYPE_COLORS[t],
    })).filter((d) => d.value > 0);
    return result.length > 0 ? result : distPieData;
  }, [creator, distPieData]);

  // ---- Benchmarking ----
  const rankInGenre = creator?.rankInGenre || 12;
  const totalCreators = creator?.totalCreatorsInGenre || 450;
  const percentile = creator?.percentile || 97;
  const benchmarkStatus = percentile >= 90 ? "Top 10%" : percentile >= 75 ? "Top 25%" : "Average";

  // ---- Report / moderation ----
  const { data: reportsData, isLoading: reportsLoading } = useGetReportsQuery(
    { status: "all", page: 1, limit: 500 },
    { skip: !creator?.creatorId }
  );

  const creatorReports = useMemo(() => {
    if (!reportsData?.data || !creator?.creatorId) return [];
    return reportsData.data.filter(
      (r) => r.creatorId === creator.creatorId
    );
  }, [reportsData, creator]);

  const reportCount = creatorReports.length;

  const warningCount = useMemo(() =>
    creatorReports.filter((r) => r.actionTaken === "WARNING").length,
    [creatorReports]
  );

  const lastViolation = useMemo(() => {
    const violations = creatorReports
      .filter((r) => r.status === "ACTION_TAKEN" && r.actionTaken !== "DISMISS")
      .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
    if (violations.length === 0) return "None";
    return formatDate(violations[0].reviewedAt);
  }, [creatorReports]);

  const fraudAlerts = useMemo(() =>
    creatorReports.filter(
      (r) =>
        ["PLAGIARISM", "COPYRIGHT_INFRINGEMENT"].includes(r.category) &&
        ["PENDING", "IN_REVIEW"].includes(r.status)
    ).length,
    [creatorReports]
  );

  const isCleanRecord = reportCount === 0 && warningCount === 0 && lastViolation === "None" && fraudAlerts === 0;

  // ---- Performance metrics ----
  const completionRate = creator?.completionRate || 72;
  const avgWatchTime = creator?.avgWatchTime || 8.5;
  const returningViewers = creator?.returningViewers || 45;
  const engagementRate = creator?.engagementRate || 8.5;

  // ---- Handle status update (sama dengan list page) ----
  const handleStatusUpdate = async (action, suspendDays) => {
    const creatorName = creator?.profileName || creator?.username || "";
    setStatusLoading(true);
    try {
      await updateStatus({ userId: creator?.userId, action, suspendDays }).unwrap();
      // Derive display status from action
      const actionToStatus = {
        activate: "Active",
        deactivate: "Inactive",
        suspend: "Suspended",
        block: "Blocked",
        delete: "Deleted",
      };
      if (actionToStatus[action]) setCreatorStatus(actionToStatus[action]);
      emitToast(getToastConfig(action, creatorName, true));
      if (action === "delete") {
        router.push("/manajemen-konten/kelola-kreator");
      }
    } catch {
      emitToast(getToastConfig(action, creatorName, false));
    } finally {
      setStatusLoading(false);
    }
  };

  // Handler Send Warning
  const handleSendWarning = async (title, message) => {
    setWarningLoading(true);
    try {
      await fetchWithAuth(
        `${API_BASE}/management/creators/${creator?.creatorId}/send-warning`,
        {
          method: "POST",
          body: JSON.stringify({ title, message }),
        }
      );
      setShowWarningModal(false);
      emitToast({
        type: "success",
        title: "Peringatan Terkirim",
        message: "Notifikasi warning telah dikirim ke creator",
      });
    } catch (e) {
      emitToast({
        type: "error",
        title: "Gagal",
        message: e.message || "Gagal mengirim warning, coba lagi",
      });
    } finally {
      setWarningLoading(false);
    }
  };

  if (isLoading) return <PageLoader />;
  if (error || !creator) return <PageError />;

  const totalLikes = creator.catalog?.reduce((s, c) => s + (c.likes || 0), 0) || 0;
  const creatorName = creator.profileName || creator.username || "";

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />

      {/* BREADCRUMB */}
      <div className="px-6 pt-4 pb-2 text-sm text-gray-500 flex items-center gap-2">
        <button onClick={() => router.push("/manajemen-konten/kelola-kreator")} className="hover:text-[#1297DC] transition">
          Content Management
        </button>
        <span>›</span>
        <span className="text-gray-800 font-medium">Creator Account</span>
      </div>

      {/* ═══════════════════════════════════════
          PROFILE CARD
      ═══════════════════════════════════════ */}
      <div className="px-6 pb-4">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-6">
            {/* Left: Avatar + Info */}
            <div className="flex items-start gap-5">
              <div className="relative flex-shrink-0">
                {creator.imageUrl ? (
                  <img src={creator.imageUrl} alt={creator.profileName} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-white text-3xl font-bold">
                    {(creator.profileName || "?")[0]}
                  </div>
                )}
                {creator.isVerified && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#1297DC] rounded-full flex items-center justify-center shadow">
                    <IconShieldCheck size={12} color="#fff" />
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{creator.profileName}</h1>
                  {creator.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-[#1297DC] text-[#1297DC]">
                      <IconCheck size={11} color="#1297DC" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-3">
                  @{creator.username} • ID: {creator.userId?.slice(-6) || "000000"}
                </p>
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <IconMail size={14} color="#9ca3af" />
                    <span>{creator.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconPhone size={14} color="#9ca3af" />
                    <span>{creator.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconMapPin size={14} color="#9ca3af" />
                    <span>{creator.region || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Status + Join date */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${creatorStatus === "Active" ? "bg-green-100 text-green-600" :
                creatorStatus === "Suspended" ? "bg-amber-100 text-amber-600" :
                  creatorStatus === "Blocked" ? "bg-gray-900 text-white" :
                    creatorStatus === "Deleted" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-500"
                }`}>
                {creatorStatus}
              </span>
              {creator.joinDate || creator.createdAt ? (
                <p className="text-sm text-gray-400">Joined {formatDate(creator.joinDate || creator.createdAt)}</p>
              ) : null}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <IconUsers size={16} color="#6b7280" />
              <span className="font-bold text-gray-900">{(creator.subscriberCount || 0).toLocaleString("id-ID")}</span>
              <span className="text-gray-500 text-sm">Followers</span>
            </div>
            <div className="flex items-center gap-2">
              <IconThumbUp size={16} color="#6b7280" />
              <span className="font-bold text-gray-900">{formatViews(totalLikes)}</span>
              <span className="text-gray-500 text-sm">Likes</span>
            </div>
            <div className="flex items-center gap-2">
              <IconLayers size={16} color="#6b7280" />
              <span className="font-bold text-gray-900">{creator.totalContent || creator.catalog?.length || 0}</span>
              <span className="text-gray-500 text-sm">Karya</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          4 SCORE CARDS
      ═══════════════════════════════════════ */}
      <div className="px-6 pb-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-green-400">
          <div className="flex items-center gap-2 mb-3">
            <IconActivity size={18} color="#22c55e" />
          </div>
          <p className="text-4xl font-black text-green-500 mb-1">{performanceScore}</p>
          <p className="font-bold text-green-600 text-sm mb-1">Performance Score</p>
          <p className="text-xs text-green-500">Content quality & engagement</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-green-400">
          <div className="flex items-center gap-2 mb-3">
            <IconDollar size={18} color="#22c55e" />
          </div>
          <p className="text-4xl font-black text-green-500 mb-1">{revenueIntegrityScore}</p>
          <p className="font-bold text-green-600 text-sm mb-1">Revenue Integrity</p>
          <p className="text-xs text-green-500">Transaction health</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-amber-400">
          <div className="flex items-center gap-2 mb-3">
            <IconTrendUp size={18} color="#f59e0b" />
          </div>
          <p className="text-4xl font-black text-amber-500 mb-1">{growthScore}</p>
          <p className="font-bold text-amber-600 text-sm mb-1">Growth Score</p>
          <p className="text-xs text-amber-500">Momentum indicator</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-green-400">
          <div className="flex items-center gap-2 mb-3">
            <IconShield size={18} color="#22c55e" />
          </div>
          <p className="text-4xl font-black text-green-500 mb-1">{riskScore}</p>
          <p className="font-bold text-green-600 text-sm mb-1">Risk Score</p>
          <p className="text-xs text-green-500">AI fraud detection</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          PERFORMANCE ANALYTICS + ADMIN CONTROLS
      ═══════════════════════════════════════ */}
      <div className="px-6 pb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Analytics (left 2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-900 text-base mb-4">Performance Analytics</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-500 font-semibold mb-1">Completion Rate</p>
              <p className="text-2xl font-black text-blue-600">{completionRate}%</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 font-semibold mb-1">Avg Watch Time</p>
              <p className="text-2xl font-black text-green-600">{avgWatchTime} min</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-500 font-semibold mb-1">Returning Viewers</p>
              <p className="text-2xl font-black text-purple-600">{returningViewers}%</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-xs text-orange-500 font-semibold mb-1">Engagement Rate</p>
              <p className="text-2xl font-black text-orange-600">{engagementRate}%</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-3">Retention Curve</h4>
            <div className="h-48">
              <RetentionCurveChart data={retentionCurve} />
            </div>
          </div>

          <div className="mt-5">
            <h4 className="font-bold text-gray-800 text-sm mb-3">Follower Growth (30 Days)</h4>
            <div className="h-44">
              <FollowerGrowthChart data={followerGrowthData} />
            </div>
          </div>
        </div>

        {/* Admin Controls (right 1/3) */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-900 text-base mb-4">Admin Controls</h3>

          {/* Creator Status — menggunakan StatusSelect sama persis dengan list page */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Creator Status</p>
            <StatusSelect
              currentStatus={creatorStatus}
              creatorName={creatorName}
              onUpdate={handleStatusUpdate}
              loading={statusLoading}
            />
            <p className="text-xs text-gray-400 mt-2">Change creator account status</p>
          </div>

          {/* Revenue Split */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Revenue Split</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#1297DC]" style={{ width: "70%" }} />
              </div>
              <span className="text-base font-black text-[#1297DC]">70%</span>
            </div>
            <p className="text-xs text-gray-500">
              Creator gets <strong>70%</strong>, platform gets <strong>30%</strong>
            </p>
          </div>

          {/* Monetization */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconLock size={16} color="#22c55e" />
              <span className="text-sm font-semibold text-green-700">Monetization Active</span>
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${monetizationActive ? "bg-green-500" : "bg-gray-300"}`}>
              <IconCheck size={11} color="white" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => setShowWarningModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm hover:bg-amber-100 transition"
            >
              <IconWarning size={15} color="#d97706" /> Send Warning
            </button>
            <button
              onClick={() => setMonetizationActive(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-semibold text-sm hover:bg-orange-100 transition"
            >
              <IconLock size={15} color="#ea580c" /> Freeze Monetization
            </button>
            <button
              onClick={() => handleStatusUpdate("suspend", 7)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-100 transition"
            >
              <IconBan size={15} color="#dc2626" /> Suspend Creator
            </button>
            <button
              onClick={() => handleStatusUpdate("delete", 0)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition"
            >
              <IconTrash size={15} color="white" /> Delete Creator
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          REVENUE INTELLIGENCE + MODERATION CENTER + DIST PIE
      ═══════════════════════════════════════ */}
      <div className="px-6 pb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Intelligence (left 2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 text-base">Revenue Intelligence</h3>
            {anomalyMonth && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                <IconAlertTriangle size={13} color="#d97706" /> Anomaly Detected
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Gross Revenue</p>
              <p className="text-xl font-black text-gray-900">{formatRupiah(grossRevenue)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 mb-1">Creator Share (70%)</p>
              <p className="text-xl font-black text-green-600">{formatRupiah(creatorShare)}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-xs text-orange-500 mb-1">Platform Fee (30%)</p>
              <p className="text-xl font-black text-orange-500">{formatRupiah(platformFee)}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs text-amber-600 mb-1">withdrawal</p>
              <p className="text-xl font-black text-amber-600">{formatRupiah(totalWithdrawal)}</p>
            </div>
          </div>

          {anomalyMonth && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <span className="font-bold">⚠ Anomaly Alert:</span> Abnormal spike detected in {anomalyMonth} (+18%)
            </div>
          )}

          {monthlyRevenue.length > 0 ? (
            <div className="h-56">
              <RevenueBarChart data={monthlyRevenue} anomalyMonth={anomalyMonth} />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-xl">
              Belum ada data pendapatan
            </div>
          )}
        </div>

        {/* Moderation Center + Dist Pie (right 1/3) */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">Moderation Center</h3>
              {reportsLoading && (
                <svg className="animate-spin w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              )}
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 mb-2 font-medium">Risk Level</p>
              <RiskBadge reportCount={reportCount} />
            </div>

            <div className="space-y-2.5">
              {[
                { label: "Warning Count", value: reportsLoading ? "…" : warningCount, color: warningCount > 0 ? "#ef4444" : "#22c55e" },
                { label: "Report Count", value: reportsLoading ? "…" : reportCount, color: reportCount > 0 ? "#ef4444" : "#22c55e" },
                { label: "Last Violation", value: reportsLoading ? "…" : lastViolation, color: lastViolation !== "None" ? "#ef4444" : "#374151" },
                { label: "Fraud Alerts", value: reportsLoading ? "…" : fraudAlerts, color: fraudAlerts > 0 ? "#ef4444" : "#22c55e" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>

            {!reportsLoading && isCleanRecord && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
                  <IconCheck size={14} color="#16a34a" /> Clean Record
                </p>
                <p className="text-xs text-green-600 mt-0.5">No violations or reports</p>
              </div>
            )}

            {!reportsLoading && reportCount > 0 && (
              <button
                onClick={() => router.push(`/manajemen-konten/kelola-kreator/${creatorId}/laporan`)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Lihat {reportCount} laporan →
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Distribution Konten Kategori</h3>
            <div className="flex justify-center">
              <PieChart data={distPieData} size={180} showLabels={true} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          BENCHMARKING + REVENUE POPULARITY
      ═══════════════════════════════════════ */}
      <div className="px-6 pb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-900 text-base mb-5">Benchmarking &amp; Rankings</h3>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-500 font-semibold mb-2">Rank in Genre</p>
              <p className="text-3xl font-black text-purple-700">#{rankInGenre}</p>
              <p className="text-xs text-purple-400 mt-1">of {totalCreators} creators</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 font-semibold mb-2">Percentile</p>
              <p className="text-3xl font-black text-green-600">{percentile}%</p>
              <p className="text-xs text-green-400 mt-1">Top performer</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs text-amber-600 font-semibold mb-2">Status</p>
              <p className="text-xl font-black text-amber-500 flex items-center gap-1.5 mt-1">
                <IconStar size={20} color="#f59e0b" /> {benchmarkStatus}
              </p>
            </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-900">
            <span className="font-bold">Performance Summary:</span> This creator ranks in the top {100 - percentile + 3}% of all creators in their genre, demonstrating exceptional content quality and audience engagement.
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Revenue Popularity</h3>
          <div className="flex justify-center">
            <PieChart data={revPieData} size={180} showLabels={true} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          CONTENT CATALOG
      ═══════════════════════════════════════ */}
      <div className="px-6 pb-8">
        <ContentCatalog catalog={creator.catalog || []} />
      </div>

      {/* Send Warning Modal */}
      <SendWarningModal
        open={showWarningModal}
        onClose={() => !warningLoading && setShowWarningModal(false)}
        onSubmit={handleSendWarning}
        loading={warningLoading}
      />
    </div>
  );
}

// ---- HELPERS ----
function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1297DC] border-t-transparent" />
        <p className="text-gray-400 text-sm">Memuat data kreator...</p>
      </div>
    </div>
  );
}
function PageError() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500 text-lg">Kreator tidak ditemukan</p>
      <button
        onClick={() => router.back()}
        className="px-6 py-2.5 bg-[#1297DC] text-white rounded-xl text-sm font-semibold hover:bg-[#0e7db8] transition"
      >
        ← Kembali
      </button>
    </div>
  );
}