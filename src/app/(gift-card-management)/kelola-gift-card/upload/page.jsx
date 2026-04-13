"use client";

import { useState } from "react";
import React from "react";
import Stepper from "@/components/stepper/stepper";
import StepContentInfo from "@/components/stepper/steps/stepContentInfo";
import StepCardsConfig from "@/components/stepper/steps/stepCardConfig";
import StepReviewPublish from "@/components/stepper/steps/stepReviewPublish";
import { useCreateGiftCardMutation } from "@/hooks/api/giftCardSliceAPI";
import ConfirmModal from "@/components/Modal/ConfirmModal";
import { useRouter } from "next/navigation";
import WarningModal from "@/components/Modal/warningModal";

const steps = [
  { number: 1, label: "Content Info" },
  { number: 2, label: "Cards & Config" },
  { number: 3, label: "Review & Publish" },
];

export default function UploadGiftCardPage() {
  const router = useRouter();
  const [createGiftCard] = useCreateGiftCardMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    promoTitle: "",
    description: "",
    abbreviation: "",
    contentId: "",
    contentType: "",
    contentTitle: "",
    packageNumber: 0,
    fileUrl: "",
    contentImageUrl: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.promoTitle.trim())
        newErrors.promoTitle = "Judul gift card wajib diisi";
      if (!formData.description.trim())
        newErrors.description = "Deskripsi wajib diisi";
      if (!formData.contentId)
        newErrors.contentId = "Pilih konten terlebih dahulu";
    }

    if (step === 2) {
      if (!formData.cards?.length) {
        newErrors.cards = "Generate slot card terlebih dahulu (tekan Enter)";
      } else {
        const incomplete = formData.cards.filter(
          (c) => !c.files?.length || !c.cardName?.trim(),
        );
        if (incomplete.length > 0) {
          newErrors.cards = `${incomplete.length} card belum lengkap — pastikan semua card memiliki gambar dan nama`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    console.log("formData saat next:", formData);
    if (!validateStep(currentStep)) return;
    if (currentStep < steps.length) setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => {
    setErrors({});
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handlePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    try {
      const cardsPayload = [];
      const fileAppends = [];

      formData.cards?.forEach((card) => {
        card.files?.forEach((fileObj) => {
          cardsPayload.push({
            cardOrder: 0, // di-update setelah loop
            packageNumber: card.uiId,
            cardName: card.cardName,
          });
          fileAppends.push(fileObj);
        });
      });

      const totalCards = cardsPayload.length;
      cardsPayload.forEach((c) => (c.cardOrder = totalCards));

      const form = new FormData();
      form.append("contentType", formData.contentType);
      form.append("contentId", formData.contentId);
      form.append("promoTitle", formData.promoTitle);
      form.append("description", formData.description);
      form.append("abbreviation", formData.abbreviation);
      form.append("totalGacha", String(formData.cards?.length || 0));
      form.append("contentImageUrl", formData.contentImageUrl ?? "");
      form.append("contentTitle", formData.contentTitle ?? "");
      form.append("cards", JSON.stringify(cardsPayload));

      fileAppends.forEach((fileObj) => {
        form.append("fileUrl", fileObj.file);
      });

      await createGiftCard(form).unwrap();

      setShowSuccessModal(true);
      setTimeout(() => {
        router.push("/kelola-gift-card");
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err?.data?.message === "CONTENT_ALREADY_USED") {
        setCurrentStep(1);
        setShowWarningModal(true);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    router.push("/kelola-gift-card"); // Redirect setelah modal ditutup
  };

  const stepComponents = {
    1: (
      <StepContentInfo
        formData={formData}
        onChange={handleChange}
        errors={errors}
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
            Gacha Card Settings
          </h1>
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
            {isPublishing ? "Menyimpan..." : "Publish"}
          </button>
        )}
      </div>
      <ConfirmModal
        isOpen={showSuccessModal}
        onConfirm={handleCloseSuccess}
        title="Berhasil Dipublikasikan!"
        message="Gift card Anda telah berhasil disimpan dan diterbitkan."
        hideButtons={true}
      />
      <WarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        onConfirm={() => setShowWarningModal(false)}
        title="Konten Sudah Digunakan"
        message="Konten yang Anda pilih sudah digunakan. Silakan pilih konten lain."
      />
    </div>
  );
}
