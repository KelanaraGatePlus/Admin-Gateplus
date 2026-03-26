import React from "react";
import PropTypes from "prop-types";
import { Icons } from "../banner/icons";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya",
  cancelText = "Batal",
}) {
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
}
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
