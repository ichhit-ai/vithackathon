import type { FileNode } from '../../types';
import { Lock, FileCode, Folder } from 'lucide-react';

interface FileTreeProps {
  files: FileNode[];
  activeFileId: string;
  unlockedFiles: string[];
  onSelectFile: (path: string) => void;
}

export function FileTree({ files, activeFileId, unlockedFiles, onSelectFile }: FileTreeProps) {
  const renderNode = (node: FileNode) => {
    if (node.type === 'folder' && node.children) {
      return (
        <div key={node.id}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', fontSize: 11,
            color: 'var(--text-muted)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            <Folder size={11} />
            <span>{node.name}</span>
          </div>
          <div style={{ paddingLeft: 10, borderLeft: '1px solid var(--border-subtle)', marginLeft: 16 }}>
            {node.children.map(renderNode)}
          </div>
        </div>
      );
    }

    const unlocked = unlockedFiles.includes(node.path);
    const active = activeFileId === node.path;

    return (
      <button
        key={node.id}
        disabled={!unlocked}
        onClick={() => onSelectFile(node.path)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '5px 10px', background: active ? 'var(--bg-active)' : 'none',
          border: 'none', borderRadius: 4, cursor: unlocked ? 'pointer' : 'not-allowed',
          gap: 6, textAlign: 'left', transition: 'background 0.1s',
          opacity: unlocked ? 1 : 0.4
        }}
        onMouseEnter={e => { if (unlocked && !active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
          <FileCode size={12} color={active ? 'var(--text-primary)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
          <span style={{
            fontSize: 12, fontFamily: 'monospace',
            color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>{node.name}</span>
        </div>
        {!unlocked && <Lock size={10} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
      </button>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-sidebar)' }}>
      <div className="panel-header">
        <span>Explorer</span>
        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>
          {unlockedFiles.length} unlocked
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 4px' }}>
        {files.map(renderNode)}
      </div>
    </div>
  );
}
