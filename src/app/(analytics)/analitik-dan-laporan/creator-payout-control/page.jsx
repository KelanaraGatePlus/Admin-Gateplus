"use client";

import React, { useState, useCallback, useMemo } from "react";
import backendUrl from "@/const/backendUrl";
import {
  useGetCreatorPayoutControlQuery,
  useGetPendingBankAccountsQuery,
  useGetVerifiedBankAccountsQuery,   // ← NEW — add this to financialSliceAPI
  useApproveBankAccountMutation,
  useRejectBankAccountMutation,
  useProcessBulkPayoutMutation,
} from "@/hooks/api/financialSliceAPI";
import Icon from "@/lib/IconClient";
import { cn } from "@/lib/utils";
import { downloadWithAuth } from "@/lib/downloadWithAuth";
import { useRouter } from "next/navigation";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtRp(val = 0) {
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) return `Rp${(val / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000)     return `Rp${(val / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)         return `Rp${(val / 1_000).toFixed(0)}K`;
  return `Rp${val.toLocaleString("id-ID")}`;
}

const ALL_TIME_VALUE = "all-time";

const PAYOUT_BADGE = {
  Paid:        "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Pending:     "bg-amber-50  text-amber-700  border border-amber-200",
  "No Payout": "bg-gray-100  text-gray-400   border border-gray-200",
};
const PAYOUT_DOT = {
  Paid:        "bg-emerald-500",
  Pending:     "bg-amber-400",
  "No Payout": "bg-gray-300",
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ icon, iconBg, iconColor, label, value, sub, subColor }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2", iconBg)}>
        <Icon icon={icon} className={cn("w-5 h-5", iconColor)} />
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      {sub && <p className={cn("text-xs font-semibold mt-0.5", subColor || "text-gray-400")}>{sub}</p>}
    </div>
  );
}

// ─── Bulk Payout Modal ────────────────────────────────────────────────────────

