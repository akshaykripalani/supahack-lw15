
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
                e.key === 'Enter' &&
                promptInput &&
                gameState !== 'loading'
              ) {
                startGame(promptInput);
              }
            }}
          />
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
            State: <span style={{ color: gameState === 'playing' ? '#43cea2' : gameState === 'loading' ? '#f7971e' : '#7b4397' }}>{gameState}</span>
          </div>
        </div>
        <div style={{ marginTop: 12, textAlign: 'center', color: '#181818', fontSize: 14, opacity: 0.7 }}>
          <span>Tip: Try prompts like "A neon city at night" or "A robot's morning routine"</span>
        </div>
      </aside>
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f7f5fa',
        }}
      >
        <GameCanvas />
      </main>
    </div>
  );
}

export default App;
