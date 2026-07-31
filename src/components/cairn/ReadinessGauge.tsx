interface ReadinessGaugeProps {
  completedCount: number;
  totalCount: number;
  watcherActive: boolean;
}

export function ReadinessGauge({ completedCount, totalCount, watcherActive }: ReadinessGaugeProps) {
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Watcher Pulse Badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: watcherActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.08)',
        border: `1px solid ${watcherActive ? 'var(--clay-green)' : 'var(--clay-red)'}`,
        borderRadius: 'var(--clay-radius-pill)', padding: '3px 10px'
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: watcherActive ? 'var(--clay-green)' : 'var(--clay-red)',
          animation: watcherActive ? 'pulse 2s infinite' : 'none',
          flexShrink: 0
        }} />
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
          color: watcherActive ? 'var(--clay-green)' : 'var(--clay-red)'
        }}>
          {watcherActive ? 'ACTIVE' : 'IDLE'}
        </span>
      </div>

      {/* SVG Semicircular Gauge */}
      <div style={{ position: 'relative', width: 64, height: 36 }}>
        <svg width="64" height="36" viewBox="0 0 64 36">
          {/* Background arc */}
          <path
            d="M 4 32 A 28 28 0 0 1 60 32"
            fill="none"
            stroke="var(--clay-border)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Progress arc */}
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
          {completedCount}/{totalCount}
        </span>
      </div>
    </div>
  );
}
