"use client";

import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useGetAllOriginalContentQuery } from "@/hooks/api/contentManagementSliceAPI";
import React from "react";

const TYPE_BG = {
  FILM: "bg-blue-50 text-blue-700",
  SERIES: "bg-purple-50 text-purple-700",
  EBOOK: "bg-emerald-50 text-emerald-700",
  COMIC: "bg-orange-50 text-orange-700",
  PODCAST: "bg-pink-50 text-pink-700",
};

const generateAbbreviation = (promoTitle) => {
  return promoTitle
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 4);
};

export default function StepContentInfo({ formData, onChange, errors = {} }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: contentData, isFetching } = useGetAllOriginalContentQuery(
    { page: 1, limit: 10, search },
    { skip: !showDropdown || !searchInput },
  );

  const contents = contentData?.data || [];

  const handleSelectContent = (item) => {
    const displayTitle = item.title ?? item.promoTitle ?? "";

    onChange("contentId", item.id);
    onChange("contentType", item.contentType);
    onChange("contentTitle", displayTitle); // ← konsisten
    onChange("abbreviation", generateAbbreviation(displayTitle)); // ← dari title yang sama
    onChange(
      "contentImageUrl",
      item.posterImageUrl ?? item.coverImageUrl ?? item.coverPodcastImage ?? "",
    );
    setSearchInput(displayTitle); // ← tampil di input
    setShowDropdown(false);
  };

  const handleClearContent = () => {
    onChange("contentId", "");
    onChange("contentType", "");
    onChange("contentTitle", "");
    onChange("abbreviation", "");
    setSearchInput("");
  };

  return (
    <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800">Content Info</h2>

      {/* Judul Gift Card */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Judul Gift Card <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.promoTitle}
          onChange={(e) => onChange("promoTitle", e.target.value)}
          placeholder="Masukkan judul gift card..."
          className={`w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none ${
            errors.promoTitle
              ? "border-red-400 focus:border-red-400"
              : "border-gray-200 focus:border-[#1297DC]"
          }`}
        />
        {errors.promoTitle && (
          <p className="mt-1 text-xs text-red-500">⚠ {errors.promoTitle}</p>
        )}
      </div>

      {/* Deskripsi */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Deskripsi <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Masukkan deskripsi gift card..."
          rows={3}
          className={`w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none ${
            errors.description
              ? "border-red-400 focus:border-red-400"
              : "border-gray-200 focus:border-[#1297DC]"
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">⚠ {errors.description}</p>
        )}
      </div>

      {/* Search Konten */}
      <div ref={dropdownRef}>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Pilih Konten <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSearch(e.target.value);
              setShowDropdown(true);
              if (formData.contentId) handleClearContent();
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Ketik judul konten..."
            disabled={!!formData.contentId}
            className={`w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
              errors.contentId && !formData.contentId
                ? "border-red-400 focus:border-red-400"
                : "border-gray-200 focus:border-[#1297DC]"
            }`}
          />

          {showDropdown && searchInput && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
              {isFetching ? (
                <div className="p-4 text-center text-sm text-gray-400">
                  Mencari...
                </div>
              ) : contents.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">
                  Konten tidak ditemukan
                </div>
              ) : (
                contents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectContent(item)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left first:rounded-t-xl last:rounded-b-xl hover:bg-gray-50"
                  >
                    <img
                      src={item.coverImageUrl ?? item.posterImageUrl}
                      alt={item.title}
                      className="h-10 w-8 flex-shrink-0 rounded-md object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80x100";
                      }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {item.title}
                      </p>
                      <span
                        className={`mt-0.5 inline-block rounded-md px-2 py-0.5 text-xs font-bold ${TYPE_BG[item.contentType]}`}
                      >
                        {item.contentType}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {errors.contentId && !formData.contentId && (
          <p className="mt-1 text-xs text-red-500">⚠ {errors.contentId}</p>
        )}

        {formData.contentId && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#1297DC]/30 bg-[#1297DC]/5 px-3 py-2">
            <p className="text-sm font-semibold text-[#1297DC]">
              {formData.contentTitle}
            </p>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-bold ${TYPE_BG[formData.contentType]}`}
            >
              {formData.contentType}
            </span>
            <button
              onClick={handleClearContent}
              className="ml-auto text-xs text-gray-400 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

StepContentInfo.propTypes = {
  formData: PropTypes.shape({
    promoTitle: PropTypes.string,
    description: PropTypes.string,
    abbreviation: PropTypes.string,
    contentId: PropTypes.string,
    contentType: PropTypes.string,
    contentTitle: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
};
