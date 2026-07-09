"use client";
import React, { useEffect, useState } from "react";

const LOADER_MESSAGES = [
  "Structuring headers...",
  "Running auto-retry queue...",
  "Normalizing name casings...",
  "Cleaning title suffixes...",
  "Recovering misplaced phone cells...",
  "Scrubbing unqualified data sources...",
  "Aligning notes to index numbers..."
];

export default function LoadingOverlay({ progress, currentBatch, totalBatches }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADER_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 rounded-2xl bg-[var(--bg-base)]/60 backdrop-blur-md select-none animate-fade-in">
      <div className="flex flex-col items-center max-w-sm w-full text-center bg-white dark:bg-[var(--bg-surface)] rounded-2xl p-8 custom-shadow-lg border-none">
        
        {/* Thin Apple-style spinner ring */}
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-5" />

        <h4 className="text-base font-semibold text-[var(--text-primary)]">
          Parsing CSV with AI
        </h4>
        <p className="text-xs text-[var(--text-secondary)] font-mono mt-1">
          Batch {currentBatch} of {totalBatches} ({progress}%)
        </p>

        {/* Dynamic AI Execution log */}
        <div className="h-6 flex items-center justify-center mt-4">
          <span className="text-[11px] text-[var(--text-muted)] font-medium transition-opacity duration-300">
            {LOADER_MESSAGES[msgIndex]}
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-[var(--bg-elevated)] h-1.5 rounded-full mt-5 overflow-hidden">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-[var(--accent)] transition-all duration-300 ease-out"
          />
        </div>
      </div>
    </div>
  );
}
