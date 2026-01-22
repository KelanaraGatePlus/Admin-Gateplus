"use client";
import React from "react";
import FaqTable from "@/components/table/FaqTable";
import { useGetFaqArticlesQuery } from "@/hooks/api/faqArticleAPI";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function FaqHomePage() {
    const { data } = useGetFaqArticlesQuery();

    console.log(data);

    return (
        <div className="flex flex-col">
            <Link className="rounded-full self-end bg-blue-800 flex flex-row gap-2 items-center text-white px-4 py-2 w-fit mb-4 hover:bg-blue-700 transition" href="/create-faq">
                <Icon icon="solar:pen-linear" className="w-5 h-5" />
                <p>Tambah Artikel</p>
            </Link>
            <FaqTable data={data ? data.data.map(article => ({
                id: article.id,
                title: article.title,
                category: article.subcategory.category,
                subcategory: article.subcategory.name,
                status: article.status,
            })) : []} />
        </div>
    )
}