"use client";

import React, { useState, useEffect } from "react";
import { bannerAPI } from "@/hooks/api/bannerAPI";

// Professional Icon Components
const Icons = {
  Plus: () => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  ),
  Search: () => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  Filter: () => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  ),
  Edit: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  ),
  Trash: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Eye: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  X: () => (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  Upload: () => (
    <svg
      className="h-12 w-12 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  ),
  Calendar: () => (
    <svg
      className="ml-1 inline-block h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  Image: () => (
    <svg
      className="h-16 w-16 text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  Pencil: () => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  ),
  Spinner: () => (
    <svg
      className="h-5 w-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  ),
  CheckCircle: () => (
    <svg
      className="h-16 w-16 text-green-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  ExclamationCircle: () => (
    <svg
      className="h-16 w-16 text-red-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  AlertCircle: () => (
    <svg
      className="h-16 w-16 text-yellow-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
};

// Custom Notification Modal Component
const NotificationModal = ({
  isOpen,
  onClose,
  type = "success",
  title,
  message,
}) => {
  if (!isOpen) return null;

  const icons = {
    success: <Icons.CheckCircle />,
    error: <Icons.ExclamationCircle />,
    warning: <Icons.AlertCircle />,
  };

  const colors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex flex-col items-center text-center">
          {icons[type]}
          <h3 className={`mt-4 mb-2 text-xl font-bold ${colors[type]}`}>
            {title}
          </h3>
          <p className="mb-6 text-gray-600">{message}</p>
          <button
            onClick={onClose}
            className="w-full rounded-md bg-blue-500 px-6 py-2 text-white transition hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Confirm Modal Component
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya",
  cancelText = "Batal",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <Icons.AlertCircle />
          <h3 className="mt-4 mb-2 text-xl font-bold text-gray-800">{title}</h3>
          <p className="mb-6 text-gray-600">{message}</p>
          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 transition hover:bg-gray-50"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 rounded-md bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
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
  const targetDeviceMap = {
    "Semua Device": "ALL",
    Desktop: "DESKTOP",
    Mobile: "MOBILE",
  };

  const targetAudienceMap = {
    Semua: "ALL",
    "Pengguna Baru": "NEW_USER",
    "Pengguna Lama": "OLD_USER",
  };
  const positionMap = {
    "Hero Banner": "HERO",
    Sidebar: "POSITION_2",
    Footer: "POSITION_3",
  };

  return {
    title: formData.judul?.trim(),

    imageUrl: formData.imagePreview || formData.imageUrl || null,

    position: positionMap[formData.posisi] || "HERO",

    subTitle: formData.subJudul || null,
    description: formData.deskripsi || null,
    trailerUrl: formData.trailerUrl || null,
    priority: Number(formData.prioritas) || 1,
    focusCategories: formData.fokusKategori || [],
    linkUrl: formData.linkUrl || null,
    buttonText: formData.textButton || null,
    targetDevice: targetDeviceMap[formData.targetDevice] || "ALL",
    targetAudience: targetAudienceMap[formData.targetPenonton] || "ALL",
    isActive: Boolean(formData.statusAktif),
    startDate: formData.berlakuDari || null,
    endDate: formData.berlakuSampai || null,
  };
};

// Mapping function untuk convert API data ke form format
const mapAPIDataToForm = (apiData) => {
  const positionMap = {
    HERO: "Hero Banner",
    POSITION_2: "Sidebar",
    POSITION_3: "Footer",
  };

  const targetDeviceMap = {
    ALL: "Semua Device",
    DESKTOP: "Desktop",
    MOBILE: "Mobile",
  };

  const targetAudienceMap = {
    ALL: "Semua",
    NEW_USER: "Pengguna Baru",
    OLD_USER: "Pengguna Lama",
  };

  return {
    subJudul: apiData.subTitle || "",
    judul: apiData.title,
    deskripsi: apiData.description || "",
    fokusKategori: apiData.focusCategories || ["Semua"],
    linkUrl: apiData.linkUrl || "",
    trailerFile: null,
    trailerPreview: apiData.trailerUrl || null,
    trailerUrl: apiData.trailerUrl || "",
    textButton: apiData.buttonText || "Daftar Sekarang",
    statusAktif: apiData.isActive,
    posisi: positionMap[apiData.position] || "Hero Banner",
    prioritas: apiData.priority.toString(),
    targetDevice: targetDeviceMap[apiData.targetDevice] || "Semua Device",
    targetPenonton: targetAudienceMap[apiData.targetAudience] || "Semua",
    berlakuDari: apiData.startDate
      ? new Date(apiData.startDate).toISOString().split("T")[0]
      : "",
    berlakuSampai: apiData.endDate
      ? new Date(apiData.endDate).toISOString().split("T")[0]
      : "",
    imageFile: null,
    imagePreview: apiData.imageUrl,
    imageUrl: apiData.imageUrl,
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
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

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
    imageUrl: "",
  });

  // Data State
  const [banners, setBanners] = useState([]);
  const [stats, setStats] = useState({
    totalBanners: 0,
    activeBanners: 0,
    inactiveBanners: 0,
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
    setConfirmDialog({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: () => {},
    });
  };

  // Fetch banners dari API
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await bannerAPI.getAllBanners({
        status: filterStatus === "all" ? undefined : filterStatus,
        search: searchQuery || undefined,
        page: 1,
        limit: 100,
      });

      if (response.success) {
        setBanners(response.data);

        setStats({
          totalBanners: response.stats.total,
          activeBanners: response.stats.active,
          inactiveBanners: response.stats.inactive,
        });
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      showNotification(
        "error",
        "Gagal Memuat Data",
        `Gagal mengambil data banner: ${error.message}`,
      );
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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle Kategori Toggle
  const toggleKategori = (kategori) => {
    if (kategori === "Semua") {
      setFormData((prev) => ({
        ...prev,
        fokusKategori: ["Semua"],
      }));
    } else {
      setFormData((prev) => {
        const filtered = prev.fokusKategori.filter((k) => k !== "Semua");
        const exists = filtered.includes(kategori);
        const newKategori = exists
          ? filtered.filter((k) => k !== kategori)
          : [...filtered, kategori];

        return {
          ...prev,
          fokusKategori: newKategori.length === 0 ? ["Semua"] : newKategori,
        };
      });
    }
  };

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification(
          "warning",
          "File Terlalu Besar",
          "Ukuran file maksimal 5MB",
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result,
          imageUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTrailerUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      showNotification(
        "warning",
        "File Terlalu Besar",
        "Ukuran video maksimal 50MB",
      );
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const MAX_TRAILER_DURATION = 65;

      if (video.duration > MAX_TRAILER_DURATION) {
        showNotification(
          "warning",
          "Durasi Terlalu Panjang",
          "Trailer maksimal 1 menit (60 detik)",
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          trailerFile: file,
          trailerPreview: reader.result,
          trailerUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    };

    video.src = URL.createObjectURL(file);
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
      imageUrl: "",
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
      showNotification(
        "warning",
        "Validasi Gagal",
        "Judul banner harus diisi!",
      );
      return;
    }

    if (!formData.imageUrl && !formData.imagePreview) {
      showNotification(
        "warning",
        "Validasi Gagal",
        "Gambar banner harus diupload!",
      );
      return;
    }

    setSubmitting(true);

    try {
      const apiData = mapFormDataToAPI(formData);
      console.log("UPDATE ID:", editingBanner?.id);
      console.log("UPDATE DATA:", apiData);
      if (editingBanner) {
        const response = await bannerAPI.updateBanner(
          editingBanner.id,
          apiData,
        );

        if (response.success) {
          showNotification(
            "success",
            "Berhasil!",
            "Banner berhasil diperbarui",
          );
          setShowModal(false);
          fetchBanners();
        }
      } else {
        const response = await bannerAPI.createBanner(apiData);

        if (response.success) {
          showNotification(
            "success",
            "Berhasil!",
            "Banner berhasil ditambahkan",
          );
          setShowModal(false);
          fetchBanners();
        }
      }
    } catch (error) {
      console.error("Error submitting banner:", error);
      showNotification(
        "error",
        "Gagal Menyimpan",
        `Gagal menyimpan banner: ${error.message}`,
      );
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
          showNotification(
            "error",
            "Gagal Menghapus",
            `Gagal menghapus banner: ${error.message}`,
          );
        }
      },
    );
  };

  // Handle View Banner
  const handleView = (banner) => {
    showNotification(
      "success",
      "Detail Banner",
      `Melihat detail: ${banner.title}`,
    );
    console.log("Banner details:", banner);
  };

  const kategoris = ["Semua", "Merdu", "Series", "E-Book", "Komik", "Podcast"];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const getPositionLabel = (position) => {
    const map = {
      HERO: "Hero Banner",
      POSITION_2: "Sidebar",
      POSITION_3: "Footer",
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
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-sm text-gray-600">Total Banners</div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalBanners}
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-sm text-gray-600">Active Banners</div>
          <div className="text-3xl font-bold text-green-600">
            {stats.activeBanners}
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-sm text-gray-600">Inactive Banners</div>
          <div className="text-3xl font-bold text-red-600">
            {stats.inactiveBanners}
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-sm text-gray-600">Total Positions</div>
          <div className="text-3xl font-bold text-purple-600">3</div>
        </div>
      </div>

      {/* Header Section */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Kelola Banner</h1>
            <p className="text-sm text-gray-600">
              Mengelola banner promosi di halaman utama
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
          >
            <Icons.Pencil /> Tambah Banner Baru
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari berdasarkan judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span className="absolute top-2.5 left-3 text-gray-400">
              <Icons.Search />
            </span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              <Icons.Filter /> Filter Status <Icons.ChevronDown />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-300 bg-white shadow-lg">
                <button
                  onClick={() => {
                    setFilterStatus("all");
                    setShowFilterMenu(false);
                  }}
                  className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${filterStatus === "all" ? "bg-blue-50 text-blue-600" : ""}`}
                >
                  Semua Banner
                </button>
                <button
                  onClick={() => {
                    setFilterStatus("aktif");
                    setShowFilterMenu(false);
                  }}
                  className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${filterStatus === "aktif" ? "bg-blue-50 text-blue-600" : ""}`}
                >
                  Aktif
                </button>
                <button
                  onClick={() => {
                    setFilterStatus("nonaktif");
                    setShowFilterMenu(false);
                  }}
                  className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${filterStatus === "nonaktif" ? "bg-blue-50 text-blue-600" : ""}`}
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
        <div className="flex items-center justify-center py-12">
          <Icons.Spinner />
          <span className="ml-2 text-gray-600">Memuat data banner...</span>
        </div>
      ) : (
        /* Banner Grid */
        <div className="grid grid-cols-3 gap-4">
          {banners.length === 0 ? (
            <div className="col-span-3 rounded-lg bg-white py-12 text-center shadow">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Icons.Image />
                <p className="mt-4 text-gray-500">
                  Tidak ada banner yang ditemukan
                </p>
              </div>
            </div>
          ) : (
            banners.map((banner) => (
              <div
                key={banner.id}
                className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-lg"
              >
                <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  {banner.imageUrl ? (
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icons.Image />
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        banner.isActive
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {banner.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="mb-1 truncate font-bold text-gray-800">
                    {banner.title}
                  </h3>
                  {banner.subTitle && (
                    <p className="mb-2 text-xs text-gray-500">
                      {banner.subTitle}
                    </p>
                  )}
                  {banner.description && (
                    <p className="mb-3 line-clamp-2 text-xs text-gray-600">
                      {banner.description}
                    </p>
                  )}

                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                      {getPositionLabel(banner.position)}
                    </span>
                    <span className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700">
                      Priority {banner.priority}
                    </span>
                  </div>

                  <div className="mb-3 text-xs text-gray-500">
                    <div>
                      Berlaku: {formatDate(banner.startDate)} -{" "}
                      {formatDate(banner.endDate)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleView(banner)}
                      className="flex items-center justify-center gap-1 rounded border border-blue-600 px-3 py-1.5 text-xs text-blue-600 transition hover:bg-blue-50"
                    >
                      <Icons.Eye /> Lihat
                    </button>
                    <button
                      onClick={() => openEditModal(banner)}
                      className="flex items-center justify-center gap-1 rounded border border-green-600 px-3 py-1.5 text-xs text-green-600 transition hover:bg-green-50"
                    >
                      <Icons.Edit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="flex items-center justify-center gap-1 rounded border border-red-600 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">
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
                  <h3 className="mb-6 text-lg font-semibold">
                    Tambahkan Banner
                  </h3>

                  {/* Image Upload */}
                  <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-blue-400">
                    {formData.imagePreview ? (
                      <div className="relative">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="mb-3 h-48 w-full rounded object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              imageFile: null,
                              imagePreview: null,
                              imageUrl: "",
                            }))
                          }
                          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-lg text-white hover:bg-red-600"
                          disabled={submitting}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="mb-3 flex h-48 items-center justify-center rounded bg-gradient-to-br from-gray-100 to-gray-200">
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
                      className={`inline-flex cursor-pointer items-center gap-2 text-base font-medium text-blue-500 hover:text-blue-600 ${submitting ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <Icons.Plus /> Upload Gambar
                    </label>
                    <p className="mt-3 text-sm text-gray-500">
                      Rekomendasi: 1920x1080, maksimal 5MB
                    </p>
                    {formData.imageFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        {formData.imageFile.name}
                      </p>
                    )}
                  </div>

                  {/* Trailer Upload */}
                  <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-blue-400">
                    <h4 className="mb-3 font-semibold">
                      Upload Trailer (Max 1 Menit)
                    </h4>

                    {formData.trailerPreview ? (
                      <div className="relative">
                        <video
                          src={formData.trailerPreview}
                          controls
                          className="mb-3 h-48 w-full rounded object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              trailerFile: null,
                              trailerPreview: null,
                              trailerUrl: "",
                            }))
                          }
                          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-lg text-white hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="mb-3 flex h-48 items-center justify-center rounded bg-gradient-to-br from-gray-100 to-gray-200">
                        <Icons.Upload />
                      </div>
                    )}

                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleTrailerUpload}
                      className="hidden"
                      id="trailer-upload"
                    />

                    <label
                      htmlFor="trailer-upload"
                      className="inline-flex cursor-pointer items-center gap-2 text-base font-medium text-blue-500 hover:text-blue-600"
                    >
                      <Icons.Plus /> Upload Trailer
                    </label>

                    <p className="mt-3 text-sm text-gray-500">
                      Maksimal 60 detik • Format MP4/WebM • Max 20MB
                    </p>
                  </div>

                  {/* Schedule Settings */}
                  <div className="space-y-5">
                    <h3 className="text-lg font-semibold">Pengaturan Jadwal</h3>

                    <div>
                      <label className="mb-2 block text-base font-medium">
                        Posisi Banner
                      </label>
                      <select
                        value={formData.posisi}
                        onChange={(e) =>
                          handleInputChange("posisi", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        disabled={submitting}
                      >
                        <option value="Hero Banner">Hero Banner</option>
                        <option value="Sidebar">Sidebar</option>
                        <option value="Footer">Footer</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-base font-medium">
                        Prioritas Tampil
                      </label>
                      <select
                        value={formData.prioritas}
                        onChange={(e) =>
                          handleInputChange("prioritas", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      <label className="mb-2 block text-base font-medium">
                        Target Device
                      </label>
                      <select
                        value={formData.targetDevice}
                        onChange={(e) =>
                          handleInputChange("targetDevice", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        disabled={submitting}
                      >
                        <option value="Semua Device">Semua Device</option>
                        <option value="Desktop">Desktop</option>
                        <option value="Mobile">Mobile</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-base font-medium">
                        Target Penonton
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {["Semua", "Pengguna Baru", "Pengguna Lama"].map(
                          (target) => (
                            <button
                              key={target}
                              type="button"
                              onClick={() =>
                                handleInputChange("targetPenonton", target)
                              }
                              className={`rounded px-4 py-2 text-sm transition ${
                                formData.targetPenonton === target
                                  ? "bg-blue-500 text-white"
                                  : "border border-gray-300 hover:bg-gray-50"
                              }`}
                              disabled={submitting}
                            >
                              {target}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <label className="block text-base font-medium">
                        Status Aktif
                      </label>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={formData.statusAktif}
                          onChange={(e) =>
                            handleInputChange("statusAktif", e.target.checked)
                          }
                          className="peer sr-only"
                          disabled={submitting}
                        />
                        <div className="peer h-7 w-14 rounded-full bg-gray-200 peer-checked:bg-green-500 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[4px] after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <h3 className="mb-6 text-lg font-semibold">
                    Informasi Dasar
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-base font-medium">
                        Sub Judul Banner (Maks 42 karakter)
                      </label>

                      <input
                        type="text"
                        placeholder="Deskripsi kecil"
                        maxLength={42}
                        value={formData.subJudul}
                        onChange={(e) =>
                          handleInputChange(
                            "subJudul",
                            e.target.value.slice(0, 42),
                          )
                        }
                        className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        disabled={submitting}
                      />

                      <p className="mt-1 text-right text-sm text-gray-500">
                        {formData.subJudul?.length || 0}/42
                      </p>
                    </div>
                    <div>
                      <label className="mb-2 block text-base font-medium">
                        Judul Banner <span className="text-red-500">*</span>{" "}
                        (Maks 24 karakter)
                      </label>

                      <input
                        type="text"
                        placeholder="Masukkan judul banner"
                        maxLength={24}
                        value={formData.judul}
                        onChange={(e) =>
                          handleInputChange(
                            "judul",
                            e.target.value.slice(0, 24),
                          )
                        }
                        className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                        disabled={submitting}
                      />

                      <p className="mt-1 text-right text-sm text-gray-500">
                        {formData.judul?.length || 0}/24
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-base font-medium">
                        Deskripsi (Maks 216 karakter)
                      </label>

                      <textarea
                        placeholder="Deskripsi banner.."
                        maxLength={216}
                        value={formData.deskripsi}
                        onChange={(e) =>
                          handleInputChange(
                            "deskripsi",
                            e.target.value.slice(0, 216),
                          )
                        }
                        className="h-28 w-full resize-none rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        disabled={submitting}
                      />

                      <p className="mt-1 text-right text-sm text-gray-500">
                        {formData.deskripsi?.length || 0}/216
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-base font-medium">
                        Fokus Kategori
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {kategoris.map((kategori) => (
                          <button
                            key={kategori}
                            type="button"
                            onClick={() => toggleKategori(kategori)}
                            className={`rounded px-4 py-2 text-sm transition ${
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
                      <label className="mb-2 block text-base font-medium">
                        Link URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://gateplus.id/promo"
                        value={formData.linkUrl}
                        onChange={(e) =>
                          handleInputChange("linkUrl", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-base font-medium">
                        Text Button
                      </label>
                      <input
                        type="text"
                        value={formData.textButton}
                        onChange={(e) =>
                          handleInputChange("textButton", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        disabled={submitting}
                      />
                    </div>

                    <div className="border-t pt-5">
                      <h3 className="mb-4 text-lg font-semibold">
                        Pengaturan Jadwal
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-base font-medium">
                            Berlaku Dari <Icons.Calendar />
                          </label>
                          <input
                            type="date"
                            value={formData.berlakuDari}
                            onChange={(e) =>
                              handleInputChange("berlakuDari", e.target.value)
                            }
                            className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            disabled={submitting}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-base font-medium">
                            Berlaku Sampai <Icons.Calendar />
                          </label>
                          <input
                            type="date"
                            value={formData.berlakuSampai}
                            onChange={(e) =>
                              handleInputChange("berlakuSampai", e.target.value)
                            }
                            className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            <div className="sticky bottom-0 flex gap-4 border-t bg-white p-6">
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-base font-medium transition hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-base font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Icons.Spinner />
                    Menyimpan...
                  </>
                ) : editingBanner ? (
                  "Update Banner"
                ) : (
                  "Tambah Banner"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
