import { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { useGameStore } from './store/game';

function App() {
  const [promptInput, setPromptInput] = useState('');
  const startGame = useGameStore((s) => s.startGame);
  const gameState = useGameStore((s) => s.gameState);
  const score = useGameStore((s) => s.score);

  return (
    <div style={{ display: 'flex', height: '100vh', gap: 16 }}>
      <aside style={{ width: 300, padding: 16, borderRight: '1px solid #ddd' }}>
        <h2>LLM Breakout</h2>
        <input
          style={{ width: '100%', marginBottom: 8, padding: 4 }}
          placeholder="Enter a prompt"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
        />
        <button
          style={{ width: '100%', padding: 8 }}
          onClick={() => startGame(promptInput)}
          disabled={!promptInput || gameState === 'loading'}
        >
          {gameState === 'loading' ? 'Loading…' : 'Start / Restart'}
        </button>

        <div style={{ marginTop: 16 }}>
          <p>Score: {score}%</p>
          <p>State: {gameState}</p>
        </div>
      </aside>
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <GameCanvas />
      </main>
    </div>
  );
}

export default App;
