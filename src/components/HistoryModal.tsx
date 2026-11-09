import React, { useState } from 'react';
import { X, Trash2, Download, ArrowDown, ArrowUp, Activity, Clock, ShieldAlert } from 'lucide-react';
import { SpeedMetrics } from '../types/speedtest';
import { formatDate, formatMbps, formatMs, downloadJsonFile } from '../utils/formatters';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SpeedMetrics[];
  onClearHistory: () => void;
  theme: 'dark' | 'light';
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  theme,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const isLight = theme === 'light';

  if (!isOpen) return null;

  // Compute averages
  const avgDownload =
    history.length > 0
      ? history.reduce((sum, h) => sum + h.downloadSpeed, 0) / history.length
      : 0;
  const avgUpload =
    history.length > 0
      ? history.reduce((sum, h) => sum + h.uploadSpeed, 0) / history.length
      : 0;
  const avgPing =
    history.length > 0
      ? history.reduce((sum, h) => sum + h.ping, 0) / history.length
      : 0;

  const handleExportAll = () => {
    downloadJsonFile(`netspeed-pro-history-${Date.now()}.json`, history);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#0b1021] border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Test History ({history.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Locally stored benchmarking runs on this device
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {history.length > 0 && (
            <>
              {/* Summary Average Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Avg Download
                  </span>
                  <span className="text-base font-extrabold text-cyan-400 font-mono">
                    {formatMbps(avgDownload)} Mbps
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Avg Upload
                  </span>
                  <span className="text-base font-extrabold text-purple-400 font-mono">
                    {formatMbps(avgUpload)} Mbps
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Avg Latency
                  </span>
                  <span className="text-base font-extrabold text-sky-400 font-mono">
                    {formatMs(avgPing)} ms
                  </span>
                </div>
              </div>

              {/* History Items List */}
              <div className="space-y-2 mt-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">
                          {formatDate(item.timestamp)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.server.colo || item.server.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Quality: <span className="capitalize text-slate-300">{item.qualityRating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 font-mono">
                      <div className="flex items-center gap-1 text-cyan-400">
                        <ArrowDown className="w-3.5 h-3.5" />
                        <span className="font-bold">{formatMbps(item.downloadSpeed)}</span>
                        <span className="text-[10px] text-slate-500">M</span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-400">
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span className="font-bold">{formatMbps(item.uploadSpeed)}</span>
                        <span className="text-[10px] text-slate-500">M</span>
                      </div>
                      <div className="flex items-center gap-1 text-sky-400">
                        <Activity className="w-3.5 h-3.5" />
                        <span className="font-bold">{formatMs(item.ping)}</span>
                        <span className="text-[10px] text-slate-500">ms</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {history.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <Clock className="w-10 h-10 mx-auto text-slate-700 mb-2" />
              <p className="text-sm font-medium">No past tests recorded yet.</p>
              <p className="text-xs text-slate-600 mt-1">
                Run your first benchmark to record connection logs here.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          {history.length > 0 ? (
            confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Delete all runs?
                </span>
                <button
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleExportAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export JSON</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
