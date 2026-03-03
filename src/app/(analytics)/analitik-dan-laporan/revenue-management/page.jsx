"use client";

import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useGetRevenueManagementQuery } from "@/hooks/api/financialSliceAPI";
import Icon from "@/lib/IconClient";
import { cn } from "@/lib/utils";

function fmtRp(val = 0) {
  if (Math.abs(val) >= 1_000_000_000) return `Rp${(val / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(val) >= 1_000_000) return `Rp${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `Rp${(val / 1_000).toFixed(0)}K`;
  return `Rp${val.toLocaleString("id-ID")}`;
}

const STATUS_BADGE = {
  Settled: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Pending: "bg-amber-100 text-amber-700 border border-amber-200",
  "No Revenue": "bg-gray-100 text-gray-500 border border-gray-200",
};

const ALL_TIME_VALUE = "all-time";

export default function RevenueManagementPage() {
  const now = new Date();
  const [search, setSearch] = useState("");
  const [selectedValue, setSelectedValue] = useState(
    `${now.getFullYear()}-${now.getMonth() + 1}`
  );

  const isAllTime = selectedValue === ALL_TIME_VALUE;
  const [selectedYear, selectedMonth] = isAllTime
    ? [null, null]
    : selectedValue.split("-").map(Number);

  const queryArgs = isAllTime
    ? { allTime: true }
    : { month: selectedMonth, year: selectedYear };

  const { data, isLoading, isError, refetch } = useGetRevenueManagementQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });

  // Buat 24 opsi bulan mundur dari sekarang
  const monthOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i < 24; i++) {
      let m = now.getMonth() + 1 - i;
      let y = now.getFullYear();
      while (m <= 0) { m += 12; y -= 1; }
      opts.push({
        value: `${y}-${m}`,
        label: new Date(y, m - 1, 1).toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }
    return opts;
  }, []);

  const d = data?.data;
  const stats = d?.stats || {};
  const revBySource = d?.revBySource || [];
  const creatorRevenue = d?.creatorRevenue || [];
  const agingReport = d?.agingReport || [];

  const filteredCreators = creatorRevenue.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1297DC] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96 flex-col gap-3">
        <Icon icon="solar:danger-circle-bold" className="w-12 h-12 text-red-400" />
        <p className="text-gray-600">Failed to load data</p>
        <button onClick={refetch} className="text-sm text-[#1297DC] hover:underline">
          Retry
        </button>
      </div>
    );
  }

  const COLORS = ["#22c55e", "#f97316", "#a855f7", "#3b82f6"];
  const pieData = revBySource.map((s) => ({ name: s.source, value: s.amount }));
  const totalAgingAmount = agingReport.reduce((s, a) => s + a.amount, 0);

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Revenue control and settlement tracking
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* ── Period selector ── */}
          <div className="relative">
            <select
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1297DC]/30 cursor-pointer"
            >
              <option value={ALL_TIME_VALUE} className="font-semibold">
                📊 All Time
              </option>
              <option disabled className="text-gray-400 text-xs">
                ── Per Month ──
              </option>
              {monthOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              ▼
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Icon
              icon="solar:magnifer-bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search revenue..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1297DC]/30 w-56"
            />
          </div>

          <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <Icon icon="solar:filter-bold" className="w-4 h-4" /> Filter
          </button>
          <button
            onClick={() =>
              window.open(
                `${process.env.NEXT_PUBLIC_API_URL}/management/financial/export?type=revenue`,
                "_blank"
              )
            }
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[#1297DC] text-white rounded-lg hover:bg-[#0d7fc0]"
          >
            <Icon icon="solar:download-bold" className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Active period badge */}
      {isAllTime && (
        <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 text-xs px-3 py-1.5 rounded-lg self-start">
          <Icon icon="solar:calendar-bold" className="w-3.5 h-3.5" />
          Showing all-time revenue data
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: "solar:dollar-bold",
            iconBg: "bg-[#1297DC]",
            label: isAllTime ? "Total Revenue (All Time)" : "Total Revenue (MTD)",
            value: fmtRp(stats.totalRevenueMTD),
          },
          {
            icon: "solar:check-circle-bold",
            iconBg: "bg-gray-500",
            label: "Settled Revenue",
            value: fmtRp(stats.settledRevenue),
          },
          {
            icon: "solar:clock-circle-bold",
            iconBg: "bg-amber-500",
            label: "Pending Settlement",
            value: fmtRp(stats.pendingSettlement),
          },
          {
            icon: "solar:dollar-minimalistic-bold",
            iconBg: "bg-violet-500",
            label: "Deferred Revenue",
            value: fmtRp(stats.deferredRevenue),
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                s.iconBg
              )}
            >
              <Icon icon={s.icon} className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue by Source */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Revenue by Source</h2>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-48 h-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={2}
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmtRp(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 flex flex-col gap-2 w-full">
            {revBySource.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">{s.source}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{fmtRp(s.amount)}</p>
                  <p className="text-xs text-gray-400">{s.pct}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Creator */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Revenue by Creator</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "Creator",
                  "Gross Revenue",
                  "Platform Fee",
                  "Net Revenue",
                  "Settlement Status",
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
              {filteredCreators.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-gray-400 text-sm"
                  >
                    No revenue data found
                  </td>
                </tr>
              ) : (
                filteredCreators.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-800">{c.name}</td>
                    <td className="py-3 px-3 text-gray-700">{fmtRp(c.grossRevenue)}</td>
                    <td className="py-3 px-3 text-red-500 font-medium">
                      {fmtRp(c.platformFee)}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 font-medium">
                      {fmtRp(c.netRevenue)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                          STATUS_BADGE[c.settlementStatus] || STATUS_BADGE["No Revenue"]
                        )}
                      >
                        {c.settlementStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom: Deferred & Aging */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Deferred Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Deferred Revenue</h2>
          <div className="flex flex-col gap-3">
            {stats.deferredRevenue > 0 ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">DFR-MTD</p>
                  <p className="text-xs text-gray-400">Subscription • Pending recognition</p>
                </div>
                <p className="text-sm font-bold text-violet-600">
                  {fmtRp(stats.deferredRevenue)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No deferred revenue</p>
            )}
          </div>
        </div>

        {/* Revenue Aging */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Revenue Aging Report
          </h2>
          <div className="flex flex-col gap-3">
            {agingReport.map((a, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{a.label}</p>
                    <p className="text-xs text-gray-400">{a.count} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{fmtRp(a.amount)}</p>
                    <p className="text-xs text-gray-400">
                      {totalAgingAmount > 0
                        ? Math.round((a.amount / totalAgingAmount) * 100)
                        : 0}
                      % of total
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1297DC] rounded-full"
                    style={{
                      width: `${
                        totalAgingAmount > 0
                          ? Math.round((a.amount / totalAgingAmount) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}