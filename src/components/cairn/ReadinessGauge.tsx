import { Activity } from 'lucide-react';

interface ReadinessGaugeProps {
  completedCount: number;
  totalCount: number;
  watcherActive: boolean;
  activeFile?: string;
  lastHeartbeatTime?: string;
}

export function ReadinessGauge({
  completedCount,
  totalCount,
  watcherActive,
  activeFile = 'code',
  lastHeartbeatTime
}: ReadinessGaugeProps) {
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // SVG arc calculation for semicircular gauge
  const radius = 28;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (pct / 100) * circumference;

  let gaugeColor = 'var(--clay-red)';
  if (pct >= 80) gaugeColor = 'var(--clay-green)';
  else if (pct >= 40) gaugeColor = 'var(--clay-amber)';
  else if (pct >= 20) gaugeColor = 'var(--clay-purple)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Watcher Daemon Status Badge */}
      <div
        title={watcherActive ? `Watchdog Daemon actively monitoring ${activeFile}` : 'Watchdog Daemon waiting for file edits'}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: watcherActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.08)',
          border: `1px solid ${watcherActive ? 'var(--clay-green)' : 'var(--clay-amber)'}`,
          borderRadius: 'var(--clay-radius-pill)', padding: '4px 12px',
          transition: 'all 0.3s ease'
        }}
      >
        <Activity
          size={12}
          color={watcherActive ? 'var(--clay-green)' : 'var(--clay-amber)'}
          style={{ animation: watcherActive ? 'pulse 1.2s infinite' : 'none' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
            color: watcherActive ? 'var(--clay-green)' : 'var(--clay-amber)'
          }}>
            WATCHDOG DAEMON
          </div>
          <div style={{ fontSize: 9, color: 'var(--clay-text-muted)', fontWeight: 600 }}>
            {watcherActive ? `SYNCING: ${activeFile}` : lastHeartbeatTime ? `LAST: ${lastHeartbeatTime}` : 'IDLE'}
          </div>
        </div>
      </div>

      {/* SVG Semicircular Readiness Gauge */}
      <div style={{ position: 'relative', width: 64, height: 36 }} title="Demo Readiness Completion Score">
        <svg width="64" height="36" viewBox="0 0 64 36">
          <path
            d="M 4 32 A 28 28 0 0 1 60 32"
            fill="none"
            stroke="var(--clay-border)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 4 32 A 28 28 0 0 1 60 32"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          fontSize: 12, fontWeight: 800, color: gaugeColor, fontFamily: 'monospace'
        }}>
          {pct}%
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--clay-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Demo Ready
        </span>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--clay-text)' }}>
          {completedCount}/{totalCount} CP
        </span>
      </div>
    </div>
  );
}
