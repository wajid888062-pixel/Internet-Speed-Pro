import SpeedTest, { Results } from '@cloudflare/speedtest';
import { LiveProgress, ServerInfo, SpeedMetrics, TestPhase } from '../types/speedtest';
import { calculateQualityRating } from '../utils/qualityRating';

export interface CloudflareTestCallbacks {
  onProgress: (progress: LiveProgress) => void;
  onFinish?: (metrics: SpeedMetrics) => void;
  onError?: (errorMessage: string) => void;
}

export class CloudflareSpeedTestRunner {
  private engine: SpeedTest | null = null;
  private isCancelled = false;
  private serverInfo: ServerInfo = {
    name: 'Cloudflare Anycast CDN',
    colo: 'Auto',
  };

  /**
   * Fetch initial server location and client IP metadata from Cloudflare headers
   */
  public async fetchServerMetadata(): Promise<ServerInfo> {
    try {
      const res = await fetch('https://speed.cloudflare.com/__down?bytes=0', {
        cache: 'no-store',
      });
      const colo = res.headers.get('cf-meta-colo') || undefined;
      const city = res.headers.get('city') || undefined;
      const country = res.headers.get('country') || undefined;
      const ip = res.headers.get('cf-meta-ip') || undefined;
      const asn = res.headers.get('asn') || undefined;

      this.serverInfo = {
        name: colo ? `Cloudflare Edge (${colo})` : 'Cloudflare Anycast Network',
        colo,
        city,
        country,
        ip,
        asn: asn ? `AS${asn}` : undefined,
      };
    } catch {
      // Fallback
    }
    return this.serverInfo;
  }

