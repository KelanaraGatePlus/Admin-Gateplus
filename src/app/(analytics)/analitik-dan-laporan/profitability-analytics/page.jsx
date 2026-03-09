"use client";

import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useGetProfitabilityAnalyticsQuery } from "@/hooks/api/financialSliceAPI";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(val = 0) {
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000)     return `${(val / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)         return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString("id-ID");
}

function fmtFull(val = 0) {
  return `Rp\u00A0${fmt(val)}`;
}

const EXPENSE_COLORS = ["#4F8EF7", "#7C5CFC", "#F7577A", "#F7A94F", "#22C55E", "#8B9DBF"];

const CATEGORY_LABEL = {
  INFRASTRUCTURE_COST:  "Server & Cloud",
  OPERATIONAL:          "Staff Salary",
  MARKETING:            "Marketing",
  PAYMENT_GATEWAY_FEE:  "Tools & Software",
  CREATOR_PAYOUT:       "Legal & Compliance",
  OTHER:                "Other",
  REFUND:               "Refund",
};

// Sentinel value untuk "All Time"
const ALL_TIME_VALUE = "all-time";

// ─── sub-components ─────────────────────────────────────────────────────────

function KPICard({ label, value, sub, subColor, icon, iconBg, badge }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
      {sub && <p className={`text-xs font-medium ${subColor || "text-gray-400"}`}>{sub}</p>}
      {badge && <p className="text-xs text-gray-400">{badge}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PAID:      "bg-green-100 text-green-700",
    PENDING:   "bg-yellow-100 text-yellow-700",
    OVERDUE:   "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-3 text-sm min-w-[140px]">
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

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function ProfitabilityAnalyticsPage() {
  const now = new Date();
  // "all-time" sebagai sentinel, atau "YYYY-M" untuk bulan tertentu
  const [selectedValue, setSelectedValue] = useState(`${now.getFullYear()}-${now.getMonth() + 1}`);

  const isAllTime = selectedValue === ALL_TIME_VALUE;

  // Parse month/year hanya jika bukan all-time
  const [selectedYear, selectedMonth] = isAllTime
    ? [null, null]
    : selectedValue.split("-").map(Number);

  const queryArgs = isAllTime
    ? { allTime: true }
    : { month: selectedMonth, year: selectedYear };

  const { data, isLoading, isError, refetch } = useGetProfitabilityAnalyticsQuery(
    queryArgs,
    { refetchOnMountOrArgChange: true }
  );

  const d            = data?.data      || {};
  const summary      = d.summary       || {};
  const trend        = d.trend         || [];
  const expBreakdown = d.expBreakdown  || [];
  const expTrend     = d.expTrend      || [];
  const expenses     = d.expenses      || [];
  const monthOptions = d.monthOptions  || [];

  // Label periode aktif
  const activeLabel = isAllTime
    ? "All Time"
    : monthOptions.find((o) => o.month === selectedMonth && o.year === selectedYear)?.label
      || new Date(selectedYear, selectedMonth - 1, 1)
          .toLocaleString("en-US", { month: "long", year: "numeric" });

  const handleChange = (e) => {
    setSelectedValue(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1297DC] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading analytics...</p>
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

  return (
    <div className="bg-gray-50 min-h-screen font-sans">

      {/* ── Header banner ── */}
      <div className="bg-[#1297DC] text-white px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Platform Profitability Analytics</h1>
          <p className="text-blue-100 text-sm mt-1">Executive financial control dashboard for CEO &amp; investors</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">

          {/* ── Period selector dropdown (All Time + per bulan) ── */}
          <div className="relative">
            <select
              value={selectedValue}
              onChange={handleChange}
              className="appearance-none bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 pr-8 rounded-lg font-medium border border-white/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 transition"
            >
              {/* Opsi All Time di posisi paling atas */}
              <option value={ALL_TIME_VALUE} className="text-gray-900 bg-white font-semibold">
                📊 All Time
              </option>

              {/* Separator visual (disabled) */}
              <option disabled className="text-gray-400 bg-white text-xs">
                ── Per Month ──
              </option>

              {/* Opsi per bulan */}
              {monthOptions.length > 0
                ? monthOptions.map((o) => (
                    <option
                      key={`${o.year}-${o.month}`}
                      value={`${o.year}-${o.month}`}
                      className="text-gray-900 bg-white"
                    >
                      {o.label}
                    </option>
                  ))
                : (
                  <option
                    value={`${now.getFullYear()}-${now.getMonth() + 1}`}
                    className="text-gray-900 bg-white"
                  >
                    {now.toLocaleString("en-US", { month: "long", year: "numeric" })}
                  </option>
                )}
            </select>
            {/* chevron icon */}
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs">▼</span>
          </div>

          {/* Badge periode aktif */}
          {isAllTime && (
            <span className="bg-white/20 border border-white/30 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
              Showing All Time Data
            </span>
          )}

          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/management/financial/export?type=expense`}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 bg-white/20 border border-white/40 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Export CSV
          </a>
        </div>
      </div>

      <div className="px-6 py-6 flex flex-col gap-6">

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            label="Platform Gross Income"
            value={fmtFull(summary.grossIncome)}
            sub={
              !isAllTime && summary.grossIncomeGrowth !== undefined && summary.grossIncomeGrowth !== null
                ? `${summary.grossIncomeGrowth >= 0 ? "↑" : "↓"} ${Math.abs(summary.grossIncomeGrowth).toFixed(1)}% vs last month`
                : isAllTime ? "Cumulative all time" : undefined
            }
            subColor={
              isAllTime
                ? "text-gray-400"
                : summary.grossIncomeGrowth >= 0 ? "text-emerald-500" : "text-red-500"
            }
            icon="$"
            iconBg="bg-blue-100 text-blue-500"
          />
          <KPICard
            label="Operating Cost"
            value={fmtFull(summary.operatingCost)}
            sub={`${summary.opCostRatio ?? 0}% of gross income`}
            subColor="text-gray-400"
            icon="↘"
            iconBg="bg-red-100 text-red-500"
          />
          <KPICard
            label="Profit Margin"
            value={`${summary.profitMargin?.toFixed(1) ?? "0.0"}%`}
            sub={
              !isAllTime && summary.marginGrowth !== undefined && summary.marginGrowth !== null
                ? `${summary.marginGrowth >= 0 ? "↑" : "↓"} ${Math.abs(summary.marginGrowth).toFixed(1)}% vs last month`
                : isAllTime ? "Platform commission + service fee / gross" : undefined
            }
            subColor={
              isAllTime
                ? "text-gray-400"
                : summary.marginGrowth >= 0 ? "text-emerald-500" : "text-red-500"
            }
            icon="↗"
            iconBg="bg-yellow-100 text-yellow-500"
          />
          <KPICard
            label="Net Profit"
            value={fmtFull(summary.netProfit)}
            sub={
              !isAllTime && summary.netProfitGrowth !== undefined && summary.netProfitGrowth !== null
                ? `${summary.netProfitGrowth >= 0 ? "↑" : "↓"} ${Math.abs(summary.netProfitGrowth).toFixed(1)}% vs last month`
                : "Platform fee + Service fee − Expenses"
            }
            subColor={
              isAllTime
                ? "text-gray-400"
                : summary.netProfit >= 0 ? "text-emerald-500" : "text-red-500"
            }
            icon="↗"
            iconBg="bg-purple-100 text-purple-500"
          />
          <KPICard
            label="EBITDA"
            value={fmtFull(summary.ebitda)}
            badge="Before tax & interest"
            icon="⚡"
            iconBg="bg-green-100 text-green-500"
          />
        </div>

        {/* ── Expense Breakdown + Profit Margin Growth ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">Expense Breakdown</h2>
            {isAllTime && (
              <p className="text-xs text-gray-400 mb-3">Menampilkan keseluruhan data (all time)</p>
            )}
            {expBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No expense data</div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie
                      data={expBreakdown}
                      dataKey="amount"
                      nameKey="label"
                      cx="50%" cy="50%"
                      outerRadius={95}
                      label={({ pct }) => `${pct}%`}
                      labelLine={false}
                    >
                      {expBreakdown.map((_, i) => (
                        <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`Rp${fmt(v)}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  {expBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }} />
                        <span className="text-gray-600">{item.label}</span>
                      </div>
                      <span className="font-semibold text-gray-800">Rp{fmt(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Area chart – Profit Margin Growth */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">Profit Margin Growth</h2>
            {isAllTime && (
              <p className="text-xs text-gray-400 mb-3">12 bulan terakhir</p>
            )}
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, "auto"]}
                  tick={{ fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, "Profit Margin"]} />
                <Area type="monotone" dataKey="margin" stroke="#7c3aed" strokeWidth={2.5} fill="url(#marginGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Revenue vs Cost Analysis ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Revenue vs Cost Analysis</h2>
          {isAllTime && (
            <p className="text-xs text-gray-400 mb-3">12 bulan terakhir</p>
          )}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}B`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              <Bar dataKey="revenue" name="Platform Income" fill="#4F8EF7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Operating Cost"  fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit"  name="Net Profit"      fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Monthly Expense Trend by Category ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Monthly Expense Trend by Category</h2>
          {isAllTime && (
            <p className="text-xs text-gray-400 mb-3">12 bulan terakhir</p>
          )}
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={expTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              {["Server & Cloud", "Staff Salary", "Marketing", "Other"].map((label, i) => (
                <Line key={label} type="monotone" dataKey={label} stroke={EXPENSE_COLORS[i]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Detailed Expense Tracking ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Detailed Expense Tracking
              <span className="ml-2 text-xs font-normal bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Paid only</span>
            </h2>
            {isAllTime && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Last 20 records (all time)</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["DATE", "CATEGORY", "DESCRIPTION", "AMOUNT", "VENDOR"].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-400 font-semibold py-2 pr-4 tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No paid expense data</td></tr>
                )}
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                      {new Date(exp.date).toISOString().slice(0, 10)}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-md font-medium whitespace-nowrap">
                        {CATEGORY_LABEL[exp.category] || exp.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{exp.description}</td>
                    <td className="py-3 pr-4 font-bold text-gray-900 whitespace-nowrap">Rp{fmt(exp.amount)}</td>
                    <td className="py-3 pr-4 text-gray-500">{exp.vendor}</td>
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