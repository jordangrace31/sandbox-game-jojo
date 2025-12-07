/**
 * InhanceScene
 * An office scene with the Inhance branding
 */

import Phaser from 'phaser';
import Player from '../entities/Player.js';
import AnimationManager from '../systems/AnimationManager.js';
import DialogueManager from '../systems/DialogueManager.js';
import MusicManager from '../systems/MusicManager.js';
import { PLAYER_CONFIG, GAME_CONFIG } from '../config.js';

export default class InhanceScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InhanceScene' });
  }

  create() {
    // Set world bounds (office scene)
    const sceneWidth = 1400;
    const sceneHeight = 700;
    this.physics.world.setBounds(0, 0, sceneWidth, sceneHeight);
    
    // Initialize systems
    this.animationManager = new AnimationManager(this);
    this.dialogueManager = new DialogueManager(this);
    this.musicManager = new MusicManager(this);
    
    // Start office music (using lock_stock as placeholder)
    this.musicManager.play('lock_stock', 0.3, true, 1500);
    
    // Create the office environment
    this.createOfficeBackground();
    this.createFloor();
    this.createInhanceLogo();
    this.createOfficeDecorations();
    
    // Create the player
    this.player = new Player(this, 100, 550);
    this.player.setDepth(1000);
    
    // Set up camera
    this.cameras.main.setBounds(0, 0, sceneWidth, sceneHeight);
    
    // Set up collisions
    this.physics.add.collider(this.player, this.groundPlatform);
    
    // Set up interaction key for exit
    this.interactionKey = this.input.keyboard.addKey('E');
    
    // Create exit door
    this.createExitDoor();
    
    // Fade in from black
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    
    // Show welcome dialogue
    this.time.delayedCall(1500, () => {
      this.showWelcomeDialogue();
    });
  }

  update() {
    // Update player
    this.player.update();
    
    // Update dialogue manager
    if (this.dialogueManager) {
      this.dialogueManager.update();
    }
    
    // Check for exit door interaction
    this.checkExitDoorInteraction();
  }

  /**
   * Create office background with professional colors
   */
  createOfficeBackground() {
    const gradient = this.add.graphics();
    
    // Create a clean office wall gradient (light gray to slightly darker)
    const strips = 50;
    const stripHeight = GAME_CONFIG.height / strips;
    
    for (let i = 0; i < strips; i++) {
      const progress = i / strips;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.HexStringToColor('#e8e8e8'), // Light gray
        Phaser.Display.Color.HexStringToColor('#c8c8c8'), // Slightly darker gray
        strips,
        i
      );
      
      gradient.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      gradient.fillRect(0, i * stripHeight, 1400, stripHeight);
    }
    
    gradient.setScrollFactor(0);
  }

  /**
   * Create office floor
   */
  createFloor() {
    const groundY = GAME_CONFIG.height - 100;
    
    // Create main ground platform (physics body)
    this.groundPlatform = this.add.rectangle(
      700,
      groundY + 40,
      1400,
      40,
      0x4a4a4a // Dark gray floor
    );
    this.physics.add.existing(this.groundPlatform, true);
    
    // Add office carpet/floor tiles
    const floorGraphics = this.add.graphics();
    
    // Main floor area (wood or carpet)
    floorGraphics.fillStyle(0x8B7355, 1); // Brown wood color
    floorGraphics.fillRect(0, groundY, 1400, 100);
    
    // Add tile lines for effect
    floorGraphics.lineStyle(2, 0x6b5345, 0.5);
    for (let x = 0; x < 1400; x += 100) {
      floorGraphics.lineBetween(x, groundY, x, groundY + 100);
    }
  }

  /**
   * Create Inhance logo at the top of the scene
   */
  createInhanceLogo() {
    const logoX = 700;
    const logoY = 150;
    
    // Add the Inhance logo
    this.logo = this.add.image(logoX, logoY, 'inhance-logo');
    this.logo.setScale(0.5); // Adjust scale as needed
    this.logo.setDepth(100);
    
    // Optional: Add a subtle glow or highlight around the logo
    const logoBackground = this.add.rectangle(logoX, logoY, 400, 150, 0xffffff, 0.3);
    logoBackground.setDepth(99);
    
    // Add some text below the logo
    this.welcomeText = this.add.text(
      logoX,
      logoY + 100,
      'Welcome to Inhance',
      {
        fontSize: '32px',
        fill: '#2c3e50',
        fontStyle: 'bold',
        fontFamily: 'Arial'
      }
    );
    this.welcomeText.setOrigin(0.5);
    this.welcomeText.setDepth(100);
  }

  /**
   * Create office decorations (desks, plants, etc.)
   */
  createOfficeDecorations() {
    const groundY = GAME_CONFIG.height - 100;
    
    // Create desks
    this.createDesk(250, groundY - 40);
    this.createDesk(600, groundY - 40);
    this.createDesk(950, groundY - 40);
    this.createDesk(1150, groundY - 40);
    
    // Create office plants
    this.createPlant(150, groundY - 10);
    this.createPlant(1250, groundY - 10);
    
    // Create office windows
    this.createWindows();
    
    // Create ceiling lights
    this.createCeilingLights();
  }

  /**
   * Create a desk
   */
  createDesk(x, y) {
    const desk = this.add.container(x, y);
    
    // Desk surface
    const surface = this.add.rectangle(0, 0, 120, 60, 0x5d4e37);
    
    // Desk legs
    const leg1 = this.add.rectangle(-40, 35, 10, 50, 0x4a3c28);
    const leg2 = this.add.rectangle(40, 35, 10, 50, 0x4a3c28);
    
    // Computer monitor
    const monitor = this.add.rectangle(0, -25, 40, 35, 0x1a1a1a);
    const screen = this.add.rectangle(0, -27, 35, 25, 0x4a90e2);
    
    desk.add([surface, leg1, leg2, monitor, screen]);
    desk.setDepth(500);
    
    return desk;
  }

  /**
   * Create an office plant
   */
  createPlant(x, y) {
    const plant = this.add.container(x, y);
    
    // Pot
    const pot = this.add.rectangle(0, 10, 30, 25, 0x8b4513);
    
    // Plant leaves (simple circles)
    const leaf1 = this.add.circle(-8, -5, 12, 0x228B22);
    const leaf2 = this.add.circle(8, -5, 12, 0x228B22);
    const leaf3 = this.add.circle(0, -15, 12, 0x2E8B57);
    
    plant.add([pot, leaf1, leaf2, leaf3]);
    plant.setDepth(500);
    
    return plant;
  }

  /**
   * Create office windows
   */
  createWindows() {
    const windowY = 300;
    const windowWidth = 150;
    const windowHeight = 200;
    
    // Create multiple windows
    const windowPositions = [200, 500, 900, 1200];
    
    windowPositions.forEach(x => {
      // Window frame
      const frame = this.add.rectangle(x, windowY, windowWidth, windowHeight, 0x4a4a4a);
      frame.setStrokeStyle(4, 0x2c2c2c);
      
      // Window glass (light blue tint)
      const glass = this.add.rectangle(x, windowY, windowWidth - 10, windowHeight - 10, 0x87ceeb, 0.3);
      
      // Window divider
      this.add.rectangle(x, windowY, 4, windowHeight, 0x2c2c2c);
      this.add.rectangle(x, windowY, windowWidth, 4, 0x2c2c2c);
      
      frame.setDepth(50);
      glass.setDepth(51);
    });
  }

  /**
   * Create ceiling lights
   */
  createCeilingLights() {
    const lightY = 80;
    const lightPositions = [300, 700, 1100];
    
    lightPositions.forEach(x => {
      // Light fixture
      const fixture = this.add.rectangle(x, lightY, 60, 20, 0x666666);
      
      // Light glow
      const glow = this.add.circle(x, lightY, 40, 0xffff99, 0.2);
      
      fixture.setDepth(100);
      glow.setDepth(99);
    });
  }

  /**
   * Create exit door to return to MainScene
   */
  createExitDoor() {
    const groundY = GAME_CONFIG.height - 100;
    const doorX = 1300;
    const doorY = groundY - 60;
    
    // Door frame
    this.exitDoor = this.add.rectangle(doorX, doorY, 80, 120, 0x8B4513);
    this.exitDoor.setStrokeStyle(4, 0x654321);
    
    // Door handle
    const handle = this.add.circle(doorX - 20, doorY, 5, 0xFFD700);
    
    // Door sign
    const sign = this.add.text(doorX, doorY - 80, 'EXIT', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#ff0000',
      padding: { x: 8, y: 4 }
    });
    sign.setOrigin(0.5);
    
    this.exitDoor.setDepth(500);
    handle.setDepth(501);
    sign.setDepth(501);
  }

  /**
   * Check if player is near exit door and handle interaction
   */
  checkExitDoorInteraction() {
    if (!this.player || !this.exitDoor) return;
    
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.exitDoor.x,
      this.exitDoor.y
    );
    
    const interactionDistance = 100;
    
    if (distance < interactionDistance) {
      // Show exit prompt
      if (!this.exitPrompt) {
        this.exitPrompt = this.add.text(
          this.exitDoor.x,
          this.exitDoor.y - 80,
          'Press E to exit',
          {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
          }
        );
        this.exitPrompt.setOrigin(0.5);
        this.exitPrompt.setDepth(1000);
      }
      
      // Check if E key is pressed
      if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
        this.exitToMainScene();
      }
    } else {
      // Hide prompt if player walks away
      if (this.exitPrompt) {
        this.exitPrompt.destroy();
        this.exitPrompt = null;
      }
    }
  }

  /**
   * Exit back to MainScene
   */
  exitToMainScene() {
    // Fade out music
    this.musicManager.stop(1000);
    
    // Fade out scene
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    
    // Wait for fade out to complete before switching scenes
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Stop this scene
      this.scene.stop('InhanceScene');
      
      // Resume main scene
      this.scene.resume('MainScene');
      
      // Fade main scene back in
      const mainScene = this.scene.get('MainScene');
      if (mainScene) {
        mainScene.cameras.main.fadeIn(1000, 0, 0, 0);
      }
    });
  }

  /**
   * Show welcome dialogue
   */
  showWelcomeDialogue() {
    this.dialogueManager.startDialogue(
      'Office Manager',
      'Welcome to Inhance! This is our office space. Feel free to look around!'
    );
  }
}

