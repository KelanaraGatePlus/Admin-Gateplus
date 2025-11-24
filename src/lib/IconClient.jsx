"use client";

import React from "react";
import { Icon } from "@iconify/react";

// Wrapper around Iconify's Icon to keep API compatible with existing usage.
// Accepts `icon` (string) and `className` and forwards all other props.
export default function IconClient({ icon, className = "", width, height, style = {}, ...props }) {
  // If no `icon` is provided, render a simple fallback SVG so callers
  // won't break and accessibility is preserved.
  if (!icon) {
    const label = props["aria-label"] || "icon";
    return (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={label}
        className={className}
        width={width || "1em"}
        height={height || "1em"}
        style={style}
        {...props}
      >
        <rect width="24" height="24" rx="4" fill="currentColor" opacity="0.12" />
        <path d="M6 12h12M12 6v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Ensure accessible label when provided via props or infer from icon name
  const ariaLabel = props["aria-label"] || (typeof icon === "string" ? icon : undefined);

  // Provide sensible default sizing: 1em so icons scale with font-size.
  const defaultSizeStyle = { width: width || "1em", height: height || "1em" };

  return (
    <Icon
      icon={icon}
      className={className}
      aria-label={ariaLabel}
      width={width}
      height={height}
      style={{ ...defaultSizeStyle, ...style }}
      {...props}
    />
  );
}
