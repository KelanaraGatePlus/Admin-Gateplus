import React from "react";
import { useState, useRef, useEffect } from "react";
import { ModalBase } from "../body/base";
import { ModalHeader } from "../body/header";
import { Icons } from "@/components/Icons/icons";
import PropTypes from "prop-types";

export function EditGenreModal({ genre, onClose, onSave, loading, formData, onInputChange, submitting, onImageUpload, onSecondaryImageUpload }) {
  const [name, setName] = useState(genre.name || "");
  const inputRef = useRef(null);
  const hasChanged = name.trim() !== (genre.name || "").trim();

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <ModalBase onClose={onClose}>
      <ModalHeader
        icon={<Icons.Edit size={16} color="#1297DC" />}
        title="Ubah Genre"
        subtitle={`Mengedit "${genre.name}"`}
        onClose={onClose}
      />
      <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">

        {/* Nama Genre */}
        <div className="mb-4">
          <label className="text-xs font-semibold uppercase tracking-wider block mb-2 text-gray-500">
            Nama Genre <span className="text-red-400">*</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && name.trim() && hasChanged) onSave({ id: genre.id, name, isActive: genre.isActive }); }}
            className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 focus:outline-none transition-all bg-gray-50 border-2 border-gray-200 focus:border-[#1297DC] focus:bg-white"
          />
          {hasChanged && name.trim() && (
            <p className="text-xs mt-2 flex items-center gap-1.5 text-gray-400">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1297DC" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              <span>Dari</span>
              <span className="font-medium text-gray-500">{genre.name}</span>
              <span className="text-gray-300">→</span>
              <span className="font-semibold text-gray-800">{name.trim()}</span>
            </p>
          )}
        </div>

        {/* Dua kolom upload */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

          {/* Cover Utama */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2 text-gray-500">
              Cover Utama
            </label>
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition hover:border-blue-400">
              {formData?.imagePreview ? (
                <div className="relative">
                  <img
                    src={formData.imagePreview}
                    alt="Cover Preview"
                    className="mb-3 h-32 w-full rounded object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onInputChange("imageFile", null);
                      onInputChange("imagePreview", null);
                      onInputChange("imageUrl", "");
                    }}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-lg text-white hover:bg-red-600"
                    disabled={submitting}
                  >
                    ×
                  </button>
                </div>
              ) : genre.coverImageUrl ? (
                <div className="relative">
                  <img
                    src={genre.coverImageUrl}
                    alt="Cover saat ini"
                    className="mb-3 h-32 w-full rounded object-cover opacity-70"
                  />
                  <span className="absolute bottom-4 left-0 right-0 text-xs text-gray-500">Gambar saat ini</span>
                </div>
              ) : (
                <div className="mb-3 flex h-32 items-center justify-center rounded bg-gradient-to-br from-gray-100 to-gray-200">
                  <Icons.Upload />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="hidden"
                id="edit-genre-cover-upload"
                disabled={submitting}
              />
              <label
                htmlFor="edit-genre-cover-upload"
                className={`inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 ${submitting ? "pointer-events-none opacity-50" : ""}`}
              >
                <Icons.Plus size={14} /> {genre.coverImageUrl ? "Ganti Cover" : "Upload Cover"}
              </label>
              {formData?.imageFile && (
                <p className="mt-1.5 text-xs text-gray-500 truncate px-1">{formData.imageFile.name}</p>
              )}
            </div>
          </div>

          {/* Cover Sekunder */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2 text-gray-500">
              Cover Sekunder
            </label>
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition hover:border-blue-400">
              {formData?.secondaryImagePreview ? (
                <div className="relative">
                  <img
                    src={formData.secondaryImagePreview}
                    alt="Secondary Cover Preview"
                    className="mb-3 h-32 w-full rounded object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onInputChange("secondaryImageFile", null);
                      onInputChange("secondaryImagePreview", null);
                      onInputChange("secondaryImageUrl", "");
                    }}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-lg text-white hover:bg-red-600"
                    disabled={submitting}
                  >
                    ×
                  </button>
                </div>
              ) : genre.secondaryCoverImageUrl ? (
                <div className="relative">
                  <img
                    src={genre.secondaryCoverImageUrl}
                    alt="Secondary Cover saat ini"
                    className="mb-3 h-32 w-full rounded object-cover opacity-70"
                  />
                  <span className="absolute bottom-4 left-0 right-0 text-xs text-gray-500">Gambar saat ini</span>
                </div>
              ) : (
                <div className="mb-3 flex h-32 items-center justify-center rounded bg-gradient-to-br from-gray-100 to-gray-200">
                  <Icons.Upload />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={onSecondaryImageUpload}
                className="hidden"
                id="edit-genre-secondary-upload"
                disabled={submitting}
              />
              <label
                htmlFor="edit-genre-secondary-upload"
                className={`inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 ${submitting ? "pointer-events-none opacity-50" : ""}`}
              >
                <Icons.Plus size={14} /> {genre.secondaryCoverImageUrl ? "Ganti Cover" : "Upload Cover"}
              </label>
              {formData?.secondaryImageFile && (
                <p className="mt-1.5 text-xs text-gray-500 truncate px-1">{formData.secondaryImageFile.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-5 bg-amber-50 border border-amber-100">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs text-amber-700 leading-relaxed">
            Status <strong>aktif/nonaktif</strong> dapat diubah langsung melalui toggle di tabel.
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => onSave({
              id: genre.id,
              name,
              isActive: genre.isActive,
              coverImage: formData?.imageFile || null,
              secondaryImage: formData?.secondaryImageFile || null,
            })}
            disabled={(!name.trim() || !hasChanged) && !formData?.imageFile && !formData?.secondaryImageFile || loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed bg-[#1297DC] hover:bg-[#0e7db8] text-white"
          >
            {loading ? <><Icons.Spinner size={14} /> Menyimpan...</> : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

EditGenreModal.propTypes = {
  genre: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    isActive: PropTypes.bool,
    coverImageUrl: PropTypes.string,
    secondaryCoverImageUrl: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  submitting: PropTypes.bool,
  formData: PropTypes.shape({
    imagePreview: PropTypes.string,
    imageFile: PropTypes.any,
    imageUrl: PropTypes.string,
    secondaryImagePreview: PropTypes.string,
    secondaryImageFile: PropTypes.any,
    secondaryImageUrl: PropTypes.string,
  }),
  onInputChange: PropTypes.func,
  onImageUpload: PropTypes.func,
  onSecondaryImageUpload: PropTypes.func,
};

EditGenreModal.defaultProps = {
  loading: false,
  submitting: false,
  formData: {
    imagePreview: null,
    imageFile: null,
    imageUrl: "",
    secondaryImagePreview: null,
    secondaryImageFile: null,
    secondaryImageUrl: "",
  },
  onInputChange: () => { },
  onImageUpload: () => { },
  onSecondaryImageUpload: () => { },
};