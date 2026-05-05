import React from "react";
import { useState } from "react";
import { ModalBase } from "../body/base";
import { Icons } from "@/components/Icons/icons";
import { formatRupiah } from "@/lib/formatAngka";
import PropTypes from "prop-types";

export function DeleteConfirmModal({ genre, onClose, onConfirm, loading }) {
    const [confirmText, setConfirmText] = useState("");
    const required = genre.name;
    const isMatch = confirmText.trim().toLowerCase() === required.toLowerCase();

    return (
        <ModalBase onClose={onClose} maxWidth="max-w-sm">
            <div className="p-6">
                {/* Icon zone */}
                <div className="flex justify-center mb-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-50 border border-red-100">
                        <Icons.Trash size={22} color="#ef4444" />
                    </div>
                </div>

                <h2 className="text-lg font-bold text-gray-900 text-center mb-1">Hapus Genre?</h2>
                <p className="text-sm text-center mb-5 leading-relaxed text-gray-500">
                    <span className="font-semibold text-gray-800">&ldquo;{genre.name}&rdquo;</span> akan dihapus permanen dan tidak dapat dipulihkan.
                </p>

                {/* Warning if has data */}
                {(genre.contentCount > 0 || genre.revenue > 0) && (
                    <div className="rounded-xl px-4 py-3 mb-5 bg-amber-50 border border-amber-100">
                        <p className="text-xs font-semibold mb-1.5 text-amber-700">Data terkait yang akan terpengaruh</p>
                        <div className="space-y-1 text-xs text-amber-600">
                            {genre.contentCount > 0 && <p>· {genre.contentCount} konten terhubung ke genre ini</p>}
                            {genre.revenue > 0 && <p>· Revenue {formatRupiah(genre.revenue)} akan terlepas</p>}
                        </div>
                    </div>
                )}

                {/* Type to confirm */}
                <div className="mb-5">
                    <label className="text-xs font-medium block mb-2 text-gray-500">
                        Ketik <span className="font-bold text-red-500">{required}</span> untuk konfirmasi
                    </label>
                    <input
                        type="text"
                        placeholder={`Ketik "${required}"`}
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-900 focus:outline-none transition-all bg-gray-50
              ${confirmText && !isMatch
                                ? "border-2 border-red-300 focus:border-red-400"
                                : isMatch
                                    ? "border-2 border-red-300"
                                    : "border-2 border-gray-200 focus:border-gray-300"}`}
                    />
                    {confirmText && !isMatch && (
                        <p className="text-xs mt-1.5 text-red-500">Nama tidak cocok</p>
                    )}
                </div>

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
                        disabled={!isMatch || loading}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed bg-red-500 hover:bg-red-600 text-white"
                    >
                        {loading ? <><Icons.Spinner size={14} /> Menghapus...</> : "Ya, Hapus"}
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}

DeleteConfirmModal.propTypes = {
    genre: PropTypes.shape({
        name: PropTypes.string.isRequired,
        contentCount: PropTypes.number,
        revenue: PropTypes.number,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};

DeleteConfirmModal.defaultProps = {
    loading: false,
};