"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useGetContentStatsQuery,
  useGetContentsQuery,
  useGetActiveGenresQuery,
} from "@/hooks/api/contentManagementSliceAPI";
import backendUrl from "@/const/backendUrl";

// ============================================================
// HELPERS
// ============================================================
function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

const TYPE_COLOR = {
  Film: "bg-blue-500", Series: "bg-purple-500", Ebook: "bg-green-500",
  Comic: "bg-orange-500", Podcast: "bg-pink-500",
};
const TYPE_BG = {
  Film: "bg-blue-50 text-blue-700", Series: "bg-purple-50 text-purple-700",
  Ebook: "bg-emerald-50 text-emerald-700", Comic: "bg-orange-50 text-orange-700",
  Podcast: "bg-pink-50 text-pink-700",
};

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("id-ID");
}

// ============================================================
// SVG ICONS
// ============================================================
const SvgIcon = ({ path, size = 16, color = "currentColor", sw = 2, fill = "none", viewBox = "0 0 24 24", children }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={color}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children || (Array.isArray(path) ? path.map((p, i) => <path key={i} d={p} />) : <path d={path} />)}
  </svg>
);

const Icons = {
  Layers: ({ size = 20, color = "#3B82F6" }) => <SvgIcon size={size} color={color}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></SvgIcon>,
  Clock: ({ size = 20, color = "#EAB308" }) => <SvgIcon size={size} color={color}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></SvgIcon>,
  Flag: ({ size = 20, color = "#EF4444" }) => <SvgIcon size={size} color={color}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></SvgIcon>,
  Slash: ({ size = 20, color = "#6B7280" }) => <SvgIcon size={size} color={color}><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></SvgIcon>,
  Search: ({ size = 16, color = "#9ca3af" }) => <SvgIcon size={size} color={color}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></SvgIcon>,
  Download: ({ size = 15, color = "#6b7280" }) => <SvgIcon size={size} color={color}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></SvgIcon>,
  ThumbUp: ({ size = 13, color = "#22C55E" }) => <SvgIcon size={size} color={color}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></SvgIcon>,
  ThumbDown: ({ size = 13, color = "#EF4444" }) => <SvgIcon size={size} color={color}><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" /><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" /></SvgIcon>,
  Filter: ({ size = 15, color = "#6b7280" }) => <SvgIcon size={size} color={color}><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></SvgIcon>,
  X: ({ size = 12, color = "#6b7280" }) => <SvgIcon size={size} color={color}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></SvgIcon>,
  Tag: ({ size = 13, color = "#6b7280" }) => <SvgIcon size={size} color={color}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></SvgIcon>,
  Calendar: ({ size = 13, color = "#6b7280" }) => <SvgIcon size={size} color={color}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></SvgIcon>,
  User: ({ size = 13, color = "#6b7280" }) => <SvgIcon size={size} color={color}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></SvgIcon>,
  Star: ({ size = 13, color = "#6b7280" }) => <SvgIcon size={size} color={color}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></SvgIcon>,
  AlertCircle: ({ size = 13, color = "#6b7280" }) => <SvgIcon size={size} color={color}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></SvgIcon>,
  Info: ({ size = 14, color = "#1297DC" }) => <SvgIcon size={size} color={color}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></SvgIcon>,
  Eye: ({ size = 13, color = "#6b7280" }) => <SvgIcon size={size} color={color}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></SvgIcon>,
  SortAsc: ({ size = 14, color = "#6b7280" }) => <SvgIcon size={size} color={color}><path d="M11 5h10M11 9h7M11 13h4" /><path d="M3 7l3-3 3 3M6 4v12" /></SvgIcon>,
  SortDesc: ({ size = 14, color = "#6b7280" }) => <SvgIcon size={size} color={color}><path d="M11 5h10M11 9h7M11 13h4" /><path d="M3 17l3 3 3-3M6 20V8" /></SvgIcon>,
  ChevronRight: ({ size = 14, color = "#9ca3af" }) => <SvgIcon size={size} color={color}><polyline points="9 18 15 12 9 6" /></SvgIcon>,
  ChevronUp: ({ size = 14, color = "#9ca3af" }) => <SvgIcon size={size} color={color}><polyline points="18 15 12 9 6 15" /></SvgIcon>,
  ChevronDown: ({ size = 14, color = "#9ca3af" }) => <SvgIcon size={size} color={color}><polyline points="6 9 12 15 18 9" /></SvgIcon>,
  MessageCircle: ({ size = 12, color = "#6b7280" }) => <SvgIcon size={size} color={color}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></SvgIcon>,
  TrendingUp: ({ size = 14, color = "#22C55E" }) => <SvgIcon size={size} color={color}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></SvgIcon>,
  HelpCircle: ({ size = 13, color = "#9ca3af" }) => <SvgIcon size={size} color={color}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></SvgIcon>,
};

