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
    this.climbSpeed = PLAYER_CONFIG.climbSpeed;
    this.jumpPower = PLAYER_CONFIG.jumpPower;
    this.isClimbing = false;
    this.currentLadder = null;
    
    // Set up input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    
    // Start with idle animation
    this.play('idle_down');
  }

  /**
   * Update player state - call this in scene's update()
   */
  update() {
    if (this.isClimbing) {
      this.handleClimbing();
    } else {
      this.handleMovement();
      this.handleJump();
    }
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

  /**
   * Start climbing a ladder
   */
  startClimbing(ladder) {
    this.isClimbing = true;
    this.currentLadder = ladder;
    this.setVelocityX(0);
    this.setVelocityY(0);
    this.setGravityY(-PLAYER_CONFIG.speed * 10); // Disable gravity
    this.play('climb', true);
  }

  /**
   * Stop climbing
   */
  stopClimbing() {
    this.isClimbing = false;
    this.currentLadder = null;
    this.setGravityY(0); // Re-enable default gravity
    this.setVelocityY(0);
  }

  /**
   * Handle climbing movement
   */
  handleClimbing() {
    // Check if player wants to stop climbing
    if (!this.shiftKey.isDown || !this.currentLadder) {
      this.stopClimbing();
      return;
    }

    // Vertical movement while climbing
    if (this.cursors.up.isDown) {
      this.setVelocityY(-this.speed);
      this.play('climb', true);
    } else if (this.cursors.down.isDown) {
      this.setVelocityY(this.speed);
      this.play('climb', true);
    } else {
      this.setVelocityY(0);
      this.anims.pause();
    }

    // Horizontal movement (for getting on/off ladder)
    if (this.cursors.left.isDown) {
      this.setVelocityX(-this.speed * 0.5);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(this.speed * 0.5);
    } else {
      this.setVelocityX(0);
    }

    // Align player with ladder center
    if (this.currentLadder && Math.abs(this.x - this.currentLadder.x) < 5) {
      this.x = this.currentLadder.x;
    }
  }

  /**
   * Check if near a ladder and can climb
   */
  checkLadderProximity(ladder) {
    if (!ladder || this.isClimbing) return false;
    
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      ladder.x,
      ladder.y
    );
    
    return distance < 50;
  }
}

