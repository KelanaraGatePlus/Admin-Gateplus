import React from "react";

export default function StepNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onPublish,
}) {
  return (
    <div className="flex justify-between">
      <button
        onClick={onPrev}
        disabled={currentStep === 1}
        className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30"
      >
        ‹ Previous
      </button>

      {currentStep < totalSteps ? (
        <button
          onClick={onNext}
          className="rounded-xl bg-[#1297DC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0f7fbf]"
        >
          Next ›
        </button>
      ) : (
        <button
          onClick={onPublish}
          className="rounded-xl bg-green-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-600"
        >
          Publish
        </button>
      )}
    </div>
  );
}
