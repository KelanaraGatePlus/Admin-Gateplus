import React from "react";

export function StatCard({ icon, iconBg, label, value, sub, accent }) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200
      ${accent ? "ring-1 ring-inset " + accent : ""}`}>
            <div className="flex items-center gap-2.5 text-gray-500 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    {icon}
                </div>
                <span className="text-sm font-medium text-gray-600">{label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}