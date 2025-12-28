
import React from 'react';
import { GameState, Player, Briefing, StageInfo } from '../types';

interface GameUIProps {
  gameState: GameState;
  player: Player | null;
  currentStage: StageInfo;
  briefing: Briefing | null;
  onStartGame: () => void;
  onNextStage: () => void;
  hasSave: boolean;
  onContinue: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ 
  gameState, 
  player, 
  currentStage, 
  briefing, 
  onStartGame, 
  onNextStage,
  hasSave,
  onContinue
}) => {
  if (gameState === 'START') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 bg-opacity-95 backdrop-blur-md">
        <div className="border-y-2 border-red-600 py-8 px-24 text-center mb-12">
            <h1 className="text-8xl font-black text-white mb-2 tracking-tighter uppercase italic italic">GEMINI</h1>
            <h2 className="text-2xl font-bold text-red-600 tracking-[0.5em] uppercase">Protocol: Survival</h2>
        </div>
        <div className="flex gap-8">
          <button 
            onClick={onStartGame}
            className="group relative px-12 py-4 bg-white text-black font-black uppercase tracking-tighter overflow-hidden hover:scale-110 transition-transform"
          >
            <span className="relative z-10">Initial Deployment</span>
            <div className="absolute inset-0 bg-red-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </button>
          {hasSave && (
            <button 
              onClick={onContinue}
              className="px-12 py-4 border-2 border-blue-500 text-blue-500 font-black uppercase tracking-tighter hover:bg-blue-500 hover:text-white transition-all"
            >
              Resume Feed
            </button>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'BRIEFING') {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black bg-opacity-80">
        <div className="bg-slate-900 border-2 border-blue-600 p-12 max-w-4xl w-full shadow-[0_0_50px_rgba(37,99,235,0.2)] relative">
          <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-blue-600"></div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-blue-600"></div>
          
          <div className="flex justify-between items-center mb-10 border-b border-blue-900 pb-4">
            <h2 className="text-blue-500 text-xl font-mono font-bold italic">// CLASSIFIED MISSION INTEL</h2>
            <span className="bg-red-900 text-red-200 px-4 py-1 text-sm font-bold animate-pulse">EYES ONLY</span>
          </div>

          <h1 className="text-5xl font-black text-white mb-8 uppercase tracking-tighter leading-none">{briefing?.title || 'DECRYPTING...'}</h1>
          
          <div className="space-y-6 mb-12">
            <p className="text-gray-300 text-2xl font-serif italic leading-relaxed border-l-4 border-blue-600 pl-8">
              {briefing?.description || 'Establishing secure Uplink to Command...'}
            </p>
            <div className="flex items-center gap-8 bg-black bg-opacity-40 p-6 rounded">
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-500 font-mono">THREAT LEVEL</span>
                <span className="text-2xl text-red-500 font-black tracking-widest uppercase">{briefing?.threatLevel || 'CALCULATING...'}</span>
              </div>
              <div className="flex flex-col border-l border-blue-900 pl-8">
                <span className="text-[10px] text-blue-500 font-mono">SECTOR</span>
                <span className="text-2xl text-white font-black uppercase">STAGE {currentStage.id}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onNextStage}
            className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl uppercase tracking-widest transition-all hover:tracking-[0.5em]"
          >
            Confirm Deployment
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'PLAYING' && player) {
    const isLowAmmo = player.ammo <= 5;
    return (
      <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between overflow-hidden">
        {/* TOP HUD */}
        <div className="flex justify-between items-start">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-10"></div>
            <div className="relative border-l-4 border-blue-600 pl-4 py-2 bg-gradient-to-r from-blue-950/40 to-transparent pr-12">
                <div className="text-blue-500 text-[10px] font-mono font-bold mb-1">LOCATION // {currentStage.name.toUpperCase()}</div>
                <div className="text-white text-4xl font-black italic italic tracking-tighter">DATA POINTS: {player.score}</div>
            </div>
          </div>
          <div className="text-right">
             <div className="text-blue-500 text-[10px] font-mono font-bold">BIO-SIGNAL</div>
             <div className="text-white text-2xl font-black uppercase">LINK STABLE</div>
          </div>
        </div>

        {/* BOTTOM HUD */}
        <div className="flex justify-between items-end gap-12">
          {/* Health Section */}
          <div className="flex-1 max-w-sm">
            <div className="flex justify-between items-end mb-2">
                <div className="text-red-500 text-xs font-black uppercase tracking-widest">Vitals</div>
                <div className="text-white text-3xl font-black">{Math.round(player.hp)}%</div>
            </div>
            <div className="h-4 bg-gray-900 border border-red-900/50 relative overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-300 ${player.hp < 30 ? 'animate-pulse' : ''}`}
                style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
              ></div>
              <div className="absolute inset-0 flex">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="flex-1 border-r border-black/20 h-full"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Weapon Section */}
          <div className="flex gap-8 items-end">
            <div className="text-right">
                <div className="text-blue-500 text-[10px] font-mono font-bold mb-1 italic">LOADOUT</div>
                <div className="text-white text-2xl font-black italic tracking-widest uppercase">{player.weapon}</div>
            </div>
            <div className={`text-right ${isLowAmmo ? 'animate-bounce' : ''}`}>
                <div className={`text-xs font-black mb-1 tracking-widest uppercase ${isLowAmmo ? 'text-red-500' : 'text-yellow-500'}`}>Magazines</div>
                <div className="flex items-baseline gap-1">
                    <span className={`text-6xl font-black italic leading-none ${isLowAmmo ? 'text-red-500' : 'text-white'}`}>{player.ammo}</span>
                    <span className="text-gray-600 text-2xl font-black">/ {player.maxAmmo}</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'GAME_OVER') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950 bg-opacity-95 backdrop-blur-xl">
        <div className="text-center">
            <h1 className="text-[12rem] font-black text-white leading-none tracking-tighter uppercase italic italic">LOST</h1>
            <p className="text-red-400 text-2xl font-mono mb-12 tracking-widest uppercase italic">Communication with Subject Severed</p>
            <div className="bg-black/40 p-8 mb-12 border border-red-800">
                <div className="text-red-500 text-xs font-mono mb-2">FINAL RETRIEVAL DATA</div>
                <div className="text-5xl font-black text-white uppercase italic">{player?.score} UNITS</div>
            </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-24 py-6 bg-white text-black font-black text-xl uppercase hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
        >
          Initialize Replacement
        </button>
      </div>
    );
  }

  if (gameState === 'VICTORY') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-blue-950 bg-opacity-95 backdrop-blur-2xl">
        <h1 className="text-8xl font-black text-white mb-4 tracking-tighter uppercase">PROTOCOL ACHIEVED</h1>
        <p className="text-blue-300 text-xl font-mono mb-12 max-w-2xl text-center">Threat neutralized. All sectors purged. Biological contamination within acceptable limits.</p>
        <div className="text-5xl font-black text-white mb-16 italic italic">SCORE: {player?.score}</div>
        <button 
          onClick={() => {
            localStorage.removeItem('gemini_protocol_save');
            window.location.reload();
          }}
          className="px-24 py-6 bg-blue-500 text-white font-black text-xl hover:bg-white hover:text-blue-900 transition-all uppercase tracking-widest"
        >
          Close Session
        </button>
      </div>
    );
  }

  return null;
};
