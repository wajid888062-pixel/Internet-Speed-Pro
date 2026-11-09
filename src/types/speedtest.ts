export type TestPhase = 
  | 'idle' 
  | 'ping' 
  | 'download' 
  | 'upload' 
  | 'completed' 
  | 'error' 
  | 'aborted';

export interface ServerInfo {
  name: string;
  colo?: string;
  city?: string;
  country?: string;
  ip?: string;
  asn?: string;
  isp?: string;
  latitude?: number;
  longitude?: number;
}

export interface SpeedMetrics {
  id: string;
  timestamp: number;
  downloadSpeed: number; // in Mbps
  uploadSpeed: number;   // in Mbps
  ping: number;          // in ms
  jitter: number;        // in ms
  downloadTransferredBytes: number;
  uploadTransferredBytes: number;
  testDurationMs: number;
  server: ServerInfo;
  qualityRating: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface LiveProgress {
  phase: TestPhase;
  currentSpeed: number;   // Instantaneous speed (Mbps for down/up, ms for ping)
  peakSpeed: number;
  percent: number;        // 0 - 100
  ping?: number;
  jitter?: number;
  download?: number;
  upload?: number;
  transferredBytes: number;
  samples: number[];      // Recent speed samples for waveform
  message: string;
}

export interface ActivityQuality {
  name: string;
  rating: 'superb' | 'good' | 'fair' | 'poor';
  description: string;
  iconName: string;
}
