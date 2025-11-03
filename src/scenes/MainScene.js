/**
 * MainScene
 * Main gameplay scene where the player can move around, interact with NPCs, etc.
 */

import Phaser from 'phaser';
import Player from '../entities/Player.js';
import NPC from '../entities/NPC.js';
import AnimationManager from '../systems/AnimationManager.js';
import DialogueManager from '../systems/DialogueManager.js';
import QuestManager from '../systems/QuestManager.js';
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
    this.questManager = new QuestManager(this);
    
    // Track quest status
    this.hamiltonQuestActive = false;
    this.hamiltonQuestCompleted = false;
    
    // Player stats
    this.playerStats = {
      gold: 0,
      experience: 0,
      items: []
    };
    
    // Create the world (order matters - background to foreground)
    this.createSky();
    this.createClouds();
    this.createGround();
    
    // Create the player
    this.player = new Player(this, PLAYER_CONFIG.startX, PLAYER_CONFIG.startY);
    this.player.setDepth(PLAYER_CONFIG.depth);
    
    // Create NPCs
    this.createNPCs();
    
    // Create collectibles
    this.createCollectibles();
    
    // Create UI
    this.createStatsUI();
    
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
    
    // Obstacles (will be created after Luna dialog)
    this.rockObstacle = null;
    this.ladder = null;
    this.platform = null;
    this.platform2 = null;
    this.platform3 = null;
    
    // // Show welcome dialog after a short delay
    // this.time.delayedCall(500, () => {
    //   this.showWelcomeDialog();
    // });
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

    this.createObstacles();
    
    // Update NPCs
    if (this.lunaGirl) {
      this.lunaGirl.update();
      
      // Make Luna follow player after dialog is completed
      if (this.lunaDialogCompleted) {
        this.updateLunaFollowBehavior();
      }
    }
    
    if (this.hamilton) {
      this.hamilton.update();
    }
    
    // Check for NPC interactions
    this.checkNPCInteractions();
    
    // Check for bottle collection
    this.checkBottleCollection();
    
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
      const even = i % 2 === 0;
      const xOffset = x + 10;

      if (even) {
        this.flower = this.add.sprite(x + xOffset, y, 'platform', 'flower_0');
        this.flower.setOrigin(0.5);
        this.flower.setDepth(850);
      }
      
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
    const rockCount = 120;
    for (let i = 0; i < rockCount; i++) {
      const x = Math.random() * WORLD_CONFIG.width;
      const y = groundY + 25;
      const size = 8 + Math.random() * 12;
      
      const rock = this.add.ellipse(x, y, size, size * 0.7, 0x696969);
      const highlight = this.add.ellipse(x - 2, y - 2, size * 0.4, size * 0.3, 0x808080);
    }

    const mushroomCount = 30;
    for (let i = 0; i < mushroomCount; i++) {
      const x = Math.random() * WORLD_CONFIG.width;
      const y = groundY + Math.random() * 40;
      const size = 8 + Math.random() * 12;
      
      this.mushroom = this.add.sprite(x, y, 'platform', 'mushroom_0');
      this.mushroom.setOrigin(0.5);
      this.mushroom.setDepth(850);
    }

    this.bigTree = this.add.sprite(2800, groundY - 40, 'platform', 'tree_2');
    this.bigTree.setOrigin(0.5);
    this.bigTree.setDepth(800);
    this.bigTree.setScale(1.5);
  }

  /**
   * Create all NPCs in the scene
   */
  createNPCs() {
    const lunaData = getNPCData('jojoGirl');
    
    // Position Luna on the right side of the world
    const lunaX = 1300;
    const lunaY = WORLD_CONFIG.height - WORLD_CONFIG.groundHeight - 32;
    
    this.lunaGirl = new NPC(this, lunaX, lunaY, 'jojo_girl_idle', lunaData);
    this.lunaGirl.setDepth(lunaData.depth);
    
    // Make Luna stand idle initially
    this.lunaGirl.play('girl_idle_down');
    
    // Add collision with ground
    this.physics.add.collider(this.lunaGirl, this.groundPlatform);

    const hamiltonData = getNPCData('hamilton');
    const hamiltonX = 2900;
    const hamiltonY = WORLD_CONFIG.height - WORLD_CONFIG.groundHeight - 32;
    
    this.hamilton = new NPC(this, hamiltonX, hamiltonY, 'hamilton_idle', hamiltonData);
    this.hamilton.setDepth(hamiltonData.depth);
    
    // Make Hamilton stand idle initially
    this.hamilton.play('hamilton_idle');

    this.physics.add.collider(this.hamilton, this.groundPlatform);

  }

  /**
   * Create collectible items in the world
   */
  createCollectibles() {
    const groundY = WORLD_CONFIG.height - WORLD_CONFIG.groundHeight;
    
    // Create dark green beer bottle near the tree
    const bottleX = 3100;
    const bottleY = groundY - 10;
    
    // Create beer bottle using basic shapes
    this.beerBottle = this.add.container(bottleX, bottleY);
    
    // Bottle body (dark green)
    const bottleBody = this.add.rectangle(0, 0, 12, 30, 0x2d5016);
    
    // Bottle neck
    const bottleNeck = this.add.rectangle(0, -18, 6, 8, 0x2d5016);
    
    // Bottle cap (gold)
    const bottleCap = this.add.rectangle(0, -23, 7, 3, 0xFFD700);
    
    // Bottle highlight for glass effect
    const highlight = this.add.rectangle(-2, -5, 3, 15, 0x5a8c2d, 0.5);
    
    // Add shimmer effect
    const shimmer = this.add.circle(0, -8, 3, 0xffffff, 0.3);
    
    this.beerBottle.add([bottleBody, bottleNeck, bottleCap, highlight, shimmer]);
    this.beerBottle.setDepth(900);
    this.beerBottle.setSize(12, 30);
    
    // Add physics for overlap detection
    this.physics.add.existing(this.beerBottle);
    this.beerBottle.body.setAllowGravity(false);
    
    // Track if bottle has been collected
    this.bottleCollected = false;
    
    // Add bobbing animation
    this.tweens.add({
      targets: this.beerBottle,
      y: bottleY - 5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Add label
    this.bottleLabel = this.add.text(bottleX, bottleY - 40, 'Beer Bottle', {
      fontSize: '12px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 2 }
    });
    this.bottleLabel.setOrigin(0.5);
    this.bottleLabel.setDepth(901);
  }

  /**
   * Create the player stats UI panel
   */
  createStatsUI() {
    const padding = 15;
    const panelWidth = 200;
    const panelHeight = 120;
    const panelX = GAME_CONFIG.width - panelWidth - padding;
    const panelY = padding;
    
    // Create panel background
    this.statsPanel = this.add.graphics();
    this.statsPanel.fillStyle(0x000000, 0.7);
    this.statsPanel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
    this.statsPanel.lineStyle(2, 0xFFD700, 1);
    this.statsPanel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
    this.statsPanel.setScrollFactor(0);
    this.statsPanel.setDepth(2000);
    
    // Title
    this.statsTitle = this.add.text(
      panelX + panelWidth / 2,
      panelY + 15,
      'Player Stats',
      {
        fontSize: '16px',
        fill: '#FFD700',
        fontStyle: 'bold'
      }
    );
    this.statsTitle.setOrigin(0.5, 0);
    this.statsTitle.setScrollFactor(0);
    this.statsTitle.setDepth(2001);
    
    // Gold text
    this.goldText = this.add.text(
      panelX + 15,
      panelY + 40,
      `💰 Gold: ${this.playerStats.gold}`,
      {
        fontSize: '14px',
        fill: '#ffffff'
      }
    );
    this.goldText.setScrollFactor(0);
    this.goldText.setDepth(2001);
    
    // Experience text
    this.expText = this.add.text(
      panelX + 15,
      panelY + 60,
      `⭐ XP: ${this.playerStats.experience}`,
      {
        fontSize: '14px',
        fill: '#ffffff'
      }
    );
    this.expText.setScrollFactor(0);
    this.expText.setDepth(2001);
    
    // Items text
    this.itemsText = this.add.text(
      panelX + 15,
      panelY + 80,
      `📦 Items: ${this.playerStats.items.length > 0 ? this.playerStats.items.join(', ') : 'None'}`,
      {
        fontSize: '14px',
        fill: '#ffffff',
        wordWrap: { width: panelWidth - 30 }
      }
    );
    this.itemsText.setScrollFactor(0);
    this.itemsText.setDepth(2001);
  }

  /**
   * Update the stats UI display
   */
  updateStatsUI(animateGold = false, animateExp = false, animateItems = false) {
    if (this.goldText) {
      this.goldText.setText(`💰 Gold: ${this.playerStats.gold}`);
      if (animateGold) {
        this.flashText(this.goldText);
      }
    }
    if (this.expText) {
      this.expText.setText(`⭐ XP: ${this.playerStats.experience}`);
      if (animateExp) {
        this.flashText(this.expText);
      }
    }
    if (this.itemsText) {
      this.itemsText.setText(`📦 Items: ${this.playerStats.items.length > 0 ? this.playerStats.items.join(', ') : 'None'}`);
      if (animateItems) {
        this.flashText(this.itemsText);
      }
    }
  }

  /**
   * Flash animation for text
   */
  flashText(textObject) {
    // Scale up and change color briefly
    this.tweens.add({
      targets: textObject,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut'
    });
    
    // Color flash
    textObject.setColor('#00ff00');
    this.time.delayedCall(300, () => {
      textObject.setColor('#ffffff');
    });
  }

  /**
   * Check if player can collect the beer bottle
   */
  checkBottleCollection() {
    if (!this.beerBottle || this.bottleCollected || !this.player) return;
    
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.beerBottle.x,
      this.beerBottle.y
    );
    
    const collectionDistance = 50;
    
    if (distance < collectionDistance) {
      // Show collection prompt
      if (!this.collectionPrompt) {
        this.collectionPrompt = this.add.text(
          this.beerBottle.x,
          this.beerBottle.y - 55,
          'Press E to collect',
          {
            fontSize: '12px',
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 6, y: 3 }
          }
        );
        this.collectionPrompt.setOrigin(0.5);
        this.collectionPrompt.setDepth(1001);
      }
      
      // Check if E key is pressed
      if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
        this.collectBottle();
      }
    } else {
      // Hide prompt if player walks away
      if (this.collectionPrompt) {
        this.collectionPrompt.destroy();
        this.collectionPrompt = null;
      }
    }
  }

  /**
   * Collect the beer bottle
   */
  collectBottle() {
    this.bottleCollected = true;
    
    // Destroy the bottle and its label
    if (this.beerBottle) {
      this.tweens.add({
        targets: this.beerBottle,
        alpha: 0,
        y: this.beerBottle.y - 30,
        duration: 500,
        onComplete: () => {
          this.beerBottle.destroy();
          this.beerBottle = null;
        }
      });
    }
    
    if (this.bottleLabel) {
      this.bottleLabel.destroy();
      this.bottleLabel = null;
    }
    
    if (this.collectionPrompt) {
      this.collectionPrompt.destroy();
      this.collectionPrompt = null;
    }
    
    // Show notification
    const notif = this.add.text(
      this.cameras.main.width / 2,
      50,
      'Collected: Dark Green Beer Bottle',
      {
        fontSize: '16px',
        fill: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    notif.setOrigin(0.5);
    notif.setScrollFactor(0);
    notif.setDepth(1001);
    
    // Fade out notification
    this.tweens.add({
      targets: notif,
      alpha: 0,
      duration: 1000,
      delay: 2000,
      onComplete: () => notif.destroy()
    });
  }

  /**
   * Check if player is near any NPC and can interact
   */
  checkNPCInteractions() {
    if (!this.player) return;
    
    // Don't check interactions if dialogue is already active
    if (this.dialogueManager && this.dialogueManager.isDialogueActive()) {
      return;
    }
    
    const interactionDistance = 100;
    let nearestNPC = null;
    let nearestDistance = Infinity;
    
    // Check all NPCs
    const npcs = [
      { npc: this.lunaGirl, skipCondition: this.lunaDialogCompleted },
      { npc: this.hamilton, skipCondition: false }
    ];
    
    for (const { npc, skipCondition } of npcs) {
      if (!npc || skipCondition) continue;
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y
      );
      
      if (distance < interactionDistance && distance < nearestDistance) {
        nearestDistance = distance;
        nearestNPC = npc;
      }
    }
    
    // Show interaction prompt for nearest NPC
    if (nearestNPC) {
      if (!this.interactionPrompt || this.currentInteractionNPC !== nearestNPC) {
        this.hideInteractionPrompt();
        this.showInteractionPrompt(nearestNPC);
        this.currentInteractionNPC = nearestNPC;
      }
      
      // Check if E key is pressed
      if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
        this.handleNPCInteraction(nearestNPC);
      }
    } else {
      // Hide prompt if player walks away
      if (this.interactionPrompt) {
        this.hideInteractionPrompt();
        this.currentInteractionNPC = null;
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
    
    // Special handling for Hamilton's quest
    if (npc === this.hamilton) {
      if (this.hamiltonQuestCompleted) {
        // Quest already completed
        this.dialogueManager.startDialogue("Hamilton", ["Dankie vir die dop! You're a legend!"]);
        return;
      } else if (this.bottleCollected && !this.hamiltonQuestCompleted) {
        // Player has the bottle, complete the quest
        this.completeHamiltonQuest();
        return;
      } else if (!this.bottleCollected && !this.hamiltonQuestActive) {
        // Start the quest
        this.startHamiltonQuest(interaction);
        return;
      }
    }
    
    // Show all dialogues (DialogueManager will handle cycling through them)
    this.dialogueManager.startDialogue(interaction.name, interaction.dialogues);
    
    // Check when dialogue closes to activate following behavior
    this.time.delayedCall(100, () => {
      // Check periodically if dialogue is closed
      this.time.addEvent({
        delay: 100,
        callback: () => {
          if (!this.dialogueManager.isDialogueActive() && npc && !this.lunaDialogCompleted) {
            // Mark dialog as completed
            if (npc === this.lunaGirl) {
              this.lunaDialogCompleted = true;
              this.updateLunaFollowBehavior();
            }
          }
        },
        repeat: 600 // Check for 60 seconds
      });
    });
  }

  /**
   * Start Hamilton's quest
   */
  startHamiltonQuest(interaction) {
    this.hamiltonQuestActive = true;
    
    // Show quest dialogue
    this.dialogueManager.startDialogue(interaction.name, interaction.dialogues);
    
    // Accept the quest
    const quest = interaction.quest;
    if (quest && this.questManager) {
      this.questManager.acceptQuest(quest);
    }
  }

  /**
   * Complete Hamilton's quest
   */
  completeHamiltonQuest() {
    this.hamiltonQuestCompleted = true;
    
    // Show completion dialogue
    this.dialogueManager.startDialogue("Hamilton", [
      "Ag, you found my dop! Dankie dankie!",
      "You're a real boet. Here, take this as a reward!"
    ]);
    
    // Complete the quest in the quest manager
    if (this.questManager) {
      this.questManager.completeQuest('fetch_dop');
    }
    
    // Show a special completion effect
    this.time.delayedCall(1000, () => {
      const reward = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        'Quest Complete!\n+50 Gold\n+100 XP',
        {
          fontSize: '24px',
          fill: '#FFD700',
          backgroundColor: '#000000',
          padding: { x: 20, y: 10 },
          align: 'center'
        }
      );
      reward.setOrigin(0.5);
      reward.setScrollFactor(0);
      reward.setDepth(1002);
      
      // Fade in and out
      reward.setAlpha(0);
      this.tweens.add({
        targets: reward,
        alpha: 1,
        duration: 500,
        onComplete: () => {
          this.tweens.add({
            targets: reward,
            alpha: 0,
            duration: 1000,
            delay: 2000,
            onComplete: () => reward.destroy()
          });
        }
      });
    });
  }

  /**
   * Update Luna's following behavior
   */
  updateLunaFollowBehavior() {
    if (!this.lunaGirl || !this.player || this.lunaGirl.isClimbing) return;
    
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
      const speed = distance > runDistance ? 200 : 100;
      
      // Move towards player
      this.lunaGirl.setVelocity(
        Math.cos(angle) * speed,
        0 // Keep Y velocity at 0 since we have gravity
      );
      
      // Check if Luna needs to jump over the rock
      if (this.rockObstacle) {
        const distanceToRock = Phaser.Math.Distance.Between(
          this.lunaGirl.x,
          this.lunaGirl.y,
          this.rockObstacle.x,
          this.rockObstacle.y
        );
        
        // Show NPC popup dialogue if near rock and player is on the other side
        if (distanceToRock < 100 && this.lunaGirl.body.touching.down) {
          if (!this.npcPopupDialogue) {
            this.showNPCPopupDialogue(this.lunaGirl, "Ek is a klein meisie so I don't need to jump over the rock.");
          }
        } else {
          this.hideNPCPopupDialogue();
        }
      }
      
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
  showInteractionPrompt(npc) {
    if (this.interactionPrompt) return;
    
    this.interactionPrompt = this.add.text(
      npc.x,
      npc.y - 60,
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
      if (this.interactionPrompt && npc) {
        this.interactionPrompt.setPosition(npc.x, npc.y - 60);
      }
    };
    this.events.on('update', this.interactionPromptUpdate);
  }

    /**
   * Show interaction prompt above NPC
   */
    showNPCPopupDialogue(npc, message) {
      if (this.npcPopupDialogue) return;
      
      this.npcPopupDialogue = this.add.text(
        npc.x,
        npc.y - 60,
        message,
        {
          fontSize: '14px',
          fill: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 8, y: 4 }
        }
      );
      this.npcPopupDialogue.setOrigin(0.5);
      this.npcPopupDialogue.setDepth(1000);
      
      // Make it follow the NPC
      this.npcPopupDialogueUpdate = () => {
        if (this.npcPopupDialogue && npc) {
          this.npcPopupDialogue.setPosition(npc.x, npc.y - 60);
        }
      };
      this.events.on('update', this.npcPopupDialogueUpdate);
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

  /**
  * Hide NPC popup dialogue
  */
  hideNPCPopupDialogue() {
    if (this.npcPopupDialogue) {
      this.npcPopupDialogue.destroy();
      this.npcPopupDialogue = null;
    }
    if (this.npcPopupDialogueUpdate) {
      this.events.off('update', this.npcPopupDialogueUpdate);
      this.npcPopupDialogueUpdate = null;
    }
  }

  /**
   * Show welcome dialog when entering the game
   */
  showWelcomeDialog() {
    this.dialogueManager.startDialogue(
      'Narrator',
      "Hi Jojo! It's been the wonderful adventure so far... maybe we can recap?"
    );
  }

  /**
   * Create obstacle course after Luna dialog is completed
   */
  createObstacles() {
    const groundY = WORLD_CONFIG.height - WORLD_CONFIG.groundHeight;
    
    this.rockObstacle = this.add.container(1600, groundY - 20);
    
    const boulder = this.add.ellipse(0, 0, 120, 80, 0x696969);
    const shadow = this.add.ellipse(0, 35, 120, 20, 0x000000, 0.3);
    const highlight1 = this.add.ellipse(-15, -15, 40, 30, 0x808080);
    const highlight2 = this.add.ellipse(-25, -5, 25, 20, 0x909090);
    
    this.rockObstacle.add([shadow, boulder, highlight1, highlight2]);
    
    // Add physics to rock (static body - won't fall)
    this.physics.add.existing(this.rockObstacle, true);
    this.rockObstacle.body.setSize(80, 80);
    this.rockObstacle.setDepth(900);
    
    this.physics.add.collider(this.player, this.rockObstacle);

    const platform1X = 1900; 
    const platform1Y = groundY - 100; 
      
    this.platform1 = this.add.sprite(platform1X, platform1Y, 'platform', 'platform_0');
    this.platform1.setOrigin(0.5);
    this.platform1.setDepth(800);

    this.physics.add.existing(this.platform1, true);
    this.physics.add.collider(this.player, this.platform1);

    const imagePlatform2X = 2200; 
    const imagePlatform2Y = groundY - 180; 
      
    this.imagePlatform2 = this.add.sprite(imagePlatform2X, imagePlatform2Y, 'platform', 'platform_1');
    this.imagePlatform2.setOrigin(0.5);
    this.imagePlatform2.setDepth(800);

    this.physics.add.existing(this.imagePlatform2, true);
    this.physics.add.collider(this.player, this.imagePlatform2);
   
    const treeX = platform1X - 700; 
    const treeY = groundY - 75; 
    
    this.tree = this.add.sprite(treeX, treeY, 'background', 'tree');
    this.tree.setOrigin(0.5);
    this.tree.setDepth(800);
    this.tree.setScale(1.5);


    const postX = 200; 
    const postY = groundY; 
      
    this.post = this.add.sprite(postX, postY, 'background', 'post_0');
    this.post.setOrigin(0.5);
    this.post.setDepth(800);
    this.post.setScale(1.5);

  }
}

