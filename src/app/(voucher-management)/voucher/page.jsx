"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Edit2, Eye, Trash2, TrendingUp, TrendingDown, X, Download } from "lucide-react";
import {
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getTotalSavings,
  searchContentByType,
} from "@/hooks/api/voucherAPI";

// ── Konstanta opsi ──────────────────────────────────────────────────────────
const CONTENT_TYPE_OPTIONS = [
  { value: "", label: "— Semua Konten (null) —" },
  { value: "EBOOK", label: "Ebook" },
  { value: "COMIC", label: "Comic" },
  { value: "PODCAST", label: "Podcast" },
  { value: "FILM", label: "Film / Movie" },
  { value: "SERIES", label: "Series" },
  { value: "EDUCATION", label: "Education" },
];

const PAYMENT_TYPE_OPTIONS = [
  { value: "", label: "— Semua Pembayaran (null) —" },
  { value: "SUBSCRIPTION", label: "Subscription" },
  { value: "TRANSACTION", label: "Transaction" },
];

// ── Initial form state ───────────────────────────────────────────────────────
const INITIAL_FORM = {
  code: "",
  name: "",
  category: "",
  description: "",
  isActive: true,
  type: "PERCENTAGE",
  value: 0,
  maxDiscount: 0,
  targetUser: "new",
  packageType: "premium",
  usageLimit: 1,
  startDate: "",
  endDate: "",
  contentType: "",
  paymentType: "",
  contentId: "",
  contentIdLabel: "",
};

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Pure Canvas 2D voucher image generator — zero external dependencies ───────
function drawVoucherToCanvas(voucher) {
  const W = 900;
  const PADDING = 52;
  const canvas = document.createElement("canvas");
  canvas.width = W;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const discountText =
    voucher.type === "PERCENTAGE"
      ? `${voucher.value}%`
      : `Rp ${Number(voucher.value).toLocaleString("id-ID")}`;

  const targetLabel =
    voucher.targetUser === "new" ? "Pengguna Baru"
    : voucher.targetUser === "old" ? "Pengguna Lama"
    : voucher.targetUser === "premium" ? "Premium User"
    : "Basic User";

  const packageLabel = voucher.packageType
    ? voucher.packageType.charAt(0).toUpperCase() + voucher.packageType.slice(1)
    : "—";

  const statusInfo = (() => {
    const now = new Date();
    if (!voucher.isActive) return { label: "Inactive", color: "#ef4444" };
    if (now < new Date(voucher.startDate)) return { label: "Not Started", color: "#f59e0b" };
    if (new Date(voucher.endDate) < now) return { label: "Expired", color: "#9ca3af" };
    if ((voucher.usedCount || 0) >= voucher.usageLimit) return { label: "Limit Reached", color: "#f97316" };
    return { label: "Active", color: "#10b981" };
  })();

  const usagePct = Math.min(((voucher.usedCount || 0) / voucher.usageLimit) * 100, 100);

  // ── Measure total height first ────────────────────────────────────────────
  // We do a dry-run to figure out canvas height, then draw for real.
  const draw = (ctx, final) => {
    let y = 0;

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, canvas.height || 800);
    bg.addColorStop(0, "#0f172a");
    bg.addColorStop(0.6, "#1e293b");
    bg.addColorStop(1, "#0f172a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, canvas.height || 9999);

    // Decorative circle top-right
    const circTR = ctx.createRadialGradient(W - 20, 20, 0, W - 20, 20, 220);
    circTR.addColorStop(0, "rgba(99,102,241,0.22)");
    circTR.addColorStop(1, "rgba(99,102,241,0)");
    ctx.fillStyle = circTR;
    ctx.fillRect(0, 0, W, 260);

    // ── Header band ──────────────────────────────────────────────────────
    const headerH = 72;
    const headerGrad = ctx.createLinearGradient(0, 0, W, 0);
    headerGrad.addColorStop(0, "rgba(99,102,241,0.28)");
    headerGrad.addColorStop(1, "rgba(20,184,166,0.18)");
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, W, headerH);

    // Separator line
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, headerH); ctx.lineTo(W, headerH); ctx.stroke();

    // "OFFICIAL VOUCHER" label
    ctx.fillStyle = "rgba(148,163,184,0.75)";
    ctx.font = "bold 11px 'Segoe UI', system-ui, sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("OFFICIAL VOUCHER", PADDING, 26);

    // Platform name
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "800 18px 'Segoe UI', system-ui, sans-serif";
    ctx.letterSpacing = "0px";
    ctx.fillText("Platform", PADDING, 52);

    // Status pill (right side)
    const pillW = 130, pillH = 28, pillX = W - PADDING - pillW, pillY = 22;
    ctx.fillStyle = "rgba(15,23,42,0.7)";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 14);
    ctx.fill();
    ctx.strokeStyle = statusInfo.color + "50";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Status dot
    ctx.fillStyle = statusInfo.color;
    ctx.beginPath();
    ctx.arc(pillX + 16, pillY + pillH / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Status text
    ctx.fillStyle = statusInfo.color;
    ctx.font = "bold 12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(statusInfo.label, pillX + 28, pillY + 18);

    y = headerH + 32;

    // ── Voucher name (if set) ─────────────────────────────────────────────
    if (voucher.name && voucher.name !== `Voucher ${voucher.code}`) {
      ctx.fillStyle = "rgba(148,163,184,0.65)";
      ctx.font = "600 11px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText(voucher.name.toUpperCase(), PADDING, y);
      y += 22;
    }

    // ── Discount hero value ───────────────────────────────────────────────
    ctx.font = "900 72px 'Segoe UI', system-ui, sans-serif";
    const discGrad = ctx.createLinearGradient(PADDING, y - 60, PADDING + 400, y);
    discGrad.addColorStop(0, "#a5f3fc");
    discGrad.addColorStop(0.5, "#818cf8");
    discGrad.addColorStop(1, "#34d399");
    ctx.fillStyle = discGrad;
    ctx.fillText(discountText, PADDING, y + 56);

    const discW = ctx.measureText(discountText).width;
    ctx.fillStyle = "rgba(148,163,184,0.55)";
    ctx.font = "700 14px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("DISKON", PADDING + discW + 12, y + 46);

    y += 80;

    // Max discount note
    if (voucher.maxDiscount > 0 && voucher.type === "PERCENTAGE") {
      ctx.fillStyle = "rgba(148,163,184,0.55)";
      ctx.font = "500 13px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText(`Maksimal potongan Rp ${Number(voucher.maxDiscount).toLocaleString("id-ID")}`, PADDING, y);
      y += 22;
    }

    y += 10;

    // ── Voucher code box ──────────────────────────────────────────────────
    const boxX = PADDING, boxY = y, boxW = W - PADDING * 2, boxH = 52;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill();

    ctx.fillStyle = "rgba(148,163,184,0.45)";
    ctx.font = "700 10px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("KODE", boxX + 20, boxY + 20);

    ctx.fillStyle = "#f1f5f9";
    ctx.font = "900 26px 'Courier New', monospace";
    ctx.fillText(voucher.code, boxX + 20, boxY + 38);

    y += boxH + 28;

    // ── Dashed separator ─────────────────────────────────────────────────
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(PADDING, y); ctx.lineTo(W - PADDING, y); ctx.stroke();
    ctx.setLineDash([]);
    y += 28;

    // ── Info grid (2 columns) ─────────────────────────────────────────────
    const col2X = W / 2 + 10;
    const infoRows = [
      ["Berlaku Dari", fmtDate(voucher.startDate)],
      ["Berlaku Sampai", fmtDate(voucher.endDate)],
      ["Target Pengguna", targetLabel],
      ["Tipe Paket", packageLabel],
    ];

    infoRows.forEach(([label, value], i) => {
      const x = i % 2 === 0 ? PADDING : col2X;
      const rowY = y + Math.floor(i / 2) * 52;

      ctx.fillStyle = "rgba(148,163,184,0.42)";
      ctx.font = "700 9px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText(label.toUpperCase(), x, rowY);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "600 14px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText(value, x, rowY + 18);
    });

    y += Math.ceil(infoRows.length / 2) * 52 + 8;

    // ── Usage bar ─────────────────────────────────────────────────────────
    ctx.fillStyle = "rgba(148,163,184,0.42)";
    ctx.font = "700 9px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("PEMAKAIAN VOUCHER", PADDING, y);

    ctx.fillStyle = "rgba(148,163,184,0.65)";
    ctx.font = "700 12px 'Segoe UI', system-ui, sans-serif";
    const usageText = `${voucher.usedCount || 0} / ${voucher.usageLimit}`;
    const usageTextW = ctx.measureText(usageText).width;
    ctx.fillText(usageText, W - PADDING - usageTextW, y);

    y += 14;
    const barX = PADDING, barW = W - PADDING * 2, barH = 7;
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath(); ctx.roundRect(barX, y, barW, barH, 4); ctx.fill();

    if (usagePct > 0) {
      const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      barGrad.addColorStop(0, "#6366f1");
      barGrad.addColorStop(1, "#14b8a6");
      ctx.fillStyle = barGrad;
      ctx.beginPath(); ctx.roundRect(barX, y, barW * (usagePct / 100), barH, 4); ctx.fill();
    }

    y += barH + 28;

    // ── Content restrictions (optional) ──────────────────────────────────
    if (voucher.contentType || voucher.paymentType || voucher.contentId) {
      const tags = [
        voucher.contentType ? { text: voucher.contentType, fg: "#a5b4fc", bg: "rgba(99,102,241,0.2)", border: "rgba(99,102,241,0.35)" } : null,
        voucher.paymentType ? { text: voucher.paymentType, fg: "#fcd34d", bg: "rgba(245,158,11,0.2)", border: "rgba(245,158,11,0.35)" } : null,
        voucher.contentId ? {
          text: `ID: ${voucher.contentId.length > 16 ? voucher.contentId.substring(0, 16) + "…" : voucher.contentId}`,
          fg: "#5eead4", bg: "rgba(20,184,166,0.15)", border: "rgba(20,184,166,0.3)",
        } : null,
      ].filter(Boolean);

      ctx.fillStyle = "rgba(148,163,184,0.42)";
      ctx.font = "700 9px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText("BERLAKU UNTUK", PADDING, y);
      y += 14;

      let tagX = PADDING;
      ctx.font = "700 11px 'Segoe UI', system-ui, sans-serif";
      tags.forEach((tag) => {
        const tw = ctx.measureText(tag.text).width + 24;
        const th = 26;
        ctx.fillStyle = tag.bg;
        ctx.beginPath(); ctx.roundRect(tagX, y, tw, th, 7); ctx.fill();
        ctx.strokeStyle = tag.border;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = tag.fg;
        ctx.fillText(tag.text, tagX + 12, y + 17);
        tagX += tw + 8;
      });
      y += 42;
    }

    // ── Description ───────────────────────────────────────────────────────
    if (voucher.description) {
      ctx.fillStyle = "rgba(148,163,184,0.42)";
      ctx.font = "700 9px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText("DESKRIPSI", PADDING, y);
      y += 16;

      // Word-wrap description
      ctx.font = "400 12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(148,163,184,0.6)";
      const maxLineW = W - PADDING * 2;
      const words = voucher.description.split(" ");
      let line = "";
      words.forEach((word) => {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxLineW) {
          ctx.fillText(line, PADDING, y);
          y += 18;
          line = word;
        } else {
          line = test;
        }
      });
      if (line) { ctx.fillText(line, PADDING, y); y += 18; }
      y += 10;
    }

    // ── Footer strip ──────────────────────────────────────────────────────
    y += 10;
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();

    const footerH = 52;
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    ctx.fillRect(0, y, W, footerH);

    ctx.fillStyle = "rgba(148,163,184,0.3)";
    ctx.font = "600 10px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("Voucher resmi  •  Tidak dapat dipindahtangankan", PADDING, y + 30);

    // Logo circle
    const lx = W - PADDING - 18, ly = y + 26;
    const logoGrad = ctx.createLinearGradient(lx - 18, ly - 18, lx + 18, ly + 18);
    logoGrad.addColorStop(0, "#6366f1");
    logoGrad.addColorStop(1, "#14b8a6");
    ctx.fillStyle = logoGrad;
    ctx.beginPath(); ctx.arc(lx, ly, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "900 16px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("V", lx - 5, ly + 6);

    return y + footerH + 10;
  };

  // Dry-run to measure height
  const measureCtx = canvas.getContext("2d");
  const totalH = draw(measureCtx, false);
  canvas.height = totalH;

  // Real draw
  const ctx = canvas.getContext("2d");
  draw(ctx, true);

  return canvas;
}

