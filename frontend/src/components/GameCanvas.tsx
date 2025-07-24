import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/game';
import type { Brick } from '../utils/brick';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 12;
const PADDLE_Y = CANVAS_HEIGHT - 40;
const BALL_RADIUS = 8;
const BASE_BALL_SPEED = 8;
const MAX_BALL_SPEED = 8;

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
  // Draw solid background
  ctx.fillStyle = '#232526';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw bricks with solid color and rounded corners
  bricksToRender.forEach((brick) => {
    if (brick.destroyed) return;
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

    if (gameState !== 'running') {
      // Draw background
      ctx.fillStyle = '#232526';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (gameState === 'ended') {
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


      // Calculate percentage completed
      const totalBricks = bricksRef.current.length;
      const destroyedBricks = bricksRef.current.filter(b => b.destroyed).length;
      const percentComplete = totalBricks > 0 ? destroyedBricks / totalBricks : 0;
      // Ball speed increases linearly from BASE_BALL_SPEED to MAX_BALL_SPEED
      const currentBallSpeed = BASE_BALL_SPEED + (MAX_BALL_SPEED - BASE_BALL_SPEED) * percentComplete;

      // Ensure ball speed constant
      const mag = Math.hypot(ballVel.current.x, ballVel.current.y);
      ballVel.current.x = (ballVel.current.x / mag) * currentBallSpeed;
      ballVel.current.y = (ballVel.current.y / mag) * currentBallSpeed;

      drawFrame(ctx, bricksRef.current);
      animationId = requestAnimationFrame(stepLoop);
    };

    // Reset paddle & ball positions at start of run
    paddleX.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    ballPos.current = { x: CANVAS_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS - 2 };
    ballVel.current = { x: BASE_BALL_SPEED, y: -BASE_BALL_SPEED };

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
  );
}; 