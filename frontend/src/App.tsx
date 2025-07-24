
import { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { useGameStore } from './store/game';

function App() {
  const [promptInput, setPromptInput] = useState('');
  const startGame = useGameStore((s) => s.startGame);
  const gameState = useGameStore((s) => s.gameState);
  const score = useGameStore((s) => s.score);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'stretch',
        background: 'linear-gradient(120deg, #a18cd1 0%, #fbc2eb 100%)',
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
            background: 'linear-gradient(90deg, #a18cd1, #fbc2eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}
        >
          LLM Breakout
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            style={{
              marginBottom: 0,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1.5px solid #a18cd1',
              fontSize: 16,
              outline: 'none',
              color: '#4a3f6b',
              background: '#f7f5fa',
              transition: 'border 0.2s',
              boxShadow: '0 1px 4px 0 rgba(161,140,209,0.07)',
            }}
            placeholder="Enter a creative prompt..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
          />
          <button
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(90deg, #a18cd1, #fbc2eb)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: 0.5,
              cursor: !promptInput || gameState === 'loading' ? 'not-allowed' : 'pointer',
              opacity: !promptInput || gameState === 'loading' ? 0.6 : 1,
              boxShadow: '0 2px 8px 0 rgba(161,140,209,0.10)',
              transition: 'opacity 0.2s',
            }}
            onClick={() => startGame(promptInput)}
            disabled={!promptInput || gameState === 'loading'}
          >
            {gameState === 'loading' ? 'Loading…' : 'Start / Restart'}
          </button>
        </div>
        <div
          style={{
            marginTop: 8,
            background: 'linear-gradient(90deg, #fbc2eb 0%, #a6c1ee 100%)',
            borderRadius: 10,
            padding: '18px 16px',
            boxShadow: '0 2px 8px 0 rgba(161,140,209,0.08)',
            color: '#4a3f6b',
            fontWeight: 500,
            fontSize: 18,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Score: <span style={{ color: '#7b4397' }}>{score}%</span>
          </div>
          <div style={{ fontSize: 16, marginTop: 2 }}>
            State: <span style={{ color: gameState === 'playing' ? '#43cea2' : gameState === 'loading' ? '#f7971e' : '#7b4397' }}>{gameState}</span>
          </div>
        </div>
        <div style={{ marginTop: 12, textAlign: 'center', color: '#7b4397', fontSize: 14, opacity: 0.7 }}>
          <span>Tip: Try prompts like "A neon city at night" or "A robot's morning routine"</span>
        </div>
      </aside>
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(120deg, #a6c1ee 0%, #fbc2eb 100%)',
        }}
      >
        <GameCanvas />
      </main>
    </div>
  );
}

export default App;
