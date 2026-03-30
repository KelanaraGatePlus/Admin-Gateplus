import PropTypes from "prop-types";
import React from "react";
import { Icons } from "./icons";

export default function BannerCard({ banner, onView, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-lg">
      <div className="mx-4 mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
        <div className="p-3">
          {/* Bagian Gambar */}
          <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
            {banner.imageUrl ? (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Icons.Image className="h-10 w-10 text-gray-400" />
            )}
          </div>

          {/* Bagian Footer/Nama File */}
          {banner.imageUrl && (
            <p className="mt-2 truncate px-1 text-[10px] text-gray-400">
              {banner.imageUrl.split("/").pop()}
            </p>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-base font-bold text-gray-800">
          {banner.title}
        </h3>

        {/* Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
            Priority : {banner.priority}
          </span>
          <span
            className={`ml-auto rounded px-2 py-0.5 text-xs font-medium ${banner.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
          >
            {banner.isActive ? "Aktif" : "Nonaktif"}
          </span>
        </div>

        {/* Stats Impresion & Klik */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Impresion</p>
            <p className="text-sm font-semibold text-gray-800">
              {(banner.impressions ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Klik</p>
            <p className="text-sm font-semibold text-gray-800">
              {(banner.clicks ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onView(banner)}
            className="flex items-center justify-center gap-1 rounded border border-blue-500 px-3 py-1.5 text-xs text-blue-600 transition hover:bg-blue-50"
          >
            <Icons.Eye /> Lihat
          </button>
          <button
            onClick={() => onEdit(banner)}
            className="flex items-center justify-center gap-1 rounded border border-green-500 px-3 py-1.5 text-xs text-green-600 transition hover:bg-green-50"
          >
            <Icons.Edit /> Edit
          </button>
          <button
            onClick={() => onDelete(banner.id)}
            className="flex items-center justify-center gap-1 rounded border border-red-500 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50"
          >
            <Icons.Trash /> Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

BannerCard.propTypes = {
  banner: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  showPosition: PropTypes.bool,
};
BannerCard.defaultProps = { showPosition: false };
