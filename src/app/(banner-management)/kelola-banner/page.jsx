"use client";

import React, { useState, useEffect } from "react";
import { bannerAPI } from "@/hooks/api/bannerAPI";
import { bannerPromoAPI } from "@/hooks/api/bannerPromoSliceAPI";
import PropTypes from "prop-types";
import BannerCard from "@/components/banner/bannerCard";
import { Icons } from "@/components/banner/icons";

// ─── Notification Modal ────────────────────────────────────────────────────────
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
NotificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(["success", "error", "warning"]),
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};
NotificationModal.defaultProps = { type: "success" };

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
ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};
ConfirmModal.defaultProps = { confirmText: "Ya", cancelText: "Batal" };

// ─── Mapping helpers ───────────────────────────────────────────────────────────
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
  const form = new FormData();
  form.append("title", formData.judul);
  form.append("position", positionMap[formData.posisi] || "HERO");
  form.append("priority", formData.prioritas);
  form.append("targetDevice", targetDeviceMap[formData.targetDevice] || "ALL");
  form.append(
    "targetAudience",
    targetAudienceMap[formData.targetPenonton] || "ALL",
  );
  form.append("isActive", formData.statusAktif);
  form.append("focusCategories", JSON.stringify(formData.fokusKategori || []));
  if (formData.subJudul) form.append("subTitle", formData.subJudul);
  if (formData.deskripsi) form.append("description", formData.deskripsi);
  if (formData.linkUrl) form.append("linkUrl", formData.linkUrl);
  if (formData.textButton) form.append("buttonText", formData.textButton);
  if (formData.berlakuDari) form.append("startDate", formData.berlakuDari);
  if (formData.berlakuSampai) form.append("endDate", formData.berlakuSampai);
  if (formData.imageFile) form.append("imageFile", formData.imageFile);
  if (formData.trailerFile) form.append("trailerFile", formData.trailerFile);
  return form;
};

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

