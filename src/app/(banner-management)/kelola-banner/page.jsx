"use client";

import React, { useState, useEffect } from "react";
import { bannerAPI } from "@/hooks/api/bannerAPI";
import { bannerPromoAPI } from "@/hooks/api/bannerPromoSliceAPI";
import BannerCard from "@/components/banner/bannerCard";
import { Icons } from "@/components/Icons/icons";
import useBannerManager from "@/hooks/use-banner-manager";
import BannerModal from "@/components/Modal/BannerModal";
import NotificationModal from "@/components/Modal/NotificationModal";
import ConfirmModal from "@/components/Modal/ConfirmModal";
import ImageCropperModal from "@/components/Modal/imageCropperModal";

const mapFormDataToAPI = (formData, type = "konten") => {
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
  form.append("priority", formData.prioritas);
  form.append("bannerType", formData.bannerType || "DEFAULT");
  form.append("targetDevice", targetDeviceMap[formData.targetDevice] || "ALL");
  form.append(
    "targetAudience",
    targetAudienceMap[formData.targetPenonton] || "ALL",
  );
  form.append("isActive", formData.statusAktif);
  form.append("focusCategories", JSON.stringify(formData.fokusKategori || []));
  if (formData.linkUrl) form.append("linkUrl", formData.linkUrl);
  if (formData.berlakuDari) form.append("startDate", formData.berlakuDari);
  if (formData.berlakuSampai) form.append("endDate", formData.berlakuSampai);
  if (formData.imageFile) form.append("imageFile", formData.imageFile);

  if (type === "konten") {
    form.append("position", positionMap[formData.posisi] || "HERO");
    if (formData.subJudul) form.append("subTitle", formData.subJudul);
    if (formData.deskripsi) form.append("description", formData.deskripsi);
    if (formData.textButton) form.append("buttonText", formData.textButton);
    if (formData.trailerFile) form.append("trailerFile", formData.trailerFile);
    if (formData.posterFile) form.append("posterFile", formData.posterFile);
    if (formData.titleImageFile)
      form.append("titleImageFile", formData.titleImageFile);
  }

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
    posterFile: null,
    posterPreview: apiData.posterUrl || null,
    posterUrl: apiData.posterUrl || "",
    titleImageFile: null,
    titleImagePreview: apiData.titleImageUrl || null,
    titleImageUrl: apiData.titleImageUrl || "",
    bannerType: apiData.bannerType || "DEFAULT",
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
  bannerType: "DEFAULT",
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
  posterFile: null,
  posterPreview: null,
  posterUrl: "",
  titleImageFile: null,
  titleImagePreview: null,
  titleImageUrl: "",
};

