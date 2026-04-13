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
  useRemoveGiftCardMutation,
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

  const [removeGiftCard] = useRemoveGiftCardMutation();
  const [createGiftCard] = useCreateGiftCardMutation();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: giftCardData, isLoading } =
    useGetGiftCardByContentIdQuery(contentId);

  useEffect(() => {
    if (!giftCardData?.data?.length) return;

    const cards = giftCardData.data;
    const first = cards[0];

    const grouped = {};
    [...cards]
      .sort((a, b) => a.packageNumber - b.packageNumber)
      .forEach((card) => {
        const pkg = card.packageNumber;
        if (!grouped[pkg]) {
          grouped[pkg] = {
            uiId: pkg,
            id: card.id,
            cardName: card.cardName ?? "",
            aspect: null,
            aspectRatio: null,
            existingImageUrl: card.fileUrl ?? "",
            files: [],
          };
        }
        grouped[pkg].files.push({
          file: null,
          preview: card.fileUrl ?? "",
        });
      });

    const groupedCards = Object.values(grouped);

    setFormData({
      promoTitle: first.promoTitle ?? "",
      description: first.description ?? "",
      abbreviation: first.abbreviation ?? "",
      contentId: first.contentId ?? "",
      contentType: first.contentType ?? "",
      contentTitle: first.contentTitle ?? "",
      contentImageUrl: first.contentImageUrl ?? "",
      packageNumber: groupedCards.length,
      cards: groupedCards,
    });
  }, [giftCardData]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.promoTitle?.trim())
        newErrors.promoTitle = "Judul gift card wajib diisi";
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
          (c) =>
            !c.cardName?.trim() || (!c.files?.[0]?.file && !c.existingImageUrl),
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
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const cardsPayload = [];
      const fileAppends = [];

      const preparedCards = await Promise.all(
        formData.cards.map(async (card) => {
          const preparedFiles = await Promise.all(
            card.files.map(async (fileObj) => {
              if (fileObj?.file instanceof File) {
                return fileObj; // file baru, langsung pakai
              }
              if (fileObj?.preview) {
                try {
                  const res = await fetch(fileObj.preview);
                  const blob = await res.blob();
                  const ext = blob.type.includes("png") ? "png" : "jpg";
                  const file = new File([blob], `existing.${ext}`, {
                    type: blob.type,
                  });
                  return { file, preview: fileObj.preview };
                } catch {
                  return fileObj; // fallback
                }
              }
              return fileObj;
            }),
          );
          return { ...card, files: preparedFiles };
        }),
      );

      const totalCards = preparedCards.reduce(
        (acc, card) => acc + (card.files?.length || 0),
        0,
      );

      preparedCards.forEach((card) => {
        card.files?.forEach((fileObj) => {
          cardsPayload.push({
            cardOrder: totalCards,
            packageNumber: card.uiId,
            cardName: card.cardName,
            existingFileUrl: "",
          });
          fileAppends.push(fileObj);
        });
      });

      await removeGiftCard(formData.contentId).unwrap();

      const form = new FormData();
      form.append("contentType", formData.contentType);
      form.append("contentId", formData.contentId);
      form.append("promoTitle", formData.promoTitle);
      form.append("description", formData.description);
      form.append("abbreviation", formData.abbreviation);
      form.append("totalGacha", String(formData.cards.length));
      form.append("contentImageUrl", formData.contentImageUrl ?? "");
      form.append("contentTitle", formData.contentTitle ?? "");
      form.append("cards", JSON.stringify(cardsPayload));

      fileAppends.forEach((fileObj) => {
        if (fileObj?.file instanceof File) {
          form.append("fileUrl", fileObj.file);
        } else {
          form.append("fileUrl", new Blob([]), "");
        }
      });

      await createGiftCard(form).unwrap();

      setShowSuccessModal(true);
      setTimeout(() => router.push("/kelola-gift-card"), 2000);
    } catch (err) {
      console.error("Gagal update gift card:", err);
      alert("❌ Gagal update gift card. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
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
            {formData.contentTitle || formData.promoTitle}
          </p>
        </div>
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="mb-6">{stepComponents[currentStep]}</div>

      <div className="flex justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1 || isSubmitting}
          className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-30"
        >
          ‹ Previous
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="rounded-xl bg-[#1297DC] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f7fbf]"
          >
            Next ›
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={isSubmitting}
            className="rounded-xl bg-green-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan..." : "Update"}
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
