import React from "react";
import PropTypes from "prop-types";
import { useState, useRef, useMemo } from "react"; // Tambah useMemo untuk preview
import generateId from "@/lib/idGenerator";

export default function CardInputModal({
  cardUiId,
  cardOrder,
  totalGacha,
  abbreviation,
  onConfirm,
  onCancel,
}) {
  const [aspect, setAspect] = useState("portrait");
  const [cardName, setCardName] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [modalErrors, setModalErrors] = useState({});
  const fileInputRef = useRef(null);

  const aspectRatio = aspect === "portrait" ? 339 / 512 : 16 / 9;

  // Membuat preview URL secara otomatis saat ada file baru
  const previewUrl = useMemo(() => {
    return pendingFile ? URL.createObjectURL(pendingFile) : null;
  }, [pendingFile]);

  const previewCardId = generateId(
    abbreviation || "XX",
    totalGacha || 0,
    cardOrder,
    cardUiId,
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Langsung simpan file asli tanpa lewat cropper
    setPendingFile(file);
    setModalErrors((prev) => ({ ...prev, file: undefined }));

    // Reset value input agar bisa upload file yang sama berkali-kali jika perlu
    e.target.value = "";
  };

  const handleConfirm = () => {
    const errs = {};
    if (!pendingFile) errs.file = "Upload gambar kartu terlebih dahulu";
    if (!cardName.trim()) errs.cardName = "Nama kartu wajib diisi";

    if (Object.keys(errs).length > 0) {
      setModalErrors(errs);
      return;
    }

    onConfirm({
      file: pendingFile,
      preview: previewUrl,
      cardName,
      aspect,
      aspectRatio,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-4">
      <div className="flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🃏</span>
            <h2 className="text-base font-bold text-gray-800">Card Input</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* Pilih Orientasi */}
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700">
              Upload Card Artwork <span className="text-red-500">*</span>
            </p>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspect("portrait")}
                className={`flex flex-col items-center gap-3 rounded-xl border-2 py-4 transition sm:py-5 ${
                  aspect === "portrait"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`rounded-md ${aspect === "portrait" ? "bg-blue-200" : "bg-gray-200"}`}
                  style={{ width: 36, height: 54 }}
                />
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800">
                    Portrait
                  </p>
                  <p
                    className={`text-xs ${aspect === "portrait" ? "text-blue-500" : "text-gray-400"}`}
                  >
                    Vertical
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAspect("landscape")}
                className={`flex flex-col items-center gap-3 rounded-xl border-2 py-4 transition sm:py-5 ${
                  aspect === "landscape"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`rounded-md ${aspect === "landscape" ? "bg-blue-200" : "bg-gray-200"}`}
                  style={{ width: 80, height: 46 }}
                />
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800">
                    Landscape
                  </p>
                  <p
                    className={`text-xs ${aspect === "landscape" ? "text-blue-500" : "text-gray-400"}`}
                  >
                    Horizontal
                  </p>
                </div>
              </button>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 transition sm:py-8 ${
                modalErrors.file
                  ? "border-red-400 bg-red-50/30"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
              }`}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="max-h-36 rounded-lg object-contain sm:max-h-40"
                />
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-600">
                    Click to upload card artwork
                  </p>
                  <p className="text-xs text-gray-400">
                    JPG atau PNG (maks 5MB)
                  </p>
                </>
              )}
            </div>
            {modalErrors.file && (
              <p className="mt-1 text-xs text-red-500">⚠ {modalErrors.file}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpg,image/png"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Card Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Card Name *
            </label>
            <input
              type="text"
              placeholder="Nama kartu"
              value={cardName}
              onChange={(e) => {
                setCardName(e.target.value);
                if (modalErrors.cardName)
                  setModalErrors((prev) => ({ ...prev, cardName: undefined }));
              }}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 outline-none ${
                modalErrors.cardName
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              }`}
            />
            {modalErrors.cardName && (
              <p className="mt-1 text-xs text-red-500">
                ⚠ {modalErrors.cardName}
              </p>
            )}
          </div>

          {/* Card ID Preview */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Card ID
            </label>
            <input
              type="text"
              value={previewCardId}
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 font-mono text-sm text-gray-700 outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 gap-3 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none sm:px-5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 sm:flex-none sm:px-5"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

CardInputModal.propTypes = {
  cardUiId: PropTypes.number.isRequired,
  cardOrder: PropTypes.number.isRequired,
  totalGacha: PropTypes.number.isRequired,
  abbreviation: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
