import Phaser from 'phaser';
import Player from '../entities/Player.js';
import NPC from '../entities/NPC.js';
import AnimationManager from '../systems/AnimationManager.js';
import DialogueManager from '../systems/DialogueManager.js';
import MusicManager from '../systems/MusicManager.js';
import { PLAYER_CONFIG, GAME_CONFIG } from '../config.js';
import { getNPCData } from '../data/npcs.js';

export default class CampScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CampScene' });
  }

  create() {
    const sceneWidth = 1400;
    const sceneHeight = 700;
    this.physics.world.setBounds(0, 0, sceneWidth, sceneHeight);
    
    this.animationManager = new AnimationManager(this);
    this.dialogueManager = new DialogueManager(this);
    this.musicManager = new MusicManager(this);
    
    this.musicManager.play('hells_bells', 0.4, true, 1500);
    
    this.itemsDelivered = [];
    this.requiredOrder = ['tarp', 'rope', 'cloth', 'bed', 'bed2'];
    this.currentHeldItem = null;
    
    this.createNightSky();
    this.createGround();
    this.createTree();
    
    this.player = new Player(this, 100, 550);
    this.player.setDepth(1000);
    
    this.createLuna();
    
    this.createCollectibles();
    
    this.cameras.main.setBounds(0, 0, sceneWidth, sceneHeight);
    
    this.physics.add.collider(this.player, this.groundPlatform);
    this.physics.add.collider(this.luna, this.groundPlatform);

    this.createObstacles();
    
    this.interactionKey = this.input.keyboard.addKey('E');
    
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    
    this.time.delayedCall(1500, () => {
      this.showInitialDialogue();
    });
  }

  update() {
    this.player.update();
    
    if (this.luna) {
      this.luna.update();
    }
    
    if (this.dialogueManager) {
      this.dialogueManager.update();
    }
    
    if (this.movingPlatform && this.bed && this.bed.active) {
      this.bed.y = this.movingPlatform.y - 40;
    }

    if (this.movingPlatform3 && this.rope && this.rope.active) {
      this.rope.y = this.movingPlatform3.y - 40;
    }
    
    this.checkItemInteractions();
    
    this.checkTreeInteraction();
  }

  createNightSky() {
    const gradient = this.add.graphics();
    
    const strips = 50;
    const stripHeight = GAME_CONFIG.height / strips;
    
    for (let i = 0; i < strips; i++) {
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
    
    this.createStars();
  }

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

  createGround() {
    const groundY = GAME_CONFIG.height - 80;
    
    this.groundPlatform = this.add.rectangle(
      700,
      GAME_CONFIG.height - 20,
      1400,
      40,
      0x3a2617 // Dark brown
    );
    this.physics.add.existing(this.groundPlatform, true);
    
    const grassGraphics = this.add.graphics();
    grassGraphics.fillStyle(0x1a5c1a, 1); // Dark green
    grassGraphics.fillRect(0, groundY, 1400, 60);
    
    grassGraphics.fillStyle(0x2d7a2d, 1); // Slightly lighter
    grassGraphics.fillRect(0, groundY, 1400, 20);

    this.createGrassBlades(grassGraphics, groundY);
  }

    createGrassBlades(graphics, groundY) {
      graphics.lineStyle(2, 0x2E8B57, 1);
      
      // Draw grass blades across the ground
      for (let x = 0; x < 1800; x += 15) {
        const bladeX = x + Math.random() * 10;
        const bladeHeight = 8 + Math.random() * 8;
        const bladeY = groundY + 10;
        
        // Draw a simple blades
        graphics.beginPath();
        graphics.moveTo(bladeX, bladeY);
        graphics.lineTo(bladeX + 2, bladeY - bladeHeight);
        graphics.strokePath();
      }
    }

  createTree() {
    const treeX = 1200;
    const treeY = 570;

    this.tree = this.add.sprite(treeX, treeY, 'platform', 'tree_2');
    this.tree.setOrigin(0.5);
    this.tree.setDepth(800);
    this.tree.setScale(1.5);
    
    this.treePosition = { x: treeX, y: treeY };
  }

  createLuna() {
    const lunaData = getNPCData('jojoGirl');
    
    this.luna = new NPC(this, 200, 550, 'jojo_girl_idle', lunaData);
    this.luna.setDepth(999);
    this.luna.play('girl_idle_down');
  }

  showInitialDialogue() {
    this.dialogueManager.startDialogue("Jordan", [
      "Oh no! It seems to be getting dark!",
      "We'll need somewhere to sleep tonight.",
      "Maybe we can make something from the stuff we find here?",
      "Remember to press E to pick up any items you see!",
      "Seems like something went wrong with the physics in this world. You can only jump when a platform is moving up..."
    ]);
  }

  createCollectibles() {
    const groundY = 620;
    
    // Dark green tarp (rectangle on ground)
    this.tarp = this.add.container(1000, groundY);

    // Base shape (use darker green with a gradient-like effect)
    const tarp = this.add.graphics();
    const width = 120;
    const height = 70;
    const topColor = Phaser.Display.Color.HexStringToColor('#3a6b20');
    const bottomColor = Phaser.Display.Color.HexStringToColor('#1e3f10');
    
    // Simulate lighting with a vertical gradient using horizontal strips
    const strips = 10;
    const stripHeight = height / strips;
    for (let i = 0; i < strips; i++) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        topColor,
        bottomColor,
        strips,
        i
      );
      tarp.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      tarp.fillRect(-width / 2, -height / 2 + (i * stripHeight), width, stripHeight);
    }
    
    // Add outline for definition
    tarp.lineStyle(2, 0x1b2e0c, 1);
    tarp.strokeRect(-width / 2, -height / 2, width, height);
    
    // Add some wrinkle lines to simulate fabric texture
    tarp.lineStyle(1, 0x2a5018, 0.5);
    for (let i = 0; i < 3; i++) {
      const yPos = -height / 2 + (height / 4) * (i + 1);
      tarp.beginPath();
      tarp.moveTo(-width / 2 + 10, yPos);
      tarp.lineTo(width / 2 - 10, yPos + Phaser.Math.Between(-3, 3));
      tarp.strokePath();
    }
    
    // Add soft shadow underneath to anchor it to the ground
    const shadow = this.add.ellipse(0, height / 2, width * 1.2, 15, 0x000000, 0.3);
    shadow.setAlpha(0.3);
    
    // Create a sub-container for the tarp graphic and shadow (to be transformed)
    const tarpGraphicContainer = this.add.container(0, 0);
    tarpGraphicContainer.add([shadow, tarp]);
    
    // Apply perspective transformations only to the graphic, not the label
    tarpGraphicContainer.setScale(1, 0.5);
    tarpGraphicContainer.setRotation(Phaser.Math.DegToRad(2));
    
    const tarpLabel = this.add.text(0, -40, 'Tarp', {
      fontSize: '12px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    tarpLabel.setOrigin(0.5);
    
    this.tarp.add([tarpGraphicContainer, tarpLabel]);
    this.tarp.setDepth(850);
    this.tarp.itemType = 'tarp';
    
    // Rope
    this.rope = this.add.container(800, groundY);
    const ropeSprite = this.add.tileSprite(0, 0, 2325, 1710, 'rope');
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

    this.cloth = this.add.container(200, groundY - 490);
    const clothSprite = this.add.tileSprite(0, 0, 260, 280, 'cloth');
    clothSprite.setScale(0.4); // Scale down the large rope image
    const clothLabel = this.add.text(0, -30, 'Cloth', {
      fontSize: '12px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    clothLabel.setOrigin(0.5);
    this.cloth.add([clothSprite, clothLabel]);
    this.cloth.setDepth(900);
    this.cloth.itemType = 'cloth';

    const bedLabel = this.add.text(0, -30, 'Bed', {
      fontSize: '12px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    bedLabel.setOrigin(0.5);

    this.bed = this.add.container(300, groundY - 220);
    const bedSprite = this.add.tileSprite(0, 0, 2400, 1560, 'bed');
    bedSprite.setScale(0.03);
    this.bed.add([bedSprite, bedLabel]);
    this.bed.setDepth(900);
    this.bed.itemType = 'bed';

    this.bed2 = this.add.container(500, groundY);
    const bed2Sprite = this.add.tileSprite(0, 0, 2400, 1560, 'bed');
    bed2Sprite.setScale(0.03);
    this.bed2.add([bed2Sprite, bedLabel]);
    this.bed2.setDepth(900);
    this.bed2.itemType = 'bed2';

    this.collectibleItems = [this.tarp, this.rope, this.bed, this.cloth, this.bed2];
  }

  checkItemInteractions() {
    if (!this.player || this.currentHeldItem) return;
    
    if (this.dialogueManager && this.dialogueManager.isDialogueActive()) {
      return;
    }
    
    let nearestItem = null;
    let nearestDistance = Infinity;
    const interactionDistance = 50;
    
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
      if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
        this.pickUpItem(nearestItem);
      }
    } else {
      this.hideItemPrompt();
    }
  }

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

  hideItemPrompt() {
    if (this.itemPrompt) {
      this.itemPrompt.destroy();
      this.itemPrompt = null;
    }
  }

  pickUpItem(item) {
    this.currentHeldItem = item.itemType;
    item.setVisible(false);
    item.setActive(false);
    
    this.hideItemPrompt();
    
    this.showHeldItemIndicator();
  }

  showHeldItemIndicator() {
    if (this.heldItemText) {
      this.heldItemText.destroy();
    }
    
    const itemNames = {
      tarp: 'Tarp',
      rope: 'Rope',
      bed: 'Bed',
      cloth: 'Cloth',
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

  hideTreePrompt() {
    if (this.treePrompt) {
      this.treePrompt.destroy();
      this.treePrompt = null;
    }
  }

  dropItemAtTree() {  
    this.itemsDelivered.push(this.currentHeldItem);
    this.currentHeldItem = null;
    
    if (this.heldItemText) {
      this.heldItemText.destroy();
      this.heldItemText = null;
    }
    
    this.hideTreePrompt();
    
    this.showMessage(`${this.itemsDelivered.length}/${this.requiredOrder.length} items placed.`);
    
    if (this.itemsDelivered.length === this.requiredOrder.length) {
      this.tent = this.add.container(1300, 605);
      const tentSprite = this.add.tileSprite(0, 0, 350, 350, 'tent');
      tentSprite.setScale(0.5); // Scale down the large tent image
      this.tent.add([tentSprite]);
      this.tent.setDepth(900);
      
      this.completeQuest();
    }
  }

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

  completeQuest() {
    const mainScene = this.scene.get('MainScene');
    if (mainScene && mainScene.playerStats) {
      mainScene.playerStats.experience += 1000;
      if (mainScene.updateStatsUI) {
        mainScene.updateStatsUI(false, true, false);
      }
    }
    
    if (this.luna) {
      this.luna.play('girl_emote');
    }
    
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
    
    this.time.delayedCall(5000, () => {
      this.musicManager.stop(1000);
      
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      
      // Wait for fade out to complete before transitioning
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Mark quest as completed in MainScene before stopping
        if (mainScene) {
          mainScene.campQuestCompleted = true;
        }
        
        // Stop this scene and resume MainScene
        this.scene.stop('CampScene');
        this.scene.resume('MainScene');
        
        // Fade back in to MainScene (music will restart via resume event)
        if (mainScene) {
          mainScene.cameras.main.fadeIn(1000, 0, 0, 0);
        }
      });
    });
  }

  createPlatform(x, y, texture = 'platform_0', isStatic = true) {
    const platform = this.add.sprite(x, y, 'platform', texture);
    platform.setOrigin(0.5);
    platform.setDepth(800); 

    this.physics.add.existing(platform, isStatic);
    this.physics.add.collider(this.player, platform);

    return platform;
  }

  createObstacles() {
    const groundY = GAME_CONFIG.height - 80;

    this.movingPlatform = this.createPlatform(300, groundY - 160, 'platform_3', false);
    this.movingPlatform.body.setImmovable(true);
    this.movingPlatform.body.setAllowGravity(false);

    this.movingPlatform2 = this.createPlatform(480, groundY - 320, 'platform_3', false);
    this.movingPlatform2.body.setImmovable(true);
    this.movingPlatform2.body.setAllowGravity(false);

    this.movingPlatform3 = this.createPlatform(800, groundY - 40, 'platform_3', false);
    this.movingPlatform3.body.setImmovable(true);
    this.movingPlatform3.body.setAllowGravity(false);

    
    this.tweens.add({
      targets: this.movingPlatform,
      y: 300,
      duration: 3000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: this.movingPlatform2,
      y: 400,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    
    this.tweens.add({
      targets: this.movingPlatform3,
      y: 400,
      duration: 3000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    this.createPlatform(200, groundY - 400, 'platform_0');
  }
}

