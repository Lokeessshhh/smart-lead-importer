"use client";
import React, { useEffect, useState } from "react";
import { Cpu } from "lucide-react";

export default function LoadingOverlay({ currentBatch = 0, totalBatches = 0, progress = 0 }) {
  const [statusText, setStatusText] = useState("Initializing AI models...");

  // Rotate text to show AI is processing different items
  useEffect(() => {
    const tasks = [
      "Analyzing CSV column structures...",
      "Normalizing lead names to proper casing...",
      "Cleaning title prefixes and suffixes...",
      "Recovering misplaced phone numbers...",
      "Excluding non-approved data sources...",
      "Formatting status enums...",
      "Constructing final CRM records..."
    ];

    let count = 0;
    const interval = setInterval(() => {
      setStatusText(tasks[count % tasks.length]);
      count++;
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 rounded-2xl bg-white/70 dark:bg-[var(--bg-base)]/70 backdrop-blur-md select-none animate-fade-in">
      <div className="flex flex-col items-center max-w-sm w-full text-center bg-white dark:bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8 custom-shadow-lg">
        {/* Glowing CPU/AI icon */}
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center mb-5 relative">
          <Cpu className="w-6 h-6 animate-pulse" />
          <div 
            className="absolute inset-0 rounded-2xl border-2 border-[var(--accent)] border-t-transparent animate-spin"
            style={{ animationDuration: '1.2s' }}
          />
        </div>

        <h3 className="text-[15px] font-extrabold text-[var(--text-primary)] mb-1">
          AI Pipeline Executing
        </h3>
        
        <p className="text-xs text-[var(--text-secondary)] font-medium h-4 min-h-[16px] transition-all">
          {statusText}
        </p>

        {totalBatches > 0 && (
          <div className="mt-4 text-[10px] font-bold tracking-wider uppercase text-[var(--text-tertiary)] font-mono">
            Batch {currentBatch} of {totalBatches} ({Math.round(progress)}%)
          </div>
        )}

        {/* Shimmering Progress Bar */}
        <div className="w-full bg-[var(--bg-elevated)] h-2 rounded-full mt-4 overflow-hidden border border-[var(--border)]">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-[var(--accent)] to-gray-500 transition-all duration-300 ease-out relative"
          >
            {/* Shimmer overlay */}
            <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
