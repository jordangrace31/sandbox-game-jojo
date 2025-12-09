/**
 * InhanceScene
 * An office scene with the Inhance branding
 */

import Phaser from 'phaser';
import Player from '../entities/Player.js';
import NPC from '../entities/NPC.js';
import AnimationManager from '../systems/AnimationManager.js';
import DialogueManager from '../systems/DialogueManager.js';
import MusicManager from '../systems/MusicManager.js';
import { PLAYER_CONFIG, GAME_CONFIG } from '../config.js';
import { getNPCData } from '../data/npcs.js';

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
    this.player = new Player(this, 250, 550);
    this.player.setDepth(1000);
    
    // Create Luna NPC
    this.createLuna();
    
    // Create NPCs
    this.createNPCs();
    
    // Set up camera
    this.cameras.main.setBounds(0, 0, sceneWidth, sceneHeight);
    
    // Set up collisions
    this.physics.add.collider(this.player, this.groundPlatform);
    this.physics.add.collider(this.lunaGirl, this.groundPlatform);
    if (this.npcs) {
      this.npcs.forEach(npc => {
        this.physics.add.collider(npc, this.groundPlatform);
      });
    }
    
    // Set up interaction key for exit
    this.interactionKey = this.input.keyboard.addKey('E');
    
    // Quest tracking
    this.hasSpokenToTom = false;
    this.codingQuestActive = false;
    this.codingQuestCompleted = false;
    this.computerOpen = false;
    
    // Store first desk position (player's desk)
    this.playerDesk = { x: 250, y: GAME_CONFIG.height - 140 };
    
    // Create exit door
    this.createExitDoor();
    
    // Fade in from black
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update() {
    // Update player
    this.player.update();
    
    // Update Luna
    if (this.lunaGirl) {
      this.lunaGirl.update();
    }
    
    // Update NPCs
    if (this.npcs) {
      this.npcs.forEach(npc => npc.update());
    }
    
    // Update dialogue manager
    if (this.dialogueManager) {
      this.dialogueManager.update();
    }
    
    // Check for NPC interactions
    this.checkNPCInteractions();
    
    // Check for computer interaction (player's desk)
    if (!this.computerOpen) {
      this.checkComputerInteraction();
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
   * Create Luna NPC
   */
  createLuna() {
    const groundY = GAME_CONFIG.height - 100;
    const lunaData = getNPCData('jojoGirl');
    
    this.lunaGirl = new NPC(this, 100, groundY - 20, 'jojo_girl_idle', lunaData);
    this.lunaGirl.setDepth(lunaData.depth);
    this.lunaGirl.play('girl_idle_right');
  }

  /**
   * Create NPCs (Lynne and Tom)
   */
  createNPCs() {
    const groundY = GAME_CONFIG.height - 100;
    
    // Create Lynne's idle animations (front and back)
    if (!this.anims.exists('ly_idle_front')) {
      this.anims.create({
        key: 'ly_idle_front',
        frames: this.anims.generateFrameNames('ly_idle', {
          prefix: 'ly_front_',
          start: 0,
          end: 1
        }),
        frameRate: 4,
        repeat: -1
      });
    }
    
    if (!this.anims.exists('ly_idle_back')) {
      this.anims.create({
        key: 'ly_idle_back',
        frames: this.anims.generateFrameNames('ly_idle', {
          prefix: 'ly_back_',
          start: 0,
          end: 1
        }),
        frameRate: 4,
        repeat: -1
      });
    }
    
    // Create Tom's idle animations (front and back)
    if (!this.anims.exists('tom_idle_front')) {
      this.anims.create({
        key: 'tom_idle_front',
        frames: this.anims.generateFrameNames('tom_idle', {
          prefix: 'tom_front_',
          start: 0,
          end: 1
        }),
        frameRate: 4,
        repeat: -1
      });
    }
    
    if (!this.anims.exists('tom_idle_back')) {
      this.anims.create({
        key: 'tom_idle_back',
        frames: this.anims.generateFrameNames('tom_idle', {
          prefix: 'tom_back_',
          start: 0,
          end: 1
        }),
        frameRate: 4,
        repeat: -1
      });
    }
    
    // Get NPC data from central data file
    const lynneData = getNPCData('lynne');
    const tomData = getNPCData('tom');
    
    // Create NPCs at desk positions
    this.lynne = new NPC(this, 600, groundY - 60, 'ly_idle', lynneData);
    this.lynne.setDepth(lynneData.depth);
    this.lynne.play('ly_idle_back'); // Start facing backwards
    this.lynne.isFacingPlayer = false; // Track if NPC is facing player
    
    this.tom = new NPC(this, 950, groundY - 60, 'tom_idle', tomData);
    this.tom.setDepth(tomData.depth);
    this.tom.play('tom_idle_back'); // Start facing backwards
    this.tom.isFacingPlayer = false; // Track if NPC is facing player
    
    // Store NPCs in an array for easy updates
    this.npcs = [this.lynne, this.tom];
  }

  /**
   * Check for NPC interactions
   */
  checkNPCInteractions() {
    if (!this.player || !this.npcs) return;
    
    const interactionDistance = 80;
    const turnAroundDistance = 150; // Distance at which NPC turns to face player
    
    this.npcs.forEach((npc, index) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y
      );
      
      // Handle NPC turning to face player
      if (distance < turnAroundDistance && !npc.isFacingPlayer) {
        // Turn to face the player
        npc.isFacingPlayer = true;
        const animKey = npc === this.lynne ? 'ly_idle_front' : 'tom_idle_front';
        npc.play(animKey);
      } else if (distance >= turnAroundDistance && npc.isFacingPlayer) {
        // Turn back away from player
        npc.isFacingPlayer = false;
        const animKey = npc === this.lynne ? 'ly_idle_back' : 'tom_idle_back';
        npc.play(animKey);
      }
      
      if (distance < interactionDistance) {
        // Show interaction prompt
        if (!npc.interactionPrompt) {
          npc.interactionPrompt = this.add.text(
            npc.x,
            npc.y - 60,
            'Press E to talk',
            {
              fontSize: '12px',
              fill: '#ffff00',
              backgroundColor: '#000000',
              padding: { x: 6, y: 3 }
            }
          );
          npc.interactionPrompt.setOrigin(0.5);
          npc.interactionPrompt.setDepth(1001);
        }
        
        // Update prompt position
        npc.interactionPrompt.setPosition(npc.x, npc.y - 60);
        
        // Check if E key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
          this.interactWithNPC(npc);
        }
      } else {
        // Hide prompt if player walks away
        if (npc.interactionPrompt) {
          npc.interactionPrompt.destroy();
          npc.interactionPrompt = null;
        }
      }
    });
  }

  /**
   * Interact with an NPC
   */
  interactWithNPC(npc) {
    if (!npc.dialogues || npc.dialogues.length === 0) return;
    
    // Check if this is Tom and activate quest
    if (npc === this.tom && !this.hasSpokenToTom) {
      this.hasSpokenToTom = true;
      this.codingQuestActive = true;
    }
    
    this.dialogueManager.startDialogue(npc.name, npc.dialogues);
  }

  /**
   * Check for computer interaction at player's desk
   */
  checkComputerInteraction() {
    if (!this.player || !this.hasSpokenToTom || this.codingQuestCompleted) return;
    
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.playerDesk.x,
      this.playerDesk.y
    );
    
    const interactionDistance = 80;
    
    if (distance < interactionDistance) {
      // Show computer prompt
      if (!this.computerPrompt) {
        this.computerPrompt = this.add.text(
          this.playerDesk.x,
          this.playerDesk.y - 80,
          'Press E to check your computer',
          {
            fontSize: '14px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
          }
        );
        this.computerPrompt.setOrigin(0.5);
        this.computerPrompt.setDepth(1001);
      }
      
      // Check if E key is pressed
      if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
        this.openComputer();
      }
    } else {
      // Hide prompt if player walks away
      if (this.computerPrompt) {
        this.computerPrompt.destroy();
        this.computerPrompt = null;
      }
    }
  }

  /**
   * Open computer screen with coding challenge
   */
  openComputer() {
    this.computerOpen = true;
    
    // Disable player movement
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);
    
    // Hide computer prompt
    if (this.computerPrompt) {
      this.computerPrompt.destroy();
      this.computerPrompt = null;
    }
    
    // Create computer UI overlay
    this.createComputerUI();
  }

  /**
   * Create computer UI with coding challenge
   */
  createComputerUI() {
    // Dark overlay background
    this.computerOverlay = this.add.rectangle(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      GAME_CONFIG.width,
      GAME_CONFIG.height,
      0x000000,
      0.95
    );
    this.computerOverlay.setScrollFactor(0);
    this.computerOverlay.setDepth(3000);
    
    // Computer screen frame
    const screenWidth = 800;
    const screenHeight = 500;
    const screenX = GAME_CONFIG.width / 2;
    const screenY = GAME_CONFIG.height / 2;
    
    this.computerScreen = this.add.rectangle(
      screenX,
      screenY,
      screenWidth,
      screenHeight,
      0x1a1a1a
    );
    this.computerScreen.setStrokeStyle(4, 0x4a90e2);
    this.computerScreen.setScrollFactor(0);
    this.computerScreen.setDepth(3001);
    
    // Title bar
    const titleBar = this.add.rectangle(
      screenX,
      screenY - screenHeight / 2 + 20,
      screenWidth,
      40,
      0x2d2d2d
    );
    titleBar.setScrollFactor(0);
    titleBar.setDepth(3002);
    
    const titleText = this.add.text(
      screenX - screenWidth / 2 + 20,
      screenY - screenHeight / 2 + 20,
      'VS Code - style.css',
      {
        fontSize: '16px',
        fill: '#ffffff',
        fontFamily: 'monospace'
      }
    );
    titleText.setOrigin(0, 0.5);
    titleText.setScrollFactor(0);
    titleText.setDepth(3003);
    
    // Close button
    const closeButton = this.add.text(
      screenX + screenWidth / 2 - 30,
      screenY - screenHeight / 2 + 20,
      'X',
      {
        fontSize: '20px',
        fill: '#ff0000',
        fontStyle: 'bold'
      }
    );
    closeButton.setOrigin(0.5);
    closeButton.setScrollFactor(0);
    closeButton.setDepth(3003);
    closeButton.setInteractive({ useHandCursor: true });
    closeButton.on('pointerdown', () => this.closeComputer());
    
    // Code editor content
    const codeText = `/* Parent Container */\n.container {\n  display: flex;\n  \n  \n  height: 100vh;\n}\n\n/* Child Div */\n.centered-div {\n  width: 200px;\n  height: 100px;\n}`;
    
    this.codeDisplay = this.add.text(
      screenX - screenWidth / 2 + 40,
      screenY - screenHeight / 2 + 80,
      codeText,
      {
        fontSize: '14px',
        fill: '#d4d4d4',
        fontFamily: 'monospace',
        lineSpacing: 8
      }
    );
    this.codeDisplay.setOrigin(0, 0);
    this.codeDisplay.setScrollFactor(0);
    this.codeDisplay.setDepth(3002);
    
    // Instructions
    const instructions = this.add.text(
      screenX,
      screenY + screenHeight / 2 + 40,
      'Add CSS properties to center the div!\nPress 1: justify-content: center;  |  Press 2: align-items: center;  |  Press ESC to close',
      {
        fontSize: '14px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 15, y: 8 },
        align: 'center'
      }
    );
    instructions.setOrigin(0.5);
    instructions.setScrollFactor(0);
    instructions.setDepth(3003);
    
    // Track which properties have been added
    this.cssProperties = {
      justifyContent: false,
      alignItems: false
    };
    
    // Set up keyboard input for adding CSS properties
    this.key1 = this.input.keyboard.addKey('ONE');
    this.key2 = this.input.keyboard.addKey('TWO');
    this.escKey = this.input.keyboard.addKey('ESC');
    
    // Store UI elements for cleanup
    this.computerUIElements = [
      this.computerOverlay,
      this.computerScreen,
      titleBar,
      titleText,
      closeButton,
      this.codeDisplay,
      instructions
    ];
    
    // Update loop for keyboard input
    this.computerInputHandler = () => {
      if (Phaser.Input.Keyboard.JustDown(this.key1) && !this.cssProperties.justifyContent) {
        this.addCSSProperty('justifyContent');
      }
      if (Phaser.Input.Keyboard.JustDown(this.key2) && !this.cssProperties.alignItems) {
        this.addCSSProperty('alignItems');
      }
      if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
        this.closeComputer();
      }
    };
    
    this.events.on('update', this.computerInputHandler);
  }

  /**
   * Add CSS property to the code
   */
  addCSSProperty(property) {
    this.cssProperties[property] = true;
    
    // Update code display
    let codeText = `/* Parent Container */\n.container {\n  display: flex;\n  `;
    
    if (this.cssProperties.justifyContent) {
      codeText += `justify-content: center; /* Centers horizontally */\n  `;
    }
    
    if (this.cssProperties.alignItems) {
      codeText += `align-items: center;     /* Centers vertically */\n  `;
    }
    
    codeText += `height: 100vh;\n}\n\n/* Child Div */\n.centered-div {\n  width: 200px;\n  height: 100px;\n}`;
    
    this.codeDisplay.setText(codeText);
    
    // Check if quest is complete
    if (this.cssProperties.justifyContent && this.cssProperties.alignItems) {
      this.time.delayedCall(1000, () => {
        this.completeCodingQuest();
      });
    }
  }

  /**
   * Complete the coding quest
   */
  completeCodingQuest() {
    this.codingQuestCompleted = true;
    
    // Show success message
    const successMsg = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      'SUCCESS! Div Centered!\n+50 Gold  +200 XP',
      {
        fontSize: '28px',
        fill: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 15 },
        align: 'center',
        fontStyle: 'bold'
      }
    );
    successMsg.setOrigin(0.5);
    successMsg.setScrollFactor(0);
    successMsg.setDepth(3010);
    
    // Fade out success message and close computer
    this.time.delayedCall(3000, () => {
      successMsg.destroy();
      this.closeComputer();
      
      // Show Tom's thank you message
      this.time.delayedCall(500, () => {
        this.dialogueManager.startDialogue("Tom", [
          "Amazing! You fixed it!",
          "I knew you could figure it out!",
          "Thanks for the help!"
        ]);
      });
    });
  }

  /**
   * Close computer screen
   */
  closeComputer() {
    this.computerOpen = false;
    
    // Re-enable player movement
    this.player.body.setAllowGravity(true);
    
    // Clean up UI elements
    if (this.computerUIElements) {
      this.computerUIElements.forEach(element => {
        if (element) element.destroy();
      });
      this.computerUIElements = null;
    }
    
    // Remove event listener
    if (this.computerInputHandler) {
      this.events.off('update', this.computerInputHandler);
      this.computerInputHandler = null;
    }
    
    // Remove keyboard keys
    if (this.key1) {
      this.input.keyboard.removeKey('ONE');
      this.key1 = null;
    }
    if (this.key2) {
      this.input.keyboard.removeKey('TWO');
      this.key2 = null;
    }
    if (this.escKey) {
      this.input.keyboard.removeKey('ESC');
      this.escKey = null;
    }
  }
}

