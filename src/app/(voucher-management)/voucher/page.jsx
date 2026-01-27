"use client";

import React, { useState, useEffect } from "react";
import { Search, Edit2, Eye, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { getVouchers, createVoucher, updateVoucher, deleteVoucher, getTotalSavings } from "@/hooks/api/voucherAPI";

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [totalSavings, setTotalSavings] = useState(0);

  const [form, setForm] = useState({
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
  });

  // Load vouchers dan total savings dari API
  useEffect(() => {
    fetchVouchers();
    fetchTotalSavings();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await getVouchers();
      const vouchersWithMetadata = (response.data || []).map(v => ({
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



  // Helper function untuk cek apakah voucher benar-benar aktif
  const isVoucherActive = (voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);

    return (
      voucher.isActive === true &&
      now >= startDate &&
      now <= endDate &&
      (voucher.usedCount || 0) < voucher.usageLimit
    );
  };

  const stats = {
    totalVouchers: vouchers.length,
    activeVouchers: vouchers.filter(v => isVoucherActive(v)).length,
    totalUsers: vouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0),
    totalSavings: totalSavings,
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    if (name === "value" && form.type === "FIXED") {
      const numValue = parseFloat(value);
      if (numValue < 1) {
        newValue = 1;
      }
    }

    if (name === "value" && form.type === "PERCENTAGE") {
      const numValue = parseFloat(value);
      if (numValue < 0) {
        newValue = 0;
      } else if (numValue > 100) {
        newValue = 100;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setForm((prev) => ({
      ...prev,
      type: newType,
      value: newType === "FIXED" ? 1 : 0,
    }));
  };

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
      await fetchTotalSavings();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      console.error("❌ Error saving voucher:", err);
      alert(`Gagal menyimpan voucher: ${err.message}`);
    }
  };

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
      startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().split('T')[0] : "",
      endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().split('T')[0] : "",
    });
    setEditingId(voucher.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus voucher ini?")) return;
    try {
      await deleteVoucher(id);
      alert("Voucher berhasil dihapus");
      await fetchVouchers();
      await fetchTotalSavings();
    } catch (err) {
      console.error("Error deleting voucher:", err);
      alert("Gagal menghapus voucher");
    }
  };

  const resetForm = () => {
    setForm({
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
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const getStatusBadge = (voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);

    if (!voucher.isActive) {
      return { label: "Inactive", color: "bg-red-500" };
    }
    if (now < startDate) {
      return { label: "Not Started", color: "bg-yellow-500" };
    }
    if (endDate < now) {
      return { label: "Expired", color: "bg-gray-500" };
    }
    if ((voucher.usedCount || 0) >= voucher.usageLimit) {
      return { label: "Limit Reached", color: "bg-orange-500" };
    }
    return { label: "Active", color: "bg-green-500" };
  };

  const filteredVouchers = vouchers.filter(v => {
    const matchSearch = v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchFilter = true;
    if (filterStatus === "active") {
      matchFilter = v.isActive === true;
    } else if (filterStatus === "inactive") {
      matchFilter = v.isActive === false;
    }

    return matchSearch && matchFilter;
  });

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
            <div className="text-2xl font-bold text-red-500">Rp {stats.totalSavings.toLocaleString('id-ID')}</div>
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

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
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
                  {/* Kolom Kiri - Informasi Dasar */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Informasi Dasar</h3>

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

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Voucher
                      </label>
                      <input
                        name="name"
                        placeholder="Diskon Tahun Baru"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Nama tampilan untuk voucher (opsional)</p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori
                      </label>
                      <input
                        name="category"
                        placeholder="Seasonal, Promo, dll"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kategori voucher untuk pengelompokan (opsional)</p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi Voucher
                      </label>
                      <textarea
                        name="description"
                        placeholder="Deskripsi voucher..."
                        value={form.description}
                        onChange={handleChange}
                        rows="5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Deskripsi detail voucher (opsional)</p>
                    </div>

                    <div className="mb-4">
                      <label className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Status Aktif<span className="text-red-500">*</span></span>
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

                    <h3 className="text-lg font-bold text-gray-800 mb-4 mt-8">Informasi Penggunaan</h3>

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
                      <p className="text-xs text-gray-500 mt-1">Menunjukkan jumlah maksimal pengguna yang dapat menggunakan voucher ini.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Berlaku Dari<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            name="startDate"
                            type="date"
                            value={form.startDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Berlaku Sampai<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
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
                  </div>

                  {/* Kolom Kanan - Pengaturan Diskon */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Pengaturan Diskon</h3>

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

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maksimal Diskon (Rp)
                      </label>
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

                    <h3 className="text-lg font-bold text-gray-800 mb-4 mt-8">Target Pengguna</h3>
                    <p className="text-xs text-gray-500 mb-3">Data berikut hanya untuk keperluan UI/display, tidak dikirim ke API</p>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipe Pengguna
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["new", "old", "premium", "basic"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, targetUser: type }))}
                            className={`px-4 py-2 rounded-full font-medium transition ${form.targetUser === type
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                          >
                            {type === "new" ? "Pengguna Baru" : type === "old" ? "Pengguna Lama" : type === "premium" ? "Premium User" : "Basic User"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipe Paket
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["premium", "basic", "family", "student"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, packageType: type }))}
                            className={`px-4 py-2 rounded-full font-medium transition capitalize ${form.packageType === type
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

        {/* Voucher List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase">
                      Code / Name
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase">
                      Discount
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase">
                      Users
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase">
                      Period
                      <TrendingDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="text-sm font-semibold text-gray-600 uppercase">
                      Status
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="text-sm font-semibold text-gray-600 uppercase">
                      Action
                    </div>
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
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">
                            {v.type === "PERCENTAGE"
                              ? `${v.value}%`
                              : `Rp ${v.value.toLocaleString('id-ID')}`}
                          </div>
                          {v.maxDiscount > 0 && v.type === "PERCENTAGE" && (
                            <div className="text-xs text-gray-500">
                              Max. Rp{v.maxDiscount.toLocaleString('id-ID')}
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
                              <span>{new Date(v.startDate).toLocaleDateString('id-ID')}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="font-medium">End:</span>
                              <span>{new Date(v.endDate).toLocaleDateString('id-ID')}</span>
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
                              onClick={() => alert(`Viewing details for: ${v.code}\n\nName: ${v.name}\nCategory: ${v.category}\nDescription: ${v.description}`)}
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