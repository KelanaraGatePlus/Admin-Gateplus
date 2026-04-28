// components/Modal/ConfirmModal.js
import React from "react";
import PropTypes from "prop-types";
import { Icons } from "../Icons/icons"; // Pastikan path ini benar

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya",
  cancelText = "Batal",
  variant = "success",
  hideButtons = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          {variant === "success" ? (
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : (
            <Icons.AlertCircle />
          )}

          <h3 className="mt-4 mb-2 text-xl font-bold text-gray-800">{title}</h3>
          <p className="mb-6 text-gray-600">{message}</p>

          {/* Tampilkan tombol hanya jika hideButtons false */}
          {!hideButtons && (
            <div className="flex w-full gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 transition hover:bg-gray-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 rounded-md px-4 py-2 text-white transition ${
                  variant === "success"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {confirmText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["success", "danger"]),
  hideButtons: PropTypes.bool,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};
