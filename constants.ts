
import { StageInfo, Weapon, WeaponType } from './types';

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;

export const STAGES: StageInfo[] = [
  { id: 1, name: "City Outskirts", zombieCount: 15, spawnRate: 2000, types: ['NORMAL'] },
  { id: 2, name: "Abandoned Mall", zombieCount: 25, spawnRate: 1800, types: ['NORMAL', 'FAST'] },
  { id: 3, name: "Industrial Zone", zombieCount: 40, spawnRate: 1500, types: ['NORMAL', 'FAST', 'EXPLODER'] },
  { id: 4, name: "Quarantine Wall", zombieCount: 50, spawnRate: 1200, types: ['NORMAL', 'TANK', 'EXPLODER'] },
  { id: 5, name: "Hospital Ruins", zombieCount: 65, spawnRate: 1000, types: ['NORMAL', 'FAST', 'TANK', 'EXPLODER'] },
  { id: 6, name: "The Underground", zombieCount: 80, spawnRate: 900, types: ['FAST', 'TANK', 'EXPLODER'] },
  { id: 7, name: "Military Base", zombieCount: 100, spawnRate: 800, types: ['NORMAL', 'FAST', 'TANK', 'EXPLODER'] },
  { id: 8, name: "Downtown Core", zombieCount: 120, spawnRate: 700, types: ['FAST', 'TANK', 'EXPLODER'] },
  { id: 9, name: "Radioactive Crater", zombieCount: 150, spawnRate: 600, types: ['TANK', 'FAST', 'EXPLODER'] },
  { id: 10, name: "The Hive", zombieCount: 200, spawnRate: 500, types: ['NORMAL', 'FAST', 'TANK', 'BOSS', 'EXPLODER'] },
];

export const WEAPONS: Record<WeaponType, Weapon> = {
  PISTOL: { type: 'PISTOL', damage: 15, fireRate: 350, ammoPerShot: 1, spread: 0, pellets: 1 },
  SHOTGUN: { type: 'SHOTGUN', damage: 12, fireRate: 850, ammoPerShot: 2, spread: 0.45, pellets: 7 },
  SMG: { type: 'SMG', damage: 9, fireRate: 110, ammoPerShot: 1, spread: 0.12, pellets: 1 },
};

export const COLORS = {
  PLAYER: '#3b82f6',
  ZOMBIE_NORMAL: '#4ade80',
  ZOMBIE_FAST: '#fbbf24',
  ZOMBIE_TANK: '#8b5cf6',
  ZOMBIE_BOSS: '#be123c',
  ZOMBIE_EXPLODER: '#f97316',
  BULLET: '#fde047',
  AMMO: '#22c55e',
  HEALTH: '#f43f5e',
  WEAPON: '#818cf8',
  BACKGROUND: '#020617',
  BLOOD: '#7f1d1d'
};

// SVG Assets as Data URLs for immediate rendering
export const SPRITES = {
  PLAYER: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTUiIGZpbGw9IiMzYjgyZjYiLz48cmVjdCB4PSIyMCIgeT0iMTUiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzFmMjkzNyIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjUiIGZpbGw9IiMxZTNiOGUiLz48L3N2Zz4=',
  ZOMBIE_NORMAL: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTUiIGZpbGw9IiM0YWRlODAiLz48cmVjdCB4PSIyMCIgeT0iMTUiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzA2NGUzYiIvPjxjaXJjbGUgY3g9IjI1IiBjeT0iMTUiIHI9IjMiIGZpbGw9InJlZCIvPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjMiIGZpbGw9InJlZCIvPjwvc3ZnPg==',
  ZOMBIE_FAST: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTIiIGZpbGw9IiNmYmJmMjQiLz48cmVjdCB4PSIyMCIgeT0iMTciIHdpZHRoPSIxMCIgaGVpZ2h0PSI2IiBmaWxsPSIjYmI4ZDAwIi8+PGNpcmNsZSBjeD0iMjQiIGN5PSIxNCIgcj0iMiIgZmlsbD0icmVkIi8+PGNpcmNsZSBjeD0iMjQiIGN5PSIyNiIgcj0iMiIgZmlsbD0icmVkIi8+PC9zdmc+',
  ZOMBIE_TANK: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiM4YjVjZjYiLz48cmVjdCB4PSIyMCIgeT0iMTAiIHdpZHRoPSIxOCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzRjMWQ5NSIvPjxjaXJjbGUgY3g9IjI4IiBjeT0iMTUiIHI9IjQiIGZpbGw9InJlZCIvPjxjaXJjbGUgY3g9IjI4IiBjeT0iMjUiIHI9IjQiIGZpbGw9InJlZCIvPjwvc3ZnPg==',
  ZOMBIE_EXPLODER: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTQiIGZpbGw9IiNmOTczMTYiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI4IiBmaWxsPSIjZmZhYTAwIi8+PHBhdGggZD0iTTI1IDExbDUtNX0zMCAxNGw1LTVNMjYgMzFsNSA1IiBzdHJva2U9InJlZCIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+'
};
