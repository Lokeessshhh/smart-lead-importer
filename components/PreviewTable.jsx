"use client";
import React from "react";
import { ListFilter, Database, Columns } from "lucide-react";

export default function PreviewTable({ headers = [], rows = [] }) {
  if (headers.length === 0) return null;

  return (
    <div className="w-full flex flex-col space-y-4 animate-slide-up">
      {/* Stat Row */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 bg-white dark:bg-[var(--bg-surface)] text-[var(--text-secondary)] text-xs px-3.5 py-1.5 rounded-lg font-medium custom-shadow select-none">
          <Database className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>{rows.length} Raw Rows Detected</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-[var(--bg-surface)] text-[var(--text-secondary)] text-xs px-3.5 py-1.5 rounded-lg font-medium custom-shadow select-none">
          <Columns className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>{headers.length} CSV Columns</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--accent-light)] text-[var(--accent)] text-xs px-3.5 py-1.5 rounded-lg font-medium select-none ml-auto">
          <ListFilter className="w-3.5 h-3.5" />
          <span>Showing first 100 rows</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full border-none rounded-xl overflow-hidden bg-white dark:bg-[var(--bg-surface)] custom-shadow">
        <div className="overflow-auto max-h-[480px]">
          <table className="w-full border-collapse border-spacing-0 text-left">
            <thead>
              <tr className="sticky top-0 z-10 select-none bg-[#FAF9F7] dark:bg-[var(--bg-base)] border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap min-w-[140px]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.04)] dark:divide-[rgba(255,255,255,0.04)]">
              {rows.slice(0, 100).map((row, rowIndex) => {
                return (
                  <tr
                    key={rowIndex}
                    className="hover:bg-[#FAF9F7] dark:hover:bg-[var(--bg-base)] transition-colors duration-[180ms] ease-in-out"
                  >
                    {headers.map((header) => {
                      const value = row[header];
                      return (
                        <td
                          key={header}
                          className="px-4 py-3 font-mono text-xs text-[var(--text-primary)] whitespace-nowrap overflow-hidden text-ellipsis max-w-[260px]"
                          title={String(value || "")}
                        >
                          {value !== undefined && value !== null && String(value).trim() !== "" ? (
                            String(value)
                          ) : (
                            <span className="text-[var(--text-muted)] font-sans italic">empty</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {rows.length > 100 && (
        <p className="text-[11px] text-[var(--text-muted)] italic text-right px-1">
          * Showing a subset of the first 100 preview rows. All {rows.length} rows will be processed by the AI pipeline.
        </p>
      )}
    </div>
  );
}
