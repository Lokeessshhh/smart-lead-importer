"use client";
import React from "react";

export default function Stepper({ currentStep, steps }) {
  return (
    <div className="w-full py-6 select-none animate-slide-up">
      {/* Mobile view */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/70 dark:bg-[var(--bg-surface)]/70 backdrop-blur rounded-xl border border-[var(--border)] custom-shadow mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold">Current Step</span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{steps[currentStep - 1]}</span>
        </div>
        <div className="px-3 py-1 bg-[var(--accent-light)] text-[var(--accent)] text-xs font-bold rounded-full">
          {currentStep} / {steps.length}
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-between w-full relative">
        {/* Connecting Progress Line */}
        <div 
          style={{ left: "12.5%", right: "12.5%" }} 
          className="absolute top-1/2 h-[2px] bg-[var(--border)] -translate-y-1/2 z-0" 
        />
        <div 
          style={{ 
            left: "12.5%", 
            width: `${((currentStep - 1) / (steps.length - 1)) * 75}%` 
          }} 
          className="absolute top-1/2 h-[2px] bg-gradient-to-r from-[var(--accent)] to-gray-400 -translate-y-1/2 z-0 transition-all duration-500 ease-out" 
        />

        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;

          return (
            <div 
              key={step} 
              className="flex flex-col items-center relative z-10"
              style={{ width: `${100 / steps.length}%` }}
            >
              {/* Step Bubble */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10 bg-white dark:bg-[var(--bg-surface)] ${
                  isCompleted 
                    ? "bg-[var(--success-light)] border-[var(--success)] text-[var(--success)]" 
                    : isActive 
                      ? "border-[var(--accent)] text-[var(--accent)] custom-shadow-lg scale-110" 
                      : "border-[var(--border)] text-[var(--text-tertiary)]"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold font-mono">{stepNum}</span>
                )}

                {/* Pulsing ring for active step */}
                {isActive && (
                  <span className="absolute -inset-1 rounded-full border border-[var(--accent)] opacity-20 animate-ping" />
                )}
              </div>

              {/* Step Text Label */}
              <div className="mt-3 text-center">
                <span 
                  className={`text-xs font-semibold tracking-tight transition-all duration-300 block ${
                    isActive 
                      ? "text-[var(--text-primary)] font-bold scale-105" 
                      : isCompleted
                        ? "text-[var(--text-secondary)]"
                        : "text-[var(--text-tertiary)]"
                  }`}
                >
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
