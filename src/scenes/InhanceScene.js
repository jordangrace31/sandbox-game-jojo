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
    
    // Create exit door
    this.createExitDoor();
    
    // Quest tracking
    this.hasSpokenToTom = false;
    this.codingQuestCompleted = false;
    this.computerViewActive = false;
    
    // Store first desk position for computer interaction
    this.playerDeskPosition = { x: 250, y: GAME_CONFIG.height - 140 };
    
    // Fade in from black
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update() {
    // Handle dev tools input if computer view is active
    if (this.computerViewActive) {
      this.updateDevTools();
      return;
    }
    
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
    
    // Check for computer interaction (only after talking to Tom)
    this.checkComputerInteraction();
    
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
    
    // Track if player has spoken to Tom
    if (npc === this.tom && !this.hasSpokenToTom) {
      this.hasSpokenToTom = true;
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
      this.playerDeskPosition.x,
      this.playerDeskPosition.y
    );
    
    const interactionDistance = 80;
    
    if (distance < interactionDistance) {
      // Show computer prompt
      if (!this.computerPrompt) {
        this.computerPrompt = this.add.text(
          this.playerDeskPosition.x,
          this.playerDeskPosition.y - 60,
          'Press E to check your computer',
          {
            fontSize: '12px',
            fill: '#00ffff',
            backgroundColor: '#000000',
            padding: { x: 6, y: 3 }
          }
        );
        this.computerPrompt.setOrigin(0.5);
        this.computerPrompt.setDepth(1001);
      }
      
      // Check if E key is pressed
      if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
        this.openComputerView();
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
   * Open the computer view with dev tools simulation
   */
  openComputerView() {
    this.computerViewActive = true;
    
    // Hide the computer prompt
    if (this.computerPrompt) {
      this.computerPrompt.destroy();
      this.computerPrompt = null;
    }
    
    // Initialize margin values (button starts off-center)
    this.marginValues = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    };
    this.selectedProperty = 'left'; // Currently selected margin property
    this.devElements = []; // Store all dev tools elements for cleanup
    
    // Create dark overlay
    this.computerOverlay = this.add.rectangle(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      GAME_CONFIG.width,
      GAME_CONFIG.height,
      0x000000,
      0.9
    );
    this.computerOverlay.setScrollFactor(0);
    this.computerOverlay.setDepth(2000);
    
    // Screen dimensions
    const screenWidth = 900;
    const screenHeight = 550;
    const screenX = GAME_CONFIG.width / 2;
    const screenY = GAME_CONFIG.height / 2;
    
    // Browser chrome (top bar)
    this.browserChrome = this.add.rectangle(screenX, screenY - screenHeight / 2 + 20, screenWidth, 40, 0x3c3c3c);
    this.browserChrome.setScrollFactor(0);
    this.browserChrome.setDepth(2001);
    this.devElements.push(this.browserChrome);
    
    // Browser tabs
    const tabBg = this.add.rectangle(screenX - 350, screenY - screenHeight / 2 + 20, 150, 30, 0x1e1e1e);
    tabBg.setScrollFactor(0);
    tabBg.setDepth(2002);
    this.devElements.push(tabBg);
    
    const tabText = this.add.text(screenX - 350, screenY - screenHeight / 2 + 20, 'localhost:3000', {
      fontSize: '12px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    tabText.setOrigin(0.5);
    tabText.setScrollFactor(0);
    tabText.setDepth(2003);
    this.devElements.push(tabText);
    
    // URL bar
    const urlBar = this.add.rectangle(screenX, screenY - screenHeight / 2 + 20, 400, 24, 0x252526);
    urlBar.setScrollFactor(0);
    urlBar.setDepth(2002);
    this.devElements.push(urlBar);
    
    const urlText = this.add.text(screenX, screenY - screenHeight / 2 + 20, '🔒 localhost:3000/yard', {
      fontSize: '12px',
      fill: '#aaaaaa',
      fontFamily: 'Arial'
    });
    urlText.setOrigin(0.5);
    urlText.setScrollFactor(0);
    urlText.setDepth(2003);
    this.devElements.push(urlText);
    
    // Split screen: Left = Dev Tools, Right = Web Page Preview
    const devToolsWidth = 320;
    const previewWidth = screenWidth - devToolsWidth;
    const contentY = screenY + 20;
    const contentHeight = screenHeight - 80;
    
    // === DEV TOOLS PANEL (Left) ===
    const devToolsX = screenX - screenWidth / 2 + devToolsWidth / 2;
    
    // Dev tools background
    const devToolsBg = this.add.rectangle(devToolsX, contentY, devToolsWidth, contentHeight, 0x1e1e1e);
    devToolsBg.setScrollFactor(0);
    devToolsBg.setDepth(2001);
    this.devElements.push(devToolsBg);
    
    // Dev tools header
    const devHeader = this.add.rectangle(devToolsX, contentY - contentHeight / 2 + 15, devToolsWidth, 30, 0x252526);
    devHeader.setScrollFactor(0);
    devHeader.setDepth(2002);
    this.devElements.push(devHeader);
    
    // Dev tools tabs
    const tabNames = ['Elements', 'Styles', 'Console'];
    tabNames.forEach((name, i) => {
      const tabX = devToolsX - 100 + i * 80;
      const isActive = name === 'Styles';
      const tab = this.add.text(tabX, contentY - contentHeight / 2 + 15, name, {
        fontSize: '12px',
        fill: isActive ? '#ffffff' : '#888888',
        fontFamily: 'Arial'
      });
      tab.setOrigin(0.5);
      tab.setScrollFactor(0);
      tab.setDepth(2003);
      this.devElements.push(tab);
      
      if (isActive) {
        const underline = this.add.rectangle(tabX, contentY - contentHeight / 2 + 28, 50, 2, 0x007acc);
        underline.setScrollFactor(0);
        underline.setDepth(2003);
        this.devElements.push(underline);
      }
    });
    
    // Styles panel content
    this.createStylesPanel(devToolsX, contentY - 60);
    
    // === WEB PAGE PREVIEW (Right) ===
    const previewX = screenX + devToolsWidth / 2;
    
    // Web page background (white)
    const pageBg = this.add.rectangle(previewX, contentY, previewWidth, contentHeight, 0xffffff);
    pageBg.setScrollFactor(0);
    pageBg.setDepth(2001);
    this.devElements.push(pageBg);
    
    // Web page header bar
    const headerBar = this.add.rectangle(previewX, contentY - contentHeight / 2 + 30, previewWidth, 60, 0x2c3e50);
    headerBar.setScrollFactor(0);
    headerBar.setDepth(2002);
    this.devElements.push(headerBar);
    
    // Logo text
    const logoText = this.add.text(previewX - 200, contentY - contentHeight / 2 + 30, 'Yard', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    logoText.setOrigin(0, 0.5);
    logoText.setScrollFactor(0);
    logoText.setDepth(2003);
    this.devElements.push(logoText);
    
    // Nav links
    const navLinks = ['Console', 'Workflows', 'Visits'];
    navLinks.forEach((link, i) => {
      const navText = this.add.text(previewX + 80 + i * 70, contentY - contentHeight / 2 + 30, link, {
        fontSize: '12px',
        fill: '#ecf0f1',
        fontFamily: 'Arial'
      });
      navText.setOrigin(0.5);
      navText.setScrollFactor(0);
      navText.setDepth(2003);
      this.devElements.push(navText);
    });
    
    // Page content area
    const pageContentY = contentY + 20;
    
    // Headline
    const headline = this.add.text(previewX, pageContentY - 80, 'Yard Platform', {
      fontSize: '24px',
      fill: '#2c3e50',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    headline.setOrigin(0.5);
    headline.setScrollFactor(0);
    headline.setDepth(2003);
    this.devElements.push(headline);
    
    // Subtext
    const subtext = this.add.text(previewX, pageContentY - 45, 'The best solution for your yard', {
      fontSize: '14px',
      fill: '#7f8c8d',
      fontFamily: 'Arial'
    });
    subtext.setOrigin(0.5);
    subtext.setScrollFactor(0);
    subtext.setDepth(2003);
    this.devElements.push(subtext);
    
    // Container box (visual guide)
    this.containerBox = this.add.rectangle(previewX, pageContentY + 60, 400, 150, 0xecf0f1);
    this.containerBox.setStrokeStyle(2, 0xbdc3c7, 1);
    this.containerBox.setScrollFactor(0);
    this.containerBox.setDepth(2002);
    this.devElements.push(this.containerBox);
    
    // Container label
    const containerLabel = this.add.text(previewX, pageContentY - 10, '.button-container', {
      fontSize: '10px',
      fill: '#95a5a6',
      fontFamily: 'Courier New'
    });
    containerLabel.setOrigin(0.5);
    containerLabel.setScrollFactor(0);
    containerLabel.setDepth(2003);
    this.devElements.push(containerLabel);
    
    // THE BUTTON (this is what we're centering!)
    this.targetButton = this.add.rectangle(0, 0, 120, 40, 0x3498db);
    this.targetButton.setScrollFactor(0);
    this.targetButton.setDepth(2004);
    this.devElements.push(this.targetButton);
    
    this.buttonText = this.add.text(0, 0, 'Poo', {
      fontSize: '14px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.buttonText.setOrigin(0.5);
    this.buttonText.setScrollFactor(0);
    this.buttonText.setDepth(2005);
    this.devElements.push(this.buttonText);
    
    // Store container bounds for button positioning
    this.containerBounds = {
      x: previewX - 200,
      y: pageContentY - 15,
      width: 400,
      height: 150
    };
    
    // Update button position based on margins
    this.updateButtonPosition();
    
    // Instructions
    this.instructionText = this.add.text(
      screenX,
      screenY + screenHeight / 2 - 25,
      'Use number keys [1-9] to adjust margin-left. Center the Poo button! | Press [TAB] to change property | [ESC] to close',
      {
        fontSize: '15px',
        fill: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
        fontFamily: 'Courier New'
      }
    );
    this.instructionText.setOrigin(0.5);
    this.instructionText.setScrollFactor(0);
    this.instructionText.setDepth(2010);
    this.devElements.push(this.instructionText);
    
    // Set up number key listeners
    this.setupDevToolsControls();
  }

  /**
   * Create the Styles panel in dev tools
   */
  createStylesPanel(x, y) {
    const startY = y;
    const lineHeight = 18;
    
    // Element selector
    const selectorBg = this.add.rectangle(x, startY - 50, 300, 25, 0x264f78);
    selectorBg.setScrollFactor(0);
    selectorBg.setDepth(2003);
    this.devElements.push(selectorBg);
    
    const selectorText = this.add.text(x, startY - 50, 'button.cta-button', {
      fontSize: '12px',
      fill: '#9cdcfe',
      fontFamily: 'Courier New'
    });
    selectorText.setOrigin(0.5);
    selectorText.setScrollFactor(0);
    selectorText.setDepth(2004);
    this.devElements.push(selectorText);
    
    // Styles header
    const stylesHeader = this.add.text(x - 130, startY - 25, 'element.style {', {
      fontSize: '12px',
      fill: '#d4d4d4',
      fontFamily: 'Courier New'
    });
    stylesHeader.setScrollFactor(0);
    stylesHeader.setDepth(2004);
    this.devElements.push(stylesHeader);
    
    // Margin properties
    const properties = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'];
    const propKeys = ['top', 'right', 'bottom', 'left'];
    
    this.marginTexts = {};
    this.marginValueTexts = {};
    this.marginHighlights = {};
    
    properties.forEach((prop, i) => {
      const propY = startY + i * lineHeight;
      const key = propKeys[i];
      
      // Highlight background (for selected property)
      const highlight = this.add.rectangle(x, propY + 5, 290, lineHeight, 0x264f78, 0);
      highlight.setScrollFactor(0);
      highlight.setDepth(2003);
      this.marginHighlights[key] = highlight;
      this.devElements.push(highlight);
      
      // Property name
      const propText = this.add.text(x - 120, propY, `  ${prop}:`, {
        fontSize: '12px',
        fill: '#9cdcfe',
        fontFamily: 'Courier New'
      });
      propText.setScrollFactor(0);
      propText.setDepth(2004);
      this.marginTexts[key] = propText;
      this.devElements.push(propText);
      
      // Property value (editable)
      const valueText = this.add.text(x + 20, propY, `${this.marginValues[key]}px;`, {
        fontSize: '12px',
        fill: '#ce9178',
        fontFamily: 'Courier New'
      });
      valueText.setScrollFactor(0);
      valueText.setDepth(2004);
      this.marginValueTexts[key] = valueText;
      this.devElements.push(valueText);
    });
    
    // Closing brace
    const closeBrace = this.add.text(x - 130, startY + 4 * lineHeight + 5, '}', {
      fontSize: '12px',
      fill: '#d4d4d4',
      fontFamily: 'Courier New'
    });
    closeBrace.setScrollFactor(0);
    closeBrace.setDepth(2004);
    this.devElements.push(closeBrace);
    
    // Other CSS properties (static display)
    const otherProps = [
      { prop: 'background-color', value: '#3498db' },
      { prop: 'color', value: '#ffffff' },
      { prop: 'padding', value: '10px 20px' },
      { prop: 'border-radius', value: '5px' },
      { prop: 'cursor', value: 'pointer' }
    ];
    
    const otherY = startY + 5 * lineHeight + 20;
    
    const otherHeader = this.add.text(x - 130, otherY, '.cta-button {', {
      fontSize: '12px',
      fill: '#d4d4d4',
      fontFamily: 'Courier New'
    });
    otherHeader.setScrollFactor(0);
    otherHeader.setDepth(2004);
    this.devElements.push(otherHeader);
    
    otherProps.forEach((item, i) => {
      const propY = otherY + 15 + i * 15;
      const text = this.add.text(x - 120, propY, `  ${item.prop}: ${item.value};`, {
        fontSize: '10px',
        fill: '#6a9955',
        fontFamily: 'Courier New'
      });
      text.setScrollFactor(0);
      text.setDepth(2004);
      this.devElements.push(text);
    });
    
    const otherClose = this.add.text(x - 130, otherY + 15 + otherProps.length * 15, '}', {
      fontSize: '12px',
      fill: '#d4d4d4',
      fontFamily: 'Courier New'
    });
    otherClose.setScrollFactor(0);
    otherClose.setDepth(2004);
    this.devElements.push(otherClose);
    
    // Update highlight for selected property
    this.updatePropertyHighlight();
  }

  /**
   * Set up keyboard controls for dev tools
   */
  setupDevToolsControls() {
    // Number keys 1-9
    this.numberKeys = [];
    for (let i = 1; i <= 9; i++) {
      const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[`${i === 0 ? 'ZERO' : i.toString().toUpperCase()}`] || (48 + i));
      this.numberKeys.push({ key, value: i * 10 }); // 10, 20, 30... 90
    }
    
    // Also add 0 for 0px
    const zeroKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO);
    this.numberKeys.push({ key: zeroKey, value: 0 });
    
    // Tab to switch properties
    this.tabKey = this.input.keyboard.addKey('TAB');
    
    // ESC to close
    this.escKey = this.input.keyboard.addKey('ESC');
    
    // Arrow keys for fine control
    this.upKey = this.input.keyboard.addKey('UP');
    this.downKey = this.input.keyboard.addKey('DOWN');
    
    // Store property order for cycling
    this.propertyOrder = ['top', 'right', 'bottom', 'left'];
    this.propertyIndex = 3; // Start with margin-left selected
  }

  /**
   * Update method for dev tools (called when computer view is active)
   */
  updateDevTools() {
    if (!this.computerViewActive) return;
    
    // Check number keys
    this.numberKeys.forEach(({ key, value }) => {
      if (Phaser.Input.Keyboard.JustDown(key)) {
        this.marginValues[this.selectedProperty] = value;
        this.updateMarginDisplay();
        this.updateButtonPosition();
        this.checkIfCentered();
      }
    });
    
    // Check tab key
    if (Phaser.Input.Keyboard.JustDown(this.tabKey)) {
      this.propertyIndex = (this.propertyIndex + 1) % this.propertyOrder.length;
      this.selectedProperty = this.propertyOrder[this.propertyIndex];
      this.updatePropertyHighlight();
      this.updateInstructionText();
    }
    
    // Check arrow keys for fine control
    if (Phaser.Input.Keyboard.JustDown(this.upKey)) {
      this.marginValues[this.selectedProperty] = Math.min(200, this.marginValues[this.selectedProperty] + 5);
      this.updateMarginDisplay();
      this.updateButtonPosition();
      this.checkIfCentered();
    }
    if (Phaser.Input.Keyboard.JustDown(this.downKey)) {
      this.marginValues[this.selectedProperty] = Math.max(0, this.marginValues[this.selectedProperty] - 5);
      this.updateMarginDisplay();
      this.updateButtonPosition();
      this.checkIfCentered();
    }
    
    // Check ESC key
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.closeComputerView();
    }
  }

  /**
   * Update instruction text based on selected property
   */
  updateInstructionText() {
    if (this.instructionText) {
      this.instructionText.setText(
        `Use [1-9] to set margin-${this.selectedProperty} | [↑↓] fine adjust | [TAB] change property | [ESC] close`
      );
    }
  }

  /**
   * Update the margin value display
   */
  updateMarginDisplay() {
    Object.keys(this.marginValueTexts).forEach(key => {
      this.marginValueTexts[key].setText(`${this.marginValues[key]}px;`);
    });
  }

  /**
   * Update property highlight
   */
  updatePropertyHighlight() {
    Object.keys(this.marginHighlights).forEach(key => {
      this.marginHighlights[key].setAlpha(key === this.selectedProperty ? 0.5 : 0);
    });
  }

  /**
   * Update button position based on margin values
   */
  updateButtonPosition() {
    if (!this.targetButton || !this.containerBounds) return;
    
    // Calculate button position within container based on margins
    // The button should be positioned relative to the container
    const containerCenterX = this.containerBounds.x + this.containerBounds.width / 2;
    const containerCenterY = this.containerBounds.y + this.containerBounds.height / 2;
    
    // Apply margins (left pushes right, top pushes down)
    const buttonX = this.containerBounds.x + this.marginValues.left + 60;
    const buttonY = this.containerBounds.y + this.marginValues.top + 20;
    
    this.targetButton.setPosition(buttonX, buttonY);
    this.buttonText.setPosition(buttonX, buttonY);
  }

  /**
   * Check if the button is centered
   */
  checkIfCentered() {
    // Button is centered when margin-left = 140 (centers in 400px container with 120px button)
    // (400 - 120) / 2 = 140
    const targetMarginLeft = 140;
    const targetMarginTop = 55; // Vertical center: (150 - 40) / 2 = 55
    
    const isHorizontallyCentered = Math.abs(this.marginValues.left - targetMarginLeft) <= 5;
    const isVerticallyCentered = Math.abs(this.marginValues.top - targetMarginTop) <= 5;
    
    if (isHorizontallyCentered && isVerticallyCentered) {
      this.completeCodeQuest();
    }
  }

  /**
   * Complete the coding quest
   */
  completeCodeQuest() {
    if (this.codingQuestCompleted) return;
    this.codingQuestCompleted = true;
    
    // Flash the button green
    this.targetButton.setFillStyle(0x27ae60);
    
    // Show success message
    const successText = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      '✓ PERFECTLY CENTERED!\n\n🎉 Quest Complete: CSS Master!\n+200 XP',
      {
        fontSize: '24px',
        fill: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 30, y: 20 },
        align: 'center',
        fontFamily: 'Courier New'
      }
    );
    successText.setOrigin(0.5);
    successText.setScrollFactor(0);
    successText.setDepth(2020);
    this.devElements.push(successText);
    
    // Close after delay
    this.time.delayedCall(3000, () => {
      this.closeComputerView();
      
      // Show Tom's reaction
      this.time.delayedCall(500, () => {
        this.dialogueManager.startDialogue('Tom', [
          "Whoa, you actually did it!",
          "The button is perfectly centered now!",
          "You're a CSS wizard! Thanks so much!"
        ]);
      });
    });
  }

  /**
   * Close the computer view
   */
  closeComputerView() {
    this.computerViewActive = false;
    
    // Destroy all dev tools elements
    if (this.devElements) {
      this.devElements.forEach(element => {
        if (element && element.destroy) element.destroy();
      });
      this.devElements = [];
    }
    
    // Destroy overlay
    if (this.computerOverlay) {
      this.computerOverlay.destroy();
      this.computerOverlay = null;
    }
    
    // Clean up keyboard listeners
    if (this.numberKeys) {
      this.numberKeys.forEach(({ key }) => key.destroy());
      this.numberKeys = [];
    }
    if (this.tabKey) {
      this.tabKey.destroy();
      this.tabKey = null;
    }
    if (this.escKey) {
      this.escKey.destroy();
      this.escKey = null;
    }
    if (this.upKey) {
      this.upKey.destroy();
      this.upKey = null;
    }
    if (this.downKey) {
      this.downKey.destroy();
      this.downKey = null;
    }
    
    // Clean up references
    this.marginTexts = null;
    this.marginValueTexts = null;
    this.marginHighlights = null;
    this.targetButton = null;
    this.buttonText = null;
    this.containerBounds = null;
  }
}

