/**
 * AnimationManager
 * Manages all animation creation and configuration for game sprites
 */

import { ANIMATION_CONFIG } from '../config.js';

export default class AnimationManager {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Create all player animations
   */
  createPlayerAnimations() {
    this.createWalkAnimations();
    this.createJumpAnimations();
    this.createIdleAnimations();
    this.createClimbAnimations();
  }

  /**
   * Create all NPC animations
   */
  createNPCAnimations() {
    this.createGirlWalkAnimations();
    this.createGirlRunAnimations();
    this.createGirlIdleAnimations();
    this.createGirlClimbAnimations();
    this.createHamiltonEmoteAnimations();
    this.createHamiltonIdleAnimations();
  }

  /**
   * Create walking animations for all four directions
   */
  createWalkAnimations() {
    const directions = ['down', 'up', 'left', 'right'];
    const prefixes = ['front', 'back', 'left', 'right'];

    directions.forEach((direction, index) => {
      this.scene.anims.create({
        key: `walk_${direction}`,
        frames: this.scene.anims.generateFrameNames('jojo_boy_walk', {
          prefix: `jojo_boy_${prefixes[index]}_`,
          start: 0,
          end: 8
        }),
        frameRate: ANIMATION_CONFIG.walkFrameRate,
        repeat: -1
      });
    });
  }

  /**
   * Create jumping animations for all four directions
   */
  createJumpAnimations() {
    const directions = ['down', 'up', 'left', 'right'];
    const prefixes = ['front', 'back', 'left', 'right'];

    directions.forEach((direction, index) => {
      this.scene.anims.create({
        key: `jump_${direction}`,
        frames: this.scene.anims.generateFrameNames('jojo_boy_jump', {
          prefix: `jojo_boy_${prefixes[index]}_`,
          start: 0,
          end: 4
        }),
        frameRate: ANIMATION_CONFIG.jumpFrameRate,
        repeat: 0
      });
    });
  }

  /**
   * Create idle animations for all four directions
   */
  createIdleAnimations() {
    const directions = ['down', 'up', 'left', 'right'];
    const prefixes = ['front', 'back', 'left', 'right'];

    directions.forEach((direction, index) => {
      this.scene.anims.create({
        key: `idle_${direction}`,
        frames: this.scene.anims.generateFrameNames('jojo_boy_idle', {
          prefix: `jojo_boy_${prefixes[index]}_`,
          start: 0,
          end: 1
        }),
        frameRate: ANIMATION_CONFIG.idleFrameRate,
        repeat: -1
      });
    });
  }

  /**
   * Create girl NPC walking animations for all four directions
   */
  createGirlWalkAnimations() {
    const directions = ['down', 'up', 'left', 'right'];
    const prefixes = ['front', 'back', 'left', 'right'];

    directions.forEach((direction, index) => {
      this.scene.anims.create({
        key: `girl_walk_${direction}`,
        frames: this.scene.anims.generateFrameNames('jojo_girl_walk', {
          prefix: `jojo_girl_${prefixes[index]}_`,
          start: 0,
          end: 8
        }),
        frameRate: ANIMATION_CONFIG.walkFrameRate,
        repeat: -1
      });
    });
  }

  /**
   * Create girl NPC running animations for all four directions
   */
  createGirlRunAnimations() {
    const directions = ['down', 'up', 'left', 'right'];
    const prefixes = ['front', 'back', 'left', 'right'];

    directions.forEach((direction, index) => {
      this.scene.anims.create({
        key: `girl_run_${direction}`,
        frames: this.scene.anims.generateFrameNames('jojo_girl_run', {
          prefix: `jojo_girl_${prefixes[index]}_`,
          start: 0,
          end: 7
        }),
        frameRate: ANIMATION_CONFIG.walkFrameRate + 2, // Slightly faster
        repeat: -1
      });
    });
  }

  /**
   * Create girl NPC idle animations for all four directions
   */
  createGirlIdleAnimations() {
    const directions = ['down', 'up', 'left', 'right'];
    const prefixes = ['front', 'back', 'left', 'right'];

    directions.forEach((direction, index) => {
      this.scene.anims.create({
        key: `girl_idle_${direction}`,
        frames: this.scene.anims.generateFrameNames('jojo_girl_idle', {
          prefix: `jojo_girl_${prefixes[index]}_`,
          start: 0,
          end: 1
        }),
        frameRate: ANIMATION_CONFIG.idleFrameRate,
        repeat: -1
      });
    });
  }

  /**
   * Create climbing animations for player
   */
  createClimbAnimations() {
    this.scene.anims.create({
      key: 'climb',
      frames: this.scene.anims.generateFrameNames('jojo_boy_climb', {
        prefix: 'jojo_boy_back_',
        start: 0,
        end: 5
      }),
      frameRate: ANIMATION_CONFIG.walkFrameRate,
      repeat: -1
    });
  }

  /**
   * Create climbing animations for girl NPC
   */
  createGirlClimbAnimations() {
    this.scene.anims.create({
      key: 'girl_climb',
      frames: this.scene.anims.generateFrameNames('jojo_girl_climb', {
        prefix: 'jojo_girl_back_',
        start: 0,
        end: 5
      }),
      frameRate: ANIMATION_CONFIG.walkFrameRate,
      repeat: -1
    });
  }


  /**
   * Create Hamilton emote animations
   */
  createHamiltonEmoteAnimations() {
    this.scene.anims.create({
      key: 'hamilton_emote',
      frames: this.scene.anims.generateFrameNames('hamilton_emote', {
        prefix: 'hamilton_front_',
        start: 0,
        end: 2
      }),
      frameRate: ANIMATION_CONFIG.walkFrameRate,
      repeat: -1
    });
  }
  
  /**
   * Create Hamilton idle animations
   */
  createHamiltonIdleAnimations() {
    this.scene.anims.create({
      key: 'hamilton_idle',
      frames: this.scene.anims.generateFrameNames('hamilton_idle', {
        prefix: 'hamilton_front_',
        start: 0,
        end: 1
      }),
      frameRate: ANIMATION_CONFIG.idleFrameRate,
      repeat: -1
    });
  }
}

