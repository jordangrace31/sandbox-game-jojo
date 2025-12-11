/**
 * Player Class
 */

import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../config.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'jojo_boy_walk');
    
    // Add sprite to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setBounce(PLAYER_CONFIG.bounce);
    this.setCollideWorldBounds(true);
    
    this.lastDirection = 'down';
    this.speed = PLAYER_CONFIG.speed;
    this.climbSpeed = PLAYER_CONFIG.climbSpeed;
    this.jumpPower = PLAYER_CONFIG.jumpPower;
    this.isClimbing = false;
    this.currentLadder = null;
    this.isDancing = false; // Flag to prevent movement during dancing
    
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    
    this.play('idle_down');
  }

  update() {
    if (this.isDancing) {
      return;
    }
    
    if (this.isClimbing) {
      this.handleClimbing();
    } else {
      this.handleMovement();
      this.handleJump();
    }
  }

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

  handleJump() {
    const onGround = this.body.touching.down;
    
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && onGround) {
      this.setVelocityY(this.jumpPower);
      this.play('jump_' + this.lastDirection, true);
    }
  }

  getDirection() {
    return this.lastDirection;
  }

  isOnGround() {
    return this.body.touching.down;
  }

  handleClimbing() {
    // Disable gravity while climbing
    this.body.setAllowGravity(false);
    
    if (this.cursors.up.isDown) {
      this.setVelocityY(-this.climbSpeed);
      this.play('climb', true);
    } else if (this.cursors.down.isDown) {
      this.setVelocityY(this.climbSpeed);
      this.play('climb', true);
    } else {
      this.setVelocityY(0);
      // Stop animation on current frame when not moving
      this.anims.pause();
    }
    
    // Stop horizontal movement while climbing
    this.setVelocityX(0);
  }

  startClimbing(climbingWall) {
    this.isClimbing = true;
    this.currentClimbingWall = climbingWall;
    this.body.setAllowGravity(false);
    this.setVelocityX(0);
    this.setVelocityY(0);
    // Position player on the wall
    this.x = climbingWall.x;
    this.play('climb', true);
  }

  stopClimbing() {
    this.isClimbing = false;
    this.currentClimbingWall = null;
    this.body.setAllowGravity(true);
    this.play('idle_down', true);
    this.lastDirection = 'down';
  }
}

