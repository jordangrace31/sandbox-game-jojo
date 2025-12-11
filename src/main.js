/**
 * Main Entry Point
 * Initializes the Phaser game with all scenes
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from './config.js';
import IntroScene from './scenes/IntroScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainScene from './scenes/MainScene.js';
import CampScene from './scenes/CampScene.js';
import LockStockScene from './scenes/LockStockScene.js';
import ClubScene from './scenes/ClubScene.js';
import InhanceScene from './scenes/InhanceScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: GAME_CONFIG.backgroundColor,
  physics: GAME_CONFIG.physics,
  scene: [
    IntroScene,
    PreloadScene,
    MainScene,
    CampScene,
    LockStockScene,
    ClubScene,
    InhanceScene
  ]
};

const game = new Phaser.Game(config);

window.game = game;