const defaultKontenForm = {
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
  trailerFile: null,
  trailerPreview: null,
  trailerUrl: "",
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function KelolaBannerPage() {
  // ── Tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("konten"); // "konten" | "promo"

  // ── Notification & Confirm ─────────────────────────────────────────────────
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

  const showNotification = (type, title, message) =>
    setNotification({ isOpen: true, type, title, message });
  const closeNotification = () =>
    setNotification({ isOpen: false, type: "success", title: "", message: "" });
  const showConfirm = (title, message, onConfirm) =>
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  const closeConfirm = () =>
    setConfirmDialog({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: () => {},
    });

  // ── Banner Konten state ────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [showModalPromo, setShowModalPromo] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editingBannerPromo, setEditingBannerPromo] = useState(null);
  const [formData, setFormData] = useState(defaultKontenForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [stats, setStats] = useState({
    totalBanners: 0,
    activeBanners: 0,
    inactiveBanners: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // ── Banner Promo state ────────────────────────────────────────────────────
  const [promoSearchQuery, setPromoSearchQuery] = useState("");
  const [promoFilterStatus, setPromoFilterStatus] = useState("all");
  const [showPromoFilterMenu, setShowPromoFilterMenu] = useState(false);
  const [promoBanners, setPromoBanners] = useState([]);
  const [promoStats, setPromoStats] = useState({
    totalBanners: 0,
    activeBanners: 0,
    inactiveBanners: 0,
  });
  const [promoLoading, setPromoLoading] = useState(false);

  // ── Fetch konten banners ───────────────────────────────────────────────────
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
      showNotification(
        "error",
        "Gagal Memuat Data",
        `Gagal mengambil data banner: ${error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch promo banners ───────────────────────────────────────────────────
  const fetchPromoBanners = async () => {
    setPromoLoading(true);
    try {
      const response = await bannerPromoAPI.getAllBannersPromo({
        status: promoFilterStatus === "all" ? undefined : promoFilterStatus,
        search: promoSearchQuery || undefined,
        page: 1,
        limit: 100,
      });
      if (response.success) {
        setPromoBanners(response.data);
        setPromoStats({
          totalBanners: response.stats.total,
          activeBanners: response.stats.active,
          inactiveBanners: response.stats.inactive,
        });
      }
    } catch (error) {
      showNotification(
        "error",
        "Gagal Memuat Data",
        `Gagal mengambil data banner promo: ${error.message}`,
      );
    } finally {
      setPromoLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [filterStatus, searchQuery]);

  useEffect(() => {
    if (activeTab === "promo") {
      fetchPromoBanners();
    }
  }, [activeTab, promoFilterStatus, promoSearchQuery]);

  // Reset form when modals close
  useEffect(() => {
    if (!showModal && !showModalPromo) {
      setFormData(defaultKontenForm);
      setEditingBanner(null);
      setEditingBannerPromo(null);
      setSubmitting(false);
    }
  }, [showModal, showModalPromo]);

  // ── Handlers Konten ────────────────────────────────────────────────────────
  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const toggleKategori = (kategori) => {
    if (kategori === "Semua") {
      setFormData((prev) => ({ ...prev, fokusKategori: ["Semua"] }));
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showNotification(
        "warning",
        "File Terlalu Besar",
        "Ukuran file maksimal 5MB",
      );
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result,
        imageUrl: reader.result,
      }));
    reader.readAsDataURL(file);
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
      if (video.duration > 65) {
        showNotification(
          "warning",
          "Durasi Terlalu Panjang",
          "Trailer maksimal 1 menit (60 detik)",
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({
          ...prev,
          trailerFile: file,
          trailerPreview: reader.result,
          trailerUrl: reader.result,
        }));
      reader.readAsDataURL(file);
    };
    video.src = URL.createObjectURL(file);
  };

  // banner biasa
  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData(defaultKontenForm);
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData(mapAPIDataToForm(banner));
    setShowModal(true);
  };

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
      showNotification(
        "error",
        "Gagal Menyimpan",
        `Gagal menyimpan banner: ${error.message}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

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
          showNotification(
            "error",
            "Gagal Menghapus",
            `Gagal menghapus banner: ${error.message}`,
          );
        }
      },
    );
  };

  const handleView = (banner) => {
    showNotification(
      "success",
      "Detail Banner",
      `Melihat detail: ${banner.title}`,
    );
  };

  // banner promo
  const openCreatePromoModal = () => {
    setEditingBannerPromo(null);
    setFormData(defaultKontenForm);
    setShowModalPromo(true);
  };

  const openEditModalPromo = (banner) => {
    setEditingBannerPromo(banner);
    setFormData(mapAPIDataToForm(banner));
    setShowModalPromo(true);
  };

  const handleSubmitPromo = async () => {
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
      if (editingBannerPromo) {
        const response = await bannerPromoAPI.updateBannerPromo(
          editingBannerPromo.id,
          apiData,
        );
        if (response.success) {
          showNotification(
            "success",
            "Berhasil!",
            "Banner berhasil diperbarui",
          );
          setShowModalPromo(false);
          fetchPromoBanners();
        }
      } else {
        const response = await bannerPromoAPI.createBannerPromo(apiData);
        if (response.success) {
          showNotification(
            "success",
            "Berhasil!",
            "Banner berhasil ditambahkan",
          );
          setShowModalPromo(false);
          fetchPromoBanners();
        }
      }
    } catch (error) {
      showNotification(
        "error",
        "Gagal Menyimpan",
        `Gagal menyimpan banner: ${error.message}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePromo = async (bannerId) => {
    showConfirm(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus banner ini? Tindakan ini tidak dapat dibatalkan.",
      async () => {
        try {
          const response = await bannerPromoAPI.deleteBannerPromo(bannerId);
          if (response.success) {
            showNotification("success", "Berhasil!", "Banner berhasil dihapus");
            fetchPromoBanners();
          }
        } catch (error) {
          showNotification(
            "error",
            "Gagal Menghapus",
            `Gagal menghapus banner: ${error.message}`,
          );
        }
      },
    );
  };

  const handleViewPromo = (banner) => {
    showNotification(
      "success",
      "Detail Banner",
      `Melihat detail: ${banner.title}`,
    );
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const kategoris = ["Semua", "Movie", "Series", "E-Book", "Komik", "Podcast"];
  const formatDate = (ds) =>
    ds ? new Date(ds).toLocaleDateString("id-ID") : "-";
  const getPositionLabel = (p) =>
    ({ HERO: "Hero Banner", POSITION_2: "Sidebar", POSITION_3: "Footer" })[p] ||
    p;

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Modals */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
      <div className="mb-6 flex items-center justify-between rounded-md bg-blue-600 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-white">Kelola Banner</h1>
          <p className="mt-0.5 text-sm text-blue-100">
            Mengelola banner konten dan banner promo di halaman utama
          </p>
        </div>
      </div>
      {/* Header Tab*/}
      <div className="mb-6 rounded-lg bg-white shadow">
        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 px-4">
          <button
            onClick={() => setActiveTab("konten")}
            className={`-mb-px border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "konten"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Banner Konten
          </button>
          <button
            onClick={() => setActiveTab("promo")}
            className={`-mb-px border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "promo"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Banner Promo
          </button>
        </div>

        {/* Blue Header Bar */}
        <div className="mx-4 my-6 flex items-center justify-between rounded-md bg-blue-600 px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-white">
              {activeTab === "konten" ? "Banner Konten" : "Banner Promo"}
            </h1>
            <p className="mt-0.5 text-sm text-blue-100">
              {activeTab === "konten"
                ? "Banner konten format 16:9 (1920x1080px)"
                : "Banner promosi format 3:1 (1200x400px)"}
            </p>
          </div>
          <button
            onClick={
              activeTab === "konten" ? openCreateModal : openCreatePromoModal
            }
            className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            <Icons.Plus /> Tambah
          </button>
        </div>

        {/* Stats Row */}

        <div className="grid grid-cols-2 gap-4 border-b border-gray-100 px-4 py-4">
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-6 py-4">
            <p className="mb-1 text-xs text-gray-500">Total Banner</p>
            <p className="text-2xl font-bold text-blue-600">
              {activeTab === "konten"
                ? stats.totalBanners
                : promoStats.totalBanners}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-6 py-4">
            <p className="mb-1 text-xs text-gray-500">Aktif</p>
            <p className="text-2xl font-bold text-blue-600">
              {activeTab === "konten"
                ? stats.activeBanners
                : promoStats.activeBanners}
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="relative z-20 flex gap-3 p-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={
                activeTab === "konten"
                  ? "Cari banner konten..."
                  : "Cari banner promo..."
              }
              value={activeTab === "konten" ? searchQuery : promoSearchQuery}
              onChange={(e) =>
                activeTab === "konten"
                  ? setSearchQuery(e.target.value)
                  : setPromoSearchQuery(e.target.value)
              }
              className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span className="absolute top-2.5 left-3 text-gray-400">
              <Icons.Search />
            </span>
          </div>
          <div className="relative">
            <button
              onClick={() =>
                activeTab === "konten"
                  ? setShowFilterMenu(!showFilterMenu)
                  : setShowPromoFilterMenu(!showPromoFilterMenu)
              }
              className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              <Icons.Filter /> Filter Status <Icons.ChevronDown />
            </button>
            {/* Dropdown — Konten */}
            {activeTab === "konten" && showFilterMenu && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-300 bg-white shadow-lg">
                {[
                  ["all", "Semua Banner"],
                  ["aktif", "Aktif"],
                  ["nonaktif", "Nonaktif"],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => {
                      setFilterStatus(val);
                      setShowFilterMenu(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${filterStatus === val ? "bg-blue-50 text-blue-600" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {/* Dropdown — Promo */}
            {activeTab === "promo" && showPromoFilterMenu && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-300 bg-white shadow-lg">
                {[
                  ["all", "Semua Banner"],
                  ["aktif", "Aktif"],
                  ["nonaktif", "Nonaktif"],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => {
                      setPromoFilterStatus(val);
                      setShowPromoFilterMenu(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${promoFilterStatus === val ? "bg-blue-50 text-blue-600" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Konten */}
      {activeTab === "konten" ? (
        loading ? (
          <div className="flex items-center justify-center py-12">
            <Icons.Spinner />
            <span className="ml-2 text-gray-600">Memuat data banner...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {banners.length === 0 ? (
              <div className="col-span-2 rounded-lg bg-white py-12 text-center shadow">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Icons.Image />
                  <p className="mt-4 text-gray-500">
                    Tidak ada banner konten yang ditemukan
                  </p>
                </div>
              </div>
            ) : (
              banners.map((banner) => (
                <BannerCard
                  key={banner.id}
                  banner={banner}
                  onView={() => handleView(banner)}
                  onEdit={() => openEditModal(banner)}
                  onDelete={() => handleDelete(banner.id)}
                />
              ))
            )}
          </div>
        )
      ) : // tab promo
      promoLoading ? (
        <div className="flex items-center justify-center py-12">
          <Icons.Spinner />
          <span className="ml-2 text-gray-600">
            Memuat data banner promo...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 p-4">
          {promoBanners.length === 0 ? (
            <div className="col-span-2 rounded-lg bg-white py-12 text-center shadow">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Icons.Image />
                <p className="mt-4 text-gray-500">
                  Tidak ada banner promo yang ditemukan
                </p>
              </div>
            </div>
          ) : (
            promoBanners.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                onView={() => handleView(banner)}
                onEdit={() => openEditModal(banner)}
                onDelete={() => handleDelete(banner.id)}
              />
            ))
          )}
        </div>
      )}

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

            {/* Modal Body */}
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

                  {/* Pengaturan */}
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
                        <option>Hero Banner</option>
                        <option>Sidebar</option>
                        <option>Footer</option>
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
                        {["1", "2", "3", "4", "5"].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
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
                        <option>Semua Device</option>
                        <option>Desktop</option>
                        <option>Mobile</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-base font-medium">
                        Target Penonton
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {["Semua", "Pengguna Baru", "Pengguna Lama"].map(
                          (t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() =>
                                handleInputChange("targetPenonton", t)
                              }
                              className={`rounded px-4 py-2 text-sm transition ${formData.targetPenonton === t ? "bg-blue-500 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
                              disabled={submitting}
                            >
                              {t}
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
                        {kategoris.map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => toggleKategori(k)}
                            className={`rounded px-4 py-2 text-sm transition ${formData.fokusKategori.includes(k) ? "bg-blue-500 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
                            disabled={submitting}
                          >
                            {k}
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
                    <Icons.Spinner /> Menyimpan...
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

      {showModalPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">
              <h2 className="text-2xl font-bold">
                {editingBannerPromo ? "Edit Banner" : "Tambah Banner Baru"}
              </h2>
              <button
                onClick={() => setShowModalPromo(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={submitting}
              >
                <Icons.X />
              </button>
            </div>

            {/* Modal Body */}
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

                  {/* Pengaturan */}
                  <div className="space-y-5">
                    <h3 className="text-lg font-semibold">Pengaturan Jadwal</h3>
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
                        {["1", "2", "3", "4", "5"].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
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
                        <option>Semua Device</option>
                        <option>Desktop</option>
                        <option>Mobile</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-base font-medium">
                        Target Penonton
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {["Semua", "Pengguna Baru", "Pengguna Lama"].map(
                          (t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() =>
                                handleInputChange("targetPenonton", t)
                              }
                              className={`rounded px-4 py-2 text-sm transition ${formData.targetPenonton === t ? "bg-blue-500 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
                              disabled={submitting}
                            >
                              {t}
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
                        Judul Banner <span className="text-red-500">*</span>{" "}
                        (Maks 20 karakter)
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan judul banner"
                        maxLength={24}
                        value={formData.judul}
                        onChange={(e) =>
                          handleInputChange(
                            "judul",
                            e.target.value.slice(0, 20),
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
                        Fokus Kategori
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {kategoris.map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => toggleKategori(k)}
                            className={`rounded px-4 py-2 text-sm transition ${formData.fokusKategori.includes(k) ? "bg-blue-500 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
                            disabled={submitting}
                          >
                            {k}
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
                onClick={() => setShowModalPromo(false)}
                disabled={submitting}
                className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-base font-medium transition hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitPromo}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-base font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Icons.Spinner /> Menyimpan...
                  </>
                ) : editingBannerPromo ? (
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
