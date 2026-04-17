'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import {
    useGetCommentReportDetailQuery,
    useTakeCommentReportActionMutation
} from '@/hooks/api/reportCommentManagementAPI';
import Image from 'next/image';

export default function ReportCommentDetailModal({ report, onClose }) {
    const [suspendDays, setSuspendDays] = useState('');
    const [formData, setFormData] = useState({
        actionTaken: '',
        suspendDuration: null,
        verdict: '',
        adminNotes: ''
    });

    const { data: detailData, isLoading } = useGetCommentReportDetailQuery(report.id);
    const [takeAction, { isLoading: isSubmitting }] = useTakeCommentReportActionMutation();

    // Gunakan report prop sebagai sumber utama (sudah lengkap dengan ReplyComment)
    // Karena API detail tidak mengirim ReplyComment, kita pakai report prop
    const reportDetail = report;

    console.log('[MODAL] reportDetail:', reportDetail);
    console.log('[MODAL] replyCommentId:', reportDetail?.replyCommentId);
    console.log('[MODAL] ReplyComment:', reportDetail?.ReplyComment);
    console.log('[MODAL] ReplyComment message:', reportDetail?.ReplyComment?.message);

    const isReply = !!reportDetail?.replyCommentId;
    
    // Ambil data dari report prop (sudah lengkap)
    const replyData = reportDetail?.ReplyComment ?? null;
    const commentData = reportDetail?.Comment ?? null;
    const parentReplyData = replyData?.ReplyComment ?? null;
    
    // Target yang dilaporkan adalah reply jika isReply, otherwise comment
    const targetData = isReply ? replyData : commentData;

    console.log('[MODAL] isReply:', isReply);
    console.log('[MODAL] targetData:', targetData);
    console.log('[MODAL] targetData.message:', targetData?.message);

    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleActionChange = (value) => {
        setFormData(prev => ({
            ...prev,
            actionTaken: value,
            suspendDuration: null
        }));
        setSuspendDays('');
    };

    const handleSuspendDaysChange = (value) => {
        setSuspendDays(value);
        const days = parseInt(value);
        if (days && days > 0) {
            setFormData(prev => ({
                ...prev,
                suspendDuration: days
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                suspendDuration: null
            }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.actionTaken || !formData.verdict) {
            alert('Mohon isi Keadaan dan Putusan terlebih dahulu');
            return;
        }

        if (formData.actionTaken === 'SUSPEND_COMMENTER' && !formData.suspendDuration) {
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

    if (isLoading && !reportDetail?.ReplyComment && !reportDetail?.Comment) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-8">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Detail Laporan Komentar</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                    {/* Comment Content */}
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-bold mb-3 text-gray-900">
                            {isReply ? 'Balasan Komentar yang Dilaporkan' : 'Komentar yang Dilaporkan'}
                        </h3>

                        {/* Komentar induk sebagai konteks (hanya untuk reply) */}
                        {isReply && commentData && (
                            <div className="mb-3 p-3 bg-gray-100 rounded border-l-4 border-gray-400">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Komentar Induk (yang dibalas):</div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                                        {commentData.user?.imageUrl ? (
                                            <Image
                                                src={commentData.user.imageUrl}
                                                alt={commentData.user.username}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <svg className="w-full h-full text-gray-500 p-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600">{commentData.user?.username || '-'}</span>
                                </div>
                                <p className="text-sm text-gray-600">{commentData.message || '(pesan tidak tersedia)'}</p>
                            </div>
                        )}

                        {/* Parent reply untuk balasan berantai */}
                        {isReply && parentReplyData && (
                            <div className="mb-3 p-3 bg-blue-50 rounded border-l-4 border-blue-300">
                                <div className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Balasan yang Dibalas (parent reply):</div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                                        {parentReplyData.user?.imageUrl ? (
                                            <Image
                                                src={parentReplyData.user.imageUrl}
                                                alt={parentReplyData.user.username}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <svg className="w-full h-full text-gray-500 p-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-xs font-semibold text-blue-700">{parentReplyData.user?.username || '-'}</span>
                                </div>
                                <p className="text-sm text-blue-800">{parentReplyData.message || '(pesan tidak tersedia)'}</p>
                            </div>
                        )}

                        {/* KONTEN YANG DILAPORKAN */}
                        <div className="bg-white p-4 rounded border border-red-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                                    {targetData?.user?.imageUrl ? (
                                        <Image
                                            src={targetData.user.imageUrl}
                                            alt={targetData.user.username}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <svg className="w-full h-full text-gray-500 p-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{targetData?.user?.username || '-'}</div>
                                    <div className="text-xs text-gray-500 mb-0.5">
                                        {isReply ? 'Reply Comment ID (yang dilaporkan):' : 'Comment ID (yang dilaporkan):'}
                                    </div>
                                    <div className="font-mono text-xs text-gray-700">
                                        {isReply ? reportDetail?.replyCommentId : reportDetail?.commentId}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        {targetData?.createdAt
                                            ? new Date(targetData.createdAt).toLocaleString('id-ID')
                                            : '-'}
                                    </div>
                                </div>
                            </div>
                            
                            {/* PESAN YANG DILAPORKAN */}
                            <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                                <div className="text-xs font-semibold text-red-600 mb-1">✏️ Pesan yang Dilaporkan:</div>
                                <p className="text-gray-800 font-medium">
                                    {targetData?.message || '(pesan tidak tersedia)'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Report Details */}
                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-bold mb-4 text-gray-900 text-lg">Rincian Laporan</h4>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pelapor</label>
                                    <input
                                        type="text"
                                        value={reportDetail?.isAnonymous ? 'Anonim' : (reportDetail?.User?.email ?? reportDetail?.user?.email ?? reportDetail?.email ?? '-')}
                                        readOnly
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori Laporan</label>
                                    <div className="bg-red-100 text-red-700 px-4 py-2.5 rounded-lg text-sm font-semibold border border-red-200">
                                        {reportDetail?.category}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Masalah</label>
                                    <div className="bg-gray-100 p-3 rounded-lg border text-gray-700 text-sm">
                                        {reportDetail?.reportDetail}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lampiran Bukti</label>
                                    {reportDetail?.evidenceUrl && reportDetail.evidenceUrl.length > 0 ? (
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
                                        value={reportDetail?.evidenceDetail || '-'}
                                        readOnly
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions Section */}
                        {reportDetail?.status !== 'ACTION_TAKEN' && reportDetail?.status !== 'DISMISSED' && (
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
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="">Pilih Tindakan</option>
                                            <option value="BAN_PERMANENT">Ban Akun Permanen</option>
                                            <option value="SUSPEND_COMMENTER">Suspend Akun</option>
                                            <option value="WARNING">Peringatan</option>
                                            <option value="DELETE_COMMENT">Hapus Komentar</option>
                                            <option value="DISMISS">Lolos (Tidak Ada Tindakan)</option>
                                        </select>

                                        {formData.actionTaken === 'SUSPEND_COMMENTER' && (
                                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <label className="block text-sm font-semibold text-blue-900 mb-2">
                                                    Durasi Suspend (dalam hari) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={suspendDays}
                                                    onChange={(e) => handleSuspendDaysChange(e.target.value)}
                                                    placeholder="Contoh: 7"
                                                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                />
                                                {formData.suspendDuration && (
                                                    <div className="mt-2 text-sm text-blue-800 font-medium">
                                                        User akan di-suspend selama {formData.suspendDuration} hari
                                                    </div>
                                                )}
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
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Pemeriksa</label>
                                        <textarea
                                            value={formData.adminNotes}
                                            onChange={(e) => handleFormChange('adminNotes', e.target.value)}
                                            placeholder="Tambahkan catatan internal (opsional)"
                                            rows="4"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Show action result if already processed */}
                        {(reportDetail?.status === 'ACTION_TAKEN' || reportDetail?.status === 'DISMISSED') && (
                            <div className="border-t border-gray-200 pt-6 mt-6 bg-gray-50 p-6 rounded-lg">
                                <h4 className="font-bold mb-4 text-gray-900 text-lg">Hasil Tindakan</h4>

                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700">Tindakan Diambil:</span>
                                        <div className="mt-1 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                            <span className="text-sm text-blue-800 font-medium">
                                                {reportDetail?.actionDetail || reportDetail?.actionTaken}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-sm font-semibold text-gray-700">Putusan:</span>
                                        <p className="mt-1 text-sm text-gray-700 bg-white p-3 rounded border">
                                            {reportDetail?.verdict}
                                        </p>
                                    </div>

                                    {reportDetail?.adminNotes && (
                                        <div>
                                            <span className="text-sm font-semibold text-gray-700">Catatan Pemeriksa:</span>
                                            <p className="mt-1 text-sm text-gray-700 bg-white p-3 rounded border">
                                                {reportDetail.adminNotes}
                                            </p>
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-500">
                                        Ditinjau oleh: {reportDetail?.reviewedBy} pada {reportDetail?.reviewedAt ? new Date(reportDetail.reviewedAt).toLocaleString('id-ID') : '-'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                {reportDetail?.status !== 'ACTION_TAKEN' && reportDetail?.status !== 'DISMISSED' && (
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-8 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700 text-sm"
                            disabled={isSubmitting}
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!formData.actionTaken || !formData.verdict || isSubmitting}
                        >
                            {isSubmitting ? 'Memproses...' : 'Kirim Tindakan'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}