import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
  value: string;
  filePath: string;
  onChange: (newValue: string) => void;
}

export function MonacoCodeEditor({ value, filePath, onChange }: MonacoEditorProps) {
  const getLanguage = (path: string) => {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.jsx') || path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.py'))  return 'python';
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.css'))  return 'css';
    if (path.endsWith('.html')) return 'html';
    return 'typescript';
  };

  const lang = getLanguage(filePath);
  const fileName = filePath.split('/').pop() || filePath;

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:'#1e1e1e' }}>
      {/* Tab bar */}
      <div style={{
        height: 34, background:'#252526',
        borderBottom:'1px solid #333',
        padding:'0 14px', display:'flex', alignItems:'center', justifyContent:'space-between',
        fontSize:12, fontFamily:"'JetBrains Mono', monospace", color:'#999', flexShrink:0,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#10b981' }} />
          <span style={{ color:'#e5e5e5' }}>{fileName}</span>
        </div>
        <div style={{ fontSize:10, textTransform:'uppercase', color:'#666' }}>
          {lang} • Monaco Editor
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex:1 }}>
        <Editor
          height="100%"
          language={lang}
          value={value}
          onChange={val => onChange(val || '')}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 12, bottom: 12 },
            lineNumbersMinChars: 3,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
