import { Icons } from "@/components/Icons/icons";
import PropTypes from "prop-types";
import React from "react";

const kategoris = ["Semua", "Movie", "Series", "E-Book", "Komik", "Podcast"];
const bannerTypeOptions = [
  "ADVANCE_CONTENT_PROMO",
  "DEFAULT",
  "TRAILER_PROMO",
];

export default function BannerModal({
  isOpen,
  onClose,
  onSubmit,
  editing,
  formData,
  onInputChange,
  onImageUpload,
  onPosterUpload,
  onTrailerUpload,
  submitting,
  type = "konten",
}) {
  if (!isOpen) return null;

  const isKonten = type === "konten";
  const selectedBannerType = formData.bannerType || "DEFAULT";
  const showTrailerUpload =
    isKonten &&
    ["TRAILER_PROMO", "ADVANCE_CONTENT_PROMO"].includes(selectedBannerType);
  const showPosterUpload =
    isKonten && selectedBannerType === "ADVANCE_CONTENT_PROMO";
  const showTitleImageUpload =
    isKonten &&
    ["TRAILER_PROMO", "ADVANCE_CONTENT_PROMO"].includes(selectedBannerType);

  const toggleKategori = (kategori) => {
    if (kategori === "Semua") {
      onInputChange("fokusKategori", ["Semua"]);
    } else {
      const filtered = formData.fokusKategori.filter((k) => k !== "Semua");
      const exists = filtered.includes(kategori);
      const next = exists
        ? filtered.filter((k) => k !== kategori)
        : [...filtered, kategori];
      onInputChange("fokusKategori", next.length === 0 ? ["Semua"] : next);
    }
  };

  const imageInputId = isKonten
    ? "banner-upload-konten"
    : "banner-upload-promo";

  const handleAdditionalImageUpload = (e, fieldFile, fieldPreview, fieldUrl) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onInputChange(fieldFile, file);
    onInputChange(fieldPreview, previewUrl);
    onInputChange(fieldUrl, previewUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">
          <h2 className="text-2xl font-bold">
            {editing ? "Edit Banner" : "Tambah Banner Baru"}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icons.X />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          {isKonten && (
            <div className="mb-6">
              <label className="mb-2 block text-base font-semibold">
                Banner Type
              </label>
              <div className="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-1">
                {bannerTypeOptions.map((option) => {
                  const isActive = formData.bannerType === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onInputChange("bannerType", option)}
                      disabled={submitting}
                      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow"
                          : "text-gray-600 hover:bg-white"
                      } ${submitting ? "opacity-60" : ""}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">
            {/* ── Kolom Kiri ── */}
            <div>
              <h3 className="mb-6 text-lg font-semibold">Tambahkan Banner</h3>

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
                      onClick={() => {
                        onInputChange("imageFile", null);
                        onInputChange("imagePreview", null);
                        onInputChange("imageUrl", "");
                      }}
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
                  onChange={onImageUpload}
                  className="hidden"
                  id={imageInputId}
                  disabled={submitting}
                />
                <label
                  htmlFor={imageInputId}
                  className={`inline-flex cursor-pointer items-center gap-2 text-base font-medium text-blue-500 hover:text-blue-600 ${submitting ? "pointer-events-none opacity-50" : ""}`}
                >
                  <Icons.Plus /> Upload Gambar
                </label>
                <p className="mt-3 text-sm text-gray-500">
                  {isKonten
                    ? "Rekomendasi: 1920x1080, maksimal 5MB"
                    : "Rekomendasi: 1200x400, maksimal 5MB"}
                </p>
                {formData.imageFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    {formData.imageFile.name}
                  </p>
                )}
              </div>

              {/* Trailer Upload — khusus konten */}
              {showTrailerUpload && (
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
                        onClick={() => {
                          onInputChange("trailerFile", null);
                          onInputChange("trailerPreview", null);
                          onInputChange("trailerUrl", "");
                        }}
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
                    onChange={onTrailerUpload}
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
              )}

              {showPosterUpload && (
                <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-blue-400">
                  <h4 className="mb-3 font-semibold">Upload Poster</h4>
                  {formData.posterPreview ? (
                    <div className="relative">
                      <img
                        src={formData.posterPreview}
                        alt="Poster preview"
                        className="mb-3 h-48 w-full rounded object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onInputChange("posterFile", null);
                          onInputChange("posterPreview", null);
                          onInputChange("posterUrl", "");
                        }}
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
                    onChange={onPosterUpload}
                    className="hidden"
                    id="poster-upload"
                    disabled={submitting}
                  />
                  <label
                    htmlFor="poster-upload"
                    className={`inline-flex cursor-pointer items-center gap-2 text-base font-medium text-blue-500 hover:text-blue-600 ${submitting ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <Icons.Plus /> Upload Poster
                  </label>
                  <p className="mt-3 text-sm text-gray-500">
                    Rekomendasi: image, maksimal 5MB
                  </p>
                  {formData.posterFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      {formData.posterFile.name}
                    </p>
                  )}
                </div>
              )}

              {showTitleImageUpload && (
                <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-blue-400">
                  <h4 className="mb-3 font-semibold">Upload Title Image</h4>
                  {formData.titleImagePreview ? (
                    <div className="relative">
                      <img
                        src={formData.titleImagePreview}
                        alt="Title image preview"
                        className="mb-3 h-48 w-full rounded object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onInputChange("titleImageFile", null);
                          onInputChange("titleImagePreview", null);
                          onInputChange("titleImageUrl", "");
                        }}
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
                    onChange={(e) =>
                      handleAdditionalImageUpload(
                        e,
                        "titleImageFile",
                        "titleImagePreview",
                        "titleImageUrl",
                      )
                    }
                    className="hidden"
                    id="title-image-upload"
                    disabled={submitting}
                  />
                  <label
                    htmlFor="title-image-upload"
                    className={`inline-flex cursor-pointer items-center gap-2 text-base font-medium text-blue-500 hover:text-blue-600 ${submitting ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <Icons.Plus /> Upload Title Image
                  </label>
                  <p className="mt-3 text-sm text-gray-500">
                    Rekomendasi: image, maksimal 5MB
                  </p>
                  {formData.titleImageFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      {formData.titleImageFile.name}
                    </p>
                  )}
                </div>
              )}

              {/* Pengaturan */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold">Pengaturan</h3>

                {/* Posisi — khusus konten */}
                {isKonten && (
                  <div>
                    <label className="mb-2 block text-base font-medium">
                      Posisi Banner
                    </label>
                    <select
                      value={formData.posisi}
                      onChange={(e) => onInputChange("posisi", e.target.value)}
                      className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      disabled={submitting}
                    >
                      <option>Hero Banner</option>
                      <option>Sidebar</option>
                      <option>Footer</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-base font-medium">
                    Prioritas Tampil
                  </label>
                  <select
                    value={formData.prioritas}
                    onChange={(e) => onInputChange("prioritas", e.target.value)}
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
                      onInputChange("targetDevice", e.target.value)
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
                    {["Semua", "Pengguna Baru", "Pengguna Lama"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onInputChange("targetPenonton", t)}
                        disabled={submitting}
                        className={`rounded px-4 py-2 text-sm transition ${formData.targetPenonton === t ? "bg-blue-500 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
                      >
                        {t}
                      </button>
                    ))}
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
                        onInputChange("statusAktif", e.target.checked)
                      }
                      className="peer sr-only"
                      disabled={submitting}
                    />
                    <div className="peer h-7 w-14 rounded-full bg-gray-200 peer-checked:bg-green-500 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[4px] after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                  </label>
                </div>
              </div>
            </div>

            {/* ── Kolom Kanan ── */}
            <div>
              <h3 className="mb-6 text-lg font-semibold">Informasi Dasar</h3>
              <div className="space-y-5">
                {/* Sub Judul — khusus konten */}
                {isKonten && (
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
                        onInputChange("subJudul", e.target.value.slice(0, 42))
                      }
                      className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      disabled={submitting}
                    />
                    <p className="mt-1 text-right text-sm text-gray-500">
                      {formData.subJudul?.length || 0}/42
                    </p>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-base font-medium">
                    Judul Banner <span className="text-red-500">*</span> (Maks{" "}
                    {isKonten ? 24 : 20} karakter)
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan judul banner"
                    maxLength={isKonten ? 24 : 20}
                    value={formData.judul}
                    onChange={(e) =>
                      onInputChange(
                        "judul",
                        e.target.value.slice(0, isKonten ? 24 : 20),
                      )
                    }
                    className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                    disabled={submitting}
                  />
                  <p className="mt-1 text-right text-sm text-gray-500">
                    {formData.judul?.length || 0}/{isKonten ? 24 : 20}
                  </p>
                </div>

                {/* Deskripsi — khusus konten */}
                {isKonten && (
                  <div>
                    <label className="mb-2 block text-base font-medium">
                      Deskripsi (Maks 216 karakter)
                    </label>
                    <textarea
                      placeholder="Deskripsi banner.."
                      maxLength={216}
                      value={formData.deskripsi}
                      onChange={(e) =>
                        onInputChange("deskripsi", e.target.value.slice(0, 216))
                      }
                      className="h-28 w-full resize-none rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      disabled={submitting}
                    />
                    <p className="mt-1 text-right text-sm text-gray-500">
                      {formData.deskripsi?.length || 0}/216
                    </p>
                  </div>
                )}

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
                        disabled={submitting}
                        className={`rounded px-4 py-2 text-sm transition ${formData.fokusKategori.includes(k) ? "bg-blue-500 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-base font-medium">
                    Link URL {isKonten && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="url"
                    placeholder="https://gateplus.id/promo"
                    value={formData.linkUrl}
                    onChange={(e) => onInputChange("linkUrl", e.target.value)}
                    className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required={isKonten}
                    disabled={submitting}
                  />
                </div>

                {/* Text Button — khusus konten */}
                {isKonten && (
                  <div>
                    <label className="mb-2 block text-base font-medium">
                      Text Button
                    </label>
                    <input
                      type="text"
                      value={formData.textButton}
                      onChange={(e) =>
                        onInputChange("textButton", e.target.value)
                      }
                      className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      disabled={submitting}
                    />
                  </div>
                )}

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
                          onInputChange("berlakuDari", e.target.value)
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
                          onInputChange("berlakuSampai", e.target.value)
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

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-4 border-t bg-white p-6">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-base font-medium transition hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-base font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Icons.Spinner /> Menyimpan...
              </>
            ) : editing ? (
              "Update Banner"
            ) : (
              "Tambah Banner"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

BannerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editing: PropTypes.object,
  formData: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onImageUpload: PropTypes.func.isRequired,
  onPosterUpload: PropTypes.func,
  onTrailerUpload: PropTypes.func,
  submitting: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(["konten", "promo"]),
};
