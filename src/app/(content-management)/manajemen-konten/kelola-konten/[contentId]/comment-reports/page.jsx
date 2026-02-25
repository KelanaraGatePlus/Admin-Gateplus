"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import backendUrl from "@/const/backendUrl";

// ============================================================
// FORMAT HELPERS
// ============================================================
function formatDateTime(d) {
  if (!d) return "-";
  return new Date(d).toLocaleString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================
let toastIdCounter = 0;
let globalToastSetter = null;

function useToastStore() {
  const [toasts, setToasts] = useState([]);
  globalToastSetter = setToasts;
  return { toasts, setToasts };
}

function toastNotify(message, type = "info", duration = 4000) {
  if (!globalToastSetter) return;
  const id = ++toastIdCounter;
  globalToastSetter(prev => [...prev, { id, message, type, duration }]);
}

const TOAST_STYLES = {
  success: {
    bg: "bg-white border-l-4 border-emerald-500",
    icon: (
      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    ),
    titleColor: "text-emerald-700",
    msgColor: "text-gray-600",
    title: "Berhasil",
  },
  error: {
    bg: "bg-white border-l-4 border-red-500",
    icon: (
      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
    ),
    titleColor: "text-red-700",
    msgColor: "text-gray-600",
    title: "Gagal",
  },
  info: {
    bg: "bg-white border-l-4 border-[#1297DC]",
    icon: (
      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1297DC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </div>
    ),
    titleColor: "text-blue-700",
    msgColor: "text-gray-600",
    title: "Informasi",
  },
  warning: {
    bg: "bg-white border-l-4 border-amber-500",
    icon: (
      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
    ),
    titleColor: "text-amber-700",
    msgColor: "text-gray-600",
    title: "Perhatian",
  },
};

function ToastItem({ toast: t, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const cfg = TOAST_STYLES[t.type] || TOAST_STYLES.info;

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    const hide = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => onRemove(t.id), 300);
    }, t.duration);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-lg ${cfg.bg}
        transition-all duration-300 ease-out min-w-[320px] max-w-[400px]
        ${visible && !leaving ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
      `}
    >
      {cfg.icon}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold uppercase tracking-wide ${cfg.titleColor}`}>{cfg.title}</p>
        <p className={`text-sm mt-0.5 leading-relaxed ${cfg.msgColor}`}>{t.message}</p>
      </div>
      <button
        onClick={() => { setLeaving(true); setTimeout(() => onRemove(t.id), 300); }}
        className="text-gray-300 hover:text-gray-500 transition flex-shrink-0 mt-0.5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

