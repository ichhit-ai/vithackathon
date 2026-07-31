export function TerminalOutput({ output }: { output: string }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: '#0e0e0e', borderTop: '1px solid var(--border-subtle)', fontFamily: 'monospace'
    }}>
      <div className="panel-header" style={{ background: '#111111' }}>
        <span>Terminal</span>
      </div>
      <div style={{
        flex: 1, padding: '8px 12px', overflowY: 'auto',
        fontSize: 12, color: '#888', whiteSpace: 'pre-wrap', lineHeight: 1.6
      }}>
        {output}
      </div>
    </div>
  );
}
