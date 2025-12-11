import Phaser from 'phaser';
import Player from '../entities/Player.js';
import NPC from '../entities/NPC.js';
import AnimationManager from '../systems/AnimationManager.js';
import DialogueManager from '../systems/DialogueManager.js';
import MusicManager from '../systems/MusicManager.js';
import { PLAYER_CONFIG, GAME_CONFIG } from '../config.js';
import { getNPCData } from '../data/npcs.js';

export default class LockStockScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LockStockScene' });
  }

  create() {
    this.sceneWidth = 1400;
    this.sceneHeight = 700;
    this.physics.world.setBounds(0, 0, this.sceneWidth, this.sceneHeight);
    
    this.animationManager = new AnimationManager(this);
    this.dialogueManager = new DialogueManager(this);
    this.musicManager = new MusicManager(this);
    
    if (!this.musicManager.isPlaying() || this.musicManager.getCurrentTrack() !== 'lock_stock') {
      this.musicManager.play('lock_stock', 0.4, true, 1500);
    }
    
    this.doorPosition = { x: 1100, y: 400 };
    this.doorPrompt = null;
    
    this.createSky();
    this.createStreet();
    this.createSidewalk();
    this.createObstacles();
    this.createBuilding();
    
    this.createNPCs();
    
    this.player = new Player(this, 200, 200);
    this.player.setDepth(1000);
    
    this.cameras.main.setBounds(0, 0, this.sceneWidth, this.sceneHeight);
    
    this.physics.add.collider(this.player, this.groundPlatform);
    
    if (this.obstacles) {
      this.obstacles.forEach(obstacle => {
        this.physics.add.collider(this.player, obstacle);
      });
    }
    
    this.interactionKey = this.input.keyboard.addKey('E');
    
    this.exitKey = this.input.keyboard.addKey('Q');
    
    this.createExitPrompt();
    
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    
    this.cameras.main.once('camerafadeincomplete', () => {
      if (this.lunaGirl && this.dialogueManager) {
        this.dialogueManager.startDialogue('Jordan', 'Sorry, you may need to be patient with me. I just had a leg day so I\'m learning how to run and jump again, but I\'m trying my best to follow, I promise');
      }
    });
    
    this.events.on('resume', () => {
      if (this.cameras.main) {
        this.cameras.main.resetFX();
      }
      
      if (this.lunaGirl) {
        this.lunaLastJumpTime = 0;
      }
    });
  }

  update() {
    this.player.update();
    
    if (this.lunaGirl) {
      this.lunaGirl.update();
      
      if (this.lunaFollowEnabled) {
        this.updateLunaFollowBehavior();
      }
    }
    
    if (this.dialogueManager) {
      this.dialogueManager.update();
    }
    
    this.checkExit();
    
    this.checkDoorInteraction();
  }

  checkExit() {
    if (Phaser.Input.Keyboard.JustDown(this.exitKey)) {
      this.returnToMainScene();
    }
  }

  checkDoorInteraction() {
    if (!this.player || !this.doorPosition) return;
    
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.doorPosition.x,
      this.doorPosition.y
    );
    
    const interactionDistance = 80;
    
    if (distance < interactionDistance) {
      if (!this.doorPrompt) {
        this.showDoorPrompt();
      }
      
      if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
        this.enterClub();
      }
    } else {
      this.hideDoorPrompt();
    }
  }

  showDoorPrompt() {
    if (this.doorPrompt) return;
    
    this.doorPrompt = this.add.text(
      this.doorPosition.x,
      this.doorPosition.y - 60,
      'Press E to enter club',
      {
        fontSize: '14px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      }
    );
    this.doorPrompt.setOrigin(0.5);
    this.doorPrompt.setDepth(2001);
  }

  hideDoorPrompt() {
    if (this.doorPrompt) {
      this.doorPrompt.destroy();
      this.doorPrompt = null;
    }
  }

  enterClub() {
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    
    // Wait for fade out to complete before switching scenes
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // DON'T stop music - let it continue playing
      
      // Pause this scene (keeps music playing)
      this.scene.pause('LockStockScene');
      
      // Launch club scene
      this.scene.launch('ClubScene');
    });
  }

  returnToMainScene() {
    if (this.musicManager) {
      this.musicManager.stop(1000);
    }
    
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    
    // Wait for fade out to complete before switching scenes
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const mainScene = this.scene.get('MainScene');
      
      this.scene.stop('LockStockScene');
      this.scene.resume('MainScene');
      
      if (mainScene) {
        mainScene.cameras.main.fadeIn(1000, 0, 0, 0);
      }
    });
  }

  updateLunaFollowBehavior() {
    if (!this.lunaGirl || !this.player) return;
    
    const jumpTriggers = [
      { x: 325, range: 20, type: 'onto' },     // Before crate at 400
      { x: 510, range: 20, type: 'onto' },     // Before platform at 700
      { x: 830, range: 15, type: 'over' },     // Before trash can at 850
      { x: 930, range: 20, type: 'onto' },      // Before platform at 950
      { x: 1030, range: 20, type: 'onto' }     // Before platform at 1050
    ];
    
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.lunaGirl.x,
      this.player.y
    );
    
    const followDistance = 80;
    const jumpCooldown = 50;
    
    if (distance > followDistance) {
      const velocityX = this.player.x > this.lunaGirl.x ? 1 : -1;
      
      const speed = 150;
      
      this.lunaGirl.setVelocityX(velocityX * speed);
      
      const currentTime = this.time.now;
      const timeSinceLastJump = currentTime - this.lunaLastJumpTime;
      
      if (timeSinceLastJump > jumpCooldown && this.lunaGirl.body.touching.down) {
        for (const trigger of jumpTriggers) {
          const distanceToTrigger = Math.abs(this.lunaGirl.x - trigger.x);
          const isApproaching = velocityX > 0 ? 
            (this.lunaGirl.x < trigger.x && this.lunaGirl.x > trigger.x - 30) :
            (this.lunaGirl.x > trigger.x && this.lunaGirl.x < trigger.x + 30);
          
          if (distanceToTrigger < trigger.range && isApproaching) {
            this.lunaGirl.setVelocityY(-500);
            this.lunaLastJumpTime = currentTime;
            break;
          }
        }
      }
      
      const absVelocityX = Math.abs(this.lunaGirl.body.velocity.x);
      
      if (absVelocityX > 5) {
        const direction = velocityX > 0 ? 'right' : 'left';
        
        if (!this.lunaGirl.body.touching.down) {
          const jumpAnimKey = `girl_jump_${direction}`;
          if (this.lunaGirl.anims.currentAnim?.key !== jumpAnimKey) {
            this.lunaGirl.play(jumpAnimKey);
          }
        } else {
          const animKey = 'girl_walk';
          const fullAnimKey = `${animKey}_${direction}`;
          
          if (this.lunaGirl.anims.currentAnim?.key !== fullAnimKey) {
            this.lunaGirl.play(fullAnimKey);
          }
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

  createSky() {
    const gradient = this.add.graphics();
    
    const strips = 50;
    const stripHeight = GAME_CONFIG.height / strips;
    
    for (let i = 0; i < strips; i++) {
      const progress = i / strips;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.HexStringToColor('#0a1628'), 
        Phaser.Display.Color.HexStringToColor('#1a3a52'),
        strips,
        i
      );
      
      gradient.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      gradient.fillRect(0, i * stripHeight, this.sceneWidth, stripHeight);
    }
    
    gradient.setScrollFactor(0);

    this.createStars();
  }

    /**
   * Create stars in the night sky
   */
    createStars() {
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 1400;
        const y = Math.random() * 300;
        const size = 1 + Math.random() * 2;
        
        const star = this.add.circle(x, y, size, 0xffffff, 0.8);
        star.setScrollFactor(0);
        
        // Twinkle effect
        this.tweens.add({
          targets: star,
          alpha: 0.3,
          duration: 1000 + Math.random() * 2000,
          yoyo: true,
          repeat: -1
        });
      }
    }

  /**
   * Create the street (road)
   */
  createStreet() {
    const streetY = GAME_CONFIG.height - 120;
    
    // Dark grey asphalt
    const street = this.add.graphics();
    street.fillStyle(0x3a3a3a, 1);
    street.fillRect(0, streetY, 1400, 120);
    
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
    
    for (let x = 0; x < 1400; x += dashLength + gapLength) {
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
      700,
      sidewalkY + 15,
      1400,
      40,
      0x8B8B8B // Light grey
    );
    this.physics.add.existing(this.groundPlatform, true);
    
    // Sidewalk surface with tiles
    const sidewalk = this.add.graphics();
    sidewalk.fillStyle(0xc0c0c0, 1);
    sidewalk.fillRect(0, sidewalkY - 20, 1400, 40);
    
    // Add tile lines
    sidewalk.lineStyle(2, 0x909090, 0.5);
    
    // Vertical lines
    for (let x = 0; x < 1400; x += 80) {
      sidewalk.beginPath();
      sidewalk.moveTo(x, sidewalkY - 20);
      sidewalk.lineTo(x, sidewalkY + 20);
      sidewalk.strokePath();
    }
    
    // Horizontal lines
    for (let y = sidewalkY - 20; y < sidewalkY + 20; y += 20) {
      sidewalk.beginPath();
      sidewalk.moveTo(0, y);
      sidewalk.lineTo(1400, y);
      sidewalk.strokePath();
    }
  }

  /**
   * Create the building on the right side with the Lock Stock sign
   */
  createBuilding() {
    const buildingX = 1000;
    const buildingY = 20;
    const buildingWidth = 400;
    const buildingHeight = 400;
    
    // Building container
    const building = this.add.graphics();
    
    // Create elevated platform for the building with better visuals
    this.createBuildingPlatform(1200, 485, buildingWidth, 130);
    
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

  createObstacles() {
    this.obstacles = [];
    const sidewalkY = GAME_CONFIG.height - 140;
    
    const crate1 = this.createCrate(400, sidewalkY - 25, 50, 50);
    this.obstacles.push(crate1);
    
    const crateStack = this.createCrateStack(450, sidewalkY - 40, 50, 40);
    this.obstacles.push(crateStack);
    
    const platform1 = this.createPlatform(650, sidewalkY - 100, 180, 20);
    this.obstacles.push(platform1);
    
    const trashCan = this.createTrashCan(850, sidewalkY - 40);
    this.obstacles.push(trashCan);
    
    const platform2 = this.createPlatform(950, sidewalkY - 150, 100, 20);
    this.obstacles.push(platform2);
  }

  createCrate(x, y, width, height) {
    const crate = this.add.rectangle(x, y, width, height, 0x8B4513);
    crate.setStrokeStyle(3, 0x654321);
    this.physics.add.existing(crate, true);
    
    // Add wood grain details
    const grain = this.add.graphics();
    grain.lineStyle(2, 0x654321, 0.5);
    
    for (let i = 0; i < 3; i++) {
      const offsetX = x - width / 2 + (width / 3) * i;
      grain.beginPath();
      grain.moveTo(offsetX, y - height / 2);
      grain.lineTo(offsetX, y + height / 2);
      grain.strokePath();
    }
    
    for (let i = 0; i < 3; i++) {
      const offsetY = y - height / 2 + (height / 3) * i;
      grain.beginPath();
      grain.moveTo(x - width / 2, offsetY);
      grain.lineTo(x + width / 2, offsetY);
      grain.strokePath();
    }
    
    return crate;
  }

  createCrateStack(x, y, width, height) {
    const stack = this.add.rectangle(x, y, width, height * 2, 0x8B4513);
    stack.setStrokeStyle(3, 0x654321);
    this.physics.add.existing(stack, true);
    
    // Draw crate divisions
    const line = this.add.line(x, y, -width / 2, 0, width / 2, 0, 0x654321);
    line.setLineWidth(3);
    
    return stack;
  }

  createPlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x808080);
    platform.setStrokeStyle(2, 0x606060);
    this.physics.add.existing(platform, true);
    
    const texture = this.add.graphics();
    texture.lineStyle(1, 0x606060, 0.5);
    
    for (let i = 0; i < width / 20; i++) {
      const lineX = x - width / 2 + i * 20;
      texture.beginPath();
      texture.moveTo(lineX, y - height / 2);
      texture.lineTo(lineX, y + height / 2);
      texture.strokePath();
    }
    
    return platform;
  }

  createTrashCan(x, y) {
    const canWidth = 40;
    const canHeight = 60;
    
    const can = this.add.rectangle(x, y, canWidth, canHeight, 0x404040);
    can.setStrokeStyle(2, 0x202020);
    this.physics.add.existing(can, true);
    
    const lid = this.add.ellipse(x, y - canHeight / 2 - 5, canWidth + 10, 15, 0x505050);
    lid.setStrokeStyle(2, 0x303030);
    
    return can;
  }

  createNPCs() {
    const lunaData = getNPCData('jojoGirl');
    
    const lunaX = 250;
    const lunaY = 200;
    
    this.lunaGirl = new NPC(this, lunaX, lunaY, 'jojo_girl_idle', lunaData);
    this.lunaGirl.setDepth(lunaData.depth);
    
    this.lunaGirl.play('girl_idle_right');
    
    this.physics.add.collider(this.lunaGirl, this.groundPlatform);
    
    if (this.obstacles) {
      this.obstacles.forEach(obstacle => {
        this.physics.add.collider(this.lunaGirl, obstacle);
      });
    }
    
    this.lunaFollowEnabled = true;
    this.lunaLastJumpTime = 0;
  }

  createBuildingPlatform(x, y, width, height) {
    const platformX = x;
    const platformY = y;
    
    // Create graphics for detailed platform
    const platformGraphics = this.add.graphics();
    
    // Shadow/depth effect (darker layer behind)
    platformGraphics.fillStyle(0x2a2a2a, 0.8);
    platformGraphics.fillRect(platformX - width / 2 + 5, platformY - height / 2 + 5, width, height);
    
    // Main platform body (stone/concrete color)
    platformGraphics.fillStyle(0x707070, 1);
    platformGraphics.fillRect(platformX - width / 2, platformY - height / 2, width, height);
    
    // Top surface (lighter, more polished)
    platformGraphics.fillStyle(0x858585, 1);
    platformGraphics.fillRect(platformX - width / 2, platformY - height / 2, width, 20);
    
    // Add stone texture pattern
    platformGraphics.lineStyle(1, 0x5a5a5a, 0.3);
    
    // Horizontal lines for stone layers
    for (let i = 0; i < height; i += 25) {
      platformGraphics.beginPath();
      platformGraphics.moveTo(platformX - width / 2, platformY - height / 2 + i);
      platformGraphics.lineTo(platformX + width / 2, platformY - height / 2 + i);
      platformGraphics.strokePath();
    }
    
    // Vertical cracks/seams
    for (let i = 0; i < width; i += 80) {
      const lineX = platformX - width / 2 + i;
      const offset = (i / 80) % 2 === 0 ? 0 : 12;
      
      platformGraphics.beginPath();
      platformGraphics.moveTo(lineX, platformY - height / 2 + offset);
      platformGraphics.lineTo(lineX, platformY + height / 2);
      platformGraphics.strokePath();
    }
    
    // Border/edge detail
    platformGraphics.lineStyle(3, 0x4a4a4a, 1);
    platformGraphics.strokeRect(platformX - width / 2, platformY - height / 2, width, height);
    
    // Top edge highlight
    platformGraphics.lineStyle(2, 0x9a9a9a, 0.8);
    platformGraphics.beginPath();
    platformGraphics.moveTo(platformX - width / 2, platformY - height / 2);
    platformGraphics.lineTo(platformX + width / 2, platformY - height / 2);
    platformGraphics.strokePath();
    
    // Add decorative corner pillars
    this.createCornerPillars(platformX, platformY, width, height);
    
    // Create physics body for collision (invisible rectangle)
    const platformCollider = this.add.rectangle(platformX, platformY, width, height);
    platformCollider.setAlpha(0); // Make invisible since we have graphics
    this.physics.add.existing(platformCollider, true);
    
    // Add to obstacles array so player can collide with it
    this.obstacles.push(platformCollider);
  }

  /**
   * Create decorative corner pillars for the platform
   */
  createCornerPillars(platformX, platformY, platformWidth, platformHeight) {
    const pillarWidth = 30;
    const pillarHeight = platformHeight + 20;
    
    const positions = [
      { x: platformX - platformWidth / 2 + pillarWidth / 2, y: platformY },
      { x: platformX + platformWidth / 2 - pillarWidth / 2, y: platformY }
    ];
    
    positions.forEach(pos => {
      const pillar = this.add.graphics();
      
      // Pillar body
      pillar.fillStyle(0x5a5a5a, 1);
      pillar.fillRect(pos.x - pillarWidth / 2, pos.y - pillarHeight / 2, pillarWidth, pillarHeight);
      
      // Pillar highlights
      pillar.fillStyle(0x6a6a6a, 1);
      pillar.fillRect(pos.x - pillarWidth / 2, pos.y - pillarHeight / 2, 8, pillarHeight);
      
      // Pillar border
      pillar.lineStyle(2, 0x3a3a3a, 1);
      pillar.strokeRect(pos.x - pillarWidth / 2, pos.y - pillarHeight / 2, pillarWidth, pillarHeight);
      
      // Pillar cap (decorative top)
      pillar.fillStyle(0x7a7a7a, 1);
      pillar.fillRect(pos.x - pillarWidth / 2 - 5, pos.y - pillarHeight / 2 - 10, pillarWidth + 10, 10);
      pillar.lineStyle(2, 0x4a4a4a, 1);
      pillar.strokeRect(pos.x - pillarWidth / 2 - 5, pos.y - pillarHeight / 2 - 10, pillarWidth + 10, 10);
    });
  }
}