function BulkPayoutModal({ creators, onConfirm, onCancel, loading }) {
  const [note, setNote] = useState("");
  const totalNet = creators.reduce((s, c) => s + (c.availableBalance ?? c.netPayable ?? 0), 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#1297DC]/10 flex items-center justify-center">
            <Icon icon="solar:dollar-minimalistic-bold" className="w-6 h-6 text-[#1297DC]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Confirm Bulk Payout</h3>
            <p className="text-xs text-gray-400">Create withdrawal records for {creators.length} creator{creators.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="bg-[#1297DC]/5 border border-[#1297DC]/20 rounded-xl p-4 flex items-center justify-between">
          <div><p className="text-xs text-gray-500">Total Creators</p><p className="text-2xl font-bold text-[#1297DC]">{creators.length}</p></div>
          <div className="text-right"><p className="text-xs text-gray-500">Est. Total Disbursement</p><p className="text-2xl font-bold text-gray-900">{fmtRp(totalNet)}</p></div>
        </div>
        <div className="flex flex-col gap-0 max-h-52 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
          {creators.map((c) => (
            <div key={c.creatorId} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#1297DC]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {c.imageUrl ? <img src={c.imageUrl} alt="" className="w-7 h-7 rounded-full object-cover" /> : <span className="text-xs font-bold text-[#1297DC]">{(c.name || "?")[0].toUpperCase()}</span>}
                </div>
                <span className="font-medium text-gray-700 text-xs">{c.name}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-600 text-xs">{fmtRp(c.availableBalance ?? c.netPayable ?? 0)}</span>
                {c.bankAccount ? <p className="text-xs text-gray-400">{c.bankAccount.bank?.name}</p> : <p className="text-xs text-red-400">No bank account</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Note <span className="text-gray-400 font-normal">(optional)</span></label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Monthly payout - March 2026" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1297DC]/25" />
        </div>
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Icon icon="solar:danger-triangle-bold" className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">Creators without a verified bank account will be skipped. Withdrawals are marked <strong>SUCCESS</strong> immediately.</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium">Cancel</button>
          <button disabled={loading} onClick={() => onConfirm(note)} className="px-5 py-2 text-sm rounded-xl bg-[#1297DC] hover:bg-[#0d7fc0] text-white font-bold disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-[#1297DC]/30">
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
            Process Bulk Payout
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkPayoutResultModal({ result, onClose }) {
  if (!result) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Icon icon="solar:check-circle-bold" className="w-6 h-6 text-emerald-600" />
          </div>
          <div><h3 className="font-bold text-gray-900 text-base">Bulk Payout Complete</h3><p className="text-xs text-gray-400">Processing summary</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
            <p className="text-2xl font-bold text-emerald-600">{result.succeeded?.length || 0}</p>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">Succeeded</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
            <p className="text-2xl font-bold text-red-500">{result.failed?.length || 0}</p>
            <p className="text-xs text-red-600 font-medium mt-0.5">Failed / Skipped</p>
          </div>
        </div>
        {result.failed?.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skipped Creators</p>
            {result.failed.map((f, i) => (
              <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                <span className="text-gray-600 font-mono">{f.creatorId?.slice(0, 12)}...</span>
                <span className="text-red-400">{f.reason}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[#1297DC] text-white font-bold text-sm hover:bg-[#0d7fc0]">Done</button>
      </div>
    </div>
  );
}

// ─── Reject Bank Modal ────────────────────────────────────────────────────────

function RejectBankModal({ account, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-red-500" />
          </div>
          <div><h3 className="font-bold text-gray-900 text-base">Reject Bank Account</h3><p className="text-xs text-gray-400">This action cannot be undone</p></div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-sm">
          <p className="font-medium text-gray-700">{account?.creator?.profileName || account?.creator?.username}</p>
          <p className="text-gray-500 text-xs mt-0.5">{account?.bank?.name} · {account?.accountNumber} · {account?.accountName}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Rejection Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Account number does not match..." rows={3} className="border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300" />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium">Cancel</button>
          <button disabled={loading} onClick={() => onConfirm(reason || "No reason provided.")} className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50 flex items-center gap-1.5">
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Reject & Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Verified Banks Panel ─────────────────────────────────────────────────────
// ✅ Server-side pagination + filter + search — aman untuk data banyak

function VerifiedBanksPanel() {
  const [bankFilter, setBankFilter] = useState("");  // bank name selected
  const [search, setSearch]         = useState("");  // norek / creator search
  const [searchInput, setSearchInput] = useState(""); // debounce buffer
  const [page, setPage]             = useState(1);
  const LIMIT = 15;

  // Debounce search input — hanya kirim request setelah user berhenti mengetik 400ms
  const debounceRef = React.useRef(null);
  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  const { data, isLoading, isFetching, refetch } = useGetVerifiedBankAccountsQuery(
    { page, limit: LIMIT, search, bankName: bankFilter },
    { refetchOnMountOrArgChange: true }
  );

  const accounts   = data?.data       || [];
  const pagination = data?.pagination || {};
  // bankNames: daftar bank yang punya akun verified — untuk dropdown filter
  const bankNames  = data?.bankNames  || [];

  const handleBankFilter = (val) => {
    setBankFilter(val);
    setPage(1);
  };

  const clearFilters = () => {
    setBankFilter("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const hasFilter = bankFilter || search;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Icon icon="solar:shield-check-bold" className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-base">Verified Bank Accounts</h2>
            <p className="text-xs text-gray-400">Semua rekening creator yang sudah terverifikasi</p>
          </div>
          {pagination.total > 0 && (
            <span className="ml-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
              {pagination.total.toLocaleString("id-ID")} verified
            </span>
          )}
        </div>

        {/* Filter & Search controls */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Bank filter dropdown — populated from server */}
          <div className="relative">
            <Icon icon="solar:buildings-2-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={bankFilter}
              onChange={(e) => handleBankFilter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1297DC]/25 cursor-pointer min-w-[160px]"
            >
              <option value="">Semua Bank</option>
              {bankNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
          </div>

          {/* Search — no. rekening atau nama creator */}
          <div className="relative">
            <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={bankFilter ? `Cari no. rekening ${bankFilter}...` : "Cari no. rekening / creator..."}
              className="pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1297DC]/25 w-64 transition-all"
            />
            {searchInput && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
              >
                <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Clear all filters */}
          {hasFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 font-medium"
            >
              <Icon icon="solar:restart-bold" className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={refetch}
            disabled={isFetching}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-400 disabled:opacity-50"
            title="Refresh"
          >
            <Icon icon="solar:refresh-bold" className={cn("w-4 h-4", isFetching && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilter && (
        <div className="px-6 py-2 border-b border-gray-50 flex items-center gap-2 flex-wrap bg-gray-50/50">
          <span className="text-xs text-gray-400">Filter aktif:</span>
          {bankFilter && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1297DC]/10 text-[#1297DC] text-xs font-semibold border border-[#1297DC]/20">
              <Icon icon="solar:buildings-2-bold" className="w-3 h-3" />
              {bankFilter}
              <button onClick={() => handleBankFilter("")} className="ml-0.5 opacity-60 hover:opacity-100">×</button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-200">
              <Icon icon="solar:magnifer-bold" className="w-3 h-3" />
              "{search}"
              <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="ml-0.5 opacity-60 hover:opacity-100">×</button>
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-[#1297DC] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Memuat data rekening...</p>
            </div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
            <Icon icon="solar:card-bold" className="w-12 h-12 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">
              {hasFilter ? "Tidak ada hasil untuk filter ini" : "Belum ada rekening terverifikasi"}
            </p>
            {hasFilter && (
              <button onClick={clearFilters} className="text-xs text-[#1297DC] hover:underline mt-1">
                Hapus semua filter
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Creator", "Bank", "No. Rekening", "Nama Rekening", "Terverifikasi", "Status"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-emerald-50/30 transition-colors group">

                  {/* Creator */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1297DC]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {acc.creator?.imageUrl
                          ? <img src={acc.creator.imageUrl} alt="" className="w-8 h-8 object-cover rounded-full" />
                          : <span className="text-xs font-bold text-[#1297DC]">{(acc.creator?.profileName || "?")[0].toUpperCase()}</span>
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-xs">{acc.creator?.profileName || acc.creator?.username}</p>
                        <p className="text-gray-400 text-xs">@{acc.creator?.username}</p>
                      </div>
                    </div>
                  </td>

                  {/* Bank */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Icon icon="solar:buildings-2-bold" className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-xs">{acc.bank?.name}</p>
                        <p className="text-gray-400 text-xs">{acc.bank?.code}</p>
                      </div>
                    </div>
                  </td>

                  {/* Account Number — highlight search match */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs bg-gray-100 group-hover:bg-emerald-100 px-2.5 py-1 rounded-lg text-gray-700 tracking-widest transition-colors">
                      {search
                        ? highlightMatch(acc.accountNumber, search)
                        : acc.accountNumber}
                    </span>
                  </td>

                  {/* Account Name */}
                  <td className="py-3.5 px-4 text-gray-700 font-medium text-xs">{acc.accountName}</td>

                  {/* Verified date */}
                  <td className="py-3.5 px-4">
                    <p className="text-xs text-gray-600 font-medium">
                      {new Date(acc.updatedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(acc.updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </td>

                  {/* Status badge */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination — server-side, aman untuk jutaan data */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-gray-50/30">
          <p className="text-xs text-gray-400">
            Menampilkan <span className="font-semibold text-gray-600">{((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, pagination.total)}</span> dari <span className="font-semibold text-gray-600">{pagination.total.toLocaleString("id-ID")}</span> rekening
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 text-gray-500"
              title="Halaman pertama"
            >
              <Icon icon="solar:double-alt-arrow-left-bold" className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 text-gray-500"
            >
              <Icon icon="solar:arrow-left-bold" className="w-3.5 h-3.5" />
            </button>

            {/* Page number pills */}
            <div className="flex items-center gap-1 mx-1">
              {getPageRange(page, pagination.totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="text-xs text-gray-400 px-1">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-7 h-7 rounded-lg text-xs font-semibold border transition-all",
                      p === page
                        ? "bg-[#1297DC] text-white border-[#1297DC] shadow-sm"
                        : "border-gray-200 text-gray-500 hover:bg-white"
                    )}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 text-gray-500"
            >
              <Icon icon="solar:arrow-right-bold" className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(pagination.totalPages)}
              disabled={page === pagination.totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 text-gray-500"
              title="Halaman terakhir"
            >
              <Icon icon="solar:double-alt-arrow-right-bold" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Highlight matching text in account number / name
function highlightMatch(text = "", query = "") {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// Generate page range with ellipsis for large page counts
function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", total);
  } else if (current >= total - 3) {
    pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }
  return pages;
}

// ─── Bank Approval Panel (Pending + Verified tabs) ────────────────────────────

function BankApprovalPanel() {
  const [bankSubTab, setBankSubTab]     = useState("pending");
  const [bankSearch, setBankSearch]     = useState("");
  const [bankPage, setBankPage]         = useState(1);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [toast, setToast]               = useState(null);

  const { data: bankData, isLoading: bankLoading, refetch: refetchBanks } =
    useGetPendingBankAccountsQuery({ page: bankPage, limit: 10, search: bankSearch });
  const [approveBank, { isLoading: approving }] = useApproveBankAccountMutation();
  const [rejectBank,  { isLoading: rejecting  }] = useRejectBankAccountMutation();

  const pendingAccounts = bankData?.data       || [];
  const bankPagination  = bankData?.pagination || {};

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleApprove = async (id) => {
    try { await approveBank(id).unwrap(); showToast("Bank account approved ✓", "success"); refetchBanks(); }
    catch (err) { showToast(err?.data?.message || "Failed to approve", "error"); }
  };
  const handleRejectConfirm = async (reason) => {
    try { await rejectBank({ id: rejectTarget.id, reason }).unwrap(); showToast("Rejected and removed", "info"); setRejectTarget(null); refetchBanks(); }
    catch (err) { showToast(err?.data?.message || "Failed to reject", "error"); }
  };

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className={cn("fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium",
          toast.type === "success" ? "bg-emerald-600 text-white" : toast.type === "error" ? "bg-red-600 text-white" : "bg-gray-700 text-white")}>
          <Icon icon={toast.type === "success" ? "solar:check-circle-bold" : "solar:info-circle-bold"} className="w-4 h-4" />
          {toast.msg}
        </div>
      )}

      {/* Sub-tab switcher */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm self-start">
        <button
          onClick={() => setBankSubTab("pending")}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
            bankSubTab === "pending" ? "bg-amber-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
        >
          <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
          Pending Approval
          {bankPagination.total > 0 && (
            <span className={cn("px-1.5 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center",
              bankSubTab === "pending" ? "bg-white/30 text-white" : "bg-amber-100 text-amber-700")}>
              {bankPagination.total}
            </span>
          )}
        </button>
        <button
          onClick={() => setBankSubTab("verified")}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
            bankSubTab === "verified" ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
        >
          <Icon icon="solar:shield-check-bold" className="w-4 h-4" />
          List Verified Banks
        </button>
      </div>

      {/* ── Pending sub-tab ── */}
      {bankSubTab === "pending" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Icon icon="solar:card-bold" className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base">Pending Bank Accounts</h2>
                <p className="text-xs text-gray-400">Tinjau dan verifikasi rekening creator</p>
              </div>
              {bankPagination.total > 0 && (
                <span className="ml-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
                  {bankPagination.total} pending
                </span>
              )}
            </div>
            <div className="relative">
              <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={bankSearch} onChange={(e) => { setBankSearch(e.target.value); setBankPage(1); }} placeholder="Cari creator atau rekening..." className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1297DC]/25 w-56" />
            </div>
          </div>

          <div className="overflow-x-auto">
            {bankLoading ? (
              <div className="flex items-center justify-center h-32"><div className="w-7 h-7 border-3 border-[#1297DC] border-t-transparent rounded-full animate-spin" /></div>
            ) : pendingAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-400">
                <Icon icon="solar:check-circle-bold" className="w-12 h-12 text-emerald-200" />
                <p className="text-sm font-medium text-gray-500">Semua rekening sudah diverifikasi</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Creator", "Bank", "No. Rekening", "Nama Rekening", "Diajukan", "Aksi"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1297DC]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {acc.creator?.imageUrl ? <img src={acc.creator.imageUrl} alt="" className="w-8 h-8 object-cover rounded-full" /> : <span className="text-xs font-bold text-[#1297DC]">{(acc.creator?.profileName || "?")[0].toUpperCase()}</span>}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-xs">{acc.creator?.profileName || acc.creator?.username}</p>
                            <p className="text-gray-400 text-xs">@{acc.creator?.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-700 text-xs">{acc.bank?.name}</p>
                        <p className="text-gray-400 text-xs">{acc.bank?.code}</p>
                      </td>
                      <td className="py-3.5 px-4"><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">{acc.accountNumber}</span></td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium text-xs">{acc.accountName}</td>
                      <td className="py-3.5 px-4 text-gray-400 text-xs whitespace-nowrap">{new Date(acc.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleApprove(acc.id)} disabled={approving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold disabled:opacity-50 transition-colors">
                            <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" />Approve
                          </button>
                          <button onClick={() => setRejectTarget(acc)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors">
                            <Icon icon="solar:close-circle-bold" className="w-3.5 h-3.5" />Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {bankPagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Menampilkan {pendingAccounts.length} dari {bankPagination.total}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setBankPage((p) => Math.max(1, p - 1))} disabled={bankPage === 1} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><Icon icon="solar:arrow-left-bold" className="w-3.5 h-3.5 text-gray-500" /></button>
                <span className="text-xs text-gray-600 px-2">{bankPage} / {bankPagination.totalPages}</span>
                <button onClick={() => setBankPage((p) => Math.min(bankPagination.totalPages, p + 1))} disabled={bankPage === bankPagination.totalPages} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><Icon icon="solar:arrow-right-bold" className="w-3.5 h-3.5 text-gray-500" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Verified sub-tab ── */}
      {bankSubTab === "verified" && <VerifiedBanksPanel />}

      {rejectTarget && <RejectBankModal account={rejectTarget} onConfirm={handleRejectConfirm} onCancel={() => setRejectTarget(null)} loading={rejecting} />}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreatorPayoutControlPage() {
  const router = useRouter();
  const now    = new Date();

  const [selectedValue, setSelectedValue] = useState(`${now.getFullYear()}-${now.getMonth() + 1}`);
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("");
  const [page, setPage]                   = useState(1);
  const [selected, setSelected]           = useState([]);
  const [activeTab, setActiveTab]         = useState("payouts");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkResult, setBulkResult]       = useState(null);
  const [toast, setToast]                 = useState(null);

  const isAllTime = selectedValue === ALL_TIME_VALUE;
  const [selYear, selMonth] = isAllTime ? [null, null] : selectedValue.split("-").map(Number);

  // Generate 24 bulan di frontend — selalu tersedia tanpa nunggu backend
  const frontendMonthOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i < 24; i++) {
      let m = now.getMonth() + 1 - i;
      let y = now.getFullYear();
      while (m <= 0) { m += 12; y -= 1; }
      opts.push({
        month: m, year: y,
        label: new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" }),
      });
    }
    return opts;
  }, []);

  const queryArgs = {
    page, limit: 20, search, status: statusFilter,
    ...(isAllTime ? { allTime: true } : { month: selMonth, year: selYear }),
  };

  const { data, isLoading, isError, refetch } = useGetCreatorPayoutControlQuery(queryArgs);
  const [processBulkPayout, { isLoading: bulkLoading }] = useProcessBulkPayoutMutation();

  const d          = data?.data       || {};
  const stats      = d.stats          || {};
  const creators   = d.creators       || [];
  const monthOpts  = d.monthOptions?.length > 0 ? d.monthOptions : frontendMonthOptions;
  const pagination = data?.pagination || {};

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleExport = async () => {
    try {
      await downloadWithAuth(
        `${backendUrl}/management/financial/export?type=payout`,
        "payout-report.csv"
      );
    } catch (err) {
      showToast(err.message || "Failed to export payout", "error");
    }
  };

  const toggleSelect = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(selected.length === creators.length ? [] : creators.map((c) => c.creatorId));
  const selectedCreators = creators.filter(
    (c) => selected.includes(c.creatorId) && c.payoutStatus === "Pending"
  );

  const handleBulkPayoutConfirm = async (note) => {
    try {
      const result = await processBulkPayout({
        creatorIds: selectedCreators.map((c) => c.creatorId), note,
      }).unwrap();
      setBulkResult(result.data);
      setShowBulkModal(false);
      setSelected([]);
      const ok  = result.data?.succeeded?.length || 0;
      const bad = result.data?.failed?.length    || 0;
      showToast(`Bulk payout: ${ok} succeeded${bad > 0 ? `, ${bad} skipped` : ""}`, ok > 0 ? "success" : "error");
      refetch();
    } catch (err) {
      setShowBulkModal(false);
      showToast(err?.data?.message || "Bulk payout failed", "error");
    }
  };

  const activeLabel = isAllTime
    ? "All Time"
    : monthOpts.find((o) => o.month === selMonth && o.year === selYear)?.label
      || new Date(selYear, selMonth - 1).toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">

      {toast && (
        <div className={cn("fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium",
          toast.type === "success" ? "bg-emerald-600 text-white" : toast.type === "error" ? "bg-red-600 text-white" : "bg-gray-700 text-white")}>
          <Icon icon={toast.type === "success" ? "solar:check-circle-bold" : toast.type === "error" ? "solar:danger-circle-bold" : "solar:info-circle-bold"} className="w-4 h-4" />
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Creator Payout Control</h1>
          <p className="text-sm text-gray-400 mt-1">Manage payouts, verify bank accounts, and monitor creator earnings</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => router.push("/analitik-dan-laporan/creator-payout-control/withdrawal-requests")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1297DC]/30 bg-[#1297DC]/5 text-[#1297DC] hover:bg-[#1297DC]/10 text-sm font-semibold transition-colors">
            <Icon icon="solar:wallet-bold" className="w-4 h-4" />
            Withdrawal Requests
            <Icon icon="solar:arrow-right-bold" className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button onClick={() => setActiveTab("payouts")} className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all", activeTab === "payouts" ? "bg-[#1297DC] text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50")}>
              <Icon icon="solar:dollar-bold" className="w-4 h-4 inline mr-1.5 -mt-0.5" />Payouts
            </button>
            <button onClick={() => setActiveTab("bank-approval")} className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all", activeTab === "bank-approval" ? "bg-[#1297DC] text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50")}>
              <Icon icon="solar:card-bold" className="w-4 h-4 inline mr-1.5 -mt-0.5" />Bank Verification
            </button>
          </div>
        </div>
      </div>

      {/* TAB: PAYOUTS */}
      {activeTab === "payouts" && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Icon icon="solar:calendar-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select value={selectedValue} onChange={(e) => { setSelectedValue(e.target.value); setPage(1); }} className="appearance-none pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1297DC]/25 cursor-pointer min-w-[200px]">
                <option value={ALL_TIME_VALUE}>📊 All Time</option>
                <option disabled className="text-gray-300 text-xs">── Per Month ──</option>
                {monthOpts.map((o) => (
                  <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>{o.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1297DC]/10 text-[#1297DC] rounded-xl text-xs font-semibold border border-[#1297DC]/20">
              <Icon icon="solar:clock-circle-bold" className="w-3.5 h-3.5" />{activeLabel}
            </span>
            <div className="flex-1" />
            <div className="relative">
              <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search creators..." className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1297DC]/25 w-48" />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none">
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 font-medium">
              <Icon icon="solar:download-bold" className="w-4 h-4" />Export
            </button>
            <button disabled={selectedCreators.length === 0} onClick={() => setShowBulkModal(true)} className={cn("flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl font-semibold transition-all", selectedCreators.length > 0 ? "bg-[#1297DC] text-white hover:bg-[#0d7fc0] shadow-sm shadow-[#1297DC]/30" : "bg-gray-100 text-gray-400 cursor-not-allowed")}>
              <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
              Bulk Payout {selectedCreators.length > 0 && `(${selectedCreators.length})`}
            </button>
          </div>

          {selected.length > 0 && selectedCreators.length < selected.length && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              <Icon icon="solar:info-circle-bold" className="w-4 h-4 flex-shrink-0" />
              {selected.length - selectedCreators.length} creator tidak memenuhi syarat. Hanya <strong className="mx-1">{selectedCreators.length}</strong> yang akan diproses.
            </div>
          )}

          {/* Stats */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0,1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-28 animate-pulse"><div className="w-10 h-10 rounded-xl bg-gray-100 mb-3" /><div className="h-5 bg-gray-100 rounded w-2/3 mb-1.5" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon="solar:dollar-minimalistic-bold" iconBg="bg-[#1297DC]/10" iconColor="text-[#1297DC]" label="Total Payable" value={fmtRp(stats.totalPayable)} sub={isAllTime ? "All time gross" : `Period: ${activeLabel}`} />
              <StatCard icon="solar:clock-circle-bold" iconBg="bg-amber-50" iconColor="text-amber-500" label="Pending Payout" value={fmtRp(stats.pendingPayout)} sub="Awaiting disbursement" subColor="text-amber-500" />
              <StatCard icon="solar:check-circle-bold" iconBg="bg-emerald-50" iconColor="text-emerald-500" label={isAllTime ? "Total Paid" : "Paid (Period)"} value={fmtRp(stats.paidMTD)} sub="Completed withdrawals" subColor="text-emerald-500" />
              <StatCard icon="solar:safe-2-bold" iconBg="bg-violet-50" iconColor="text-violet-500" label="Reserve Balance" value={fmtRp(stats.reserveBalance)} sub="Held for pending payouts" />
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 text-base">Creator Payout Management</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isAllTime ? "Showing all-time revenue data" : `Period: ${activeLabel}`}
                  {selected.length > 0 && <span className="ml-2 text-[#1297DC] font-semibold">· {selected.length} selected ({selectedCreators.length} eligible)</span>}
                </p>
              </div>
              {pagination.total > 0 && <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">{pagination.total} creator{pagination.total !== 1 ? "s" : ""}</span>}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="flex flex-col items-center gap-3"><div className="w-9 h-9 border-4 border-[#1297DC] border-t-transparent rounded-full animate-spin" /><p className="text-xs text-gray-400">Loading payout data...</p></div>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <Icon icon="solar:danger-circle-bold" className="w-10 h-10 text-red-300" />
                <p className="text-sm text-gray-500">Failed to load data</p>
                <button onClick={refetch} className="text-xs text-[#1297DC] hover:underline font-medium">Retry</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="py-3 px-4 w-8">
                        <input type="checkbox" checked={selected.length === creators.length && creators.length > 0} onChange={toggleAll} className="rounded accent-[#1297DC]" />
                      </th>
                      {["Creator", "Total Revenue", "Platform Fee", "Net Payable", "Available Balance", "Status", "Payout Date", "Bank Ref", "Reserve"].map((h) => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {creators.length === 0 ? (
                      <tr><td colSpan={10} className="text-center py-16">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <Icon icon="solar:users-group-two-rounded-bold" className="w-12 h-12 text-gray-200" />
                          <p className="text-sm font-medium text-gray-500">No creator payout data found</p>
                          <p className="text-xs">Try adjusting your search or period filter</p>
                        </div>
                      </td></tr>
                    ) : (
                      creators.map((c) => {
                        const isChecked  = selected.includes(c.creatorId);
                        const isEligible = c.payoutStatus === "Pending";
                        return (
                          <tr key={c.creatorId} className={cn("transition-colors", isChecked ? isEligible ? "bg-[#1297DC]/5" : "bg-amber-50/30" : "hover:bg-gray-50/80")}>
                            <td className="py-3.5 px-4"><input type="checkbox" checked={isChecked} onChange={() => toggleSelect(c.creatorId)} className="rounded accent-[#1297DC]" /></td>
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#1297DC]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {c.imageUrl ? <img src={c.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" /> : <span className="text-xs font-bold text-[#1297DC]">{(c.name || "?")[0].toUpperCase()}</span>}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-800 text-xs truncate max-w-[120px]">{c.name}</p>
                                  {c.bankAccount ? <p className="text-gray-400 text-xs truncate max-w-[120px]">{c.bankAccount.bank?.name}</p> : <p className="text-red-400 text-xs">No bank account</p>}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-gray-700 text-xs">{fmtRp(c.totalRevenue)}</td>
                            <td className="py-3.5 px-3 text-red-400 font-semibold text-xs">{fmtRp(c.platformFee)}</td>
                            <td className="py-3.5 px-3 text-[#1297DC] font-bold text-xs">{fmtRp(c.netPayable)}</td>
                            <td className="py-3.5 px-3 text-emerald-600 font-bold text-xs">{fmtRp(c.availableBalance ?? 0)}</td>
                            <td className="py-3.5 px-3">
                              <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", PAYOUT_BADGE[c.payoutStatus] || PAYOUT_BADGE["No Payout"])}>
                                <span className={cn("w-1.5 h-1.5 rounded-full", PAYOUT_DOT[c.payoutStatus] || PAYOUT_DOT["No Payout"])} />
                                {c.payoutStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-gray-500 text-xs whitespace-nowrap">
                              {c.payoutDate ? new Date(c.payoutDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-xs text-gray-500">
                              {c.bankReference ? <span className="bg-gray-100 px-1.5 py-0.5 rounded-md">{c.bankReference}</span> : "—"}
                            </td>
                            <td className="py-3.5 px-3 text-xs">
                              {c.reserveBalance > 0 ? <span className="text-amber-600 font-bold">{fmtRp(c.reserveBalance)}</span> : <span className="text-gray-300">—</span>}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Showing {creators.length} of {pagination.total}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><Icon icon="solar:arrow-left-bold" className="w-4 h-4 text-gray-500" /></button>
                  <span className="text-xs text-gray-600 px-3">{page} / {pagination.totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><Icon icon="solar:arrow-right-bold" className="w-4 h-4 text-gray-500" /></button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB: BANK APPROVAL */}
      {activeTab === "bank-approval" && <BankApprovalPanel />}

      {showBulkModal && <BulkPayoutModal creators={selectedCreators} onConfirm={handleBulkPayoutConfirm} onCancel={() => setShowBulkModal(false)} loading={bulkLoading} />}
      {bulkResult && <BulkPayoutResultModal result={bulkResult} onClose={() => setBulkResult(null)} />}
    </div>
  );
}
