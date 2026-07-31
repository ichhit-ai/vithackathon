import type { CritiqueCard } from '../../types';
import { ShieldCheck, Scissors, ArrowRightLeft } from 'lucide-react';

interface ScopeCritiqueCardsProps {
  cards: CritiqueCard[];
}

const BUCKET_CONFIG = {
  keep: {
    label: '🟢 KEEP — Must Have',
    color: 'var(--clay-green)',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'var(--clay-green)',
    icon: ShieldCheck
  },
  cut: {
    label: '🔴 CUT — Drop Immediately',
    color: 'var(--clay-red)',
    bg: 'rgba(239, 68, 68, 0.06)',
    border: 'var(--clay-red)',
    icon: Scissors
  },
  pivot: {
    label: '🟠 PIVOT — Smart Shortcut',
    color: 'var(--clay-amber)',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'var(--clay-amber)',
    icon: ArrowRightLeft
  }
};

export function ScopeCritiqueCards({ cards }: ScopeCritiqueCardsProps) {
  const keeps = cards.filter(c => c.bucket === 'keep');
  const cuts = cards.filter(c => c.bucket === 'cut');
  const pivots = cards.filter(c => c.bucket === 'pivot');

  const columns = [
    { bucket: 'keep' as const, items: keeps },
    { bucket: 'cut' as const, items: cuts },
    { bucket: 'pivot' as const, items: pivots },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
      padding: '12px 16px'
    }}>
      {columns.map(col => {
        const cfg = BUCKET_CONFIG[col.bucket];
        const Icon = cfg.icon;
        return (
          <div key={col.bucket} style={{
            background: 'var(--clay-card)', borderRadius: 'var(--clay-radius-md)',
            boxShadow: 'var(--clay-shadow)', borderTop: `3px solid ${cfg.border}`,
            padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon size={13} color={cfg.color} />
              <span style={{ fontSize: 11, fontWeight: 800, color: cfg.color, letterSpacing: '0.04em' }}>
                {cfg.label}
              </span>
            </div>

            {col.items.length === 0 && (
              <div style={{ fontSize: 11, color: 'var(--clay-text-subtle)', fontStyle: 'italic' }}>
                No items in this category
              </div>
            )}

            {col.items.map(card => (
              <div key={card.id} style={{
                background: cfg.bg, borderRadius: 'var(--clay-radius-sm)',
                padding: '8px 10px', borderLeft: `3px solid ${cfg.border}`,
                opacity: col.bucket === 'cut' ? 0.75 : 1,
                transition: 'opacity 0.2s',
                fontStyle: col.bucket === 'pivot' ? 'italic' : 'normal'
              }}
                onMouseEnter={e => { if (col.bucket === 'cut') (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                onMouseLeave={e => { if (col.bucket === 'cut') (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clay-text)', marginBottom: 2 }}>
                  {card.title}
                </div>
                <div style={{ fontSize: 10, color: 'var(--clay-text-muted)', lineHeight: 1.4 }}>
                  {card.rationale}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
