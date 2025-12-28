
export type GameState = 'START' | 'BRIEFING' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';

export type WeaponType = 'PISTOL' | 'SHOTGUN' | 'SMG';

export interface Weapon {
  type: WeaponType;
  damage: number;
  fireRate: number; // ms
  ammoPerShot: number;
  spread: number;
  pellets: number;
}

export interface Entity {
  x: number;
  y: number;
  radius: number;
  color: string;
}

export interface Player extends Entity {
  hp: number;
  maxHp: number;
  speed: number;
  ammo: number;
  maxAmmo: number;
  score: number;
  level: number;
  weapon: WeaponType;
}

export interface Zombie extends Entity {
  hp: number;
  speed: number;
  damage: number;
  type: 'NORMAL' | 'FAST' | 'TANK' | 'BOSS' | 'EXPLODER';
}

export interface Bullet extends Entity {
  dx: number;
  dy: number;
  speed: number;
  damage: number;
}

export interface Pickup extends Entity {
  type: 'AMMO' | 'HEALTH' | 'WEAPON_SHOTGUN' | 'WEAPON_SMG';
}

export interface StageInfo {
  id: number;
  name: string;
  zombieCount: number;
  spawnRate: number;
  types: Array<Zombie['type']>;
}

export interface Briefing {
  title: string;
  description: string;
  threatLevel: string;
}

export interface SaveData {
  stageIdx: number;
  score: number;
  weapon: WeaponType;
  maxAmmo: number;
  maxHp: number;
}
