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
const ACTION_COLORS = {
  CENSOR: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  BLOCK: "bg-red-100 text-red-800 border border-red-300",
};

// ============================================================
// MAIN PAGE
// ============================================================
export default function PengaturanKontenPage() {
  // --------------- Kebijakan Konten ---------------
  const [autoApprove, setAutoApprove] = useState(true);

  // --------------- Modal State ---------------
  const [showBannedWordsModal, setShowBannedWordsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);

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
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ word: "", action: "CENSOR", scope: "ALL" });

  // --------------- Bulk Input ---------------
  const [bulkInput, setBulkInput] = useState("");
  const [bulkAction, setBulkAction] = useState("CENSOR");
  const [bulkScope, setBulkScope] = useState("ALL");
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);

  // --------------- Check Text ---------------
  const [checkText, setCheckText] = useState("");
  const [checkScope, setCheckScope] = useState("COMMENT");
  const [checkResult, setCheckResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // --------------- Toast ---------------
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

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
    if (showBannedWordsModal) {
      fetchWords(1);
    }
  }, [showBannedWordsModal, fetchWords]);

  // Debounce search
  useEffect(() => {
    if (!showBannedWordsModal) return;
    const timer = setTimeout(() => fetchWords(1), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, filterAction, filterScope]);

  // ============================================================
  // ADD WORD
  // ============================================================
  const handleAddWord = async () => {
    if (!newWord.trim()) {
      setAddError("Kata tidak boleh kosong");
      return;
    }
    setAddError("");
    setIsAdding(true);
    try {
      await apiFetch("/management/moderation/forbidden-words", {
        method: "POST",
        body: JSON.stringify({ word: newWord.trim(), action: newAction, scope: newScope }),
      });
      setNewWord("");
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
      setShowBulkForm(false);
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
    setEditingId(fw.id);
    setEditData({ word: fw.word, action: fw.action, scope: fw.scope });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ word: "", action: "CENSOR", scope: "ALL" });
  };

  const saveEdit = async (id) => {
    try {
      await apiFetch(`/management/moderation/forbidden-words/${id}`, {
        method: "PATCH",
        body: JSON.stringify(editData),
      });
      showToast("Kata berhasil diperbarui");
      cancelEdit();
      fetchWords(pagination.page);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // ============================================================
  // CHECK TEXT
  // ============================================================
  const handleCheckText = async () => {
    if (!checkText.trim()) return;
    setIsChecking(true);
    setCheckResult(null);
    try {
      const res = await apiFetch("/management/moderation/forbidden-words/check/text", {
        method: "POST",
        body: JSON.stringify({ text: checkText, scope: checkScope }),
      });
      setCheckResult(res.data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsChecking(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-white">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
            toast.type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="w-full px-6 py-8 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Konten</h1>
          <p className="text-gray-600 mt-2">Halaman untuk mengatur kebijakan dan aturan konten</p>
        </div>

        {/* ---- Kebijakan Konten ---- */}
        <div className="bg-gray-200 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Kebijakan Konten</h2>

          <div className="flex justify-between items-center bg-white rounded-lg px-5 py-4 shadow-sm">
            <span className="text-gray-900 font-normal">Auto-approve konten dari kreator terverifikasi</span>
            <button
              onClick={() => setAutoApprove(!autoApprove)}
              className={`w-12 h-6 rounded-full flex items-center px-0.5 transition-colors ${autoApprove ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${autoApprove ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>

          <div className="flex justify-between items-center bg-gray-300 rounded-lg px-5 py-4 opacity-60">
            <span className="text-gray-500 font-normal">Moderasi konten sensitif</span>
            <div className="w-12 h-6 rounded-full flex items-center px-0.5 bg-gray-400 cursor-not-allowed">
              <span className="w-5 h-5 bg-white rounded-full shadow" />
            </div>
          </div>

          <div className="flex justify-between items-center bg-gray-300 rounded-lg px-5 py-4 opacity-60">
            <span className="text-gray-500 font-normal">Deteksi otomatis spam</span>
            <div className="w-12 h-6 rounded-full flex items-center px-0.5 bg-gray-400 cursor-not-allowed">
              <span className="w-5 h-5 bg-white rounded-full shadow" />
            </div>
          </div>
        </div>

        {/* ---- Filter Konten ---- */}
        <div className="bg-gray-200 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Filter Konten</h2>

          {/* Kelola Kata Terlarang */}
          <div
            className="bg-white rounded-lg px-5 py-4 cursor-pointer hover:bg-gray-50 transition shadow-sm"
            onClick={() => setShowBannedWordsModal(true)}
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-normal">Kelola Kata Terlarang</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Test Moderasi */}
          <div
            className="bg-white rounded-lg px-5 py-4 cursor-pointer hover:bg-gray-50 transition shadow-sm"
            onClick={() => setShowCheckModal(true)}
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-normal">Test Moderasi Teks</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Atur Rating */}
          <div
            className="bg-white rounded-lg px-5 py-4 cursor-pointer hover:bg-gray-50 transition shadow-sm"
            onClick={() => setShowRatingModal(true)}
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-normal">Atur Rating Konten</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <button className="px-8 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition">
            Batal
          </button>
          <button className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-sm">
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* ================================================================
          MODAL - KELOLA KATA TERLARANG
      ================================================================ */}
      {showBannedWordsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Kelola Kata Terlarang</h2>
                <p className="text-sm text-gray-500 mt-0.5">Total: {pagination.total} kata</p>
              </div>
              <button
                onClick={() => { setShowBannedWordsModal(false); setShowBulkForm(false); cancelEdit(); }}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Form Tambah Kata */}
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-3">Tambah Kata Terlarang</h3>
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => { setNewWord(e.target.value); setAddError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                    placeholder="Ketik kata..."
                    className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CENSOR">Sensor (*****)</option>
                    <option value="BLOCK">Blokir (Ganti pesan)</option>
                  </select>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Semua</option>
                    <option value="COMMENT">Komentar</option>
                    <option value="REPLY_COMMENT">Balasan</option>
                    <option value="TITLE">Judul Konten</option>
                    <option value="DESCRIPTION">Deskripsi</option>
                  </select>
                  <button
                    onClick={handleAddWord}
                    disabled={isAdding}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {isAdding ? "Menambahkan..." : "+ Tambah"}
                  </button>
                </div>
                {addError && <p className="text-red-500 text-xs mt-2">{addError}</p>}

                {/* Bulk Add Toggle */}
                <button
                  onClick={() => setShowBulkForm(!showBulkForm)}
                  className="mt-3 text-xs text-blue-600 hover:underline"
                >
                  {showBulkForm ? "Sembunyikan" : "Import banyak kata sekaligus (bulk)"}
                </button>

                {showBulkForm && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <p className="text-xs text-gray-500">Masukkan satu kata per baris:</p>
                    <textarea
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      rows={5}
                      placeholder={"kata1\nkata2\nkata3"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="CENSOR">Sensor</option>
                        <option value="BLOCK">Blokir</option>
                      </select>
                      <select
                        value={bulkScope}
                        onChange={(e) => setBulkScope(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="ALL">Semua</option>
                        <option value="COMMENT">Komentar</option>
                        <option value="REPLY_COMMENT">Balasan</option>
                        <option value="TITLE">Judul</option>
                        <option value="DESCRIPTION">Deskripsi</option>
                      </select>
                      <button
                        onClick={handleBulkAdd}
                        disabled={isBulkAdding || !bulkInput.trim()}
                        className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
                      >
                        {isBulkAdding ? "Memproses..." : "Import Sekarang"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter & Search */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kata..."
                    className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Semua Aksi</option>
                    <option value="CENSOR">Sensor</option>
                    <option value="BLOCK">Blokir</option>
                  </select>
                  <select
                    value={filterScope}
                    onChange={(e) => setFilterScope(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Semua Scope</option>
                    <option value="ALL">All</option>
                    <option value="COMMENT">Komentar</option>
                    <option value="REPLY_COMMENT">Balasan</option>
                    <option value="TITLE">Judul</option>
                    <option value="DESCRIPTION">Deskripsi</option>
                  </select>
                </div>
              </div>

              {/* Daftar Kata */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
                ) : words.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">Belum ada kata terlarang</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Kata</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Aksi</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Scope</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-600">Aktif</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-600">Opsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {words.map((fw) => (
                        <tr key={fw.id} className={`hover:bg-gray-50 transition ${!fw.isActive ? "opacity-50" : ""}`}>
                          <td className="px-4 py-3">
                            {editingId === fw.id ? (
                              <input
                                value={editData.word}
                                onChange={(e) => setEditData({ ...editData, word: e.target.value })}
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                              />
                            ) : (
                              <span className="font-mono font-medium text-gray-800">{fw.word}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingId === fw.id ? (
                              <select
                                value={editData.action}
                                onChange={(e) => setEditData({ ...editData, action: e.target.value })}
                                className="border border-gray-300 rounded px-2 py-1 text-xs"
                              >
                                <option value="CENSOR">Sensor</option>
                                <option value="BLOCK">Blokir</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ACTION_COLORS[fw.action]}`}>
                                {ACTION_LABELS[fw.action] || fw.action}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingId === fw.id ? (
                              <select
                                value={editData.scope}
                                onChange={(e) => setEditData({ ...editData, scope: e.target.value })}
                                className="border border-gray-300 rounded px-2 py-1 text-xs"
                              >
                                <option value="ALL">Semua</option>
                                <option value="COMMENT">Komentar</option>
                                <option value="REPLY_COMMENT">Balasan</option>
                                <option value="TITLE">Judul</option>
                                <option value="DESCRIPTION">Deskripsi</option>
                              </select>
                            ) : (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {SCOPE_LABELS[fw.scope] || fw.scope}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleToggleActive(fw.id, fw.isActive)}
                              className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors mx-auto ${fw.isActive ? "bg-green-500" : "bg-gray-300"}`}
                            >
                              <span className={`w-4 h-4 bg-white rounded-full transition-transform shadow ${fw.isActive ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {editingId === fw.id ? (
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => saveEdit(fw.id)}
                                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
                                >
                                  Simpan
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => startEdit(fw)}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteWord(fw.id, fw.word)}
                                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition"
                                >
                                  Hapus
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-gray-500">
                    Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} kata)
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => fetchWords(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => fetchWords(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-gray-700">
                  <span className="font-bold">Catatan:</span> Kata dengan aksi <span className="font-semibold text-yellow-700">Sensor</span> akan diganti dengan tanda bintang (*****). Kata dengan aksi <span className="font-semibold text-red-700">Blokir</span> akan mengganti seluruh komentar dengan pesan standar. Cache diperbarui otomatis setiap 5 menit.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL - TEST MODERASI
      ================================================================ */}
      {showCheckModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Test Moderasi Teks</h2>
              <button
                onClick={() => { setShowCheckModal(false); setCheckResult(null); setCheckText(""); }}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Teks yang ingin diuji</label>
                <textarea
                  value={checkText}
                  onChange={(e) => setCheckText(e.target.value)}
                  rows={3}
                  placeholder="Masukkan teks di sini..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Scope</label>
                <select
                  value={checkScope}
                  onChange={(e) => setCheckScope(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="COMMENT">Komentar</option>
                  <option value="REPLY_COMMENT">Balasan</option>
                  <option value="TITLE">Judul Konten</option>
                  <option value="DESCRIPTION">Deskripsi</option>
                </select>
              </div>
              <button
                onClick={handleCheckText}
                disabled={isChecking || !checkText.trim()}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition text-sm"
              >
                {isChecking ? "Memeriksa..." : "Periksa Teks"}
              </button>

              {checkResult && (
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${checkResult.isBlocked ? "bg-red-100 text-red-700" : checkResult.hasCensored ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                      {checkResult.isBlocked ? "🚫 DIBLOKIR" : checkResult.hasCensored ? "✏️ DISENSOR" : "✅ AMAN"}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Teks Asli</span>
                      <p className="text-gray-800 mt-1">{checkResult.originalText}</p>
                    </div>
                    {checkResult.hasCensored && (
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Hasil Filter</span>
                        <p className="text-gray-800 mt-1">{checkResult.filteredText}</p>
                      </div>
                    )}
                    {checkResult.isBlocked && (
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Kata yang diblokir</span>
                        <p className="text-red-600 mt-1">{checkResult.blockedWords.join(", ")}</p>
                      </div>
                    )}
                    {checkResult.hasCensored && checkResult.censoredWords.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Kata yang disensor</span>
                        <p className="text-yellow-700 mt-1">{checkResult.censoredWords.join(", ")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL - RATING KONTEN (tidak berubah)
      ================================================================ */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-200 border-b border-gray-300 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Detail</h2>
              <button
                onClick={() => setShowRatingModal(false)}
                className="w-8 h-8 rounded-full bg-gray-400 hover:bg-gray-500 flex items-center justify-center transition"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Kategori Pembatasan Usia Konten di Indonesia</h3>
              <div className="bg-white rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-300">
                      <th className="px-6 py-3 text-left font-bold text-gray-900">Kategori</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">Syarat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { cat: "SU (Semua Umur)", items: ["Cocok untuk semua", "Tidak mengandung unsur kekerasan, pornografi, narkoba, atau hal negatif", "Biasanya konten edukatif, hiburan keluarga, atau animasi anak-anak"] },
                      { cat: "13+ (Remaja Awal)", items: ["Dapat diakses oleh usia 13 tahun ke atas", "Bisa mengandung sedikit unsur kekerasan ringan atau tema yang lebih kompleks", "Tidak boleh mengandung unsur seksual, narkoba, atau kekerasan ekstrem"] },
                      { cat: "17+ (Remaja Akhir / Dewasa Muda)", items: ["Dapat diakses oleh usia 17 tahun ke atas", "Bisa mengandung kekerasan, tema sosial kompleks, atau unsur horor", "Tidak boleh ada adegan seksual eksplisit atau konten yang sangat sensitif"] },
                      { cat: "21+ (Dewasa)", items: ["Hanya untuk usia 21 tahun ke atas", "Bisa mengandung unsur kekerasan ekstrem, tema politik yang kompleks, adegan seksual, atau konten eksplisit lainnya", "Biasanya diterapkan untuk film dewasa, dokumenter khusus, atau game dengan tema brutal"] },
                    ].map((row) => (
                      <tr key={row.cat}>
                        <td className="px-6 py-4 align-top font-semibold text-gray-900 whitespace-nowrap">{row.cat}</td>
                        <td className="px-6 py-4">
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {row.items.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowRatingModal(false)} className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}