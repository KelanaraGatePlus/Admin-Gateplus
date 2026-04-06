import React from "react";
import PropTypes from "prop-types";

export default function StepReviewPublish({ formData }) {
  const totalCards =
    formData.cards?.reduce((acc, card) => acc + (card.files?.length || 0), 0) ??
    0;
  const cardsPerGacha = formData.packageNumber || 0;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-800">Review & Publish</h2>

      <div className="grid grid-cols-2 gap-4 border-b border-gray-100 px-4 py-4">
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-6 py-4">
          <p className="text-sm font-bold text-gray-800">Content Info</p>

          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Title:</span>{" "}
              {formData.promoTitle || "-"}
            </p>

            <p className="text-sm text-gray-700">
              <span className="font-semibold">Description:</span>{" "}
              {formData.description || "-"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 px-6 py-4">
          <p className="text-sm font-bold text-gray-800">Gacha Settings</p>

          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-700">
              <span className="text-sm">Cards per Gacha:</span> {cardsPerGacha}
            </p>

            <p className="text-sm text-gray-700">
              <span className="text-sm">Total Cards:</span> {totalCards}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="mb-4 text-sm font-bold text-gray-800">Cards List</h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {formData.cards?.map((card) => (
            <div
              key={card.uiId}
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
            >
              {/* IMAGE */}
              <div
                className="relative mb-2 w-full overflow-hidden rounded-lg bg-gray-100"
                style={{
                  aspectRatio: card.aspectRatio
                    ? `${card.aspectRatio}`
                    : "339 / 512",
                }}
              >
                {card.files?.[0]?.preview ? (
                  <img
                    src={card.files[0].preview}
                    alt={card.cardName}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="space-y-1">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {card.cardName || "No Name"}
                </p>

                <p className="truncate font-mono text-xs text-gray-400">
                  {card.cardId || "-"}
                </p>

                <p className="text-xs text-gray-400">
                  {card.files?.length || 0} image
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

StepReviewPublish.propTypes = {
  formData: PropTypes.shape({
    promoTitle: PropTypes.string,
    description: PropTypes.string,
    packageNumber: PropTypes.number,
    cards: PropTypes.array,
  }).isRequired,
};
