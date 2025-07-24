import { create } from 'zustand';
import type { Brick } from '../utils/brick';
import { paragraphToBricks } from '../utils/brick';
import { fetchLayout } from '../api/layout';

type GameState = 'idle' | 'loading' | 'running' | 'over';

interface GameStore {
  bricks: Brick[];
  prompt: string;
  score: number;
  destroyed: number;
  totalBricks: number;
  startTime: number | null;
  gameState: GameState;
  startGame: (prompt: string) => Promise<void>;
  destroyBrick: (id: number) => void;
  endGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  bricks: [],
  prompt: '',
  score: 0,
  destroyed: 0,
  totalBricks: 0,
  startTime: null,
  gameState: 'idle',

  startGame: async (prompt: string) => {
    set({ gameState: 'loading', prompt });
    try {
      const paragraph = await fetchLayout(prompt);
      const bricks = paragraphToBricks(paragraph, 16, 800);
      set({
        bricks,
        totalBricks: bricks.length,
        destroyed: 0,
        score: 0,
        startTime: performance.now(),
        gameState: 'running',
      });
    } catch (err) {
      console.error(err);
      set({ gameState: 'idle' });
    }
  },

  destroyBrick: (id: number) => {
    const { bricks, destroyed, totalBricks } = get();
    const idx = bricks.findIndex((b) => b.id === id);
    if (idx === -1 || bricks[idx].destroyed) return;

    const newBricks = bricks.slice();
    newBricks[idx] = { ...newBricks[idx], destroyed: true };
    const newDestroyed = destroyed + 1;
    const score = Math.round((100 * newDestroyed) / totalBricks);

    set({ bricks: newBricks, destroyed: newDestroyed, score });

    if (newDestroyed === totalBricks) {
      get().endGame();
    }
  },

  endGame: () => {
    const elapsedMs = performance.now() - (get().startTime ?? performance.now());
    set({ gameState: 'over' });
    console.log('Game over', { score: get().score, elapsedMs });
    // TODO: Submit to Supabase leaderboard
  },
})); 