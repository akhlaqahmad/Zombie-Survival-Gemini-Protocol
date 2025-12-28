
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Player, Zombie, Bullet, Pickup, StageInfo, Briefing, SaveData } from './types';
import { STAGES, COLORS, CANVAS_WIDTH, CANVAS_HEIGHT, WEAPONS, SPRITES } from './constants';
import { getBriefing } from './services/geminiService';
import { audio } from './services/audioService';
import { GameUI } from './components/GameUI';

const SAVE_KEY = 'gemini_protocol_save';

interface Decal {
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const floorCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [hasSave, setHasSave] = useState(false);
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: 15,
    color: COLORS.PLAYER,
    hp: 100,
    maxHp: 100,
    speed: 4,
    ammo: 40,
    maxAmmo: 40,
    score: 0,
    level: 1,
    weapon: 'PISTOL'
  });

  const spritesRef = useRef<Record<string, HTMLImageElement>>({});
  const zombiesRef = useRef<Zombie[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const pickupsRef = useRef<Pickup[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastFireTimeRef = useRef(0);
  const zombiesSpawnedRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);
  const frameRef = useRef(0);
  const requestRef = useRef<number>();

  const currentStage = STAGES[currentStageIdx];

  // Preload Sprites
  useEffect(() => {
    Object.entries(SPRITES).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      spritesRef.current[key] = img;
    });

    // Setup Floor Canvas
    const floor = floorCanvasRef.current;
    floor.width = CANVAS_WIDTH;
    floor.height = CANVAS_HEIGHT;
    const fctx = floor.getContext('2d');
    if (fctx) {
      fctx.fillStyle = COLORS.BACKGROUND;
      fctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, []);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) setHasSave(true);
  }, []);

  const saveGame = useCallback(() => {
    const data: SaveData = {
      stageIdx: currentStageIdx,
      score: playerRef.current.score,
      weapon: playerRef.current.weapon,
      maxAmmo: playerRef.current.maxAmmo,
      maxHp: playerRef.current.maxHp
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    setHasSave(true);
  }, [currentStageIdx]);

  const loadGame = () => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data: SaveData = JSON.parse(saved);
      setCurrentStageIdx(data.stageIdx);
      playerRef.current.score = data.score;
      playerRef.current.weapon = data.weapon;
      playerRef.current.maxAmmo = data.maxAmmo;
      playerRef.current.maxHp = data.maxHp;
      startBriefingFromSave(data.stageIdx);
    }
  };

  const startBriefingFromSave = async (idx: number) => {
    audio.init();
    setGameState('BRIEFING');
    const b = await getBriefing(STAGES[idx].id, STAGES[idx].name);
    setBriefing(b);
  };

  const startBriefing = async () => {
    audio.init();
    setGameState('BRIEFING');
    const b = await getBriefing(currentStage.id, currentStage.name);
    setBriefing(b);
  };

  const startLevel = () => {
    audio.startMusic('low');
    setGameState('PLAYING');
    zombiesRef.current = [];
    bulletsRef.current = [];
    pickupsRef.current = [];
    particlesRef.current = [];
    zombiesSpawnedRef.current = 0;
    lastSpawnTimeRef.current = Date.now();
    playerRef.current.hp = playerRef.current.maxHp;
    playerRef.current.ammo = playerRef.current.maxAmmo;
    
    // Clear floor canvas for new level
    const fctx = floorCanvasRef.current.getContext('2d');
    if (fctx) {
      fctx.fillStyle = COLORS.BACKGROUND;
      fctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    saveGame();
  };

  const addBlood = (x: number, y: number, amount: number) => {
    const fctx = floorCanvasRef.current.getContext('2d');
    if (!fctx) return;
    for (let i = 0; i < amount; i++) {
      fctx.fillStyle = COLORS.BLOOD;
      fctx.globalAlpha = 0.3 + Math.random() * 0.4;
      fctx.beginPath();
      const sx = x + (Math.random() - 0.5) * 40;
      const sy = y + (Math.random() - 0.5) * 40;
      fctx.arc(sx, sy, Math.random() * 8 + 2, 0, Math.PI * 2);
      fctx.fill();
    }
    fctx.globalAlpha = 1.0;
  };

  const addParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 30 + Math.random() * 20,
        color
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        mouseRef.current = {
          x: (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width),
          y: (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height)
        };
      }
    };
    const handleMouseDown = () => keysRef.current.add('mousedown');
    const handleMouseUp = () => keysRef.current.delete('mousedown');

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const spawnZombie = useCallback(() => {
    const type = currentStage.types[Math.floor(Math.random() * currentStage.types.length)];
    let z: Zombie = {
      x: 0, y: 0, radius: 15, color: COLORS.ZOMBIE_NORMAL,
      hp: 20, speed: 1.5, damage: 0.5, type: 'NORMAL'
    };

    if (type === 'FAST') {
      z = { ...z, radius: 12, color: COLORS.ZOMBIE_FAST, hp: 10, speed: 3.8, type: 'FAST' };
    } else if (type === 'TANK') {
      z = { ...z, radius: 25, color: COLORS.ZOMBIE_TANK, hp: 180, speed: 0.8, type: 'TANK', damage: 1.8 };
    } else if (type === 'EXPLODER') {
      z = { ...z, radius: 18, color: COLORS.ZOMBIE_EXPLODER, hp: 15, speed: 2.5, type: 'EXPLODER', damage: 0 };
    } else if (type === 'BOSS') {
      z = { ...z, radius: 50, color: COLORS.ZOMBIE_BOSS, hp: 2000, speed: 1.4, type: 'BOSS', damage: 3.0 };
    }

    const side = Math.floor(Math.random() * 4);
    if (side === 0) { z.x = Math.random() * CANVAS_WIDTH; z.y = -z.radius; }
    else if (side === 1) { z.x = CANVAS_WIDTH + z.radius; z.y = Math.random() * CANVAS_HEIGHT; }
    else if (side === 2) { z.x = Math.random() * CANVAS_WIDTH; z.y = CANVAS_HEIGHT + z.radius; }
    else { z.x = -z.radius; z.y = Math.random() * CANVAS_HEIGHT; }

    zombiesRef.current.push(z);
    zombiesSpawnedRef.current++;
  }, [currentStage]);

  const shoot = () => {
    const now = Date.now();
    const player = playerRef.current;
    const weapon = WEAPONS[player.weapon];
    
    if (now - lastFireTimeRef.current < weapon.fireRate || player.ammo < weapon.ammoPerShot) return;

    audio.playShoot(player.weapon);
    setMuzzleFlash(true);
    setTimeout(() => setMuzzleFlash(false), 50);
    
    const dx = mouseRef.current.x - player.x;
    const dy = mouseRef.current.y - player.y;
    const angle = Math.atan2(dy, dx);
    
    for (let i = 0; i < weapon.pellets; i++) {
      const spreadAngle = angle + (Math.random() - 0.5) * weapon.spread;
      bulletsRef.current.push({
        x: player.x + Math.cos(angle) * player.radius,
        y: player.y + Math.sin(angle) * player.radius,
        radius: 3,
        color: COLORS.BULLET,
        dx: Math.cos(spreadAngle) * 16,
        dy: Math.sin(spreadAngle) * 16,
        speed: 16,
        damage: weapon.damage
      });
    }

    player.ammo -= weapon.ammoPerShot;
    lastFireTimeRef.current = now;
  };

  const triggerExplosion = (x: number, y: number, radius: number, damage: number) => {
    audio.playExplosion();
    addBlood(x, y, 15);
    addParticles(x, y, COLORS.ZOMBIE_EXPLODER, 30);
    
    zombiesRef.current.forEach(z => {
      const dist = Math.sqrt((z.x - x) ** 2 + (z.y - y) ** 2);
      if (dist < radius) z.hp -= damage;
    });
    const player = playerRef.current;
    const pDist = Math.sqrt((player.x - x) ** 2 + (player.y - y) ** 2);
    if (pDist < radius) player.hp -= damage * 2;
  };

  const update = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    const player = playerRef.current;
    frameRef.current++;
    
    if (keysRef.current.has('w')) player.y -= player.speed;
    if (keysRef.current.has('s')) player.y += player.speed;
    if (keysRef.current.has('a')) player.x -= player.speed;
    if (keysRef.current.has('d')) player.x += player.speed;

    player.x = Math.max(player.radius, Math.min(CANVAS_WIDTH - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(CANVAS_HEIGHT - player.radius, player.y));

    if (keysRef.current.has('mousedown')) shoot();

    const now = Date.now();
    if (zombiesSpawnedRef.current < currentStage.zombieCount && now - lastSpawnTimeRef.current > currentStage.spawnRate) {
      spawnZombie();
      lastSpawnTimeRef.current = now;
    }

    // Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // Bullets
    bulletsRef.current = bulletsRef.current.filter(b => {
      b.x += b.dx;
      b.y += b.dy;
      return b.x > 0 && b.x < CANVAS_WIDTH && b.y > 0 && b.y < CANVAS_HEIGHT;
    });

    // Zombies
    zombiesRef.current.forEach(z => {
      const dx = player.x - z.x;
      const dy = player.y - z.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      z.x += (dx / dist) * z.speed;
      z.y += (dy / dist) * z.speed;

      if (dist < player.radius + z.radius) {
        if (z.type === 'EXPLODER') {
          z.hp = 0;
        } else {
          player.hp -= z.damage;
          if (Math.random() < 0.1) {
            audio.playHit();
            addBlood(player.x, player.y, 1);
          }
        }
      }
    });

    bulletsRef.current.forEach((b, bIdx) => {
      zombiesRef.current.forEach((z, zIdx) => {
        const dx = b.x - z.x;
        const dy = b.y - z.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < b.radius + z.radius) {
          z.hp -= b.damage;
          addBlood(z.x, z.y, 1);
          addParticles(z.x, z.y, COLORS.BLOOD, 3);
          bulletsRef.current.splice(bIdx, 1);
        }
      });
    });

    zombiesRef.current = zombiesRef.current.filter(z => {
      if (z.hp <= 0) {
        if (z.type === 'EXPLODER') {
          triggerExplosion(z.x, z.y, 100, 20);
        } else {
          audio.playZombieDeath();
          addBlood(z.x, z.y, 8);
          addParticles(z.x, z.y, COLORS.BLOOD, 10);
        }
        
        player.score += (z.type === 'BOSS' ? 1000 : z.type === 'TANK' ? 100 : 20);
        
        const roll = Math.random();
        if (roll < 0.18) {
          pickupsRef.current.push({
            x: z.x, y: z.y, radius: 10,
            type: roll < 0.05 ? 'AMMO' : roll < 0.09 ? 'HEALTH' : roll < 0.13 ? 'WEAPON_SHOTGUN' : 'WEAPON_SMG',
            color: ''
          });
        }
        return false;
      }
      return true;
    });

    pickupsRef.current = pickupsRef.current.filter(p => {
      const dx = player.x - p.x;
      const dy = player.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < player.radius + p.radius) {
        audio.playPickup();
        if (p.type === 'AMMO') player.ammo = Math.min(player.maxAmmo, player.ammo + 20);
        if (p.type === 'HEALTH') player.hp = Math.min(player.maxHp, player.hp + 30);
        if (p.type === 'WEAPON_SHOTGUN') player.weapon = 'SHOTGUN';
        if (p.type === 'WEAPON_SMG') player.weapon = 'SMG';
        return false;
      }
      return true;
    });

    if (player.hp <= 0) {
      audio.stopMusic();
      setGameState('GAME_OVER');
    }

    if (zombiesSpawnedRef.current >= currentStage.zombieCount && zombiesRef.current.length === 0) {
      audio.stopMusic();
      if (currentStageIdx === STAGES.length - 1) {
        setGameState('VICTORY');
      } else {
        setCurrentStageIdx(prev => prev + 1);
        setGameState('BRIEFING');
        startBriefing();
      }
    }
  }, [gameState, currentStage, currentStageIdx, spawnZombie]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // 1. Draw Static Floor (Blood & Background)
    ctx.drawImage(floorCanvasRef.current, 0, 0);

    // 2. Draw Dust/Environmental effects
    ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
    for(let i=0; i<10; i++) {
        ctx.fillRect(Math.random()*CANVAS_WIDTH, Math.random()*CANVAS_HEIGHT, 2, 2);
    }

    if (gameState === 'PLAYING') {
      const player = playerRef.current;

      // Draw Particles
      particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life / 50;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
      });
      ctx.globalAlpha = 1.0;

      // Draw Pickups
      pickupsRef.current.forEach(p => {
        const glow = Math.sin(frameRef.current * 0.1) * 5 + 5;
        ctx.fillStyle = p.type === 'AMMO' ? COLORS.AMMO : p.type === 'HEALTH' ? COLORS.HEALTH : COLORS.WEAPON;
        ctx.shadowBlur = glow; ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Zombies with rotation and wobble
      zombiesRef.current.forEach(z => {
        const angle = Math.atan2(player.y - z.y, player.x - z.x);
        const wobble = Math.sin(frameRef.current * 0.15) * 0.1;
        
        ctx.save();
        ctx.translate(z.x, z.y);
        ctx.rotate(angle + wobble);
        
        const sprite = spritesRef.current[`ZOMBIE_${z.type}`] || spritesRef.current.ZOMBIE_NORMAL;
        ctx.drawImage(sprite, -z.radius, -z.radius, z.radius * 2, z.radius * 2);
        
        ctx.restore();

        if (z.type === 'BOSS' || z.type === 'TANK') {
          const maxHp = z.type === 'BOSS' ? 2000 : 180;
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(z.x - z.radius, z.y - z.radius - 12, z.radius * 2, 6);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(z.x - z.radius, z.y - z.radius - 12, (z.hp / maxHp) * z.radius * 2, 6);
        }
      });

      // Draw Bullets
      bulletsRef.current.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.shadowBlur = 10; ctx.shadowColor = b.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Player
      const playerAngle = Math.atan2(mouseRef.current.y - player.y, mouseRef.current.x - player.x);
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(playerAngle);
      ctx.drawImage(spritesRef.current.PLAYER, -player.radius, -player.radius, player.radius * 2, player.radius * 2);
      
      // Muzzle Flash
      if (muzzleFlash) {
        ctx.fillStyle = 'rgba(253, 224, 71, 0.8)';
        ctx.beginPath();
        ctx.arc(player.radius + 10, 0, 15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Aim Laser
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.setLineDash([2, 8]);
      ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(mouseRef.current.x, mouseRef.current.y); ctx.stroke();
      ctx.setLineDash([]);
    }

    requestRef.current = requestAnimationFrame(() => {
      update();
      draw();
    });
  }, [gameState, update, muzzleFlash]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [draw]);

  const isLowHp = playerRef.current.hp < 30 && gameState === 'PLAYING';

  return (
    <div className={`relative w-full h-screen flex items-center justify-center bg-black crt-overlay overflow-hidden ${isLowHp ? 'low-hp' : ''}`}>
      <div className="vignette"></div>
      <div className="scanline"></div>
      
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="shadow-2xl border-4 border-gray-900 rounded-sm max-w-[98vw] max-h-[98vh] object-contain"
      />
      
      <GameUI 
        gameState={gameState}
        player={playerRef.current}
        currentStage={currentStage}
        briefing={briefing}
        onStartGame={startBriefing}
        onNextStage={startLevel}
        hasSave={hasSave}
        onContinue={loadGame}
      />

      <div className="absolute top-4 left-4 flex gap-4 text-[10px] font-mono text-blue-500 pointer-events-none opacity-60 uppercase tracking-widest">
        <span>V-SYNC: ACTIVE</span>
        <span>AUTH: PROTOCOL_G2</span>
        <span>SEED: {Math.floor(Date.now()/100000)}</span>
      </div>
    </div>
  );
};

export default App;
