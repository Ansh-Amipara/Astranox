import React, { useEffect, useRef, useState } from 'react';
import { GameLoop } from '../../engine/core/GameLoop';
import { Camera } from '../../engine/core/Camera';
import { InputManager } from '../../engine/systems/InputManager';
import { RenderManager } from '../../engine/systems/RenderManager';
import { Player } from '../../engine/entities/Player';
import { EncounterManager } from '../../engine/systems/EncounterManager';

interface GameCanvasProps {
  mapImageUrl: string;
  hasSpawns: boolean;
  startX?: number;
  startY?: number;
  onEncounter: () => void;
  onSavePosition: (x: number, y: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  mapImageUrl, 
  hasSpawns, 
  startX = 400, 
  startY = 400, 
  onEncounter,
  onSavePosition
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    
    // Core Systems
    const gameLoop = new GameLoop();
    const camera = new Camera();
    const input = new InputManager();
    const renderer = new RenderManager(canvas);
    
    // Entities
    const player = new Player(startX, startY);
    
    // State
    let isTransitioning = false;
    
    const triggerEncounter = () => {
      isTransitioning = true;
      setIsFading(true);
      
      // Save position before entering battle
      onSavePosition(player.x, player.y);
      
      // Wait for fade transition before invoking parent callback
      setTimeout(() => {
        onEncounter();
      }, 1000);
    };

    const encounters = new EncounterManager(triggerEncounter);

    // Initial resize
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        renderer.resize(width, height);
        camera.setViewport(width, height);
      }
    });
    resizeObserver.observe(containerRef.current);

    // Load Map
    renderer.loadMapImage(mapImageUrl, (width, height) => {
      camera.setBounds(width, height);
      player.setBounds(width, height);
      
      // Hook up game loop
      gameLoop.update = (dt) => {
        if (isTransitioning) return; // Freeze engine during transitions
        
        const dir = input.getMovementDirection();
        
        const oldX = player.x;
        const oldY = player.y;
        
        player.update(dt, dir);
        
        const distanceWalked = Math.abs(player.x - oldX) + Math.abs(player.y - oldY);
        if (distanceWalked > 0) {
          encounters.updateDistance(distanceWalked, hasSpawns);
        }

        camera.follow(player.x, player.y);
      };

      gameLoop.render = () => {
        renderer.clear();
        renderer.drawMap(camera.x, camera.y);
        player.render(renderer.getContext(), camera.x, camera.y);
      };

      gameLoop.start();
    });

    return () => {
      gameLoop.stop();
      input.destroy();
      resizeObserver.disconnect();
      // Save position when unmounting (e.g. going back to map view)
      if (!isTransitioning) {
        onSavePosition(player.x, player.y);
      }
    };
  }, [mapImageUrl, hasSpawns]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full image-rendering-pixelated"
      />
      
      {/* Encounter Flash / Fade Transition */}
      <div 
        className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-1000 ${
          isFading ? 'opacity-100' : 'opacity-0'
        }`} 
      />
    </div>
  );
};
