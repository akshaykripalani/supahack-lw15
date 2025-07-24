import { create } from 'zustand';
import type { Brick } from '../utils/brick';
import { paragraphToBricks } from '../utils/brick';
import { fetchLayout } from '../api/layout';
import { submitScore } from '../api/leaderboard';

type GameState = 'idle' | 'loading' | 'animating' | 'running' | 'over';

interface GameStore {
  bricks: Brick[];
  prompt: string;
  score: number;
  destroyed: number;
  totalBricks: number;
  startTime: number | null;
  lives: number;
  gameState: GameState;
  animationIndex: number; // index of next brick to reveal
  startGame: (prompt: string) => Promise<void>;
  destroyBrick: (id: number) => void;
  revealNext: () => void;
  endGame: () => void;
  loseLife: () => void;
  username: string;
  setUsername: (name: string) => void;
  devWin: () => void;
  submitCurrentScore: (username: string) => Promise<void>;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  paused: boolean;
  togglePause: () => void;
  hasSubmitted: boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  bricks: [],
  prompt: '',
  score: 0,
  destroyed: 0,
  totalBricks: 0,
  startTime: null,
  lives: 3,
  gameState: 'idle',
  animationIndex: 0,
  username: '',
  isModalOpen: false,
  paused: false,
  hasSubmitted: false,

  startGame: async (prompt: string) => {
    set({ gameState: 'loading', prompt, hasSubmitted: false, isModalOpen: false });
    try {
      const paragraph = await fetchLayout(prompt);
      const bricks = paragraphToBricks(paragraph, 16, 800, 50);
      set({
        bricks,
        totalBricks: bricks.length,
        destroyed: 0,
        score: 0,
        startTime: performance.now(),
        lives: 3,
        animationIndex: 0,
        gameState: 'animating',
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

  revealNext: () => {
    const { animationIndex, bricks } = get();
    if (animationIndex >= bricks.length) return;
    const updated = bricks.slice();
    updated[animationIndex] = { ...updated[animationIndex], visible: true };
    set({ bricks: updated, animationIndex: animationIndex + 1 });

    if (animationIndex + 1 === bricks.length) {
      // animation finished
      set({ gameState: 'running' });
    }
  },

  loseLife: () => {
    const { lives } = get();
    if (lives > 1) {
      set({ lives: lives - 1 });
      // Game will reset paddle/ball, bricks remain as-is
    } else {
      get().endGame();
    }
  },

  setUsername: (name: string) => set({ username: name }),

  devWin: async () => {
    set({ hasSubmitted: false });
    const randomScore = Math.floor(Math.random() * 101);
    const randomElapsed = (60 + Math.floor(Math.random() * 120)) * 1000; // 1–3 min in ms
    const now = performance.now();
    set({
      score: randomScore,
      startTime: now - randomElapsed,
      gameState: 'over',
    });
    get().openModal();
  },

  endGame: () => {
    const { startTime } = get();
    const elapsedMs = performance.now() - (startTime ?? performance.now());
    set({ gameState: 'over' });
    console.log('Game over', { elapsedMs });
  },

  submitCurrentScore: async (username: string) => {
    const { score, startTime, hasSubmitted } = get();
    if (hasSubmitted) {
      console.warn('Score already submitted');
      return;
    }
    const elapsedMs = performance.now() - (startTime ?? performance.now());
    try {
      await submitScore(username, score, Math.round(elapsedMs));
      set({ hasSubmitted: true });
    } catch (err) {
      console.error(err);
    }
  },

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  togglePause: () => set((state) => ({ paused: !state.paused })),
})); 