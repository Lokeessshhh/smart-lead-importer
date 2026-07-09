"use client";
import React from "react";

export default function StatusBadge({ status }) {
  let badgeClass = "bg-[var(--bg-elevated)] text-[var(--text-secondary)]";
  let displayLabel = status || "UNKNOWN";

  if (status === "GOOD_LEAD_FOLLOW_UP") {
    badgeClass = "bg-[#EBF4FF] dark:bg-[rgba(0,122,255,0.15)] text-[#007AFF]";
  } else if (status === "BAD_LEAD") {
    badgeClass = "bg-[#FFF2F1] dark:bg-[rgba(255,59,48,0.15)] text-[#FF3B30]";
  } else if (status === "SALE_DONE") {
    badgeClass = "bg-[#F0FBF3] dark:bg-[rgba(52,199,89,0.15)] text-[#34C759]";
  } else if (status === "DID_NOT_CONNECT") {
    badgeClass = "bg-[#FFF8EE] dark:bg-[rgba(255,149,0,0.15)] text-[#FF9500]";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight whitespace-nowrap uppercase font-sans border-none ${badgeClass}`}
    >
      {displayLabel}
    </span>
  );
}
