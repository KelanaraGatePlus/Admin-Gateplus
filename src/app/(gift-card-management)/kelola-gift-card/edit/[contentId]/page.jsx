"use client";

import { useState, useEffect } from "react";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import Stepper from "@/components/stepper/stepper";
import StepContentInfo from "@/components/stepper/steps/stepContentInfo";
import StepCardsConfig from "@/components/stepper/steps/stepCardConfig";
import StepReviewPublish from "@/components/stepper/steps/stepReviewPublish";
import {
  useGetGiftCardByContentIdQuery,
  usePatchGiftCardMutation,
  useCreateGiftCardMutation,
} from "@/hooks/api/giftCardSliceAPI";
import ConfirmModal from "@/components/Modal/ConfirmModal";

const steps = [
  { number: 1, label: "Content Info" },
  { number: 2, label: "Cards & Config" },
  { number: 3, label: "Review & Publish" },
];

export default function EditGiftCardPage() {
  const { contentId } = useParams();
  const router = useRouter();
  const [patchGiftCard] = usePatchGiftCardMutation();
  const [createGiftCard] = useCreateGiftCardMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: giftCardData, isLoading } =
    useGetGiftCardByContentIdQuery(contentId);

  useEffect(() => {
    if (!giftCardData?.data?.length) return;

    const cards = giftCardData.data;
    const first = cards[0];

    setFormData({
      title: first.title ?? "",
      description: first.description ?? "",
      abbreviation: first.abbreviation ?? "",
      contentId: first.contentId ?? "",
      contentType: first.contentType ?? "",
      contentTitle: first.contentTitle ?? "",
      packageNumber: cards.length,
      contentImageUrl: first.contentImageUrl ?? "",
      cards: cards.map((card) => ({
        uiId: card.packageNumber,
        id: card.id, // ada id = card lama
        cardName: card.cardName ?? "",
        cardId: card.id,
        aspect: null,
        aspectRatio: null,
        existingImageUrl: card.fileUrl,
        files: [{ file: null, preview: card.fileUrl }],
      })),
    });
  }, [giftCardData]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title?.trim())
        newErrors.title = "Judul gift card wajib diisi";
      if (!formData.description?.trim())
        newErrors.description = "Deskripsi wajib diisi";
      if (!formData.contentId)
        newErrors.contentId = "Pilih konten terlebih dahulu";
    }
    if (step === 2) {
      if (!formData.cards?.length) {
        newErrors.cards = "Tidak ada card";
      } else {
        const incomplete = formData.cards.filter(
          (c) => !c.cardName?.trim() || !c.files?.length,
        );
        if (incomplete.length > 0) {
          newErrors.cards = `${incomplete.length} card belum lengkap`;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < steps.length) setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => {
    setErrors({});
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handlePublish = async () => {
    try {
      const totalCards = formData.cards?.length ?? 0;

      const existingCards = formData.cards.filter((c) => c.id);
      const newCards = formData.cards.filter((c) => !c.id);

      const patchResults = await Promise.allSettled(
        existingCards.map(async (card) => {
          const form = new FormData();
          form.append("title", formData.title);
          form.append("description", formData.description);
          form.append("abbreviation", formData.abbreviation);
          form.append("contentType", formData.contentType);
          form.append("contentId", formData.contentId);
          form.append("contentTitle", formData.contentTitle ?? "");
          form.append("contentImageUrl", formData.contentImageUrl ?? "");
          form.append("totalGacha", String(totalCards));
          form.append("cardOrder", String(totalCards));
          form.append("packageNumber", String(card.uiId));
          form.append("cardName", card.cardName ?? "");

          if (card.files?.[0]?.file) {
            form.append("fileUrl", card.files[0].file);
          }

          return patchGiftCard({ id: card.id, formData: form }).unwrap();
        }),
      );

      if (newCards.length > 0) {
        const form = new FormData();
        form.append("contentType", formData.contentType);
        form.append("contentId", formData.contentId);
        form.append("title", formData.title);
        form.append("description", formData.description);
        form.append("abbreviation", formData.abbreviation);
        form.append("totalGacha", String(totalCards));
        form.append("contentImageUrl", formData.contentImageUrl ?? "");
        form.append("contentTitle", formData.contentTitle ?? "");

        const cardsPayload = [];
        newCards.forEach((card) => {
          const fileObj = card.files?.[0];
          if (fileObj?.file) {
            form.append("fileUrl", fileObj.file);
            cardsPayload.push({
              cardOrder: totalCards,
              packageNumber: card.uiId,
              cardName: card.cardName,
            });
          }
        });
        form.append("cards", JSON.stringify(cardsPayload));

        await createGiftCard(form).unwrap();
      }

      const failedPatches = patchResults.filter((r) => r.status === "rejected");
      if (failedPatches.length > 0) {
        alert(`❌ ${failedPatches.length} card lama gagal diupdate`);
        return;
      }

      setShowSuccessModal(true);
      setTimeout(() => {
        router.push("/kelola-gift-card");
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("❌ Gagal update");
    }
  };
  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    router.push("/kelola-gift-card");
  };

  if (isLoading || !formData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9]">
        <p className="text-sm text-gray-400">Memuat data...</p>
      </div>
    );
  }

  const stepComponents = {
    1: (
      <StepContentInfo
        formData={formData}
        onChange={handleChange}
        errors={errors}
        isEdit
      />
    ),
    2: (
      <StepCardsConfig
        formData={formData}
        onChange={handleChange}
        errors={errors}
      />
    ),
    3: <StepReviewPublish formData={formData} />,
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] p-6">
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="mb-1 text-2xl font-bold text-gray-800">
            Edit Gacha Card
          </h1>
          <p className="text-sm text-gray-500">
            {formData.contentTitle || formData.title}
          </p>
        </div>
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="mb-6">{stepComponents[currentStep]}</div>

      <div className="flex justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-30"
        >
          ‹ Previous
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={handleNext}
            className="rounded-xl bg-[#1297DC] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f7fbf]"
          >
            Next ›
          </button>
        ) : (
          <button
            onClick={handlePublish}
            className="rounded-xl bg-green-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            Update
          </button>
        )}
      </div>
      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccess}
        onConfirm={handleCloseSuccess}
        title="Berhasil Dipublikasikan!"
        message="Gift card Anda telah berhasil disimpan dan diterbitkan."
        hideButtons={true}
      />
    </div>
  );
}
