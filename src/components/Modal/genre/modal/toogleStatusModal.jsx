import React from "react";
import { ModalBase } from "../body/base";
import { Icons } from "@/components/Icons/icons";
import PropTypes from "prop-types";

export function ToggleStatusModal({ genre, onClose, onConfirm, loading }) {
    const willActivate = !genre.isActive;

    return (
        <ModalBase onClose={onClose} maxWidth="max-w-sm">
            <div className="p-6">
                <div className="flex justify-center mb-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border
            ${willActivate ? "bg-green-50 border-green-100" : "bg-gray-100 border-gray-200"}`}>
                        {willActivate ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                        )}
                    </div>
                </div>

                <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
                    {willActivate ? "Aktifkan Genre?" : "Nonaktifkan Genre?"}
                </h2>
                <p className="text-sm text-center mb-6 leading-relaxed text-gray-500">
                    <span className="font-semibold text-gray-800">&ldquo;{genre.name}&rdquo;</span>{" "}
                    {willActivate
                        ? "akan diaktifkan dan dapat digunakan kembali dalam konten."
                        : "akan disembunyikan dari pilihan konten baru."}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-40 text-white
              ${willActivate ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}`}
                    >
                        {loading
                            ? <><Icons.Spinner size={14} /> Memproses...</>
                            : willActivate ? "Ya, Aktifkan" : "Ya, Nonaktifkan"}
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}

ToggleStatusModal.propTypes = {
    genre: PropTypes.shape({
        name: PropTypes.string.isRequired,
        isActive: PropTypes.bool.isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};

ToggleStatusModal.defaultProps = {
    loading: false,
};