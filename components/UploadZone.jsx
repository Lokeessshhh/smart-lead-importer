"use client";
import React, { useRef, useState } from "react";
import { UploadCloud, AlertCircle, FileSpreadsheet, Trash2, Download } from "lucide-react";

/**
 * Format bytes to readable size string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function UploadZone({ file, onFileSelect, onFileRemove, error }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndSelectFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv") && selectedFile.type !== "text/csv") {
      onFileSelect(null, "Invalid file type. Only CSV files are allowed.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      onFileSelect(null, "File size exceeds 50MB limit.");
      return;
    }

    onFileSelect(selectedFile, "");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const triggerDownloadSample = () => {
    const csvContent = 
      "created_at,name,email,country_code,mobile_without_country_code,company,city,state,country,lead_owner,crm_status,crm_note,data_source,possession_time,description\n" +
      "2026-05-13 14:20:48,John Doe,john.doe@example.com,+91,9876543210,GrowEasy,Mumbai,Maharashtra,India,test@gmail.com,GOOD_LEAD_FOLLOW_UP,Client is asking to reschedule demo,leads_on_demand,Ready Now,Budget approved\n" +
      "2026-05-13 14:25:30,Sarah Johnson,sarah.johnson@example.com,+91,9876543211,Tech Solutions,Bangalore,Karnataka,India,test@gmail.com,DID_NOT_CONNECT,Person was busy,meridian_tower,Ready Now,\n" +
      "2026-05-13 14:30:15,Rajesh Patel,rajesh.patel@example.com,+91,9876543212,Startup Inc,Delhi,Delhi,India,test@gmail.com,BAD_LEAD,Not interested in our services,,2 years,\n" +
      "2026-05-13 14:35:22,Priya Singh,priya.singh@example.com,+91,9876543213,Enterprise Corp,Pune,Maharashtra,India,test@gmail.com,SALE_DONE,Deal closed,eden_park,,Senior VP signed off\n" +
      "2026-05-13 14:40:00,Invalid Row,no-email-or-phone,,,,,,,,,,,\n";
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "groweasy_crm_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col items-center animate-slide-up">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv"
        onChange={handleFileChange}
      />

      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`w-full min-h-[300px] rounded-2xl flex flex-col items-center justify-center p-8 select-none cursor-pointer transition-all duration-300 relative border-2 ${
            isDragActive
              ? "bg-[var(--accent-light)] border-[var(--accent)] scale-[1.01]"
              : error
              ? "bg-[var(--danger-light)] border-[var(--danger)]"
              : "bg-white/60 dark:bg-[var(--bg-surface)]/60 hover:bg-white/80 dark:hover:bg-[var(--bg-surface)]/80 border-dashed border-[var(--border-hover)] custom-shadow hover:custom-shadow-lg"
          }`}
        >
          {/* Inner wrapper to disable pointer-events and prevent dragenter/dragleave flicker */}
          <div className="flex flex-col items-center justify-center text-center pointer-events-none">
            {/* Glowing central icon */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
              isDragActive 
                ? "bg-[var(--accent)] text-white scale-110" 
                : "bg-[var(--accent-light)] text-[var(--accent)]"
            }`}>
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mb-2">
              Drag & drop your CSV file here
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6 text-center max-w-sm">
              or <span className="text-[var(--accent)] font-semibold underline">browse files</span> from your local system
            </p>

            <div className="flex items-center gap-3 bg-[var(--bg-elevated)] border border-[var(--border)] px-4 py-1.5 rounded-full text-xs font-mono text-[var(--text-secondary)]">
              <span>CSV files only</span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
              <span>Max size 50MB</span>
            </div>
          </div>

          {/* Pulse ring when drag active */}
          {isDragActive && (
            <span className="absolute inset-0 rounded-2xl border-2 border-[var(--accent)] opacity-40 animate-pulse pointer-events-none" />
          )}
        </div>
      ) : (
        <div className="w-full bg-white dark:bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 custom-shadow animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900/35">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[280px] md:max-w-md">
                  {file.name}
                </span>
                <span className="text-xs text-[var(--text-secondary)] font-mono">
                  {formatBytes(file.size)} · CSV File
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-900/40">
                Ready
              </span>
              <button
                type="button"
                onClick={onFileRemove}
                className="p-2 hover:bg-[var(--danger-light)] hover:text-[var(--danger)] text-[var(--text-secondary)] rounded-xl border border-transparent hover:border-[var(--danger-border)] transition-all cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-[var(--danger)] bg-[var(--danger-light)] border border-[var(--danger-border)] px-4 py-2 rounded-xl w-full">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!file && (
        <button
          type="button"
          onClick={triggerDownloadSample}
          className="mt-6 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] font-semibold inline-flex items-center gap-2 bg-white/60 dark:bg-[var(--bg-surface)]/60 hover:bg-white dark:hover:bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 rounded-full transition-all custom-shadow cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download sample CSV template</span>
        </button>
      )}
    </div>
  );
}