// ============================================================
// STATUS BADGE
// ============================================================
const STATUS_CONFIG = {
  Active:    { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  Reported:  { cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500" },
  Suspended: { cls: "bg-slate-100 text-slate-600 border-slate-200",      dot: "bg-slate-400" },
  Blocking:  { cls: "bg-neutral-900 text-white border-transparent",       dot: "bg-red-400" },
  Checking:  { cls: "bg-blue-50 text-blue-700 border-blue-200",          dot: "bg-blue-400" },
  Delete:    { cls: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-500" },
  Private:   { cls: "bg-purple-50 text-purple-700 border-purple-200",    dot: "bg-purple-400" },
};

function SingleBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { cls: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  );
}

function StatusBadge({ status, isPrivate, isReported }) {
  if (isPrivate && isReported) {
    return (
      <div className="inline-flex flex-col items-center gap-1">
        <SingleBadge status="Reported" />
        <SingleBadge status="Suspended" />
      </div>
    );
  }
  if (isPrivate) return <SingleBadge status="Suspended" />;
  return <SingleBadge status={status} />;
}

// ============================================================
// STATUS LEGEND
// ============================================================
const LEGEND_ITEMS = [
  {
    badges: ["Active"],
    title: "Konten Aktif — Tidak Ada Pelanggaran",
    desc: "Konten telah dipublikasikan dan dapat diakses pengguna secara penuh. Belum terdapat laporan pelanggaran maupun tindakan moderasi aktif terhadap konten ini.",
  },
  {
    badges: ["Reported"],
    title: "Konten Aktif — Terdapat Laporan Pelanggaran",
    desc: "Konten masih dapat diakses pengguna, namun satu atau lebih laporan pelanggaran telah diterima dan sedang dalam proses tinjauan oleh tim moderasi.",
  },
  {
    badges: ["Suspended"],
    title: "Konten Dinonaktifkan Sementara — Terdapat Pelanggaran",
    desc: "Konten tidak dapat diakses pengguna karena telah dinonaktifkan sementara oleh admin.",
  },
];

function StatusLegend() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#1297DC] transition font-medium group"
      >
        <span className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-[#1297DC]/10 flex items-center justify-center transition">
          <Icons.HelpCircle size={12} color="currentColor" />
        </span>
        Panduan Status Konten
        <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <Icons.ChevronDown size={11} color="currentColor" />
        </span>
      </button>
      {open && (
        <div className="mt-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/80 flex items-center gap-2">
            <Icons.Info size={13} color="#1297DC" />
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Keterangan Status Konten</p>
          </div>
          <div className="divide-y divide-gray-50">
            {LEGEND_ITEMS.map((item, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition">
                <div className="flex flex-col gap-1 flex-shrink-0 min-w-[100px] items-start pt-0.5">
                  {item.badges.map(b => <SingleBadge key={b} status={b} />)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-700 mb-0.5">{item.title}</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// REPORTS CELL
// ============================================================
function ReportsCell({ contentId, contentType, contentReportCount = 0, commentReportCount = 0 }) {
  const router = useRouter();
  const total = contentReportCount + commentReportCount;
  if (total === 0) return <span className="text-xs text-gray-300 font-medium">—</span>;

  const urgencyColor = total >= 5 ? "text-red-600" : total >= 2 ? "text-amber-600" : "text-gray-500";
  const urgencyBg = total >= 5 ? "bg-red-50 border-red-100" : total >= 2 ? "bg-amber-50 border-amber-100" : "bg-gray-50 border-gray-100";

  return (
    <div className="flex flex-col gap-1.5">
      {contentReportCount > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/manajemen-konten/kelola-konten/${contentId}/content-reports?type=${contentType}`); }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold transition hover:shadow-sm ${urgencyBg} ${urgencyColor}`}>
          <Icons.Flag size={10} color="currentColor" />
          <span>{contentReportCount} konten</span>
          <Icons.ChevronRight size={9} color="currentColor" />
        </button>
      )}
      {commentReportCount > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/manajemen-konten/kelola-konten/${contentId}/comment-reports?type=${contentType}`); }}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-orange-100 bg-orange-50 text-orange-600 text-xs font-semibold transition hover:shadow-sm">
          <Icons.MessageCircle size={10} color="currentColor" />
          <span>{commentReportCount} komentar</span>
          <Icons.ChevronRight size={9} color="currentColor" />
        </button>
      )}
    </div>
  );
}

// ============================================================
// QUALITY SCORE
// ============================================================
function QualityScore({ likes = 0, dislikes = 0 }) {
  const total = likes + dislikes;
  const score = total > 0 ? Math.round((likes / total) * 100) : null;
  if (score === null) return <span className="text-xs text-gray-300">—</span>;

  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  const trackColor = score >= 75 ? "#dcfce7" : score >= 50 ? "#fef3c7" : "#fee2e2";

  return (
    <div className="flex flex-col items-center gap-1 min-w-[72px]">
      <span className="text-sm font-bold" style={{ color }}>{score}%</span>
      <div className="w-full h-1 rounded-full" style={{ background: trackColor }}>
        <div className="h-1 rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold">
          <Icons.ThumbUp size={10} color="#16a34a" />{likes.toLocaleString()}
        </span>
        <span className="text-gray-200 text-[10px]">|</span>
        <span className="flex items-center gap-0.5 text-[10px] text-red-500 font-semibold">
          <Icons.ThumbDown size={10} color="#dc2626" />{dislikes.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// FILTER STATE
// ============================================================
export const EMPTY_FILTERS = {
  types: [],
  statuses: [],
  genres: [],
  datePreset: "",
  dateFrom: "",
  dateTo: "",
  creator: "",
  minReports: "",
  maxReports: "",
  minQuality: "",
  maxQuality: "",
  minViews: "",
  maxViews: "",
  sortBy: "uploadDate",
  sortDir: "desc",
};

const DATE_PRESETS = [
  { label: "Hari ini",         value: "today" },
  { label: "7 hari terakhir",  value: "7d"    },
  { label: "30 hari terakhir", value: "30d"   },
  { label: "3 bulan terakhir", value: "90d"   },
  { label: "Tahun ini",        value: "year"  },
];
const DATE_PRESET_MAP = Object.fromEntries(DATE_PRESETS.map(d => [d.value, d.label]));

const SORT_OPTIONS = [
  { value: "uploadDate", label: "Tanggal Upload" },
  { value: "views",      label: "Views" },
  { value: "reports",    label: "Total Laporan" },
  { value: "quality",    label: "Quality Score" },
  { value: "likes",      label: "Likes" },
  { value: "title",      label: "Judul (A–Z)" },
];

function countActiveFilters(f) {
  return [
    f.types.length > 0,
    f.statuses.length > 0,
    f.genres.length > 0,
    !!(f.datePreset || f.dateFrom || f.dateTo),
    !!f.creator.trim(),
    !!(f.minReports || f.maxReports),
    !!(f.minQuality || f.maxQuality),
    !!(f.minViews || f.maxViews),
    f.sortBy !== "uploadDate" || f.sortDir !== "desc",
  ].filter(Boolean).length;
}

function buildFilterSummary(f, search) {
  const parts = [];
  if (search) parts.push(`kata kunci "${search}"`);
  if (f.types.length) parts.push(`tipe ${f.types.join(", ")}`);
  if (f.statuses.length) parts.push(`status ${f.statuses.join(", ")}`);
  if (f.creator.trim()) parts.push(`creator "${f.creator.trim()}"`);
  if (f.genres.length) parts.push(`genre ${f.genres.slice(0,3).join(", ")}${f.genres.length > 3 ? ` +${f.genres.length-3} lainnya` : ""}`);
  if (f.datePreset) parts.push(DATE_PRESET_MAP[f.datePreset] || f.datePreset);
  else if (f.dateFrom || f.dateTo) {
    if (f.dateFrom && f.dateTo) parts.push(`${f.dateFrom} — ${f.dateTo}`);
    else if (f.dateFrom) parts.push(`sejak ${f.dateFrom}`);
    else parts.push(`s.d. ${f.dateTo}`);
  }
  if (f.minReports || f.maxReports) parts.push(`laporan ${f.minReports || "0"}–${f.maxReports || "∞"}`);
  if (f.minQuality || f.maxQuality) parts.push(`kualitas ${f.minQuality || "0"}%–${f.maxQuality || "100"}%`);
  if (f.minViews || f.maxViews) parts.push(`views ${formatViews(parseInt(f.minViews)||0)}–${f.maxViews ? formatViews(parseInt(f.maxViews)) : "∞"}`);
  return parts;
}

// ============================================================
// FILTER CHIP
// ============================================================
function FilterChip({ icon, label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-white border border-[#1297DC]/30 text-[#0c6da1] text-xs font-semibold rounded-full shadow-sm">
      <span className="opacity-60">{icon}</span>
      {label}
      <button onClick={onRemove}
        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-500 text-gray-400 transition ml-0.5">
        <Icons.X size={10} color="currentColor" />
      </button>
    </span>
  );
}

// ============================================================
// FILTER RESULT BANNER
// ============================================================
function FilterResultBanner({ totalFiltered, totalAll, filterParts, onClearAll }) {
  if (!filterParts.length) return null;
  const ratio = totalAll > 0 ? Math.round((totalFiltered / totalAll) * 100) : 0;
  return (
    <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-[#1297DC]/20 rounded-2xl px-5 py-3.5 mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#1297DC]/10 flex items-center justify-center flex-shrink-0">
          <Icons.Filter size={14} color="#1297DC" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-800">Hasil Filter</span>
            <span className="px-2 py-0.5 bg-[#1297DC] text-white text-xs font-bold rounded-full">
              {totalFiltered.toLocaleString("id-ID")} konten
            </span>
            {totalAll > 0 && (
              <span className="text-xs text-gray-400">dari {totalAll.toLocaleString("id-ID")} ({ratio}%)</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Filter: {filterParts.map((p, i) => (
              <React.Fragment key={i}>
                <span className="font-semibold text-gray-700">{p}</span>
                {i < filterParts.length - 1 && <span className="text-gray-300"> · </span>}
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>
      <button onClick={onClearAll}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition">
        <Icons.X size={10} color="currentColor" />
        Hapus Filter
      </button>
    </div>
  );
}

// ============================================================
// ADVANCED FILTER DRAWER
// ============================================================
const CONTENT_TYPES = ["Film", "Series", "Ebook", "Comic", "Podcast"];
const STATUS_OPTIONS = ["Active", "Reported", "Suspended"];

function FilterSection({ title, hint, children }) {
  return (
    <div className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
      {hint && <p className="text-[11px] text-gray-400 mb-3">{hint}</p>}
      {!hint && <div className="mb-3" />}
      {children}
    </div>
  );
}

function ToggleChip({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
        active
          ? "bg-[#1297DC] text-white border-[#1297DC] shadow-sm"
          : "bg-white text-gray-600 border-gray-200 hover:border-[#1297DC]/60 hover:text-[#1297DC]"
      }`}>
      {children}
    </button>
  );
}

function NumericInput({ label, value, onChange, placeholder, min = "0", max }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-1 font-medium">{label}</p>
      <input
        type="number" min={min} max={max} placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1297DC]/20 focus:border-[#1297DC]" />
    </div>
  );
}

function QuickPreset({ options, minKey, maxKey, local, setLocal }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(q => {
        const isActive = local[minKey] === q.min && local[maxKey] === q.max;
        return (
          <button key={q.l}
            onClick={() => setLocal(p => ({ ...p, [minKey]: q.min, [maxKey]: q.max }))}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              isActive ? "bg-[#1297DC] text-white border-[#1297DC]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1297DC]/60"
            }`}>
            {q.l}
          </button>
        );
      })}
    </div>
  );
}

function AdvancedFilterDrawer({ isOpen, onClose, filters, onApply, allGenres }) {
  const [local, setLocal] = useState(filters);
  useEffect(() => { if (isOpen) setLocal(filters); }, [isOpen, filters]);

  const toggle = (key, val) => setLocal(p => ({
    ...p, [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val]
  }));

  const activeCount = countActiveFilters(local);
  const handleReset = () => { onApply(EMPTY_FILTERS); onClose(); };
  const handleApply = () => { onApply(local); onClose(); };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[460px] bg-white shadow-2xl flex flex-col"
        style={{ animation: "drawerIn .2s cubic-bezier(.4,0,.2,1)" }}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1297DC]/10 flex items-center justify-center">
              <Icons.Filter size={15} color="#1297DC" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Filter & Urutkan</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {activeCount > 0
                  ? <span className="text-[#1297DC] font-semibold">{activeCount} filter aktif</span>
                  : "Saring konten berdasarkan kriteria"}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
            <Icons.X size={14} color="currentColor" />
          </button>
        </div>

        <div className="px-6 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2 flex-shrink-0">
          <Icons.Info size={13} color="#1297DC" />
          <p className="text-[11px] text-blue-600">
            Filter diproses di server. Klik <strong>Terapkan</strong> untuk memuat hasil.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <FilterSection title="Urutkan Berdasarkan" hint="Pilih kolom pengurutan dan arah (naik/turun).">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => setLocal(p => ({ ...p, sortBy: opt.value }))}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition ${
                      local.sortBy === opt.value
                        ? "bg-[#1297DC] text-white border-[#1297DC]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#1297DC]/60"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setLocal(p => ({ ...p, sortDir: "desc" }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    local.sortDir === "desc" ? "bg-[#1297DC] text-white border-[#1297DC]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1297DC]/60"
                  }`}>
                  <Icons.SortDesc size={12} color="currentColor" />
                  Terbesar / Terbaru
                </button>
                <button
                  onClick={() => setLocal(p => ({ ...p, sortDir: "asc" }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    local.sortDir === "asc" ? "bg-[#1297DC] text-white border-[#1297DC]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1297DC]/60"
                  }`}>
                  <Icons.SortAsc size={12} color="currentColor" />
                  Terkecil / Terlama
                </button>
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Tipe Konten" hint="Pilih satu atau lebih tipe. Kosong = semua tipe.">
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map(t => (
                <ToggleChip key={t} active={local.types.includes(t)} onClick={() => toggle("types", t)}>
                  {t}
                </ToggleChip>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Status Konten" hint="Active = tidak bermasalah · Reported = ada laporan · Suspended = dinonaktifkan sementara.">
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(s => (
                <ToggleChip key={s} active={local.statuses.includes(s)} onClick={() => toggle("statuses", s)}>
                  {s}
                </ToggleChip>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Creator" hint="Cari berdasarkan nama creator (sebagian nama sudah cukup).">
            <div className="relative">
              <input type="text" placeholder="Contoh: Budi, Studio Kreatif..."
                value={local.creator}
                onChange={e => setLocal(p => ({ ...p, creator: e.target.value }))}
                className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1297DC]/20 focus:border-[#1297DC]" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
                <Icons.User size={14} color="#374151" />
              </span>
              {local.creator && (
                <button onClick={() => setLocal(p => ({ ...p, creator: "" }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  <Icons.X size={12} color="currentColor" />
                </button>
              )}
            </div>
          </FilterSection>

          {allGenres.length > 0 && (
            <FilterSection title={`Genre Aktif (${allGenres.length})`} hint="Hanya menampilkan genre yang sedang aktif. Genre nonaktif tidak tersedia.">
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {allGenres.map(g => (
                  <ToggleChip key={g} active={local.genres.includes(g)} onClick={() => toggle("genres", g)}>
                    {g}
                  </ToggleChip>
                ))}
              </div>
              {local.genres.length > 0 && (
                <button onClick={() => setLocal(p => ({ ...p, genres: [] }))}
                  className="mt-2 text-xs text-red-400 hover:text-red-600 transition">
                  Hapus pilihan genre
                </button>
              )}
            </FilterSection>
          )}

          <FilterSection title="Tanggal Upload">
            <p className="text-[11px] text-gray-500 mb-2 font-medium">Pilih cepat:</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {DATE_PRESETS.map(p => (
                <ToggleChip key={p.value}
                  active={local.datePreset === p.value}
                  onClick={() => setLocal(prev => ({
                    ...prev,
                    datePreset: prev.datePreset === p.value ? "" : p.value,
                    dateFrom: "", dateTo: ""
                  }))}>
                  {p.label}
                </ToggleChip>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mb-2 font-medium">Atau tentukan rentang kustom:</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Dari tanggal</p>
                <input type="date" value={local.dateFrom}
                  onChange={e => setLocal(p => ({ ...p, dateFrom: e.target.value, datePreset: "" }))}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1297DC]/20 focus:border-[#1297DC]" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Sampai tanggal</p>
                <input type="date" value={local.dateTo}
                  onChange={e => setLocal(p => ({ ...p, dateTo: e.target.value, datePreset: "" }))}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1297DC]/20 focus:border-[#1297DC]" />
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Jumlah Views" hint="Filter konten berdasarkan popularitas (jumlah penonton).">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <NumericInput label="Minimal views" value={local.minViews} onChange={v => setLocal(p => ({ ...p, minViews: v }))} placeholder="0" />
              <NumericInput label="Maksimal views" value={local.maxViews} onChange={v => setLocal(p => ({ ...p, maxViews: v }))} placeholder="∞" />
            </div>
            <QuickPreset
              options={[
                { l: "Belum ditonton", min: "0", max: "0" },
                { l: "< 1K views", min: "1", max: "999" },
                { l: "1K – 10K", min: "1000", max: "10000" },
                { l: "10K+", min: "10001", max: "" },
              ]}
              minKey="minViews" maxKey="maxViews" local={local} setLocal={setLocal}
            />
          </FilterSection>

          <FilterSection title="Jumlah Laporan" hint="Total laporan konten + laporan komentar. Berguna untuk prioritas moderasi.">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <NumericInput label="Minimal laporan" value={local.minReports} onChange={v => setLocal(p => ({ ...p, minReports: v }))} placeholder="0" />
              <NumericInput label="Maksimal laporan" value={local.maxReports} onChange={v => setLocal(p => ({ ...p, maxReports: v }))} placeholder="∞" />
            </div>
            <QuickPreset
              options={[
                { l: "Bersih (0)", min: "0", max: "0" },
                { l: "1–4 laporan", min: "1", max: "4" },
                { l: "5–9 laporan", min: "5", max: "9" },
                { l: "10+ laporan", min: "10", max: "" },
              ]}
              minKey="minReports" maxKey="maxReports" local={local} setLocal={setLocal}
            />
          </FilterSection>

          <FilterSection title="Quality Score (%)" hint="Persentase likes dari total reaksi. Semakin tinggi = konten lebih disukai.">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <NumericInput label="Minimal score" value={local.minQuality} onChange={v => setLocal(p => ({ ...p, minQuality: v }))} placeholder="0%" max="100" />
              <NumericInput label="Maksimal score" value={local.maxQuality} onChange={v => setLocal(p => ({ ...p, maxQuality: v }))} placeholder="100%" max="100" />
            </div>
            <QuickPreset
              options={[
                { l: "Buruk (0–49%)", min: "0", max: "49" },
                { l: "Cukup (50–74%)", min: "50", max: "74" },
                { l: "Bagus (75%+)", min: "75", max: "100" },
              ]}
              minKey="minQuality" maxKey="maxQuality" local={local} setLocal={setLocal}
            />
          </FilterSection>

        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          {activeCount > 0 && (
            <p className="text-xs text-center text-[#1297DC] font-semibold mb-3">
              {activeCount} kategori filter/urutan akan diterapkan
            </p>
          )}
          <div className="flex gap-3">
            <button onClick={handleReset}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition">
              Reset Semua
            </button>
            <button onClick={handleApply}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#1297DC] text-white text-sm font-semibold hover:bg-[#0e7ab8] transition flex items-center justify-center gap-2 shadow-sm">
              <Icons.Filter size={13} color="white" />
              Terapkan
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drawerIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ============================================================
// COLUMN SORT HEADER
// ============================================================
function SortHeader({ label, sortKey, currentSort, currentDir, onChange }) {
  const isActive = currentSort === sortKey;
  return (
    <button
      onClick={() => onChange(sortKey, isActive && currentDir === "desc" ? "asc" : "desc")}
      className={`flex items-center gap-1 group ${isActive ? "text-[#1297DC]" : "text-gray-500 hover:text-gray-700"}`}>
      <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      <span className="opacity-60">
        {isActive
          ? (currentDir === "desc" ? <Icons.ChevronDown size={12} color="currentColor" /> : <Icons.ChevronUp size={12} color="currentColor" />)
          : <Icons.ChevronDown size={12} color="#9ca3af" />
        }
      </span>
    </button>
  );
}

// ============================================================
// TABS
// ============================================================
const TABS = [
  { key: "all",       label: "Semua Konten"  },
  { key: "pending",   label: "Pending Review" },
  { key: "reported",  label: "Dilaporkan"     },
  { key: "suspended", label: "Disuspend"      },
];

// ============================================================
// MAIN PAGE
// ============================================================
export default function KelolaKontenPage() {
  const router  = useRouter();
  const LIMIT   = 10;

  const [activeTab,   setActiveTab]   = useState("all");
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showDrawer,  setShowDrawer]  = useState(false);
  const [filters,     setFilters]     = useState(EMPTY_FILTERS);

  // Semua filter + sort + pagination dikirim ke backend
  const queryParams = {
    page,
    limit: LIMIT,
    search,
    filter:     activeTab,
    types:      filters.types,
    statuses:   filters.statuses,
    genres:     filters.genres,
    datePreset: filters.datePreset,
    dateFrom:   filters.dateFrom,
    dateTo:     filters.dateTo,
    creator:    filters.creator,
    minReports: filters.minReports,
    maxReports: filters.maxReports,
    minQuality: filters.minQuality,
    maxQuality: filters.maxQuality,
    minViews:   filters.minViews,
    maxViews:   filters.maxViews,
    sortBy:     filters.sortBy,
    sortDir:    filters.sortDir,
  };

  const { data: statsData,   isLoading: statsLoading } = useGetContentStatsQuery();
  const { data: contentData, isLoading: listLoading, isFetching } =
    useGetContentsQuery(queryParams);
  const { data: activeGenresData } = useGetActiveGenresQuery();

  const stats      = statsData?.data;
  const contents   = contentData?.data       || [];
  const pagination = contentData?.pagination || {};

  const totalFiltered = pagination.total      ?? 0;
  const totalPages    = pagination.totalPages ?? 1;

  const allGenres = useMemo(() =>
    (activeGenresData?.data || []).map(g => g.name).sort(),
  [activeGenresData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setFilters(EMPTY_FILTERS);
    setSearch("");
    setSearchInput("");
  };

  const handleApplyFilters = (f) => {
    setFilters(f);
    setPage(1);
  };

  const handleClearAll = () => {
    setFilters(EMPTY_FILTERS);
    setSearch("");
    setSearchInput("");
    setPage(1);
  };

  const handleColumnSort = (key, dir) => {
    setFilters(f => ({ ...f, sortBy: key, sortDir: dir }));
    setPage(1);
  };

  const handleExport = useCallback(async () => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ search, filter: activeTab });
    const url = `${backendUrl}/management/content/export?${params}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const text = await res.text();
    const blob = new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `contents_${activeTab}_${Date.now()}.csv`;
    link.click();
  }, [search, activeTab]);

  const activeFilterCount = countActiveFilters(filters);
  const isFiltered        = activeFilterCount > 0 || !!search;
  const filterParts       = buildFilterSummary(filters, search);

  const chips = [
    filters.types.length    && { key: "types",    icon: <Icons.Tag size={10} color="#1297DC" />,         label: filters.types.join(", "),      clear: () => handleApplyFilters({ ...filters, types: [] }) },
    filters.statuses.length && { key: "statuses", icon: <Icons.AlertCircle size={10} color="#1297DC" />, label: filters.statuses.join(", "),   clear: () => handleApplyFilters({ ...filters, statuses: [] }) },
    filters.creator.trim()  && { key: "creator",  icon: <Icons.User size={10} color="#1297DC" />,        label: `"${filters.creator}"`,         clear: () => handleApplyFilters({ ...filters, creator: "" }) },
    filters.genres.length   && { key: "genres",   icon: <Icons.Tag size={10} color="#1297DC" />,         label: `${filters.genres.slice(0,2).join(", ")}${filters.genres.length>2?` +${filters.genres.length-2}`:""}`, clear: () => handleApplyFilters({ ...filters, genres: [] }) },
    (filters.datePreset || filters.dateFrom || filters.dateTo) && {
      key: "date", icon: <Icons.Calendar size={10} color="#1297DC" />,
      label: filters.datePreset ? DATE_PRESET_MAP[filters.datePreset] : `${filters.dateFrom||"…"} — ${filters.dateTo||"…"}`,
      clear: () => handleApplyFilters({ ...filters, datePreset: "", dateFrom: "", dateTo: "" }),
    },
    (filters.minViews || filters.maxViews)     && { key: "views",   icon: <Icons.Eye size={10} color="#1297DC" />,  label: `Views: ${formatViews(parseInt(filters.minViews)||0)}–${filters.maxViews ? formatViews(parseInt(filters.maxViews)) : "∞"}`, clear: () => handleApplyFilters({ ...filters, minViews: "", maxViews: "" }) },
    (filters.minReports || filters.maxReports) && { key: "reports", icon: <Icons.Flag size={10} color="#1297DC" />, label: `Laporan: ${filters.minReports||"0"}–${filters.maxReports||"∞"}`, clear: () => handleApplyFilters({ ...filters, minReports: "", maxReports: "" }) },
    (filters.minQuality || filters.maxQuality) && { key: "quality", icon: <Icons.Star size={10} color="#1297DC" />, label: `Kualitas: ${filters.minQuality||"0"}%–${filters.maxQuality||"100"}%`, clear: () => handleApplyFilters({ ...filters, minQuality: "", maxQuality: "" }) },
    (filters.sortBy !== "uploadDate" || filters.sortDir !== "desc") && {
      key: "sort", icon: <Icons.SortDesc size={10} color="#1297DC" />,
      label: `Urut: ${SORT_OPTIONS.find(s=>s.value===filters.sortBy)?.label||""} (${filters.sortDir==="desc"?"↓":"↑"})`,
      clear: () => handleApplyFilters({ ...filters, sortBy: "uploadDate", sortDir: "desc" }),
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F4F6F9] p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kelola Konten</h1>
        <p className="text-gray-400 text-sm mt-0.5">Monitor, saring, dan moderasi seluruh konten platform</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Icons.Layers />}                                label="Total Konten"   value={statsLoading ? "…" : stats?.totalContent  ?? 0} iconBg="bg-blue-50"   />
        <StatCard icon={<Icons.Clock />}                                  label="Pending Review" value={statsLoading ? "…" : stats?.pendingReview ?? 0} iconBg="bg-amber-50"  />
        <StatCard icon={<Icons.Flag size={20} color="#EF4444" />}         label="Dilaporkan"     value={statsLoading ? "…" : stats?.reported      ?? 0} iconBg="bg-red-50"    />
        <StatCard icon={<Icons.Slash size={20} color="#6B7280" />}        label="Disuspend"      value={statsLoading ? "…" : stats?.suspended     ?? 0} iconBg="bg-gray-100"  />
      </div>

      {/* TABS + TOOLBAR */}
      <div className="bg-white rounded-2xl shadow-sm mb-4">
        <div className="flex border-b border-gray-100 px-4 pt-4 overflow-x-auto">
          {TABS.map(tab => {
            const counts = { all: stats?.totalContent, pending: stats?.pendingReview, reported: stats?.reported, suspended: stats?.suspended };
            return (
              <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                className={`flex-shrink-0 px-4 py-2 mr-1 text-sm font-medium rounded-t-lg border-b-2 transition ${
                  activeTab === tab.key
                    ? "border-[#1297DC] text-[#1297DC]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                {tab.label}
                {counts[tab.key] != null && (
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key ? "bg-[#1297DC] text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {counts[tab.key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 items-center p-4">
          <div className="flex-1 relative">
            <input type="text" placeholder="Cari judul konten… (Enter untuk cari)"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1297DC] bg-gray-50 focus:bg-white transition" />
            <button onClick={() => { setSearch(searchInput); setPage(1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1297DC] transition">
              <Icons.Search size={15} color="currentColor" />
            </button>
            {searchInput && (
              <button onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <Icons.X size={12} color="currentColor" />
              </button>
            )}
          </div>

          <button onClick={() => setShowDrawer(true)}
            className={`relative flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition ${
              activeFilterCount > 0
                ? "border-[#1297DC] text-[#1297DC] bg-[#1297DC]/5"
                : "border-gray-200 text-gray-600 hover:border-[#1297DC]/50"
            }`}>
            <Icons.Filter size={14} color={activeFilterCount > 0 ? "#1297DC" : "#6b7280"} />
            Filter & Urut
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1297DC] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1297DC]/50 hover:text-[#1297DC] transition">
            <Icons.Download size={14} color="currentColor" />
            Export CSV
          </button>
        </div>

        {chips.length > 0 && (
          <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
            <span className="text-[11px] text-gray-400 font-semibold">Aktif:</span>
            {chips.map(c => (
              <FilterChip key={c.key} icon={c.icon} label={c.label} onRemove={c.clear} />
            ))}
            <button onClick={handleClearAll}
              className="text-[11px] text-red-400 hover:text-red-600 font-bold transition ml-1 underline underline-offset-2">
              Hapus semua
            </button>
          </div>
        )}
      </div>

      {/* STATUS LEGEND */}
      <StatusLegend />

      {/* FILTER RESULT BANNER */}
      <FilterResultBanner
        totalFiltered={totalFiltered}
        totalAll={stats?.totalContent ?? 0}
        filterParts={filterParts}
        onClearAll={handleClearAll}
      />

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-bold text-gray-800">
              {isFiltered ? "Hasil Filter" : "Semua Konten"}
              <span className="text-gray-400 font-normal text-xs ml-2">
                {contents.length > 0
                  ? `menampilkan ${((page-1)*LIMIT+1).toLocaleString()}–${Math.min(page*LIMIT, totalFiltered).toLocaleString()} dari ${totalFiltered.toLocaleString()} konten`
                  : "tidak ada hasil"}
              </span>
            </p>
            {isFiltered && totalFiltered === 0 && !listLoading && !isFetching && (
              <p className="text-xs text-gray-400 mt-0.5">Tidak ada konten yang cocok. Coba ubah filter.</p>
            )}
          </div>
          {totalPages > 1 && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
              Hal. {page} / {totalPages}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  <SortHeader label="Konten" sortKey="title" currentSort={filters.sortBy} currentDir={filters.sortDir} onChange={handleColumnSort} />
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Creator</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Genre</th>
                <th className="text-right px-4 py-3.5">
                  <SortHeader label="Views" sortKey="views" currentSort={filters.sortBy} currentDir={filters.sortDir} onChange={handleColumnSort} />
                </th>
                <th className="text-center px-4 py-3.5">
                  <SortHeader label="Laporan" sortKey="reports" currentSort={filters.sortBy} currentDir={filters.sortDir} onChange={handleColumnSort} />
                </th>
                <th className="text-center px-4 py-3.5">
                  <SortHeader label="Kualitas" sortKey="quality" currentSort={filters.sortBy} currentDir={filters.sortDir} onChange={handleColumnSort} />
                </th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {listLoading || isFetching ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-9 bg-gray-200 rounded-xl flex-shrink-0" />
                        <div>
                          <div className="h-3.5 w-40 bg-gray-200 rounded mb-1.5" />
                          <div className="h-3 w-24 bg-gray-100 rounded" />
                        </div>
                      </div>
                    </td>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-16 mx-auto" /></td>
                    ))}
                  </tr>
                ))
              ) : contents.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <Icons.Search size={24} color="#d1d5db" />
                      </div>
                      <p className="text-base font-semibold text-gray-500">Tidak ada konten ditemukan</p>
                      <p className="text-sm text-gray-400 mt-1 text-center max-w-xs">
                        {isFiltered ? "Coba ubah atau hapus beberapa filter untuk melihat lebih banyak konten." : "Belum ada konten di tab ini."}
                      </p>
                      {isFiltered && (
                        <button onClick={handleClearAll}
                          className="mt-4 px-5 py-2 bg-[#1297DC] text-white text-sm font-semibold rounded-xl hover:bg-[#0e7ab8] transition">
                          Hapus Semua Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                contents.map(item => {
                  const genres = item.genre ? item.genre.split(",").map(g => g.trim()).filter(Boolean) : [];
                  const itemIsPrivate  = item.isPrivate  ?? (item.status === "Suspended");
                  const itemIsReported = item.isReported ?? (item.status === "Reported");

                  return (
                    <tr key={item.id}
                      className="border-b border-gray-50 hover:bg-[#1297DC]/[0.02] transition group cursor-default">

                      {/* Konten */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                            {item.coverUrl
                              ? <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                              : <div className={`w-full h-full ${TYPE_COLOR[item.type] || "bg-gray-400"} flex items-center justify-center text-white text-xs font-bold`}>
                                  {item.type?.[0] || "?"}
                                </div>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-[#1297DC] transition">{item.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${TYPE_BG[item.type] || "bg-gray-100 text-gray-600"}`}>
                                {item.type}
                              </span>
                              <span className="text-[11px] text-gray-400">{formatDate(item.uploadDate)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Creator */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-700 font-medium">{item.creator?.name || <span className="text-gray-300">—</span>}</span>
                      </td>

                      {/* Genre */}
                      <td className="px-4 py-3.5">
                        {genres.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[140px]">
                            {genres.slice(0, 2).map((g, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium whitespace-nowrap">{g}</span>
                            ))}
                            {genres.length > 2 && (
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-md text-[10px] font-medium">+{genres.length - 2}</span>
                            )}
                          </div>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>

                      {/* Views */}
                      <td className="px-4 py-3.5 text-right">
                        <p className="text-sm font-bold text-gray-800">{formatViews(item.views)}</p>
                        {item.views > 0 && (
                          <p className="text-[10px] text-gray-400">{(item.views || 0).toLocaleString("id-ID")}</p>
                        )}
                      </td>

                      {/* Laporan */}
                      <td className="px-4 py-3.5 text-center">
                        <ReportsCell
                          contentId={item.id} contentType={item.type}
                          contentReportCount={item.contentReportCount ?? 0}
                          commentReportCount={item.commentReportCount ?? 0}
                        />
                      </td>

                      {/* Kualitas */}
                      <td className="px-4 py-3.5 text-center">
                        <QualityScore likes={item.likeCount} dislikes={item.dislikeCount} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge
                          status={item.status}
                          isPrivate={itemIsPrivate}
                          isReported={itemIsReported}
                        />
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => router.push(`/manajemen-konten/kelola-konten/${item.id}?type=${item.type}`)}
                          className="px-3 py-1.5 text-xs text-[#1297DC] border border-[#1297DC]/40 rounded-lg hover:bg-[#1297DC] hover:text-white transition font-semibold">
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/40">
          <p className="text-xs text-gray-500">
            {totalFiltered === 0
              ? "Tidak ada hasil"
              : `${((page-1)*LIMIT+1).toLocaleString("id-ID")} – ${Math.min(page*LIMIT, totalFiltered).toLocaleString("id-ID")} dari ${totalFiltered.toLocaleString("id-ID")} konten`
            }
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-30 hover:border-[#1297DC]/50 transition">
              «
            </button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold disabled:opacity-30 hover:border-[#1297DC]/50 transition">
              ‹ Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx-1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…"
                  ? <span key={`e${i}`} className="px-1 text-gray-300 text-xs">…</span>
                  : <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                        p === page ? "bg-[#1297DC] text-white shadow-sm" : "border border-gray-200 hover:border-[#1297DC]/50 text-gray-600"
                      }`}>
                      {p}
                    </button>
              )
            }

            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold disabled:opacity-30 hover:border-[#1297DC]/50 transition">
              Next ›
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-30 hover:border-[#1297DC]/50 transition">
              »
            </button>
          </div>
        </div>
      </div>

      {/* DRAWER */}
      <AdvancedFilterDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        filters={filters}
        onApply={handleApplyFilters}
        allGenres={allGenres}
      />
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================
function StatCard({ icon, iconBg, label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-3 hover:shadow-md transition">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 tabular-nums">
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </p>
      </div>
    </div>
  );
}