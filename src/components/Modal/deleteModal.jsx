"use client";

import React from "react";
import PropTypes from "prop-types";

export default function DeleteModal({
  isOpen,
  item,
  onConfirm,
  onCancel,
  isDeleting,
  title = "Hapus Data?",
  message = "Data ini akan dihapus permanen.",
  confirmText = "Hapus",
  cancelText = "Batal",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl bg-white p-8 text-center shadow-xl">
        {/* Icon Tong Sampah (Tetap Merah) */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg
            width={28}
            height={28}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </div>

        {/* Judul Dinamis */}
        <h3 className="mb-2 text-lg font-bold text-gray-800">{title}</h3>

        {/* Pesan Dinamis + Nama Item */}
        <p className="mb-1 text-sm text-gray-500">
          {message}{" "}
          {item && (
            <span className="font-semibold text-gray-700">
              {item?.title ?? item?.name ?? item?.id}
            </span>
          )}
        </p>

        <p className="mb-8 text-xs text-red-400">
          Tindakan ini tidak bisa dibatalkan.
        </p>

        {/* Tombol Aksi */}
        <div className="flex w-full gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting ? "Menghapus..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  item: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};
