import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface ErrorOverlayProps {
  error: Error | null;
  onRecover: () => void;
}

export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ error, onRecover }) => {
  if (!error) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.9)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="holo-panel" style={{ padding: '30px 40px', maxWidth: 600, textAlign: 'center', borderColor: 'rgba(244, 63, 94, 0.4)' }}>
        <AlertOctagon size={48} color="#f43f5e" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 10px', color: '#f43f5e' }}>Simulation Exception</h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 20px', lineHeight: 1.5 }}>
          An unhandled error occurred in the simulation engine or web worker thread.
        </p>
        <div style={{ 
          background: 'rgba(0,0,0,0.4)', 
          padding: 15, 
          borderRadius: 8, 
          fontFamily: "'JetBrains Mono', monospace", 
          fontSize: '0.8rem',
          color: '#fb7185',
          textAlign: 'left',
          marginBottom: 30,
          border: '1px solid rgba(244, 63, 94, 0.2)',
          wordBreak: 'break-all'
        }}>
          {error.message || 'Unknown Error'}
        </div>
        <button 
          onClick={onRecover}
          style={{
            background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            margin: '0 auto'
          }}
        >
          <RefreshCw size={16} /> Recover and Restart Engine
        </button>
      </div>
    </div>
  );
};
