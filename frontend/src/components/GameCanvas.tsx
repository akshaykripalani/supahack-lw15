import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/game';
import type { Brick } from '../utils/brick';
import { SubmitLeaderboardModal } from './SubmitLeaderboardModal';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 140; // wider paddle
const PADDLE_HEIGHT = 18; // thicker paddle
const BOTTOM_MARGIN = 36; // 10% reduction from 40px
const PADDLE_Y = CANVAS_HEIGHT - BOTTOM_MARGIN;
const BALL_RADIUS = 8;
const BASE_BALL_SPEED = 7; // 10% slower than previous 8
const MAX_BALL_SPEED = 7;
const MIN_BALL_X_SPEED = 1; // avoid perfectly vertical trajectories

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Zustand bindings
  const bricks = useGameStore((s) => s.bricks);
  const gameState = useGameStore((s) => s.gameState);
  const revealNext = useGameStore((s) => s.revealNext);
  const destroyBrick = useGameStore((s) => s.destroyBrick);
  const loseLife = useGameStore((s) => s.loseLife);
  // fetch fresh lives each render inside loop
  // endGame currently handled through loseLife

  // Persistent refs for paddle and ball state (avoid rerenders)
  const paddleX = useRef((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
  const ballPos = useRef({ x: CANVAS_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS - 2 });
  const ballVel = useRef({ x: 3, y: -BASE_BALL_SPEED });

  // Draw helper
  // Draw helper
  const drawFrame = (ctx: CanvasRenderingContext2D, bricksToRender: Brick[]) => {
    // Draw solid background
    ctx.fillStyle = '#232526';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bricks with solid color and rounded corners
    bricksToRender.forEach((brick) => {
      if (brick.destroyed) return;
      if (!brick.visible) return;
      ctx.save();
      // Brick fill (solid)
      ctx.fillStyle = brick.color;
      roundRect(ctx, brick.x, brick.y, brick.width, brick.height, 7);
      ctx.fill();
      // Border
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#222';
      roundRect(ctx, brick.x, brick.y, brick.width, brick.height, 7);
      ctx.stroke();
      // Word text (centered, bold, no shadow)
      ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(brick.text, brick.x + brick.width / 2, brick.y + brick.height / 2);
      ctx.restore();
    });

    // Draw paddle (solid color)
    ctx.save();
    ctx.fillStyle = '#a18cd1';
    roundRect(ctx, paddleX.current, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT, 8);
    ctx.fill();
    ctx.restore();

    // Draw ball (solid color)
    ctx.save();
    ctx.beginPath();
    ctx.arc(ballPos.current.x, ballPos.current.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  };

  // Helper for rounded rectangles
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  const bricksRef = useRef<Brick[]>(bricks);

  useEffect(() => {
    bricksRef.current = bricks;
  }, [bricks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (gameState === 'animating') {
      // stream in bricks
      const timer = setInterval(() => {
        revealNext();
      }, 40);

      const animDraw = () => {
        drawFrame(ctx, bricksRef.current);
        if (useGameStore.getState().gameState === 'animating') {
          requestAnimationFrame(animDraw);
        }
      };
      animDraw();

      return () => clearInterval(timer);
    }

    if (gameState !== 'running') {
      // Draw background
      ctx.fillStyle = '#232526';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (gameState === 'over') {
        // Draw Game Over message
        ctx.font = 'bold 40px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

        // Show score if available
        const totalBricks = bricksRef.current.length;
        const destroyedBricks = bricksRef.current.filter(b => b.destroyed).length;
        const percent = totalBricks > 0 ? Math.round((destroyedBricks / totalBricks) * 100) : 0;
        ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#a18cd1';
        ctx.fillText(`Score: ${percent}%`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

        ctx.font = '20px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText('Press Start / Restart to play again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
      } else {
        // Show welcome/instruction message
        ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText('LLM Breakout', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
        ctx.font = '22px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#a18cd1';
        ctx.fillText('Enter a prompt and press Start to play!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      }
      ctx.restore();
      return;
    }

    let animationId: number;

    // Auto focus canvas for keyboard
    canvas.tabIndex = 0;
    canvas.focus();

    // Keyboard controls
    const leftPressed = { current: false };
    const rightPressed = { current: false };

    const getLives = () => useGameStore.getState().lives;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') leftPressed.current = true;
      if (e.key === 'ArrowRight') rightPressed.current = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') leftPressed.current = false;
      if (e.key === 'ArrowRight') rightPressed.current = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Track time between frames so movement is time-based not frame-based.
    const lastTimeRef = { current: performance.now() };

    const stepLoop = (now: number) => {
      // Convert the time delta to a scale factor relative to 60 fps so the
      // existing velocity values (measured in px per 60 fps frame) continue to
      // work unchanged.
      const dt = (now - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = now;
      const frameScale = dt * 60; // 1.0 when running at 60 fps, <1 on high-fps

      if (!useGameStore.getState().paused) {
        // Continuous paddle movement
        const paddleSpeed = 6; // px per 60 fps frame (legacy units)
        if (leftPressed.current)
          paddleX.current = Math.max(0, paddleX.current - paddleSpeed * frameScale);
        if (rightPressed.current)
          paddleX.current = Math.min(
            CANVAS_WIDTH - PADDLE_WIDTH,
            paddleX.current + paddleSpeed * frameScale,
          );

        // Update ball position (legacy units → scale by frameScale)
        ballPos.current.x += ballVel.current.x * frameScale;
        ballPos.current.y += ballVel.current.y * frameScale;
      }

      // Wall collisions (left / right)
      if (ballPos.current.x - BALL_RADIUS < 0) {
        ballPos.current.x = BALL_RADIUS; // nudge inside the canvas
        ballVel.current.x = Math.max(Math.abs(ballVel.current.x), MIN_BALL_X_SPEED);
      } else if (ballPos.current.x + BALL_RADIUS > CANVAS_WIDTH) {
        ballPos.current.x = CANVAS_WIDTH - BALL_RADIUS;
        ballVel.current.x = -Math.max(Math.abs(ballVel.current.x), MIN_BALL_X_SPEED);
      }
      if (ballPos.current.y - BALL_RADIUS < 0) {
        ballVel.current.y *= -1;
      }

      // Paddle collision
      if (
        ballPos.current.y + BALL_RADIUS >= PADDLE_Y &&
        ballPos.current.x >= paddleX.current &&
        ballPos.current.x <= paddleX.current + PADDLE_WIDTH &&
        ballVel.current.y > 0
      ) {
        ballVel.current.y *= -1;

        // Add some x-variation based on hit position
        const hitPos = (ballPos.current.x - (paddleX.current + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        let newX = hitPos * 4;
        // Ensure some horizontal component so the ball doesn’t get stuck bouncing vertically
        if (Math.abs(newX) < MIN_BALL_X_SPEED) {
          newX = newX >= 0 ? MIN_BALL_X_SPEED : -MIN_BALL_X_SPEED;
        }
        ballVel.current.x = newX;
      }

      // Brick collisions (simple AABB check)
      for (const brick of bricksRef.current) {
        if (brick.destroyed) continue;
        if (
          ballPos.current.x + BALL_RADIUS > brick.x &&
          ballPos.current.x - BALL_RADIUS < brick.x + brick.width &&
          ballPos.current.y + BALL_RADIUS > brick.y &&
          ballPos.current.y - BALL_RADIUS < brick.y + brick.height
        ) {
          destroyBrick(brick.id);
          ballVel.current.y *= -1;
          break;
        }
      }

      // Floor collision → lose life or game over
      if (ballPos.current.y - BALL_RADIUS > CANVAS_HEIGHT) {
        const currentLives = getLives();
        loseLife();

        if (currentLives - 1 > 0) {
          // reset ball & paddle positions and relaunch straight up
          paddleX.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
          ballPos.current = { x: CANVAS_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS - 2 };
          ballVel.current = { x: 0, y: -BASE_BALL_SPEED };
          drawFrame(ctx, bricksRef.current);
          animationId = requestAnimationFrame(stepLoop);
          return;
        }
        // if no lives left, endGame already handled
        return;
      }

      // Ensure ball speed constant
      const mag = Math.hypot(ballVel.current.x, ballVel.current.y);
      ballVel.current.x = (ballVel.current.x / mag) * MAX_BALL_SPEED;
      ballVel.current.y = (ballVel.current.y / mag) * MAX_BALL_SPEED;

      // Guard against near-zero horizontal velocity that would cause wall sticking
      if (Math.abs(ballVel.current.x) < MIN_BALL_X_SPEED) {
        ballVel.current.x = (Math.random() < 0.5 ? -1 : 1) * MIN_BALL_X_SPEED;
        const mag2 = Math.hypot(ballVel.current.x, ballVel.current.y);
        ballVel.current.x = (ballVel.current.x / mag2) * MAX_BALL_SPEED;
        ballVel.current.y = (ballVel.current.y / mag2) * MAX_BALL_SPEED;
      }

      drawFrame(ctx, bricksRef.current);

      // Draw lives hearts top-left
      ctx.save();
      const livesNow = getLives();
      const heartRadius = 6;
      const spacing = 18;
      for (let i = 0; i < livesNow; i++) {
        const cx = 20 + i * spacing;
        const cy = 20;
        ctx.beginPath();
        ctx.arc(cx - heartRadius / 2, cy, heartRadius, 0, Math.PI * 2);
        ctx.arc(cx + heartRadius / 2, cy, heartRadius, 0, Math.PI * 2);
        ctx.lineTo(cx, cy + heartRadius);
        ctx.closePath();
        ctx.fillStyle = '#ff4d6d';
        ctx.fill();
      }
      ctx.restore();

      animationId = requestAnimationFrame(stepLoop);

      // If paused, overlay text
      if (useGameStore.getState().paused) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Paused', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.restore();
      }
    };

    // Reset paddle & ball positions at start of run or life
    paddleX.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    ballPos.current = { x: CANVAS_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS - 2 };
    ballVel.current = { x: 0, y: -BASE_BALL_SPEED };

    drawFrame(ctx, bricksRef.current);
    // Seed the first frame with the timestamp that requestAnimationFrame passes.
    animationId = requestAnimationFrame(stepLoop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [gameState]);

  const isModalOpen = useGameStore((s) => s.isModalOpen);
  const openModal = useGameStore((s) => s.openModal);
  const hasSubmitted = useGameStore((s) => s.hasSubmitted);
  const paused = useGameStore((s) => s.paused);
  const togglePause = useGameStore((s) => s.togglePause);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          borderRadius: 18,
          boxShadow: '0 8px 32px 0 rgba(161,140,209,0.18)',
          border: '2.5px solid #a18cd1',
          background: 'transparent',
          outline: 'none',
          margin: 0,
          display: 'block',
        }}
        tabIndex={0}
      />

      {gameState === 'over' && !isModalOpen && !hasSubmitted && (
        <button
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 30,
            transform: 'translateX(-50%)',
            padding: '12px 20px',
            background: '#43cea2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          onClick={openModal}
        >
          Submit to Leaderboard
        </button>
      )}

      {gameState === 'running' && (
        <button
          style={{
            position: 'absolute',
            right: 16,
            top: 16,
            padding: '6px 10px',
            background: '#a18cd1',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}
          onClick={togglePause}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      )}

      {isModalOpen && <SubmitLeaderboardModal />}
    </div>
  );
}; 