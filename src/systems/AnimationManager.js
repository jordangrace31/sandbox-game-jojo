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
}

