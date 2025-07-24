export interface Brick {
  id: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  destroyed: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Convert a paragraph into sequential bricks. Words wrap to the next line when the
 * accumulated width would exceed `maxRowWidth`.
 * @param paragraph LLM text (≤100 words)
 * @param brickUnit Base width multiplier (≈16 px).
 * @param maxRowWidth Maximum row width in pixels.
 */
export function paragraphToBricks(
  paragraph: string,
  brickUnit = 16,
  maxRowWidth = 760
): Brick[] {
  const words = paragraph.trim().split(/\s+/);
  const bricks: Brick[] = [];

  let xCursor = 0;
  let yCursor = 0;
  const vPad = 2; // vertical padding between rows
  const hPad = 0; // we’ll stretch gaps later for justification

  const justifyRow = (currentY: number) => {
    const rowBricks = bricks.filter((b) => b.y === currentY);
    const count = rowBricks.length;
    if (count === 0) return;

    // Total width occupied by bricks plus minimal gaps (hPad)
    const bricksWidth = rowBricks.reduce((sum, b) => sum + b.width, 0);
    const gaps = count - 1;
    if (gaps === 0) {
      // Single brick row: left-align
      rowBricks[0].x = 0;
      return;
    }

    const totalGap = maxRowWidth - bricksWidth;
    const gapSize = totalGap / gaps; // stretch each gap equally (float)

    let cursor = 0;
    rowBricks.forEach((b, idx) => {
      b.x = cursor;
      cursor += b.width + gapSize;
      // Ensure last brick flushes to right edge (fix rounding)
      if (idx === rowBricks.length - 1) {
        b.x = maxRowWidth - b.width;
      }
    });
  };

  words.forEach((word, index) => {
    const length = word.length;
    const width = clamp(length, 2, 12) * brickUnit;
    const height = brickUnit;

    if (xCursor + width > maxRowWidth) {
      justifyRow(yCursor);
      xCursor = 0;
      yCursor += height + vPad;
    }

    const hue = hashString(word) % 360;
    const color = `hsl(${hue} 70% 50%)`;

    bricks.push({
      id: index,
      text: word,
      x: xCursor,
      y: yCursor,
      width,
      height,
      color,
      destroyed: false,
    });

    xCursor += width + hPad;
  });

  // justify last row as well (optional: leave as is if single brick)
  justifyRow(yCursor);

  return bricks;
} 