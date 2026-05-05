import React from "react";

export function ToggleSwitch({ isActive, onToggle, loading }) {
    return (
        <button
            onClick={onToggle}
            disabled={loading}
            title={isActive ? "Klik untuk nonaktifkan" : "Klik untuk aktifkan"}
            className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
        ${isActive ? "bg-[#1297DC] focus:ring-[#1297DC]/40" : "bg-gray-300 focus:ring-gray-400/40"}
        ${loading ? "opacity-50 cursor-wait" : "cursor-pointer hover:opacity-90"}
      `}
        >
            {loading
                ? <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-3 h-3 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                </span>
                : <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200
              ${isActive ? "translate-x-5" : "translate-x-0"}
            `}
                />
            }
        </button>
    );
}