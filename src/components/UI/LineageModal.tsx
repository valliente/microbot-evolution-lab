import React from 'react';
import { MicrobotEngine } from '../../simulation/MicrobotEngine';
import { Microbot } from '../../simulation/types';
import { X, GitBranch, Skull } from 'lucide-react';

interface LineageModalProps {
  isOpen: boolean;
  selectedBot: Microbot | null;
  engine: MicrobotEngine | null;
  onSelectBot: (botId: string) => void;
  onClose: () => void;
}

export const LineageModal: React.FC<LineageModalProps> = ({
  isOpen,
  selectedBot,
  engine,
  onSelectBot,
  onClose
}) => {
  if (!isOpen || !selectedBot || !engine) return null;

  // Build ancestral chain (upwards)
  const getAncestors = (bot: Microbot): Microbot[] => {
    const ancestors = [];
    let current = bot;
    while (current.parentId) {
      const parent = engine.microbots.find(b => b.id === current.parentId);
      if (!parent) break; // Extinct or untracked
      ancestors.unshift(parent);
      current = parent;
    }
    return ancestors;
  };

  // Build offspring tree (downwards)
  const renderDescendants = (bot: Microbot, depth: number = 0) => {
    const children = engine.microbots.filter(b => b.parentId === bot.id);
    if (children.length === 0) return null;

    return (
      <div style={{ marginLeft: depth > 0 ? 20 : 0, borderLeft: depth > 0 ? '1px dashed #546575' : 'none', paddingLeft: depth > 0 ? 10 : 0 }}>
        {children.map(child => (
          <div key={child.id} style={{ marginTop: 8 }}>
            <div
              onClick={() => onSelectBot(child.id)}
              style={{
                background: 'rgba(15, 26, 36, 0.8)',
                border: '1px solid rgba(0, 230, 118, 0.4)',
                borderRadius: 8,
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: child.color }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: '#00E676' }}>
                {child.id} (Gen {child.generation})
              </span>
            </div>
            {renderDescendants(child, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  const ancestors = getAncestors(selectedBot);
  const isExtinctOrigin = selectedBot.parentId && ancestors.length === 0;

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
        maxHeight: '90vh',
        overflowY: 'auto',
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
          <GitBranch style={{ color: '#E040FB' }} /> INTERACTIVE FAMILY LINEAGE TREE
        </h2>
        <p style={{ fontSize: '0.75rem', color: '#8B949E', marginBottom: 20 }}>
          Tracking genealogical heritage and offspring mutations for <strong>{selectedBot.id}</strong> (Gen #{selectedBot.generation}).
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          {/* Ancestry Chain */}
          <div style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E', marginBottom: 4 }}>
            ANCESTRY LINEAGE
          </div>
          
          {isExtinctOrigin && (
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f43f5e', fontSize: '0.75rem', fontStyle: 'italic', marginBottom: 8 }}>
                <Skull style={{ width: 14, height: 14 }} /> Origin Parent Extinct
             </div>
          )}

          {ancestors.map((ancestor) => (
            <div key={ancestor.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div
                onClick={() => onSelectBot(ancestor.id)}
                style={{
                  background: 'rgba(15, 26, 36, 0.8)',
                  border: '1px solid rgba(0, 229, 255, 0.4)',
                  borderRadius: 10,
                  padding: '6px 14px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  alignSelf: 'flex-start'
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: ancestor.color }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', fontWeight: 700, color: '#00E5FF' }}>
                  {ancestor.id} (Gen {ancestor.generation})
                </span>
              </div>
              <div style={{ color: '#E040FB', fontSize: '1.2rem', margin: '4px 0', alignSelf: 'flex-start', paddingLeft: 12 }}>↓</div>
            </div>
          ))}

          {/* Current Selected Bot Node */}
          <div style={{
            background: 'rgba(224, 64, 251, 0.15)',
            border: '2px solid #E040FB',
            borderRadius: 14,
            padding: '12px 24px',
            boxShadow: '0 0 20px rgba(224, 64, 251, 0.3)',
            alignSelf: 'stretch',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: selectedBot.color, boxShadow: '0 0 10px ' + selectedBot.color }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>
                {selectedBot.id}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#E040FB', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
              Generation #{selectedBot.generation} • Speed: {selectedBot.speed.toFixed(1)} px/f • Vision: {selectedBot.visionRadius.toFixed(0)}px
            </div>
          </div>

          <div style={{ color: '#E040FB', fontSize: '1.2rem', margin: '4px 0', alignSelf: 'flex-start', paddingLeft: 12 }}>↓</div>

          {/* Offspring Descendants */}
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E', marginBottom: 8 }}>
              OFFSPRING DESCENDANTS
            </div>
            
            {engine.microbots.filter(b => b.parentId === selectedBot.id).length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: '#546575', fontStyle: 'italic' }}>
                No active offspring descendants.
              </div>
            ) : (
              renderDescendants(selectedBot)
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
