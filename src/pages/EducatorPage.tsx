import { ShieldAlert } from 'lucide-react';

export function EducatorPage() {
  const stats = [
    { label: 'Students', value: '42' },
    { label: 'Active Projects', value: '38' },
    { label: 'Avg Pass Rate', value: '87%' },
    { label: 'Flags', value: '2' },
  ];

  const cpRates = [
    { name: 'CP1: Scaffold & Header', rate: 98 },
    { name: 'CP2: Array Mapping & Props', rate: 92 },
    { name: 'CP3: Local Storage Sync', rate: 74 },
    { name: 'CP4: Derived Metrics', rate: 85 },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="panel-header">
        <span>Educator Hub</span>
        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: 'var(--text-muted)' }}>
          Cohort analytics
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-sidebar)', border: '1px solid var(--border-subtle)',
              borderRadius: 6, padding: '12px 14px'
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Pass rate bars */}
        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-subtle)', borderRadius: 6, overflow: 'hidden' }}>
          <div className="panel-header">
            <span>Checkpoint Pass Rates</span>
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cpRates.map(cp => (
              <div key={cp.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 200, flexShrink: 0 }}>{cp.name}</span>
                <div style={{ flex: 1, height: 5, background: 'var(--bg-active)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: cp.rate < 80 ? 'var(--amber)' : 'var(--green)',
                    width: `${cp.rate}%`, transition: 'width 0.3s'
                  }} />
                </div>
                <span style={{ fontSize: 11, color: cp.rate < 80 ? 'var(--amber)' : 'var(--green)', fontFamily: 'monospace', width: 40, textAlign: 'right', flexShrink: 0 }}>
                  {cp.rate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Anti-cheat */}
        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-subtle)', borderRadius: 6, overflow: 'hidden' }}>
          <div className="panel-header">
            <span>Integrity Signals</span>
          </div>
          <div style={{ padding: '10px 14px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 10px', background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)', borderRadius: 5
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <ShieldAlert size={13} color="var(--amber)" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
                    Student #8492 — Large Clipboard Paste
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Pasted 120 lines into Checkpoint 3 editor within 1 second.
                  </div>
                </div>
              </div>
              <span className="tag" style={{ fontSize: 10, flexShrink: 0 }}>Review needed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
