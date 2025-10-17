/**
 * Player Class
 * Handles all player-related logic including movement, jumping, and animations
 */

import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../config.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'jojo_boy_walk');
    
    // Add sprite to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set up physics properties
    this.setBounce(PLAYER_CONFIG.bounce);
    this.setCollideWorldBounds(true);
    
    // Player state
    this.lastDirection = 'down';
    this.speed = PLAYER_CONFIG.speed;
    this.jumpPower = PLAYER_CONFIG.jumpPower;
    
    // Set up input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Start with idle animation
    this.play('idle_down');
  }

  /**
   * Update player state - call this in scene's update()
   */
  update() {
    this.handleMovement();
    this.handleJump();
  }

  /**
   * Handle horizontal and directional movement
   */
  handleMovement() {
    const onGround = this.body.touching.down;
    
    if (this.cursors.left.isDown) {
      this.setVelocityX(-this.speed);
      this.flipX = false;
      this.lastDirection = 'left';
      
      if (onGround) {
        this.play('walk_left', true);
      } else {
        this.play('jump_left', true);
      }
    } 
    else if (this.cursors.right.isDown) {
      this.setVelocityX(this.speed);
      this.flipX = false;
      this.lastDirection = 'right';
      
      if (onGround) {
        this.play('walk_right', true);
      } else {
        this.play('jump_right', true);
      }
    }
    else if (this.cursors.up.isDown) {
      this.setVelocityX(0);
      this.lastDirection = 'up';
      
      if (onGround) {
        this.play('idle_up', true);
      }
    }
    else if (this.cursors.down.isDown) {
      this.setVelocityX(0);
      this.lastDirection = 'down';
      
      if (onGround) {
        this.play('idle_down', true);
      }
    }
    else {
      this.setVelocityX(0);
      
      if (onGround) {
        this.play('idle_' + this.lastDirection, true);
      }
    }
  }

  /**
   * Handle jumping with spacebar
   */
  handleJump() {
    const onGround = this.body.touching.down;
    
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && onGround) {
      this.setVelocityY(this.jumpPower);
      this.play('jump_' + this.lastDirection, true);
    }
  }

  /**
   * Get player's current direction
   */
  getDirection() {
    return this.lastDirection;
  }

  /**
   * Check if player is on ground
   */
  isOnGround() {
    return this.body.touching.down;
  }
}

