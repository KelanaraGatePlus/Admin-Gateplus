import React from "react";
import { useState, useRef, useEffect } from "react";
import { ModalBase } from "../body/base";
import { ModalHeader } from "../body/header";
import { Icons } from "@/components/Icons/icons";
import PropTypes from "prop-types";

export function AddGenreModal({ onClose, onSave, loading, formData, onInputChange, submitting, onImageUpload, onSecondaryImageUpload }) {
    const [names, setNames] = useState("");
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const preview = names.trim()
        ? names.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    return (
        <ModalBase onClose={onClose}>
            <ModalHeader
                icon={<Icons.Plus size={17} color="#1297DC" />}
                title="Tambah Genre Baru"
                subtitle="Masukkan satu atau beberapa genre sekaligus"
                onClose={onClose}
            />
            <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
                {/* Tip */}
                <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-4 bg-blue-50 border border-blue-100">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1297DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-xs text-blue-600 leading-relaxed">
                        Pisahkan dengan <span className="font-semibold">koma (,)</span> untuk menambahkan banyak genre. Contoh: <em className="text-blue-400">Action, Horror, Romance</em>
                    </p>
                </div>

                {/* Nama Genre */}
                <div className="mb-4">
                    <label className="text-xs font-semibold uppercase tracking-wider block mb-2 text-gray-500">
                        Nama Genre <span className="text-red-400">*</span>
                    </label>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Contoh: Action, Horror, Romance"
                        value={names}
                        onChange={(e) => setNames(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && names.trim()) onSave(names); }}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-sm text-gray-900 focus:outline-none transition-all bg-gray-50 border-2 border-gray-200 focus:border-[#1297DC] focus:bg-white placeholder-gray-400"
                    />
                </div>

                {/* Dua kolom upload di desktop, satu kolom di mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                    {/* Cover Image (coverImageUrl) */}
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
                                id="genre-cover-upload"
                                disabled={submitting}
                            />
                            <label
                                htmlFor="genre-cover-upload"
                                className={`inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 ${submitting ? "pointer-events-none opacity-50" : ""}`}
                            >
                                <Icons.Plus size={14} /> Upload Cover
                            </label>
                            {formData?.imageFile && (
                                <p className="mt-1.5 text-xs text-gray-500 truncate px-1">{formData.imageFile.name}</p>
                            )}
                        </div>
                    </div>

                    {/* Secondary Cover Image (secondaryCoverImageUrl) */}
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
                                id="genre-secondary-upload"
                                disabled={submitting}
                            />
                            <label
                                htmlFor="genre-secondary-upload"
                                className={`inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 ${submitting ? "pointer-events-none opacity-50" : ""}`}
                            >
                                <Icons.Plus size={14} /> Upload Cover
                            </label>
                            {formData?.secondaryImageFile && (
                                <p className="mt-1.5 text-xs text-gray-500 truncate px-1">{formData.secondaryImageFile.name}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview tags */}
                {preview.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400">Preview</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {preview.map((g, i) => (
                                <span key={i} className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700">
                                    <Icons.Tag size={10} color="#1297DC" />
                                    {g}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs mt-1.5 text-gray-400">{preview.length} genre akan ditambahkan</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 sm:gap-3 mt-5">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        Batal
                    </button>
                    <button
                        onClick={() => onSave(names)}
                        disabled={!names.trim() || loading}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed bg-[#1297DC] hover:bg-[#0e7db8] text-white"
                    >
                        {loading
                            ? <><Icons.Spinner size={14} /> <span>Menyimpan...</span></>
                            : <><Icons.Plus size={14} /> <span>Simpan Genre</span></>
                        }
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}

AddGenreModal.propTypes = {
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

AddGenreModal.defaultProps = {
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