// Stepper.jsx
import React from "react";
import PropTypes from "prop-types";
import { Check } from "lucide-react";

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-[#1297DC] text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-xs font-semibold ${
                  isCompleted
                    ? "text-green-500"
                    : isActive
                      ? "text-[#1297DC]"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`mb-5 h-px w-32 transition-all ${
                  currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

Stepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      number: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
};
