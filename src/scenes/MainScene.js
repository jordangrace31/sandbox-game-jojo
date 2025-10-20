/**
 * MainScene
 * Main gameplay scene where the player can move around, interact with NPCs, etc.
 */

import Phaser from 'phaser';
import Player from '../entities/Player.js';
import NPC from '../entities/NPC.js';
import AnimationManager from '../systems/AnimationManager.js';
import DialogueManager from '../systems/DialogueManager.js';
import { PLAYER_CONFIG, WORLD_CONFIG, GAME_CONFIG } from '../config.js';
import { getNPCData } from '../data/npcs.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    // Set world bounds to larger than screen for exploration
    this.physics.world.setBounds(0, 0, WORLD_CONFIG.width, WORLD_CONFIG.height);
    
    // Initialize systems
    this.animationManager = new AnimationManager(this);
    this.animationManager.createPlayerAnimations();
    this.animationManager.createNPCAnimations();
    
    this.dialogueManager = new DialogueManager(this);
    
    // Create the world (order matters - background to foreground)
    this.createSky();
    this.createClouds();
    this.createGround();
    
    // Create the player
    this.player = new Player(this, PLAYER_CONFIG.startX, PLAYER_CONFIG.startY);
    
    // Create NPCs
    this.createNPCs();
    
    // Set up camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, WORLD_CONFIG.width, WORLD_CONFIG.height);
    
    // Set up collisions
    this.physics.add.collider(this.player, this.groundPlatform);
    
    // Set up interaction key
    this.interactionKey = this.input.keyboard.addKey('E');
    
    // Track dialogue index for cycling through dialogues
    this.currentDialogueIndex = 0;
    
    // Track if dialog has been completed with Luna
    this.lunaDialogCompleted = false;
  }

  update() {
    // Update player
    this.player.update();
    
    // Update parallax clouds based on camera position
    this.updateClouds();
    
    // Update dialogue manager
    if (this.dialogueManager) {
      this.dialogueManager.update();
    }
    
    // Update NPCs
    if (this.lunaGirl) {
      this.lunaGirl.update();
      
      // Make Luna follow player after dialog is completed
      if (this.lunaDialogCompleted) {
        console.log('Luna dialog completed');
        this.updateLunaFollowBehavior();
      }
    }
    
    // Check for NPC interactions
    this.checkNPCInteractions();
  }

  /**
   * Create a gradient sky background
   */
  createSky() {
    // Create gradient sky from darker blue at top to lighter at bottom
    const gradient = this.add.graphics();
    
    // Draw gradient in multiple horizontal strips
    const strips = 50;
    const stripHeight = GAME_CONFIG.height / strips;
    
    for (let i = 0; i < strips; i++) {
      const progress = i / strips;
      // Interpolate between top and bottom colors
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.HexStringToColor(WORLD_CONFIG.skyColors.top),
        Phaser.Display.Color.HexStringToColor(WORLD_CONFIG.skyColors.bottom),
        strips,
        i
      );
      
      gradient.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      gradient.fillRect(0, i * stripHeight, WORLD_CONFIG.width, stripHeight);
    }
    
    gradient.setScrollFactor(0); // Sky doesn't move with camera
  }

  /**
   * Create multiple layers of clouds with parallax scrolling
   */
  createClouds() {
    this.cloudLayers = [];
    
    // Create 3 layers of clouds at different depths
    const layers = [
      { count: 20, size: 1.2, speed: 0.3, y: 80, alpha: 0.6 },   // Far clouds
      { count: 15, size: 1.0, speed: 0.5, y: 120, alpha: 0.7 },  // Mid clouds
      { count: 10, size: 0.8, speed: 0.7, y: 160, alpha: 0.9 }   // Near clouds
    ];
    
    layers.forEach((layer, layerIndex) => {
      const clouds = [];
      
      for (let i = 0; i < layer.count; i++) {
        const x = (WORLD_CONFIG.width / layer.count) * i + Math.random() * 200;
        const y = layer.y + Math.random() * 40;
        
        const cloud = this.createCloud(x, y, layer.size);
        cloud.setAlpha(layer.alpha);
        cloud.setScrollFactor(layer.speed, 0); // Parallax effect
        
        clouds.push({ sprite: cloud, speed: layer.speed });
      }
      
      this.cloudLayers.push(clouds);
    });
  }

  /**
   * Create a single cloud using shapes
   */
  createCloud(x, y, scale = 1) {
    const cloud = this.add.container(x, y);
    
    // Create cloud using multiple circles
    const cloudParts = [
      { x: 0, y: 0, radius: 20 },
      { x: 25, y: -5, radius: 25 },
      { x: 50, y: 0, radius: 22 },
      { x: 15, y: 10, radius: 18 },
      { x: 35, y: 12, radius: 20 }
    ];
    
    cloudParts.forEach(part => {
      const circle = this.add.circle(
        part.x * scale,
        part.y * scale,
        part.radius * scale,
        0xffffff,
        0.9
      );
      cloud.add(circle);
    });
    
    return cloud;
  }

  /**
   * Update cloud positions for parallax effect
   */
  updateClouds() {
    // Clouds are automatically handled by scrollFactor
    // This method reserved for future cloud animations (drift, etc.)
  }

  /**
   * Create detailed ground with grass texture
   */
  createGround() {
    const groundY = WORLD_CONFIG.height - WORLD_CONFIG.groundHeight;
    
    // Create main ground platform (physics body)
    this.groundPlatform = this.add.rectangle(
      WORLD_CONFIG.width / 2,
      WORLD_CONFIG.height - 20,
      WORLD_CONFIG.width,
      40,
      0x8B4513 // Brown dirt color
    );
    this.physics.add.existing(this.groundPlatform, true);
    
    // Add grass layer on top
    const grassGraphics = this.add.graphics();
    
    // Dark green grass base
    grassGraphics.fillStyle(0x228B22, 1);
    grassGraphics.fillRect(0, groundY, WORLD_CONFIG.width, 60);
    
    // Lighter green top strip
    grassGraphics.fillStyle(0x32CD32, 1);
    grassGraphics.fillRect(0, groundY, WORLD_CONFIG.width, 20);
    
    // Add grass blades for detail
    this.createGrassBlades(grassGraphics, groundY);
    
    // Add some ground decoration
    this.createGroundDecorations(groundY);
  }

  /**
   * Create small grass blade details
   */
  createGrassBlades(graphics, groundY) {
    graphics.lineStyle(2, 0x2E8B57, 1);
    
    // Draw grass blades across the ground
    for (let x = 0; x < WORLD_CONFIG.width; x += 15) {
      const bladeX = x + Math.random() * 10;
      const bladeHeight = 8 + Math.random() * 8;
      const bladeY = groundY + 10;
      
      // Draw a simple blade
      graphics.beginPath();
      graphics.moveTo(bladeX, bladeY);
      graphics.lineTo(bladeX + 2, bladeY - bladeHeight);
      graphics.strokePath();
    }
  }

  /**
   * Add flowers and rocks as ground decorations
   */
  createGroundDecorations(groundY) {
    // Add some flowers
    const flowerCount = 60;
    for (let i = 0; i < flowerCount; i++) {
      const x = Math.random() * WORLD_CONFIG.width;
      const y = groundY + 15;
      
      // Flower stem
      const stem = this.add.line(x, y, 0, 0, 0, -12, 0x228B22, 1);
      stem.setLineWidth(2);
      stem.setOrigin(0, 0);
      
      // Flower petals (simple circle)
      const petalColors = [0xFF69B4, 0xFFFF00, 0xFF6347, 0xFFFFFF];
      const color = Phaser.Utils.Array.GetRandom(petalColors);
      const petals = this.add.circle(x, y - 12, 4, color);
    }
    
    // Add some rocks
    const rockCount = 70;
    for (let i = 0; i < rockCount; i++) {
      const x = Math.random() * WORLD_CONFIG.width;
      const y = groundY + 25;
      const size = 8 + Math.random() * 12;
      
      const rock = this.add.ellipse(x, y, size, size * 0.7, 0x696969);
      
      // Add highlight for depth
      const highlight = this.add.ellipse(x - 2, y - 2, size * 0.4, size * 0.3, 0x808080);
    }
  }

  /**
   * Create all NPCs in the scene
   */
  createNPCs() {
    const lunaData = getNPCData('jojoGirl');
    
    // Position Luna on the right side of the world
    const lunaX = WORLD_CONFIG.width - 10000;
    const lunaY = WORLD_CONFIG.height - WORLD_CONFIG.groundHeight - 32;
    
    this.lunaGirl = new NPC(this, lunaX, lunaY, 'jojo_girl_idle', lunaData);
    
    // Make Luna stand idle initially
    this.lunaGirl.play('girl_idle_down');
    
    // Add collision with ground
    this.physics.add.collider(this.lunaGirl, this.groundPlatform);
  }

  /**
   * Check if player is near any NPC and can interact
   */
  checkNPCInteractions() {
    if (!this.lunaGirl || !this.player) return;
    
    // Don't check interactions if dialogue is already active
    if (this.dialogueManager && this.dialogueManager.isDialogueActive()) {
      return;
    }
    
    // Calculate distance between player and Luna
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.lunaGirl.x,
      this.lunaGirl.y
    );
    
    // Show interaction prompt if close enough
    const interactionDistance = 100;
    
    if (distance < interactionDistance) {
      // Show prompt
      if (!this.interactionPrompt) {
        this.showInteractionPrompt();
      }
      
      // Check if E key is pressed
      if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
        this.handleNPCInteraction(this.lunaGirl);
      }
    } else {
      // Hide prompt if player walks away
      if (this.interactionPrompt) {
        this.hideInteractionPrompt();
      }
    }
  }

  /**
   * Handle interaction with an NPC
   */
  handleNPCInteraction(npc) {
    const interaction = npc.interact();
    
    // Stop NPC movement during dialogue
    npc.setVelocityX(0);
    
    // Show all dialogues (DialogueManager will handle cycling through them)
    this.dialogueManager.startDialogue(interaction.name, interaction.dialogues);
    
    // Check when dialogue closes to activate following behavior
    this.time.delayedCall(100, () => {
      // Check periodically if dialogue is closed
      const checkDialogue = this.time.addEvent({
        delay: 100,
        callback: () => {
          if (!this.dialogueManager.isDialogueActive() && npc) {
            // Mark dialog as completed
            if (npc === this.lunaGirl) {
              this.lunaDialogCompleted = true;
              this.updateLunaFollowBehavior();
            }
          }
        },
        repeat: 30 // Check for 3 seconds
      });
    });
  }

  /**
   * Update Luna's following behavior
   */
  updateLunaFollowBehavior() {
    if (!this.lunaGirl || !this.player) return;
    
    // Calculate distance to player
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.lunaGirl.x,
      this.lunaGirl.y
    );
    
    const followDistance = 80; // Stay this far from player
    const runDistance = 200; // Start running if further than this
    
    if (distance > followDistance) {
      // Calculate direction to player
      const angle = Phaser.Math.Angle.Between(
        this.lunaGirl.x,
        this.lunaGirl.y,
        this.player.x,
        this.player.y
      );
      
      // Determine speed based on distance
      const speed = distance > runDistance ? 120 : 60;
      
      // Move towards player
      this.lunaGirl.setVelocity(
        Math.cos(angle) * speed,
        0 // Keep Y velocity at 0 since we have gravity
      );
      
      // Update animation based on direction
      const velocityX = this.lunaGirl.body.velocity.x;
      
      if (Math.abs(velocityX) > 5) {
        const animKey = distance > runDistance ? 'girl_run' : 'girl_walk';
        const direction = velocityX > 0 ? 'right' : 'left';
        const fullAnimKey = `${animKey}_${direction}`;
        
        if (this.lunaGirl.anims.currentAnim?.key !== fullAnimKey) {
          this.lunaGirl.play(fullAnimKey);
        }
      }
    } else {
      // Close enough - stop and idle
      this.lunaGirl.setVelocityX(0);
      
      // Play idle animation if not already
      if (!this.lunaGirl.anims.currentAnim?.key.includes('idle')) {
        // Determine direction based on player position
        const direction = this.player.x > this.lunaGirl.x ? 'right' : 'left';
        this.lunaGirl.play(`girl_idle_${direction}`);
      }
    }
  }

  /**
   * Show interaction prompt above NPC
   */
  showInteractionPrompt() {
    if (this.interactionPrompt) return;
    
    this.interactionPrompt = this.add.text(
      this.lunaGirl.x,
      this.lunaGirl.y - 60,
      'Press E to talk',
      {
        fontSize: '14px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      }
    );
    this.interactionPrompt.setOrigin(0.5);
    this.interactionPrompt.setDepth(1000);
    
    // Make it follow the NPC
    this.interactionPromptUpdate = () => {
      if (this.interactionPrompt && this.lunaGirl) {
        this.interactionPrompt.setPosition(this.lunaGirl.x, this.lunaGirl.y - 60);
      }
    };
    this.events.on('update', this.interactionPromptUpdate);
  }

  /**
   * Hide interaction prompt
   */
  hideInteractionPrompt() {
    if (this.interactionPrompt) {
      this.interactionPrompt.destroy();
      this.interactionPrompt = null;
    }
    if (this.interactionPromptUpdate) {
      this.events.off('update', this.interactionPromptUpdate);
      this.interactionPromptUpdate = null;
    }
  }
}

