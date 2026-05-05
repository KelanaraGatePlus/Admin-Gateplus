import React from "react";

export function SkeletonRow() {
    return (
        <tr className="border-b border-gray-50 animate-pulse">
            <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded-lg w-32" /></td>
            <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
            <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded-lg w-20" /></td>
            <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded-lg w-24" /></td>
            <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded-lg w-20" /></td>
            <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded-lg w-16" /></td>
            <td className="px-4 py-4"><div className="flex gap-2 justify-center"><div className="h-8 w-8 bg-gray-100 rounded-lg" /><div className="h-8 w-8 bg-gray-100 rounded-lg" /></div></td>
        </tr>
    );
}