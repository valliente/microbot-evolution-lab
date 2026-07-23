import React, { useState } from 'react';
import { Microbot } from '../../simulation/types';
import { X, Search, Target, Gauge, Award } from 'lucide-react';

interface RosterModalProps {
  isOpen: boolean;
  microbots: Microbot[];
  selectedBotId: string | null;
  onSelectBot: (botId: string) => void;
  onClose: () => void;
}

export const RosterModal: React.FC<RosterModalProps> = ({
  isOpen,
  microbots,
  selectedBotId,
  onSelectBot,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'gen' | 'battery' | 'age' | 'offspring'>('gen');

  if (!isOpen) return null;

  const filteredBots = microbots
    .filter((bot) => bot.id.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'gen') return b.generation - a.generation;
      if (sortBy === 'battery') return b.battery - a.battery;
      if (sortBy === 'age') return b.age - a.age;
      if (sortBy === 'offspring') return b.offspringCount - a.offspringCount;
      return 0;
    });

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
        border: '2px solid #00f0ff',
        borderRadius: '18px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 40px rgba(0, 240, 255, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#00f0ff' }}>
            <Target style={{ width: 22, height: 22 }} />
            <div>
              <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                SELECT MICROBOT FROM ROSTER
              </h2>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Active Population: {microbots.length} Microbots
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div style={{ padding: '12px 20px', background: 'rgba(15, 23, 42, 0.5)', display: 'flex', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search style={{ width: 14, height: 14, color: '#94a3b8', position: 'absolute', left: 10 }} />
            <input
              type="text"
              placeholder="Search by ID (e.g. MB-0005)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 32px',
                background: '#030712',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: 8,
                color: '#ffffff',
                fontSize: '0.75rem',
                fontFamily: "'JetBrains Mono', monospace",
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
            <span>SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                background: '#030712',
                color: '#00f0ff',
                fontWeight: 700,
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              <option value="gen">Highest Generation</option>
              <option value="battery">Most Battery</option>
              <option value="age">Oldest Age</option>
              <option value="offspring">Most Offspring</option>
            </select>
          </div>
        </div>

        {/* Microbots List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredBots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.8rem' }}>
              No microbots found matching "{searchQuery}".
            </div>
          ) : (
            filteredBots.map((bot) => {
              const isCurrent = bot.id === selectedBotId;
              const batteryPct = Math.max(0, Math.min(100, (bot.battery / bot.maxBattery) * 100));

              return (
                <div
                  key={bot.id}
                  style={{
                    background: isCurrent ? 'rgba(0, 240, 255, 0.12)' : 'rgba(15, 23, 42, 0.7)',
                    border: isCurrent ? '2px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      backgroundColor: bot.color,
                      border: '2px solid #ffffff',
                      boxShadow: '0 0 8px ' + bot.color
                    }} />

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
                          {bot.id}
                        </span>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '2px 6px', borderRadius: 6, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                          GEN #{bot.generation}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', color: '#94a3b8', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Gauge style={{ width: 12, height: 12, color: '#00f0ff' }} /> {bot.speed.toFixed(1)} px/f
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Award style={{ width: 12, height: 12, color: '#fbbf24' }} /> {bot.offspringCount} kids
                        </span>
                        <span>State: <strong style={{ color: '#34d399' }}>{bot.behaviorState.replace('_', ' ')}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Battery Bar & Select Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 90 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#00f0ff', marginBottom: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                        <span>Charge</span>
                        <span>{batteryPct.toFixed(0)}%</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${batteryPct}%`, background: batteryPct > 40 ? '#00f0ff' : '#fbbf24' }} />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectBot(bot.id);
                        onClose();
                      }}
                      className={isCurrent ? 'btn btn-cyan' : 'btn btn-purple'}
                      style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                    >
                      {isCurrent ? '✓ SELECTED' : 'SELECT THIS BOT'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
