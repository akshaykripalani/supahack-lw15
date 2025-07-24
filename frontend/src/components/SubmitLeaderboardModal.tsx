import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Leaderboard } from './Leaderboard';
import { useGameStore } from '../store/game';

/*
  Full-screen modal that blurs the background, shows the top-10 leaderboard
  and lets the player enter their username to submit the current score.
*/
export function SubmitLeaderboardModal() {
  const closeModal = useGameStore((s) => s.closeModal);
  const submitScore = useGameStore((s) => s.submitCurrentScore);
  const score = useGameStore((s) => s.score);
  const hasSubmitted = useGameStore((s) => s.hasSubmitted);
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    },
    [closeModal],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const onSubmit = async () => {
    if (hasSubmitted) return;
    if (username.length < 3 || username.length > 10) return;
    setSubmitting(true);
    await submitScore(username);
    setSubmitting(false);
    closeModal();
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          width: 380,
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h2 style={{ margin: 0, textAlign: 'center' }}>Leaderboard</h2>
        <Leaderboard />
        <div style={{ marginTop: 8, textAlign: 'center', fontWeight: 600 }}>
          Your score: {score}%
        </div>
        {!hasSubmitted && (
          <input
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '1.5px solid #a18cd1',
              fontSize: 16,
              outline: 'none',
            }}
            placeholder="Username (3-10 chars)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={10}
          />
        )}
        {hasSubmitted && (
          <div style={{ textAlign: 'center', color: '#181818' }}>
            Score submitted! 🎉
          </div>
        )}
        {!hasSubmitted && (
        <button
          style={{
            padding: '10px 0',
            borderRadius: 8,
            border: 'none',
            background: '#7b4397',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            cursor:
              username.length >= 3 && username.length <= 10 && !submitting
                ? 'pointer'
                : 'not-allowed',
            opacity: username.length >= 3 && username.length <= 10 ? 1 : 0.6,
          }}
          disabled={username.length < 3 || username.length > 10 || submitting}
          onClick={onSubmit}
        >
          {submitting ? 'Submitting…' : 'Submit Score'}
        </button>
        )}
        <button
          style={{
            padding: '6px 0',
            border: 'none',
            background: 'transparent',
            color: '#555',
            cursor: 'pointer',
            fontSize: 14,
          }}
          onClick={closeModal}
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body,
  );
} 