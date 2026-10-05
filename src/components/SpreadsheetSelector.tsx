import React, { useState } from 'react';
import {
  FileSpreadsheet,
  PlusCircle,
  Link2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';

interface SpreadsheetSelectorProps {
  isOpen: boolean;
  currentSpreadsheetId: string | null;
  currentTitle: string;
  onClose: () => void;
  onCreateNewSheet: (title: string) => Promise<void>;
  onConnectExistingSheet: (idOrUrl: string) => Promise<void>;
}

export const SpreadsheetSelector: React.FC<SpreadsheetSelectorProps> = ({
  isOpen,
  currentSpreadsheetId,
  currentTitle,
  onClose,
  onCreateNewSheet,
  onConnectExistingSheet,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'connect'>('create');
  const [newTitle, setNewTitle] = useState('StockFlow Inventory Master');
  const [sheetInput, setSheetInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError('Please provide a title for the new Google Sheet.');
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      await onCreateNewSheet(newTitle.trim());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create spreadsheet');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetInput.trim()) {
      setError('Please enter a Google Spreadsheet ID or URL.');
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      // Extract spreadsheet ID from URL if full URL is pasted
      let extractedId = sheetInput.trim();
      const match = extractedId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        extractedId = match[1];
      }

      await onConnectExistingSheet(extractedId);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect spreadsheet');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Google Sheets Database
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose the Google Sheet that stores your live inventory
              </p>
            </div>
          </div>
          {currentSpreadsheetId && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Current Active Sheet Info */}
        {currentSpreadsheetId && (
          <div className="px-5 py-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate block">
                  {currentTitle || 'Connected Spreadsheet'}
                </span>
                <span className="text-[11px] font-mono text-zinc-400 truncate block">
                  ID: {currentSpreadsheetId}
                </span>
              </div>
            </div>
            <a
              href={`https://docs.google.com/spreadsheets/d/${currentSpreadsheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 shrink-0 px-2.5 py-1 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition"
            >
              <span>Open in Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Tab Selection */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('create');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'create'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Create New Sheet
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('connect');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'connect'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Link2 className="w-4 h-4 text-blue-600" />
              Connect Existing
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Spreadsheet Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Warehouse Inventory Master 2026"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  What will be automatically configured:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-zinc-500 pl-1">
                  <li>
                    <strong>Inventory</strong> tab with SKU, Stock Qty, Price, Thresholds & Status
                  </li>
                  <li>
                    <strong>Stock Movements</strong> tab for real-time audit logs & transactions
                  </li>
                  <li>Pre-formatted dark header styling and frozen header rows</li>
                  <li>Sample initial items ready for real-time operations</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {currentSpreadsheetId && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing && (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  <span>Create & Connect Google Sheet</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Google Sheet URL or Spreadsheet ID
                </label>
                <input
                  type="text"
                  value={sheetInput}
                  onChange={(e) => setSheetInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5n... or ID"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
                Ensure the Google Sheet is accessible by your logged-in Google Account and contains
                columns matching Item ID, SKU, Name, Category, Quantity, Min Threshold, Price, etc.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {currentSpreadsheetId && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing && (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  <span>Connect Spreadsheet</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
