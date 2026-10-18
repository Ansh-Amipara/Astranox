import React, { useEffect, useRef } from 'react';
import { getMapById, GameMap, TileType } from '@astranox/game-map';
import { EXPLORATION_CONSTANTS } from '@astranox/constants';
import { Position } from '../store';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MapViewProps {
  mapId: string;
  playerPos: Position;
  className?: string;
}

const TILE_SIZE = 48; // Size of each tile in CSS pixels
const VIEW_W = EXPLORATION_CONSTANTS.VIEWPORT_WIDTH_TILES; // 11 tiles
const VIEW_H = EXPLORATION_CONSTANTS.VIEWPORT_HEIGHT_TILES; // 9 tiles

export const MapView: React.FC<MapViewProps> = ({ mapId, playerPos, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isReducedMotion = useReducedMotion();
  const currentCameraRef = useRef<{ x: number; y: number }>({
    x: playerPos.x * TILE_SIZE,
    y: playerPos.y * TILE_SIZE,
  });

  const map: GameMap | undefined = getMapById(mapId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = VIEW_W * TILE_SIZE;
    const canvasHeight = VIEW_H * TILE_SIZE;

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    let animationFrameId: number;

    const render = () => {
      const targetCamX = playerPos.x * TILE_SIZE;
      const targetCamY = playerPos.y * TILE_SIZE;

      if (isReducedMotion) {
        currentCameraRef.current.x = targetCamX;
        currentCameraRef.current.y = targetCamY;
      } else {
        // Smooth camera lerp
        currentCameraRef.current.x += (targetCamX - currentCameraRef.current.x) * 0.25;
        currentCameraRef.current.y += (targetCamY - currentCameraRef.current.y) * 0.25;
      }

      const camX = currentCameraRef.current.x;
      const camY = currentCameraRef.current.y;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Center camera on viewport
      const offsetX = Math.floor(canvasWidth / 2 - camX - TILE_SIZE / 2);
      const offsetY = Math.floor(canvasHeight / 2 - camY - TILE_SIZE / 2);

      // Draw map tiles
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const screenX = x * TILE_SIZE + offsetX;
          const screenY = y * TILE_SIZE + offsetY;

          // Cull tiles outside visible viewport
          if (
            screenX + TILE_SIZE < 0 ||
            screenX > canvasWidth ||
            screenY + TILE_SIZE < 0 ||
            screenY > canvasHeight
          ) {
            continue;
          }

          const tile = map.tiles[y]?.[x] ?? 'WALL';
          drawTile(ctx, tile, screenX, screenY);
        }
      }

      // Draw player avatar at player's position
      const playerScreenX = playerPos.x * TILE_SIZE + offsetX;
      const playerScreenY = playerPos.y * TILE_SIZE + offsetY;
      drawPlayer(ctx, playerScreenX, playerScreenY, playerPos.facing);

      ctx.restore();

      const dist =
        Math.abs(currentCameraRef.current.x - targetCamX) +
        Math.abs(currentCameraRef.current.y - targetCamY);
      if (!isReducedMotion && dist > 0.5) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [mapId, playerPos.x, playerPos.y, playerPos.facing, isReducedMotion, map]);

  const currentTile: TileType =
    map?.tiles[playerPos.y]?.[playerPos.x] ?? 'WALKABLE';

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-2 bg-background select-none ${className}`}
      role="region"
      aria-label={`Exploration Map: ${map?.name || mapId}. Current position: x ${playerPos.x}, y ${playerPos.y}, tile ${currentTile}`}
    >
      <div className="relative border-2 border-border rounded-2xl overflow-hidden shadow-2xl bg-surface">
        <canvas
          ref={canvasRef}
          data-testid="explore-canvas"
          style={{ width: `${VIEW_W * TILE_SIZE}px`, height: `${VIEW_H * TILE_SIZE}px` }}
          className="block max-w-full w-full h-auto aspect-[11/9] cursor-default touch-none canvas-touch-guard"
          aria-hidden="true"
        />

        {/* HUD Info */}
        <div className="absolute top-3 left-3 bg-surface-raised/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-foreground shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-foreground" />
          <span>{map?.name || mapId}</span>
          <span className="text-muted">
            ({playerPos.x}, {playerPos.y})
          </span>
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        Standing on {currentTile} at coordinate {playerPos.x}, {playerPos.y} facing {playerPos.facing}.
      </div>
    </div>
  );
};

/**
 * Draws crisp monochrome pattern tiles following strict black/white/grey token rules.
 */
function drawTile(ctx: CanvasRenderingContext2D, tile: TileType, x: number, y: number) {
  switch (tile) {
    case 'WALL':
      // Dark grey / black obstacle block with subtle bevel
      ctx.fillStyle = '#18181b'; // zinc-900
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = '#27272a'; // zinc-800
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      // Subtle cross hatch
      ctx.strokeStyle = '#27272a';
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 8);
      ctx.lineTo(x + TILE_SIZE - 8, y + TILE_SIZE - 8);
      ctx.moveTo(x + TILE_SIZE - 8, y + 8);
      ctx.lineTo(x + 8, y + TILE_SIZE - 8);
      ctx.stroke();
      break;

    case 'GRASS':
      // Off-white / light ground with dark grass tufts
      ctx.fillStyle = '#f4f4f5'; // zinc-100
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

      // Draw monochrome grass tufts
      ctx.strokeStyle = '#52525b'; // zinc-600
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Left blade
      ctx.moveTo(x + 14, y + 32);
      ctx.lineTo(x + 10, y + 18);
      // Center blade
      ctx.moveTo(x + 24, y + 34);
      ctx.lineTo(x + 24, y + 14);
      // Right blade
      ctx.moveTo(x + 34, y + 32);
      ctx.lineTo(x + 38, y + 18);
      ctx.stroke();
      break;

    case 'WATER':
      // Light grey water tile with wave ripples
      ctx.fillStyle = '#e4e4e7'; // zinc-200
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

      ctx.strokeStyle = '#71717a'; // zinc-500
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Wave 1
      ctx.arc(x + 16, y + 18, 8, 0, Math.PI);
      ctx.arc(x + 32, y + 18, 8, Math.PI, 0, true);
      // Wave 2
      ctx.arc(x + 16, y + 32, 8, 0, Math.PI);
      ctx.arc(x + 32, y + 32, 8, Math.PI, 0, true);
      ctx.stroke();
      break;

    case 'WARP':
      // Doorway portal tile
      ctx.fillStyle = '#f4f4f5';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x + 8, y + 4, TILE_SIZE - 16, TILE_SIZE - 8);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 12, y + 8, TILE_SIZE - 24, TILE_SIZE - 16);
      break;

    case 'WALKABLE':
    default:
      // Clean white path with fine border
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = '#f4f4f5';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      break;
  }
}

/**
 * Draws player character avatar with direction indicator.
 */
function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
) {
  const cx = x + TILE_SIZE / 2;
  const cy = y + TILE_SIZE / 2;

  // Outer shadow / boundary circle
  ctx.fillStyle = '#18181b'; // zinc-900
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();

  // Inner trainer circle
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();

  // Direction visor / indicator
  ctx.fillStyle = '#18181b';
  let vx = 0;
  let vy = 0;
  switch (facing) {
    case 'UP':
      vy = -8;
      break;
    case 'DOWN':
      vy = 8;
      break;
    case 'LEFT':
      vx = -8;
      break;
    case 'RIGHT':
      vx = 8;
      break;
  }

  ctx.beginPath();
  ctx.arc(cx + vx, cy + vy, 5, 0, Math.PI * 2);
  ctx.fill();
}
