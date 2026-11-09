import { ActivityQuality } from '../types/speedtest';

export function calculateQualityRating(
  downloadMbps: number,
  uploadMbps: number,
  pingMs: number,
  jitterMs: number
): 'excellent' | 'good' | 'fair' | 'poor' {
  // Comprehensive score factoring ping, jitter, and bandwidth
  if (downloadMbps >= 100 && uploadMbps >= 20 && pingMs <= 30 && jitterMs <= 6) {
    return 'excellent';
  }
  if (downloadMbps >= 40 && uploadMbps >= 10 && pingMs <= 65 && jitterMs <= 15) {
    return 'good';
  }
  if (downloadMbps >= 15 && uploadMbps >= 3 && pingMs <= 120 && jitterMs <= 30) {
    return 'fair';
  }
  return 'poor';
}

export function getActivityRatings(
  downloadMbps: number,
  uploadMbps: number,
  pingMs: number,
  jitterMs: number
): ActivityQuality[] {
  return [
    {
      name: '4K Ultra-HD Streaming',
      rating:
        downloadMbps >= 35 && jitterMs <= 20
          ? 'superb'
          : downloadMbps >= 20
          ? 'good'
          : downloadMbps >= 10
          ? 'fair'
          : 'poor',
      description:
        downloadMbps >= 25
          ? 'Flawless 4K HDR playback on multiple devices without buffering'
          : 'Suitable for 1080p Full HD; 4K may experience initial buffer wait',
      iconName: 'Tv',
    },
    {
      name: 'Competitive Online Gaming',
      rating:
        pingMs <= 25 && jitterMs <= 5
          ? 'superb'
          : pingMs <= 50 && jitterMs <= 12
          ? 'good'
          : pingMs <= 90
          ? 'fair'
          : 'poor',
      description:
        pingMs <= 30 && jitterMs <= 5
          ? `Ultra-low latency (${Math.round(pingMs)}ms) with stable jitter (<${Math.round(jitterMs)}ms) for twitch FPS & esports`
          : pingMs <= 70
          ? `Playable ping (${Math.round(pingMs)}ms) suitable for casual multiplayer`
          : `High latency (${Math.round(pingMs)}ms) may cause noticeable lag or input delay`,
      iconName: 'Gamepad2',
    },
    {
      name: 'Video Conferencing (Zoom / Teams)',
      rating:
        downloadMbps >= 10 && uploadMbps >= 5 && pingMs <= 60 && jitterMs <= 10
          ? 'superb'
          : downloadMbps >= 5 && uploadMbps >= 2 && pingMs <= 100
          ? 'good'
          : downloadMbps >= 2
          ? 'fair'
          : 'poor',
      description:
        uploadMbps >= 5 && jitterMs <= 10
          ? 'Crystal-clear 1080p video & spatial audio without packet drop or voice stutter'
          : 'Standard video calls supported; high jitter may cause sporadic audio drops',
      iconName: 'Video',
    },
    {
      name: 'Cloud Backups & Large Uploads',
      rating:
        uploadMbps >= 50
          ? 'superb'
          : uploadMbps >= 20
          ? 'good'
          : uploadMbps >= 8
          ? 'fair'
          : 'poor',
      description:
        uploadMbps >= 20
          ? `Fast ${uploadMbps.toFixed(1)} Mbps upload allows rapid syncing of 4K video, RAW photos & Drive backups`
          : `Standard upload bandwidth (${uploadMbps.toFixed(1)} Mbps); large files will take extra time`,
      iconName: 'CloudUpload',
    },
  ];
}
