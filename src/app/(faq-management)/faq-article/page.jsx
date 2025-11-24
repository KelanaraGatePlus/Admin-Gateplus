"use client";
import React from "react";
import FaqTable from "@/components/table/FaqTable";
import { useGetFaqArticlesQuery } from "@/hooks/api/faqArticleAPI";

export default function FaqHomePage() {
    const { data } = useGetFaqArticlesQuery();

    return (
        <FaqTable data={data ? data.data.map(article => ({
            id: article.id,
            title: article.title,
            category: article.subcategory.category,
            subcategory: article.subcategory.name,
            status: article.status,
        })) : []} />
    )
}