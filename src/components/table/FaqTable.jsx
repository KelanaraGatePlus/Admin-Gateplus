"use client";
import React from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";
import Link from "next/link";
import Icon from "@/lib/IconClient";

export default function FaqTable({ data }) {
    // Dummy data (replace with props)
    const dataDummy = React.useMemo(
        () => [
            {
                id: "ART001",
                title: "10 Manfaat Sorgum untuk Kesehatan",
                category: "Kesehatan",
                subcategory: "Nutrisi",
                status: "Dipublikasikan",
            },
            {
                id: "ART002",
                title: "Cara Menanam Sorgum di Lahan Kering",
                category: "Pertanian",
                subcategory: "Teknik Budidaya",
                status: "Draft",
            },
            {
                id: "ART003",
                title: "Resep Kue Sorgum Gluten-Free",
                category: "Kuliner",
                subcategory: "Resep",
                status: "Dipublikasikan",
            },
        ],
        []
    );

    // Columns
    const columns = React.useMemo(
        () => [
            {
                accessorKey: "title",
                header: "Judul Artikel",
                cell: (info) => (
                    <div className="font-semibold">{info.getValue()}</div>
                ),
            },
            {
                accessorKey: "category",
                header: "Kategori & Subkategori",
                cell: (info) => (
                    <div>
                        <div>{info.row.original.category}</div>
                        <div className="text-xs text-gray-400">
                            {info.row.original.subcategory}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: (info) => {
                    const status = info.getValue();
                    const color =
                        status === "Dipublikasikan"
                            ? "bg-green-600/30 text-green-300"
                            : status === "Draft"
                                ? "bg-yellow-600/30 text-yellow-300"
                                : "bg-red-600/30 text-red-300";

                    return (
                        <span className={`px-3 py-1 rounded-full text-sm ${color}`}>
                            {status}
                        </span>
                    );
                },
            },
            {
                id: "aksi",
                header: "Aksi",
                cell: (info) => (
                    <div className="flex flex-row gap-1">
                        <Icon icon="solar:eye-outline" className="inline-block ml-1 text-[#1482C9]" />
                        <Icon icon="solar:pen-linear" className="inline-block ml-1 text-[#5856D6]" />
                        <Icon icon="solar:trash-bin-trash-outline" className="inline-block ml-1 text-[#D00416]" />
                    </div>
                ),
            },
        ],
        []
    );

    // Search state
    const [globalFilter, setGlobalFilter] = React.useState("");

    // Sorting & pagination
    const [sorting, setSorting] = React.useState([]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 5,
    });

    const table = useReactTable({
        data: data ?? dataDummy,
        columns,
        state: { sorting, pagination, globalFilter },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="bg-[#DEDEDE] text-black rounded-lg border border-white overflow-hidden">

            {/* Search */}
            <div className="p-4 bg-white border-b border-white">
                <input
                    type="text"
                    placeholder="Cari artikel..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full p-2 rounded bg-[#333] text-white outline-none"
                />
            </div>

            <table className="w-full">
                <thead className="bg-[#DEDEDE]">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="px-4 py-6 text-left text-sm font-bold cursor-pointer select-none"
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getIsSorted()
                                        ? header.column.getIsSorted() === "asc"
                                            ? " ▲"
                                            : " ▼"
                                        : " ↕"}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>

                <tbody>
                    {table.getRowModel().rows.map((row, i) => (
                        <tr
                            key={row.id}
                            className={i % 2 === 0 ? "bg-white" : ""}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-4 py-3">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center p-4 bg-white">
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1 bg-[#515151] rounded disabled:opacity-40"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {"<<"}
                    </button>
                    <button
                        className="px-3 py-1 bg-[#515151] rounded disabled:opacity-40"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {"<"}
                    </button>
                    <button
                        className="px-3 py-1 bg-[#515151] rounded disabled:opacity-40"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {">"}
                    </button>
                    <button
                        className="px-3 py-1 bg-[#515151] rounded disabled:opacity-40"
                        onClick={() =>
                            table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                    >
                        {">>"}
                    </button>
                </div>

                <span className="text-sm">
                    Halaman{" "}
                    <strong>
                        {table.getState().pagination.pageIndex + 1} dari{" "}
                        {table.getPageCount()}
                    </strong>
                </span>

                <select
                    className="bg-[#515151] p-2 rounded"
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                >
                    {[5, 10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                            Tampilkan {size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
