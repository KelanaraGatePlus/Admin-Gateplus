"use client";

import React, { useState } from "react";

export default function PengaturanKontenPage() {
    // State untuk Kebijakan Konten
    const [autoApprove, setAutoApprove] = useState(true);
    const [sensitiveModeration, setSensitiveModeration] = useState(false);
    const [spamDetection, setSpamDetection] = useState(false);

    // State untuk Filter Konten - Kelola Kata Terlarang
    const [bannedWords, setBannedWords] = useState(["Profanity", "Hate Speech", "Slurs"]);
    const [newWord, setNewWord] = useState("");
    const [showBannedWordsModal, setShowBannedWordsModal] = useState(false);

    // State untuk Filter Konten - Atur Rating Konten
    const [showRatingModal, setShowRatingModal] = useState(false);

    // State untuk Filter Konten - Blacklist Domain
    const [blacklistDomains, setBlacklistDomains] = useState([]);
    const [newDomain, setNewDomain] = useState("");

    // Handler untuk menambah kata terlarang
    const handleAddWord = () => {
        if (newWord.trim()) {
            setBannedWords([...bannedWords, newWord.trim()]);
            setNewWord("");
        }
    };

    // Handler untuk menghapus kata terlarang
    const handleRemoveWord = (word) => {
        setBannedWords(bannedWords.filter(item => item !== word));
    };

    // Handler untuk menambah domain
    const handleAddDomain = () => {
        if (newDomain.trim()) {
            setBlacklistDomains([...blacklistDomains, newDomain.trim()]);
            setNewDomain("");
        }
    };

    // Handler untuk menghapus domain
    const handleRemoveDomain = (domain) => {
        setBlacklistDomains(blacklistDomains.filter(item => item !== domain));
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="w-full px-6 py-8 space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Pengaturan Konten</h1>
                    <p className="text-gray-600 mt-2">Halaman untuk mengatur kebijakan dan aturan konten</p>
                </div>

                {/* Kebijakan Konten Section */}
                <div className="bg-gray-200 rounded-xl p-6 space-y-3">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Kebijakan Konten</h2>

                    {/* Auto-approve konten */}
                    <div className="flex justify-between items-center bg-white rounded-lg px-5 py-4 shadow-sm">
                        <span className="text-gray-900 font-normal">Auto-approve konten dari kreator terverifikasi</span>
                        <button
                            onClick={() => setAutoApprove(!autoApprove)}
                            className={`w-12 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                                autoApprove ? "bg-green-500" : "bg-gray-300"
                            }`}
                        >
                            <span
                                className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${
                                    autoApprove ? "translate-x-6" : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>

                    {/* Moderasi konten sensitif */}
                    <div className="flex justify-between items-center bg-gray-300 rounded-lg px-5 py-4">
                        <span className="text-gray-500 font-normal">Moderasi konten sensitif</span>
                        <button
                            className="w-12 h-6 rounded-full flex items-center px-0.5 bg-gray-400 cursor-not-allowed"
                            disabled
                        >
                            <span className="w-5 h-5 bg-white rounded-full shadow" />
                        </button>
                    </div>

                    {/* Deteksi otomatis spam */}
                    <div className="flex justify-between items-center bg-gray-300 rounded-lg px-5 py-4">
                        <span className="text-gray-500 font-normal">Deteksi otomatis spam</span>
                        <button
                            className="w-12 h-6 rounded-full flex items-center px-0.5 bg-gray-400 cursor-not-allowed"
                            disabled
                        >
                            <span className="w-5 h-5 bg-white rounded-full shadow" />
                        </button>
                    </div>
                </div>

                {/* Filter Konten Section */}
                <div className="bg-gray-200 rounded-xl p-6 space-y-3">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Filter Konten</h2>

                    {/* Kelola Kata Terlarang */}
                    <div 
                        className="bg-white rounded-lg px-5 py-4 cursor-pointer hover:bg-gray-50 transition shadow-sm"
                        onClick={() => setShowBannedWordsModal(true)}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-gray-900 font-normal">Kelola Kata Terlarang</span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Atur Rating Konten */}
                    <div 
                        className="bg-white rounded-lg px-5 py-4 cursor-pointer hover:bg-gray-50 transition shadow-sm"
                        onClick={() => setShowRatingModal(true)}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-gray-900 font-normal">Atur Rating Konten</span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Blacklist Domain */}
                    <div className="bg-white rounded-lg px-5 py-4 cursor-pointer hover:bg-gray-50 transition shadow-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-900 font-normal">Blacklist Domain</span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6">
                    <button className="px-8 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition">
                        Batal
                    </button>
                    <button className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-sm">
                        Simpan Perubahan
                    </button>
                </div>

                {/* Modal - Kelola Kata Terlarang */}
                {showBannedWordsModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-gray-200 border-b border-gray-300 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                                <h2 className="text-xl font-bold text-gray-900">Details</h2>
                                <button 
                                    onClick={() => setShowBannedWordsModal(false)}
                                    className="w-8 h-8 rounded-full bg-gray-400 hover:bg-gray-500 flex items-center justify-center transition"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Manage Blocked Words Section */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Blocked Words</h3>
                                    <p className="text-sm text-gray-600 mb-4">Manage the list of words that are prohibited in content and comments</p>
                                    
                                    <div className="mb-3">
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Add Blocked Word</label>
                                        <p className="text-sm text-gray-600 mb-2">Enter a word to be blocked</p>
                                    </div>

                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={newWord}
                                            onChange={(e) => setNewWord(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
                                            placeholder="Type a word..."
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <button
                                            onClick={handleAddWord}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    <div className="mb-2">
                                        <label className="block text-sm font-bold text-gray-900">Blocked Words List ({bannedWords.length})</label>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 min-h-[80px]">
                                        <div className="flex flex-wrap gap-2">
                                            {bannedWords.map((word, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-400 text-white rounded-full font-medium"
                                                >
                                                    {word}
                                                    <button
                                                        onClick={() => handleRemoveWord(word)}
                                                        className="hover:bg-red-500 rounded-full p-0.5 transition"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-orange-200 border border-orange-300 rounded-lg p-3 mt-4">
                                        <p className="text-sm text-gray-800">
                                            <span className="font-bold">Note:</span> These words will be automatically censored in content and comments. The system will replace blocked words with asterisk (*) symbols.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal - Atur Rating Konten */}
                {showRatingModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-gray-200 border-b border-gray-300 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                                <h2 className="text-xl font-bold text-gray-900">Detail</h2>
                                <button 
                                    onClick={() => setShowRatingModal(false)}
                                    className="w-8 h-8 rounded-full bg-gray-400 hover:bg-gray-500 flex items-center justify-center transition"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Kategori Pembatasan Usia Konten di Indonesia</h3>
                                
                                <div className="bg-white rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-300">
                                                <th className="px-6 py-3 text-left font-bold text-gray-900">Kategori</th>
                                                <th className="px-6 py-3 text-left font-bold text-gray-900">Syarat</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            <tr>
                                                <td className="px-6 py-4 align-top font-semibold text-gray-900">SU (Semua Umur)</td>
                                                <td className="px-6 py-4">
                                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                                        <li>Cocok untuk semua</li>
                                                        <li>Tidak mengandung unsur kekerasan, pornografi, narkoba, atau hal negatif</li>
                                                        <li>Biasanya konten edukatif, hiburan keluarga, atau animasi anak-anak</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 align-top font-semibold text-gray-900">13+ (Remaja Awal)</td>
                                                <td className="px-6 py-4">
                                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                                        <li>Dapat diakses oleh usia 13 tahun ke atas</li>
                                                        <li>Bisa mengandung sedikit unsur kekerasan ringan atau tema yang lebih kompleks</li>
                                                        <li>Tidak boleh mengandung unsur seksual, narkoba, atau kekerasan ekstrem</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 align-top font-semibold text-gray-900">17+ (Remaja Akhir / Dewasa Muda)</td>
                                                <td className="px-6 py-4">
                                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                                        <li>Dapat diakses oleh usia 17 tahun ke atas</li>
                                                        <li>Bisa mengandung kekerasan, tema sosial kompleks, atau unsur horor</li>
                                                        <li>Tidak boleh ada adegan seksual eksplisit atau konten yang sangat sensitif</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 align-top font-semibold text-gray-900">21+ (Dewasa)</td>
                                                <td className="px-6 py-4">
                                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                                        <li>Hanya untuk usia 21 tahun ke atas</li>
                                                        <li>Bisa mengandung unsur kekerasan ekstrem, tema politik yang kompleks, adegan seksual, atau konten eksplisit lainnya</li>
                                                        <li>Biasanya diterapkan untuk film dewasa, dokumenter khusus, atau game dengan tema brutal</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button 
                                        onClick={() => setShowRatingModal(false)}
                                        className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}