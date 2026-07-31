import { useState } from 'react';
import { setApiKey, getApiKey } from '../services/geminiService';
import { Key, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  onSaved: () => void;
}

export function ApiKeyModal({ onSaved }: ApiKeyModalProps) {
  const [key, setKey] = useState(getApiKey() || '');
  const [error, setError] = useState('');

  const save = () => {
    if (!key.trim()) {
      setError('Please enter your API key');
      return;
    }
    setApiKey(key.trim());
    onSaved();
  };

  return (
    <div className="api-modal">
      <div className="api-modal-box fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: 'var(--bg-3)', border: '1px solid var(--border-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Key size={14} color="var(--text-2)" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Gemini API Key</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
              Required to power plan generation and AI coaching
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>Your API Key</label>
          <input
            className="input"
            type="password"
            value={key}
            onChange={e => { setKey(e.target.value); setError(''); }}
            placeholder="AIza..."
            onKeyDown={e => e.key === 'Enter' && save()}
            autoFocus
          />
          {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', width: 'fit-content' }}
          >
            <ExternalLink size={10} />
            Get a free key at aistudio.google.com
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
            Your key is stored only in your browser's localStorage — never sent to any server other than Google's API.
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '9px' }}
          onClick={save}
          disabled={!key.trim()}
        >
          Save & Start
        </button>
      </div>
    </div>
  );
}