function ToastContainer({ toasts, setToasts }) {
  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2.5" style={{ pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: "all" }}>
          <ToastItem toast={t} onRemove={remove} />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// CONFIRMATION DIALOG
// ============================================================
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Konfirmasi", isDestructive = false, isLoading = false }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        style={{ animation: "dialogPop 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isDestructive ? "bg-red-50" : "bg-blue-50"}`}>
            {isDestructive ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1297DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 ${isDestructive ? "bg-red-500 hover:bg-red-600" : "bg-[#1297DC] hover:bg-[#0e7ab8]"}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Memproses...
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes dialogPop { from { opacity:0; transform:scale(0.9) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

// ============================================================
// VALIDATION BANNER
// ============================================================
function ValidationBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
      <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="text-sm text-red-700 flex-1 font-medium">{message}</p>
      <button onClick={onClose} className="text-red-300 hover:text-red-500 transition">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================
const REPORT_STATUS_MAP = {
  PENDING:      { cls: "bg-yellow-100 text-yellow-700 border border-yellow-300", label: "Pending" },
  IN_REVIEW:    { cls: "bg-blue-100 text-blue-700 border border-blue-300",       label: "In Review" },
  ACTION_TAKEN: { cls: "bg-green-100 text-green-700 border border-green-300",    label: "Action Taken" },
  DISMISSED:    { cls: "bg-gray-100 text-gray-500 border border-gray-200",       label: "Dismissed" },
};

function ReportStatusBadge({ status }) {
  const cfg = REPORT_STATUS_MAP[status] || REPORT_STATUS_MAP["PENDING"];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ============================================================
// CATEGORY BADGE
// ============================================================
const CATEGORY_COLOR = {
  SPAM:                  "bg-orange-100 text-orange-700",
  HATE_SPEECH:           "bg-purple-100 text-purple-700",
  HARASSMENT:            "bg-red-100 text-red-700",
  INAPPROPRIATE_CONTENT: "bg-pink-100 text-pink-700",
  OTHER:                 "bg-gray-100 text-gray-600",
};

function CategoryBadge({ category }) {
  const cls = CATEGORY_COLOR[category] || CATEGORY_COLOR["OTHER"];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {(category || "OTHER").replace(/_/g, " ")}
    </span>
  );
}

// ============================================================
// ACTION TAKEN BADGE
// ============================================================
const ACTION_LABEL = {
  BAN_PERMANENT:      { label: "Ban Permanen",     cls: "bg-red-100 text-red-700 border border-red-300" },
  SUSPEND_COMMENTER:  { label: "Suspend Akun",     cls: "bg-orange-100 text-orange-700 border border-orange-300" },
  DELETE_COMMENT:     { label: "Hapus Komentar",   cls: "bg-red-100 text-red-700 border border-red-300" },
  WARNING:            { label: "Peringatan",       cls: "bg-yellow-100 text-yellow-700 border border-yellow-300" },
  DISMISS:            { label: "Ditolak/Lolos",    cls: "bg-gray-100 text-gray-500 border border-gray-200" },
};

function ActionTakenBadge({ action }) {
  if (!action) return <span className="text-gray-300 text-xs italic">-</span>;
  const cfg = ACTION_LABEL[action] || { label: action, cls: "bg-gray-100 text-gray-600 border border-gray-200" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ============================================================
// SKELETON ROW
// ============================================================
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40 mb-1" /><div className="h-3 bg-gray-100 rounded w-28" /></td>
      <td className="px-4 py-4"><div className="flex items-center gap-2"><div className="w-7 h-7 bg-gray-200 rounded-full" /><div className="h-4 bg-gray-200 rounded w-24" /></div></td>
      <td className="px-4 py-4"><div className="h-5 bg-gray-200 rounded-full w-20" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="px-4 py-4"><div className="h-5 bg-gray-200 rounded-full w-20 mx-auto" /></td>
      <td className="px-4 py-4"><div className="h-5 bg-gray-200 rounded-full w-20 mx-auto" /></td>
      <td className="px-4 py-4"><div className="h-7 bg-gray-200 rounded-lg w-24 mx-auto" /></td>
    </tr>
  );
}

// ============================================================
// DETAIL + ACTION MODAL
// ============================================================
function CommentReportDetailModal({ report, onClose, onActionSuccess }) {
  const [formData, setFormData] = useState({
    actionTaken: "",
    suspendDuration: null,
    verdict: "",
    adminNotes: "",
  });
  const [suspendDays, setSuspendDays] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const isProcessed = report.status === "ACTION_TAKEN" || report.status === "DISMISSED";
  const comment   = report.Comment;
  const commenter = comment?.user;
  const reporter  = report.User;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => setModalVisible(true), 10);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, []);

  const handleClose = () => {
    setModalVisible(false);
    setTimeout(onClose, 200);
  };

  const handleActionChange = (val) => {
    setFormData(prev => ({ ...prev, actionTaken: val, suspendDuration: null }));
    setSuspendDays("");
    setValidationError("");
  };

  const handleSuspendDaysChange = (val) => {
    setSuspendDays(val);
    const days = parseInt(val);
    setFormData(prev => ({ ...prev, suspendDuration: days > 0 ? days : null }));
  };

  const handleSubmitClick = () => {
    if (!formData.actionTaken || !formData.verdict) {
      setValidationError("Mohon isi Tindakan dan Putusan / Alasan terlebih dahulu.");
      return;
    }
    if (formData.actionTaken === "SUSPEND_COMMENTER" && !formData.suspendDuration) {
      setValidationError("Mohon tentukan durasi suspend terlebih dahulu.");
      return;
    }
    setValidationError("");
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      // 1. Mark as in review jika masih PENDING
      if (report.status === "PENDING") {
        await fetch(`${backendUrl}/api/report-comment-management/${report.id}/review`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // 2. Ambil tindakan
      const res = await fetch(
        `${backendUrl}/api/report-comment-management/${report.id}/action`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            actionTaken: formData.actionTaken,
            suspendDuration: formData.suspendDuration,
            verdict: formData.verdict,
            adminNotes: formData.adminNotes,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal mengambil tindakan");
      }

      toastNotify("Tindakan berhasil diambil dan laporan telah diperbarui.", "success");
      onActionSuccess?.();
      handleClose();
    } catch (err) {
      toastNotify("Gagal mengambil tindakan: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionLabel = ACTION_LABEL[formData.actionTaken]?.label || formData.actionTaken;
  const isDestructive = ["BAN_PERMANENT", "DELETE_COMMENT", "SUSPEND_COMMENTER"].includes(formData.actionTaken);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8 transition-opacity duration-200 ${modalVisible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden transition-all duration-200 ${modalVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">Detail Laporan Komentar</h3>
                <p className="text-xs text-gray-400 leading-tight mt-0.5">ID: <span className="font-mono">{report.id?.slice(0, 12)}...</span></p>
              </div>
            </div>
            <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

            {/* Komentar yang dilaporkan */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Komentar yang Dilaporkan</p>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                    {commenter?.profileName?.[0]?.toUpperCase() || commenter?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      {commenter?.profileName || commenter?.username || "Pengguna tidak diketahui"}
                    </p>
                    <p className="text-xs text-gray-400">{commenter?.email || ""}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {comment?.message || <span className="italic text-gray-400">Komentar tidak tersedia</span>}
                </p>
                <p className="text-xs text-gray-400 mt-2">{formatDateTime(comment?.createdAt)}</p>
              </div>
            </div>

            {/* Pelapor */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Dilaporkan oleh</p>
              <p className="text-sm text-gray-800 font-medium">
                {report.isAnonymous ? "Anonim" : (reporter?.email || report.email || "Tidak diketahui")}
              </p>
            </div>

            {/* Kategori */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Kategori Pelanggaran</p>
              <CategoryBadge category={report.category} />
            </div>

            {/* Alasan laporan */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Alasan Laporan</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3 border border-gray-100">
                {report.reportDetail || <span className="italic text-gray-400">Tidak ada detail</span>}
              </p>
            </div>

            {/* Evidence */}
            {report.evidenceUrl?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Bukti Lampiran</p>
                <div className="grid grid-cols-2 gap-2">
                  {report.evidenceUrl.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="block rounded-xl overflow-hidden border border-gray-200 hover:border-[#1297DC] transition">
                      <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-28 object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Waktu */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Waktu Laporan</p>
              <p className="text-sm text-gray-700">{formatDateTime(report.createdAt)}</p>
            </div>

            {/* === HASIL TINDAKAN (jika sudah diproses) === */}
            {isProcessed && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Hasil Tindakan</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 font-medium">Tindakan:</p>
                  <ActionTakenBadge action={report.actionTaken} />
                </div>
                {report.actionDetail && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Detail:</p>
                    <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-green-100">{report.actionDetail}</p>
                  </div>
                )}
                {report.verdict && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Putusan:</p>
                    <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-green-100">{report.verdict}</p>
                  </div>
                )}
                {report.adminNotes && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Catatan Admin:</p>
                    <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-green-100">{report.adminNotes}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  Ditinjau oleh: <strong>{report.reviewedBy}</strong> · {formatDateTime(report.reviewedAt)}
                </p>
              </div>
            )}

            {/* === FORM AKSI (jika belum diproses) === */}
            {!isProcessed && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Ambil Tindakan</p>
                </div>

                {/* Validation error banner */}
                <ValidationBanner message={validationError} onClose={() => setValidationError("")} />

                {/* Pilih tindakan */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Tindakan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.actionTaken}
                    onChange={(e) => handleActionChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1297DC] bg-white"
                  >
                    <option value="">Pilih Tindakan</option>
                    <option value="BAN_PERMANENT">Ban Akun Permanen</option>
                    <option value="SUSPEND_COMMENTER">Suspend Akun Pembuat Komentar</option>
                    <option value="DELETE_COMMENT">Hapus Komentar</option>
                    <option value="WARNING">Peringatan</option>
                    <option value="DISMISS">Lolos (Tidak Ada Tindakan)</option>
                  </select>

                  {formData.actionTaken === "SUSPEND_COMMENTER" && (
                    <div className="mt-3 bg-white border border-blue-200 rounded-lg p-3">
                      <label className="block text-xs font-semibold text-blue-800 mb-1.5">
                        Durasi Suspend (hari) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={suspendDays}
                        onChange={(e) => handleSuspendDaysChange(e.target.value)}
                        placeholder="Contoh: 7"
                        className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                      {formData.suspendDuration && (
                        <p className="text-xs text-blue-700 font-medium mt-1.5">
                          Akan di-suspend selama {formData.suspendDuration} hari
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Putusan */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Putusan / Alasan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.verdict}
                    onChange={(e) => { setFormData(p => ({ ...p, verdict: e.target.value })); setValidationError(""); }}
                    placeholder="Masukkan putusan terkait laporan ini..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1297DC] resize-none bg-white"
                  />
                </div>

                {/* Catatan admin */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Catatan Admin (opsional)</label>
                  <textarea
                    value={formData.adminNotes}
                    onChange={(e) => setFormData(p => ({ ...p, adminNotes: e.target.value }))}
                    placeholder="Catatan internal..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1297DC] resize-none bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition"
            >
              {isProcessed ? "Tutup" : "Batal"}
            </button>
            {!isProcessed && (
              <button
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#1297DC] text-white text-sm font-semibold hover:bg-[#0e7ab8] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    Kirim Tindakan
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
        isDestructive={isDestructive}
        isLoading={isSubmitting}
        title="Konfirmasi Tindakan"
        message={
          formData.actionTaken === "BAN_PERMANENT"
            ? "Anda akan melakukan ban permanen terhadap akun ini. Tindakan ini tidak dapat dibatalkan."
            : formData.actionTaken === "SUSPEND_COMMENTER"
            ? `Anda akan suspend akun pembuat komentar ini selama ${formData.suspendDuration} hari. Apakah Anda yakin?`
            : formData.actionTaken === "DELETE_COMMENT"
            ? "Komentar ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
            : `Anda akan mengambil tindakan "${actionLabel}" terhadap laporan ini. Apakah Anda yakin?`
        }
        confirmLabel={isDestructive ? "Ya, Lanjutkan" : "Konfirmasi"}
      />
    </>
  );
}

// ============================================================
// CONTENT TYPE LABEL
// ============================================================
const CONTENT_TYPE_LABEL = {
  Film: "Film", Series: "Series", Ebook: "E-Book", Comic: "Comic", Podcast: "Podcast",
};

// ============================================================
// SUMMARY CARD
// ============================================================
function SummaryCard({ label, value, color, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
      {icon && (
        <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className={`text-3xl font-bold leading-none ${color}`}>{value}</p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function CommentReportsPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();

  const contentId   = params?.contentId;
  const contentType = searchParams?.get("type") || "Film";

  const [reports, setReports]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const { toasts, setToasts }               = useToastStore();

  const fetchReports = useCallback(async () => {
    if (!contentId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${backendUrl}/management/content/${contentId}/comment-reports?type=${contentType}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Gagal mengambil data laporan komentar");
      const data = await res.json();
      setReports(data.data || []);
    } catch (err) {
      setError(err.message);
      toastNotify("Gagal memuat data laporan. Silakan coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }, [contentId, contentType]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const pendingCount     = reports.filter((r) => r.status === "PENDING").length;
  const inReviewCount    = reports.filter((r) => r.status === "IN_REVIEW").length;
  const actionTakenCount = reports.filter((r) => r.status === "ACTION_TAKEN").length;
  const dismissedCount   = reports.filter((r) => r.status === "DISMISSED").length;

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} setToasts={setToasts} />

      {selectedReport && (
        <CommentReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onActionSuccess={fetchReports}
        />
      )}

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
          <button onClick={() => router.push("/manajemen-konten/kelola-konten")} className="hover:text-[#1297DC] transition font-medium">
            Kelola Konten
          </button>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="text-gray-600 font-medium">Laporan Komentar</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Laporan Komentar</h1>
            </div>
            <p className="text-gray-500 text-sm">
              {CONTENT_TYPE_LABEL[contentType] || contentType} · ID:{" "}
              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{contentId}</span>
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-[#1297DC] hover:text-[#1297DC] bg-white transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Kembali
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            label="Total Laporan"
            value={reports.length}
            color="text-gray-900"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
          />
          <SummaryCard
            label="Pending"
            value={pendingCount}
            color="text-yellow-600"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
          <SummaryCard
            label="In Review"
            value={inReviewCount}
            color="text-blue-600"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          />
          <SummaryCard
            label="Action Taken"
            value={actionTakenCount}
            color="text-green-600"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          />
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {error ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-red-500 text-sm font-medium mb-3">{error}</p>
            <button
              onClick={fetchReports}
              className="px-4 py-2 text-xs font-semibold text-[#1297DC] border border-[#1297DC] rounded-lg hover:bg-blue-50 transition"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Komentar Dilaporkan</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pembuat Komentar</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Alasan Laporan</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Waktu</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tindakan Diambil</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm font-medium">Tidak ada laporan komentar untuk konten ini</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => {
                  const comment   = report.Comment;
                  const commenter = comment?.user;
                  return (
                    <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      {/* Isi komentar */}
                      <td className="px-6 py-4 max-w-[200px]">
                        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                          {comment?.message || <span className="italic text-gray-300">Komentar tidak tersedia</span>}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{formatDateTime(comment?.createdAt)}</p>
                      </td>

                      {/* Pembuat komentar */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                            {commenter?.profileName?.[0]?.toUpperCase() || commenter?.username?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">
                              {commenter?.profileName || commenter?.username || "Tidak diketahui"}
                            </p>
                            <p className="text-xs text-gray-400">{commenter?.email || ""}</p>
                          </div>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="px-4 py-4">
                        <CategoryBadge category={report.category} />
                      </td>

                      {/* Alasan laporan */}
                      <td className="px-4 py-4 max-w-[180px]">
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {report.reportDetail || <span className="italic text-gray-300">Tidak ada detail</span>}
                        </p>
                      </td>

                      {/* Waktu */}
                      <td className="px-4 py-4">
                        <p className="text-xs text-gray-500 whitespace-nowrap">{formatDateTime(report.createdAt)}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <ReportStatusBadge status={report.status} />
                      </td>

                      {/* Tindakan diambil */}
                      <td className="px-4 py-4 text-center">
                        <ActionTakenBadge action={report.actionTaken} />
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                            report.status === "ACTION_TAKEN" || report.status === "DISMISSED"
                              ? "text-gray-500 border border-gray-200 hover:bg-gray-50"
                              : "text-[#1297DC] border border-[#1297DC] hover:bg-[#1297DC] hover:text-white"
                          }`}
                        >
                          {report.status === "ACTION_TAKEN" || report.status === "DISMISSED"
                            ? "Lihat Detail"
                            : "Tindak Lanjut"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Total <strong className="text-gray-600">{reports.length}</strong> laporan · <strong className="text-yellow-600">{pendingCount}</strong> pending · <strong className="text-green-600">{actionTakenCount}</strong> action taken · <strong className="text-gray-500">{dismissedCount}</strong> dismissed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}