"use client";

import React from "react";

export default function NotFoundIllustration() {
  return (
    <div className="relative flex h-[250px] w-[550px] items-stretch justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className="object-center object-contain h-full w-full max-w-[300px]"
        role="img"
        aria-label="Folder error illustration"
      >
        <g fill="none" fillRule="evenodd">
          <rect width="64" height="64" rx="8" fill="#0EA5E9" />
          <path
            d="M12 22h14l4 4h18v18a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V26a4 4 0 0 1 4-4z"
            fill="#fff"
            opacity="0.96"
          />
          <circle cx="44" cy="38" r="6" fill="#D00416" />
          <path d="M44 35v6M44 43v0" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
