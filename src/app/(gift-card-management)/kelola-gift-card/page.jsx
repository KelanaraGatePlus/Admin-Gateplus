"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGetAllGiftCardsQuery,
  useRemoveGiftCardMutation,
} from "@/hooks/api/giftCardSliceAPI";
import DeleteModal from "@/components/Modal/deleteModal";
import { Icons } from "@/components/Icons/icons";

export default function KelolaGiftCardPage() {
  const router = useRouter();
  const LIMIT = 10;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    data: giftCardData,
    isLoading,
    isFetching,
  } = useGetAllGiftCardsQuery({ page: page, limit: LIMIT, search: search });
  const [removeGiftCard, { isLoading: isDeleting }] =
    useRemoveGiftCardMutation();

  const contents = giftCardData?.data || [];
  const pagination = giftCardData?.pagination || {};
  const totalFiltered = pagination.total ?? 0;
  const totalPages = pagination.totalPages ?? 1;

  // group by contentId — tampil 1 per konten
  const groupedContents = Object.values(
    contents.reduce((acc, item) => {
      if (!acc[item.contentId]) {
        acc[item.contentId] = {
          ...item,
          totalCards: 1,
          _packageNumbers: new Set([item.packageNumber]),
        };
      } else {
        acc[item.contentId]._packageNumbers.add(item.packageNumber);
        acc[item.contentId].totalCards =
          acc[item.contentId]._packageNumbers.size; // ← unique package
      }
      return acc;
    }, {}),
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeGiftCard(deleteTarget.contentId).unwrap();

      setDeleteTarget(null);
    } catch (error) {
      console.error("Gagal menghapus gift card:", error);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="min-h-screen bg-[#F4F6F9] p-6">
      {deleteTarget && (
        <DeleteModal
          isOpen={!!deleteTarget}
          item={deleteTarget}
          title="Hapus Konten Gift Card?"
          message="Seluruh paket kartu dalam konten"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* HEADER */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-800">
              Kelola Card
            </h1>
            <p className="text-sm text-gray-500">
              Kelola semua konfigurasi gacha card
            </p>
          </div>
          <button
            onClick={() => router.push("/kelola-gift-card/upload")}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium whitespace-nowrap text-white transition hover:bg-blue-700"
          >
            <span className="text-lg">+</span>
            Tambah Card Baru
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-4 rounded-2xl bg-white shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari judul konten… (Enter untuk cari)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm transition focus:border-[#1297DC] focus:bg-white focus:outline-none"
            />
            <button
              onClick={() => {
                setSearch(searchInput);
                setPage(1);
              }}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 transition hover:text-[#1297DC]"
            >
              <Icons.Search size={15} color="currentColor" />
            </button>
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(1);
                }}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <Icons.X size={12} color="currentColor" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <p className="text-sm font-bold text-gray-800">
            Semua Konten
            <span className="ml-2 text-xs font-normal text-gray-400">
              {groupedContents.length > 0
                ? `menampilkan ${((page - 1) * LIMIT + 1).toLocaleString()}–${Math.min(page * LIMIT, totalFiltered).toLocaleString()} dari ${totalFiltered.toLocaleString()} konten`
                : "tidak ada hasil"}
            </span>
          </p>
          {totalPages > 1 && (
            <span className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs text-gray-400">
              Hal. {page} / {totalPages}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="space-y-4 p-4">
            {isLoading || isFetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex animate-pulse items-center justify-between rounded-2xl bg-white p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-32 w-24 rounded-lg bg-gray-200" />
                    <div>
                      <div className="mb-2 h-4 w-40 rounded bg-gray-200" />
                      <div className="h-3 w-20 rounded bg-gray-100" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-8 w-16 rounded bg-gray-200" />
                    <div className="h-8 w-16 rounded bg-gray-100" />
                  </div>
                </div>
              ))
            ) : groupedContents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <Icons.Search size={24} color="#d1d5db" />
                </div>
                <p className="text-base font-semibold text-gray-500">
                  Tidak ada konten ditemukan
                </p>
              </div>
            ) : (
              groupedContents.map((item) => (
                <div
                  key={item.contentId}
                  className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  {/* Kiri */}
                  <div className="flex items-center gap-4">
                    <img
                      src={item.contentImageUrl}
                      className="h-32 w-24 flex-shrink-0 rounded-lg bg-gray-100 object-cover"
                      alt={item.promoTitle}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                    <div className="space-y-1">
                      <p className="text-base font-bold text-gray-900">
                        {item.promoTitle ?? "-"}
                      </p>
                      <p className="line-clamp-2 text-sm text-gray-400">
                        {item.description ?? "-"}
                      </p>

                      <div className="mt-2 h-px w-full bg-gray-100" />

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span
                          className={`rounded-md bg-gray-300 px-2 py-0.5 text-xs text-gray-500`}
                        >
                          {item.contentTitle}
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500">
                          {item.totalCards} paket
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500">
                          {item.totalGacha ?? item.packageNumber ?? 0} per gacha
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500">
                          {item.cardOrder ?? 0} total kartu
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Kanan */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() =>
                        router.push(`/kelola-gift-card/edit/${item.contentId}`)
                      }
                      className="rounded-lg border border-yellow-400 bg-transparent px-4 py-2 text-xs font-semibold text-yellow-500 transition hover:bg-yellow-400 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="rounded-lg border border-red-500 bg-transparent px-4 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/40 px-6 py-4">
          <p className="text-xs text-gray-500">
            {totalFiltered === 0
              ? "Tidak ada hasil"
              : `${((page - 1) * LIMIT + 1).toLocaleString("id-ID")} – ${Math.min(page * LIMIT, totalFiltered).toLocaleString("id-ID")} dari ${totalFiltered.toLocaleString("id-ID")} konten`}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium transition hover:border-[#1297DC]/50 disabled:opacity-30"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 px-3.5 py-1.5 text-xs font-semibold transition hover:border-[#1297DC]/50 disabled:opacity-30"
            >
              ‹ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="px-1 text-xs text-gray-300">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${p === page ? "bg-[#1297DC] text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:border-[#1297DC]/50"}`}
                  >
                    {p}
                  </button>
                ),
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-200 px-3.5 py-1.5 text-xs font-semibold transition hover:border-[#1297DC]/50 disabled:opacity-30"
            >
              Next ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium transition hover:border-[#1297DC]/50 disabled:opacity-30"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
