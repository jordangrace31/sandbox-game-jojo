/**
 * Game Configuration
 * Central place for all game settings and constants
 */

export const GAME_CONFIG = {
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  }
};

export const PLAYER_CONFIG = {
  speed: 160,
  jumpPower: -400,
  bounce: 0.1,
  startX: 100,
  startY: 450
};

export const ANIMATION_CONFIG = {
  walkFrameRate: 10,
  jumpFrameRate: 10,
  idleFrameRate: 4
};

