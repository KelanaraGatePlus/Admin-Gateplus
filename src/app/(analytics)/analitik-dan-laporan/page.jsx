"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import backendUrl from "@/const/backendUrl";
import { useGetGeneralFinanceQuery } from "@/hooks/api/financialSliceAPI";
import { downloadWithAuth } from "@/lib/downloadWithAuth";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(val = 0) {
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000)     return `${(val / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)         return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString("id-ID");
}
const rp = (v) => `Rp\u00A0${fmt(v)}`;

const PIE_COLORS = ["#4F8EF7", "#22C55E", "#F7A94F", "#A855F7", "#EF4444"];

const ALL_TIME_VALUE = "all-time";

const DEVICE_ICON = {
  Mobile: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  TV: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Web: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-bold">Rp{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

function SummaryCard({ icon, iconBg, label, value, sub, subColor, badge }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub   && <p className={`text-xs font-medium ${subColor || "text-gray-400"}`}>{sub}</p>}
      {badge && <p className="text-xs text-gray-400">{badge}</p>}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function GeneralFinancePage() {
  const now = new Date();

  // "all-time" sebagai sentinel, atau "YYYY-M" untuk bulan tertentu
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

  const { data, isLoading, isError, refetch } = useGetGeneralFinanceQuery(
    queryArgs,
    { refetchOnMountOrArgChange: true }
  );

  const handleExport = async () => {
    try {
      await downloadWithAuth(
        `${backendUrl}/management/financial/export?type=revenue`,
        "revenue-report.csv"
      );
    } catch (err) {
      alert(err.message || "Failed to export report");
    }
  };

  // Generate 24 bulan di frontend — tersedia langsung sebelum response pertama
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

  const d                   = data?.data            || {};
  const summary             = d.summary             || {};
  const revenueSources      = d.revenueSources      || [];
  const revenueByDevice     = d.revenueByDevice     || [];
  const cashFlowTrend       = d.cashFlowTrend       || [];
  const distributionDetails = d.distributionDetails || [];
  // Pakai dari backend jika sudah ada, fallback ke frontend-generated
  const monthOptions = d.monthOptions?.length > 0 ? d.monthOptions : frontendMonthOptions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1297DC] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading finance data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96 text-center">
        <div>
          <p className="text-gray-600 font-medium mb-2">Failed to load data</p>
          <button onClick={refetch} className="text-sm text-[#1297DC] hover:underline">Retry</button>
        </div>
      </div>
    );
  }

  const netPositive = (summary.netCashFlow ?? 0) >= 0;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">

      {/* ── Header ── */}
      <div className="bg-[#1297DC] text-white px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">General Platform Finance</h1>
          <p className="text-blue-100 text-sm mt-1">Complete overview of platform revenue and cash flow</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">

          {/* ── Period selector ── */}
          <div className="relative">
            <select
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              className="appearance-none bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 pr-8 rounded-lg font-medium border border-white/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 transition"
            >
              <option value={ALL_TIME_VALUE} className="text-gray-900 bg-white font-semibold">
                📊 All Time
              </option>
              <option disabled className="text-gray-400 bg-white text-xs">── Per Month ──</option>
              {monthOptions.length > 0
                ? monthOptions.map((o) => (
                    <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`} className="text-gray-900 bg-white">
                      {o.label}
                    </option>
                  ))
                : (
                  <option value={`${now.getFullYear()}-${now.getMonth() + 1}`} className="text-gray-900 bg-white">
                    {now.toLocaleString("en-US", { month: "long", year: "numeric" })}
                  </option>
                )}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs">▼</span>
          </div>

          {isAllTime && (
            <span className="bg-white/20 border border-white/30 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
              Showing All Time Data
            </span>
          )}

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Export Report
          </button>
        </div>
      </div>

      <div className="px-6 py-6 flex flex-col gap-6">

        {/* ── KPI row 1 ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Gross Revenue"
            value={rp(summary.grossRevenue)}
            sub={
              isAllTime
                ? "Cumulative all time"
                : summary.grossGrowth !== null && summary.grossGrowth !== undefined
                  ? `${summary.grossGrowth >= 0 ? "↑ +" : "↓ "}${Math.abs(summary.grossGrowth).toFixed(1)}% vs last month`
                  : undefined
            }
            subColor={isAllTime ? "text-gray-400" : (summary.grossGrowth ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            iconBg="bg-blue-50"
          />
          <SummaryCard
            label="Creator Share"
            value={rp(summary.creatorShare)}
            badge={isAllTime ? "Total allocated to creators (all time)" : "Total allocated to creators"}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
            iconBg="bg-emerald-50"
          />
          <SummaryCard
            label="Platform Share"
            value={rp(summary.platformShare)}
            badge={isAllTime ? "Platform revenue (all time)" : "Platform revenue"}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
            iconBg="bg-purple-50"
          />
          <SummaryCard
            label="Net Cash Flow"
            value={rp(summary.netCashFlow)}
            sub={netPositive ? "↑ Positive" : "↓ Negative"}
            subColor={netPositive ? "text-emerald-500" : "text-red-500"}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            iconBg="bg-emerald-50"
          />
        </div>

        {/* ── KPI row 2 ── */}
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard
            label="Total Payout"
            value={rp(summary.totalPayout)}
            badge={isAllTime ? "Paid to creators (all time)" : "Paid to creators"}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>}
            iconBg="bg-orange-50"
          />
          <SummaryCard
            label="Payment Fees"
            value={rp(summary.paymentFees)}
            badge="Gateway processing fees"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>}
            iconBg="bg-gray-100"
          />
        </div>

        {/* ── Revenue Sources ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">Revenue Sources</h2>
            {isAllTime && <p className="text-xs text-gray-400 mb-3">Keseluruhan data (all time)</p>}
            {revenueSources.every(r => r.amount === 0) ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data available</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={revenueSources} dataKey="amount" nameKey="label" cx="50%" cy="50%" outerRadius={80}>
                      {revenueSources.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`Rp${fmt(v)}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-2">
                  {revenueSources.map((src, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-gray-600">{src.label}</span>
                      </div>
                      <span className="font-semibold text-gray-800">Rp{fmt(src.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">Revenue by Source</h2>
            {isAllTime && <p className="text-xs text-gray-400 mb-3">Keseluruhan data (all time)</p>}
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueSources} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}B`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CUSTOM_TOOLTIP />} />
                <Bar dataKey="amount" name="Revenue" radius={[6, 6, 0, 0]}>
                  {revenueSources.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Revenue by Device ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Revenue by Device Platform</h2>
          {isAllTime && <p className="text-xs text-gray-400 mb-3">Keseluruhan data (all time)</p>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {revenueByDevice.map((dev, i) => (
              <div key={i} className="bg-blue-50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#1297DC] text-white rounded-xl flex items-center justify-center">
                    {DEVICE_ICON[dev.label] || DEVICE_ICON["Web"]}
                  </div>
                  <span className="font-semibold text-gray-800">{dev.label}</span>
                </div>
                <p className="text-2xl font-bold text-[#1297DC]">Rp{fmt(dev.revenue)}</p>
                <p className="text-sm text-gray-500 mt-1">{dev.activeUsers.toLocaleString("id-ID")} active users</p>
              </div>
            ))}
            {revenueByDevice.length === 0 && (
              <div className="col-span-3 text-center py-8 text-gray-400 text-sm">No device data available</div>
            )}
          </div>
        </div>

        {/* ── Cash Flow Trend ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            {isAllTime ? "Monthly Cash Flow — Last 12 Months" : "Monthly Cash Flow (Inflow vs Outflow)"}
          </h2>
          {isAllTime && <p className="text-xs text-gray-400 mb-3">12 bulan terakhir</p>}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlowTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}B`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              <Line type="monotone" dataKey="inflow"  name="Inflow"  stroke="#22C55E" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="outflow" name="Outflow" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Revenue Distribution Details ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Revenue Distribution Details</h2>
            {isAllTime && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">All time cumulative</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["DATE", "REVENUE TYPE", "GROSS", "CREATOR SHARE", "PLATFORM SHARE", "TAX", "NET"].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-400 font-semibold py-2 pr-6 tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {distributionDetails.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">No revenue data available</td></tr>
                )}
                {distributionDetails.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 pr-6 text-gray-500 whitespace-nowrap">{row.date}</td>
                    <td className="py-3 pr-6 font-medium text-gray-800">{row.revenueType}</td>
                    <td className="py-3 pr-6 font-bold text-gray-900">Rp{fmt(row.gross)}</td>
                    <td className="py-3 pr-6 font-semibold text-emerald-600">Rp{fmt(row.creatorShare)}</td>
                    <td className="py-3 pr-6 font-semibold text-blue-600">Rp{fmt(row.platformShare)}</td>
                    <td className="py-3 pr-6 text-gray-500">Rp{fmt(row.tax)}</td>
                    <td className="py-3 pr-6 font-bold text-gray-900">Rp{fmt(row.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
