"use client";
import React, { useState, useEffect } from "react";
import Stepper from "../components/Stepper";
import UploadZone from "../components/UploadZone";
import PreviewTable from "../components/PreviewTable";
import ConfirmBanner from "../components/ConfirmBanner";
import LoadingOverlay from "../components/LoadingOverlay";
import ResultsTable from "../components/ResultsTable";
import Papa from "papaparse";
import { 
  AlertCircle, 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  Cable, 
  RefreshCw, 
  Database,
  Search,
  HelpCircle,
  Menu,
  ChevronRight,
  FolderLock
} from "lucide-react";

const STEPS = ["Upload CSV", "Preview Table", "Confirm Import", "AI Results"];
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  
  // CSV parsed state
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);

  // Import / AI states
  const [isLoading, setIsLoading] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Results
  const [results, setResults] = useState([]);

  // Backend connection status
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [theme, setTheme] = useState("light");

  // Check backend availability and load theme preference
  useEffect(() => {
    let checkTimeout;
    let pollInterval;
    
    const checkHealth = () => {
      // Set a threshold: if no response in 2 seconds, assume the server is waking up
      checkTimeout = setTimeout(() => {
        setIsWakingUp(true);
      }, 2000);

      fetch(`${BACKEND_URL}/api/health`)
        .then((res) => {
          clearTimeout(checkTimeout);
          if (res.ok) {
            setIsBackendConnected(true);
            setIsWakingUp(false);
          } else {
            setIsBackendConnected(false);
          }
        })
        .catch(() => {
          clearTimeout(checkTimeout);
          setIsBackendConnected(false);
          setIsWakingUp(true); // free tier server is asleep or offline
        });
    };

    // Trigger initial wake-up hit
    checkHealth();

    // Poll every 8 seconds to track status or speed up wake-up
    pollInterval = setInterval(checkHealth, 8000);

    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return () => {
      clearTimeout(checkTimeout);
      clearInterval(pollInterval);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleFileSelect = (selectedFile, error) => {
    if (error) {
      setUploadError(error);
      setFile(null);
      return;
    }

    setUploadError("");
    setFile(selectedFile);

    // Parse CSV locally for preview immediately
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        if (!results.meta.fields || results.meta.fields.length === 0) {
          setUploadError("The uploaded CSV has no columns or headers.");
          setFile(null);
          return;
        }
        setHeaders(results.meta.fields);
        setRows(results.data || []);
        setCurrentStep(2); // move to step 2 (Preview)
      },
      error: (err) => {
        console.error("Local parse error:", err);
        setUploadError(`Failed to read CSV: ${err.message}`);
        setFile(null);
      }
    });
  };

  const handleFileRemove = () => {
    setFile(null);
    setUploadError("");
    setHeaders([]);
    setRows([]);
    setResults([]);
    setErrorMsg("");
    setCurrentStep(1);
  };

  const fetchWithRetry = async (url, options, maxRetries = 3) => {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const res = await fetch(url, options);
        if (res.ok) return res;

        const isRetryable = res.status === 429 || res.status >= 500;
        if (isRetryable && attempt < maxRetries - 1) {
          attempt++;
          const delay = 2000 * attempt + Math.random() * 500;
          console.warn(`[API] Attempt ${attempt} failed with status ${res.status}. Retrying...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        return res;
      } catch (err) {
        if (attempt < maxRetries - 1) {
          attempt++;
          const delay = 2000 * attempt + Math.random() * 500;
          console.warn(`[API] Attempt ${attempt} encountered network error: ${err.message}. Retrying...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw err;
        }
      }
    }
  };

  const handleConfirmImport = async () => {
    setIsLoading(true);
    setErrorMsg("");
    setProgress(0);

    const BATCH_SIZE = 20; 
    const total = Math.ceil(rows.length / BATCH_SIZE);
    setTotalBatches(total);
    setCurrentBatch(1);

    const extractedRecords = [];

    try {
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const currentBatchIndex = Math.floor(i / BATCH_SIZE) + 1;
        setCurrentBatch(currentBatchIndex);

        const batchRows = rows.slice(i, i + BATCH_SIZE);

        const response = await fetchWithRetry(`${BACKEND_URL}/api/extract`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            headers,
            rows: batchRows,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server returned error status ${response.status}`);
        }

        const data = await response.json();
        if (data.records && Array.isArray(data.records)) {
          extractedRecords.push(...data.records);
        } else {
          throw new Error("Invalid response format received from backend.");
        }

        setProgress((currentBatchIndex / total) * 100);
      }

      setResults(extractedRecords);
      setCurrentStep(4);
    } catch (err) {
      console.error("AI Import failed:", err);
      setErrorMsg(err.message || "Failed to process import using AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPreview = () => {
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen w-full flex flex-col transition-colors duration-[220ms]">
      {/* Top Navbar */}
      <header className="h-16 px-6 md:px-8 border-b border-[var(--border)] bg-transparent flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2 select-none">
          <span className="font-semibold text-[15px] tracking-tight text-[var(--text-primary)]">
            GrowEasy
          </span>
          <span className="text-[15px] text-[var(--text-muted)] font-normal">
            CSV Importer
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] bg-transparent hover:bg-[#F3F2EF] dark:hover:bg-[var(--bg-elevated)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-180 cursor-pointer active:scale-95"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>

          {/* Status Dot */}
          <div className="flex items-center gap-2 bg-[var(--bg-elevated)] px-3.5 py-1.5 rounded-lg border-none select-none">
            <span className={`w-2 h-2 rounded-full ${
              isBackendConnected 
                ? "bg-[var(--success)] animate-pulse" 
                : isWakingUp 
                ? "bg-[var(--warning)] animate-bounce" 
                : "bg-[var(--danger)]"
            }`} />
            <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              {isBackendConnected 
                ? "API Connected" 
                : isWakingUp 
                ? "Waking Up..." 
                : "API Offline"}
            </span>
          </div>
        </div>
      </header>

      {/* Server waking up warning alert banner */}
      {!isBackendConnected && isWakingUp && (
        <div className="mx-auto w-full max-w-[860px] px-6 mt-6 flex items-center gap-3 bg-[var(--warning-light)] text-[var(--warning)] text-xs font-semibold px-4 py-3 rounded-2xl animate-pulse">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--warning)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--warning)]"></span>
          </span>
          <span>
            <strong>Render Server Waking Up:</strong> The backend is hosted on a free Render tier and is spinning up from sleep. AI processing will be available in about 30 seconds.
          </span>
        </div>
      )}

      {/* Main Centered Content (Max-width 860px) */}
      <main className="flex-1 max-w-[860px] w-full mx-auto px-6 pt-12 pb-24 flex flex-col justify-start">
        
        {/* Stepper Progress Block */}
        <Stepper currentStep={currentStep} steps={STEPS} />

        {/* Error Banner if batch process fails */}
        {errorMsg && (
          <div className="w-full border border-[var(--danger-border)] bg-[var(--danger-light)] rounded-2xl p-4 mb-6 flex items-start gap-3 animate-slide-up">
            <AlertCircle className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
            <div className="flex-1 text-left">
              <h4 className="text-xs font-bold text-[var(--danger)]">
                AI Pipeline Failed
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium">{errorMsg}</p>
              <button
                onClick={handleConfirmImport}
                className="mt-3 text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Retry Processing</span>
              </button>
            </div>
          </div>
        )}

        {/* Stepper Panels Layout container */}
        <div className="w-full flex-1 flex flex-col justify-start mt-6">
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <UploadZone
              file={file}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              error={uploadError}
            />
          )}

          {/* Step 2: Preview Table */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <PreviewTable headers={headers} rows={rows} />
              <div className="flex justify-end gap-3 select-none">
                <button
                  type="button"
                  onClick={handleFileRemove}
                  className="px-4 py-2 border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent hover:bg-[#F3F2EF] dark:hover:bg-[var(--bg-elevated)] transition-all duration-180 cursor-pointer active:scale-95"
                >
                  Clear CSV File
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[#0066DD] transition-all duration-180 cursor-pointer shadow-[0_1px_3px_rgba(0,122,255,0.3)] hover:shadow-[0_2px_6px_rgba(0,122,255,0.4)] active:scale-95"
                >
                  Proceed to Import
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm Import */}
          {currentStep === 3 && (
            <div className="relative space-y-6">
              {isLoading && (
                <LoadingOverlay
                  currentBatch={currentBatch}
                  totalBatches={totalBatches}
                  progress={progress}
                />
              )}
              <div className={`${isLoading ? "opacity-30 pointer-events-none" : ""} space-y-6 transition-opacity duration-150`}>
                <ConfirmBanner
                  recordCount={rows.length}
                  onConfirm={handleConfirmImport}
                  onBack={handleBackToPreview}
                  isLoading={isLoading}
                />
                <PreviewTable headers={headers} rows={rows} />
              </div>
            </div>
          )}

          {/* Step 4: Results Display */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <ResultsTable records={results} />
              <div className="pt-2 flex justify-start select-none">
                <button
                  type="button"
                  onClick={handleFileRemove}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)] rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent hover:bg-[#F3F2EF] dark:hover:bg-[var(--bg-elevated)] transition-all duration-180 cursor-pointer active:scale-95"
                >
                  Import Another File
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