// ── View Detail Modal ─────────────────────────────────────────────────────────
function VoucherDetailModal({ voucher, onClose }) {
  const [downloading, setDownloading] = useState(false);

  if (!voucher) return null;

  const getStatusInfo = (v) => {
    const now = new Date();
    if (!v.isActive) return { label: "Inactive", color: "#ef4444", bg: "#fef2f2", dot: "#ef4444" };
    if (now < new Date(v.startDate)) return { label: "Not Started", color: "#d97706", bg: "#fffbeb", dot: "#f59e0b" };
    if (new Date(v.endDate) < now) return { label: "Expired", color: "#6b7280", bg: "#f9fafb", dot: "#9ca3af" };
    if ((v.usedCount || 0) >= v.usageLimit) return { label: "Limit Reached", color: "#ea580c", bg: "#fff7ed", dot: "#f97316" };
    return { label: "Active", color: "#059669", bg: "#ecfdf5", dot: "#10b981" };
  };

  const status = getStatusInfo(voucher);
  const usagePercentage = Math.min(((voucher.usedCount || 0) / voucher.usageLimit) * 100, 100);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const discountDisplay =
    voucher.type === "PERCENTAGE"
      ? `${voucher.value}%`
      : `Rp ${Number(voucher.value).toLocaleString("id-ID")}`;

  // ── Download — pure Canvas 2D, zero external deps ─────────────────────────
  const handleDownload = () => {
    setDownloading(true);
    try {
      const canvas = drawVoucherToCanvas(voucher);
      canvas.toBlob((blob) => {
        if (!blob) {
          alert("Gagal membuat gambar voucher.");
          setDownloading(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `voucher-${voucher.code}.png`;
        link.click();
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, "image/png");
    } catch (err) {
      console.error("Download error:", err);
      alert("Gagal mengunduh gambar voucher.");
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full flex flex-col items-center gap-3" style={{ maxWidth: 480 }}>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-0 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow text-gray-500 hover:text-gray-800 hover:bg-white transition z-10"
          style={{ top: -10 }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── Voucher card preview (UI only, download uses Canvas) ── */}
        <div
          style={{
            width: "100%",
            background: "linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
            borderRadius: 24,
            overflow: "hidden",
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
            position: "relative",
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(20,184,166,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* Header */}
          <div style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.25) 0%, rgba(20,184,166,0.15) 100%)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "20px 24px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "rgba(148,163,184,0.8)", textTransform: "uppercase", marginBottom: 2 }}>Official Voucher</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9", letterSpacing: 0.5 }}>Platform</div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: status.bg, borderRadius: 999, padding: "5px 12px", border: `1px solid ${status.color}30` }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: status.dot, display: "inline-block", boxShadow: `0 0 6px ${status.dot}` }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: status.color, letterSpacing: 0.5 }}>{status.label}</span>
            </div>
          </div>

          {/* Discount hero */}
          <div style={{ padding: "28px 24px 22px", borderBottom: "1px dashed rgba(255,255,255,0.1)", position: "relative" }}>
            {voucher.name && voucher.name !== `Voucher ${voucher.code}` && (
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(148,163,184,0.7)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{voucher.name}</div>
            )}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 6 }}>
              <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg, #a5f3fc 0%, #818cf8 50%, #34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: -2 }}>
                {discountDisplay}
              </div>
              <div style={{ paddingBottom: 10, color: "rgba(148,163,184,0.6)", fontSize: 13, fontWeight: 600 }}>DISKON</div>
            </div>
            {voucher.maxDiscount > 0 && voucher.type === "PERCENTAGE" && (
              <div style={{ fontSize: 12, color: "rgba(148,163,184,0.6)", marginBottom: 8 }}>Maksimal potongan Rp {Number(voucher.maxDiscount).toLocaleString("id-ID")}</div>
            )}
            <div style={{ marginTop: 18 }}>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1.5px dashed rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 20px", display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(148,163,184,0.5)", textTransform: "uppercase" }}>Kode</span>
                <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: 4, color: "#f1f5f9", fontFamily: "'Courier New', monospace" }}>{voucher.code}</span>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>
            {[
              { label: "Berlaku Dari", value: formatDate(voucher.startDate) },
              { label: "Berlaku Sampai", value: formatDate(voucher.endDate) },
              { label: "Target Pengguna", value: voucher.targetUser === "new" ? "Pengguna Baru" : voucher.targetUser === "old" ? "Pengguna Lama" : voucher.targetUser === "premium" ? "Premium User" : "Basic User" },
              { label: "Tipe Paket", value: voucher.packageType ? voucher.packageType.charAt(0).toUpperCase() + voucher.packageType.slice(1) : "—" },
            ].map((row) => (
              <div key={row.label}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "rgba(148,163,184,0.45)", textTransform: "uppercase", marginBottom: 4 }}>{row.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{row.value}</div>
              </div>
            ))}
          </div>

          {/* Usage bar */}
          <div style={{ padding: "0 24px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "rgba(148,163,184,0.45)", textTransform: "uppercase" }}>Pemakaian Voucher</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(148,163,184,0.7)" }}>{voucher.usedCount || 0} / {voucher.usageLimit}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${usagePercentage}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #6366f1, #14b8a6)" }} />
            </div>
          </div>

          {/* Content restrictions */}
          {(voucher.contentType || voucher.paymentType || voucher.contentId) && (
            <div style={{ margin: "0 24px 20px", background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "rgba(148,163,184,0.45)", textTransform: "uppercase", marginBottom: 8 }}>Berlaku Untuk</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {voucher.contentType && <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, padding: "3px 10px" }}>{voucher.contentType}</span>}
                {voucher.paymentType && <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(245,158,11,0.2)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: "3px 10px" }}>{voucher.paymentType}</span>}
                {voucher.contentId && <span style={{ fontSize: 11, fontWeight: 600, background: "rgba(20,184,166,0.15)", color: "#5eead4", border: "1px solid rgba(20,184,166,0.25)", borderRadius: 8, padding: "3px 10px", fontFamily: "monospace" }}>ID: {voucher.contentId.length > 18 ? `${voucher.contentId.substring(0, 18)}…` : voucher.contentId}</span>}
              </div>
            </div>
          )}

          {/* Description */}
          {voucher.description && (
            <div style={{ padding: "0 24px 20px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "rgba(148,163,184,0.45)", textTransform: "uppercase", marginBottom: 5 }}>Deskripsi</div>
              <p style={{ fontSize: 12, color: "rgba(148,163,184,0.65)", lineHeight: 1.6, margin: 0 }}>{voucher.description}</p>
            </div>
          )}

          {/* Footer strip */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 10, color: "rgba(148,163,184,0.35)", fontWeight: 600, letterSpacing: 1 }}>Voucher resmi • Tidak dapat dipindahtangankan</div>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #14b8a6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>V</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: downloading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#fff", border: "none", borderRadius: 12, padding: "12px 0",
              fontWeight: 700, fontSize: 14, cursor: downloading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 20px rgba(99,102,241,0.35)", transition: "all 0.2s",
            }}
          >
            {downloading ? (
              <>
                <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Mengunduh...
              </>
            ) : (
              <>
                <Download style={{ width: 16, height: 16 }} />
                Unduh Voucher
              </>
            )}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.08)", color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 0",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              backdropFilter: "blur(8px)", transition: "all 0.2s",
            }}
          >
            Tutup
          </button>
        </div>

        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", margin: "2px 0 0", letterSpacing: 0.3 }}>
          💡 Unduh gambar lalu bagikan langsung ke WhatsApp
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [totalSavings, setTotalSavings] = useState(0);

  const [form, setForm] = useState(INITIAL_FORM);

  const [viewingVoucher, setViewingVoucher] = useState(null);

  const [contentSearchQuery, setContentSearchQuery] = useState("");
  const [contentSearchResults, setContentSearchResults] = useState([]);
  const [contentSearchLoading, setContentSearchLoading] = useState(false);
  const [showContentDropdown, setShowContentDropdown] = useState(false);

  const debouncedContentQuery = useDebounce(contentSearchQuery, 400);

  useEffect(() => {
    if (!form.contentType || debouncedContentQuery.trim().length < 1) {
      setContentSearchResults([]);
      setShowContentDropdown(false);
      return;
    }

    let cancelled = false;
    setContentSearchLoading(true);

    searchContentByType(form.contentType, debouncedContentQuery).then((results) => {
      if (!cancelled) {
        setContentSearchResults(results);
        setShowContentDropdown(results.length > 0);
        setContentSearchLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [debouncedContentQuery, form.contentType]);

  const handleContentTypeChange = (e) => {
    const newType = e.target.value;
    setForm((prev) => ({
      ...prev,
      contentType: newType,
      contentId: "",
      contentIdLabel: "",
    }));
    setContentSearchQuery("");
    setContentSearchResults([]);
    setShowContentDropdown(false);
  };

  const handleSelectContent = (item) => {
    setForm((prev) => ({
      ...prev,
      contentId: item.id,
      contentIdLabel: item.label,
    }));
    setContentSearchQuery(item.label);
    setShowContentDropdown(false);
  };

  const handleClearContent = () => {
    setForm((prev) => ({ ...prev, contentId: "", contentIdLabel: "" }));
    setContentSearchQuery("");
    setContentSearchResults([]);
    setShowContentDropdown(false);
  };

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await getVouchers();
      const vouchersWithMetadata = (response.data || []).map((v) => ({
        ...v,
        name: v.name || `Voucher ${v.code}`,
        category: v.category || "General",
        description: v.description || "",
        targetUser: v.targetUser || "new",
        packageType: v.packageType || "premium",
      }));
      setVouchers(vouchersWithMetadata);
    } catch (err) {
      console.error("Error fetching vouchers:", err);
      alert("Gagal memuat voucher. Pastikan Anda sudah login sebagai Superadmin.");
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalSavingsData = async () => {
    try {
      const response = await getTotalSavings();
      setTotalSavings(response.data || 0);
    } catch (err) {
      console.error("Error fetching total savings:", err);
      setTotalSavings(0);
    }
  };

  useEffect(() => {
    fetchVouchers();
    fetchTotalSavingsData();
  }, []);

  const isVoucherActive = (voucher) => {
    const now = new Date();
    return (
      voucher.isActive === true &&
      now >= new Date(voucher.startDate) &&
      now <= new Date(voucher.endDate) &&
      (voucher.usedCount || 0) < voucher.usageLimit
    );
  };

  const stats = {
    totalVouchers: vouchers.length,
    activeVouchers: vouchers.filter((v) => isVoucherActive(v)).length,
    totalUsers: vouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0),
    totalSavings,
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    if (name === "value" && form.type === "FIXED") {
      const numValue = parseFloat(value);
      if (numValue < 1) newValue = 1;
    }
    if (name === "value" && form.type === "PERCENTAGE") {
      const numValue = parseFloat(value);
      if (numValue < 0) newValue = 0;
      else if (numValue > 100) newValue = 100;
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setForm((prev) => ({ ...prev, type: newType, value: newType === "FIXED" ? 1 : 0 }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.code || !form.type || form.value === "" || !form.usageLimit || !form.startDate || !form.endDate) {
        alert("Mohon lengkapi semua field yang wajib diisi (*)");
        return;
      }

      const apiPayload = {
        code: String(form.code).trim().toUpperCase(),
        type: String(form.type),
        value: parseFloat(form.value),
        maxDiscount: parseFloat(form.maxDiscount) || 0,
        usageLimit: parseInt(form.usageLimit, 10),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        isActive: Boolean(form.isActive),
        name: form.name?.trim() || null,
        category: form.category?.trim() || null,
        description: form.description?.trim() || null,
        targetusers: [String(form.targetUser)],
        packagetypes: [String(form.packageType)],
        contentType: form.contentType || null,
        paymentType: form.paymentType || null,
        contentId: form.contentId || null,
      };

      console.log("📤 Payload yang dikirim:", apiPayload);

      if (editingId) {
        const response = await updateVoucher(editingId, apiPayload);
        console.log("✅ Update response:", response);
        alert("Voucher berhasil diupdate");
      } else {
        const response = await createVoucher(apiPayload);
        console.log("✅ Create response:", response);
        alert("Voucher berhasil ditambahkan");
      }

      await fetchVouchers();
      await fetchTotalSavingsData();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      console.error("❌ Error saving voucher:", err);
      alert(`Gagal menyimpan voucher: ${err.message}`);
    }
  };

  const handleEdit = (voucher) => {
    setForm({
      code: voucher.code,
      name: voucher.name || "",
      category: voucher.category || "",
      description: voucher.description || "",
      isActive: voucher.isActive,
      type: voucher.type,
      value: voucher.value,
      maxDiscount: voucher.maxDiscount || 0,
      targetUser: voucher.targetusers?.[0] || "new",
      packageType: voucher.packagetypes?.[0] || "premium",
      usageLimit: voucher.usageLimit,
      startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().split("T")[0] : "",
      endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().split("T")[0] : "",
      contentType: voucher.contentType || "",
      paymentType: voucher.paymentType || "",
      contentId: voucher.contentId || "",
      contentIdLabel: voucher.contentId || "",
    });
    setContentSearchQuery(voucher.contentId || "");
    setEditingId(voucher.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus voucher ini?")) return;
    try {
      await deleteVoucher(id);
      alert("Voucher berhasil dihapus");
      await fetchVouchers();
      await fetchTotalSavingsData();
    } catch (err) {
      console.error("Error deleting voucher:", err);
      alert("Gagal menghapus voucher");
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setContentSearchQuery("");
    setContentSearchResults([]);
    setShowContentDropdown(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const getStatusBadge = (voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);

    if (!voucher.isActive) return { label: "Inactive", color: "bg-red-500" };
    if (now < startDate) return { label: "Not Started", color: "bg-yellow-500" };
    if (endDate < now) return { label: "Expired", color: "bg-gray-500" };
    if ((voucher.usedCount || 0) >= voucher.usageLimit) return { label: "Limit Reached", color: "bg-orange-500" };
    return { label: "Active", color: "bg-green-500" };
  };

  const filteredVouchers = vouchers.filter((v) => {
    const matchSearch =
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase()));
    let matchFilter = true;
    if (filterStatus === "active") matchFilter = v.isActive === true;
    else if (filterStatus === "inactive") matchFilter = v.isActive === false;
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data voucher...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Total Voucher</div>
            <div className="text-4xl font-bold text-blue-600">{stats.totalVouchers}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Active Vouchers</div>
            <div className="text-4xl font-bold text-green-600">{stats.activeVouchers}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Total Users</div>
            <div className="text-4xl font-bold text-purple-600">{stats.totalUsers}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">User Savings</div>
            <div className="text-2xl font-bold text-red-500">
              Rp {stats.totalSavings.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Kelola Voucher</h1>
              <p className="text-gray-500 text-sm">Mengelola voucher diskon dan kode promo</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap"
              >
                <span className="text-lg">✏️</span>
                Tambah Voucher Baru
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Code or Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Filters</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* ── Form Modal ───────────────────────────────────────────────────── */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingId ? "Edit Voucher" : "Tambah Voucher"}
                </h2>
                <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* ── Kolom Kiri ─────────────────────────────────────────── */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Informasi Dasar</h3>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kode Voucher<span className="text-red-500">*</span>
                      </label>
                      <input
                        name="code"
                        placeholder="DISKON50"
                        value={form.code}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kode unik untuk voucher (wajib diisi)</p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Voucher</label>
                      <input
                        name="name"
                        placeholder="Diskon Tahun Baru"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Nama tampilan untuk voucher (opsional)</p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                      <input
                        name="category"
                        placeholder="Seasonal, Promo, dll"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kategori voucher untuk pengelompokan (opsional)</p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Voucher</label>
                      <textarea
                        name="description"
                        placeholder="Deskripsi voucher..."
                        value={form.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Deskripsi detail voucher (opsional)</p>
                    </div>

                    <div className="mb-4">
                      <label className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">
                          Status Aktif<span className="text-red-500">*</span>
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={form.isActive}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                        </div>
                      </label>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-4 mt-6">Informasi Penggunaan</h3>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batas Penggunaan<span className="text-red-500">*</span>
                      </label>
                      <input
                        name="usageLimit"
                        type="number"
                        placeholder="100"
                        value={form.usageLimit}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Jumlah maksimal pengguna yang dapat menggunakan voucher ini.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Berlaku Dari<span className="text-red-500">*</span>
                        </label>
                        <input
                          name="startDate"
                          type="date"
                          value={form.startDate}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Berlaku Sampai<span className="text-red-500">*</span>
                        </label>
                        <input
                          name="endDate"
                          type="date"
                          value={form.endDate}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Kolom Kanan ─────────────────────────────────────────── */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Pengaturan Diskon</h3>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe Diskon<span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={form.type}
                        onChange={handleTypeChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="PERCENTAGE">Persentase (%)</option>
                        <option value="FIXED">Nominal (Rp)</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {form.type === "PERCENTAGE" ? "Nilai Diskon (%)" : "Nilai Diskon (Rp)"}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="value"
                        type="number"
                        placeholder={form.type === "PERCENTAGE" ? "0-100" : "Minimal 1"}
                        value={form.value}
                        onChange={handleChange}
                        min={form.type === "FIXED" ? "1" : "0"}
                        max={form.type === "PERCENTAGE" ? "100" : undefined}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {form.type === "FIXED" && (
                        <p className="text-xs text-gray-500 mt-1">Minimal Rp 1</p>
                      )}
                      {form.type === "PERCENTAGE" && (
                        <p className="text-xs text-gray-500 mt-1">0% - 100%</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maksimal Diskon (Rp)</label>
                      <input
                        name="maxDiscount"
                        type="number"
                        placeholder="0"
                        value={form.maxDiscount}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {form.type === "PERCENTAGE"
                          ? "Batas maksimal potongan harga untuk diskon persentase"
                          : "Nilai maksimal tidak boleh melebihi harga produk"}
                      </p>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-4 mt-6">
                      Pembatasan Konten
                      <span className="ml-2 text-xs font-normal text-gray-400">(kosong = berlaku untuk semua)</span>
                    </h3>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Konten</label>
                      <select
                        name="contentType"
                        value={form.contentType}
                        onChange={handleContentTypeChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        {CONTENT_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Pilih jenis konten agar voucher hanya berlaku di konten tersebut.
                        Biarkan kosong agar berlaku di semua tipe konten.
                      </p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Pembayaran</label>
                      <select
                        name="paymentType"
                        value={form.paymentType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        {PAYMENT_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Pilih jenis pembayaran agar voucher hanya berlaku di pembayaran tersebut.
                        Biarkan kosong agar berlaku di semua jenis pembayaran.
                      </p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content ID
                        {form.contentId && (
                          <span className="ml-2 text-xs font-normal text-green-600">
                            ✓ Terpilih: {form.contentId}
                          </span>
                        )}
                      </label>

                      {!form.contentType ? (
                        <div className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-sm">
                          Pilih Tipe Konten terlebih dahulu untuk mengaktifkan pencarian
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={`Cari nama ${CONTENT_TYPE_OPTIONS.find(o => o.value === form.contentType)?.label || "konten"}...`}
                              value={contentSearchQuery}
                              onChange={(e) => {
                                setContentSearchQuery(e.target.value);
                                if (form.contentId && e.target.value !== form.contentIdLabel) {
                                  setForm((prev) => ({ ...prev, contentId: "", contentIdLabel: "" }));
                                }
                              }}
                              onFocus={() => {
                                if (contentSearchResults.length > 0) setShowContentDropdown(true);
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {(form.contentId || contentSearchQuery) && (
                              <button
                                type="button"
                                onClick={handleClearContent}
                                className="px-3 py-2 text-gray-500 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-300 transition"
                                title="Hapus pilihan"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {contentSearchLoading && (
                            <div className="absolute right-12 top-2.5">
                              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                          )}

                          {showContentDropdown && contentSearchResults.length > 0 && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {contentSearchResults.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleSelectContent(item)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition border-b border-gray-100 last:border-0"
                                >
                                  <div className="font-medium text-gray-800 text-sm">{item.label}</div>
                                  <div className="text-xs text-gray-400 font-mono">{item.id}</div>
                                </button>
                              ))}
                            </div>
                          )}

                          {showContentDropdown && !contentSearchLoading && contentSearchResults.length === 0 && contentSearchQuery.trim().length >= 1 && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                Tidak ada konten ditemukan untuk "{contentSearchQuery}"
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-1">
                        Cari konten spesifik agar voucher hanya berlaku pada konten tersebut.
                        Biarkan kosong agar berlaku di semua konten.
                      </p>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-4 mt-6">Target Pengguna</h3>
                    <p className="text-xs text-gray-500 mb-3">Data berikut hanya untuk keperluan UI/display</p>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Tipe Pengguna</label>
                      <div className="flex flex-wrap gap-2">
                        {["new", "old", "premium", "basic"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, targetUser: type }))}
                            className={`px-4 py-2 rounded-full font-medium transition ${
                              form.targetUser === type
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {type === "new" ? "Pengguna Baru" : type === "old" ? "Pengguna Lama" : type === "premium" ? "Premium User" : "Basic User"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Tipe Paket</label>
                      <div className="flex flex-wrap gap-2">
                        {["premium", "basic", "family", "student"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, packageType: type }))}
                            className={`px-4 py-2 rounded-full font-medium transition capitalize ${
                              form.packageType === type
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    {editingId ? "Update Voucher" : "Tambah Voucher"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── View Detail Modal ───────────────────────────────────────────── */}
        {viewingVoucher && (
          <VoucherDetailModal
            voucher={viewingVoucher}
            onClose={() => setViewingVoucher(null)}
          />
        )}

        {/* ── Voucher List ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase">
                      Code / Name <TrendingUp className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase">
                      Discount <TrendingUp className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase">
                      Users <TrendingUp className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase">
                      Period <TrendingDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="text-sm font-semibold text-gray-600 uppercase">Status</div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="text-sm font-semibold text-gray-600 uppercase">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Tidak ada voucher yang ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((v) => {
                    const status = getStatusBadge(v);
                    const usagePercentage = ((v.usedCount || 0) / v.usageLimit) * 100;

                    return (
                      <tr key={v.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-800">{v.code}</div>
                          <div className="text-sm text-gray-500">{v.name || `Voucher ${v.code}`}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {v.contentType && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                {v.contentType}
                              </span>
                            )}
                            {v.paymentType && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                {v.paymentType}
                              </span>
                            )}
                            {v.contentId && (
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-mono">
                                ID:{v.contentId.substring(0, 8)}…
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">
                            {v.type === "PERCENTAGE"
                              ? `${v.value}%`
                              : `Rp ${Number(v.value).toLocaleString("id-ID")}`}
                          </div>
                          {v.maxDiscount > 0 && v.type === "PERCENTAGE" && (
                            <div className="text-xs text-gray-500">
                              Max. Rp{Number(v.maxDiscount).toLocaleString("id-ID")}
                            </div>
                          )}
                          {v.targetUser === "new" && (
                            <div className="text-xs text-blue-600 font-medium mt-1">New Users Only</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-600 font-medium">
                                {v.usedCount || 0} / {v.usageLimit}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="font-medium">Start:</span>
                              <span>{new Date(v.startDate).toLocaleDateString("id-ID")}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="font-medium">End:</span>
                              <span>{new Date(v.endDate).toLocaleDateString("id-ID")}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${status.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEdit(v)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setViewingVoucher(v)}
                              className="text-green-600 hover:text-green-800 transition"
                              title="View"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(v.id)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-center gap-2">
              <button className="px-3 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="px-4 py-2 bg-teal-500 text-white rounded font-medium">1</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">2</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">3</button>
              <span className="px-2 text-gray-500">...</span>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">10</button>
              <button className="px-3 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}