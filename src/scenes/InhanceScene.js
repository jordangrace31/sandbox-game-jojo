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
    const sceneWidth = 1400;
    const sceneHeight = 700;
    this.physics.world.setBounds(0, 0, sceneWidth, sceneHeight);
    
    this.animationManager = new AnimationManager(this);
    this.dialogueManager = new DialogueManager(this);
    this.musicManager = new MusicManager(this);
    
    this.musicManager.play('shell', 0.3, true, 1500);
    
    this.createOfficeBackground();
    this.createFloor();
    this.createInhanceLogo();
    this.createOfficeDecorations();
    
    this.player = new Player(this, 250, 550);
    this.player.setDepth(1000);
    
    this.createLuna();
    
    this.createNPCs();
    
    this.cameras.main.setBounds(0, 0, sceneWidth, sceneHeight);
    
    this.physics.add.collider(this.player, this.groundPlatform);
    this.physics.add.collider(this.lunaGirl, this.groundPlatform);
    if (this.npcs) {
      this.npcs.forEach(npc => {
        this.physics.add.collider(npc, this.groundPlatform);
      });
    }
    
    this.interactionKey = this.input.keyboard.addKey('E');
    
    this.createExitDoor();
    
    this.hasSpokenToTom = false;
    this.codingQuestCompleted = false;
    this.computerViewActive = false;
    this.buttonCentered = false;
    this.gitCommitActive = false;
    this.tomPostQuestDialogueActive = false;
    this.tomFadedOut = false;
    
    this.playerDeskPosition = { x: 250, y: GAME_CONFIG.height - 140 };
    
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update() {
    if (this.computerViewActive) {
      this.updateDevTools();
      return;
    }
    
    this.player.update();
    
    if (this.lunaGirl) {
      this.lunaGirl.update();
      
      if (this.lunaFollowEnabled && !this.computerViewActive) {
        this.updateLunaFollowBehavior();
      }
    }
    
    if (this.npcs) {
      this.npcs.forEach(npc => npc.update());
    }
    
    if (this.dialogueManager) {
      const wasDialogueActive = this.dialogueManager.isActive;
      this.dialogueManager.update();
      
      if (this.tomPostQuestDialogueActive && wasDialogueActive && !this.dialogueManager.isActive) {
        this.tomPostQuestDialogueActive = false;
        this.fadeOutTom();
      }
    }
    
    this.checkNPCInteractions();
    
    this.checkComputerInteraction();
    
    this.checkExitDoorInteraction();
  }

  createOfficeBackground() {
    const gradient = this.add.graphics();
    
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

  createInhanceLogo() {
    const logoX = 700;
    const logoY = 150;
    
    this.logo = this.add.image(logoX, logoY, 'inhance-logo');
    this.logo.setScale(0.5);
    this.logo.setDepth(100);
    
    const logoBackground = this.add.rectangle(logoX, logoY, 400, 150, 0xffffff, 0.3);
    logoBackground.setDepth(99);
  }

  createOfficeDecorations() {
    const groundY = GAME_CONFIG.height - 100;
    
    this.createDesk(250, groundY - 40);
    this.createDesk(600, groundY - 40);
    this.createDesk(950, groundY - 40);
    
    this.createPlant(150, groundY - 10);
    this.createPlant(1250, groundY - 10);
    
    this.createWindows();
    
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

  createExitDoor() {
    const groundY = GAME_CONFIG.height - 100;
    const doorX = 1300;
    const doorY = groundY - 60;
    
    this.exitDoor = this.add.rectangle(doorX, doorY, 80, 120, 0x8B4513);
    this.exitDoor.setStrokeStyle(4, 0x654321);
    
    const handle = this.add.circle(doorX - 20, doorY, 5, 0xFFD700);
    
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
      
      if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
        this.exitToMainScene();
      }
    } else {
      if (this.exitPrompt) {
        this.exitPrompt.destroy();
        this.exitPrompt = null;
      }
    }
  }

  exitToMainScene() {
    this.registry.set('returningFromInhance', true);
    
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('InhanceScene');
      
      this.scene.resume('MainScene');
      
      const mainScene = this.scene.get('MainScene');
      if (mainScene) {
        mainScene.cameras.main.fadeIn(1000, 0, 0, 0);
      }
    });
  }

  createLuna() {
    const groundY = GAME_CONFIG.height - 100;
    const lunaData = getNPCData('jojoGirl');
    
    this.lunaGirl = new NPC(this, 100, groundY - 20, 'jojo_girl_idle', lunaData);
    this.lunaGirl.setDepth(lunaData.depth);
    this.lunaGirl.play('girl_idle_right');
    
    this.lunaFollowEnabled = true;
  }

  updateLunaFollowBehavior() {
    if (!this.lunaGirl || !this.player) return;
    
    const distance = Phaser.Math.Distance.Between(
      this.lunaGirl.x,
      this.lunaGirl.y,
      this.player.x,
      this.player.y
    );
    
    const followDistance = 80;
    
    if (distance > followDistance) {
      const angle = Phaser.Math.Angle.Between(
        this.lunaGirl.x,
        this.lunaGirl.y,
        this.player.x,
        this.player.y
      );
      
      const speed = 110;
      
      this.lunaGirl.setVelocity(
        Math.cos(angle) * speed,
        0
      );
      
      const velocityX = this.lunaGirl.body.velocity.x;
      
      if (Math.abs(velocityX) > 5) {
        const animKey = 'girl_walk';
        const direction = velocityX > 0 ? 'right' : 'left';
        const fullAnimKey = `${animKey}_${direction}`;
        
        if (this.lunaGirl.anims.currentAnim?.key !== fullAnimKey) {
          this.lunaGirl.play(fullAnimKey);
        }
      }
    } else {
      this.lunaGirl.setVelocityX(0);
      
      if (!this.lunaGirl.anims.currentAnim?.key.includes('idle')) {
        const direction = this.player.x > this.lunaGirl.x ? 'right' : 'left';
        this.lunaGirl.play(`girl_idle_${direction}`);
      }
    }
  }

  createNPCs() {
    const groundY = GAME_CONFIG.height - 100;
    
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
    
    const lynneData = getNPCData('lynne');
    const tomData = getNPCData('tom');
    
    this.lynne = new NPC(this, 600, groundY - 60, 'ly_idle', lynneData);
    this.lynne.setDepth(lynneData.depth);
    this.lynne.play('ly_idle_back');
    this.lynne.isFacingPlayer = false;
    
    this.tom = new NPC(this, 950, groundY - 60, 'tom_idle', tomData);
    this.tom.setDepth(tomData.depth);
    this.tom.play('tom_idle_back');
    this.tom.isFacingPlayer = false;
    
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
      if (npc === this.tom && this.tomFadedOut) {
        if (npc.interactionPrompt) {
          npc.interactionPrompt.destroy();
          npc.interactionPrompt = null;
        }
        return;
      }
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y
      );
      
      if (distance < turnAroundDistance && !npc.isFacingPlayer) {
        npc.isFacingPlayer = true;
        const animKey = npc === this.lynne ? 'ly_idle_front' : 'tom_idle_front';
        npc.play(animKey);
      } else if (distance >= turnAroundDistance && npc.isFacingPlayer) {
        npc.isFacingPlayer = false;
        const animKey = npc === this.lynne ? 'ly_idle_back' : 'tom_idle_back';
        npc.play(animKey);
      }
      
      if (distance < interactionDistance) {
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
        
        npc.interactionPrompt.setPosition(npc.x, npc.y - 60);
        
        if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
          this.interactWithNPC(npc);
        }
      } else {
        if (npc.interactionPrompt) {
          npc.interactionPrompt.destroy();
          npc.interactionPrompt = null;
        }
      }
    });
  }

  interactWithNPC(npc) {
    if (!npc.dialogues || npc.dialogues.length === 0) return;
    
    if (npc === this.tom && !this.hasSpokenToTom) {
      this.hasSpokenToTom = true;
    }
    
    this.dialogueManager.startDialogue(npc.name, npc.dialogues);
  }

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
      
      if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
        this.openComputerView();
      }
    } else {
      if (this.computerPrompt) {
        this.computerPrompt.destroy();
        this.computerPrompt = null;
      }
    }
  }

  openComputerView() {
    this.computerViewActive = true;
    
    if (this.computerPrompt) {
      this.computerPrompt.destroy();
      this.computerPrompt = null;
    }
    
    this.marginValues = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    };
    this.selectedProperty = 'left';
    this.devElements = [];
    
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
    const screenY = GAME_CONFIG.height / 2 - 30; // Shift up to make room for stand
    
    // === MONITOR FRAME ===
    const bezelThickness = 20;
    const monitorWidth = screenWidth + bezelThickness * 2;
    const monitorHeight = screenHeight + bezelThickness * 2;
    
    // Monitor outer shadow (gives depth)
    const monitorShadow = this.add.rectangle(
      screenX + 8,
      screenY + 8,
      monitorWidth + 4,
      monitorHeight + 4,
      0x000000,
      0.5
    );
    monitorShadow.setScrollFactor(0);
    monitorShadow.setDepth(2000);
    this.devElements.push(monitorShadow);
    
    // Monitor bezel (main frame)
    const monitorBezel = this.add.rectangle(
      screenX,
      screenY,
      monitorWidth,
      monitorHeight,
      0x1a1a1a
    );
    monitorBezel.setScrollFactor(0);
    monitorBezel.setDepth(2000);
    this.devElements.push(monitorBezel);
    
    // Inner bezel highlight (subtle 3D effect)
    const innerHighlight = this.add.rectangle(
      screenX,
      screenY,
      monitorWidth - 4,
      monitorHeight - 4,
      0x2a2a2a
    );
    innerHighlight.setScrollFactor(0);
    innerHighlight.setDepth(2000);
    this.devElements.push(innerHighlight);
    
    // Screen inset (dark border around screen)
    const screenInset = this.add.rectangle(
      screenX,
      screenY,
      screenWidth + 4,
      screenHeight + 4,
      0x0a0a0a
    );
    screenInset.setScrollFactor(0);
    screenInset.setDepth(2000);
    this.devElements.push(screenInset);
    
    // Monitor logo/brand on bezel
    const brandLogo = this.add.text(
      screenX,
      screenY + monitorHeight / 2 - 10,
      '◆ INHANCE',
      {
        fontSize: '10px',
        fill: '#4a4a4a',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    );
    brandLogo.setOrigin(0.5);
    brandLogo.setScrollFactor(0);
    brandLogo.setDepth(2001);
    this.devElements.push(brandLogo);
    
    // Power LED indicator
    const powerLed = this.add.circle(
      screenX + monitorWidth / 2 - 30,
      screenY + monitorHeight / 2 - 10,
      3,
      0x00ff00
    );
    powerLed.setScrollFactor(0);
    powerLed.setDepth(2001);
    this.devElements.push(powerLed);
    
    // LED glow effect
    const ledGlow = this.add.circle(
      screenX + monitorWidth / 2 - 30,
      screenY + monitorHeight / 2 - 10,
      6,
      0x00ff00,
      0.3
    );
    ledGlow.setScrollFactor(0);
    ledGlow.setDepth(2001);
    this.devElements.push(ledGlow);
    
    // === MONITOR STAND ===
    const standNeckHeight = 40;
    const standNeckWidth = 60;
    const standBaseWidth = 180;
    const standBaseHeight = 15;
    const standY = screenY + monitorHeight / 2 + bezelThickness;
    
    // Stand neck
    const standNeck = this.add.rectangle(
      screenX,
      standY + standNeckHeight / 2,
      standNeckWidth,
      standNeckHeight,
      0x1a1a1a
    );
    standNeck.setScrollFactor(0);
    standNeck.setDepth(2000);
    this.devElements.push(standNeck);
    
    // Stand neck shadow
    const neckShadow = this.add.rectangle(
      screenX + 4,
      standY + standNeckHeight / 2 + 4,
      standNeckWidth,
      standNeckHeight,
      0x000000,
      0.3
    );
    neckShadow.setScrollFactor(0);
    neckShadow.setDepth(1999);
    this.devElements.push(neckShadow);
    
    // Stand base
    const standBase = this.add.ellipse(
      screenX,
      standY + standNeckHeight + standBaseHeight / 2,
      standBaseWidth,
      standBaseHeight * 2,
      0x1a1a1a
    );
    standBase.setScrollFactor(0);
    standBase.setDepth(2000);
    this.devElements.push(standBase);
    
    // Stand base highlight
    const baseHighlight = this.add.ellipse(
      screenX,
      standY + standNeckHeight + standBaseHeight / 2 - 2,
      standBaseWidth - 20,
      standBaseHeight,
      0x2a2a2a
    );
    baseHighlight.setScrollFactor(0);
    baseHighlight.setDepth(2000);
    this.devElements.push(baseHighlight);
    
    // Stand base shadow
    const baseShadow = this.add.ellipse(
      screenX + 5,
      standY + standNeckHeight + standBaseHeight / 2 + 5,
      standBaseWidth + 10,
      standBaseHeight * 2,
      0x000000,
      0.4
    );
    baseShadow.setScrollFactor(0);
    baseShadow.setDepth(1998);
    this.devElements.push(baseShadow);
    
    // === SCREEN EFFECTS ===
    // Subtle screen glow
    const screenGlow = this.add.rectangle(
      screenX,
      screenY,
      screenWidth + 30,
      screenHeight + 30,
      0x4a90e2,
      0.05
    );
    screenGlow.setScrollFactor(0);
    screenGlow.setDepth(2000);
    this.devElements.push(screenGlow);
    
    // Screen reflection/glare (subtle diagonal shine)
    const screenGlare = this.add.graphics();
    screenGlare.setScrollFactor(0);
    screenGlare.setDepth(2010);
    screenGlare.fillStyle(0xffffff, 0.02);
    screenGlare.beginPath();
    screenGlare.moveTo(screenX - screenWidth / 2, screenY - screenHeight / 2);
    screenGlare.lineTo(screenX - screenWidth / 2 + 200, screenY - screenHeight / 2);
    screenGlare.lineTo(screenX - screenWidth / 2, screenY - screenHeight / 2 + 150);
    screenGlare.closePath();
    screenGlare.fillPath();
    this.devElements.push(screenGlare);
    
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
    
    // Instructions (positioned below the monitor stand)
    this.instructionText = this.add.text(
      screenX,
      screenY + screenHeight / 2 + 80,
      'Use [1-9] to set margin-left | [↑↓] fine adjust | [TAB] change property | [ESC] close',
      {
        fontSize: '18px',
        fill: '#00ff00',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: { x: 15, y: 8 },
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
    
    // Don't process dev tools input if git commit is active
    if (this.gitCommitActive) return;
    
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
    
    if (isHorizontallyCentered && isVerticallyCentered && !this.buttonCentered) {
      this.buttonCentered = true;
      this.showGitCommitStep();
    }
  }

  /**
   * Show git commit step after button is centered
   */
  showGitCommitStep() {
    // Flash the button green
    this.targetButton.setFillStyle(0x27ae60);
    
    // Show initial success message
    const successText = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 - 200,
      '✓ PERFECTLY CENTERED!',
      {
        fontSize: '20px',
        fill: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 15 },
        align: 'center',
        fontFamily: 'Courier New'
      }
    );
    successText.setOrigin(0.5);
    successText.setScrollFactor(0);
    successText.setDepth(2020);
    this.devElements.push(successText);
    
    // Hide after a moment
    this.time.delayedCall(2000, () => {
      if (successText) successText.destroy();
      this.openGitTerminal();
    });
  }

  /**
   * Open git terminal interface
   */
  openGitTerminal() {
    this.gitCommitActive = true;
    this.gitTerminalElements = [];
    this.gitCommandBuffer = '';
    this.gitStep = 'status'; // status -> add -> commit -> done
    
    const screenX = GAME_CONFIG.width / 2;
    const screenY = GAME_CONFIG.height / 2;
    
    // Terminal window (VS Code style)
    const termWidth = 700;
    const termHeight = 400;
    
    // Terminal shadow
    const termShadow = this.add.rectangle(
      screenX + 4,
      screenY + 4,
      termWidth,
      termHeight,
      0x000000,
      0.5
    );
    termShadow.setScrollFactor(0);
    termShadow.setDepth(2025);
    this.gitTerminalElements.push(termShadow);
    
    // Terminal background
    const termBg = this.add.rectangle(
      screenX,
      screenY,
      termWidth,
      termHeight,
      0x1e1e1e
    );
    termBg.setStrokeStyle(2, 0x007acc);
    termBg.setScrollFactor(0);
    termBg.setDepth(2026);
    this.gitTerminalElements.push(termBg);
    
    // Terminal header bar
    const termHeader = this.add.rectangle(
      screenX,
      screenY - termHeight / 2 + 20,
      termWidth,
      40,
      0x252526
    );
    termHeader.setScrollFactor(0);
    termHeader.setDepth(2027);
    this.gitTerminalElements.push(termHeader);
    
    // Terminal title
    const termTitle = this.add.text(
      screenX - termWidth / 2 + 15,
      screenY - termHeight / 2 + 20,
      'TERMINAL',
      {
        fontSize: '12px',
        fill: '#cccccc',
        fontFamily: 'Courier New'
      }
    );
    termTitle.setOrigin(0, 0.5);
    termTitle.setScrollFactor(0);
    termTitle.setDepth(2028);
    this.gitTerminalElements.push(termTitle);
    
    // Terminal content area
    const contentStartY = screenY - termHeight / 2 + 50;
    const lineHeight = 18;
    
    // Show git status
    const statusLines = [
      '$ git status',
      'On branch main',
      'Changes not staged for commit:',
      '  modified:   src/styles/button.css',
      '',
      'no changes added to commit (use "git add <file>..." to stage)'
    ];
    
    this.terminalLines = [];
    statusLines.forEach((line, i) => {
      const lineText = this.add.text(
        screenX - termWidth / 2 + 15,
        contentStartY + i * lineHeight,
        line,
        {
          fontSize: '13px',
          fill: line.startsWith('$') ? '#4ec9b0' : line.includes('modified') ? '#ce9178' : '#cccccc',
          fontFamily: 'Courier New'
        }
      );
      lineText.setOrigin(0, 0);
      lineText.setScrollFactor(0);
      lineText.setDepth(2028);
      this.gitTerminalElements.push(lineText);
      this.terminalLines.push(lineText);
    });
    
    // Command prompt
    const promptY = contentStartY + statusLines.length * lineHeight + 20;
    this.commandPrompt = this.add.text(
      screenX - termWidth / 2 + 15,
      promptY,
      '$ ',
      {
        fontSize: '13px',
        fill: '#4ec9b0',
        fontFamily: 'Courier New'
      }
    );
    this.commandPrompt.setOrigin(0, 0);
    this.commandPrompt.setScrollFactor(0);
    this.commandPrompt.setDepth(2028);
    this.gitTerminalElements.push(this.commandPrompt);
    
    // Command input text
    this.commandInput = this.add.text(
      screenX - termWidth / 2 + 35,
      promptY,
      '',
      {
        fontSize: '13px',
        fill: '#ffffff',
        fontFamily: 'Courier New'
      }
    );
    this.commandInput.setOrigin(0, 0);
    this.commandInput.setScrollFactor(0);
    this.commandInput.setDepth(2028);
    this.gitTerminalElements.push(this.commandInput);
    
    // Cursor blink animation
    this.commandCursor = this.add.text(
      screenX - termWidth / 2 + 35,
      promptY,
      '_',
      {
        fontSize: '13px',
        fill: '#ffffff',
        fontFamily: 'Courier New'
      }
    );
    this.commandCursor.setOrigin(0, 0);
    this.commandCursor.setScrollFactor(0);
    this.commandCursor.setDepth(2028);
    this.gitTerminalElements.push(this.commandCursor);
    
    this.tweens.add({
      targets: this.commandCursor,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Instructions
    const instructionText = this.add.text(
      screenX,
      screenY + termHeight / 2 + 30,
      'Type the git commands to commit your changes!',
      {
        fontSize: '14px',
        fill: '#ffcc00',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: { x: 10, y: 5 },
        fontFamily: 'Arial'
      }
    );
    instructionText.setOrigin(0.5);
    instructionText.setScrollFactor(0);
    instructionText.setDepth(2029);
    this.gitTerminalElements.push(instructionText);
    
    // Set up keyboard input
    this.setupGitTerminalInput();
  }

  /**
   * Set up keyboard input for git terminal
   */
  setupGitTerminalInput() {
    // Create a text input handler
    this.gitInputHandler = (event) => {
      if (!this.gitCommitActive) return;
      
      // Handle Enter key
      if (event.key === 'Enter') {
        this.executeGitCommand();
        return;
      }
      
      // Handle Backspace
      if (event.key === 'Backspace') {
        this.gitCommandBuffer = this.gitCommandBuffer.slice(0, -1);
        this.updateCommandDisplay();
        return;
      }
      
      // Handle regular characters
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        this.gitCommandBuffer += event.key;
        this.updateCommandDisplay();
      }
    };
    
    this.input.keyboard.on('keydown', this.gitInputHandler);
  }

  /**
   * Update command display
   */
  updateCommandDisplay() {
    if (this.commandInput) {
      this.commandInput.setText(this.gitCommandBuffer);
      // Update cursor position
      const cursorX = GAME_CONFIG.width / 2 - 350 + 35 + this.gitCommandBuffer.length * 7.5;
      if (this.commandCursor) {
        this.commandCursor.setX(cursorX);
      }
    }
  }

  /**
   * Execute git command
   */
  executeGitCommand() {
    const command = this.gitCommandBuffer.trim().toLowerCase();
    const screenX = GAME_CONFIG.width / 2;
    const termWidth = 700;
    const contentStartY = GAME_CONFIG.height / 2 - 200 + 50;
    const lineHeight = 18;
    
    // Add command to terminal history
    const commandLine = this.add.text(
      screenX - termWidth / 2 + 15,
      this.commandPrompt.y + lineHeight,
      `$ ${this.gitCommandBuffer}`,
      {
        fontSize: '13px',
        fill: '#4ec9b0',
        fontFamily: 'Courier New'
      }
    );
    commandLine.setOrigin(0, 0);
    commandLine.setScrollFactor(0);
    commandLine.setDepth(2028);
    this.gitTerminalElements.push(commandLine);
    
    // Move prompt down
    this.commandPrompt.setY(this.commandPrompt.y + lineHeight);
    this.commandInput.setY(this.commandInput.y + lineHeight);
    this.commandCursor.setY(this.commandCursor.y + lineHeight);
    
    // Process command based on step
    if (this.gitStep === 'status' || this.gitStep === 'add') {
      if (command === 'git add .' || command === 'git add src/styles/button.css' || command === 'git add button.css') {
        // Show success
        const output = this.add.text(
          screenX - termWidth / 2 + 15,
          this.commandPrompt.y + lineHeight,
          'Changes staged for commit',
          {
            fontSize: '13px',
            fill: '#6a9955',
            fontFamily: 'Courier New'
          }
        );
        output.setOrigin(0, 0);
        output.setScrollFactor(0);
        output.setDepth(2028);
        this.gitTerminalElements.push(output);
        
        this.gitStep = 'commit';
        this.commandPrompt.setY(this.commandPrompt.y + lineHeight * 2);
        this.commandInput.setY(this.commandInput.y + lineHeight * 2);
        this.commandCursor.setY(this.commandCursor.y + lineHeight * 2);
        
        // Update instruction
        const instruction = this.gitTerminalElements.find(el => el.text && el.text.includes('Type the git'));
        if (instruction) {
          instruction.setText('Now commit with: git commit -m "your message"');
        }
      } else {
        // Show error
        const error = this.add.text(
          screenX - termWidth / 2 + 15,
          this.commandPrompt.y + lineHeight,
          'Try: git add .  or  git add src/styles/button.css',
          {
            fontSize: '13px',
            fill: '#f48771',
            fontFamily: 'Courier New'
          }
        );
        error.setOrigin(0, 0);
        error.setScrollFactor(0);
        error.setDepth(2028);
        this.gitTerminalElements.push(error);
        this.commandPrompt.setY(this.commandPrompt.y + lineHeight * 2);
        this.commandInput.setY(this.commandInput.y + lineHeight * 2);
        this.commandCursor.setY(this.commandCursor.y + lineHeight * 2);
      }
    } else if (this.gitStep === 'commit') {
      if (command.startsWith('git commit -m')) {
        // Extract message
        const messageMatch = command.match(/git commit -m ["'](.+)["']/);
        const commitMessage = messageMatch ? messageMatch[1] : 'fix: center button';
        
        // Show commit success
        const output = this.add.text(
          screenX - termWidth / 2 + 15,
          this.commandPrompt.y + lineHeight,
          `[main abc1234] ${commitMessage}`,
          {
            fontSize: '13px',
            fill: '#6a9955',
            fontFamily: 'Courier New'
          }
        );
        output.setOrigin(0, 0);
        output.setScrollFactor(0);
        output.setDepth(2028);
        this.gitTerminalElements.push(output);
        
        const output2 = this.add.text(
          screenX - termWidth / 2 + 15,
          this.commandPrompt.y + lineHeight * 2,
          '1 file changed, 1 insertion(+)',
          {
            fontSize: '13px',
            fill: '#6a9955',
            fontFamily: 'Courier New'
          }
        );
        output2.setOrigin(0, 0);
        output2.setScrollFactor(0);
        output2.setDepth(2028);
        this.gitTerminalElements.push(output2);
        
        // Complete the quest
        this.time.delayedCall(1500, () => {
          this.completeCodeQuest();
        });
      } else {
        // Show error
        const error = this.add.text(
          screenX - termWidth / 2 + 15,
          this.commandPrompt.y + lineHeight,
          'Try: git commit -m "your commit message"',
          {
            fontSize: '13px',
            fill: '#f48771',
            fontFamily: 'Courier New'
          }
        );
        error.setOrigin(0, 0);
        error.setScrollFactor(0);
        error.setDepth(2028);
        this.gitTerminalElements.push(error);
        this.commandPrompt.setY(this.commandPrompt.y + lineHeight * 2);
        this.commandInput.setY(this.commandInput.y + lineHeight * 2);
        this.commandCursor.setY(this.commandCursor.y + lineHeight * 2);
      }
    }
    
    // Clear command buffer
    this.gitCommandBuffer = '';
    this.updateCommandDisplay();
  }

  completeCodeQuest() {
    if (this.codingQuestCompleted) return;
    this.codingQuestCompleted = true;
    this.gitCommitActive = false;
    
    if (this.gitTerminalElements) {
      this.gitTerminalElements.forEach(element => {
        if (element && element.destroy) element.destroy();
      });
      this.gitTerminalElements = [];
    }
    
    if (this.gitInputHandler) {
      this.input.keyboard.off('keydown', this.gitInputHandler);
      this.gitInputHandler = null;
    }
    
    const successText = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      '✓ COMMIT SUCCESSFUL!\n\n🎉 Quest Complete: CSS Master!\n+200 XP',
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
    
    this.time.delayedCall(3000, () => {
      this.closeComputerView();
      
      this.resetLunaAfterQuest();
      
      this.time.delayedCall(500, () => {
        this.tomPostQuestDialogueActive = true;
        this.dialogueManager.startDialogue('Tom', [
          "Nice! You're a CSS wizard! Thanks so much!",
          "I guess it's knock off time now...",
          "You should leave as well - traffic will get real bad pretty soon..."
        ]);
      });
    });
  }

  fadeOutTom() {
    if (!this.tom) return;
    
    if (this.tom.interactionPrompt) {
      this.tom.interactionPrompt.destroy();
      this.tom.interactionPrompt = null;
    }
    
    this.tweens.add({
      targets: this.tom,
      alpha: 0,
      duration: 6000,
      ease: 'Power2',
      onComplete: () => {
        this.tom.setVisible(false);
        this.tomFadedOut = true;
      }
    });
  }

  resetLunaAfterQuest() {
    if (!this.lunaGirl || !this.player) return;
    
    this.lunaGirl.setVisible(true);
    this.lunaGirl.setAlpha(1);
    
    const groundY = GAME_CONFIG.height - 100;
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    const lunaX = Math.max(50, playerX - 100);
    const lunaY = groundY - 20;
    
    this.lunaGirl.setPosition(lunaX, lunaY);
    this.lunaGirl.setVelocity(0, 0);
    
    const direction = playerX > lunaX ? 'right' : 'left';
    this.lunaGirl.play(`girl_idle_${direction}`);
    
    this.lunaFollowEnabled = true;
  }

  /**
   * Close the computer view
   */
  closeComputerView() {
    this.computerViewActive = false;
    this.gitCommitActive = false;
    
    // Ensure Luna is visible and reset when computer view closes
    if (this.lunaGirl && this.player) {
      this.lunaGirl.setVisible(true);
      this.lunaGirl.setAlpha(1);
      // Re-enable follow behavior
      this.lunaFollowEnabled = true;
    }
    
    // Clean up git terminal
    if (this.gitTerminalElements) {
      this.gitTerminalElements.forEach(element => {
        if (element && element.destroy) element.destroy();
      });
      this.gitTerminalElements = [];
    }
    
    // Remove git keyboard listener
    if (this.gitInputHandler) {
      this.input.keyboard.off('keydown', this.gitInputHandler);
      this.gitInputHandler = null;
    }
    
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

