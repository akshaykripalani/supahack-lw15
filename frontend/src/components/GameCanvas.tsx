import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/game';
import type { Brick } from '../utils/brick';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 12;
const PADDLE_Y = CANVAS_HEIGHT - 40;
const BALL_RADIUS = 8;
const BALL_SPEED = 4;

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Zustand bindings
  const bricks = useGameStore((s) => s.bricks);
  const gameState = useGameStore((s) => s.gameState);
  const destroyBrick = useGameStore((s) => s.destroyBrick);
  const endGame = useGameStore((s) => s.endGame);

  // Persistent refs for paddle and ball state (avoid rerenders)
  const paddleX = useRef((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
  const ballPos = useRef({ x: CANVAS_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS - 2 });
  const ballVel = useRef({ x: 3, y: -3 });

  // Draw helper
  const drawFrame = (ctx: CanvasRenderingContext2D, bricksToRender: Brick[]) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bricks
    bricksToRender.forEach((brick) => {
      if (brick.destroyed) return;
      // Filled background with 25% opacity
      ctx.fillStyle = brick.color.replace(')', ' / 0.25)');
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

      // Border
      ctx.strokeStyle = brick.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);

      // Word text (centered)
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(brick.text, brick.x + brick.width / 2, brick.y + brick.height / 2);
    });

    // Draw paddle
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddleX.current, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballPos.current.x, ballPos.current.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
  };

  const bricksRef = useRef<Brick[]>(bricks);

  useEffect(() => {
    bricksRef.current = bricks;
  }, [bricks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (gameState !== 'running') {
      // Clear canvas when not running
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

    let animationId: number;

    // Auto focus canvas for keyboard
    canvas.tabIndex = 0;
    canvas.focus();

    // Keyboard controls
    const leftPressed = { current: false };
    const rightPressed = { current: false };

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

    const stepLoop = () => {
      // Continuous paddle movement
      const paddleSpeed = 6;
      if (leftPressed.current) paddleX.current = Math.max(0, paddleX.current - paddleSpeed);
      if (rightPressed.current) paddleX.current = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddleX.current + paddleSpeed);

      // Update ball position
      ballPos.current.x += ballVel.current.x;
      ballPos.current.y += ballVel.current.y;

      // Wall collisions
      if (ballPos.current.x - BALL_RADIUS < 0 || ballPos.current.x + BALL_RADIUS > CANVAS_WIDTH) {
        ballVel.current.x *= -1;
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
        ballVel.current.x = hitPos * 4;
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

      // Floor collision → game over
      if (ballPos.current.y - BALL_RADIUS > CANVAS_HEIGHT) {
        endGame();
        return; // stop loop
      }

      // Ensure ball speed constant
      const mag = Math.hypot(ballVel.current.x, ballVel.current.y);
      ballVel.current.x = (ballVel.current.x / mag) * BALL_SPEED;
      ballVel.current.y = (ballVel.current.y / mag) * BALL_SPEED;

      drawFrame(ctx, bricksRef.current);
      animationId = requestAnimationFrame(stepLoop);
    };

    // Reset paddle & ball positions at start of run
    paddleX.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    ballPos.current = { x: CANVAS_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS - 2 };
    ballVel.current = { x: BALL_SPEED, y: -BALL_SPEED };

    drawFrame(ctx, bricksRef.current);
    animationId = requestAnimationFrame(stepLoop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ border: '1px solid #ccc', background: '#000' }}
    />
  );
}; 