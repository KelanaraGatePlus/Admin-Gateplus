"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";

import DefaultInputSelect from "@/components/form/DefaultInputSelect";
import DefaultInputText from "@/components/form/DefaultInputText";
import HeaderWithBackButton from "@/components/header/HeaderWithBackButton";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

import {
    useGetFaqArticleCategoriesQuery,
    useGetFaqArticleSubcategoriesQuery,
} from "@/hooks/api/faqArticleSubcategoryAPI";

import { editFaqArticleSchema } from "@/schema/createFaqSchema";
import {
    useGetFaqArticleByIdQuery,
    useUpdateFaqArticleMutation,
} from "@/hooks/api/faqArticleAPI";

// Validasi format cuid — mencegah id arbitrary dikirim ke API
const isValidCuid = (id) =>
    typeof id === "string" && /^[a-z0-9]{20,30}$/i.test(id);

function EditFAQForm({ article, categoriesData }) {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState(null);

    const activeCategory = selectedCategory ?? article.subcategory?.category ?? null;

    const { data: subcategories } = useGetFaqArticleSubcategoriesQuery(
        { category: activeCategory },
        { skip: !activeCategory }
    );

    const [updateFaqArticle, { isLoading: isSubmitting, error: submitError }] =
        useUpdateFaqArticleMutation();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(editFaqArticleSchema),
        mode: "onChange",
        defaultValues: {
            title: article.title,
            content: article.content,
            category: article.subcategory?.category ?? "",
            subCategoryId: article.subcategoryId ?? "",
        },
    });

    const onSubmit = async (values) => {
        try {
            await updateFaqArticle({
                id: article.id,
                title: values.title,
                content: values.content,
                subCategoryId: values.subCategoryId,
            }).unwrap();

            alert("Artikel berhasil diperbarui!");
            router.push("/faq-article");
        } catch (err) {
            console.error("Gagal mengupdate artikel:", err);
            alert("Gagal mengupdate artikel. Silakan coba lagi.");
        }
    };

    return (
        <form
            className="py-6 flex flex-col gap-6"
            onSubmit={handleSubmit(onSubmit)}
        >
            {/* GRID CATEGORY + SUBCATEGORY */}
            <div className="grid grid-cols-2 gap-5">

                {/* CATEGORY */}
                <div className="flex w-full justify-between items-center">
                    <h1 className="font-bold">Kategori:</h1>
                    <div className="w-3/4">
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <DefaultInputSelect
                                    data={
                                        categoriesData?.data?.map((category) => ({
                                            value: category,
                                            label: category,
                                        })) ?? []
                                    }
                                    defaultValue={field.value}
                                    onChange={(value) => {
                                        field.onChange(value);
                                        setSelectedCategory(value);
                                        setValue("subCategoryId", "");
                                    }}
                                    placeholder="Pilih Kategori"
                                />
                            )}
                        />
                        {errors.category && (
                            <p className="text-red-600 text-sm">{errors.category.message}</p>
                        )}
                    </div>
                </div>

                {/* SUBCATEGORY */}
                <div className="flex w-full justify-between items-center">
                    <h1 className="font-bold">Sub Kategori:</h1>
                    <div className="w-3/4">
                        <Controller
                            name="subCategoryId"
                            control={control}
                            render={({ field }) => (
                                <DefaultInputSelect
                                    data={
                                        subcategories?.data?.map((sub) => ({
                                            value: sub.id,
                                            label: sub.name,
                                        })) ?? []
                                    }
                                    defaultValue={field.value}
                                    onChange={field.onChange}
                                    disabled={!activeCategory}
                                    placeholder="Pilih Sub Kategori"
                                />
                            )}
                        />
                        {errors.subCategoryId && (
                            <p className="text-red-600 text-sm">{errors.subCategoryId.message}</p>
                        )}
                    </div>
                </div>

            </div>

            {/* Title */}
            <div className="flex flex-col">
                <h1 className="font-bold mb-2">Judul Artikel</h1>
                <DefaultInputText
                    placeholder="Masukkan Judul Artikel"
                    {...register("title")}
                />
                {errors.title && (
                    <p className="text-red-600 text-sm">{errors.title.message}</p>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col">
                <h1 className="font-bold mb-2">Isi Artikel</h1>
                <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                        <SimpleEditor
                            initialContent={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                {errors.content && (
                    <p className="text-red-600 text-sm">{errors.content.message}</p>
                )}
            </div>

            {/* Submit Error */}
            {submitError && (
                <p className="text-red-600 text-sm">
                    Gagal mengirim data. Coba ulangi.
                </p>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 bg-primary text-white py-2 px-4 rounded-md disabled:opacity-50"
            >
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
        </form>
    );
}

export default function EditFAQPage() {
    const { id } = useParams();
    const router = useRouter();

    // Validasi format id sebelum dikirim ke API
    if (!isValidCuid(id)) {
        return (
            <>
                <HeaderWithBackButton
                    title={"Edit Artikel"}
                    subtitle={"Perbarui isi Artikel Bantuan"}
                    titlePosition="start"
                />
                <div className="flex items-center justify-center py-20">
                    <p className="text-red-500">ID artikel tidak valid.</p>
                </div>
            </>
        );
    }

    const { data: articleData, isLoading: isFetching } = useGetFaqArticleByIdQuery(id);
    const { data: categoriesData } = useGetFaqArticleCategoriesQuery();

    const article = articleData?.data;

    if (isFetching) {
        return (
            <>
                <HeaderWithBackButton
                    title={"Edit Artikel"}
                    subtitle={"Perbarui isi Artikel Bantuan"}
                    titlePosition="start"
                />
                <div className="flex items-center justify-center py-20">
                    <p className="text-gray-500">Memuat data artikel...</p>
                </div>
            </>
        );
    }

    if (!article) {
        return (
            <>
                <HeaderWithBackButton
                    title={"Edit Artikel"}
                    subtitle={"Perbarui isi Artikel Bantuan"}
                    titlePosition="start"
                />
                <div className="flex items-center justify-center py-20">
                    <p className="text-red-500">Artikel tidak ditemukan.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <HeaderWithBackButton
                title={"Edit Artikel"}
                subtitle={"Perbarui isi Artikel Bantuan"}
                titlePosition="start"
            />
            <EditFAQForm article={article} categoriesData={categoriesData} />
        </>
    );
}