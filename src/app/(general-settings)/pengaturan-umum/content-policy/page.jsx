"use client";

import React, { useState, useEffect, useCallback } from "react";
import backendUrl from "@/const/backendUrl";
const API_URL = backendUrl;

// ============================================================
// API HELPERS
// ============================================================
function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

// ============================================================
// CONSTANTS
// ============================================================
const ACTION_LABELS = { CENSOR: "Sensor", BLOCK: "Blokir" };
const SCOPE_LABELS = {
  ALL: "Semua",
  COMMENT: "Komentar",
  REPLY_COMMENT: "Balasan",
  TITLE: "Judul Konten",
  DESCRIPTION: "Deskripsi",
};

const ACTION_BADGE = {
  CENSOR: { label: "Sensor", className: "border border-yellow-400 text-yellow-700 bg-yellow-50" },
  BLOCK: { label: "Blokir", className: "border border-red-400 text-red-600 bg-red-50" },
};

// Prohibited Content Categories — mapping ke ReportCategory di DB
const PROHIBITED_CATEGORIES = [
  {
    id: "nudity",
    title: "Nudity & Sexual Content",
    reportKey: "INAPPROPRIATE_CONTENT",
    defaultStatus: "BLOCKED",
  },
  {
    id: "violence",
    title: "Violence & Gore",
    reportKey: "INAPPROPRIATE_CONTENT",
    defaultStatus: "RESTRICTED",
  },
  {
    id: "hate_speech",
    title: "Hate Speech",
    reportKey: "HATE_SPEECH",
    defaultStatus: "BLOCKED",
  },
  {
    id: "harassment",
    title: "Harassment & Bullying",
    reportKey: "HATE_SPEECH",
    defaultStatus: "BLOCKED",
  },
  {
    id: "misinformation",
    title: "Misinformation",
    reportKey: "OTHER",
    defaultStatus: "REVIEW_REQUIRED",
  },
  {
    id: "copyright",
    title: "Copyright Infringement",
    reportKey: "COPYRIGHT_INFRINGEMENT",
    defaultStatus: "BLOCKED",
  },
  {
    id: "spam",
    title: "Spam & Scams",
    reportKey: "SPAM",
    defaultStatus: "BLOCKED",
  },
  {
    id: "self_harm",
    title: "Self-harm",
    reportKey: "OTHER",
    defaultStatus: "BLOCKED",
  },
];

const STATUS_BADGE = {
  BLOCKED: { label: "Blocked", className: "bg-red-100 text-red-600 border border-red-200" },
  RESTRICTED: { label: "Restricted", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
  REVIEW_REQUIRED: { label: "Review Required", className: "bg-blue-100 text-blue-700 border border-blue-200" },
};

// ============================================================
// ICONS
// ============================================================
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
  </svg>
);
const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h18M7 10h10M11 16h2" />
  </svg>
);
const UploadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M12 12V4M8 8l4-4 4 4" />
  </svg>
);
const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M12 4v12M8 12l4 4 4-4" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
  </svg>
);
const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const AlertTriangleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const KeyIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 0 1 2 2m4 0a6 6 0 0 1-7.743 5.743L11 17H9v2H7v2H4a1 1 0 0 1-1-1v-2.586a1 1 0 0 1 .293-.707l5.964-5.964A6 6 0 1 1 21 9z" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  </svg>
);
const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

