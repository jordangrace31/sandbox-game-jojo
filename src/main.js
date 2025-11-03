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

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: GAME_CONFIG.backgroundColor,
  physics: GAME_CONFIG.physics,
  scene: [
    // IntroScene,
    PreloadScene,
    MainScene,
    CampScene
  ]
};

const game = new Phaser.Game(config);

window.game = game;

