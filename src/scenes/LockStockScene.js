/**
 * LockStockScene
 * A street scene with a building featuring the Lock Stock logo
 */

import Phaser from 'phaser';
import Player from '../entities/Player.js';
import AnimationManager from '../systems/AnimationManager.js';
import DialogueManager from '../systems/DialogueManager.js';
import MusicManager from '../systems/MusicManager.js';
import { PLAYER_CONFIG, GAME_CONFIG } from '../config.js';

export default class LockStockScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LockStockScene' });
  }

  create() {
    // Set world bounds (smaller scene)
    this.sceneWidth = 1600;
    this.sceneHeight = 700;
    this.physics.world.setBounds(0, 0, this.sceneWidth, this.sceneHeight);
    
    // Initialize systems
    this.animationManager = new AnimationManager(this);
    this.dialogueManager = new DialogueManager(this);
    this.musicManager = new MusicManager(this);
    
    // Create the world
    this.createSky();
    this.createStreet();
    this.createSidewalk();
    this.createBuilding();
    
    // Create the player
    this.player = new Player(this, 200, 550);
    this.player.setDepth(1000);
    
    // Set up camera
    this.cameras.main.setBounds(0, 0, this.sceneWidth, this.sceneHeight);
    
    // Set up collisions
    this.physics.add.collider(this.player, this.groundPlatform);
    
    // Set up interaction key
    this.interactionKey = this.input.keyboard.addKey('E');
    
    // Set up exit key
    this.exitKey = this.input.keyboard.addKey('Q');
    
    // Add exit prompt
    this.createExitPrompt();
    
    // Fade in from black
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update() {
    // Update player
    this.player.update();
    
    // Update dialogue manager
    if (this.dialogueManager) {
      this.dialogueManager.update();
    }
    
    // Check for exit
    this.checkExit();
  }

  /**
   * Check if player wants to exit the scene
   */
  checkExit() {
    if (Phaser.Input.Keyboard.JustDown(this.exitKey)) {
      this.returnToMainScene();
    }
  }

  /**
   * Return to the main scene
   */
  returnToMainScene() {
    // Fade out
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    
    // Wait for fade out to complete before switching scenes
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Get main scene
      const mainScene = this.scene.get('MainScene');
      
      // Stop this scene and resume MainScene
      this.scene.stop('LockStockScene');
      this.scene.resume('MainScene');
      
      // Fade back in to MainScene and restart music
      if (mainScene) {
        mainScene.cameras.main.fadeIn(1000, 0, 0, 0);
        
        // Restart music when returning
        if (mainScene.musicManager) {
          mainScene.musicManager.play('dear_katara', 0.5, true, 2000);
        }
      }
    });
  }

  /**
   * Create exit prompt
   */
  createExitPrompt() {
    this.exitPrompt = this.add.text(
      GAME_CONFIG.width / 2,
      30,
      'Press Q to return to main area',
      {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    this.exitPrompt.setOrigin(0.5);
    this.exitPrompt.setScrollFactor(0);
    this.exitPrompt.setDepth(2000);
  }

  /**
   * Create a daytime sky background
   */
  createSky() {
    const gradient = this.add.graphics();
    
    const strips = 50;
    const stripHeight = GAME_CONFIG.height / strips;
    
    for (let i = 0; i < strips; i++) {
      const progress = i / strips;
      // Light blue sky
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.HexStringToColor('#87CEEB'), // Sky blue at top
        Phaser.Display.Color.HexStringToColor('#B0E0E6'), // Powder blue at bottom
        strips,
        i
      );
      
      gradient.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      gradient.fillRect(0, i * stripHeight, this.sceneWidth, stripHeight);
    }
    
    gradient.setScrollFactor(0);
  }

  /**
   * Create the street (road)
   */
  createStreet() {
    const streetY = GAME_CONFIG.height - 120;
    
    // Dark grey asphalt
    const street = this.add.graphics();
    street.fillStyle(0x3a3a3a, 1);
    street.fillRect(0, streetY, 1600, 120);
    
    // Add some road markings
    this.createRoadMarkings(streetY);
  }

  /**
   * Create road markings (dashed lines)
   */
  createRoadMarkings(streetY) {
    const markings = this.add.graphics();
    markings.lineStyle(3, 0xffff00, 1);
    
    const centerY = streetY + 60;
    const dashLength = 30;
    const gapLength = 20;
    
    for (let x = 0; x < 1600; x += dashLength + gapLength) {
      markings.beginPath();
      markings.moveTo(x, centerY);
      markings.lineTo(x + dashLength, centerY);
      markings.strokePath();
    }
  }

  /**
   * Create the sidewalk
   */
  createSidewalk() {
    const sidewalkY = GAME_CONFIG.height - 140;
    
    // Create main sidewalk platform (physics body)
    this.groundPlatform = this.add.rectangle(
      800,
      sidewalkY + 10,
      1600,
      40,
      0x8B8B8B // Light grey
    );
    this.physics.add.existing(this.groundPlatform, true);
    
    // Sidewalk surface with tiles
    const sidewalk = this.add.graphics();
    sidewalk.fillStyle(0xc0c0c0, 1);
    sidewalk.fillRect(0, sidewalkY - 20, 1600, 40);
    
    // Add tile lines
    sidewalk.lineStyle(2, 0x909090, 0.5);
    
    // Vertical lines
    for (let x = 0; x < 1600; x += 80) {
      sidewalk.beginPath();
      sidewalk.moveTo(x, sidewalkY - 20);
      sidewalk.lineTo(x, sidewalkY + 20);
      sidewalk.strokePath();
    }
    
    // Horizontal lines
    for (let y = sidewalkY - 20; y < sidewalkY + 20; y += 20) {
      sidewalk.beginPath();
      sidewalk.moveTo(0, y);
      sidewalk.lineTo(1600, y);
      sidewalk.strokePath();
    }
  }

  /**
   * Create the building on the right side with the Lock Stock sign
   */
  createBuilding() {
    const buildingX = 1200;
    const buildingY = 200;
    const buildingWidth = 400;
    const buildingHeight = 400;
    
    // Building container
    const building = this.add.graphics();
    
    // Main building (brick color)
    building.fillStyle(0x8B4513, 1);
    building.fillRect(buildingX, buildingY, buildingWidth, buildingHeight);
    
    // Building outline
    building.lineStyle(3, 0x654321, 1);
    building.strokeRect(buildingX, buildingY, buildingWidth, buildingHeight);
    
    // Add brick texture
    this.createBrickTexture(building, buildingX, buildingY, buildingWidth, buildingHeight);
    
    // Add windows
    this.createWindows(buildingX, buildingY);
    
    // Add door
    this.createDoor(buildingX + 50, buildingY + buildingHeight - 100);
    
    // Add the Lock Stock logo sign at the top
    this.createSign(buildingX, buildingY);
  }

  /**
   * Create brick texture pattern
   */
  createBrickTexture(graphics, x, y, width, height) {
    graphics.lineStyle(1, 0x654321, 0.3);
    
    const brickHeight = 20;
    const brickWidth = 60;
    
    for (let row = 0; row < height / brickHeight; row++) {
      const offsetX = (row % 2 === 0) ? 0 : brickWidth / 2;
      const currentY = y + row * brickHeight;
      
      for (let col = 0; col < (width / brickWidth) + 1; col++) {
        const currentX = x + col * brickWidth + offsetX;
        graphics.strokeRect(currentX, currentY, brickWidth, brickHeight);
      }
    }
  }

  /**
   * Create windows on the building
   */
  createWindows(buildingX, buildingY) {
    const windowWidth = 60;
    const windowHeight = 80;
    const windowColor = 0x87CEEB;
    
    // Row 1
    for (let i = 0; i < 3; i++) {
      const x = buildingX + 80 + i * 100;
      const y = buildingY + 120;
      
      const windowRect = this.add.rectangle(x, y, windowWidth, windowHeight, windowColor);
      windowRect.setStrokeStyle(3, 0x4a4a4a);
      
      // Window panes
      const pane1 = this.add.line(x, y, 0, -windowHeight / 2, 0, windowHeight / 2, 0x4a4a4a);
      pane1.setLineWidth(2);
      
      const pane2 = this.add.line(x, y, -windowWidth / 2, 0, windowWidth / 2, 0, 0x4a4a4a);
      pane2.setLineWidth(2);
    }
    
    // Row 2
    for (let i = 0; i < 3; i++) {
      const x = buildingX + 80 + i * 100;
      const y = buildingY + 240;
      
      const windowRect = this.add.rectangle(x, y, windowWidth, windowHeight, windowColor);
      windowRect.setStrokeStyle(3, 0x4a4a4a);
      
      // Window panes
      const pane1 = this.add.line(x, y, 0, -windowHeight / 2, 0, windowHeight / 2, 0x4a4a4a);
      pane1.setLineWidth(2);
      
      const pane2 = this.add.line(x, y, -windowWidth / 2, 0, windowWidth / 2, 0, 0x4a4a4a);
      pane2.setLineWidth(2);
    }
  }

  /**
   * Create a door
   */
  createDoor(x, y) {
    const doorWidth = 60;
    const doorHeight = 100;
    
    const door = this.add.rectangle(x + doorWidth / 2, y + doorHeight / 2, doorWidth, doorHeight, 0x654321);
    door.setStrokeStyle(3, 0x3a2617);
    
    // Door knob
    const knob = this.add.circle(x + doorWidth - 10, y + doorHeight / 2, 4, 0xffd700);
  }

  /**
   * Create the sign with Lock Stock logo
   */
  createSign(buildingX, buildingY) {
    // Sign background panel
    const signWidth = 350;
    const signHeight = 100;
    const signX = buildingX + 25;
    const signY = buildingY + 10;
    
    // Dark background for the sign
    const signBg = this.add.rectangle(signX + signWidth / 2, signY + signHeight / 2, signWidth, signHeight, 0x2a2a2a);
    signBg.setStrokeStyle(5, 0x1a1a1a);
    
    // Add the Lock Stock logo
    const logo = this.add.image(signX + signWidth / 2, signY + signHeight / 2, 'lock-stock-logo');
    logo.setOrigin(0.5);
    
    // Scale the logo to fit the sign (adjust as needed based on actual logo size)
    const scaleX = (signWidth - 20) / logo.width;
    const scaleY = (signHeight - 20) / logo.height;
    const scale = Math.min(scaleX, scaleY);
    logo.setScale(scale);
    
    // Add some decorative lights around the sign
    this.createSignLights(signX, signY, signWidth, signHeight);
  }

  /**
   * Create decorative lights around the sign
   */
  createSignLights(x, y, width, height) {
    const lightPositions = [
      { x: x, y: y },
      { x: x + width / 2, y: y },
      { x: x + width, y: y },
      { x: x, y: y + height },
      { x: x + width / 2, y: y + height },
      { x: x + width, y: y + height }
    ];
    
    lightPositions.forEach((pos, index) => {
      const light = this.add.circle(pos.x, pos.y, 5, 0xffff00, 0.8);
      
      // Blinking animation
      this.tweens.add({
        targets: light,
        alpha: 0.2,
        duration: 500 + index * 100,
        yoyo: true,
        repeat: -1
      });
    });
  }
}

