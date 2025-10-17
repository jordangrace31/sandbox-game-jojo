/**
 * Main Entry Point
 * Initializes the Phaser game with all scenes
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from './config.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainScene from './scenes/MainScene.js';

// Game configuration with scenes
const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: GAME_CONFIG.backgroundColor,
  physics: GAME_CONFIG.physics,
  scene: [
    PreloadScene,
    MainScene
    // Future scenes: DialogueScene, BattleScene, MenuScene, etc.
  ]
};

// Create and start the game
const game = new Phaser.Game(config);

// Make game instance available globally if needed for debugging
window.game = game;

