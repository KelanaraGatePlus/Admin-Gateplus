"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  useGetWithdrawalsQuery,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation,
} from "@/hooks/api/financialSliceAPI";
import Icon from "@/lib/IconClient";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtRp(val = 0) {
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) return `Rp${(val / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000)     return `Rp${(val / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)         return `Rp${(val / 1_000).toFixed(0)}K`;
  return `Rp${val.toLocaleString("id-ID")}`;
}

function fmtRpFull(val = 0) {
  return `Rp${val.toLocaleString("id-ID")}`;
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDateReceipt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function fmtTimeReceipt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

const STATUS_BADGE = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  SUCCESS: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  FAILED:  "bg-red-50 text-red-600 border border-red-200",
};

const STATUS_DOT = {
  PENDING: "bg-amber-400",
  SUCCESS: "bg-emerald-500",
  FAILED:  "bg-red-400",
};

// ─── Receipt Modal ────────────────────────────────────────────────────────────

function ReceiptModal({ withdrawal, onClose }) {
  const receiptRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!withdrawal) return null;

  const status = withdrawal.status;
  const isPaid = status === "SUCCESS";
  const isPending = status === "PENDING";
  const isFailed = status === "FAILED";

  const receiptNumber = `WD-${withdrawal.id?.slice(0, 8).toUpperCase() ?? "00000000"}`;

  const handleDownload = () => {
    setDownloading(true);
    const el = receiptRef.current;
    if (!el) return setDownloading(false);
    const win = window.open("", "_blank", "width=480,height=700");
    win.document.write(`<html><head><title>Receipt ${receiptNumber}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',system-ui,sans-serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        @media print{@page{margin:0;size:430px auto}}
      </style></head><body>${el.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); setDownloading(false); }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm px-4 py-6">
      <div className="relative flex flex-col items-center gap-3 w-full max-w-[400px]">

        {/* Close */}
        <button onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors border border-gray-200">
          <Icon icon="solar:close-bold" className="w-3.5 h-3.5 text-gray-500" />
        </button>

        {/* ── RECEIPT CARD ── */}
        <div ref={receiptRef} className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Top accent bar */}
          <div className={cn("h-[3px] w-full",
            isPaid ? "bg-emerald-500" : isPending ? "bg-amber-400" : "bg-red-400"
          )} />

          {/* Brand header */}
          <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1297DC] flex items-center justify-center shadow-sm">
                <Icon icon="solar:wallet-bold" className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 tracking-wider leading-none">KREATOR PAY</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Bukti Penarikan Dana</p>
              </div>
            </div>
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
              isPaid ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
              isPending ? "bg-amber-50 text-amber-700 border border-amber-200" :
              "bg-red-50 text-red-600 border border-red-200"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0",
                isPaid ? "bg-emerald-500" : isPending ? "bg-amber-400 animate-pulse" : "bg-red-400"
              )} />
              {isPaid ? "Disbursed" : isPending ? "Pending" : "Rejected"}
            </span>
          </div>

          {/* Receipt No + Date row */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">No. Struk</p>
              <p className="text-xs font-black text-gray-700 font-mono mt-0.5">{receiptNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Tanggal</p>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">{fmtDateReceipt(withdrawal.createdAt)}</p>
              <p className="text-[10px] text-gray-400 font-mono">{fmtTimeReceipt(withdrawal.createdAt)}</p>
            </div>
          </div>

          {/* Creator */}
          <div className="px-6 py-4 border-b border-dashed border-gray-150">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Kreator</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1297DC]/10 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-[#1297DC]/10">
                {withdrawal.creator?.imageUrl
                  ? <img src={withdrawal.creator.imageUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                  : <span className="text-sm font-black text-[#1297DC]">
                      {(withdrawal.creator?.profileName || "?")[0].toUpperCase()}
                    </span>
                }
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 text-sm leading-tight">
                  {withdrawal.creator?.profileName || withdrawal.creator?.username}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">@{withdrawal.creator?.username}</p>
                {withdrawal.creator?.email && (
                  <p className="text-[10px] text-gray-400 truncate">{withdrawal.creator.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bank */}
          <div className="px-6 py-4 border-b border-dashed border-gray-150">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Rekening Tujuan</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Bank</span>
                <span className="text-xs font-bold text-gray-800">{withdrawal.bankAccount?.bank?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">No. Rekening</span>
                <span className="text-xs font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                  {withdrawal.bankAccount?.accountNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Atas Nama</span>
                <span className="text-xs font-semibold text-gray-700">{withdrawal.bankAccount?.accountName}</span>
              </div>
            </div>
          </div>

          {/* Amount breakdown */}
          <div className="px-6 py-4 border-b border-dashed border-gray-150">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Rincian Biaya</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Jumlah Penarikan</span>
                <span className="text-xs font-bold text-gray-800">{fmtRpFull(withdrawal.withdrawalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Biaya Admin ({withdrawal.bankAccount?.bank?.code})</span>
                <span className="text-xs text-red-400 font-medium">− {fmtRpFull(withdrawal.adminFee)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Biaya Platform (0.1%)</span>
                <span className="text-xs text-red-400 font-medium">− {fmtRpFull(withdrawal.platformFee)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Pajak (0.05%)</span>
                <span className="text-xs text-red-400 font-medium">− {fmtRpFull(withdrawal.taxFee)}</span>
              </div>
            </div>
          </div>

          {/* Final total — hero */}
          <div className={cn("px-6 py-5",
            isPaid ? "bg-emerald-50/60" : isPending ? "bg-amber-50/60" : "bg-red-50/40"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Ditransfer</p>
                {isPaid && withdrawal.completedAt && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                    ✓ Selesai {fmtDate(withdrawal.completedAt)}
                  </p>
                )}
                {isFailed && (
                  <p className="text-[10px] text-red-400 font-semibold mt-1">Permintaan ditolak</p>
                )}
                {isPending && (
                  <p className="text-[10px] text-amber-500 font-semibold mt-1">Menunggu persetujuan</p>
                )}
              </div>
              <p className={cn("text-2xl font-black tracking-tight",
                isPaid ? "text-emerald-600" : isPending ? "text-amber-600" : "text-red-500"
              )}>
                {fmtRpFull(withdrawal.finalAmount)}
              </p>
            </div>
          </div>

          {/* Midtrans ref */}
          {withdrawal.midtransRef && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Ref. Transfer</span>
              <span className="text-[10px] font-mono font-semibold text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded">
                {withdrawal.midtransRef}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-dashed border-gray-200 text-center">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Dokumen ini merupakan bukti resmi pemrosesan penarikan dana.
            </p>
            <p className="text-[10px] text-gray-300 font-mono mt-1">kreatorpay.id · {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Download */}
        <button onClick={handleDownload} disabled={downloading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1297DC] hover:bg-[#0f85c4] text-white text-sm font-bold shadow-lg shadow-[#1297DC]/20 transition-all disabled:opacity-60">
          {downloading
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Icon icon="solar:download-bold" className="w-4 h-4" />
          }
          {downloading ? "Memproses..." : "Unduh Struk (PDF)"}
        </button>
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function ApproveModal({ withdrawal, onConfirm, onCancel, loading }) {
  const [ref, setRef] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Approve Withdrawal</h3>
            <p className="text-xs text-gray-400">Confirm disbursement to creator</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Creator</span>
            <span className="font-semibold text-gray-800">
              {withdrawal?.creator?.profileName || withdrawal?.creator?.username}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Bank</span>
            <span className="font-medium text-gray-700">
              {withdrawal?.bankAccount?.bank?.name} · {withdrawal?.bankAccount?.accountNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Account Name</span>
            <span className="font-medium text-gray-700">{withdrawal?.bankAccount?.accountName}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="text-gray-500">Withdrawal Amount</span>
            <span className="font-bold text-gray-900">{fmtRp(withdrawal?.withdrawalAmount)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Admin Fee</span>
            <span className="text-red-400">- {fmtRp(withdrawal?.adminFee)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Platform Fee</span>
            <span className="text-red-400">- {fmtRp(withdrawal?.platformFee)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Tax Fee</span>
            <span className="text-red-400">- {fmtRp(withdrawal?.taxFee)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-semibold text-gray-700">Final Transfer</span>
            <span className="font-bold text-emerald-600 text-base">{fmtRp(withdrawal?.finalAmount)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Bank Reference / Transfer ID <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="e.g. TRF-20240301-00123"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={() => onConfirm(ref)}
            className="px-4 py-2 text-sm rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
            Approve & Mark Paid
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ withdrawal, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Reject Withdrawal</h3>
            <p className="text-xs text-gray-400">Creator will be notified with the reason</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 text-sm">
          <p className="font-semibold text-gray-800">
            {withdrawal?.creator?.profileName || withdrawal?.creator?.username}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            {withdrawal?.bankAccount?.bank?.name} · {fmtRp(withdrawal?.finalAmount)}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Rejection Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Invalid bank account details, amount mismatch..."
            rows={3}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={() => onConfirm(reason || "Rejected by administrator.")}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Reject Request
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WithdrawalRequestsPage() {
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]               = useState(1);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget]   = useState(null);
  const [receiptTarget, setReceiptTarget] = useState(null);
  const [toast, setToast]             = useState(null);

  const { data, isLoading, isError, refetch } = useGetWithdrawalsQuery({
    page, limit: 20, search, status: statusFilter,
  });

  const [approveWd, { isLoading: approving }] = useApproveWithdrawalMutation();
  const [rejectWd,  { isLoading: rejecting  }] = useRejectWithdrawalMutation();

  const withdrawals = data?.data?.withdrawals || [];
  const stats       = data?.data?.stats       || {};
  const pagination  = data?.pagination        || {};

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleApprove = async (midtransRef) => {
    try {
      await approveWd({ id: approveTarget.id, midtransRef }).unwrap();
      showToast("Withdrawal approved & marked as paid", "success");
      setApproveTarget(null);
      refetch();
    } catch (err) {
      showToast(err?.data?.message || "Failed to approve", "error");
    }
  };

  const handleReject = async (reason) => {
    try {
      await rejectWd({ id: rejectTarget.id, reason }).unwrap();
      showToast("Withdrawal request rejected", "info");
      setRejectTarget(null);
      refetch();
    } catch (err) {
      showToast(err?.data?.message || "Failed to reject", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium",
          toast.type === "success" ? "bg-emerald-600 text-white" :
          toast.type === "error"   ? "bg-red-600 text-white" :
                                     "bg-gray-700 text-white"
        )}>
          <Icon icon={
            toast.type === "success" ? "solar:check-circle-bold" :
            toast.type === "error"   ? "solar:danger-circle-bold" :
                                       "solar:info-circle-bold"
          } className="w-4 h-4" />
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <a
              href="/analitik-dan-laporan/creator-payout-control"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1297DC] transition-colors font-medium"
            >
              <Icon icon="solar:arrow-left-bold" className="w-3.5 h-3.5" />
              Creator Payout Control
            </a>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            Withdrawal Requests
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Review and process creator withdrawal requests
          </p>
        </div>

        <button
          onClick={refetch}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 font-medium"
        >
          <Icon icon="solar:refresh-bold" className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: "solar:clock-circle-bold",
            iconBg: "bg-amber-50", iconColor: "text-amber-500",
            label: "Pending Requests",
            value: stats.pending ?? "—",
            sub: `Rp${((stats.totalPendingAmount || 0) / 1_000_000).toFixed(1)}M waiting`,
            subColor: "text-amber-500",
          },
          {
            icon: "solar:check-circle-bold",
            iconBg: "bg-emerald-50", iconColor: "text-emerald-500",
            label: "Approved",
            value: stats.success ?? "—",
            sub: "Total approved requests",
            subColor: "text-emerald-500",
          },
          {
            icon: "solar:close-circle-bold",
            iconBg: "bg-red-50", iconColor: "text-red-400",
            label: "Rejected",
            value: stats.failed ?? "—",
            sub: "Total rejected requests",
          },
          {
            icon: "solar:dollar-minimalistic-bold",
            iconBg: "bg-[#1297DC]/10", iconColor: "text-[#1297DC]",
            label: "Pending Amount",
            value: fmtRp(stats.totalPendingAmount || 0),
            sub: "Total awaiting disbursement",
          },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2", s.iconBg)}>
              <Icon icon={s.icon} className={cn("w-5 h-5", s.iconColor)} />
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{s.value}</p>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            {s.sub && (
              <p className={cn("text-xs font-semibold mt-0.5", s.subColor || "text-gray-400")}>{s.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by creator name..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1297DC]/25"
          />
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {[
            { label: "All",     value: "" },
            { label: "Pending", value: "PENDING" },
            { label: "Paid",    value: "SUCCESS" },
            { label: "Rejected",value: "FAILED"  },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                statusFilter === opt.value
                  ? "bg-[#1297DC] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <span className="text-xs text-gray-400">
          {pagination.total || 0} total requests
        </span>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 border-4 border-[#1297DC] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Loading withdrawal requests...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Icon icon="solar:danger-circle-bold" className="w-10 h-10 text-red-300" />
            <p className="text-sm text-gray-500">Failed to load withdrawal data</p>
            <button onClick={refetch} className="text-xs text-[#1297DC] hover:underline font-medium">Retry</button>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Icon icon="solar:wallet-bold" className="w-12 h-12 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">No withdrawal requests found</p>
            <p className="text-xs">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "Creator", "Bank Account", "Requested Amount",
                    "Fees", "Final Transfer", "Status",
                    "Requested At", "Completed At", "Actions",
                  ].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {withdrawals.map((w) => {
                  const badgeCls = STATUS_BADGE[w.status] || STATUS_BADGE.PENDING;
                  const dotCls   = STATUS_DOT[w.status]   || STATUS_DOT.PENDING;
                  const isPending = w.status === "PENDING";

                  return (
                    <tr
                      key={w.id}
                      className={cn(
                        "transition-colors group",
                        isPending ? "hover:bg-amber-50/30" : "hover:bg-gray-50/80"
                      )}
                    >
                      {/* Creator */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1297DC]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {w.creator?.imageUrl
                              ? <img src={w.creator.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                              : <span className="text-xs font-bold text-[#1297DC]">
                                  {(w.creator?.profileName || "?")[0].toUpperCase()}
                                </span>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-xs leading-tight truncate max-w-[110px]">
                              {w.creator?.profileName || w.creator?.username}
                            </p>
                            <p className="text-gray-400 text-xs">@{w.creator?.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Bank Account */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-700 text-xs">{w.bankAccount?.bank?.name}</span>
                          <span className="font-mono text-gray-400 text-xs">{w.bankAccount?.accountNumber}</span>
                          <span className="text-gray-400 text-xs">{w.bankAccount?.accountName}</span>
                        </div>
                      </td>

                      {/* Withdrawal Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-800 text-xs">{fmtRp(w.withdrawalAmount)}</span>
                      </td>

                      {/* Fees */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-gray-400 space-y-0.5">
                          <div>Admin: <span className="text-red-400">{fmtRp(w.adminFee)}</span></div>
                          <div>Platform: <span className="text-red-400">{fmtRp(w.platformFee)}</span></div>
                          <div>Tax: <span className="text-red-400">{fmtRp(w.taxFee)}</span></div>
                        </div>
                      </td>

                      {/* Final Transfer */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-600 text-sm">{fmtRp(w.finalAmount)}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", badgeCls)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", dotCls)} />
                          {w.status === "SUCCESS" ? "PAID" : w.status}
                        </span>
                        {w.midtransRef && (
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">{w.midtransRef.slice(0, 16)}...</p>
                        )}
                      </td>

                      {/* Requested At */}
                      <td className="py-3.5 px-4 text-xs text-gray-400 whitespace-nowrap">
                        {fmtDate(w.createdAt)}
                      </td>

                      {/* Completed At */}
                      <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                        {w.completedAt
                          ? <span className="text-emerald-500 font-medium">{fmtDate(w.completedAt)}</span>
                          : <span className="text-gray-300">—</span>
                        }
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {/* Receipt button — replaces detail drawer */}
                          <button
                            onClick={() => setReceiptTarget(w)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-[#1297DC]/10 hover:border-[#1297DC]/30 transition-colors group/eye"
                            title="Lihat Struk"
                          >
                            <Icon icon="solar:eye-bold" className="w-3.5 h-3.5 text-gray-400 group-hover/eye:text-[#1297DC] transition-colors" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => setApproveTarget(w)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm shadow-emerald-100 transition-colors"
                              >
                                <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectTarget(w)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors"
                              >
                                <Icon icon="solar:close-circle-bold" className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}

                          {w.status === "SUCCESS" && (
                            <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                              <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" />
                              Paid
                            </span>
                          )}

                          {w.status === "FAILED" && (
                            <span className="text-xs text-red-400 font-medium flex items-center gap-1">
                              <Icon icon="solar:close-circle-bold" className="w-3.5 h-3.5" />
                              Rejected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {withdrawals.length} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <Icon icon="solar:arrow-left-bold" className="w-4 h-4 text-gray-500" />
              </button>
              <span className="text-xs text-gray-600 px-3">{page} / {pagination.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <Icon icon="solar:arrow-right-bold" className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {approveTarget && (
        <ApproveModal
          withdrawal={approveTarget}
          onConfirm={handleApprove}
          onCancel={() => setApproveTarget(null)}
          loading={approving}
        />
      )}

      {rejectTarget && (
        <RejectModal
          withdrawal={rejectTarget}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
          loading={rejecting}
        />
      )}

      {/* ── Receipt Modal ── */}
      {receiptTarget && (
        <ReceiptModal
          withdrawal={receiptTarget}
          onClose={() => setReceiptTarget(null)}
        />
      )}
    </div>
  );
}