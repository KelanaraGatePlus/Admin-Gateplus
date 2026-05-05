"use client";
import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import FaqTable from "@/components/table/FaqTable";
import {
    useGetFaqArticlesQuery,
    useGetFaqArticleByIdQuery,
    useDeleteFaqArticleMutation,
} from "@/hooks/api/faqArticleAPI";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

function SafeHtmlContent({ html }) {
    const [sanitized, setSanitized] = useState("");

    useEffect(() => {
        // DOMPurify hanya bisa berjalan di browser (butuh window)
        setSanitized(DOMPurify.sanitize(html ?? "", {
            ALLOWED_TAGS: [
                'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
                'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote',
                'a', 'img', 'hr', 'mark', 'sub', 'sup',
            ],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel'],
            // Paksa semua link eksternal aman
            FORCE_BODY: true,
        }));
    }, [html]);

    return (
        <div
            className="prose prose-sm max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: sanitized }}
        />
    );
}

function ViewArticleModal({ articleId, onClose }) {
    const { data: articleData, isLoading } = useGetFaqArticleByIdQuery(articleId);
    const article = articleData?.data;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex flex-col gap-1">
                        {isLoading ? (
                            <div className="h-5 w-48 bg-gray-200 animate-pulse rounded" />
                        ) : (
                            <>
                                <h2 className="text-lg font-bold text-gray-900 leading-tight">
                                    {article?.title}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        {article?.subcategory?.category}
                                    </span>
                                    <span className="text-xs text-gray-400">›</span>
                                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {article?.subcategory?.name}
                                    </span>
                                    <span
                                        className={`text-xs font-medium px-2 py-0.5 rounded-full ml-1 ${
                                            article?.isPublished
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                        }`}
                                    >
                                        {article?.isPublished ? "Dipublikasikan" : "Draft"}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-4 mt-0.5 text-gray-400 hover:text-gray-700 transition"
                        aria-label="Tutup"
                    >
                        <Icon icon="solar:close-circle-outline" className="w-6 h-6" />
                    </button>
                </div>

                {/* Meta info */}
                {!isLoading && article && (
                    <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
                        <span>
                            Dibuat:{" "}
                            <span className="font-medium text-gray-700">
                                {new Date(article.createdAt).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </span>
                        <span>·</span>
                        <span>
                            Diperbarui:{" "}
                            <span className="font-medium text-gray-700">
                                {new Date(article.updatedAt).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </span>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {isLoading ? (
                        <div className="flex flex-col gap-3">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-4 bg-gray-200 animate-pulse rounded"
                                    style={{ width: `${85 - i * 8}%` }}
                                />
                            ))}
                        </div>
                    ) : (
                        <SafeHtmlContent html={article?.content} />
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function FaqHomePage() {
    const router = useRouter();
    const { data } = useGetFaqArticlesQuery();
    const [deleteFaqArticle, { isLoading: isDeleting }] = useDeleteFaqArticleMutation();

    const [viewTargetId, setViewTargetId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const handleView = (row) => setViewTargetId(row.id);
    const handleEdit = (row) => router.push(`/edit-faq/${row.id}`);
    const handleDelete = (row) => setDeleteTarget(row);

    const handleDeleteConfirm = async () => {
        try {
            await deleteFaqArticle(deleteTarget.id).unwrap();
            setDeleteTarget(null);
        } catch (err) {
            console.error("Gagal menghapus artikel:", err);
            alert("Gagal menghapus artikel. Silakan coba lagi.");
        }
    };

    const tableData = data
        ? data.data.map((article) => ({
              id: article.id,
              title: article.title,
              content: article.content,
              category: article.subcategory.category,
              subcategory: article.subcategory.name,
              subcategoryId: article.subcategoryId,
              status: article.isPublished ? "Dipublikasikan" : "Draft",
          }))
        : [];

    return (
        <div className="flex flex-col">
            <Link
                className="rounded-full self-end bg-blue-800 flex flex-row gap-2 items-center text-white px-4 py-2 w-fit mb-4 hover:bg-blue-700 transition"
                href="/create-faq"
            >
                <Icon icon="solar:pen-linear" className="w-5 h-5" />
                <p>Tambah Artikel</p>
            </Link>

            <FaqTable
                data={tableData}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* ===================== MODAL VIEW ===================== */}
            {viewTargetId && (
                <ViewArticleModal
                    articleId={viewTargetId}
                    onClose={() => setViewTargetId(null)}
                />
            )}

            {/* ================ MODAL KONFIRMASI HAPUS ================ */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
                        <h2 className="text-lg font-bold text-red-600">Hapus Artikel</h2>
                        <p className="text-sm text-gray-700">
                            Apakah Anda yakin ingin menghapus artikel{" "}
                            <span className="font-semibold">"{deleteTarget.title}"</span>?
                            Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-500 transition disabled:opacity-50"
                            >
                                {isDeleting ? "Menghapus..." : "Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}