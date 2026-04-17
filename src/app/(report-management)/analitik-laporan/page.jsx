'use client';

import { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { 
  useGetReportsQuery, 
  useGetReportStatsQuery,
  useStartReviewReportMutation 
} from '@/hooks/api/reportManagementAPI';
import {
  useGetCommentReportsQuery,
  useGetCommentReportStatsQuery,
  useStartReviewCommentReportMutation
} from '@/hooks/api/reportCommentManagementAPI';
import ReportDetailModal from '@/components/Modal/ReportDetailModal';
import ReportCommentDetailModal from '@/components/Modal/ReportCommentDetailModal';

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState('content');
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const { data: statsData, isLoading: statsLoading } = useGetReportStatsQuery();
  const { data: reportsData, isLoading: reportsLoading, refetch } = useGetReportsQuery({
    status: filterStatus,
    page: currentPage,
    limit: 10,
  });
  const [startReview] = useStartReviewReportMutation();

  const { data: commentStatsData, isLoading: commentStatsLoading } = useGetCommentReportStatsQuery();
  const { data: commentReportsData, isLoading: commentReportsLoading, refetch: refetchComments } = useGetCommentReportsQuery({
    status: filterStatus,
    page: currentPage,
    limit: 10,
  });
  const [startReviewComment] = useStartReviewCommentReportMutation();

  const handleDetailClick = async (report) => {
    setSelectedReport(report);
    
    if (activeTab === 'content') {
      if (report.status === 'PENDING') {
        try {
          await startReview(report.id).unwrap();
          refetch();
        } catch (error) {
          console.error('Failed to start review:', error);
        }
      }
    } else if (activeTab === 'comment') {
      if (report.status === 'PENDING') {
        try {
          await startReviewComment(report.id).unwrap();
          refetchComments();
        } catch (error) {
          console.error('Failed to start review:', error);
        }
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
    if (activeTab === 'content') {
      refetch();
    } else if (activeTab === 'comment') {
      refetchComments();
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setFilterStatus('all');
    setFilterCategory('all');
    setSearchTerm('');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { text: 'Pending Review', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      'IN_REVIEW': { text: 'Sedang Ditinjau', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      'ACTION_TAKEN': { text: 'Tindakan Diambil', color: 'bg-green-100 text-green-700 border-green-300' },
      'DISMISSED': { text: 'Ditolak', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  const getContentCategoryLabel = (category) => {
    const categoryMap = {
      'PLAGIARISM': 'Plagiarisme',
      'HATE_SPEECH': 'Ujaran Kebencian',
      'SPAM': 'Spam',
      'INAPPROPRIATE_CONTENT': 'Konten Tidak Pantas',
      'COPYRIGHT_INFRINGEMENT': 'Pelanggaran Hak Cipta',
      'OTHER': 'Lainnya',
    };
    return categoryMap[category] || category;
  };

  const getCommentCategoryLabel = (category) => {
    const categoryMap = {
      'SPAM': 'Spam',
      'HATE_SPEECH': 'Ujaran Kebencian',
      'HARASSMENT': 'Pelecehan',
      'INAPPROPRIATE_CONTENT': 'Konten Tidak Pantas',
      'OTHER': 'Lainnya',
    };
    return categoryMap[category] || category;
  };

  const getContentTypeLabel = (contentType) => {
    const typeMap = {
      'MOVIE': 'Film',
      'EPISODE_SERIES': 'Episode Series',
      'EPISODE_COMIC': 'Episode Komik',
      'EPISODE_EBOOK': 'Episode Ebook',
      'EPISODE_PODCAST': 'Episode Podcast',
    };
    return typeMap[contentType] || contentType;
  };

  if ((activeTab === 'content' && (statsLoading || reportsLoading)) || 
      (activeTab === 'comment' && (commentStatsLoading || commentReportsLoading))) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const stats = statsData?.data?.byType || {};
  const commentStats = commentStatsData?.data?.byStatus || {};
  
  let reports = activeTab === 'content' ? (reportsData?.data || []) : (commentReportsData?.data || []);
  if (filterCategory !== 'all') {
    reports = reports.filter(report => report.category === filterCategory);
  }
  
  const pagination = activeTab === 'content' 
    ? (reportsData?.pagination || { total: 0, page: 1, totalPages: 1 })
    : (commentReportsData?.pagination || { total: 0, page: 1, totalPages: 1 });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div 
          onClick={() => handleTabChange('user')}
          className={`bg-white rounded-lg shadow-sm p-6 relative border-2 cursor-pointer transition-all ${
            activeTab === 'user' 
              ? 'border-blue-500 ring-2 ring-blue-200' 
              : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div className="absolute top-4 right-4 bg-red-500 text-white rounded p-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="text-gray-600 text-sm font-medium mb-2">User Reports</div>
          <div className="flex items-end gap-2">
            <div className="text-5xl font-bold text-gray-900">{stats.userReports || 0}</div>
            <div className="mb-2 text-red-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleTabChange('content')}
          className={`bg-white rounded-lg shadow-sm p-6 relative border-2 cursor-pointer transition-all ${
            activeTab === 'content' 
              ? 'border-blue-500 ring-2 ring-blue-200' 
              : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div className="absolute top-4 right-4 bg-red-500 text-white rounded p-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"/>
            </svg>
          </div>
          <div className="text-gray-600 text-sm font-medium mb-2">Content Reports</div>
          <div className="flex items-end gap-2">
            <div className="text-5xl font-bold text-gray-900">{stats.contentReports || 0}</div>
            <div className="mb-2 text-red-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleTabChange('comment')}
          className={`bg-white rounded-lg shadow-sm p-6 relative border-2 cursor-pointer transition-all ${
            activeTab === 'comment' 
              ? 'border-blue-500 ring-2 ring-blue-200' 
              : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div className="absolute top-4 right-4 bg-red-500 text-white rounded p-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="text-gray-600 text-sm font-medium mb-2">Comment Reports</div>
          <div className="flex items-end gap-2">
            <div className="text-5xl font-bold text-gray-900">{commentStats.total || 0}</div>
            <div className="mb-2 text-red-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB: USER ── */}
      {activeTab === 'user' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">User Report Management</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola laporan pengguna</p>
          </div>
          <div className="p-12 text-center text-gray-500">
            Fitur User Reports akan segera tersedia
          </div>
        </div>
      )}

      {/* ── TAB: CONTENT ── */}
      {activeTab === 'content' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Report Management</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola laporan konten, pengguna dan komentar</p>
          </div>

          <div className="p-6 border-b border-gray-200 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari laporan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>
            
            <div className="relative">
              <select 
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_REVIEW">Sedang Ditinjau</option>
                <option value="ACTION_TAKEN">Tindakan Diambil</option>
                <option value="DISMISSED">Ditolak</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                <option value="INAPPROPRIATE_CONTENT">Konten Tidak Pantas</option>
                <option value="OTHER">Lainnya</option>
                <option value="COPYRIGHT_INFRINGEMENT">Pelanggaran Hak Cipta</option>
                <option value="PLAGIARISM">Plagiarisme</option>
                <option value="SPAM">Spam</option>
                <option value="HATE_SPEECH">Ujaran Kebencian</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">ID Report</div>
            <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">Tipe Konten</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 uppercase tracking-wide">Tanggal</div>
            <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">Kategori</div>
            <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">Pelapor</div>
            <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 uppercase tracking-wide">Aksi</div>
          </div>

          <div className="divide-y divide-gray-200">
            {reports.length === 0 ? (
              <div className="p-12 text-center text-gray-500">Tidak ada laporan ditemukan</div>
            ) : (
              reports.map((report) => {
                const statusBadge = getStatusBadge(report.status);
                return (
                  <div key={report.id} className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                    <div className="col-span-2">
                      <div className="text-xs text-gray-700 font-mono">{report.id.substring(0, 8)}...</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-gray-700 font-medium">{getContentTypeLabel(report.contentType)}</div>
                      <div className="text-xs text-gray-500 mt-1">ID: {report.contentId.substring(0, 8)}...</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs text-gray-700">{new Date(report.createdAt).toLocaleDateString('id-ID')}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs text-center font-medium border border-red-200">
                        {getContentCategoryLabel(report.category)}
                      </div>
                    </div>
                    <div className="col-span-2 text-xs text-gray-600">
                      {report.isAnonymous ? <span className="italic">Anonim</span> : <span>{report.email}</span>}
                    </div>
                    <div className="col-span-2">
                      <span className={`${statusBadge.color} px-3 py-1 rounded-full text-xs font-medium border`}>
                        {statusBadge.text}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <button 
                        onClick={() => handleDetailClick(report)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:underline transition-colors"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-6 border-t border-gray-200">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              {[...Array(pagination.totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                if (pageNum === 1 || pageNum === pagination.totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded font-medium text-sm transition-colors ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-gray-100 text-gray-700'}`}>
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === pagination.totalPages}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: COMMENT ── */}
      {activeTab === 'comment' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Laporan Komentar</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola laporan komentar dan balasan komentar dari pengguna</p>
          </div>

          <div className="p-6 border-b border-gray-200 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari laporan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_REVIEW">Sedang Ditinjau</option>
                <option value="ACTION_TAKEN">Tindakan Diambil</option>
                <option value="DISMISSED">Ditolak</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                <option value="INAPPROPRIATE_CONTENT">Konten Tidak Pantas</option>
                <option value="OTHER">Lainnya</option>
                <option value="HARASSMENT">Pelecehan</option>
                <option value="SPAM">Spam</option>
                <option value="HATE_SPEECH">Ujaran Kebencian</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Table header — tambah kolom "Tipe" */}
          <div className="grid grid-cols-11 gap-3 px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase">ID Report</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 uppercase">Tipe</div>
            <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase">Tanggal</div>
            <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase">Kategori</div>
            <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase">Pelapor</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 uppercase">Status</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 uppercase">Aksi</div>
          </div>

          <div className="divide-y divide-gray-200">
            {reports.length === 0 ? (
              <div className="p-12 text-center text-gray-500">Tidak ada laporan ditemukan</div>
            ) : (
              reports.map((report) => {
                const statusBadge = getStatusBadge(report.status);
                // Tentukan apakah laporan ini untuk reply comment atau comment biasa
                const isReplyReport = !!report.replyCommentId;

                return (
                  <div key={report.id} className="grid grid-cols-11 gap-3 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                    <div className="col-span-2 text-xs text-gray-700 font-mono">
                      {report.id.substring(0, 8)}...
                    </div>

                    {/* Kolom Tipe: Komentar atau Balasan */}
                    <div className="col-span-1">
                      {isReplyReport ? (
                        <span className="bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap">
                          Balasan
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap">
                          Komentar
                        </span>
                      )}
                    </div>

                    <div className="col-span-2 text-xs text-gray-700">
                      {new Date(report.createdAt).toLocaleDateString('id-ID')}
                    </div>

                    <div className="col-span-2">
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs text-center font-medium border border-red-200">
                        {getCommentCategoryLabel(report.category)}
                      </div>
                    </div>

                    <div className="col-span-2 text-xs text-gray-600">
                      {report?.isAnonymous ? (
                        <span className="italic">Anonim</span>
                      ) : (
                        <span>{report?.User?.email || report?.email || "-"}</span>
                      )}
                    </div>

                    <div className="col-span-1">
                      <span className={`${statusBadge.color} px-3 py-1 rounded-full text-xs font-medium border`}>
                        {statusBadge.text}
                      </span>
                    </div>

                    <div className="col-span-1">
                      <button
                        onClick={() => handleDetailClick(report)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:underline"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              {[...Array(pagination.totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                if (pageNum === 1 || pageNum === pagination.totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded font-medium text-sm transition-colors ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-gray-100 text-gray-700'}`}>
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                disabled={currentPage === pagination.totalPages}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Detail */}
      {selectedReport && activeTab === 'content' && (
        <ReportDetailModal report={selectedReport} onClose={handleCloseModal} />
      )}

      {selectedReport && activeTab === 'comment' && (
        <ReportCommentDetailModal report={selectedReport} onClose={handleCloseModal} />
      )}
    </div>
  );
}