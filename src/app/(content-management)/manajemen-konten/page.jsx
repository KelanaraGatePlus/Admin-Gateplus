"use client";

import React, { useMemo } from "react";
import {
  useGetOverviewStatsQuery,
  useGetRevenueChartQuery,
  useGetCreatorGrowthChartQuery,
  useGetRecentActivityQuery,
  useGetCreatorStatsQuery,
} from "@/hooks/api/contentManagementSliceAPI";

// ============================================================
// FORMAT HELPERS
// ============================================================
function formatRupiah(num) {
  if (!num && num !== 0) return "Rp0";
  if (num >= 1_000_000_000) return `Rp${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `Rp${(num / 1_000_000).toFixed(0)}M`;
  if (num >= 1_000) return `Rp${(num / 1_000).toFixed(1)}K`;
  return `Rp${num.toLocaleString("id-ID")}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// ============================================================
// SVG ICONS
// ============================================================
function IconUsers({ color = "#3B82F6", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconFileText({ color = "#22C55E", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconWallet({ color = "#F97316", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" fill={color} stroke="none" />
      <path d="M2 10h20" />
    </svg>
  );
}

function IconTrendingUp({ color = "#EAB308", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

// ============================================================
// MINI SVG LINE CHART (Revenue Overview)
// ============================================================
function RevenueLineChart({ data = [] }) {
  const W = 440;
  const H = 180;
  const PAD = { top: 20, right: 20, bottom: 32, left: 52 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const values = data.map((d) => d.revenue);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const points = data.map((d, i) => {
    const x = PAD.left + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = PAD.top + innerH - ((d.revenue - minVal) / (maxVal - minVal)) * innerH;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${acc} C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
  }, "");

  const areaD = pathD
    ? `${pathD} L${points[points.length - 1].x},${PAD.top + innerH} L${PAD.left},${PAD.top + innerH} Z`
    : "";

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    val: Math.round(maxVal * t),
    y: PAD.top + innerH - t * innerH,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1297DC" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1297DC" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
          <text x={PAD.left - 6} y={t.y + 4} fontSize="9" fill="#9ca3af" textAnchor="end">
            {t.val >= 1000 ? `${(t.val / 1000).toFixed(0)}K` : t.val}
          </text>
        </g>
      ))}
      {areaD && <path d={areaD} fill="url(#areaGrad)" />}
      {pathD && (
        <path d={pathD} fill="none" stroke="#1297DC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={H - 6} fontSize="10" fill="#6b7280" textAnchor="middle">
          {p.month}
        </text>
      ))}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#1297DC" stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

// ============================================================
// MINI SVG BAR CHART (Creator Growth)
// ============================================================
function CreatorBarChart({ data = [] }) {
  const W = 440;
  const H = 180;
  const PAD = { top: 20, right: 20, bottom: 32, left: 32 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const values = data.map((d) => d.newCreators);
  const maxVal = Math.max(...values, 1);

  const barW = Math.max(8, (innerW / data.length) * 0.55);
  const gap = innerW / data.length;

  const yTicks = [0, 0.5, 1].map((t) => ({
    val: Math.round(maxVal * t),
    y: PAD.top + innerH - t * innerH,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
          <text x={PAD.left - 4} y={t.y + 4} fontSize="9" fill="#9ca3af" textAnchor="end">{t.val}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const barH = maxVal > 0 ? ((d.newCreators / maxVal) * innerH) : 0;
        const x = PAD.left + i * gap + (gap - barW) / 2;
        const y = PAD.top + innerH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={Math.max(barH, 2)} rx="4" ry="4" fill="#22c55e" />
            <text x={x + barW / 2} y={H - 6} fontSize="10" fill="#6b7280" textAnchor="middle">
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================
// ACTIVITY DOT COLOR
// ============================================================
const ACTIVITY_DOT = {
  new_creator: "bg-blue-500",
  new_content: "bg-green-500",
  account_suspended: "bg-yellow-500",
  revenue_payout: "bg-green-500",
  milestone: "bg-blue-400",
};

// ============================================================
// STAT CARD — dua varian: dengan growthPct ATAU dengan sub text
// ============================================================
function StatCard({ icon, iconBg, label, value, growthPct, sub, subColor }) {
  // Jika ada sub text (gaya kelola-kreator), tampilkan sub
  // Jika ada growthPct, tampilkan persentase growth
  const isPositive = growthPct >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: iconBg }}
          >
            {icon}
          </div>
        )}
        {growthPct !== undefined && sub === undefined && (
          <span className={`text-xs font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}>
            {isPositive ? "↑" : "↓"} {Math.abs(growthPct)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && (
        <p className={`text-xs mt-1 font-medium ${subColor || "text-gray-500"}`}>{sub}</p>
      )}
    </div>
  );
}

// ============================================================
// SKELETON LOADER
// ============================================================
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        <div className="w-12 h-4 bg-gray-200 rounded" />
      </div>
      <div className="h-7 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-20 bg-gray-100 rounded" />
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function ManajemenKontenPage() {
  const { data: statsData, isLoading: statsLoading } = useGetOverviewStatsQuery();
  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueChartQuery();
  const { data: growthData, isLoading: growthLoading } = useGetCreatorGrowthChartQuery();
  const { data: activityData, isLoading: activityLoading } = useGetRecentActivityQuery();

  // ✅ Ambil creator stats (sama seperti kelola-kreator) untuk header Total Creators
  const { data: creatorStatsData, isLoading: creatorStatsLoading } = useGetCreatorStatsQuery();

  const stats = statsData?.data;
  const creatorStats = creatorStatsData?.data;
  const revenueChart = revenueData?.data || [];
  const growthChart = growthData?.data || [];
  const activities = activityData?.data || [];

  const isCreatorLoading = statsLoading || creatorStatsLoading;

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isCreatorLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {/* ✅ Total Creators — isi sama persis dengan kelola-kreator/page.jsx */}
            <StatCard
              icon={<IconUsers color="#3B82F6" size={22} />}
              iconBg="#EFF6FF"
              label="Total Creators"
              value={(creatorStats?.totalCreators ?? 0).toLocaleString("id-ID")}
              sub={`+${creatorStats?.newThisMonth ?? 0} new this month`}
              subColor="text-green-600"
            />
            <StatCard
              icon={<IconFileText color="#22C55E" size={22} />}
              iconBg="#F0FDF4"
              label="Active Content"
              value={(stats?.activeContent ?? 0).toLocaleString("id-ID")}
              growthPct={stats?.contentGrowthPct ?? 0}
            />
            <StatCard
              icon={<IconWallet color="#F97316" size={22} />}
              iconBg="#FFF7ED"
              label="Total Revenue"
              value={formatRupiah(stats?.totalRevenue ?? 0)}
              growthPct={stats?.revenueGrowthPct ?? 0}
            />
            <StatCard
              icon={<IconTrendingUp color="#EAB308" size={22} />}
              iconBg="#FEF3C7"
              label="Growth Rate"
              value={`${stats?.growthRate ?? 0}%`}
              growthPct={stats?.growthRate ?? 0}
            />
          </>
        )}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Revenue Overview */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">Revenue Overview</h2>
          {revenueLoading ? (
            <div className="h-44 bg-gray-100 rounded-xl animate-pulse" />
          ) : revenueChart.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
              Belum ada data revenue
            </div>
          ) : (
            <div className="h-44">
              <RevenueLineChart data={revenueChart} />
            </div>
          )}
        </div>

        {/* Creator Growth */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">Creator Growth</h2>
          {growthLoading ? (
            <div className="h-44 bg-gray-100 rounded-xl animate-pulse" />
          ) : growthChart.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
              Belum ada data pertumbuhan
            </div>
          ) : (
            <div className="h-44">
              <CreatorBarChart data={growthChart} />
            </div>
          )}
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-base font-bold text-gray-900 mb-4">Recent Activity</h2>

        {activityLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200 mt-1.5 flex-shrink-0" />
                <div>
                  <div className="h-4 w-48 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-gray-400 text-sm py-4">Belum ada aktivitas terbaru</p>
        ) : (
          <div className="space-y-4">
            {activities.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    ACTIVITY_DOT[act.type] || "bg-gray-400"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{act.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(act.time)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}