export default function KelolaBannerPage() {
  const [activeTab, setActiveTab] = useState("konten");

  const [showCropper, setShowCropper] = useState({
    isOpen: false,
    imageSrc: null,
    aspect: 3 / 1,
    target: "image",
  });

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

  const [showModal, setShowModal] = useState(false);
  const [showModalPromo, setShowModalPromo] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editingBannerPromo, setEditingBannerPromo] = useState(null);
  const [formData, setFormData] = useState(defaultKontenForm);
  const [submitting, setSubmitting] = useState(false);

  const konten = useBannerManager({
    fetchFn: bannerAPI.getAllBanners,
    enabled: true,
  });

  const promo = useBannerManager({
    fetchFn: bannerPromoAPI.getAllBannersPromo,
    enabled: true,
  });

  // reset form ketika close
  useEffect(() => {
    if (!showModal && !showModalPromo) {
      setFormData(defaultKontenForm);
      setEditingBanner(null);
      setEditingBannerPromo(null);
      setSubmitting(false);
    }
  }, [showModal, showModalPromo]);

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = (e, type = activeTab) => {
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
    reader.onloadend = () => {
      setShowCropper({
        isOpen: true,
        imageSrc: reader.result,
        aspect: type === "konten" ? 16 / 9 : 3 / 1,
        target: "image",
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePosterUpload = (e) => {
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
    reader.onloadend = () => {
      setShowCropper({
        isOpen: true,
        imageSrc: reader.result,
        aspect: 3 / 4,
        target: "poster",
      });
    };
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

  const handleCropDone = (blob) => {
    const croppedFile = new File(
      [blob],
      showCropper.target === "poster" ? "poster-cropped.jpg" : "banner-cropped.jpg",
      {
        type: blob.type,
      },
    );
    const previewUrl = URL.createObjectURL(blob);
    setFormData((prev) =>
      showCropper.target === "poster"
        ? {
            ...prev,
            posterFile: croppedFile,
            posterPreview: previewUrl,
            posterUrl: previewUrl,
          }
        : {
            ...prev,
            imageFile: croppedFile,
            imagePreview: previewUrl,
            imageUrl: previewUrl,
          },
    );
    setShowCropper({
      isOpen: false,
      imageSrc: null,
      aspect: 3 / 1,
      target: "image",
    });
  };

  const handleCropCancel = () => {
    setShowCropper({
      isOpen: false,
      imageSrc: null,
      aspect: 3 / 1,
      target: "image",
    });
  };

  const openCreateModal = (type = "konten") => {
    if (type === "konten") setEditingBanner(null);
    else setEditingBannerPromo(null);
    setFormData(defaultKontenForm);
    if (type === "konten") setShowModal(true);
    else setShowModalPromo(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData(mapAPIDataToForm(banner));
    setShowModal(true);
  };

  const openEditPromoModal = async (banner) => {
    setEditingBannerPromo(banner);
    setFormData(mapAPIDataToForm(banner));
    setShowModalPromo(true);
  };

  const handleSubmit = async (type = "konten") => {
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

    const isKonten = type === "konten";
    const editing = isKonten ? editingBanner : editingBannerPromo;
    const refetch = isKonten ? konten.refetch : promo.refetch;
    const closeModal = isKonten
      ? () => setShowModal(false)
      : () => setShowModalPromo(false);

    setSubmitting(true);
    try {
      const apiData = mapFormDataToAPI(formData, type);
      let response;

      if (editing) {
        response = isKonten
          ? await bannerAPI.updateBanner(editing.id, apiData)
          : await bannerPromoAPI.updateBannerPromo(editing.id, apiData);
      } else {
        response = isKonten
          ? await bannerAPI.createBanner(apiData)
          : await bannerPromoAPI.createBannerPromo(apiData);
      }

      if (response.success) {
        showNotification(
          "success",
          "Berhasil!",
          `Banner berhasil ${editing ? "diperbarui" : "ditambahkan"}`,
        );
        closeModal();
        refetch();
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

  const handleDelete = async (bannerId, type = "konten") => {
    const isKonten = type === "konten";
    const refetch = isKonten ? konten.refetch : promo.refetch;

    showConfirm(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus banner ini? Tindakan ini tidak dapat dibatalkan.",
      async () => {
        try {
          const response = isKonten
            ? await bannerAPI.deleteBanner(bannerId)
            : await bannerPromoAPI.deleteBannerPromo(bannerId);

          if (response.success) {
            showNotification("success", "Berhasil!", "Banner berhasil dihapus");
            refetch();
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

  return (
    <>
      {showCropper.isOpen && showCropper.imageSrc && (
        <ImageCropperModal
          image={showCropper.imageSrc}
          aspectRatio={showCropper.aspect}
          onCropComplete={handleCropDone}
          onCancel={handleCropCancel}
          title={
            showCropper.target === "poster"
              ? "Crop Poster (3:4)"
              : "Crop Gambar Banner"
          }
        />
      )}

      <div className="min-h-screen bg-gray-50 p-6">
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

          <div className="mx-4 my-6 flex items-center justify-between rounded-md bg-blue-600 px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-white">
                {activeTab === "konten" ? "Banner Konten" : "Banner Promo"}
              </h1>
              <p className="mt-0.5 text-sm text-blue-100">
                {activeTab === "konten"
                  ? "Banner konten format 16:9"
                  : "Banner promosi format 3:1"}
              </p>
            </div>
            <button
              onClick={() => openCreateModal(activeTab)}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
            >
              <Icons.Plus /> Tambah
            </button>
          </div>

          {/* stats*/}
          <div className="grid grid-cols-2 gap-4 border-b border-gray-100 px-4 py-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-6 py-4">
              <p className="mb-1 text-xs text-gray-500">Total Banner</p>
              <p className="text-2xl font-bold text-blue-600">
                {activeTab === "konten"
                  ? konten.stats.totalBanners
                  : promo.stats.totalBanners}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-6 py-4">
              <p className="mb-1 text-xs text-gray-500">Aktif</p>
              <p className="text-2xl font-bold text-blue-600">
                {activeTab === "konten"
                  ? konten.stats.activeBanners
                  : promo.stats.activeBanners}
              </p>
            </div>
          </div>

          {/* search */}
          <div className="relative z-20 flex gap-3 p-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={
                  activeTab === "konten"
                    ? "Cari banner konten..."
                    : "Cari banner promo..."
                }
                value={
                  activeTab === "konten"
                    ? konten.searchQuery
                    : promo.searchQuery
                }
                onChange={(e) =>
                  activeTab === "konten"
                    ? konten.setSearchQuery(e.target.value)
                    : promo.setSearchQuery(e.target.value)
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
                    ? konten.setShowFilterMenu(!konten.showFilterMenu)
                    : promo.setShowFilterMenu(!promo.showFilterMenu)
                }
                className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                <Icons.Filter /> Filter Status <Icons.ChevronDown />
              </button>
              {/* dropdown konten */}
              {activeTab === "konten" && konten.showFilterMenu && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-300 bg-white shadow-lg">
                  {[
                    ["all", "Semua Banner"],
                    ["aktif", "Aktif"],
                    ["nonaktif", "Nonaktif"],
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => {
                        konten.setShowFilterStatus(val);
                        konten.setShowFilterMenu(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${konten.showFilterStatus === val ? "bg-blue-50 text-blue-600" : ""}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {/* dropdown promo */}
              {activeTab === "promo" && promo.showFilterMenu && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-300 bg-white shadow-lg">
                  {[
                    ["all", "Semua Banner"],
                    ["aktif", "Aktif"],
                    ["nonaktif", "Nonaktif"],
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => {
                        promo.setShowFilterStatus(val);
                        promo.setShowFilterMenu(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${promo.showFilterStatus === val ? "bg-blue-50 text-blue-600" : ""}`}
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
          konten.loading ? (
            <div className="flex items-center justify-center py-12">
              <Icons.Spinner />
              <span className="ml-2 text-gray-600">Memuat data banner...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-4">
              {konten.banners.length === 0 ? (
                <div className="col-span-2 rounded-lg bg-white py-12 text-center shadow">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Icons.Image />
                    <p className="mt-4 text-gray-500">
                      Tidak ada banner konten yang ditemukan
                    </p>
                  </div>
                </div>
              ) : (
                konten.banners.map((banner) => (
                  <BannerCard
                    key={banner.id}
                    banner={banner}
                    onView={() => handleView(banner)}
                    onEdit={() => openEditModal(banner)}
                    onDelete={() => handleDelete(banner.id, "konten")}
                  />
                ))
              )}
            </div>
          )
        ) : // tab promo
        promo.loading ? (
          <div className="flex items-center justify-center py-12">
            <Icons.Spinner />
            <span className="ml-2 text-gray-600">
              Memuat data banner promo...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {promo.banners.length === 0 ? (
              <div className="col-span-2 rounded-lg bg-white py-12 text-center shadow">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Icons.Image />
                  <p className="mt-4 text-gray-500">
                    Tidak ada banner promo yang ditemukan
                  </p>
                </div>
              </div>
            ) : (
              promo.banners.map((banner) => (
                <BannerCard
                  key={banner.id}
                  banner={banner}
                  onView={() => handleView(banner)}
                  onEdit={() => openEditPromoModal(banner)}
                  onDelete={() => handleDelete(banner.id, "promo")}
                />
              ))
            )}
          </div>
        )}

        <BannerModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={() => handleSubmit("konten")}
          editing={editingBanner}
          formData={formData}
          onInputChange={handleInputChange}
          onImageUpload={handleImageUpload}
          onPosterUpload={handlePosterUpload}
          onTrailerUpload={handleTrailerUpload}
          submitting={submitting}
          type="konten"
        />

        <BannerModal
          isOpen={showModalPromo}
          onClose={() => setShowModalPromo(false)}
          onSubmit={() => handleSubmit("promo")}
          editing={editingBannerPromo}
          formData={formData}
          onInputChange={handleInputChange}
          onImageUpload={handleImageUpload}
          onPosterUpload={handlePosterUpload}
          submitting={submitting}
          type="promo"
        />
      </div>
    </>
  );
}
