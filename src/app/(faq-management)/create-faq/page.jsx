"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import DefaultInputSelect from "@/components/form/DefaultInputSelect";
import DefaultInputText from "@/components/form/DefaultInputText";
import HeaderWithBackButton from "@/components/header/HeaderWithBackButton";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

import {
    useGetFaqArticleCategoriesQuery,
    useGetFaqArticleSubcategoriesQuery
} from "@/hooks/api/faqArticleSubcategoryAPI";

import { createFaqArticleSchema } from "@/schema/createFaqSchema";
import { usePostFaqArticleMutation } from "@/hooks/api/faqArticleAPI";

export default function CreateFAQPage() {

    const [selectedCategory, setSelectedCategory] = useState(null);

    const { data } = useGetFaqArticleCategoriesQuery();

    const { data: subcategories } = useGetFaqArticleSubcategoriesQuery(
        { category: selectedCategory },
        { skip: !selectedCategory }
    );

    const [createFaqArticle, { isLoading: isSubmitting, error: submitError }] =
        usePostFaqArticleMutation();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(createFaqArticleSchema),
        mode: "onChange",
        defaultValues: {
            title: "",
            content: "",
            category: "",
            subCategoryId: "",
        },
    });

    const onSubmit = async (values) => {
        try {
            await createFaqArticle(values).unwrap();
            alert("Artikel berhasil ditambahkan!");

            reset();               // Reset form
            setSelectedCategory(null); // Reset subcategory dropdown
            
            // Redirect to FAQ management main page
            window.location.href = "/faq-article";
        } catch (err) {
            console.error("Gagal membuat artikel:", err);
        }
    };

    return (
        <>
            <HeaderWithBackButton
                title={"Tambah Artikel"}
                subtitle={"Detail penambahan Artikel Bantuan"}
                titlePosition="start"
            />

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
                                            data?.data?.map((category) => ({
                                                value: category,
                                                label: category,
                                            })) ?? []
                                        }
                                        value={field.value}
                                        onChange={(value) => {
                                            field.onChange(value);
                                            setSelectedCategory(value);
                                            setValue("subcategory", "");
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
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={!selectedCategory}
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
                                value={field.value}
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
                    {isSubmitting ? "Mengirim..." : "Simpan Artikel"}
                </button>
            </form>
        </>
    );
}
