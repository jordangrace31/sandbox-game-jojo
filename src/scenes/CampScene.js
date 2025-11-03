/**
 * CampScene
 * A nighttime camping quest scene where the player must gather items to build shelter
 */

import Phaser from 'phaser';
import Player from '../entities/Player.js';
import NPC from '../entities/NPC.js';
import AnimationManager from '../systems/AnimationManager.js';
import DialogueManager from '../systems/DialogueManager.js';
import { PLAYER_CONFIG, GAME_CONFIG } from '../config.js';

export default class CampScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CampScene' });
  }

  create() {
    // Set world bounds (smaller scene)
    const sceneWidth = 1400;
    const sceneHeight = 700;
    this.physics.world.setBounds(0, 0, sceneWidth, sceneHeight);
    
    // Initialize systems
    this.animationManager = new AnimationManager(this);
    this.dialogueManager = new DialogueManager(this);
    
    // Quest tracking
    this.itemsCollected = {
      tarp: false,
      rope: false,
      cloth: false,
      bed1: false,
      bed2: false
    };
    
    this.itemsDelivered = [];
    this.requiredOrder = ['tarp', 'rope', 'cloth', 'bed', 'bed'];
    this.currentHeldItem = null;
    
    // Create the world
    this.createNightSky();
    this.createGround();
    this.createTree();
    
    // Create the player
    this.player = new Player(this, 200, 550);
    this.player.setDepth(1000);
    
    // Create Luna NPC
    this.createLuna();
    
    // Create collectible items
    this.createCollectibles();
    
    // Set up camera
    this.cameras.main.setBounds(0, 0, sceneWidth, sceneHeight);
    
    // Set up collisions
    this.physics.add.collider(this.player, this.groundPlatform);
    this.physics.add.collider(this.luna, this.groundPlatform);
    
    // Set up interaction key
    this.interactionKey = this.input.keyboard.addKey('E');
    
    // Fade in from black
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    
    // Show initial dialogue after fade in
    this.time.delayedCall(1500, () => {
      this.showInitialDialogue();
    });
  }

  update() {
    // Update player
    this.player.update();
    
    // Update Luna
    if (this.luna) {
      this.luna.update();
    }
    
    // Update dialogue manager
    if (this.dialogueManager) {
      this.dialogueManager.update();
    }
    
    // Check for item interactions
    this.checkItemInteractions();
    
    // Check for tree interactions
    this.checkTreeInteraction();
  }

  /**
   * Create a darker gradient sky for night time
   */
  createNightSky() {
    const gradient = this.add.graphics();
    
    const strips = 50;
    const stripHeight = GAME_CONFIG.height / strips;
    
    for (let i = 0; i < strips; i++) {
      const progress = i / strips;
      // Dark blue/purple night sky
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.HexStringToColor('#0a1628'), // Very dark blue
        Phaser.Display.Color.HexStringToColor('#1a3a52'), // Slightly lighter
        strips,
        i
      );
      
      gradient.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      gradient.fillRect(0, i * stripHeight, 1400, stripHeight);
    }
    
    gradient.setScrollFactor(0);
    
    // Add some stars
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
   * Create ground
   */
  createGround() {
    const groundY = GAME_CONFIG.height - 80;
    
    // Create main ground platform
    this.groundPlatform = this.add.rectangle(
      700,
      GAME_CONFIG.height - 20,
      1400,
      40,
      0x3a2617 // Dark brown
    );
    this.physics.add.existing(this.groundPlatform, true);
    
    // Dark grass layer
    const grassGraphics = this.add.graphics();
    grassGraphics.fillStyle(0x1a5c1a, 1); // Dark green
    grassGraphics.fillRect(0, groundY, 1400, 60);
    
    grassGraphics.fillStyle(0x2d7a2d, 1); // Slightly lighter
    grassGraphics.fillRect(0, groundY, 1400, 20);

    this.createGrassBlades(grassGraphics, groundY);
  }

    /**
   * Create small grass blade details
   */
    createGrassBlades(graphics, groundY) {
      graphics.lineStyle(2, 0x2E8B57, 1);
      
      // Draw grass blades across the ground
      for (let x = 0; x < 1800; x += 15) {
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
   * Create a tree for dropping items
   */
  createTree() {
    const treeX = 1200;
    const treeY = 570;

    this.tree = this.add.sprite(treeX, treeY, 'platform', 'tree_2');
    this.tree.setOrigin(0.5);
    this.tree.setDepth(800);
    this.tree.setScale(1.5);
    
    // Store tree position for interactions
    this.treePosition = { x: treeX, y: treeY };
  }

  /**
   * Create Luna NPC
   */
  createLuna() {
    const lunaData = {
      name: "Jordan",
      dialogues: [
        "Oh no! It seems to be getting dark!",
        "We'll need somewhere to sleep tonight.",
        "Maybe we can make something from the stuff we find here?"
      ],
      quests: [],
      depth: 999
    };
    
    this.luna = new NPC(this, 300, 550, 'jojo_girl_idle', lunaData);
    this.luna.setDepth(999);
    this.luna.play('girl_idle_down');
  }

  /**
   * Show initial dialogue
   */
  showInitialDialogue() {
    this.dialogueManager.startDialogue("Jordan", [
      "Oh no! It seems to be getting dark!",
      "We'll need somewhere to sleep tonight.",
      "Maybe we can make something from the stuff we find here?"
    ]);
  }

  /**
   * Create collectible items
   */
  createCollectibles() {
    const groundY = 620;
    
    // Dark green tarp (rectangle on ground)
    this.tarp = this.add.container(400, groundY);
    const tarpRect = this.add.rectangle(0, 0, 80, 50, 0x2d5016);
    const tarpLabel = this.add.text(0, -30, 'Tarp', {
      fontSize: '12px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    tarpLabel.setOrigin(0.5);
    this.tarp.add([tarpRect, tarpLabel]);
    this.tarp.setDepth(850);
    this.tarp.itemType = 'tarp';
    
    // Rope
    this.rope = this.add.container(600, groundY);
    const ropeSprite = this.add.sprite(0, 0, 'rope', 'rope');
    ropeSprite.setScale(0.04); // Scale down the large rope image
    const ropeLabel = this.add.text(0, -30, 'Rope', {
      fontSize: '12px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    ropeLabel.setOrigin(0.5);
    this.rope.add([ropeSprite, ropeLabel]);
    this.rope.setDepth(900);
    this.rope.itemType = 'rope';
    
    // Black cloth
    this.cloth = this.add.container(800, groundY);
    const clothRect = this.add.rectangle(0, 0, 70, 40, 0x1a1a1a);
    const clothLabel = this.add.text(0, -30, 'Black Cloth', {
      fontSize: '12px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    clothLabel.setOrigin(0.5);
    this.cloth.add([clothRect, clothLabel]);
    this.cloth.setDepth(850);
    this.cloth.itemType = 'cloth';

    const bedLabel = this.add.text(0, -30, 'Bed', {
      fontSize: '12px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    bedLabel.setOrigin(0.5);

    this.bed1 = this.add.container(500, groundY);
    const bed1Sprite = this.add.sprite(0, 0, 'bed', 'bed');
    bed1Sprite.setScale(0.1);
    this.bed1.add([bed1Sprite, bedLabel]);
    this.bed1.setDepth(900);
    this.bed1.itemType = 'bed';

    this.bed2 = this.add.container(900, groundY);
    const bed2Sprite = this.add.sprite(0, 0, 'bed', 'bed');
    bed2Sprite.setScale(0.1);
    this.bed2.add([bed2Sprite, bedLabel]);
    this.bed1.setDepth(900);
    this.bed1.itemType = 'bed';
    
    this.collectibleItems = [this.tarp, this.rope, this.cloth, this.bed1, this.bed2];
  }

  /**
   * Check for item interactions
   */
  checkItemInteractions() {
    if (!this.player || this.currentHeldItem) return;
    
    // Don't check if dialogue is active
    if (this.dialogueManager && this.dialogueManager.isDialogueActive()) {
      return;
    }
    
    let nearestItem = null;
    let nearestDistance = Infinity;
    const interactionDistance = 80;
    
    for (const item of this.collectibleItems) {
      if (!item || !item.active) continue;
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        item.x,
        item.y
      );
      
      if (distance < interactionDistance && distance < nearestDistance) {
        nearestDistance = distance;
        nearestItem = item;
      }
    }
    
    if (nearestItem) {
      if (!this.itemPrompt) {
        this.showItemPrompt(nearestItem);
      }
      
      if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
        this.pickUpItem(nearestItem);
      }
    } else {
      this.hideItemPrompt();
    }
  }

  /**
   * Show item pickup prompt
   */
  showItemPrompt(item) {
    if (this.itemPrompt) return;
    
    this.itemPrompt = this.add.text(
      item.x,
      item.y - 50,
      'Press E to pick up',
      {
        fontSize: '12px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 6, y: 3 }
      }
    );
    this.itemPrompt.setOrigin(0.5);
    this.itemPrompt.setDepth(1001);
  }

  /**
   * Hide item prompt
   */
  hideItemPrompt() {
    if (this.itemPrompt) {
      this.itemPrompt.destroy();
      this.itemPrompt = null;
    }
  }

  /**
   * Pick up an item
   */
  pickUpItem(item) {
    this.currentHeldItem = item.itemType;
    item.setVisible(false);
    item.setActive(false);
    
    this.hideItemPrompt();
    
    // Show held item indicator
    this.showHeldItemIndicator();
  }

  /**
   * Show what item the player is holding
   */
  showHeldItemIndicator() {
    if (this.heldItemText) {
      this.heldItemText.destroy();
    }
    
    const itemNames = {
      tarp: 'Tarp',
      rope: 'Rope',
      cloth: 'Black Cloth',
      bed1: 'Bed',
      bed2: 'Bed'
    };
    
    this.heldItemText = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height - 50,
      `Holding: ${itemNames[this.currentHeldItem]}`,
      {
        fontSize: '16px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    this.heldItemText.setOrigin(0.5);
    this.heldItemText.setScrollFactor(0);
    this.heldItemText.setDepth(2000);
  }

  /**
   * Check for tree interaction to drop items
   */
  checkTreeInteraction() {
    if (!this.player || !this.currentHeldItem) return;
    
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.treePosition.x,
      this.treePosition.y
    );
    
    const interactionDistance = 100;
    
    if (distance < interactionDistance) {
      if (!this.treePrompt) {
        this.showTreePrompt();
      }
      
      if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
        this.dropItemAtTree();
      }
    } else {
      this.hideTreePrompt();
    }
  }

  /**
   * Show tree drop prompt
   */
  showTreePrompt() {
    if (this.treePrompt) return;
    
    this.treePrompt = this.add.text(
      this.treePosition.x,
      this.treePosition.y - 100,
      'Press E to place item',
      {
        fontSize: '12px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 6, y: 3 }
      }
    );
    this.treePrompt.setOrigin(0.5);
    this.treePrompt.setDepth(1001);
  }

  /**
   * Hide tree prompt
   */
  hideTreePrompt() {
    if (this.treePrompt) {
      this.treePrompt.destroy();
      this.treePrompt = null;
    }
  }

  /**
   * Drop item at tree
   */
  dropItemAtTree() {
    const expectedItem = this.requiredOrder[this.itemsDelivered.length];
    
    if (this.currentHeldItem === expectedItem) {
      // Correct item!
      this.itemsDelivered.push(this.currentHeldItem);
      this.currentHeldItem = null;
      
      if (this.heldItemText) {
        this.heldItemText.destroy();
        this.heldItemText = null;
      }
      
      this.hideTreePrompt();
      
      // Show success message
      this.showMessage(`Good! ${this.itemsDelivered.length}/${this.requiredOrder.length} items placed.`);
      
      // Check if quest is complete
      if (this.itemsDelivered.length === this.requiredOrder.length) {
        this.completeQuest();
      }
    } else {
      // Wrong order!
      this.showMessage("That's not the right order! Let's think about what we need first...");
    }
  }

  /**
   * Show a temporary message
   */
  showMessage(text) {
    const msg = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 - 100,
      text,
      {
        fontSize: '18px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 15, y: 8 },
        align: 'center'
      }
    );
    msg.setOrigin(0.5);
    msg.setScrollFactor(0);
    msg.setDepth(2001);
    
    this.tweens.add({
      targets: msg,
      alpha: 0,
      duration: 1000,
      delay: 2000,
      onComplete: () => msg.destroy()
    });
  }

  /**
   * Complete the camping quest
   */
  completeQuest() {
    // Award experience
    const mainScene = this.scene.get('MainScene');
    if (mainScene && mainScene.playerStats) {
      mainScene.playerStats.experience += 1000;
      if (mainScene.updateStatsUI) {
        mainScene.updateStatsUI(false, true, false);
      }
    }
    
    // Luna plays emote
    if (this.luna) {
      this.luna.play('girl_emote');
    }
    
    // Show completion message
    const completeMsg = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      'Camp Complete!\n+1000 XP',
      {
        fontSize: '32px',
        fill: '#FFD700',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
        align: 'center'
      }
    );
    completeMsg.setOrigin(0.5);
    completeMsg.setScrollFactor(0);
    completeMsg.setDepth(2002);
    
    // Fade out and return to main scene
    this.time.delayedCall(2500, () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      
      // Wait for fade out to complete before transitioning
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop('CampScene');
        this.scene.resume('MainScene');
        
        // Mark quest as completed in MainScene
        if (mainScene) {
          mainScene.campQuestCompleted = true;
          
          // Fade back in to MainScene
          mainScene.cameras.main.fadeIn(1000, 0, 0, 0);
        }
      });
    });
  }
}

