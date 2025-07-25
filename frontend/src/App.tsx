import { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import slopIcon from '../slop.png';
import { useGameStore } from './store/game';
import { Leaderboard } from './components/Leaderboard';
import { useEffect } from 'react';

function App() {
  const [promptInput, setPromptInput] = useState('');
  // username handled in modal now
  const startGame = useGameStore((s) => s.startGame);
  const startTime = useGameStore((s) => s.startTime);
  const gameState = useGameStore((s) => s.gameState);
  const score = useGameStore((s) => s.score);
  const slopMode = useGameStore((s) => s.slopMode);
  const startSlopGame = useGameStore((s) => s.startSlopGame);
  const endSlopMode = useGameStore((s) => s.endSlopMode);

  // mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    const ua = navigator.userAgent;
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth < 700;
  });

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 700);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let id: number | undefined;
    if (gameState === 'running' || gameState === 'over') {
      id = window.setInterval(() => {
        if (startTime) {
          setElapsed(Math.floor((performance.now() - startTime) / 1000));
        }
      }, 500);
    } else {
      setElapsed(0);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [gameState, startTime]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  if (isMobile) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f7f5fa',
        padding: 24,
        textAlign: 'center',
      }}>
        <h2 style={{ color: '#181818' }}>
          Sorry, mobile devices are not supported yet.<br />
          Please use a desktop or larger screen.
        </h2>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'stretch',
        background: '#f7f5fa',
      }}
    >
      <aside
        style={{
          width: 340,
          padding: 32,
          borderRight: 'none',
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '2px 0 16px 0 rgba(161,140,209,0.10)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontWeight: 800,
            fontSize: 32,
            letterSpacing: 1,
            marginBottom: 8,
            color: '#181818',
          }}
        >
          LLM Breakout
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Username input moved to modal */}
          <input
            style={{
              marginBottom: 0,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1.5px solid #a18cd1',
              fontSize: 16,
              outline: 'none',
              color: '#181818',
              background: '#f7f5fa',
              transition: 'border 0.2s',
              boxShadow: '0 1px 4px 0 rgba(161,140,209,0.07)',
            }}
            placeholder="Enter a creative prompt..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' && promptInput && gameState !== 'loading'
              ) {
                if (slopMode) {
                  startSlopGame();
                } else {
                  startGame(promptInput);
                }
              }
            }}
          />
          {/* Submit Score button moved to modal */}
          <button
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 8,
              border: 'none',
              background: '#7b4397',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: 0.5,
              cursor: (!slopMode && !promptInput) || gameState === 'loading' ? 'not-allowed' : 'pointer',
              opacity: (!slopMode && !promptInput) || gameState === 'loading' ? 0.6 : 1,
              boxShadow: '0 2px 8px 0 rgba(161,140,209,0.10)',
              transition: 'opacity 0.2s',
            }}
            onClick={() => {
              if (slopMode) {
                startSlopGame();
              } else {
                startGame(promptInput);
              }
            }}
            disabled={(!slopMode && !promptInput) || gameState === 'loading'}
          >
            {gameState === 'loading' ? 'Loading…' : 'Start / Restart'}
          </button>

          {/* Loading indicator */}
          {gameState === 'loading' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 12,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  border: '4px solid #7b4397',
                  borderTop: '4px solid transparent',
                  borderRadius: '50%',
                  animation: 'logo-spin 1s linear infinite',
                }}
              />
              <span style={{ color: '#7b4397', fontWeight: 600 }}>Generating layout…</span>
            </div>
          )}
          {/* Dev button removed for production */}
        </div>
        {!slopMode && (
          <div
            style={{
              marginTop: 8,
              background: '#e9e4f0',
              borderRadius: 10,
              padding: '18px 16px',
              boxShadow: '0 2px 8px 0 rgba(161,140,209,0.08)',
              color: '#181818',
              fontWeight: 500,
              fontSize: 18,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#181818' }}>
              Score: <span style={{ color: '#7b4397' }}>{score}%</span>
            </div>
            <div style={{ fontSize: 16, marginTop: 2, color: '#181818' }}>
              Time: <span style={{ color: '#43cea2' }}>{mm}:{ss}</span>
            </div>
          </div>
        )}
        <div style={{ marginTop: 12, textAlign: 'center', color: '#181818', fontSize: 14, opacity: 0.7 }}>
          <span>Tip: Try prompts like "A neon city at night" or "A robot's morning routine"</span>
        </div>
        {!slopMode && <Leaderboard />}
      </aside>
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f7f5fa',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div style={{
        width: '100%',
        maxWidth: 900,
        margin: '0 auto',
        marginTop: 32,
        marginBottom: -16,
      }}>
        <div style={{
          background: '#f7f5fa',
          borderRadius: 10,
          padding: '14px 12px',
          boxShadow: '0 1px 4px 0 rgba(161,140,209,0.07)',
          color: '#181818',
          fontSize: 15,
          textAlign: 'center',
          opacity: 0.92,
        }}>
          <b>How to Play:</b><br />
          Welcome to LLM Breakout! A tastefully sloppy homage to the classic arcade game.<br />
          Type a prompt to build your own bricks, press <i>Start</i>, and break all the bricks with the ball & your ← → keys.<br />
          <span style={{ fontSize: 10 }}>(Pssst… click <b>Slopify</b> for a surprise 😉)</span>
        </div>
      </div>
        <GameCanvas />
      </main>
      {/* Slopify button fixed viewport */}
      <button
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          padding: '10px 16px',
          background: '#0A66C2',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          zIndex: 1000,
        }}
        onClick={() => {
          if (slopMode) {
            endSlopMode();
          } else {
            startSlopGame();
          }
        }}
      >
        <img src={slopIcon} alt="in" style={{ width: 18, height: 18, marginRight: 8, verticalAlign: 'middle' }} />
        {slopMode ? 'De-slop' : 'Slopify'}
      </button>
    </div>

  );
}

export default App;