// ============================================================
// TOGGLE COMPONENT
// ============================================================
function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors duration-200 ${
        checked ? "bg-green-500" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function PengaturanKontenPage() {
  // --------------- Tab State ---------------
  const [activeTab, setActiveTab] = useState("guidelines");

  // --------------- Modal State ---------------
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // --------------- Forbidden Words State ---------------
  const [words, setWords] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterScope, setFilterScope] = useState("");

  // --------------- Form Tambah Kata ---------------
  const [newWord, setNewWord] = useState("");
  const [newAction, setNewAction] = useState("CENSOR");
  const [newScope, setNewScope] = useState("ALL");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // --------------- Edit State ---------------
  const [editingWord, setEditingWord] = useState(null);
  const [editData, setEditData] = useState({ word: "", action: "CENSOR", scope: "ALL" });

  // --------------- Bulk Input ---------------
  const [bulkInput, setBulkInput] = useState("");
  const [bulkAction, setBulkAction] = useState("CENSOR");
  const [bulkScope, setBulkScope] = useState("ALL");
  const [isBulkAdding, setIsBulkAdding] = useState(false);

  // --------------- Toast ---------------
  const [toast, setToast] = useState(null);

  // --------------- Guidelines Settings ---------------
  const [settings, setSettings] = useState({
    autoModeration: true,
    ageVerification: true,
    allowProfanity: false,
    appealProcess: true,
    maxStrikesBan: 3,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // --------------- Category Status State ---------------
  // Menyimpan status per kategori: { [categoryId]: "BLOCKED" | "RESTRICTED" | "REVIEW_REQUIRED" }
  const [categoryStatus, setCategoryStatus] = useState(() => {
    const init = {};
    PROHIBITED_CATEGORIES.forEach((c) => { init[c.id] = c.defaultStatus; });
    return init;
  });

  // --------------- Edit Category Modal State ---------------
  const [editCategoryStatus, setEditCategoryStatus] = useState("BLOCKED");

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ============================================================
  // FETCH MODERATION SETTINGS
  // ============================================================
  const fetchSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const res = await apiFetch("/management/moderation/settings");
      if (res.success && res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      // Jika endpoint belum ada / error, pakai default — tidak perlu toast
      console.warn("Could not load moderation settings:", err.message);
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "guidelines") fetchSettings();
  }, [activeTab]);

  // ============================================================
  // SAVE GUIDELINES SETTINGS
  // ============================================================
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await apiFetch("/management/moderation/settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      showToast("Guidelines berhasil disimpan");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // ============================================================
  // FETCH FORBIDDEN WORDS
  // ============================================================
  const fetchWords = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...(searchQuery && { search: searchQuery }),
        ...(filterAction && { action: filterAction }),
        ...(filterScope && { scope: filterScope }),
      });
      const res = await apiFetch(`/management/moderation/forbidden-words?${params}`);
      setWords(res.data || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterAction, filterScope, pagination.limit]);

  useEffect(() => {
    if (activeTab === "banned") fetchWords(1);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "banned") return;
    const timer = setTimeout(() => fetchWords(1), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, filterAction, filterScope]);

  // ============================================================
  // ADD WORD
  // ============================================================
  const handleAddWord = async () => {
    if (!newWord.trim()) { setAddError("Kata tidak boleh kosong"); return; }
    setAddError("");
    setIsAdding(true);
    try {
      await apiFetch("/management/moderation/forbidden-words", {
        method: "POST",
        body: JSON.stringify({ word: newWord.trim(), action: newAction, scope: newScope }),
      });
      setNewWord("");
      setShowAddModal(false);
      showToast(`Kata "${newWord.trim()}" berhasil ditambahkan`);
      fetchWords(1);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsAdding(false);
    }
  };

  // ============================================================
  // BULK ADD
  // ============================================================
  const handleBulkAdd = async () => {
    const lines = bulkInput.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    setIsBulkAdding(true);
    try {
      const wordsPayload = lines.map((word) => ({ word, action: bulkAction, scope: bulkScope }));
      const res = await apiFetch("/management/moderation/forbidden-words/bulk", {
        method: "POST",
        body: JSON.stringify({ words: wordsPayload }),
      });
      showToast(res.message);
      setBulkInput("");
      setShowBulkModal(false);
      fetchWords(1);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsBulkAdding(false);
    }
  };

  // ============================================================
  // TOGGLE ACTIVE
  // ============================================================
  const handleToggleActive = async (id, currentStatus) => {
    try {
      await apiFetch(`/management/moderation/forbidden-words/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      showToast(!currentStatus ? "Kata diaktifkan" : "Kata dinonaktifkan");
      if (editingWord && editingWord.id === id) {
        setEditingWord((prev) => ({ ...prev, isActive: !currentStatus }));
      }
      fetchWords(pagination.page);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // ============================================================
  // DELETE WORD
  // ============================================================
  const handleDeleteWord = async (id, word) => {
    if (!confirm(`Hapus kata "${word}"?`)) return;
    try {
      await apiFetch(`/management/moderation/forbidden-words/${id}`, { method: "DELETE" });
      showToast(`Kata "${word}" berhasil dihapus`);
      fetchWords(pagination.page);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // ============================================================
  // EDIT WORD
  // ============================================================
  const startEdit = (fw) => {
    setEditingWord(fw);
    setEditData({ word: fw.word, action: fw.action, scope: fw.scope });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    try {
      await apiFetch(`/management/moderation/forbidden-words/${editingWord.id}`, {
        method: "PATCH",
        body: JSON.stringify(editData),
      });
      showToast("Kata berhasil diperbarui");
      setShowEditModal(false);
      setEditingWord(null);
      fetchWords(pagination.page);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // ============================================================
  // EDIT CATEGORY STATUS
  // ============================================================
  const startEditCategory = (cat) => {
    setEditingCategory(cat);
    setEditCategoryStatus(categoryStatus[cat.id]);
    setShowEditCategoryModal(true);
  };

  const saveEditCategory = () => {
    setCategoryStatus((prev) => ({ ...prev, [editingCategory.id]: editCategoryStatus }));
    setShowEditCategoryModal(false);
    setEditingCategory(null);
    showToast(`Status "${editingCategory.title}" berhasil diperbarui`);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[200] px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.message}
        </div>
      )}

      {/* ── Header Banner ── */}
      <div
        className="w-full px-8 py-7 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #e11d48 0%, #be123c 60%, #9f1239 100%)" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Content Policy & Moderation</h1>
          <p className="text-red-200 text-sm mt-1">Content guidelines, banned words, and moderation rules</p>
        </div>
        <div className="opacity-70 text-white">
          <KeyIcon />
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="bg-white border-b border-gray-200 px-8 flex">
        <button
          onClick={() => setActiveTab("guidelines")}
          className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "guidelines"
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <ShieldIcon />
          Content Guidelines
        </button>
        <button
          onClick={() => setActiveTab("banned")}
          className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "banned"
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <AlertTriangleIcon />
          Banned Words Filter
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════
          TAB: CONTENT GUIDELINES
      ════════════════════════════════════════════════════════ */}
      {activeTab === "guidelines" && (
        <div className="px-8 py-6 space-y-6">

          {/* ── Prohibited Content Categories ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Prohibited Content Categories</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {PROHIBITED_CATEGORIES.map((cat) => {
                const status = categoryStatus[cat.id];
                const badge = STATUS_BADGE[status] || STATUS_BADGE.BLOCKED;
                return (
                  <div key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{cat.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                      <button
                        onClick={() => startEditCategory(cat)}
                        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                        title="Edit status"
                      >
                        <EditIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 4 Toggle Options ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">

              {/* Auto Moderation */}
              <div className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Auto Moderation</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Automatically flag suspicious content
                    </p>
                    <p className="text-xs text-gray-400 mt-1 italic">
                      Fitur lanjutan — deteksi otomatis konten mencurigakan menggunakan AI akan segera tersedia.
                    </p>
                  </div>
                  <Toggle
                    checked={settings.autoModeration}
                    onChange={(val) => setSettings((prev) => ({ ...prev, autoModeration: val }))}
                    disabled={isLoadingSettings}
                  />
                </div>
              </div>

              {/* Age Verification Required */}
              <div className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Age Verification Required</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Require age verification for mature content
                    </p>
                    <p className="text-xs text-gray-400 mt-1 italic">
                      {settings.ageVerification
                        ? "ON — user yang belum mengisi tanggal lahir tidak dapat mengakses konten 17+ dan 21+."
                        : "OFF — semua user dapat mengakses konten dewasa tanpa verifikasi umur."}
                    </p>
                  </div>
                  <Toggle
                    checked={settings.ageVerification}
                    onChange={(val) => setSettings((prev) => ({ ...prev, ageVerification: val }))}
                    disabled={isLoadingSettings}
                  />
                </div>
              </div>

            </div>

            <div className="border-t border-gray-100" />

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">

              {/* Allow Profanity */}
              <div className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Allow Profanity</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Allow mild profanity in content
                    </p>
                    <p className="text-xs text-gray-400 mt-1 italic">
                      {settings.allowProfanity
                        ? "ON — kata kasar ringan (contoh: \"anjing\", \"shit\") dapat lolos filter."
                        : "OFF — semua kata kasar dianggap violation dan akan diblokir/disensor."}
                    </p>
                  </div>
                  <Toggle
                    checked={settings.allowProfanity}
                    onChange={(val) => setSettings((prev) => ({ ...prev, allowProfanity: val }))}
                    disabled={isLoadingSettings}
                  />
                </div>
              </div>

              {/* Enable Appeal Process */}
              <div className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Enable Appeal Process</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Allow creators to appeal violations
                    </p>
                    <p className="text-xs text-gray-400 mt-1 italic">
                      Fitur lanjutan — creator dapat mengajukan banding atas konten yang dihapus/diblokir. Segera tersedia.
                    </p>
                  </div>
                  <Toggle
                    checked={settings.appealProcess}
                    onChange={(val) => setSettings((prev) => ({ ...prev, appealProcess: val }))}
                    disabled={isLoadingSettings}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ── Max Strikes + Save ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
            <div className="flex items-end justify-between gap-6">
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Max Strikes Before Ban
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={settings.maxStrikesBan}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, maxStrikesBan: parseInt(e.target.value) || 1 }))
                  }
                  disabled={isLoadingSettings}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings || isLoadingSettings}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm text-white font-semibold disabled:opacity-50 transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
              >
                <SaveIcon />
                {isSavingSettings ? "Menyimpan..." : "Save Guidelines"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB: BANNED WORDS FILTER
      ════════════════════════════════════════════════════════ */}
      {activeTab === "banned" && (
        <div className="px-8 py-6 space-y-4">

          {/* ── Toolbar ── */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex-1 min-w-[200px] shadow-sm">
              <span className="text-gray-400"><SearchIcon /></span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search banned words..."
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 shadow-sm transition"
            >
              <FilterIcon />
              Filter
            </button>

            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 shadow-sm transition"
            >
              <UploadIcon />
              Bulk Import
            </button>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 shadow-sm transition">
              <DownloadIcon />
              Export
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm text-white font-semibold shadow-sm transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}
            >
              + Add Word
            </button>
          </div>

          {/* ── Info Banner ── */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex gap-3 items-start">
            <span className="text-blue-500 flex-shrink-0 mt-0.5"><InfoIcon /></span>
            <div>
              <p className="text-blue-700 font-semibold text-sm">About Banned Words Filter</p>
              <p className="text-blue-600 text-xs mt-0.5 leading-relaxed">
                Words added here will be automatically detected and flagged in all content. You can set severity levels to determine the action taken (warn, review, or auto-block).
              </p>
            </div>
          </div>

          {/* ── Words Table ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-gray-400 text-sm">Memuat data...</div>
            ) : words.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">Belum ada kata terlarang</div>
            ) : (
              <>
                <div className="grid gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 80px" }}>
                  <span>Word/Phrase</span>
                  <span>Category</span>
                  <span>Aksi</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {words.map((fw) => {
                    const badge = ACTION_BADGE[fw.action] || ACTION_BADGE.CENSOR;
                    return (
                      <div
                        key={fw.id}
                        className={`grid gap-4 px-6 py-4 items-center hover:bg-gray-50 transition ${!fw.isActive ? "opacity-50" : ""}`}
                        style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 80px" }}
                      >
                        <span className="font-semibold text-gray-900 text-sm">{fw.word}</span>
                        <span className="text-sm text-gray-500">{SCOPE_LABELS[fw.scope] || fw.scope}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold w-fit ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold w-fit ${fw.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {fw.isActive ? "Active" : "Inactive"}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(fw)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteWord(fw.id, fw.word)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Hapus"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ── Pagination ── */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} kata)
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => fetchWords(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                >← Prev</button>
                <button
                  onClick={() => fetchWords(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                >Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL — EDIT CATEGORY STATUS
      ════════════════════════════════════════════════════════ */}
      {showEditCategoryModal && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-base font-bold text-gray-900">Edit Category Status</h2>
              <button
                onClick={() => { setShowEditCategoryModal(false); setEditingCategory(null); }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 font-medium">{editingCategory.title}</p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={editCategoryStatus}
                  onChange={(e) => setEditCategoryStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="BLOCKED">Blocked</option>
                  <option value="RESTRICTED">Restricted</option>
                  <option value="REVIEW_REQUIRED">Review Required</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setShowEditCategoryModal(false); setEditingCategory(null); }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={saveEditCategory}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white font-semibold transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL — ADD WORD
      ════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Tambah Kata Terlarang</h2>
              <button
                onClick={() => { setShowAddModal(false); setNewWord(""); setAddError(""); }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kata / Frasa</label>
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => { setNewWord(e.target.value); setAddError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                  placeholder="Ketik kata atau frasa..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none"
                />
                {addError && <p className="text-red-500 text-xs mt-1">{addError}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Aksi</label>
                <select
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="CENSOR">Sensor (*****)</option>
                  <option value="BLOCK">Blokir (Ganti pesan)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Scope</label>
                <select
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="ALL">Semua</option>
                  <option value="COMMENT">Komentar</option>
                  <option value="REPLY_COMMENT">Balasan</option>
                  <option value="TITLE">Judul Konten</option>
                  <option value="DESCRIPTION">Deskripsi</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setShowAddModal(false); setNewWord(""); setAddError(""); }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddWord}
                  disabled={isAdding}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white font-semibold disabled:opacity-50 transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}
                >
                  {isAdding ? "Menambahkan..." : "+ Tambah Kata"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL — BULK IMPORT
      ════════════════════════════════════════════════════════ */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Bulk Import Kata Terlarang</h2>
              <button
                onClick={() => { setShowBulkModal(false); setBulkInput(""); }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500">Masukkan satu kata per baris:</p>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                rows={6}
                placeholder={"kata1\nkata2\nkata3"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 font-mono outline-none"
              />
              <div className="flex gap-3">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none"
                >
                  <option value="CENSOR">Sensor</option>
                  <option value="BLOCK">Blokir</option>
                </select>
                <select
                  value={bulkScope}
                  onChange={(e) => setBulkScope(e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none"
                >
                  <option value="ALL">Semua</option>
                  <option value="COMMENT">Komentar</option>
                  <option value="REPLY_COMMENT">Balasan</option>
                  <option value="TITLE">Judul</option>
                  <option value="DESCRIPTION">Deskripsi</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setShowBulkModal(false); setBulkInput(""); }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleBulkAdd}
                  disabled={isBulkAdding || !bulkInput.trim()}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white font-semibold disabled:opacity-50 transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}
                >
                  {isBulkAdding ? "Memproses..." : "Import Sekarang"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL — FILTER
      ════════════════════════════════════════════════════════ */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Filter</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Aksi</label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none"
                >
                  <option value="">Semua Aksi</option>
                  <option value="CENSOR">Sensor</option>
                  <option value="BLOCK">Blokir</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Scope</label>
                <select
                  value={filterScope}
                  onChange={(e) => setFilterScope(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none"
                >
                  <option value="">Semua Scope</option>
                  <option value="ALL">All</option>
                  <option value="COMMENT">Komentar</option>
                  <option value="REPLY_COMMENT">Balasan</option>
                  <option value="TITLE">Judul</option>
                  <option value="DESCRIPTION">Deskripsi</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setFilterAction(""); setFilterScope(""); setShowFilterModal(false); }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white font-semibold transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL — EDIT WORD
      ════════════════════════════════════════════════════════ */}
      {showEditModal && editingWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Edit Kata Terlarang</h2>
              <button
                onClick={() => { setShowEditModal(false); setEditingWord(null); }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kata / Frasa</label>
                <input
                  type="text"
                  value={editData.word}
                  onChange={(e) => setEditData({ ...editData, word: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Aksi</label>
                <select
                  value={editData.action}
                  onChange={(e) => setEditData({ ...editData, action: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none"
                >
                  <option value="CENSOR">Sensor (*****)</option>
                  <option value="BLOCK">Blokir (Ganti pesan)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Scope</label>
                <select
                  value={editData.scope}
                  onChange={(e) => setEditData({ ...editData, scope: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none"
                >
                  <option value="ALL">Semua</option>
                  <option value="COMMENT">Komentar</option>
                  <option value="REPLY_COMMENT">Balasan</option>
                  <option value="TITLE">Judul Konten</option>
                  <option value="DESCRIPTION">Deskripsi</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-gray-100 pt-3">
                <div>
                  <span className="text-sm text-gray-700 font-medium">Status Aktif</span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editingWord.isActive
                      ? "Kata ini sedang aktif dan akan memfilter konten"
                      : "Kata ini nonaktif dan tidak akan memfilter konten"}
                  </p>
                </div>
                <Toggle
                  checked={editingWord.isActive}
                  onChange={() => handleToggleActive(editingWord.id, editingWord.isActive)}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setShowEditModal(false); setEditingWord(null); }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white font-semibold transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}