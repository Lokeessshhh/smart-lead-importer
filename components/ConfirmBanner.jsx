"use client";
import React from "react";
import { Sparkles, ArrowLeft, ArrowRight } from "lucide-react";

export default function ConfirmBanner({ recordCount, onConfirm, onBack, isLoading }) {
  return (
    <div className="w-full bg-white dark:bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 select-none custom-shadow animate-slide-up">
      {/* Left side */}
      <div className="flex items-center gap-4 text-left">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <h4 className="text-[15px] font-extrabold text-[var(--text-primary)] leading-tight">
            Ready to parse {recordCount} lead records
          </h4>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-tight">
            Our AI model will extract, clean, and map columns to GrowEasy CRM enums automatically.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-[var(--border)] rounded-xl font-bold text-xs text-[var(--text-secondary)] bg-white dark:bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading || recordCount === 0}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[var(--accent)] to-gray-700 hover:from-[var(--accent-hover)] hover:to-gray-800 transition-all duration-200 disabled:opacity-50 custom-shadow hover:scale-[1.02] cursor-pointer"
        >
          <span>Begin AI Extraction</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
