import React from "react";
import PropTypes from "prop-types";
import { Icons } from "../Icons/icons";

export default function NotificationModal({
  isOpen,
  onClose,
  type = "success",
  title,
  message,
}) {
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
}

NotificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(["success", "error", "warning"]),
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};
NotificationModal.defaultProps = { type: "success" };
