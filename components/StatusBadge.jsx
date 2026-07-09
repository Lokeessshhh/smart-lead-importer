"use client";
import React from "react";

/**
 * StatusBadge Component
 * @param {Object} props
 * @param {string} props.status - The crm_status value from the record
 */
export default function StatusBadge({ status }) {
  let style = {
    backgroundColor: "#F2F2F4",
    color: "var(--text-secondary)",
    borderColor: "var(--border)",
  };
  let displayLabel = status || "UNKNOWN";

  if (status === "GOOD_LEAD_FOLLOW_UP") {
    style = { backgroundColor: "#EEF0FF", color: "#4338CA", borderColor: "#C7D2FE" };
    displayLabel = "GOOD_LEAD_FOLLOW_UP";
  } else if (status === "BAD_LEAD") {
    style = { backgroundColor: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" };
    displayLabel = "BAD_LEAD";
  } else if (status === "SALE_DONE") {
    style = { backgroundColor: "#F0FDF4", color: "#16A34A", borderColor: "#BBF7D0" };
    displayLabel = "SALE_DONE";
  } else if (status === "DID_NOT_CONNECT") {
    style = { backgroundColor: "#FFFBEB", color: "#D97706", borderColor: "#FDE68A" };
    displayLabel = "DID_NOT_CONNECT";
  }

  return (
    <span
      style={style}
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-tight whitespace-nowrap uppercase font-sans border"
    >
      {displayLabel}
    </span>
  );
}
