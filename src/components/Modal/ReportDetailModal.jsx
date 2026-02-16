'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
    useGetReportDetailQuery,
    useTakeReportActionMutation
} from '@/hooks/api/reportManagementAPI';
import Image from 'next/image';
import DOMPurify from "dompurify";

export default function ReportDetailModal({ report, onClose }) {
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspendDays, setSuspendDays] = useState('');
    const [formData, setFormData] = useState({
        actionTaken: '',
        suspendDuration: null,
        verdict: '',
        adminNotes: ''
    });

    // Fetch detail lengkap report
    const { data: detailData, isLoading } = useGetReportDetailQuery(report.id);
    const [takeAction, { isLoading: isSubmitting }] = useTakeReportActionMutation();

    const reportDetail = detailData?.data || report;
    const contentDetail = reportDetail.contentDetail;

    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleActionChange = (value) => {
        if (value === 'SUSPEND_ACCOUNT') {
            setShowSuspendModal(true);
        } else {
            setFormData(prev => ({
                ...prev,
                actionTaken: value,
                suspendDuration: null
            }));
        }
    };

    const handleSuspendConfirm = () => {
        const days = parseInt(suspendDays);
        if (days && days > 0) {
            setFormData(prev => ({
                ...prev,
                actionTaken: 'SUSPEND_ACCOUNT',
                suspendDuration: days
            }));
            setShowSuspendModal(false);
            setSuspendDays('');
        }
    };

    const getActionDisplay = () => {
        if (formData.actionTaken === 'SUSPEND_ACCOUNT' && formData.suspendDuration) {
            return `Di-Suspend selama ${formData.suspendDuration} hari`;
        }

        const actionMap = {
            'BAN_PERMANENT': 'Ban Akun Permanen',
            'SUSPEND_ACCOUNT': 'Suspend Akun',
            'WARNING': 'Peringatan',
            'DELETE_CONTENT': 'Hapus Konten',
            'DISMISS': 'Lolos (Tidak Ada Tindakan)'
        };

        return actionMap[formData.actionTaken] || '';
    };

    const handleSubmit = async (actionType) => {
        if (!formData.actionTaken || !formData.verdict) {
            alert('Mohon isi Keadaan dan Putusan terlebih dahulu');
            return;
        }

        if (formData.actionTaken === 'SUSPEND_ACCOUNT' && !formData.suspendDuration) {
            alert('Mohon tentukan durasi suspend');
            return;
        }

        try {
            await takeAction({
                id: report.id,
                actionTaken: formData.actionTaken,
                suspendDuration: formData.suspendDuration,
                verdict: formData.verdict,
                adminNotes: formData.adminNotes,
            }).unwrap();

            alert('Tindakan berhasil diambil!');
            onClose();
        } catch (error) {
            console.error('Error taking action:', error);
            alert('Gagal mengambil tindakan: ' + (error?.data?.message || error.message));
        }
    };

    // Get content info untuk ditampilkan
    const getContentInfo = () => {
        if (!contentDetail) return null;

        let title, description, poster, author, genres, publicationDate, creator;

        switch (reportDetail.contentType) {
            case 'MOVIE':
                title = contentDetail.title;
                description = contentDetail.description;
                poster = contentDetail.posterImageUrl;
                author = contentDetail.writer;
                genres = contentDetail.categories?.map(c => c.category?.tittle) || [];
                publicationDate = new Date(contentDetail.createdAt).toLocaleDateString('id-ID');
                creator = reportDetail.creator;
                break;

            case 'EPISODE_SERIES':
                title = contentDetail.series?.title;
                description = contentDetail.series?.description;
                poster = contentDetail.series?.posterImageUrl;
                author = contentDetail.series?.writer;
                genres = contentDetail.series?.categories?.map(c => c.category?.tittle) || [];
                publicationDate = new Date(contentDetail.createdAt).toLocaleDateString('id-ID');
                creator = reportDetail.creator;
                break;

            case 'EPISODE_COMIC':
                title = contentDetail.comics?.title;
                description = contentDetail.comics?.description;
                poster = contentDetail.comics?.posterImageUrl;
                author = contentDetail.creators?.profileName;
                genres = contentDetail.comics?.categories?.map(c => c.category?.tittle) || [];
                publicationDate = new Date(contentDetail.createdAt).toLocaleDateString('id-ID');
                creator = contentDetail.creators;
                break;

            case 'EPISODE_EBOOK':
                title = contentDetail.ebooks?.title;
                description = contentDetail.ebooks?.description;
                poster = contentDetail.ebooks?.coverImageUrl;
                author = contentDetail.creators?.profileName;
                genres = contentDetail.ebooks?.categories?.map(c => c.category?.tittle) || [];
                publicationDate = new Date(contentDetail.createdAt).toLocaleDateString('id-ID');
                creator = contentDetail.creators;
                break;

            case 'EPISODE_PODCAST':
                title = contentDetail.podcasts?.title;
                description = contentDetail.podcasts?.description;
                poster = contentDetail.podcasts?.coverPodcastImage;
                author = contentDetail.podcasts?.Creator?.profileName;
                genres = contentDetail.podcasts?.categories?.map(c => c.category?.tittle) || [];
                publicationDate = new Date(contentDetail.createdAt).toLocaleDateString('id-ID');
                creator = contentDetail.podcasts?.Creator;
                break;

            default:
                return null;
        }

        return { title, description, poster, author, genres, publicationDate, creator };
    };

    const contentInfo = getContentInfo();

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-8">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-lg max-w-4xl w-full my-8 shadow-2xl">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">Detail Laporan Konten</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                        {/* Content Info */}
                        {contentInfo && (
                            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-bold mb-3 text-gray-900">{contentInfo.title}</h3>
                                <div
                                    className="prose max-w-none prose-sm text-gray-700 mb-4"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(contentInfo.description || "")
                                    }}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="text-sm">
                                            <span className="text-gray-600">Judul:</span>
                                            <span className="ml-2 text-gray-900 font-medium">{contentInfo.title}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-600">Penulis:</span>
                                            <span className="ml-2 text-gray-900 font-medium">{contentInfo.author}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-600">Genre:</span>
                                            <span className="ml-2 text-gray-900 font-medium">{contentInfo.genres.join(', ') || '-'}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-600">Dipublikasi:</span>
                                            <span className="ml-2 text-gray-900 font-medium">{contentInfo.publicationDate}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                                            {contentInfo.creator?.imageUrl ? (
                                                <Image
                                                    src={contentInfo.creator.imageUrl}
                                                    alt={contentInfo.creator.profileName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <svg className="w-full h-full text-gray-500 p-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-900">{contentInfo.creator?.profileName || reportDetail.creator?.profileName}</div>
                                            <div className="text-gray-500 text-xs">@{contentInfo.creator?.username || reportDetail.creator?.username}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Report Details */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="font-bold mb-4 text-gray-900 text-lg">Rincian Laporan</h4>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Pelapor</label>
                                        <input
                                            type="text"
                                            value={reportDetail.isAnonymous ? 'Anonim' : reportDetail.email}
                                            readOnly
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori Laporan</label>
                                        <div className="bg-red-100 text-red-700 px-4 py-2.5 rounded-lg text-sm font-semibold border border-red-200">
                                            {reportDetail.category}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Masalah</label>
                                        <div
                                            className="prose prose-sm max-w-none bg-gray-100 p-3 rounded-lg border text-gray-700"
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(reportDetail.reportDetail || "")
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Lampiran Bukti</label>
                                        {reportDetail.evidenceUrl && reportDetail.evidenceUrl.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                {reportDetail.evidenceUrl.map((url, index) => (
                                                    <div key={index} className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50 h-32 flex items-center justify-center hover:border-blue-400 transition-colors">
                                                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-center">
                                                            <div className="text-4xl mb-2">📎</div>
                                                            <div className="text-xs text-gray-600 font-medium">Bukti {index + 1}</div>
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center text-gray-500 text-sm">
                                                Tidak ada lampiran
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Bukti</label>
                                        <input
                                            type="text"
                                            value={reportDetail.evidenceDetail || '-'}
                                            readOnly
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions Section - Only show if not already actioned */}
                            {reportDetail.status !== 'ACTION_TAKEN' && reportDetail.status !== 'DISMISSED' && (
                                <div className="border-t border-gray-200 pt-6 mt-6 bg-gray-50 p-6 rounded-lg">
                                    <h4 className="font-bold mb-4 text-gray-900 text-lg">Tindakan</h4>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Keadaan <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.actionTaken}
                                                onChange={(e) => handleActionChange(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            >
                                                <option value="">Pilih Tindakan</option>
                                                <option value="BAN_PERMANENT">Ban Akun Permanen</option>
                                                <option value="SUSPEND_ACCOUNT">Suspend Akun</option>
                                                <option value="WARNING">Peringatan</option>
                                                <option value="DELETE_CONTENT">Hapus Konten</option>
                                                <option value="DISMISS">Lolos (Tidak Ada Tindakan)</option>
                                            </select>

                                            {formData.actionTaken === 'SUSPEND_ACCOUNT' && formData.suspendDuration && (
                                                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                                    <span className="text-sm text-blue-800 font-medium">
                                                        {getActionDisplay()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Putusan / Alasan <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={formData.verdict}
                                                onChange={(e) => handleFormChange('verdict', e.target.value)}
                                                placeholder="Masukkan putusan terkait laporan ini..."
                                                rows="3"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Pemeriksa</label>
                                            <textarea
                                                value={formData.adminNotes}
                                                onChange={(e) => handleFormChange('adminNotes', e.target.value)}
                                                placeholder="Tambahkan catatan internal (opsional)"
                                                rows="4"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Show action result if already processed */}
                            {(reportDetail.status === 'ACTION_TAKEN' || reportDetail.status === 'DISMISSED') && (
                                <div className="border-t border-gray-200 pt-6 mt-6 bg-gray-50 p-6 rounded-lg">
                                    <h4 className="font-bold mb-4 text-gray-900 text-lg">Hasil Tindakan</h4>

                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm font-semibold text-gray-700">Tindakan Diambil:</span>
                                            <div className="mt-1 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                                <span className="text-sm text-blue-800 font-medium">
                                                    {reportDetail.actionDetail || reportDetail.actionTaken}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-sm font-semibold text-gray-700">Putusan:</span>
                                            <p className="mt-1 text-sm text-gray-700 bg-white p-3 rounded border">
                                                {reportDetail.verdict}
                                            </p>
                                        </div>

                                        {reportDetail.adminNotes && (
                                            <div>
                                                <span className="text-sm font-semibold text-gray-700">Catatan Pemeriksa:</span>
                                                <p className="mt-1 text-sm text-gray-700 bg-white p-3 rounded border">
                                                    {reportDetail.adminNotes}
                                                </p>
                                            </div>
                                        )}

                                        <div className="text-xs text-gray-500">
                                            Ditinjau oleh: {reportDetail.reviewedBy} pada {new Date(reportDetail.reviewedAt).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer - Only show if not already actioned */}
                    {reportDetail.status !== 'ACTION_TAKEN' && reportDetail.status !== 'DISMISSED' && (
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={onClose}
                                className="px-8 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700 text-sm"
                                disabled={isSubmitting}
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleSubmit('submit')}
                                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!formData.actionTaken || !formData.verdict || isSubmitting}
                            >
                                {isSubmitting ? 'Memproses...' : 'Kirim Tindakan'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Suspend Duration Modal */}
            {showSuspendModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Durasi Suspend Akun</h3>
                        </div>

                        <div className="p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Masukkan durasi suspend (dalam hari)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={suspendDays}
                                onChange={(e) => setSuspendDays(e.target.value)}
                                placeholder="Contoh: 7"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    setSuspendDays('');
                                }}
                                className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700 text-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSuspendConfirm}
                                disabled={!suspendDays || parseInt(suspendDays) <= 0}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Konfirmasi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}