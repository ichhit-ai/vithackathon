import type { ShowcaseProject } from '../types';
import { Heart } from 'lucide-react';

export function GalleryPage() {
  const projects: ShowcaseProject[] = [
    {
      id: 'g1', studentName: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      title: 'Habit Tracker with Streaks',
      tier: 'standard', techStack: ['React', 'TypeScript', 'Tailwind'],
      checkpointsCompleted: 5, totalCheckpoints: 5, completionTimeHours: 6.5, likes: 34
    },
    {
      id: 'g2', studentName: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      title: 'Markdown Note App',
      tier: 'ambitious', techStack: ['React', 'TypeScript', 'IndexedDB'],
      checkpointsCompleted: 6, totalCheckpoints: 6, completionTimeHours: 11, likes: 52
    },
    {
      id: 'g3', studentName: 'David Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      title: 'Developer Portfolio',
      tier: 'lean', techStack: ['React', 'CSS'],
      checkpointsCompleted: 4, totalCheckpoints: 4, completionTimeHours: 3.5, likes: 19
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="panel-header">
        <span>Gallery</span>
        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: 'var(--text-muted)' }}>
          {projects.length} verified projects
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.7fr 1fr 0.4fr',
          padding: '4px 12px', gap: 10,
          fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          <span>Project</span>
          <span>Stack</span>
          <span>Tier</span>
          <span>Progress</span>
          <span>Likes</span>
        </div>

        {projects.map(p => (
          <div key={p.id} style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.7fr 1fr 0.4fr',
            padding: '10px 12px', gap: 10, alignItems: 'center',
            background: 'var(--bg-sidebar)', border: '1px solid var(--border-subtle)',
            borderRadius: 6, cursor: 'pointer', transition: 'border-color 0.1s'
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            {/* Project */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
              <img src={p.avatar} alt={p.studentName} style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.studentName}</div>
              </div>
            </div>

            {/* Stack */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {p.techStack.slice(0, 3).map(t => (
                <span key={t} className="tag" style={{ fontSize: 10 }}>{t}</span>
              ))}
            </div>

            {/* Tier */}
            <span className="tag" style={{ fontSize: 10, width: 'fit-content' }}>{p.tier}</span>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 4, background: 'var(--bg-active)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', background: 'var(--green)',
                  width: `${(p.checkpointsCompleted / p.totalCheckpoints) * 100}%`
                }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {p.checkpointsCompleted}/{p.totalCheckpoints}
              </span>
            </div>

            {/* Likes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
              <Heart size={11} color="#888" />
              {p.likes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
