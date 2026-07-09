"use client";
import React, { useState, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import { CheckCircle2, AlertTriangle, FileDown, Layers, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 20;

export default function ResultsTable({ records = [] }) {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "imported" | "skipped"
  const [currentPage, setCurrentPage] = useState(1);

  const importedRecords = records.filter((r) => r.status === "imported");
  const skippedRecords = records.filter((r) => r.status === "skipped");
  const totalCount = records.length;

  const filteredRecords = 
    activeTab === "imported" 
      ? importedRecords 
      : activeTab === "skipped" 
      ? skippedRecords 
      : records;

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE) || 1;
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getFullLocation = (rec) => {
    const parts = [rec.city, rec.state, rec.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  const getContactNumber = (rec) => {
    if (!rec.mobile_without_country_code) return "-";
    const cc = rec.country_code ? rec.country_code : "";
    return `${cc} ${rec.mobile_without_country_code}`.trim();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `groweasy_mapped_leads_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <div className="w-full flex flex-col space-y-6 animate-slide-up">
      {/* Visual Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Card */}
        <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl p-5 flex items-center justify-between custom-shadow-lg border-none">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Processed Records</span>
            <span className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{totalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Mapped Card */}
        <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl p-5 flex items-center justify-between custom-shadow-lg border-none">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Successfully Mapped</span>
            <span className="text-2xl font-semibold text-[var(--success)] mt-1">{importedRecords.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--success-light)] text-[var(--success)] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Skipped Card */}
        <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl p-5 flex items-center justify-between custom-shadow-lg border-none">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Skipped / Bypassed</span>
            <span className="text-2xl font-semibold text-[var(--danger)] mt-1">{skippedRecords.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--danger-light)] text-[var(--danger)] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table Control Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border)] pb-4">
        {/* Navigation Tabs */}
        <div className="flex bg-[var(--bg-elevated)] p-1 rounded-xl self-start select-none">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white dark:bg-[var(--bg-surface)] text-[var(--text-primary)] custom-shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            All Processed ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab("imported")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "imported"
                ? "bg-white dark:bg-[var(--bg-surface)] text-[var(--success)] custom-shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Imported ({importedRecords.length})
          </button>
          <button
            onClick={() => setActiveTab("skipped")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "skipped"
                ? "bg-white dark:bg-[var(--bg-surface)] text-[var(--danger)] custom-shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Skipped ({skippedRecords.length})
          </button>
        </div>

        {/* Download Button (Ghost style) */}
        <button
          onClick={handleDownloadJSON}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-transparent hover:bg-[#F3F2EF] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] rounded-lg custom-shadow-sm transition-all duration-180 cursor-pointer active:scale-95"
        >
          <FileDown className="w-4 h-4" />
          <span>Export Mapped Leads (JSON)</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="w-full border-none rounded-xl overflow-hidden bg-white dark:bg-[var(--bg-surface)] custom-shadow">
        <div className="overflow-auto max-h-[480px]">
          <table className="w-full border-collapse border-spacing-0 text-left">
            <thead>
              <tr className="sticky top-0 z-10 select-none bg-[#FAF9F7] dark:bg-[var(--bg-base)] border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap w-[100px]">
                  Import Status
                </th>
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap min-w-[140px]">
                  Lead Name
                </th>
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap min-w-[170px]">
                  Email
                </th>
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap min-w-[140px]">
                  Contact
                </th>
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap min-w-[150px]">
                  CRM Status
                </th>
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap min-w-[140px]">
                  Company
                </th>
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap min-w-[140px]">
                  Location
                </th>
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap min-w-[140px]">
                  Date Created
                </th>
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap min-w-[130px]">
                  Data Source
                </th>
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap min-w-[200px]">
                  CRM Note / Skip Reason
                </th>
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap min-w-[200px]">
                  Description
                </th>
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap min-w-[140px]">
                  Lead Owner
                </th>
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase font-sans whitespace-nowrap min-w-[130px]">
                  Possession
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.04)] dark:divide-[rgba(255,255,255,0.04)]">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-12 text-sm text-[var(--text-secondary)]">
                    No leads found in this view.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((recWrapper, index) => {
                  const isSkipped = recWrapper.status === "skipped";
                  const rec = recWrapper.mapped_record || {};
                  
                  return (
                    <tr
                      key={index}
                      className={`transition-colors duration-[180ms] ease-in-out ${
                        isSkipped 
                          ? "bg-[var(--danger-light)] hover:bg-[var(--danger-light)]/80" 
                          : "hover:bg-[#FAF9F7] dark:hover:bg-[var(--bg-base)]"
                      }`}
                    >
                      {/* Status badge column */}
                      <td className="px-4 py-3 whitespace-nowrap align-middle">
                        {isSkipped ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase font-sans bg-[var(--danger-light)] text-[var(--danger)]">
                            Skipped
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase font-sans bg-[var(--success-light)] text-[var(--success)]">
                            Imported
                          </span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3 font-sans text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap align-middle">
                        {rec.name || (isSkipped ? "-" : <span className="text-[var(--text-muted)] italic">Unnamed</span>)}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 font-mono text-xs align-middle">
                        {rec.email ? (
                          <span className="text-[var(--accent)] hover:underline cursor-pointer font-medium">
                            {rec.email}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] italic">-</span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-primary)] whitespace-nowrap align-middle">
                        {getContactNumber(rec)}
                      </td>

                      {/* CRM Status */}
                      <td className="px-4 py-3 whitespace-nowrap align-middle">
                        {!isSkipped ? <StatusBadge status={rec.crm_status} /> : "-"}
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3 font-sans text-xs text-[var(--text-primary)] whitespace-nowrap align-middle font-semibold">
                        {rec.company || "-"}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 font-sans text-xs text-[var(--text-primary)] whitespace-nowrap align-middle">
                        {getFullLocation(rec)}
                      </td>

                      {/* Date Created */}
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap align-middle">
                        {rec.created_at || "-"}
                      </td>

                      {/* Data Source */}
                      <td className="px-4 py-3 font-sans text-xs text-[var(--text-primary)] whitespace-nowrap align-middle">
                        {rec.data_source ? (
                          <span className="px-2 py-0.5 rounded bg-[var(--bg-elevated)] font-mono text-[10px] text-[var(--text-secondary)] font-semibold">
                            {rec.data_source}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* CRM Note / Skip Reason */}
                      <td className="px-4 py-3 font-sans text-xs text-[var(--text-primary)] max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap align-middle" title={isSkipped ? recWrapper.skip_reason : rec.crm_note}>
                        {isSkipped ? (
                          <span className="text-[var(--danger)] font-bold">
                            {recWrapper.skip_reason || "Missing contact info"}
                          </span>
                        ) : (
                          rec.crm_note || "-"
                        )}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 font-sans text-xs text-[var(--text-primary)] max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap align-middle" title={rec.description}>
                        {rec.description || "-"}
                      </td>

                      {/* Lead Owner */}
                      <td className="px-4 py-3 font-sans text-xs text-[var(--text-primary)] whitespace-nowrap align-middle">
                        {rec.lead_owner || "-"}
                      </td>

                      {/* Possession */}
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-primary)] whitespace-nowrap align-middle">
                        {rec.possession_time || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Controls */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-elevated)]/40 flex items-center justify-between select-none">
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Showing page <span className="font-bold text-[var(--text-primary)]">{currentPage}</span> of <span className="font-bold text-[var(--text-primary)]">{totalPages}</span> ({filteredRecords.length} leads filtered)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] bg-transparent hover:bg-[#F3F2EF] dark:hover:bg-[var(--bg-elevated)] rounded-lg text-[var(--text-secondary)] disabled:opacity-40 transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] bg-transparent hover:bg-[#F3F2EF] dark:hover:bg-[var(--bg-elevated)] rounded-lg text-[var(--text-secondary)] disabled:opacity-40 transition-all cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
