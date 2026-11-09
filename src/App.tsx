/**
 * NetSpeed Pro - Premium Real-Time Internet Speed Test
 * Real browser-native network benchmarking using Cloudflare Anycast edge infrastructure
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, AlertCircle, RefreshCw } from 'lucide-react';
import { Header } from './components/Header';
import { Speedometer } from './components/Speedometer';
import { MetricCard } from './components/MetricCard';
import { ServerBadge } from './components/ServerBadge';
import { LiveWaveform } from './components/LiveWaveform';
import { QualityBreakdown } from './components/QualityBreakdown';
import { HistoryModal } from './components/HistoryModal';
import { MethodologyModal } from './components/MethodologyModal';
import { AboutFounder } from './components/AboutFounder';
import { RateUs } from './components/RateUs';
import { CloudflareSpeedTestRunner } from './services/speedEngine';
import { LiveProgress, ServerInfo, SpeedMetrics, TestPhase } from './types/speedtest';

const STORAGE_KEY = 'netspeed_pro_history_v1';
const THEME_KEY = 'netspeed_pro_theme';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  });

  // Speed test state
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [peakSpeed, setPeakSpeed] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to test your connection');
  const [samples, setSamples] = useState<number[]>([]);
  const [transferredBytes, setTransferredBytes] = useState<number>(0);

  // Live intermediate and final metrics
  const [ping, setPing] = useState<number | undefined>(undefined);
  const [jitter, setJitter] = useState<number | undefined>(undefined);
  const [downloadSpeed, setDownloadSpeed] = useState<number | undefined>(undefined);
  const [uploadSpeed, setUploadSpeed] = useState<number | undefined>(undefined);
  const [downloadBytes, setDownloadBytes] = useState<number>(0);
  const [uploadBytes, setUploadBytes] = useState<number>(0);

  // Current or last finalized test metrics
  const [lastMetrics, setLastMetrics] = useState<SpeedMetrics | null>(null);
  const [serverInfo, setServerInfo] = useState<ServerInfo>({
    name: 'Cloudflare Edge Anycast',
    colo: 'Auto',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [history, setHistory] = useState<SpeedMetrics[]>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  // SpeedTest runner ref
  const runnerRef = useRef<CloudflareSpeedTestRunner | null>(null);

  // Sync theme changes
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initial server ping to discover closest PoP location quietly on load
  useEffect(() => {
    const detectServer = async () => {
      try {
        const runner = new CloudflareSpeedTestRunner();
        const info = await runner.fetchServerMetadata();
        if (info.colo || info.city) {
          setServerInfo(info);
        }
      } catch {
        // Fallback default info
      }
    };
    detectServer();
  }, []);

  // Handle Starting Real Speed Test via @cloudflare/speedtest engine
  const handleStartTest = useCallback(async () => {
    if (phase !== 'idle' && phase !== 'completed' && phase !== 'error' && phase !== 'aborted') {
      return; // Prevent overlapping tests
    }

    // Reset previous run counters
    setErrorMessage(null);
    setPhase('ping');
    setCurrentSpeed(0);
    setPeakSpeed(0);
    setProgressPercent(2);
    setSamples([]);
    setStatusMessage('Connecting to Cloudflare edge measurement servers...');
    setPing(undefined);
    setJitter(undefined);
    setDownloadSpeed(undefined);
    setUploadSpeed(undefined);
    setDownloadBytes(0);
    setUploadBytes(0);
    setTransferredBytes(0);
    setLastMetrics(null);

    const runner = new CloudflareSpeedTestRunner();
    runnerRef.current = runner;

    try {
      const metrics = await runner.startTest({
        onProgress: (progress: LiveProgress) => {
          setPhase(progress.phase);
          setCurrentSpeed(progress.currentSpeed);
          setPeakSpeed(progress.peakSpeed);
          setProgressPercent(progress.percent);
          setStatusMessage(progress.message);
          setSamples(progress.samples);
          setTransferredBytes(progress.transferredBytes);

          if (progress.ping !== undefined) setPing(progress.ping);
          if (progress.jitter !== undefined) setJitter(progress.jitter);
          if (progress.download !== undefined) setDownloadSpeed(progress.download);
          if (progress.upload !== undefined) setUploadSpeed(progress.upload);

          if (progress.phase === 'download') {
            setDownloadBytes(progress.transferredBytes);
          } else if (progress.phase === 'upload') {
            setUploadBytes(progress.transferredBytes);
          }
        },
      });

      // Test Completed Successfully with real measured data
      setLastMetrics(metrics);
      setServerInfo(metrics.server);
      setPhase('completed');
      setStatusMessage('Cloudflare benchmark completed successfully!');

      // Save to localStorage history
      setHistory((prev) => {
        const updated = [metrics, ...prev].slice(0, 50); // Keep last 50
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error('Storage write error', e);
        }
        return updated;
      });
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('Aborted') || err.message?.includes('cancel')) {
        setPhase('aborted');
        setStatusMessage('Test cancelled by user.');
      } else {
        console.error('Speed test error:', err);
        setPhase('error');
        setErrorMessage(
          err.message ||
            'Cloudflare measurement service was unreachable or interrupted. Please verify your connection.'
        );
        setStatusMessage('Measurement failed: Unable to reach Cloudflare edge.');
      }
    } finally {
      runnerRef.current = null;
    }
  }, [phase]);

  // Handle Stopping Test
  const handleStopTest = useCallback(() => {
    if (runnerRef.current) {
      runnerRef.current.stopTest();
      runnerRef.current = null;
    }
    setPhase('aborted');
    setStatusMessage('Test cancelled by user.');
  }, []);

  // Clear history handler
  const handleClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  const isTesting = phase === 'ping' || phase === 'download' || phase === 'upload';
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isLight ? 'mesh-gradient-light text-slate-900' : 'mesh-gradient-dark text-slate-100'
      }`}
    >
      {/* Top Navigation */}
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 flex flex-col items-center">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 select-none">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Test Your{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Internet Speed
            </span>
          </h1>
          <p
            className={`mt-2 text-sm sm:text-base font-medium ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Discover your real internet performance in seconds.
          </p>
        </div>

        {/* Server & Network Metadata Badge */}
        <div className="mb-6">
          <ServerBadge server={serverInfo} isTesting={isTesting} theme={theme} />
        </div>

        {/* Speedometer Center Stage */}
        <div className="relative w-full flex flex-col items-center justify-center my-2">
          <Speedometer
            phase={phase}
            currentValue={currentSpeed}
            peakValue={peakSpeed}
            percent={progressPercent}
            isTesting={isTesting}
            theme={theme}
          />

          {/* Live Waveform during active download/upload */}
          {isTesting && samples.length > 2 && (
            <div className="w-full max-w-xs animate-fade-in">
              <LiveWaveform samples={samples} phase={phase} theme={theme} />
            </div>
          )}

          {/* Status Message Display */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
            {isTesting && (
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            )}
            <span>{statusMessage}</span>
          </div>

          {/* Primary Action Controls: START / STOP */}
          <div className="mt-6 flex items-center gap-3">
            {!isTesting ? (
              <button
                onClick={handleStartTest}
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm sm:text-base font-bold text-white rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 hover:from-blue-500 hover:via-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 cursor-pointer"
              >
                {phase === 'completed' ? (
                  <RefreshCw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
                <span>{phase === 'completed' ? 'START NEW TEST' : 'START TEST'}</span>
              </button>
            ) : (
              <button
                onClick={handleStopTest}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-rose-300 rounded-2xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 shadow-lg shadow-rose-950/50 transition-all active:scale-95 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>STOP TEST</span>
              </button>
            )}
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mt-4 max-w-md p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Results Metrics Cards (Download, Upload, Ping, Jitter) */}
        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8">
          <MetricCard
            type="download"
            value={downloadSpeed}
            peak={phase === 'completed' && lastMetrics ? lastMetrics.downloadSpeed : peakSpeed}
            transferredBytes={downloadBytes}
            isActive={phase === 'download'}
            isCompleted={phase === 'completed'}
            theme={theme}
          />
          <MetricCard
            type="upload"
            value={uploadSpeed}
            peak={phase === 'completed' && lastMetrics ? lastMetrics.uploadSpeed : peakSpeed}
            transferredBytes={uploadBytes}
            isActive={phase === 'upload'}
            isCompleted={phase === 'completed'}
            theme={theme}
          />
          <MetricCard
            type="ping"
            value={ping}
            isActive={phase === 'ping'}
            isCompleted={phase === 'completed'}
            theme={theme}
          />
          <MetricCard
            type="jitter"
            value={jitter}
            isActive={phase === 'ping'}
            isCompleted={phase === 'completed'}
            theme={theme}
          />
        </div>

        {/* Completed Quality Breakdown, Export & Action Tools */}
        {phase === 'completed' && lastMetrics && (
          <QualityBreakdown
            metrics={lastMetrics}
            onTestAgain={handleStartTest}
            theme={theme}
          />
        )}

        {/* About the Founder Section */}
        <AboutFounder theme={theme} />

        {/* Community Rate Us Section */}
        <RateUs theme={theme} />
      </main>

      {/* Footer */}
      <footer
        className={`w-full border-t py-6 px-4 text-center text-xs transition-colors ${
          isLight
            ? 'border-slate-200 text-slate-500 bg-white/50'
            : 'border-slate-800/80 text-slate-500 bg-slate-950/40'
        }`}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/file_000000000da08211956b25793ecb2d68_0ccaa503.png"
              alt="NetSpeed Pro Logo"
              className="w-5 h-5 object-contain rounded-full"
            />
            <span className="font-bold text-slate-300">NetSpeed Pro</span>
            <span>·</span>
            <span>Accurate Browser-Native Network Benchmarking</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <button
              onClick={() => {
                const el = document.getElementById('rate-us');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-amber-400 transition-colors"
            >
              Rate Us
            </button>
            <span>·</span>
            <button
              onClick={() => {
                const el = document.getElementById('about-founder');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-cyan-400 transition-colors"
            >
              About Founder
            </button>
            <span>·</span>
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Methodology
            </button>
            <span>·</span>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Test History
            </button>
            <span>·</span>
            <span>Powered by Edge CDN Anycast</span>
          </div>
        </div>
      </footer>

      {/* History Modal Drawer */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        theme={theme}
      />

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        theme={theme}
      />
    </div>
  );
}
