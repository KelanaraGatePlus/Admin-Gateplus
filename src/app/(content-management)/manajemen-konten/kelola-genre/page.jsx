"use client";

import React, { useState } from "react";
import {
  useGetGenreStatsQuery,
  useGetGenresQuery,
  useDeleteGenreMutation,
} from "@/hooks/api/contentManagementSliceAPI";

import { useCreateGenresMutation, useUpdateGenresMutation } from "@/hooks/api/genreSliceAPI";
import { Toast } from "@/components/Toast/page";
import { AddGenreModal } from "@/components/Modal/genre/modal/addModal";
import { EditGenreModal } from "@/components/Modal/genre/modal/editModal";
import { DeleteConfirmModal } from "@/components/Modal/genre/modal/deleteModal";
import { ToggleStatusModal } from "@/components/Modal/genre/modal/toogleStatusModal";
import { StatCard } from "@/components/Modal/genre/statsCard";
import { StatusBadge } from "@/components/Modal/genre/statusBadge";
import { ToggleSwitch } from "@/components/Modal/genre/modal/toogleSwitch";

import { formatNumber, formatRupiah } from "@/lib/formatAngka"

import { Icons } from "@/components/Icons/icons";
import { SkeletonRow } from "@/components/skeleton/SkeletonRow";

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (type, title, message, duration = 3800) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  };
  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  return {
    toasts,
    removeToast: remove,
    success: (title, msg) => add("success", title, msg),
    error: (title, msg) => add("error", title, msg),
    warning: (title, msg) => add("warning", title, msg),
    info: (title, msg) => add("info", title, msg),
  };
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function KelolaGenrePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [deletingGenre, setDeletingGenre] = useState(null);
  const [togglingGenre, setTogglingGenre] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useGetGenreStatsQuery();
  const { data: genresData, isLoading: listLoading, isFetching, refetch: refetchGenres } = useGetGenresQuery({
    page, limit: 10, search, statusFilter,
  });

  const [createGenres, { isLoading: createLoading }] = useCreateGenresMutation();
  const [updateGenres, { isLoading: updateLoading }] = useUpdateGenresMutation();
  const [deleteGenre] = useDeleteGenreMutation();

  const stats = statsData?.data;
  const genres = genresData?.data || [];
  const topPerforming = genresData?.topPerforming || [];
  const pagination = genresData?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const [imageFormData, setImageFormData] = useState({
    imagePreview: null,
    imageFile: null,
    imageUrl: "",
    secondaryImagePreview: null,
    secondaryImageFile: null,
    secondaryImageUrl: "",
  });

  const handleSecondaryImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImageFormData((prev) => ({
      ...prev,
      secondaryImageFile: file,
      secondaryImagePreview: previewUrl,
      secondaryImageUrl: previewUrl,
    }));
  };

  // ── Handlers ──────────────────────────────────────────────
  const handleAddGenre = async (names) => {
    const count = names.split(",").map((s) => s.trim()).filter(Boolean).length;
    try {
      const formData = new FormData();
      formData.append("tittle", names);
      if (imageFormData.imageFile) {
        formData.append("coverImage", imageFormData.imageFile);
      }
      if (imageFormData.secondaryImageFile) {
        formData.append("secondaryImage", imageFormData.secondaryImageFile);
      }

      await createGenres(formData).unwrap();

      refetchGenres();
      refetchStats();
      setShowAddModal(false);
      setImageFormData({
        imagePreview: null, imageFile: null, imageUrl: "",
        secondaryImagePreview: null, secondaryImageFile: null, secondaryImageUrl: "",
      });
      toast.success("Genre Berhasil Ditambahkan", `${count} genre baru telah disimpan`);
    } catch (err) {
      toast.error("Gagal Menambahkan Genre", err?.data?.message || "Terjadi kesalahan, coba lagi");
    }
  };

  const handleEditGenre = async ({ id, name, isActive }) => {
    try {
      const formData = new FormData();
      formData.append("tittle", name);
      formData.append("isActive", isActive);
      if (imageFormData.imageFile) {
        formData.append("coverImage", imageFormData.imageFile);
      }
      if (imageFormData.secondaryImageFile) {
        formData.append("secondaryImage", imageFormData.secondaryImageFile);
      }
      await updateGenres({ id, formData }).unwrap();

      refetchGenres();
      refetchStats();
      setEditingGenre(null);
      setImageFormData({
        imagePreview: null, imageFile: null, imageUrl: "",
        secondaryImagePreview: null, secondaryImageFile: null, secondaryImageUrl: "",
      });
      toast.success("Genre Diperbarui", `Nama genre berhasil diubah menjadi "${name}"`);
    } catch (err) {
      toast.error("Gagal Memperbarui", err?.data?.message || "Terjadi kesalahan, coba lagi");
    }
  };

  const handleToggleConfirm = async () => {
    if (!togglingGenre) return;
    setTogglingId(togglingGenre.id);
    const willActivate = !togglingGenre.isActive;
    try {
      const formData = new FormData();
      formData.append("isActive", willActivate);

      await updateGenres({ id: togglingGenre.id, formData }).unwrap();

      refetchGenres();
      refetchStats();
      setTogglingGenre(null);
      toast.success(
        willActivate ? "Genre Diaktifkan" : "Genre Dinonaktifkan",
        `"${togglingGenre.name}" berhasil ${willActivate ? "diaktifkan" : "dinonaktifkan"}`
      );
    } catch (err) {
      toast.error("Gagal Mengubah Status", err?.data?.message || "Terjadi kesalahan, coba lagi");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGenre) return;
    setDeleteLoading(true);
    try {
      await deleteGenre(deletingGenre.id).unwrap();
      setDeletingGenre(null);
      toast.success("Genre Dihapus", `"${deletingGenre.name}" telah dihapus secara permanen`);
    } catch (err) {
      toast.error("Gagal Menghapus", err?.data?.message || "Terjadi kesalahan, coba lagi");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setImageFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImageFormData({
      imageFile: file,
      imagePreview: previewUrl,
      imageUrl: previewUrl,
    });
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* TOAST */}
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* MODALS */}
      {showAddModal && (
        <AddGenreModal
          onClose={() => {
            setShowAddModal(false);
            setImageFormData({ imagePreview: null, imageFile: null, imageUrl: "" }); // reset saat tutup
          }}
          onSave={handleAddGenre}
          loading={createLoading}
          onInputChange={handleInputChange}
          onImageUpload={handleImageUpload}
          formData={imageFormData}
          onSecondaryImageUpload={handleSecondaryImageUpload}
        />
      )}
      {editingGenre && (
        <EditGenreModal
          genre={editingGenre}
          onClose={() => {
            setEditingGenre(null);
            setImageFormData({
              imagePreview: null, imageFile: null, imageUrl: "",
              secondaryImagePreview: null, secondaryImageFile: null, secondaryImageUrl: "",
            });
          }}
          onSave={handleEditGenre}
          loading={updateLoading}
          formData={imageFormData}
          onInputChange={handleInputChange}
          onImageUpload={handleImageUpload}
          onSecondaryImageUpload={handleSecondaryImageUpload}
        />
      )}
      {deletingGenre && (
        <DeleteConfirmModal
          genre={deletingGenre}
          onClose={() => setDeletingGenre(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
      {togglingGenre && (
        <ToggleStatusModal
          genre={togglingGenre}
          onClose={() => setTogglingGenre(null)}
          onConfirm={handleToggleConfirm}
          loading={togglingId === togglingGenre?.id}
        />
      )}

      <div className="min-h-screen bg-[#F5F5F5] p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Genre Management</h1>
            <p className="text-gray-500 text-sm mt-1">Organize and optimize content categories</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1297DC] text-white rounded-xl font-semibold text-sm hover:bg-[#0e7db8] active:scale-[.98] transition-all shadow-sm shadow-[#1297DC]/20"
          >
            <Icons.Plus size={16} color="white" />
            Add New Genre
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Icons.FileText size={18} color="#3B82F6" />}
            iconBg="bg-blue-50"
            label="Total Content"
            value={statsLoading ? "..." : (stats?.totalContent ?? 0).toLocaleString("id-ID")}
            sub="Across all genres"
          />
          <StatCard
            icon={<Icons.Eye size={18} color="#8B5CF6" />}
            iconBg="bg-purple-50"
            label="Total Views"
            value={statsLoading ? "..." : formatNumber(stats?.totalViews ?? 0)}
            sub="Monthly views"
          />
          <StatCard
            icon={<Icons.DollarSign size={18} color="#22C55E" />}
            iconBg="bg-green-50"
            label="Total Revenue"
            value={statsLoading ? "..." : formatRupiah(stats?.totalRevenue ?? 0)}
            sub="Total earnings"
          />
          <StatCard
            icon={<Icons.Tag size={18} color="#F97316" />}
            iconBg="bg-orange-50"
            label="Genre Aktif"
            value={statsLoading ? "..." : `${stats?.activeGenres ?? 0} / ${stats?.totalGenres ?? 0}`}
            sub={statsLoading ? "" : `${stats?.inactiveGenres ?? 0} genre nonaktif`}
          />
        </div>

        {/* TOP PERFORMING GENRES */}
        {topPerforming.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Top Performing Genres</h2>
              <span className="text-xs text-gray-400 font-medium">This Month</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topPerforming.map((g) => (
                <div key={g.id}
                  className="rounded-xl p-4 border border-blue-100 bg-gradient-to-br from-blue-50/60 to-blue-50/20 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-extrabold
                      ${g.rank === 1 ? "text-amber-500" : g.rank === 2 ? "text-gray-400" : "text-orange-400"}`}>
                      #{g.rank}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
                      ${g.growth > 0 ? "bg-green-50 text-green-600 border border-green-100" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {g.growth > 0
                          ? <><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></>
                          : <><line x1="7" y1="7" x2="17" y2="17" /><polyline points="17 7 17 17 7 17" /></>}
                      </svg>
                      {Math.abs(g.growth)}%
                    </span>
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-3 truncate">{g.name}</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Revenue</span>
                      <span className="font-semibold text-gray-800">{formatRupiah(g.revenue)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Content</span>
                      <span className="font-semibold text-gray-800">{g.contentCount} items</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GENRE TABLE */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <input
                type="text"
                placeholder="Cari genre..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1297DC] focus:ring-2 focus:ring-[#1297DC]/10 bg-gray-50 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icons.Search size={15} color="#9ca3af" />
              </span>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {[
                { value: "all", label: "Semua" },
                { value: "active", label: "Aktif" },
                { value: "inactive", label: "Nonaktif" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === opt.value
                    ? "bg-white text-[#1297DC] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {opt.label}
                  {opt.value === "active" && stats?.activeGenres != null && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                      {stats.activeGenres}
                    </span>
                  )}
                  {opt.value === "inactive" && stats?.inactiveGenres != null && stats.inactiveGenres > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">
                      {stats.inactiveGenres}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {isFetching && !listLoading && (
              <div className="flex items-center gap-1.5 text-xs text-[#1297DC] font-medium">
                <Icons.Spinner size={12} />
                Memperbarui...
              </div>
            )}
          </div>

          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Genre Hierarchy</h3>
            {pagination?.total != null && (
              <span className="text-xs text-gray-400">{pagination.total} total genre</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Genre Name</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Growth</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listLoading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : genres.length === 0
                    ? (
                      <tr>
                        <td colSpan={7}>
                          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                              <Icons.Tag size={22} color="#d1d5db" />
                            </div>
                            <p className="font-semibold text-gray-500">
                              {statusFilter === "inactive" ? "Tidak ada genre nonaktif" : "Belum ada genre"}
                            </p>
                            <p className="text-sm mt-1">
                              {statusFilter === "all" ? "Mulai dengan menambah genre baru" : "Coba ubah filter pencarian"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
                    : genres.map((genre) => (
                      <tr
                        key={genre.id}
                        className={`border-b border-gray-50 transition-colors duration-100
                        ${genre.isActive
                            ? "hover:bg-blue-50/20"
                            : "bg-gray-50/60 hover:bg-gray-100/50"
                          }
                      `}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className={`font-semibold ${genre.isActive ? "text-gray-900" : "text-gray-400"}`}>
                              {genre.name}
                            </span>
                            {genre.isTrending && genre.isActive && (
                              <span className="flex items-center gap-1 text-xs text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                <Icons.Activity size={11} color="#ef4444" />
                                Trending
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <StatusBadge isActive={genre.isActive} />
                            <ToggleSwitch
                              isActive={genre.isActive}
                              loading={togglingId === genre.id}
                              onToggle={() => setTogglingGenre(genre)}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-sm text-gray-600">
                          <span className={genre.isActive ? "" : "opacity-60"}>{genre.contentCount} content</span>
                        </td>

                        <td className="px-4 py-3.5 text-sm text-gray-600">
                          <span className={genre.isActive ? "" : "opacity-60"}>{formatNumber(genre.views)} views</span>
                        </td>

                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                          <span className={genre.isActive ? "" : "opacity-60"}>{formatRupiah(genre.revenue)}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
                          ${genre.growth > 0
                              ? "bg-green-50 text-green-600 border border-green-100"
                              : genre.growth < 0
                                ? "bg-red-50 text-red-500 border border-red-100"
                                : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              {genre.growth > 0
                                ? <><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></>
                                : genre.growth < 0
                                  ? <><line x1="7" y1="7" x2="17" y2="17" /><polyline points="17 7 17 17 7 17" /></>
                                  : <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></>}
                            </svg>
                            {Math.abs(genre.growth)}%
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingGenre(genre)}
                              title="Edit nama genre"
                              className="group w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#1297DC] hover:bg-blue-50 transition-all text-gray-400 hover:text-[#1297DC]"
                            >
                              <Icons.Edit size={14} />
                            </button>
                            <button
                              onClick={() => setDeletingGenre(genre)}
                              title="Hapus genre"
                              className="group w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all text-gray-400 hover:text-red-500"
                            >
                              <Icons.Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/40">
              <p className="text-sm text-gray-500">
                Menampilkan <strong className="text-gray-700">{genres.length}</strong> dari{" "}
                <strong className="text-gray-700">{pagination?.total || 0}</strong> genre
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-[#1297DC] hover:text-[#1297DC] transition-colors disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${p === page
                        ? "bg-[#1297DC] text-white shadow-sm shadow-[#1297DC]/20"
                        : "border border-gray-200 hover:border-[#1297DC] hover:text-[#1297DC] text-gray-600"
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-[#1297DC] hover:text-[#1297DC] transition-colors disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}