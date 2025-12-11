/**
 * CreditsScene
 * Displays game credits in a scrolling animation similar to movie credits
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CreditsScene' });
  }

  create() {
    // Set background to black
    this.cameras.main.setBackgroundColor(0x000000);
    
    // Credits data - organized by sections
    const credits = [
      // Title section
      { text: 'CREDITS', size: '48px', color: '#FFD700', spacing: 60 },
      { text: '', size: '24px', spacing: 40 },
      
      // Game Development
      { text: 'GAME DEVELOPMENT', size: '36px', color: '#FFFFFF', spacing: 50 },
      { text: 'Created by', size: '24px', color: '#CCCCCC', spacing: 30 },
      { text: 'Luna & Jordan', size: '32px', color: '#FFFFFF', spacing: 40 },
      { text: '', size: '24px', spacing: 30 },
      
      // Art & Design
      { text: 'ART & DESIGN', size: '36px', color: '#FFFFFF', spacing: 50 },
      { text: 'Luna', size: '28px', color: '#CCCCCC', spacing: 30 },
      { text: 'Jordan', size: '28px', color: '#CCCCCC', spacing: 40 },
      { text: '', size: '24px', spacing: 30 },
      
      // Music & Sound
      { text: 'MUSIC & SOUND', size: '36px', color: '#FFFFFF', spacing: 50 },
      { text: 'Background Music', size: '24px', color: '#CCCCCC', spacing: 30 },
      { text: 'L. Dre - Dear Katara', size: '28px', color: '#CCCCCC', spacing: 40 },
      { text: 'ACDC - Hells Bells', size: '28px', color: '#CCCCCC', spacing: 40 },
      { text: 'Timberland - The Way I Are', size: '28px', color: '#CCCCCC', spacing: 40 },
      { text: 'Ethan Tasch - Shell', size: '28px', color: '#CCCCCC', spacing: 40 },
      { text: '', size: '24px', spacing: 30 },
      
      // Special Thanks
      { text: 'SPRITES & ANIMATIONS', size: '36px', color: '#FFFFFF', spacing: 50 },
      { text: 'A whole bunch or people at https://opengameart.org/content/lpc-character-bases', size: '24px', color: '#CCCCCC', spacing: 30 },
      { text: '', size: '24px', spacing: 30 },
      
      // Final message
      { text: 'Made for Poopy with <3 from Bokkie', size: '28px', color: '#FF69B4', spacing: 50 },
    ];
    
    // Create credits container
    this.creditsContainer = this.add.container(GAME_CONFIG.width / 2, GAME_CONFIG.height + 50);
    
    // Create all credit text objects
    let currentY = 0;
    this.creditTexts = [];
    
    credits.forEach((credit, index) => {
      const textObj = this.add.text(0, currentY, credit.text, {
        fontSize: credit.size || '24px',
        fill: credit.color || '#FFFFFF',
        fontFamily: 'Arial, sans-serif',
        fontStyle: credit.text === 'CREDITS' ? 'bold' : 'normal',
        align: 'center'
      });
      
      textObj.setOrigin(0.5, 0);
      textObj.setAlpha(0);
      
      this.creditsContainer.add(textObj);
      this.creditTexts.push({
        text: textObj,
        fadeInDelay: index * 200, // Stagger fade-in
        spacing: credit.spacing || 30
      });
      
      currentY += credit.spacing || 30;
    });
    
    // Calculate total height for scrolling
    this.totalHeight = currentY;
    
    // Start scrolling animation
    this.startScrolling();
    
    // Fade in from black
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  startScrolling() {
    // Fade in credits as they appear
    this.creditTexts.forEach((credit, index) => {
      this.time.delayedCall(credit.fadeInDelay, () => {
        this.tweens.add({
          targets: credit.text,
          alpha: 1,
          duration: 1000,
          ease: 'Power2'
        });
      });
    });
    
    // Scroll credits upward
    const scrollDuration = 30000; // 30 seconds total
    const endY = -this.totalHeight - GAME_CONFIG.height;
    
    this.tweens.add({
      targets: this.creditsContainer,
      y: endY,
      duration: scrollDuration,
      ease: 'Linear',
      onComplete: () => {
        // Fade out and return to intro or main menu
        this.cameras.main.fadeOut(2000, 0, 0, 0);
        this.time.delayedCall(2000, () => {
          // Restart the game or go to intro scene
          this.scene.start('IntroScene');
        });
      }
    });
  }

  update() {
    // Optional: Allow skipping credits with spacebar or enter
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('SPACE'), 500) ||
        this.input.keyboard.checkDown(this.input.keyboard.addKey('ENTER'), 500)) {
      this.skipCredits();
    }
  }

  skipCredits() {
    // Stop all tweens
    this.tweens.killAll();
    
    // Fade out quickly
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('IntroScene');
    });
  }
}
