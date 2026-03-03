"use client";

import React, { useState } from "react";
import { useGetCreatorPayoutControlQuery } from "@/hooks/api/financialSliceAPI";
import Icon from "@/lib/IconClient";
import { cn } from "@/lib/utils";

function fmtRp(val = 0) {
  if (Math.abs(val) >= 1_000_000_000) return `Rp${(val / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(val) >= 1_000_000) return `Rp${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `Rp${(val / 1_000).toFixed(0)}K`;
  return `Rp${val.toLocaleString("id-ID")}`;
}

const PAYOUT_STYLE = {
  Paid: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Pending: "bg-amber-100 text-amber-700 border border-amber-200",
  "No Payout": "bg-gray-100 text-gray-500 border border-gray-200",
};

export default function CreatorPayoutControlPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const { data, isLoading, isError, refetch } = useGetCreatorPayoutControlQuery({
    page, limit: 20, search, status: statusFilter,
  });

  const d = data?.data;
  const stats = d?.stats || {};
  const creators = d?.creators || [];
  const pagination = data?.pagination || {};

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === creators.length) setSelected([]);
    else setSelected(creators.map((c) => c.creatorId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1297DC] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading payout data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96 flex-col gap-3">
        <Icon icon="solar:danger-circle-bold" className="w-12 h-12 text-red-400" />
        <p className="text-gray-600">Failed to load data</p>
        <button onClick={refetch} className="text-sm text-[#1297DC] hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Creator Payout Control</h1>
          <p className="text-sm text-gray-500 mt-1">Manage creator payouts and liabilities</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search creators..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1297DC]/30 w-52"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600"
          >
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <Icon icon="solar:filter-bold" className="w-4 h-4" /> Filter
          </button>
          <button
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/management/financial/export?type=payout`, '_blank')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            <Icon icon="solar:download-bold" className="w-4 h-4" /> Export
          </button>
          <button
            disabled={selected.length === 0}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-colors",
              selected.length > 0
                ? "bg-[#1297DC] text-white hover:bg-[#0d7fc0]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
            Bulk Payout ({selected.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: "solar:dollar-bold",                         iconBg: "bg-[#1297DC]/15", iconColor: "text-[#1297DC]",   label: "Total Payable",   value: fmtRp(stats.totalPayable)   },
          { icon: "solar:clock-circle-bold",                   iconBg: "bg-amber-100",    iconColor: "text-amber-500",   label: "Pending Payout",  value: fmtRp(stats.pendingPayout)  },
          { icon: "solar:check-circle-bold",                   iconBg: "bg-emerald-100",  iconColor: "text-emerald-500", label: "Paid (MTD)",       value: fmtRp(stats.paidMTD)        },
          { icon: "solar:users-group-two-rounded-bold",        iconBg: "bg-violet-100",   iconColor: "text-violet-500",  label: "Reserve Balance", value: fmtRp(stats.reserveBalance) },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", s.iconBg)}>
              <Icon icon={s.icon} className={cn("w-5 h-5", s.iconColor)} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Creator Payout Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selected.length === creators.length && creators.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                {[
                  "Creator Name",
                  "Total Revenue",
                  "Platform Fee",
                  "Net Payable",
                  "Payout Status",
                  "Payout Date",
                  "Bank Reference",
                  "Reserve",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {creators.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                    <Icon icon="solar:users-group-two-rounded-bold" className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    No creator payout data found
                  </td>
                </tr>
              ) : (
                creators.map((c) => {
                  const isChecked = selected.includes(c.creatorId);
                  const ps = PAYOUT_STYLE[c.payoutStatus] || PAYOUT_STYLE["No Payout"];
                  return (
                    <tr
                      key={c.creatorId}
                      className={cn(
                        "transition-colors",
                        isChecked ? "bg-[#1297DC]/5" : "hover:bg-gray-50"
                      )}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(c.creatorId)}
                          className="rounded"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#1297DC]/10 flex items-center justify-center flex-shrink-0">
                            {c.imageUrl ? (
                              <img
                                src={c.imageUrl}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-[#1297DC]">
                                {(c.name || "?")[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-gray-800">{c.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-700">{fmtRp(c.totalRevenue)}</td>
                      <td className="py-3 px-3 text-red-500 font-medium">{fmtRp(c.platformFee)}</td>
                      <td className="py-3 px-3 text-emerald-600 font-semibold">{fmtRp(c.netPayable)}</td>
                      <td className="py-3 px-3">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium", ps)}>
                          {c.payoutStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                        {c.payoutDate ? new Date(c.payoutDate).toLocaleDateString("id-ID") : "—"}
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-mono text-xs">
                        {c.bankReference || "—"}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {c.reserveBalance > 0 ? (
                          <span className="text-amber-600 font-medium">{fmtRp(c.reserveBalance)}</span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {creators.length} of {pagination.total} creators
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <Icon icon="solar:arrow-left-bold" className="w-4 h-4 text-gray-500" />
              </button>
              <span className="text-xs text-gray-600 px-2">
                Page {page} / {pagination.totalPages}
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
    </div>
  );
}