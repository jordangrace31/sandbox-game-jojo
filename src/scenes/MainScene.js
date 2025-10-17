/**
 * MainScene
 * Main gameplay scene where the player can move around, interact with NPCs, etc.
 */

import Phaser from 'phaser';
import Player from '../entities/Player.js';
import AnimationManager from '../systems/AnimationManager.js';
import { PLAYER_CONFIG } from '../config.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    // Initialize systems
    this.animationManager = new AnimationManager(this);
    this.animationManager.createPlayerAnimations();
    
    // Create the world
    this.createWorld();
    
    // Create the player
    this.player = new Player(this, PLAYER_CONFIG.startX, PLAYER_CONFIG.startY);
    
    // Set up collisions
    this.physics.add.collider(this.player, this.ground);
    
    // Future: Add NPCs, dialogue triggers, quest markers, etc.
  }

  update() {
    // Update player
    this.player.update();
    
    // Future: Update NPCs, check for interactions, update quest state, etc.
  }

  /**
   * Create the game world (platforms, ground, background, etc.)
   */
  createWorld() {
    // Create ground platform
    this.ground = this.add.rectangle(400, 580, 800, 40, 0x00aa00);
    this.physics.add.existing(this.ground, true); // true = static (immovable)
    
    // Future: Add background, platforms, decorations, etc.
  }

  /**
   * Example method for future NPC interactions
   */
  handleInteraction(player, npc) {
    // This will be called when player presses a key near an NPC
    // Can launch dialogue scene, start quest, etc.
    console.log('Interacting with NPC');
  }
}

