"use client";
import React from "react";
import FaqTable from "@/components/table/FaqTable";
import { useGetFaqArticlesQuery } from "@/hooks/api/faqArticleAPI";
import Link from "next/link";
import { Icon } from "@iconify/react";
import VoucherTable from "@/components/table/VoucherTable";

export function VoucherCard({
    title,
    description,
    textColor = "black",
}) {
    return (
        <div className="bg-[#F5F5F5B2] flex-col border-1 p-4 gap-4 border-[#F5F5F5] rounded-xl zeinFont font-black text-center m-2">
            <h1>{title}</h1>
            <p className="font-bold text-5xl mt-4" style={
                { color: textColor }
            }>{description}</p>
        </div>
    )
}

export default function VoucherPage() {
    const { data } = useGetFaqArticlesQuery();

    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-4 mb-4">
                <VoucherCard title="Total Voucher" description={data ? data.data.length : 0} textColor="#156EB7" />
                <VoucherCard title="Voucher Aktif" description={data ? data.data.length : 0} textColor="#156EB7" />
                <VoucherCard title="Total Pengguna" description={data ? data.data.length : 0} textColor="#156EB7" />
                <VoucherCard title="Jumlah Diskon" description={data ? data.data.length : 0} textColor="#156EB7" />
            </div>
            <Link className="rounded-full self-end bg-blue-800 flex flex-row gap-2 items-center text-white px-4 py-2 w-fit mb-4 hover:bg-blue-700 transition" href="/create-faq">
                <Icon icon="solar:pen-linear" className="w-5 h-5" />
                <p>Tambah Artikel</p>
            </Link>
            <VoucherTable />
        </div >
    )
}