/**
 * IntroScene
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
    this.birds = [];
  }

  create() {
    const { width, height } = this.cameras.main;
    
    this.createSkyGradient();
    
    this.createSun();
    
    this.createClouds();
    
    this.createBirds();
    
    this.createTitle();
    
    // Add "Click to Start" text that appears after a delay
    this.time.delayedCall(2000, () => {
      this.createStartPrompt();
    });
    
    // Click/tap to continue
    this.input.once('pointerdown', () => {
      this.startGame();
    });
    
    // Auto-start after 5 seconds if no interaction
    this.time.delayedCall(20000, () => {
      this.startGame();
    });
  }

  /**
   * Create a beautiful gradient sky background
   */
  createSkyGradient() {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();
    
    // Create gradient from top to bottom
    // Top: Deep blue (#2c5f8d)
    // Middle-top: Sky blue (#4a90e2)
    // Middle-bottom: Light blue (#87CEEB)
    // Bottom: Peachy orange (#ffd4a3)
    
    const gradientSteps = 50;
    const stepHeight = height / gradientSteps;
    
    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;
      let color;
      
      if (ratio < 0.3) {
        // Top part: dark to medium blue
        color = this.interpolateColor(0x2c5f8d, 0x4a90e2, ratio / 0.3);
      } else if (ratio < 0.7) {
        // Middle part: medium to light blue
        color = this.interpolateColor(0x4a90e2, 0x87CEEB, (ratio - 0.3) / 0.4);
      } else {
        // Bottom part: light blue to peachy orange
        color = this.interpolateColor(0x87CEEB, 0xffd4a3, (ratio - 0.7) / 0.3);
      }
      
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, i * stepHeight, width, stepHeight + 1);
    }
  }

  /**
   * Create a sun in the sky
   */
  createSun() {
    const { width, height } = this.cameras.main;
    const sun = this.add.circle(width * 0.75, height * 0.25, 60, 0xffeb3b, 0.8);
    
    // Add glow effect
    const glow = this.add.circle(width * 0.75, height * 0.25, 80, 0xfff176, 0.3);
    
    // Subtle pulsing animation
    this.tweens.add({
      targets: [sun, glow],
      scale: { from: 1, to: 1.1 },
      alpha: { from: 0.8, to: 1 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Create simple cloud shapes
   */
  createClouds() {
    const { width, height } = this.cameras.main;
    
    // Create several clouds at different positions
    this.createCloud(width * 0.2, height * 0.2, 1);
    this.createCloud(width * 0.5, height * 0.15, 0.8);
    this.createCloud(width * 0.8, height * 0.25, 1.2);
  }

  /**
   * Create a single cloud made of circles
   */
  createCloud(x, y, scale = 1) {
    const cloud = this.add.container(x, y);
    
    // Cloud made of overlapping circles
    const circles = [
      { x: 0, y: 0, r: 25 },
      { x: 30, y: -5, r: 30 },
      { x: 60, y: 0, r: 25 },
      { x: 20, y: 15, r: 20 },
      { x: 40, y: 15, r: 20 }
    ];
    
    circles.forEach(c => {
      const circle = this.add.circle(c.x, c.y, c.r * scale, 0xffffff, 0.7);
      cloud.add(circle);
    });
    
    // Slow drift animation
    this.tweens.add({
      targets: cloud,
      x: x + 100,
      duration: 20000 + Math.random() * 10000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
    
    // Subtle bob up and down
    this.tweens.add({
      targets: cloud,
      y: y + 10,
      duration: 4000 + Math.random() * 2000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Create animated birds flying across the sky
   */
  createBirds() {
    // Create several birds at different heights and positions
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 800, () => {
        this.createBird();
      });
    }
  }

  /**
   * Create a single bird with animation
   */
  createBird() {
    const { width, height } = this.cameras.main;
    const startX = -50;
    const y = 100 + Math.random() * 200;
    const speed = 2000 + Math.random() * 2000;
    
    const bird = this.add.container(startX, y);
    
    // Simple bird shape made with graphics
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x000000, 0.6);
    
    // Wing flapping will be animated
    const leftWing = this.add.graphics();
    const rightWing = this.add.graphics();
    
    bird.add([leftWing, rightWing]);
    this.birds.push({ bird, leftWing, rightWing });
    
    // Initial wing draw
    this.drawBirdWings(leftWing, rightWing, 0);
    
    // Animate bird flying across screen
    this.tweens.add({
      targets: bird,
      x: width + 50,
      duration: speed,
      ease: 'Linear',
      onComplete: () => {
        bird.destroy();
      }
    });
    
    // Wing flapping animation
    let wingAngle = 0;
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (bird.active) {
          wingAngle += 0.5;
          this.drawBirdWings(leftWing, rightWing, wingAngle);
        }
      },
      loop: true
    });
  }

  /**
   * Draw bird wings with animation
   */
  drawBirdWings(leftWing, rightWing, angle) {
    const wingSpan = Math.sin(angle) * 10 + 15;
    
    leftWing.clear();
    leftWing.lineStyle(2, 0x333333, 0.7);
    leftWing.beginPath();
    leftWing.moveTo(0, 0);
    leftWing.lineTo(-wingSpan, -10);
    leftWing.strokePath();
    
    rightWing.clear();
    rightWing.lineStyle(2, 0x333333, 0.7);
    rightWing.beginPath();
    rightWing.moveTo(0, 0);
    rightWing.lineTo(wingSpan, -10);
    rightWing.strokePath();
  }

  /**
   * Create the game title with fade-in animation
   */
  createTitle() {
    const { width, height } = this.cameras.main;
    
    // Main title
    const title = this.add.text(width / 2, height / 2 - 50, 'JoJo\'s Adventure', {
      fontSize: '72px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#2c5f8d',
      strokeThickness: 8,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000000',
        blur: 10,
        fill: true
      }
    });
    title.setOrigin(0.5);
    title.setAlpha(0);
    
    // Subtitle
    const subtitle = this.add.text(width / 2, height / 2 + 30, 'A Sandbox Game', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      fill: '#ffffff',
      stroke: '#4a90e2',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        fill: true
      }
    });
    subtitle.setOrigin(0.5);
    subtitle.setAlpha(0);
    
    // Fade in animations
    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 1500,
      ease: 'Power2'
    });
    
    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 1500,
      delay: 500,
      ease: 'Power2'
    });
    
    // Gentle floating animation
    this.tweens.add({
      targets: [title, subtitle],
      y: '+=10',
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Create "Click to Start" prompt
   */
  createStartPrompt() {
    const { width, height } = this.cameras.main;
    
    const prompt = this.add.text(width / 2, height * 0.75, 'Click to Start', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      fill: '#ffffff',
      stroke: '#2c5f8d',
      strokeThickness: 4
    });
    prompt.setOrigin(0.5);
    prompt.setAlpha(0);
    
    // Fade in and pulse
    this.tweens.add({
      targets: prompt,
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    });
    
    this.tweens.add({
      targets: prompt,
      scale: { from: 1, to: 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Transition to the preload scene
   */
  startGame() {
    // Fade out
    this.cameras.main.fadeOut(500, 0, 0, 0);
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('PreloadScene');
    });
  }

  /**
   * Helper function to interpolate between two hex colors
   */
  interpolateColor(color1, color2, ratio) {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;
    
    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;
    
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    return (r << 16) | (g << 8) | b;
  }
}

