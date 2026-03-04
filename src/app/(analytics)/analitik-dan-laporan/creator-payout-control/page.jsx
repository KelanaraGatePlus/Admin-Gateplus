"use client";

import React, { useState, useCallback } from "react";
import {
  useGetCreatorPayoutControlQuery,
  useGetPendingBankAccountsQuery,
  useApproveBankAccountMutation,
  useRejectBankAccountMutation,
} from "@/hooks/api/financialSliceAPI";
import Icon from "@/lib/IconClient";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtRp(val = 0) {
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) return `Rp${(val / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000)     return `Rp${(val / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)         return `Rp${(val / 1_000).toFixed(0)}K`;
  return `Rp${val.toLocaleString("id-ID")}`;
}

const ALL_TIME_VALUE = "all-time";

const PAYOUT_BADGE = {
  Paid:       "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Pending:    "bg-amber-50  text-amber-700  border border-amber-200",
  "No Payout":"bg-gray-100  text-gray-400   border border-gray-200",
};

const PAYOUT_DOT = {
  Paid:       "bg-emerald-500",
  Pending:    "bg-amber-400",
  "No Payout":"bg-gray-300",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

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

function RejectModal({ account, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Reject Bank Account</h3>
            <p className="text-xs text-gray-400">This action cannot be undone</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 text-sm">
          <p className="font-medium text-gray-700">{account?.creator?.profileName || account?.creator?.username}</p>
          <p className="text-gray-500 text-xs mt-0.5">
            {account?.bank?.name} · {account?.accountNumber} · {account?.accountName}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Rejection Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Account number does not match, invalid bank info..."
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
            onClick={() => onConfirm(reason || "No reason provided.")}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Reject & Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bank Account Approval Panel ────────────────────────────────────────────

function BankApprovalPanel() {
  const [bankSearch, setBankSearch]   = useState("");
  const [bankPage, setBankPage]       = useState(1);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [toast, setToast]             = useState(null);

  const { data: bankData, isLoading: bankLoading, refetch: refetchBanks } =
    useGetPendingBankAccountsQuery({ page: bankPage, limit: 10, search: bankSearch });

  const [approveBank, { isLoading: approving }] = useApproveBankAccountMutation();
  const [rejectBank,  { isLoading: rejecting  }] = useRejectBankAccountMutation();

  const pendingAccounts   = bankData?.data       || [];
  const bankPagination    = bankData?.pagination  || {};

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveBank(id).unwrap();
      showToast("Bank account approved successfully", "success");
      refetchBanks();
    } catch (err) {
      showToast(err?.data?.message || "Failed to approve", "error");
    }
  };

  const handleRejectConfirm = async (reason) => {
    try {
      await rejectBank({ id: rejectTarget.id, reason }).unwrap();
      showToast("Bank account rejected and removed", "info");
      setRejectTarget(null);
      refetchBanks();
    } catch (err) {
      showToast(err?.data?.message || "Failed to reject", "error");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all",
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

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <Icon icon="solar:card-bold" className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-base">Pending Bank Accounts</h2>
            <p className="text-xs text-gray-400">Review and verify creator bank accounts</p>
          </div>
          {bankPagination.total > 0 && (
            <span className="ml-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
              {bankPagination.total} pending
            </span>
          )}
        </div>
        <div className="relative">
          <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={bankSearch}
            onChange={(e) => { setBankSearch(e.target.value); setBankPage(1); }}
            placeholder="Search creator or account..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1297DC]/25 w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {bankLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 border-3 border-[#1297DC] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pendingAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-400">
            <Icon icon="solar:check-circle-bold" className="w-12 h-12 text-emerald-200" />
            <p className="text-sm font-medium text-gray-500">All bank accounts are verified</p>
            <p className="text-xs text-gray-400">No pending verifications at this time</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Creator", "Bank", "Account Number", "Account Name", "Submitted", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pendingAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-amber-50/40 transition-colors group">
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
                        <p className="font-semibold text-gray-800 text-xs leading-tight">
                          {acc.creator?.profileName || acc.creator?.username}
                        </p>
                        <p className="text-gray-400 text-xs">@{acc.creator?.username}</p>
                      </div>
                    </div>
                  </td>
                  {/* Bank */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-700 text-xs">{acc.bank?.name || "—"}</span>
                      <span className="text-gray-400 text-xs">{acc.bank?.code}</span>
                    </div>
                  </td>
                  {/* Account Number */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                      {acc.accountNumber}
                    </span>
                  </td>
                  {/* Account Name */}
                  <td className="py-3.5 px-4 text-gray-700 font-medium text-xs">
                    {acc.accountName}
                  </td>
                  {/* Submitted */}
                  <td className="py-3.5 px-4 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(acc.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  {/* Actions */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(acc.id)}
                        disabled={approving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-sm shadow-emerald-100"
                      >
                        <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(acc)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors"
                      >
                        <Icon icon="solar:close-circle-bold" className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {bankPagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing {pendingAccounts.length} of {bankPagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setBankPage((p) => Math.max(1, p - 1))}
              disabled={bankPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <Icon icon="solar:arrow-left-bold" className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <span className="text-xs text-gray-600 px-2">{bankPage} / {bankPagination.totalPages}</span>
            <button
              onClick={() => setBankPage((p) => Math.min(bankPagination.totalPages, p + 1))}
              disabled={bankPage === bankPagination.totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <Icon icon="solar:arrow-right-bold" className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          account={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
          loading={rejecting}
        />
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CreatorPayoutControlPage() {
  const now = new Date();
  const [selectedValue, setSelectedValue] = useState(`${now.getFullYear()}-${now.getMonth() + 1}`);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]             = useState(1);
  const [selected, setSelected]     = useState([]);
  const [activeTab, setActiveTab]   = useState("payouts"); // "payouts" | "bank-approval"

  const isAllTime = selectedValue === ALL_TIME_VALUE;
  const [selYear, selMonth] = isAllTime ? [null, null] : selectedValue.split("-").map(Number);

  const queryArgs = {
    page, limit: 20, search, status: statusFilter,
    ...(isAllTime ? { allTime: true } : { month: selMonth, year: selYear }),
  };

  const { data, isLoading, isError, refetch } = useGetCreatorPayoutControlQuery(queryArgs);

  const d          = data?.data         || {};
  const stats      = d.stats            || {};
  const creators   = d.creators         || [];
  const monthOpts  = d.monthOptions     || [];
  const pagination = data?.pagination   || {};

  const toggleSelect = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === creators.length ? [] : creators.map((c) => c.creatorId));

  // Active label
  const activeLabel = isAllTime
    ? "All Time"
    : monthOpts.find((o) => o.month === selMonth && o.year === selYear)?.label
      || new Date(selYear, selMonth - 1).toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Creator Payout Control</h1>
          <p className="text-sm text-gray-400 mt-1">Manage payouts, verify bank accounts, and monitor creator earnings</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("payouts")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              activeTab === "payouts"
                ? "bg-[#1297DC] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            <Icon icon="solar:dollar-bold" className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Payouts
          </button>
          <button
            onClick={() => setActiveTab("bank-approval")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              activeTab === "bank-approval"
                ? "bg-[#1297DC] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            <Icon icon="solar:card-bold" className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Bank Verification
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           TAB: PAYOUTS
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "payouts" && (
        <>
          {/* ── Controls bar ── */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Period selector */}
            <div className="relative">
              <Icon icon="solar:calendar-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={selectedValue}
                onChange={(e) => { setSelectedValue(e.target.value); setPage(1); }}
                className="appearance-none pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1297DC]/25 cursor-pointer min-w-[200px]"
              >
                <option value={ALL_TIME_VALUE}>📊 All Time</option>
                <option disabled className="text-gray-300 text-xs">── Per Month ──</option>
                {monthOpts.length > 0
                  ? monthOpts.map((o) => (
                      <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>
                        {o.label}
                      </option>
                    ))
                  : (
                    <option value={`${now.getFullYear()}-${now.getMonth() + 1}`}>
                      {now.toLocaleString("en-US", { month: "long", year: "numeric" })}
                    </option>
                  )}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
            </div>

            {/* Active period badge */}
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1297DC]/10 text-[#1297DC] rounded-xl text-xs font-semibold border border-[#1297DC]/20">
              <Icon icon="solar:clock-circle-bold" className="w-3.5 h-3.5" />
              {activeLabel}
            </span>

            <div className="flex-1" />

            {/* Search */}
            <div className="relative">
              <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search creators..."
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1297DC]/25 w-48"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1297DC]/25"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Export */}
            <button
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/management/financial/export?type=payout`, "_blank")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 font-medium transition-colors"
            >
              <Icon icon="solar:download-bold" className="w-4 h-4" />
              Export
            </button>

            {/* Bulk payout */}
            <button
              disabled={selected.length === 0}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl font-semibold transition-all",
                selected.length > 0
                  ? "bg-[#1297DC] text-white hover:bg-[#0d7fc0] shadow-sm shadow-[#1297DC]/30"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
              Bulk Payout {selected.length > 0 && `(${selected.length})`}
            </button>
          </div>

          {/* ── Stats ── */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-28 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 mb-3" />
                  <div className="h-5 bg-gray-100 rounded w-2/3 mb-1.5" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon="solar:dollar-minimalistic-bold"
                iconBg="bg-[#1297DC]/10" iconColor="text-[#1297DC]"
                label="Total Payable" value={fmtRp(stats.totalPayable)}
                sub={isAllTime ? "All time gross" : `Period: ${activeLabel}`}
              />
              <StatCard
                icon="solar:clock-circle-bold"
                iconBg="bg-amber-50" iconColor="text-amber-500"
                label="Pending Payout" value={fmtRp(stats.pendingPayout)}
                sub={`Awaiting disbursement`} subColor="text-amber-500"
              />
              <StatCard
                icon="solar:check-circle-bold"
                iconBg="bg-emerald-50" iconColor="text-emerald-500"
                label={isAllTime ? "Total Paid" : "Paid (Period)"} value={fmtRp(stats.paidMTD)}
                sub="Completed withdrawals" subColor="text-emerald-500"
              />
              <StatCard
                icon="solar:safe-2-bold"
                iconBg="bg-violet-50" iconColor="text-violet-500"
                label="Reserve Balance" value={fmtRp(stats.reserveBalance)}
                sub="Held for pending payouts"
              />
            </div>
          )}

          {/* ── Creators Table ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 text-base">Creator Payout Management</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isAllTime ? "Showing all-time revenue data" : `Period: ${activeLabel}`}
                </p>
              </div>
              {pagination.total > 0 && (
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">
                  {pagination.total} creator{pagination.total !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-9 h-9 border-4 border-[#1297DC] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-400">Loading payout data...</p>
                </div>
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
                        <input
                          type="checkbox"
                          checked={selected.length === creators.length && creators.length > 0}
                          onChange={toggleAll}
                          className="rounded accent-[#1297DC]"
                        />
                      </th>
                      {["Creator", "Total Revenue", "Platform Fee", "Net Payable", "Available Balance", "Status", "Payout Date", "Bank Ref", "Reserve"].map((h) => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {creators.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-16">
                          <div className="flex flex-col items-center gap-2 text-gray-400">
                            <Icon icon="solar:users-group-two-rounded-bold" className="w-12 h-12 text-gray-200" />
                            <p className="text-sm font-medium text-gray-500">No creator payout data found</p>
                            <p className="text-xs">Try adjusting your search or period filter</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      creators.map((c) => {
                        const isChecked = selected.includes(c.creatorId);
                        const badgeCls  = PAYOUT_BADGE[c.payoutStatus] || PAYOUT_BADGE["No Payout"];
                        const dotCls    = PAYOUT_DOT[c.payoutStatus]   || PAYOUT_DOT["No Payout"];
                        return (
                          <tr
                            key={c.creatorId}
                            className={cn(
                              "transition-colors",
                              isChecked ? "bg-[#1297DC]/5" : "hover:bg-gray-50/80"
                            )}
                          >
                            <td className="py-3.5 px-4">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelect(c.creatorId)}
                                className="rounded accent-[#1297DC]"
                              />
                            </td>
                            {/* Creator */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#1297DC]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {c.imageUrl
                                    ? <img src={c.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                    : <span className="text-xs font-bold text-[#1297DC]">{(c.name || "?")[0].toUpperCase()}</span>
                                  }
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-800 text-xs truncate max-w-[120px]">{c.name}</p>
                                  {c.bankAccount && (
                                    <p className="text-gray-400 text-xs truncate max-w-[120px]">{c.bankAccount.bank?.name}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-gray-700 text-xs">{fmtRp(c.totalRevenue)}</td>
                            <td className="py-3.5 px-3 text-red-400 font-semibold text-xs">{fmtRp(c.platformFee)}</td>
                            <td className="py-3.5 px-3 text-[#1297DC] font-bold text-xs">{fmtRp(c.netPayable)}</td>
                            <td className="py-3.5 px-3 text-emerald-600 font-bold text-xs">{fmtRp(c.availableBalance ?? 0)}</td>
                            {/* Status */}
                            <td className="py-3.5 px-3">
                              <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", badgeCls)}>
                                <span className={cn("w-1.5 h-1.5 rounded-full", dotCls)} />
                                {c.payoutStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-gray-500 text-xs whitespace-nowrap">
                              {c.payoutDate
                                ? new Date(c.payoutDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                                : "—"}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-xs text-gray-500">
                              {c.bankReference ? (
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded-md">{c.bankReference}</span>
                              ) : "—"}
                            </td>
                            <td className="py-3.5 px-3 text-xs">
                              {c.reserveBalance > 0
                                ? <span className="text-amber-600 font-bold">{fmtRp(c.reserveBalance)}</span>
                                : <span className="text-gray-300">—</span>
                              }
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Showing {creators.length} of {pagination.total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Icon icon="solar:arrow-left-bold" className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="text-xs text-gray-600 px-3">
                    {page} / {pagination.totalPages}
                  </span>
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
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
           TAB: BANK ACCOUNT APPROVAL
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "bank-approval" && (
        <BankApprovalPanel />
      )}
    </div>
  );
}