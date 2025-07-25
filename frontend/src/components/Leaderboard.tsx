import { useEffect, useState, useCallback } from 'react';
import { fetchTopScores } from '../api/leaderboard';
import type { ScoreRow } from '../api/leaderboard';
import { useGameStore } from '../store/game';

export function Leaderboard() {
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [savedUsername, setSavedUsername] = useState<string | null>(null);
  const gameState = useGameStore((s) => s.gameState);

  const load = useCallback(async () => {
    const data = await fetchTopScores();
    setScores(data);
  }, []);

  // initial load
  useEffect(() => {
    load();
    // Retrieve username from localStorage
    const stored = localStorage.getItem('username');
    if (stored) setSavedUsername(stored);
  }, [load]);

  // refresh after each game ends
  useEffect(() => {
    if (gameState === 'over') {
      load();
    }
  }, [gameState, load]);

  // Helper to format ms to mm:ss.ms
  function formatTime(ms: number) {
    const totalSec = ms / 1000;
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(Math.floor(totalSec % 60)).padStart(2, '0');
    const msPart = String(Math.floor(ms % 1000)).padStart(3, '0');
    return `${mm}:${ss}.${msPart}`;
  }

  return (
    <div>
      <h3 style={{ margin: '8px 0 12px', fontSize: 20, fontWeight: 700, textAlign: 'center', color: '#181818' }}>
        Leaderboard
      </h3>
      {savedUsername && (
        <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 14, color: '#6c63ff' }}>
          Welcome back, <b>{savedUsername}</b>!
        </div>
      )}
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {scores.map((row, idx) => (
          <li
            key={row.id ?? idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 8px',
              background: idx % 2 === 0 ? 'rgba(161,140,209,0.08)' : 'transparent',
              borderRadius: 6,
              fontSize: 14,
              color: '#181818',
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>{idx + 1}. {row.username}</span>
            <span>{row.score}% ({formatTime(row.time_ms)})</span>
          </li>
        ))}
        {scores.length === 0 && (
          <li style={{ textAlign: 'center', opacity: 0.6 }}>No scores yet</li>
        )}
      </ol>
    </div>
  );
} 