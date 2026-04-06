"use client";

import PropTypes from "prop-types";
import { useRef, useState, useCallback, useEffect } from "react";
import React from "react";
import CardInputModal from "@/components/Modal/cardInputModal";
import generateId from "@/lib/idGenerator";

function normalizeCards(rawCards) {
  if (!Array.isArray(rawCards) || rawCards.length === 0) return [];
  return rawCards.map((card) => ({
    ...card,
    files: Array.isArray(card.files)
      ? card.files.map((f) => ({
          ...f,
          // Fallback: gunakan imageUrl / url dari API sebagai preview
          preview: f.preview || f.imageUrl || f.url || null,
          file: f.file || null,
        }))
      : [],
  }));
}

export default function StepCardsConfig({
  formData,
  onChange,
  submitting,
  errors = {},
}) {
  const [cards, setCards] = useState(() => normalizeCards(formData?.cards));

  const [inputValue, setInputValue] = useState(
    formData?.packageNumber ? String(formData.packageNumber) : "",
  );

  const fileInputRefs = useRef({});

  const [cardInputModal, setCardInputModal] = useState({
    isOpen: false,
    cardUiId: null,
  });

  const abbreviation = formData?.abbreviation ?? "XX";

  useEffect(() => {
    if (Array.isArray(formData?.cards) && formData.cards.length > 0) {
      const normalized = normalizeCards(formData.cards);
      setCards(normalized);
    }
  }, [formData?.cards]);

  useEffect(() => {
    if (formData?.packageNumber && !inputValue) {
      setInputValue(String(formData.packageNumber));
    }
  }, [formData?.packageNumber]);

  const totalUploadedCards = cards.reduce(
    (acc, card) => acc + card.files.length,
    0,
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      console.log("prev cards saat Enter:", cards);
      console.log("inputValue:", inputValue);
      const num = parseInt(inputValue);
      if (!num || num < 1) return;

      onChange("packageNumber", num);

      setCards((prev) => {
        if (prev.length === num) return prev;

        return Array.from({ length: num }, (_, i) => {
          // Pertahankan data lama jika slot sudah ada
          const existing = prev.find((c) => c.uiId === i + 1);
          return (
            existing || {
              uiId: i + 1,
              id: null,
              files: [],
              cardName: null,
              cardId: null,
              aspect: null,
              aspectRatio: null,
            }
          );
        });
      });
    }
  };

  const handleModalConfirm = useCallback(
    ({ file, preview, cardName, aspect, aspectRatio }) => {
      const { cardUiId } = cardInputModal;

      setCards((prev) => {
        const updated = prev.map((card) =>
          card.uiId === cardUiId
            ? {
                ...card,
                cardName,
                aspect,
                aspectRatio,
                files: [...card.files, { file, preview }],
              }
            : card,
        );

        const totalCards = updated.reduce(
          (acc, card) => acc + card.files.length,
          0,
        );

        const updatedWithId = updated.map((card) => ({
          ...card,
          cardId: generateId(
            formData.abbreviation ?? "XX",
            prev.length,
            totalCards,
            card.uiId,
          ),
        }));

        onChange("cards", updatedWithId);
        return updatedWithId;
      });

      setCardInputModal({ isOpen: false, cardUiId: null });
    },
    [cardInputModal, onChange, formData.abbreviation],
  );

  const handleRemoveFile = (cardUiId, fileIndex) => {
    setCards((prev) => {
      const updated = prev.map((card) => {
        if (card.uiId !== cardUiId) return card;
        const updatedFiles = card.files.filter((_, i) => i !== fileIndex);
        return { ...card, files: updatedFiles };
      });

      const totalCards = updated.reduce(
        (acc, card) => acc + card.files.length,
        0,
      );

      const updatedWithId = updated.map((card) => ({
        ...card,
        cardId:
          card.files.length > 0
            ? generateId(
                formData.abbreviation ?? "XX",
                prev.length,
                totalCards,
                card.uiId,
              )
            : null,
      }));

      onChange("cards", updatedWithId);
      return updatedWithId;
    });
  };

  return (
    <>
      {cardInputModal.isOpen && (
        <CardInputModal
          cardUiId={cardInputModal.cardUiId}
          cardOrder={totalUploadedCards}
          totalGacha={cards.length}
          abbreviation={abbreviation}
          onConfirm={handleModalConfirm}
          onCancel={() => setCardInputModal({ isOpen: false, cardUiId: null })}
        />
      )}

      <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
          Gacha Configuration
        </h2>

        {errors.cards && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>⚠</span>
            <span>{errors.cards}</span>
          </div>
        )}

        {/* Cards per Gacha */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cards per Gacha <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Tekan Enter untuk generate slot..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              min={1}
            />
            {cards.length > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                {cards.length} slot · {totalUploadedCards} total card diupload
              </p>
            )}
          </div>

          <div className="flex-1 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            🛈 Semua card memiliki kesempatan yang sama (equal probability)
          </div>
        </div>

        {/* Card Package */}
        {cards.map((card) => {
          const isIncomplete =
            errors.cards && (!card.files?.length || !card.cardName?.trim());

          return (
            <div
              key={card.uiId}
              className={`rounded-xl p-3 transition ${
                isIncomplete
                  ? "border border-red-200 bg-red-50/40"
                  : "border border-transparent"
              }`}
            >
              <div className="mb-3 flex items-center gap-3">
                <h3 className="text-sm font-bold text-gray-800">
                  🎯 Upload Cards {card.uiId}
                </h3>
                {isIncomplete && (
                  <span className="text-xs text-red-500">
                    {!card.files?.length
                      ? "⚠ Belum ada gambar"
                      : "⚠ Nama belum diisi"}
                  </span>
                )}
                {card.cardId && (
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500">
                    {card.cardId}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {card.files.map((item, index) => (
                  <div
                    key={index}
                    className="relative w-28 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200"
                    style={{
                      aspectRatio: card.aspectRatio
                        ? `${card.aspectRatio}`
                        : "339 / 512",
                    }}
                  >
                    {item.preview ? (
                      <img
                        src={item.preview}
                        alt={`card-${card.uiId}-${index}`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(card.uiId, index)}
                      className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white hover:bg-red-600"
                      disabled={submitting}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <div
                  onClick={() =>
                    !submitting &&
                    setCardInputModal({ isOpen: true, cardUiId: card.uiId })
                  }
                  className="relative w-28 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-300 transition hover:border-blue-400"
                  style={{ aspectRatio: "339 / 512" }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <p className="px-2 text-center text-xs text-gray-500">
                      Click to upload
                    </p>
                    <p className="text-xs text-gray-400">JPG/PNG</p>
                  </div>
                </div>

                <input
                  ref={(el) => (fileInputRefs.current[card.uiId] = el)}
                  type="file"
                  accept="image/jpg, image/png"
                  multiple
                  className="hidden"
                  disabled={submitting}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

StepCardsConfig.propTypes = {
  formData: PropTypes.shape({
    packageNumber: PropTypes.number.isRequired,
    abbreviation: PropTypes.string,
    cards: PropTypes.array,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  errors: PropTypes.object,
};

StepCardsConfig.defaultProps = {
  submitting: false,
};
