"use client";
import React from "react";
import { ListFilter, Database, Columns } from "lucide-react";

export default function PreviewTable({ headers = [], rows = [] }) {
  if (headers.length === 0) return null;

  return (
    <div className="w-full flex flex-col space-y-4 animate-slide-up">
      {/* Stat Row */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] text-xs px-3 py-1.5 rounded-full font-bold custom-shadow select-none">
          <Database className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>{rows.length} Raw Rows Detected</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] text-xs px-3 py-1.5 rounded-full font-bold custom-shadow select-none">
          <Columns className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>{headers.length} CSV Columns</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--accent-light)] text-[var(--accent)] text-xs px-3 py-1.5 rounded-full font-bold select-none ml-auto">
          <ListFilter className="w-3.5 h-3.5" />
          <span>Showing first 100 rows</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full border border-[var(--border)] rounded-2xl overflow-hidden bg-white dark:bg-[var(--bg-surface)] custom-shadow">
        <div className="overflow-auto max-h-[400px]">
          <table className="w-full border-collapse border-spacing-0 text-left">
            <thead>
              <tr className="sticky top-0 z-10 select-none border-b border-[var(--border)] bg-[var(--bg-elevated)]/80 backdrop-blur">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-[10px] font-bold tracking-wider text-[var(--text-secondary)] uppercase font-sans whitespace-nowrap min-w-[140px]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.slice(0, 100).map((row, rowIndex) => {
                return (
                  <tr
                    key={rowIndex}
                    className="hover:bg-[var(--bg-elevated)]/50 transition-colors duration-150"
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
                            <span className="text-[var(--text-tertiary)] font-sans italic">empty</span>
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
        <p className="text-[11px] text-[var(--text-tertiary)] italic text-right px-1">
          * Showing a subset of the first 100 preview rows. All {rows.length} rows will be processed by the AI pipeline.
        </p>
      )}
    </div>
  );
}
