"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Edit2, Eye, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import {
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getTotalSavings,
  searchContentByType,
} from "@/hooks/api/voucherAPI";

// ── Konstanta opsi ──────────────────────────────────────────────────────────
const CONTENT_TYPE_OPTIONS = [
  { value: "", label: "— Semua Konten (null) —" },
  { value: "EBOOK", label: "Ebook" },
  { value: "COMIC", label: "Comic" },
  { value: "PODCAST", label: "Podcast" },
  { value: "FILM", label: "Film / Movie" },
  { value: "SERIES", label: "Series" },
  { value: "EDUCATION", label: "Education" },
];

const PAYMENT_TYPE_OPTIONS = [
  { value: "", label: "— Semua Pembayaran (null) —" },
  { value: "SUBSCRIPTION", label: "Subscription" },
  { value: "TRANSACTION", label: "Transaction" },
];

// ── Initial form state ───────────────────────────────────────────────────────
const INITIAL_FORM = {
  code: "",
  name: "",
  category: "",
  description: "",
  isActive: true,
  type: "PERCENTAGE",
  value: 0,
  maxDiscount: 0,
  targetUser: "new",
  packageType: "premium",
  usageLimit: 1,
  startDate: "",
  endDate: "",
  // 3 field baru
  contentType: "",     // "" = null = semua
  paymentType: "",     // "" = null = semua
  contentId: "",       // "" = null = semua
  contentIdLabel: "",  // hanya untuk tampilan search
};

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [totalSavings, setTotalSavings] = useState(0);

  const [form, setForm] = useState(INITIAL_FORM);

  // State untuk pencarian konten (contentId)
  const [contentSearchQuery, setContentSearchQuery] = useState("");
  const [contentSearchResults, setContentSearchResults] = useState([]);
  const [contentSearchLoading, setContentSearchLoading] = useState(false);
  const [showContentDropdown, setShowContentDropdown] = useState(false);

  const debouncedContentQuery = useDebounce(contentSearchQuery, 400);

  // ── Fetch konten saat query berubah ────────────────────────────────────────
  useEffect(() => {
    if (!form.contentType || debouncedContentQuery.trim().length < 1) {
      setContentSearchResults([]);
      setShowContentDropdown(false);
      return;
    }

    let cancelled = false;
    setContentSearchLoading(true);

    searchContentByType(form.contentType, debouncedContentQuery).then((results) => {
      if (!cancelled) {
        setContentSearchResults(results);
        setShowContentDropdown(results.length > 0);
        setContentSearchLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [debouncedContentQuery, form.contentType]);

  // ── Reset contentId saat contentType berubah ───────────────────────────────
  const handleContentTypeChange = (e) => {
    const newType = e.target.value;
    setForm((prev) => ({
      ...prev,
      contentType: newType,
      contentId: "",
      contentIdLabel: "",
    }));
    setContentSearchQuery("");
    setContentSearchResults([]);
    setShowContentDropdown(false);
  };

  // ── Pilih konten dari dropdown ─────────────────────────────────────────────
  const handleSelectContent = (item) => {
    setForm((prev) => ({
      ...prev,
      contentId: item.id,
      contentIdLabel: item.label,
    }));
    setContentSearchQuery(item.label);
    setShowContentDropdown(false);
  };

  // ── Clear contentId ────────────────────────────────────────────────────────
  const handleClearContent = () => {
    setForm((prev) => ({ ...prev, contentId: "", contentIdLabel: "" }));
    setContentSearchQuery("");
    setContentSearchResults([]);
    setShowContentDropdown(false);
  };

  // ── Fetch vouchers ─────────────────────────────────────────────────────────
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await getVouchers();
      const vouchersWithMetadata = (response.data || []).map((v) => ({
        ...v,
        name: v.name || `Voucher ${v.code}`,
        category: v.category || "General",
        description: v.description || "",
        targetUser: v.targetUser || "new",
        packageType: v.packageType || "premium",
      }));
      setVouchers(vouchersWithMetadata);
    } catch (err) {
      console.error("Error fetching vouchers:", err);
      alert("Gagal memuat voucher. Pastikan Anda sudah login sebagai Superadmin.");
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalSavingsData = async () => {
    try {
      const response = await getTotalSavings();
      setTotalSavings(response.data || 0);
    } catch (err) {
      console.error("Error fetching total savings:", err);
      setTotalSavings(0);
    }
  };

  useEffect(() => {
    fetchVouchers();
    fetchTotalSavingsData();
  }, []);

  // ── Helper: status badge ───────────────────────────────────────────────────
  const isVoucherActive = (voucher) => {
    const now = new Date();
    return (
      voucher.isActive === true &&
      now >= new Date(voucher.startDate) &&
      now <= new Date(voucher.endDate) &&
      (voucher.usedCount || 0) < voucher.usageLimit
    );
  };

  const stats = {
    totalVouchers: vouchers.length,
    activeVouchers: vouchers.filter((v) => isVoucherActive(v)).length,
    totalUsers: vouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0),
    totalSavings,
  };

  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    if (name === "value" && form.type === "FIXED") {
      const numValue = parseFloat(value);
      if (numValue < 1) newValue = 1;
    }
    if (name === "value" && form.type === "PERCENTAGE") {
      const numValue = parseFloat(value);
      if (numValue < 0) newValue = 0;
      else if (numValue > 100) newValue = 100;
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setForm((prev) => ({ ...prev, type: newType, value: newType === "FIXED" ? 1 : 0 }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      if (!form.code || !form.type || form.value === "" || !form.usageLimit || !form.startDate || !form.endDate) {
        alert("Mohon lengkapi semua field yang wajib diisi (*)");
        return;
      }

      const apiPayload = {
        code: String(form.code).trim().toUpperCase(),
        type: String(form.type),
        value: parseFloat(form.value),
        maxDiscount: parseFloat(form.maxDiscount) || 0,
        usageLimit: parseInt(form.usageLimit, 10),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        isActive: Boolean(form.isActive),
        name: form.name?.trim() || null,
        category: form.category?.trim() || null,
        description: form.description?.trim() || null,
        targetusers: [String(form.targetUser)],
        packagetypes: [String(form.packageType)],
        // 3 field baru — kirim null jika kosong
        contentType: form.contentType || null,
        paymentType: form.paymentType || null,
        contentId: form.contentId || null,
      };

      console.log("📤 Payload yang dikirim:", apiPayload);

      if (editingId) {
        const response = await updateVoucher(editingId, apiPayload);
        console.log("✅ Update response:", response);
        alert("Voucher berhasil diupdate");
      } else {
        const response = await createVoucher(apiPayload);
        console.log("✅ Create response:", response);
        alert("Voucher berhasil ditambahkan");
      }

      await fetchVouchers();
      await fetchTotalSavingsData();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      console.error("❌ Error saving voucher:", err);
      alert(`Gagal menyimpan voucher: ${err.message}`);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = (voucher) => {
    setForm({
      code: voucher.code,
      name: voucher.name || "",
      category: voucher.category || "",
      description: voucher.description || "",
      isActive: voucher.isActive,
      type: voucher.type,
      value: voucher.value,
      maxDiscount: voucher.maxDiscount || 0,
      targetUser: voucher.targetusers?.[0] || "new",
      packageType: voucher.packagetypes?.[0] || "premium",
      usageLimit: voucher.usageLimit,
      startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().split("T")[0] : "",
      endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().split("T")[0] : "",
      // 3 field baru
      contentType: voucher.contentType || "",
      paymentType: voucher.paymentType || "",
      contentId: voucher.contentId || "",
      contentIdLabel: voucher.contentId || "",
    });
    // Isi search input jika ada contentId
    setContentSearchQuery(voucher.contentId || "");
    setEditingId(voucher.id);
    setShowForm(true);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Hapus voucher ini?")) return;
    try {
      await deleteVoucher(id);
      alert("Voucher berhasil dihapus");
      await fetchVouchers();
      await fetchTotalSavingsData();
    } catch (err) {
      console.error("Error deleting voucher:", err);
      alert("Gagal menghapus voucher");
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setContentSearchQuery("");
    setContentSearchResults([]);
    setShowContentDropdown(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  // ── Status badge ───────────────────────────────────────────────────────────
  const getStatusBadge = (voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);

    if (!voucher.isActive) return { label: "Inactive", color: "bg-red-500" };
    if (now < startDate) return { label: "Not Started", color: "bg-yellow-500" };
    if (endDate < now) return { label: "Expired", color: "bg-gray-500" };
    if ((voucher.usedCount || 0) >= voucher.usageLimit) return { label: "Limit Reached", color: "bg-orange-500" };
    return { label: "Active", color: "bg-green-500" };
  };

  // ── Filter vouchers ────────────────────────────────────────────────────────
  const filteredVouchers = vouchers.filter((v) => {
    const matchSearch =
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase()));
    let matchFilter = true;
    if (filterStatus === "active") matchFilter = v.isActive === true;
    else if (filterStatus === "inactive") matchFilter = v.isActive === false;
    return matchSearch && matchFilter;
  });

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data voucher...</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Total Voucher</div>
            <div className="text-4xl font-bold text-blue-600">{stats.totalVouchers}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Active Vouchers</div>
            <div className="text-4xl font-bold text-green-600">{stats.activeVouchers}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Total Users</div>
            <div className="text-4xl font-bold text-purple-600">{stats.totalUsers}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">User Savings</div>
            <div className="text-2xl font-bold text-red-500">
              Rp {stats.totalSavings.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Kelola Voucher</h1>
              <p className="text-gray-500 text-sm">Mengelola voucher diskon dan kode promo</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap"
              >
                <span className="text-lg">✏️</span>
                Tambah Voucher Baru
              </button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Code or Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Filters</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* ── Form Modal ───────────────────────────────────────────────────── */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingId ? "Edit Voucher" : "Tambah Voucher"}
                </h2>
                <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* ── Kolom Kiri ─────────────────────────────────────────── */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Informasi Dasar</h3>

                    {/* Kode */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kode Voucher<span className="text-red-500">*</span>
                      </label>
                      <input
                        name="code"
                        placeholder="DISKON50"
                        value={form.code}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kode unik untuk voucher (wajib diisi)</p>
                    </div>

                    {/* Nama */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Voucher</label>
                      <input
                        name="name"
                        placeholder="Diskon Tahun Baru"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Nama tampilan untuk voucher (opsional)</p>
                    </div>

                    {/* Kategori */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                      <input
                        name="category"
                        placeholder="Seasonal, Promo, dll"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kategori voucher untuk pengelompokan (opsional)</p>
                    </div>

                    {/* Deskripsi */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Voucher</label>
                      <textarea
                        name="description"
                        placeholder="Deskripsi voucher..."
                        value={form.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Deskripsi detail voucher (opsional)</p>
                    </div>

                    {/* Status Aktif */}
                    <div className="mb-4">
                      <label className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">
                          Status Aktif<span className="text-red-500">*</span>
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={form.isActive}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                        </div>
                      </label>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-4 mt-6">Informasi Penggunaan</h3>

                    {/* Batas Penggunaan */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batas Penggunaan<span className="text-red-500">*</span>
                      </label>
                      <input
                        name="usageLimit"
                        type="number"
                        placeholder="100"
                        value={form.usageLimit}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Jumlah maksimal pengguna yang dapat menggunakan voucher ini.</p>
                    </div>

                    {/* Periode */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Berlaku Dari<span className="text-red-500">*</span>
                        </label>
                        <input
                          name="startDate"
                          type="date"
                          value={form.startDate}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Berlaku Sampai<span className="text-red-500">*</span>
                        </label>
                        <input
                          name="endDate"
                          type="date"
                          value={form.endDate}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Kolom Kanan ─────────────────────────────────────────── */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Pengaturan Diskon</h3>

                    {/* Tipe Diskon */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe Diskon<span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={form.type}
                        onChange={handleTypeChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="PERCENTAGE">Persentase (%)</option>
                        <option value="FIXED">Nominal (Rp)</option>
                      </select>
                    </div>

                    {/* Nilai Diskon */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {form.type === "PERCENTAGE" ? "Nilai Diskon (%)" : "Nilai Diskon (Rp)"}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="value"
                        type="number"
                        placeholder={form.type === "PERCENTAGE" ? "0-100" : "Minimal 1"}
                        value={form.value}
                        onChange={handleChange}
                        min={form.type === "FIXED" ? "1" : "0"}
                        max={form.type === "PERCENTAGE" ? "100" : undefined}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {form.type === "FIXED" && (
                        <p className="text-xs text-gray-500 mt-1">Minimal Rp 1</p>
                      )}
                      {form.type === "PERCENTAGE" && (
                        <p className="text-xs text-gray-500 mt-1">0% - 100%</p>
                      )}
                    </div>

                    {/* Maksimal Diskon */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maksimal Diskon (Rp)</label>
                      <input
                        name="maxDiscount"
                        type="number"
                        placeholder="0"
                        value={form.maxDiscount}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {form.type === "PERCENTAGE"
                          ? "Batas maksimal potongan harga untuk diskon persentase"
                          : "Nilai maksimal tidak boleh melebihi harga produk"}
                      </p>
                    </div>

                    {/* ══ 3 Field Baru ══════════════════════════════════════════ */}
                    <h3 className="text-lg font-bold text-gray-800 mb-4 mt-6">
                      Pembatasan Konten
                      <span className="ml-2 text-xs font-normal text-gray-400">(kosong = berlaku untuk semua)</span>
                    </h3>

                    {/* Tipe Konten */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Konten</label>
                      <select
                        name="contentType"
                        value={form.contentType}
                        onChange={handleContentTypeChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        {CONTENT_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Pilih jenis konten agar voucher hanya berlaku di konten tersebut.
                        Biarkan kosong agar berlaku di semua tipe konten.
                      </p>
                    </div>

                    {/* Tipe Pembayaran */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Pembayaran</label>
                      <select
                        name="paymentType"
                        value={form.paymentType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        {PAYMENT_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Pilih jenis pembayaran agar voucher hanya berlaku di pembayaran tersebut.
                        Biarkan kosong agar berlaku di semua jenis pembayaran.
                      </p>
                    </div>

                    {/* Content ID — pencarian by nama konten */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content ID
                        {form.contentId && (
                          <span className="ml-2 text-xs font-normal text-green-600">
                            ✓ Terpilih: {form.contentId}
                          </span>
                        )}
                      </label>

                      {!form.contentType ? (
                        <div className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-sm">
                          Pilih Tipe Konten terlebih dahulu untuk mengaktifkan pencarian
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={`Cari nama ${CONTENT_TYPE_OPTIONS.find(o => o.value === form.contentType)?.label || "konten"}...`}
                              value={contentSearchQuery}
                              onChange={(e) => {
                                setContentSearchQuery(e.target.value);
                                // Jika user mengedit manual, reset contentId
                                if (form.contentId && e.target.value !== form.contentIdLabel) {
                                  setForm((prev) => ({ ...prev, contentId: "", contentIdLabel: "" }));
                                }
                              }}
                              onFocus={() => {
                                if (contentSearchResults.length > 0) setShowContentDropdown(true);
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {(form.contentId || contentSearchQuery) && (
                              <button
                                type="button"
                                onClick={handleClearContent}
                                className="px-3 py-2 text-gray-500 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-300 transition"
                                title="Hapus pilihan"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Loading indicator */}
                          {contentSearchLoading && (
                            <div className="absolute right-12 top-2.5">
                              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                          )}

                          {/* Dropdown hasil pencarian */}
                          {showContentDropdown && contentSearchResults.length > 0 && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {contentSearchResults.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleSelectContent(item)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition border-b border-gray-100 last:border-0"
                                >
                                  <div className="font-medium text-gray-800 text-sm">{item.label}</div>
                                  <div className="text-xs text-gray-400 font-mono">{item.id}</div>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Tidak ada hasil */}
                          {showContentDropdown && !contentSearchLoading && contentSearchResults.length === 0 && contentSearchQuery.trim().length >= 1 && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                Tidak ada konten ditemukan untuk "{contentSearchQuery}"
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-1">
                        Cari konten spesifik agar voucher hanya berlaku pada konten tersebut.
                        Biarkan kosong agar berlaku di semua konten.
                      </p>
                    </div>
                    {/* ══ End 3 Field Baru ══════════════════════════════════════ */}

                    <h3 className="text-lg font-bold text-gray-800 mb-4 mt-6">Target Pengguna</h3>
                    <p className="text-xs text-gray-500 mb-3">Data berikut hanya untuk keperluan UI/display</p>

                    {/* Tipe Pengguna */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Tipe Pengguna</label>
                      <div className="flex flex-wrap gap-2">
                        {["new", "old", "premium", "basic"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, targetUser: type }))}
                            className={`px-4 py-2 rounded-full font-medium transition ${
                              form.targetUser === type
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {type === "new" ? "Pengguna Baru" : type === "old" ? "Pengguna Lama" : type === "premium" ? "Premium User" : "Basic User"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tipe Paket */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Tipe Paket</label>
                      <div className="flex flex-wrap gap-2">
                        {["premium", "basic", "family", "student"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, packageType: type }))}
                            className={`px-4 py-2 rounded-full font-medium transition capitalize ${
                              form.packageType === type
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    {editingId ? "Update Voucher" : "Tambah Voucher"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Voucher List ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase">
                      Code / Name <TrendingUp className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase">
                      Discount <TrendingUp className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase">
                      Users <TrendingUp className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase">
                      Period <TrendingDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="text-sm font-semibold text-gray-600 uppercase">Status</div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="text-sm font-semibold text-gray-600 uppercase">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Tidak ada voucher yang ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((v) => {
                    const status = getStatusBadge(v);
                    const usagePercentage = ((v.usedCount || 0) / v.usageLimit) * 100;

                    return (
                      <tr key={v.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-800">{v.code}</div>
                          <div className="text-sm text-gray-500">{v.name || `Voucher ${v.code}`}</div>
                          {/* Badge konten & payment */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {v.contentType && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                {v.contentType}
                              </span>
                            )}
                            {v.paymentType && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                {v.paymentType}
                              </span>
                            )}
                            {v.contentId && (
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-mono">
                                ID:{v.contentId.substring(0, 8)}…
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">
                            {v.type === "PERCENTAGE"
                              ? `${v.value}%`
                              : `Rp ${Number(v.value).toLocaleString("id-ID")}`}
                          </div>
                          {v.maxDiscount > 0 && v.type === "PERCENTAGE" && (
                            <div className="text-xs text-gray-500">
                              Max. Rp{Number(v.maxDiscount).toLocaleString("id-ID")}
                            </div>
                          )}
                          {v.targetUser === "new" && (
                            <div className="text-xs text-blue-600 font-medium mt-1">New Users Only</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-600 font-medium">
                                {v.usedCount || 0} / {v.usageLimit}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="font-medium">Start:</span>
                              <span>{new Date(v.startDate).toLocaleDateString("id-ID")}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="font-medium">End:</span>
                              <span>{new Date(v.endDate).toLocaleDateString("id-ID")}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${status.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEdit(v)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                alert(
                                  `Viewing details for: ${v.code}\n\nName: ${v.name}\nCategory: ${v.category}\nDescription: ${v.description}\nContent Type: ${v.contentType || "All"}\nPayment Type: ${v.paymentType || "All"}\nContent ID: ${v.contentId || "All"}`
                                )
                              }
                              className="text-green-600 hover:text-green-800 transition"
                              title="View"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(v.id)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-center gap-2">
              <button className="px-3 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="px-4 py-2 bg-teal-500 text-white rounded font-medium">1</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">2</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">3</button>
              <span className="px-2 text-gray-500">...</span>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">10</button>
              <button className="px-3 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}