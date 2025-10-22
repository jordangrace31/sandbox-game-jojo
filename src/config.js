/**
 * Game Configuration
 * Central place for all game settings and constants
 */

export const GAME_CONFIG = {
  width: 1400,
  height: 700,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false
    }
  }
};

export const PLAYER_CONFIG = {
  speed: 200,
  climbSpeed: 200,
  jumpPower: -500,
  bounce: 0.1,
  startX: 100,
  startY: 450,
  depth: 1000
};

export const ANIMATION_CONFIG = {
  walkFrameRate: 10,
  jumpFrameRate: 10,
  idleFrameRate: 4
};

export const WORLD_CONFIG = {
  width: 14000,        // 4x wider than screen for exploration
  height: 700,
  groundHeight: 80,   // Height of the ground/grass area
  skyColors: {
    top: '#4a90e2',   
    bottom: '#87CEEB'
  }
};

