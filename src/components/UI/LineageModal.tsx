import React from 'react';
import { Microbot } from '../../simulation/types';
import { X, GitBranch, ArrowRight } from 'lucide-react';

interface LineageModalProps {
  isOpen: boolean;
  selectedBot: Microbot | null;
  parentBot: Microbot | null;
  childBots: Microbot[];
  onSelectBot: (botId: string) => void;
  onClose: () => void;
}

export const LineageModal: React.FC<LineageModalProps> = ({
  isOpen,
  selectedBot,
  parentBot,
  childBots,
  onSelectBot,
  onClose
}) => {
  if (!isOpen || !selectedBot) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#0b0f19',
        border: '2px solid #E040FB',
        borderRadius: '18px',
        maxWidth: '680px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 0 40px rgba(224, 64, 251, 0.3)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#8B949E', cursor: 'pointer' }}
        >
          <X style={{ width: 20, height: 20 }} />
        </button>

        <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', color: '#ffffff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <GitBranch style={{ color: '#E040FB' }} /> MICROBOT FAMILY LINEAGE TREE
        </h2>
        <p style={{ fontSize: '0.75rem', color: '#8B949E', marginBottom: 20 }}>
          Tracking genealogical heritage and offspring mutations for <strong>{selectedBot.id}</strong> (Gen #{selectedBot.generation}).
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          {/* Parent Node */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E', marginBottom: 4 }}>
              PARENT NODE
            </div>
            {parentBot ? (
              <div
                onClick={() => onSelectBot(parentBot.id)}
                style={{
                  background: 'rgba(15, 26, 36, 0.8)',
                  border: '1px solid rgba(0, 229, 255, 0.4)',
                  borderRadius: 10,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: parentBot.color }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#00E5FF' }}>
                  {parentBot.id} (Gen #{parentBot.generation})
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#546575', fontStyle: 'italic' }}>
                ORIGIN (Generation 1 Founder)
              </div>
            )}
          </div>

          <div style={{ color: '#E040FB', fontSize: '1.2rem' }}>↓</div>

          {/* Current Selected Bot Node */}
          <div style={{
            background: 'rgba(224, 64, 251, 0.15)',
            border: '2px solid #E040FB',
            borderRadius: 14,
            padding: '12px 24px',
            textAlign: 'center',
            boxShadow: '0 0 20px rgba(224, 64, 251, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: selectedBot.color, boxShadow: '0 0 10px ' + selectedBot.color }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>
                {selectedBot.id}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#E040FB', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
              Generation #{selectedBot.generation} • Speed: {selectedBot.speed.toFixed(1)} px/f • Vision: {selectedBot.visionRadius.toFixed(0)}px
            </div>
          </div>

          <div style={{ color: '#E040FB', fontSize: '1.2rem' }}>↓</div>

          {/* Offspring Children Nodes */}
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E', textAlign: 'center', marginBottom: 8 }}>
              OFFSPRING ({childBots.length} Active Children)
            </div>

            {childBots.length === 0 ? (
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#546575', fontStyle: 'italic' }}>
                No active offspring produced yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {childBots.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => onSelectBot(child.id)}
                    style={{
                      background: 'rgba(15, 26, 36, 0.8)',
                      border: '1px solid rgba(0, 230, 118, 0.4)',
                      borderRadius: 10,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: child.color }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', fontWeight: 800, color: '#00E676' }}>
                      {child.id}
                    </span>
                    <ArrowRight style={{ width: 12, height: 12, color: '#8B949E' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button onClick={onClose} className="btn-holo btn-holo-magenta" style={{ padding: '8px 18px' }}>
            CLOSE TREE
          </button>
        </div>
      </div>
    </div>
  );
};
