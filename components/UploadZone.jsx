"use client";
import React, { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, Trash2, AlertCircle, Download } from "lucide-react";

export default function UploadZone({ onFileSelect, file, onFileRemove }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState("");
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

  const validateAndSelectFile = (selectedFile) => {
    setError("");
    
    // Check file type (must be CSV)
    if (!selectedFile.name.endsWith(".csv") && selectedFile.type !== "text/csv") {
      setError("Please upload a valid CSV file (.csv).");
      onFileSelect(null, "Please upload a valid CSV file (.csv).");
      return;
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (selectedFile.size > maxSize) {
      setError("File exceeds the maximum size limit of 50MB.");
      onFileSelect(null, "File exceeds the maximum size limit of 50MB.");
      return;
    }

    onFileSelect(selectedFile, null);
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const triggerDownloadSample = () => {
    const csvContent = 
      "Name,Email,Mobile,CRM Status,Data Source,CRM Note,Possession Time,Created Date\n" +
      "MR. VIKRAM MALHOTRA,vikram.malhotra@gmail.com,9988776655,GOOD LEAD FOLLOW UP,Facebook,Extremely interested,Q1-2027,13-06-2026\n" +
      "sneha_iyer,sneha.work@techcorp.com,9090909090,SALE DONE,meridian_tower,Payment received,immediate,Jun 14 2026\n" +
      "Dr. Pooja Sharma-Gupta,dr.pooja@gmail.com,9543219876,DID NOT CONNECT,varah_swamy,Doctor keen on villa plots,Ready,2026/06/16\n" +
      "Md. Irfan Khan,irfan.k@khangroup.in,8432109876,BAD LEAD,leads_on_demand,Wants to negotiate price,Dec 2026,17-06-2026";
      
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "groweasy_sample_leads.csv");
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
          className={`w-full min-h-[280px] rounded-2xl flex flex-col items-center justify-center p-8 select-none cursor-pointer transition-all duration-220 relative border-none dot-grid ${
            isDragActive
              ? "bg-[#EBF4FF] dark:bg-[rgba(0,122,255,0.08)] scale-[1.01] custom-shadow-lg"
              : error
              ? "bg-[var(--danger-light)] border border-[var(--danger)]"
              : "bg-white dark:bg-[var(--bg-surface)] custom-shadow hover:custom-shadow-md"
          }`}
        >
          {/* Inner wrapper to disable pointer-events and prevent dragenter/dragleave flicker */}
          <div className="flex flex-col items-center justify-center text-center pointer-events-none">
            {/* Apple blue central icon */}
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-[var(--accent)] bg-[var(--accent-light)] transition-all duration-200">
              <UploadCloud className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight mb-1.5">
              Drop your CSV here
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              or <span className="text-[var(--accent)] font-medium hover:underline">browse files</span> from your local system
            </p>

            <div className="flex items-center gap-2 bg-[var(--bg-elevated)] px-3.5 py-1 rounded-full text-xs font-mono text-[var(--text-secondary)]">
              <span>.csv</span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
              <span>max 50MB</span>
            </div>
          </div>

          {/* Pulse ring when drag active */}
          {isDragActive && (
            <span className="absolute inset-0 rounded-2xl border border-[var(--accent)] opacity-20 animate-pulse pointer-events-none" />
          )}
        </div>
      ) : (
        <div className="w-full bg-white dark:bg-[var(--bg-surface)] rounded-2xl p-6 custom-shadow animate-slide-up border-none">
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
                className="p-2 hover:bg-[var(--danger-light)] hover:text-[var(--danger)] text-[var(--text-secondary)] rounded-xl transition-all cursor-pointer active:scale-95"
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
          className="mt-6 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] font-semibold inline-flex items-center gap-2 bg-white dark:bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] px-4 py-2 rounded-lg transition-all custom-shadow cursor-pointer active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download sample CSV template</span>
        </button>
      )}
    </div>
  );
}
