import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Plus } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface Base64GeneticModalProps {
  isOpen: boolean;
  selectedBot: Microbot | null;
  onImportBase64: (botTraits: Partial<Microbot>) => void;
  onClose: () => void;
}

export const Base64GeneticModal: React.FC<Base64GeneticModalProps> = ({
  isOpen,
  selectedBot,
  onImportBase64,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [importString, setImportString] = useState<string>('');

  if (!isOpen) return null;

  const base64Code = selectedBot
    ? btoa(JSON.stringify({
        speed: selectedBot.speed,
        visionRadius: selectedBot.visionRadius,
        energyEfficiency: selectedBot.energyEfficiency,
        turnRate: selectedBot.turnRate,
        hue: selectedBot.hue,
        color: selectedBot.color
      }))
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(base64Code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      const decoded = JSON.parse(atob(importString.trim()));
      onImportBase64(decoded);
      setImportString('');
      onClose();
    } catch (err) {
      alert('Invalid Base64 genetic string!');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#0b0f19',
        border: '2px solid #00E676',
        borderRadius: '18px',
        maxWidth: '540px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 0 40px rgba(0, 230, 118, 0.3)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#8B949E', cursor: 'pointer' }}
        >
          <X style={{ width: 20, height: 20 }} />
        </button>

        <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', color: '#ffffff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileCode style={{ color: '#00E676' }} /> BASE64 GENETIC CODE EXPORTER
        </h2>
        <p style={{ fontSize: '0.75rem', color: '#8B949E', marginBottom: 18 }}>
          Copy encoded DNA strings to share strains or paste a Base64 string to clone a microbot.
        </p>

        {/* Selected Bot Export Area */}
        {selectedBot && (
          <div style={{ background: 'rgba(15, 26, 36, 0.8)', padding: 12, borderRadius: 10, border: '1px solid rgba(0, 230, 118, 0.3)', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", color: '#00E676', fontWeight: 800 }}>
                EXPORTED DNA: {selectedBot.id}
              </span>
              <button onClick={handleCopy} className="btn-holo btn-holo-green" style={{ padding: '3px 8px', fontSize: '0.65rem' }}>
                {copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                <span>{copied ? 'COPIED!' : 'COPY BASE64'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={base64Code}
              style={{
                width: '100%',
                height: 48,
                background: '#080E14',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 6,
                padding: 8,
                color: '#8B949E',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem',
                resize: 'none'
              }}
            />
          </div>
        )}

        {/* Import Base64 String */}
        <div style={{ background: 'rgba(15, 26, 36, 0.8)', padding: 12, borderRadius: 10, border: '1px solid rgba(0, 229, 255, 0.3)' }}>
          <div style={{ fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", color: '#00E5FF', fontWeight: 800, marginBottom: 6 }}>
            IMPORT BASE64 GENETIC CODE
          </div>
          <textarea
            placeholder="Paste Base64 encoded genetic string here..."
            value={importString}
            onChange={(e) => setImportString(e.target.value)}
            style={{
              width: '100%',
              height: 52,
              background: '#080E14',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: 6,
              padding: 8,
              color: '#00E5FF',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.68rem',
              resize: 'none'
            }}
          />
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <button onClick={handleImport} disabled={!importString.trim()} className="btn-holo btn-holo-cyan" style={{ padding: '6px 14px' }}>
              <Plus style={{ width: 12, height: 12 }} /> CLONE STRAIN
            </button>
          </div>
        </div>

        <div style={{ marginTop: 18, textAlign: 'right' }}>
          <button onClick={onClose} className="btn-holo btn-holo-dark">
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
