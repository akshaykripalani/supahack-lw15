import { useEffect, useState, useCallback } from 'react';
import { fetchTopScores } from '../api/leaderboard';
import type { ScoreRow } from '../api/leaderboard';
import { useGameStore } from '../store/game';

export function Leaderboard() {
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const gameState = useGameStore((s) => s.gameState);

  const load = useCallback(async () => {
    const data = await fetchTopScores();
    setScores(data);
  }, []);

  // initial load
  useEffect(() => {
    load();
  }, [load]);

  // refresh after each game ends
  useEffect(() => {
    if (gameState === 'over') {
      load();
    }
  }, [gameState, load]);

  return (
    <div>
      <h3 style={{ margin: '8px 0 12px', fontSize: 20, fontWeight: 700, textAlign: 'center', color: '#181818' }}>
        Leaderboard
      </h3>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {scores.map((row, idx) => (
          <li
            key={row.id ?? idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 8px',
              background: idx % 2 === 0 ? 'rgba(161,140,209,0.08)' : 'transparent',
              borderRadius: 6,
              fontSize: 14,
              color: '#181818',
            }}
          >
            <span style={{ fontWeight: 600 }}>{idx + 1}. {row.username}</span>
            <span>{row.score}%</span>
          </li>
        ))}
        {scores.length === 0 && (
          <li style={{ textAlign: 'center', opacity: 0.6 }}>No scores yet</li>
        )}
      </ol>
    </div>
  );
} 