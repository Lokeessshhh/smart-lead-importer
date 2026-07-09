"use client";
import React from "react";
import { Sparkles, ArrowLeft, ArrowRight } from "lucide-react";

export default function ConfirmBanner({ recordCount, onConfirm, onBack, isLoading }) {
  return (
    <div className="w-full bg-white dark:bg-[var(--bg-surface)] rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 select-none custom-shadow-lg animate-slide-up border-none">
      {/* Left side */}
      <div className="flex items-center gap-4 text-left">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <h4 className="text-base font-semibold text-[var(--text-primary)] leading-tight tracking-tight">
            Ready to parse {recordCount} lead records
          </h4>
          <p className="text-sm text-[var(--text-secondary)] mt-1 leading-normal">
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
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent hover:bg-[#F3F2EF] dark:hover:bg-[var(--bg-elevated)] transition-all duration-180 disabled:opacity-50 cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading || recordCount === 0}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[#0066DD] transition-all duration-180 disabled:opacity-50 cursor-pointer shadow-[0_1px_3px_rgba(0,122,255,0.3)] hover:shadow-[0_2px_6px_rgba(0,122,255,0.4)] active:scale-95"
        >
          <span>Begin AI Extraction</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
