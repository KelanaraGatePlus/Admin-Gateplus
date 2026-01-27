"use client";

import React, { useState, useEffect } from "react";
import { bannerAPI } from "@/hooks/api/bannerAPI";

// Professional Icon Components
const Icons = {
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Image: () => (
    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Pencil: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  Spinner: () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ExclamationCircle: () => (
    <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
};

// Custom Notification Modal Component
const NotificationModal = ({ isOpen, onClose, type = "success", title, message }) => {
  if (!isOpen) return null;

  const icons = {
    success: <Icons.CheckCircle />,
    error: <Icons.ExclamationCircle />,
    warning: <Icons.AlertCircle />
  };

  const colors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600"
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex flex-col items-center text-center">
          {icons[type]}
          <h3 className={`text-xl font-bold mt-4 mb-2 ${colors[type]}`}>{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition w-full"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Confirm Modal Component
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Ya", cancelText = "Batal" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <Icons.AlertCircle />
          <h3 className="text-xl font-bold mt-4 mb-2 text-gray-800">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mapping function untuk convert form data ke API format
const mapFormDataToAPI = (formData) => {
  const positionMap = {
    "Hero Banner": "HERO",
    "Sidebar": "POSITION_2",
    "Footer": "POSITION_3"
  };

  const targetDeviceMap = {
    "Semua Device": "ALL",
    "Desktop": "DESKTOP",
    "Mobile": "MOBILE"
  };

  const targetAudienceMap = {
    "Semua": "ALL",
    "Pengguna Baru": "NEW_USER",
    "Pengguna Lama": "OLD_USER"
  };

  return {
    title: formData.judul,
    subTitle: formData.subJudul || null,
    description: formData.deskripsi || null,
    imageUrl: formData.imageUrl || formData.imagePreview || "https://via.placeholder.com/1920x1080",
    position: positionMap[formData.posisi] || "HERO",
    priority: parseInt(formData.prioritas) || 1,
    focusCategories: formData.fokusKategori || [],
    linkUrl: formData.linkUrl || null,
    buttonText: formData.textButton || "Daftar Sekarang",
    targetDevice: targetDeviceMap[formData.targetDevice] || "ALL",
    targetAudience: targetAudienceMap[formData.targetPenonton] || "ALL",
    isActive: formData.statusAktif,
    startDate: formData.berlakuDari || null,
    endDate: formData.berlakuSampai || null,
  };
};

// Mapping function untuk convert API data ke form format
const mapAPIDataToForm = (apiData) => {
  const positionMap = {
    "HERO": "Hero Banner",
    "POSITION_2": "Sidebar",
    "POSITION_3": "Footer"
  };

  const targetDeviceMap = {
    "ALL": "Semua Device",
    "DESKTOP": "Desktop",
    "MOBILE": "Mobile"
  };

  const targetAudienceMap = {
    "ALL": "Semua",
    "NEW_USER": "Pengguna Baru",
    "OLD_USER": "Pengguna Lama"
  };

  return {
    subJudul: apiData.subTitle || "",
    judul: apiData.title,
    deskripsi: apiData.description || "",
    fokusKategori: apiData.focusCategories || ["Semua"],
    linkUrl: apiData.linkUrl || "",
    textButton: apiData.buttonText || "Daftar Sekarang",
    statusAktif: apiData.isActive,
    posisi: positionMap[apiData.position] || "Hero Banner",
    prioritas: apiData.priority.toString(),
    targetDevice: targetDeviceMap[apiData.targetDevice] || "Semua Device",
    targetPenonton: targetAudienceMap[apiData.targetAudience] || "Semua",
    berlakuDari: apiData.startDate ? new Date(apiData.startDate).toISOString().split('T')[0] : "",
    berlakuSampai: apiData.endDate ? new Date(apiData.endDate).toISOString().split('T')[0] : "",
    imageFile: null,
    imagePreview: apiData.imageUrl,
    imageUrl: apiData.imageUrl
  };
};

export default function KelolaBannerPage() {
  // State Management
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Notification & Confirm Modal States
  const [notification, setNotification] = useState({ isOpen: false, type: "success", title: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: () => {} });
  
  // Form State
  const [formData, setFormData] = useState({
    subJudul: "",
    judul: "",
    deskripsi: "",
    fokusKategori: ["Semua"],
    linkUrl: "",
    textButton: "Daftar Sekarang",
    statusAktif: true,
    posisi: "Hero Banner",
    prioritas: "1",
    targetDevice: "Semua Device",
    targetPenonton: "Semua",
    berlakuDari: "",
    berlakuSampai: "",
    imageFile: null,
    imagePreview: null,
    imageUrl: ""
  });

  // Data State
  const [banners, setBanners] = useState([]);
  const [stats, setStats] = useState({
    totalBanners: 0,
    activeBanners: 0,
    inactiveBanners: 0
  });

  // Helper Functions for Modals
  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const closeNotification = () => {
    setNotification({ isOpen: false, type: "success", title: "", message: "" });
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} });
  };

  // Fetch banners dari API
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await bannerAPI.getAllBanners({
        status: filterStatus === "all" ? undefined : filterStatus,
        search: searchQuery || undefined,
        page: 1,
        limit: 100
      });

      if (response.success) {
        setBanners(response.data);
        
        setStats({
          totalBanners: response.stats.total,
          activeBanners: response.stats.active,
          inactiveBanners: response.stats.inactive
        });
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      showNotification("error", "Gagal Memuat Data", `Gagal mengambil data banner: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load banners saat component mount dan saat filter berubah
  useEffect(() => {
    fetchBanners();
  }, [filterStatus, searchQuery]);

  // Handle Form Input Change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle Kategori Toggle
  const toggleKategori = (kategori) => {
    if (kategori === "Semua") {
      setFormData(prev => ({
        ...prev,
        fokusKategori: ["Semua"]
      }));
    } else {
      setFormData(prev => {
        const filtered = prev.fokusKategori.filter(k => k !== "Semua");
        const exists = filtered.includes(kategori);
        const newKategori = exists 
          ? filtered.filter(k => k !== kategori)
          : [...filtered, kategori];
        
        return {
          ...prev,
          fokusKategori: newKategori.length === 0 ? ["Semua"] : newKategori
        };
      });
    }
  };

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification("warning", "File Terlalu Besar", "Ukuran file maksimal 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result,
          imageUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Modal for Create
  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      subJudul: "",
      judul: "",
      deskripsi: "",
      fokusKategori: ["Semua"],
      linkUrl: "https://gateplus.id/promo",
      textButton: "Daftar Sekarang",
      statusAktif: true,
      posisi: "Hero Banner",
      prioritas: "1",
      targetDevice: "Semua Device",
      targetPenonton: "Semua",
      berlakuDari: "",
      berlakuSampai: "",
      imageFile: null,
      imagePreview: null,
      imageUrl: ""
    });
    setShowModal(true);
  };

  // Open Modal for Edit
  const openEditModal = async (banner) => {
    setEditingBanner(banner);
    setFormData(mapAPIDataToForm(banner));
    setShowModal(true);
  };

  // Handle Create/Update Banner
  const handleSubmit = async () => {
    if (!formData.judul.trim()) {
      showNotification("warning", "Validasi Gagal", "Judul banner harus diisi!");
      return;
    }

    if (!formData.imageUrl && !formData.imagePreview) {
      showNotification("warning", "Validasi Gagal", "Gambar banner harus diupload!");
      return;
    }

    setSubmitting(true);

    try {
      const apiData = mapFormDataToAPI(formData);

      if (editingBanner) {
        const response = await bannerAPI.updateBanner(editingBanner.id, apiData);
        
        if (response.success) {
          showNotification("success", "Berhasil!", "Banner berhasil diperbarui");
          setShowModal(false);
          fetchBanners();
        }
      } else {
        const response = await bannerAPI.createBanner(apiData);
        
        if (response.success) {
          showNotification("success", "Berhasil!", "Banner berhasil ditambahkan");
          setShowModal(false);
          fetchBanners();
        }
      }
    } catch (error) {
      console.error("Error submitting banner:", error);
      showNotification("error", "Gagal Menyimpan", `Gagal menyimpan banner: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Banner
  const handleDelete = async (bannerId) => {
    showConfirm(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus banner ini? Tindakan ini tidak dapat dibatalkan.",
      async () => {
        try {
          const response = await bannerAPI.deleteBanner(bannerId);
          
          if (response.success) {
            showNotification("success", "Berhasil!", "Banner berhasil dihapus");
            fetchBanners();
          }
        } catch (error) {
          console.error("Error deleting banner:", error);
          showNotification("error", "Gagal Menghapus", `Gagal menghapus banner: ${error.message}`);
        }
      }
    );
  };

  // Handle View Banner
  const handleView = (banner) => {
    showNotification("success", "Detail Banner", `Melihat detail: ${banner.title}`);
    console.log("Banner details:", banner);
  };

  const kategoris = ["Semua", "Merdu", "Series", "E-Book", "Komik", "Podcast"];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getPositionLabel = (position) => {
    const map = {
      "HERO": "Hero Banner",
      "POSITION_2": "Sidebar",
      "POSITION_3": "Footer"
    };
    return map[position] || position;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />

      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Banners</div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalBanners}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Active Banners</div>
          <div className="text-3xl font-bold text-green-600">{stats.activeBanners}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Inactive Banners</div>
          <div className="text-3xl font-bold text-red-600">{stats.inactiveBanners}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Positions</div>
          <div className="text-3xl font-bold text-purple-600">3</div>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold">Kelola Banner</h1>
            <p className="text-sm text-gray-600">Mengelola banner promosi di halaman utama</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            <Icons.Pencil /> Tambah Banner Baru
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cari berdasarkan judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              <Icons.Search />
            </span>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Icons.Filter /> Filter Status <Icons.ChevronDown />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                <button
                  onClick={() => { setFilterStatus("all"); setShowFilterMenu(false); }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterStatus === "all" ? "bg-blue-50 text-blue-600" : ""}`}
                >
                  Semua Banner
                </button>
                <button
                  onClick={() => { setFilterStatus("aktif"); setShowFilterMenu(false); }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterStatus === "aktif" ? "bg-blue-50 text-blue-600" : ""}`}
                >
                  Aktif
                </button>
                <button
                  onClick={() => { setFilterStatus("nonaktif"); setShowFilterMenu(false); }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterStatus === "nonaktif" ? "bg-blue-50 text-blue-600" : ""}`}
                >
                  Nonaktif
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Icons.Spinner />
          <span className="ml-2 text-gray-600">Memuat data banner...</span>
        </div>
      ) : (
        /* Banner Grid */
        <div className="grid grid-cols-3 gap-4">
          {banners.length === 0 ? (
            <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Icons.Image />
                <p className="mt-4 text-gray-500">Tidak ada banner yang ditemukan</p>
              </div>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-40 flex items-center justify-center">
                  {banner.imageUrl ? (
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icons.Image />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      banner.isActive 
                        ? "bg-green-500 text-white" 
                        : "bg-red-500 text-white"
                    }`}>
                      {banner.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1 truncate">{banner.title}</h3>
                  {banner.subTitle && (
                    <p className="text-xs text-gray-500 mb-2">{banner.subTitle}</p>
                  )}
                  {banner.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{banner.description}</p>
                  )}

                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      {getPositionLabel(banner.position)}
                    </span>
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                      Priority {banner.priority}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    <div>Berlaku: {formatDate(banner.startDate)} - {formatDate(banner.endDate)}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handleView(banner)}
                      className="px-3 py-1.5 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition flex items-center justify-center gap-1"
                    >
                      <Icons.Eye /> Lihat
                    </button>
                    <button 
                      onClick={() => openEditModal(banner)}
                      className="px-3 py-1.5 text-xs text-green-600 border border-green-600 rounded hover:bg-green-50 transition flex items-center justify-center gap-1"
                    >
                      <Icons.Edit /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(banner.id)}
                      className="px-3 py-1.5 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50 transition flex items-center justify-center gap-1"
                    >
                      <Icons.Trash /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Form - DIPERBESAR */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold">
                {editingBanner ? "Edit Banner" : "Tambah Banner Baru"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={submitting}
              >
                <Icons.X />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  <h3 className="text-lg font-semibold mb-6">Tambahkan Banner</h3>
                  
                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 text-center hover:border-blue-400 transition">
                    {formData.imagePreview ? (
                      <div className="relative">
                        <img 
                          src={formData.imagePreview} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded mb-3"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageFile: null, imagePreview: null, imageUrl: "" }))}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 text-lg"
                          disabled={submitting}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 rounded flex items-center justify-center mb-3">
                        <Icons.Upload />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="banner-upload"
                      disabled={submitting}
                    />
                    <label
                      htmlFor="banner-upload"
                      className={`cursor-pointer text-blue-500 hover:text-blue-600 font-medium inline-flex items-center gap-2 text-base ${submitting ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <Icons.Plus /> Upload Gambar
                    </label>
                    <p className="text-sm text-gray-500 mt-3">
                      Rekomendasi: 1920x1080px, maksimal 5MB
                    </p>
                    {formData.imageFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        {formData.imageFile.name}
                      </p>
                    )}
                  </div>

                  {/* Schedule Settings */}
                  <div className="space-y-5">
                    <h3 className="text-lg font-semibold">Pengaturan Jadwal</h3>
                    
                    <div>
                      <label className="block text-base font-medium mb-2">Posisi Banner</label>
                      <select 
                        value={formData.posisi}
                        onChange={(e) => handleInputChange('posisi', e.target.value)}
                        className="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={submitting}
                      >
                        <option value="Hero Banner">Hero Banner</option>
                        <option value="Sidebar">Sidebar</option>
                        <option value="Footer">Footer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-base font-medium mb-2">Prioritas Tampil</label>
                      <select 
                        value={formData.prioritas}
                        onChange={(e) => handleInputChange('prioritas', e.target.value)}
                        className="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={submitting}
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-base font-medium mb-2">Target Device</label>
                      <select 
                        value={formData.targetDevice}
                        onChange={(e) => handleInputChange('targetDevice', e.target.value)}
                        className="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={submitting}
                      >
                        <option value="Semua Device">Semua Device</option>
                        <option value="Desktop">Desktop</option>
                        <option value="Mobile">Mobile</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-base font-medium mb-2">Target Penonton</label>
                      <div className="flex gap-3 flex-wrap">
                        {["Semua", "Pengguna Baru", "Pengguna Lama"].map(target => (
                          <button
                            key={target}
                            type="button"
                            onClick={() => handleInputChange('targetPenonton', target)}
                            className={`px-4 py-2 text-sm rounded transition ${
                              formData.targetPenonton === target
                                ? "bg-blue-500 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                            disabled={submitting}
                          >
                            {target}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <label className="block text-base font-medium">Status Aktif</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.statusAktif}
                          onChange={(e) => handleInputChange('statusAktif', e.target.checked)}
                          className="sr-only peer"
                          disabled={submitting}
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <h3 className="text-lg font-semibold mb-6">Informasi Dasar</h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-base font-medium mb-2">Sub Judul Banner</label>
                      <input
                        type="text"
                        placeholder="Deskripsi kecil"
                        value={formData.subJudul}
                        onChange={(e) => handleInputChange('subJudul', e.target.value)}
                        className="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium mb-2">
                        Judul Banner <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan judul banner"
                        value={formData.judul}
                        onChange={(e) => handleInputChange('judul', e.target.value)}
                        className="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium mb-2">Deskripsi</label>
                      <textarea
                        placeholder="Deskripsi banner.."
                        value={formData.deskripsi}
                        onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                        className="w-full border border-gray-300 rounded px-4 py-3 text-base h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium mb-2">Fokus Kategori</label>
                      <div className="flex gap-3 flex-wrap">
                        {kategoris.map(kategori => (
                          <button
                            key={kategori}
                            type="button"
                            onClick={() => toggleKategori(kategori)}
                            className={`px-4 py-2 text-sm rounded transition ${
                              formData.fokusKategori.includes(kategori)
                                ? "bg-blue-500 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                            disabled={submitting}
                          >
                            {kategori}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-medium mb-2">Link URL</label>
                      <input
                        type="url"
                        placeholder="https://gateplus.id/promo"
                        value={formData.linkUrl}
                        onChange={(e) => handleInputChange('linkUrl', e.target.value)}
                        className="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium mb-2">Text Button</label>
                      <input
                        type="text"
                        value={formData.textButton}
                        onChange={(e) => handleInputChange('textButton', e.target.value)}
                        className="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={submitting}
                      />
                    </div>

                    <div className="border-t pt-5">
                      <h3 className="text-lg font-semibold mb-4">Pengaturan Jadwal</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-base font-medium mb-2">
                            Berlaku Dari <Icons.Calendar />
                          </label>
                          <input
                            type="date"
                            value={formData.berlakuDari}
                            onChange={(e) => handleInputChange('berlakuDari', e.target.value)}
                            className="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={submitting}
                          />
                        </div>
                        <div>
                          <label className="block text-base font-medium mb-2">
                            Berlaku Sampai <Icons.Calendar />
                          </label>
                          <input
                            type="date"
                            value={formData.berlakuSampai}
                            onChange={(e) => handleInputChange('berlakuSampai', e.target.value)}
                            className="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-4 p-6 border-t sticky bottom-0 bg-white">
              <button 
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-base disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-base disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Icons.Spinner />
                    Menyimpan...
                  </>
                ) : (
                  editingBanner ? "Update Banner" : "Tambah Banner"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}