"use client";
import React from "react";

export default function Stepper({ currentStep, steps }) {
  return (
    <div className="w-full py-8 select-none animate-slide-up">
      {/* Mobile view */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] custom-shadow mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold">Current Step</span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{steps[currentStep - 1]}</span>
        </div>
        <div className="px-3 py-1 bg-[var(--accent-light)] text-[var(--accent)] text-xs font-bold rounded-full">
          {currentStep} / {steps.length}
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-between w-full relative px-2">
        {/* Connecting Thin Line */}
        <div className="absolute top-[11px] left-[12%] right-[12%] h-[1px] bg-[#E0DED9] dark:bg-[var(--border)] z-0" />

        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;

          return (
            <div 
              key={step} 
              className="flex flex-col items-center relative z-10 shrink-0"
              style={{ width: `${100 / steps.length}%` }}
            >
              {/* Typographic Stepper Label */}
              <div className="flex items-center justify-center bg-[var(--bg-base)] px-4 py-0.5 relative z-10 transition-colors duration-200">
                <span 
                  className={`text-sm tracking-tight transition-all duration-200 ${
                    isActive 
                      ? "text-[var(--text-primary)] font-semibold" 
                      : isCompleted
                        ? "text-[var(--accent)] font-semibold"
                        : "text-[var(--text-muted)] font-normal"
                  }`}
                >
                  {isCompleted && <span className="mr-1 font-bold">✓</span>}
                  {step}
                </span>
              </div>

              {/* Dot indicator below for active step */}
              <div className="h-4 flex items-center justify-center mt-1.5">
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-[pulse_1.5s_infinite]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