  /**
   * Run real speed test using official @cloudflare/speedtest engine
   */
  public startTest({ onProgress, onFinish, onError }: CloudflareTestCallbacks): Promise<SpeedMetrics> {
    this.isCancelled = false;

    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      let currentPhase: TestPhase = 'ping';
      let peakSpeedMbps = 0;
      const samples: number[] = [];

      // Configure official Cloudflare SpeedTest measurement steps
      // Carefully tuned for high accuracy while finishing within responsive time window
      const engine = new SpeedTest({
        autoStart: false,
        measureDownloadLoadedLatency: true,
        measureUploadLoadedLatency: true,
        bandwidthFinishRequestDuration: 1200,
        measurements: [
          { type: 'latency', numPackets: 12 },
          { type: 'download', bytes: 2.5e5, count: 2, bypassMinDuration: true }, // 250KB warmup
          { type: 'download', bytes: 1e6, count: 4 }, // 1MB
          { type: 'download', bytes: 5e6, count: 4 }, // 5MB
          { type: 'download', bytes: 1e7, count: 4 }, // 10MB
          { type: 'download', bytes: 2.5e7, count: 3 }, // 25MB
          { type: 'upload', bytes: 2.5e5, count: 2, bypassMinDuration: true }, // 250KB warmup
          { type: 'upload', bytes: 1e6, count: 4 }, // 1MB
          { type: 'upload', bytes: 5e6, count: 4 }, // 5MB
          { type: 'upload', bytes: 1e7, count: 3 }, // 10MB
        ],
      });

      this.engine = engine;

      // Handle phase changes (latency -> download -> upload)
      engine.onPhaseChange = (payload) => {
        if (this.isCancelled) return;
        const type = payload.measurement.type;

        if (type === 'latency') {
          currentPhase = 'ping';
          onProgress({
            phase: 'ping',
            currentSpeed: 0,
            peakSpeed: 0,
            percent: 5,
            transferredBytes: 0,
            samples: [],
            message: 'Measuring unloaded latency and jitter to nearest edge...',
          });
        } else if (type === 'download') {
          currentPhase = 'download';
          const currentLatency = engine.results.getUnloadedLatency();
          const currentJitter = engine.results.getUnloadedJitter();
          onProgress({
            phase: 'download',
            currentSpeed: 0,
            peakSpeed: peakSpeedMbps,
            percent: 25,
            ping: currentLatency,
            jitter: currentJitter ?? undefined,
            transferredBytes: this.calculateTotalTransferredBytes(engine.results),
            samples: [...samples],
            message: 'Measuring real download throughput from Cloudflare edge...',
          });
        } else if (type === 'upload') {
          currentPhase = 'upload';
          const currentDownloadBps = engine.results.getDownloadBandwidth();
          const downloadMbps = currentDownloadBps ? currentDownloadBps / 1e6 : undefined;
          onProgress({
            phase: 'upload',
            currentSpeed: 0,
            peakSpeed: peakSpeedMbps,
            percent: 65,
            ping: engine.results.getUnloadedLatency(),
            jitter: engine.results.getUnloadedJitter() ?? undefined,
            download: downloadMbps,
            transferredBytes: this.calculateTotalTransferredBytes(engine.results),
            samples: [...samples],
            message: 'Measuring real upload throughput to Cloudflare edge...',
          });
        }
      };

      // Handle live measurement result updates
      engine.onResultsChange = () => {
        if (this.isCancelled) return;
        const res = engine.results;

        const unloadedLatency = res.getUnloadedLatency();
        const unloadedJitter = res.getUnloadedJitter();
        const downloadBandwidthBps = res.getDownloadBandwidth();
        const uploadBandwidthBps = res.getUploadBandwidth();

        const downloadMbps = downloadBandwidthBps ? downloadBandwidthBps / 1e6 : undefined;
        const uploadMbps = uploadBandwidthBps ? uploadBandwidthBps / 1e6 : undefined;

        const downloadPoints = res.getDownloadBandwidthPoints();
        const uploadPoints = res.getUploadBandwidthPoints();
        const latencyPoints = res.getUnloadedLatencyPoints();

        let currentInstantSpeed = 0;
        let progressPercent = 10;

        if (currentPhase === 'ping') {
          if (latencyPoints.length > 0) {
            currentInstantSpeed = latencyPoints[latencyPoints.length - 1];
            progressPercent = Math.min(20, Math.round(5 + (latencyPoints.length / 12) * 15));
          }
        } else if (currentPhase === 'download') {
          if (downloadPoints.length > 0) {
            const latest = downloadPoints[downloadPoints.length - 1];
            currentInstantSpeed = latest.bps / 1e6;
            if (currentInstantSpeed > peakSpeedMbps) {
              peakSpeedMbps = currentInstantSpeed;
            }
            samples.push(Number(currentInstantSpeed.toFixed(1)));
            if (samples.length > 35) samples.shift();
          }
          // Download phase spans 25% -> 65%
          const downRatio = Math.min(downloadPoints.length / 17, 1);
          progressPercent = Math.round(25 + downRatio * 40);
        } else if (currentPhase === 'upload') {
          if (uploadPoints.length > 0) {
            const latest = uploadPoints[uploadPoints.length - 1];
            currentInstantSpeed = latest.bps / 1e6;
            if (currentInstantSpeed > peakSpeedMbps) {
              peakSpeedMbps = currentInstantSpeed;
            }
            samples.push(Number(currentInstantSpeed.toFixed(1)));
            if (samples.length > 35) samples.shift();
          }
          // Upload phase spans 65% -> 98%
          const upRatio = Math.min(uploadPoints.length / 13, 1);
          progressPercent = Math.round(65 + upRatio * 33);
        }

        const totalTransferredBytes = this.calculateTotalTransferredBytes(res);

        onProgress({
          phase: currentPhase,
          currentSpeed: currentInstantSpeed,
          peakSpeed: peakSpeedMbps,
          percent: progressPercent,
          ping: unloadedLatency,
          jitter: unloadedJitter ?? undefined,
          download: downloadMbps,
          upload: uploadMbps,
          transferredBytes: totalTransferredBytes,
          samples: [...samples],
          message:
            currentPhase === 'ping'
              ? `Testing latency: ${currentInstantSpeed ? currentInstantSpeed.toFixed(1) + ' ms' : 'connecting...'}`
              : currentPhase === 'download'
              ? `Downloading: ${(downloadMbps ?? currentInstantSpeed).toFixed(1)} Mbps`
              : `Uploading: ${(uploadMbps ?? currentInstantSpeed).toFixed(1)} Mbps`,
        });
      };

      // Handle test completion
      engine.onFinish = (results: Results) => {
        if (this.isCancelled) return;
        const summary = results.getSummary();
        const totalDuration = results.getTotalDurationMs() ?? (performance.now() - startTime);

        const rawDownloadBps = results.getDownloadBandwidth() ?? summary.download;
        const rawUploadBps = results.getUploadBandwidth() ?? summary.upload;
        const rawLatency = results.getUnloadedLatency() ?? summary.latency;
        const rawJitter = results.getUnloadedJitter() ?? summary.jitter ?? 0;

        // If no download or latency was measured, this was not a successful test
        if (!rawDownloadBps && !rawLatency) {
          const err = new Error('No speed test measurements could be collected from Cloudflare edge.');
          if (onError) onError(err.message);
          reject(err);
          return;
        }

        const finalDownloadMbps = rawDownloadBps ? Number((rawDownloadBps / 1e6).toFixed(2)) : 0;
        const finalUploadMbps = rawUploadBps ? Number((rawUploadBps / 1e6).toFixed(2)) : 0;
        const finalPing = rawLatency ? Number(rawLatency.toFixed(1)) : 0;
        const finalJitter = Number(rawJitter.toFixed(1));

        const downloadPoints = results.getDownloadBandwidthPoints();
        const uploadPoints = results.getUploadBandwidthPoints();

        const downloadBytes = downloadPoints.reduce((acc, p) => acc + (p.transferSize || p.bytes), 0);
        const uploadBytes = uploadPoints.reduce((acc, p) => acc + (p.transferSize || p.bytes), 0);

        const qualityRating = calculateQualityRating(
          finalDownloadMbps,
          finalUploadMbps,
          finalPing,
          finalJitter
        );

        const finalMetrics: SpeedMetrics = {
          id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          timestamp: Date.now(),
          downloadSpeed: finalDownloadMbps,
          uploadSpeed: finalUploadMbps,
          ping: finalPing,
          jitter: finalJitter,
          downloadTransferredBytes: downloadBytes,
          uploadTransferredBytes: uploadBytes,
          testDurationMs: Math.round(totalDuration),
          server: this.serverInfo,
          qualityRating,
        };

        onProgress({
          phase: 'completed',
          currentSpeed: finalDownloadMbps,
          peakSpeed: peakSpeedMbps,
          percent: 100,
          ping: finalPing,
          jitter: finalJitter,
          download: finalDownloadMbps,
          upload: finalUploadMbps,
          transferredBytes: downloadBytes + uploadBytes,
          samples: [...samples],
          message: 'Benchmark completed successfully using Cloudflare engine!',
        });

        if (onFinish) onFinish(finalMetrics);
        resolve(finalMetrics);
      };

      // Handle measurement errors
      engine.onError = (errorMessage: string, status?: number) => {
        if (this.isCancelled) return;
        const msg = status
          ? `Cloudflare measurement error (HTTP ${status}): ${errorMessage}`
          : `Network measurement error: ${errorMessage}`;
        console.error(msg);

        // If engine was already running and finished partially or completely failed
        if (!engine.results.getDownloadBandwidth() && !engine.results.getUnloadedLatency()) {
          engine.pause();
          if (onError) onError(msg);
          reject(new Error(msg));
        }
      };

      // Launch the test engine
      engine.play();
    });
  }

  /**
   * Pause/Stop active measurements
   */
  public stopTest(): void {
    this.isCancelled = true;
    if (this.engine) {
      this.engine.pause();
      this.engine = null;
    }
  }

  /**
   * Sum transferSize across download and upload measurement points
   */
  private calculateTotalTransferredBytes(results: Results): number {
    const downPoints = results.getDownloadBandwidthPoints();
    const upPoints = results.getUploadBandwidthPoints();
    const downBytes = downPoints.reduce((acc, p) => acc + (p.transferSize || p.bytes || 0), 0);
    const upBytes = upPoints.reduce((acc, p) => acc + (p.transferSize || p.bytes || 0), 0);
    return downBytes + upBytes;
  }
}
