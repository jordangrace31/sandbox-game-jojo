import Phaser from 'phaser';
import Player from '../entities/Player.js';
import NPC from '../entities/NPC.js';
import AnimationManager from '../systems/AnimationManager.js';
import DialogueManager from '../systems/DialogueManager.js';
import { GAME_CONFIG } from '../config.js';
import { getNPCData } from '../data/npcs.js';

export default class ClubScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ClubScene' });
  }

  create() {
    this.sceneWidth = 1400;
    this.sceneHeight = 700;
    this.physics.world.setBounds(0, 0, this.sceneWidth, this.sceneHeight);
    
    this.playerStats = this.registry.get('playerStats');
    
    this.animationManager = new AnimationManager(this);
    this.dialogueManager = new DialogueManager(this);

    this.player = new Player(this, 200, 100);
    this.player.setDepth(1000);
    
    this.createWalls();
    this.createFloor();
    this.createBar();
    this.createDancefloor();
    this.createBarStools();
    this.createLighting();
    this.createExitDoor();
    
    this.createNPCs();
    
    this.cameras.main.setBounds(0, 0, this.sceneWidth, this.sceneHeight);
    
    this.physics.add.collider(this.player, this.groundPlatform);
    
    this.interactionKey = this.input.keyboard.addKey('E');
    
    this.exitKey = this.input.keyboard.addKey('Q');
    
    this.danceKey = this.input.keyboard.addKey('D');
    
    this.danceQuestActive = false;
    this.danceQuestCompleted = false;
    this.danceTime = 0;
    this.danceTimeNeeded = 20; // 20 seconds
    this.isDancing = false;
    
    this.createQuestUI();
    
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update(time, delta) {
    this.player.update();
    
    if (this.sirAllister) {
      this.sirAllister.update();
      this.updateSirAllister();
    }
    
    if (this.lunaGirl) {
      this.lunaGirl.update();
      
      if (this.lunaFollowEnabled && !this.isDancing) {
        this.updateLunaFollowBehavior();
      }
    }
    
    if (this.dialogueManager) {
      this.dialogueManager.update();
    }
    
    this.handleDanceMechanics(delta);
    
    this.checkExit();
  }

  checkExit() {
    if (Phaser.Input.Keyboard.JustDown(this.exitKey)) {
      if (this.danceQuestCompleted) {
        this.returnToLockStockScene();
      } else if (this.danceQuestActive) {
        this.showQuestIncompleteMessage();
      } else {
        this.showQuestIncompleteMessage();
      }
    }
    
    if (this.exitDoor && this.player) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.exitDoor.x,
        this.exitDoor.y
      );
      
      if (distance < 80) {
        if (!this.doorPrompt) {
          this.showDoorPrompt();
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
          if (this.danceQuestCompleted) {
            this.returnToLockStockScene();
          } else if (this.danceQuestActive) {
            this.showQuestIncompleteMessage();
          } else {
            this.showQuestIncompleteMessage();
          }
        }
      } else {
        this.hideDoorPrompt();
      }
    }
  }

  showDoorPrompt() {
    if (this.doorPrompt) return;
    
    this.doorPrompt = this.add.text(
      this.exitDoor.x,
      this.exitDoor.y - 60,
      'Press E to leave',
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

  returnToLockStockScene() {
    const lockStockScene = this.scene.get('LockStockScene');
    
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('ClubScene');
      
      if (lockStockScene) {
        this.scene.resume('LockStockScene');
        
        lockStockScene.cameras.main.fadeIn(1000, 0, 0, 0);
      }
    });
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

  createWalls() {
    const walls = this.add.graphics();
    
    walls.fillStyle(0x1a0a0a, 1);
    walls.fillRect(0, 0, this.sceneWidth, GAME_CONFIG.height);
    
    // Add some decorative wall panels
    walls.fillStyle(0x2a0a0a, 1);
    
    // Left wall panel
    walls.fillRect(20, 50, 100, 400);
    
    // Right wall panel
    walls.fillRect(this.sceneWidth - 120, 50, 100, 400);
    
    // Wall highlights
    walls.lineStyle(2, 0xff0000, 0.3);
    walls.strokeRect(20, 50, 100, 400);
    walls.strokeRect(this.sceneWidth - 120, 50, 100, 400);
  }

  createFloor() {
    const floorY = GAME_CONFIG.height - 120;
    
    this.groundPlatform = this.add.rectangle(
      700,
      floorY + 10,
      this.sceneWidth,
      40,
      0x2a2a2a
    );
    this.physics.add.existing(this.groundPlatform, true);
    
    const floor = this.add.graphics();
    floor.fillStyle(0x1a1a1a, 1);
    floor.fillRect(0, floorY - 20, this.sceneWidth, 140);
    
    floor.lineStyle(1, 0x0a0a0a, 0.5);
    
    for (let x = 0; x < this.sceneWidth; x += 60) {
      floor.beginPath();
      floor.moveTo(x, floorY - 20);
      floor.lineTo(x, GAME_CONFIG.height);
      floor.strokePath();
    }
    
    for (let y = floorY - 20; y < GAME_CONFIG.height; y += 60) {
      floor.beginPath();
      floor.moveTo(0, y);
      floor.lineTo(this.sceneWidth, y);
      floor.strokePath();
    }
  }

  createBar() {
    const barX = 1100;
    const barY = 450;
    const barWidth = 250;
    const barHeight = 150;
    
    const bar = this.add.graphics();
    bar.fillStyle(0x4a2a0a, 1);
    bar.fillRect(barX, barY, barWidth, barHeight);
    
    bar.fillStyle(0x3a1a0a, 1);
    bar.fillRect(barX - 10, barY - 10, barWidth + 20, 20);
    
    // Bar front decoration
    bar.lineStyle(3, 0x6a4a2a, 1);
    bar.strokeRect(barX, barY, barWidth, barHeight);
    
    // Add some bar details (vertical wood panels)
    bar.lineStyle(2, 0x2a1a0a, 0.5);
    for (let x = barX; x < barX + barWidth; x += 40) {
      bar.beginPath();
      bar.moveTo(x, barY);
      bar.lineTo(x, barY + barHeight);
      bar.strokePath();
    }
    
    // Add bottles on the bar
    this.createBottles(barX, barY);

    // Create invisible physics body for collision
    this.barCollider = this.add.rectangle(
      barX + barWidth / 2,
      barY + barHeight / 2,
      barWidth,
      barHeight,
      0x000000,
      0 // Invisible
    );
    this.physics.add.existing(this.barCollider, true); // true = static body
    this.physics.add.collider(this.player, this.barCollider);
  }

  createBottles(barX, barY) {
    const bottlePositions = [
      { x: barX + 50, colors: [0x00ff00, 0x00aa00] },
      { x: barX + 100, colors: [0x8B4513, 0x654321] },
      { x: barX + 150, colors: [0x4169E1, 0x1E3A8A] },
      { x: barX + 200, colors: [0xff6600, 0xcc5500] }
    ];
    
    bottlePositions.forEach((pos, index) => {
      const container = this.add.container(pos.x, barY - 25);
      
      // Bottle body
      const body = this.add.rectangle(0, 0, 8, 25, pos.colors[0]);
      
      // Bottle neck
      const neck = this.add.rectangle(0, -15, 4, 8, pos.colors[1]);
      
      // Bottle cap
      const cap = this.add.rectangle(0, -20, 5, 3, 0xffd700);
      
      container.add([body, neck, cap]);
      container.setDepth(500);
    });
  }

  /**
   * Create bar stools
   */
  createBarStools() {
    const stoolPositions = [
      { x: 950, y: 500 },
      { x: 1000, y: 500 },
      { x: 1050, y: 500 }
    ];
    
    this.stoolColliders = [];
    
    stoolPositions.forEach(pos => {
      const stool = this.add.graphics();
      
      // Stool seat
      stool.fillStyle(0x654321, 1);
      stool.fillEllipse(pos.x, pos.y, 30, 15);
      
      // Stool top highlight
      stool.fillStyle(0x8B4513, 1);
      stool.fillEllipse(pos.x, pos.y - 2, 25, 12);
      
      // Stool leg
      stool.lineStyle(8, 0x3a3a3a, 1);
      stool.beginPath();
      stool.moveTo(pos.x, pos.y + 5);
      stool.lineTo(pos.x, pos.y + 80);
      stool.strokePath();
      
      // Stool base
      stool.fillStyle(0x3a3a3a, 1);
      stool.fillCircle(pos.x, pos.y + 85, 15);

      // Create invisible physics body for collision
      const stoolCollider = this.add.rectangle(
        pos.x,
        pos.y + 45, // Center of the stool vertically
        30,
        90, // Height of the stool
        0x000000,
        0 // Invisible
      );
      this.physics.add.existing(stoolCollider, true); // true = static body
      this.physics.add.collider(this.player, stoolCollider);
      this.stoolColliders.push(stoolCollider);
    });
  }

  /**
   * Create dancefloor
   */
  createDancefloor() {
    // Match the floor positioning
    const floorY = GAME_CONFIG.height - 120; // Same as createFloor()
    
    // Position dancefloor on the actual floor
    const floorX = 300;
    const dancefloorY = floorY - 20; // Start at the top of the floor graphics
    const floorWidth = 400;
    const floorHeight = 120; // Fit within the floor height (140px total, leave some margin)
    
    // Dancefloor container
    const dancefloor = this.add.graphics();
    
    // Create checkered pattern matching floor tile size
    const tileSize = 60; // Match the floor tile size from createFloor()
    const numCols = Math.floor(floorWidth / tileSize);
    const numRows = Math.floor(floorHeight / tileSize);
    
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const isEven = (row + col) % 2 === 0;
        const color = isEven ? 0x1a1a1a : 0x2a2a2a;
        
        dancefloor.fillStyle(color, 1);
        dancefloor.fillRect(
          floorX + col * tileSize,
          dancefloorY + row * tileSize,
          tileSize,
          tileSize
        );
      }
    }
    
    // Add animated lights on dancefloor tiles
    this.createDancefloorLights(floorX, dancefloorY, numCols * tileSize, numRows * tileSize, tileSize);
  }

  /**
   * Create animated dancefloor lights
   */
  createDancefloorLights(floorX, floorY, floorWidth, floorHeight, tileSize) {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0xffff00];
    
    const numRows = Math.floor(floorHeight / tileSize);
    const numCols = Math.floor(floorWidth / tileSize);
    
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const light = this.add.circle(
          floorX + col * tileSize + tileSize / 2,
          floorY + row * tileSize + tileSize / 2,
          tileSize / 3,
          Phaser.Utils.Array.GetRandom(colors),
          0.3
        );
        
        // Pulsing animation
        this.tweens.add({
          targets: light,
          alpha: 0.7,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 500 + Math.random() * 1000,
          yoyo: true,
          repeat: -1,
          delay: Math.random() * 1000
        });
      }
    }
  }

  createLighting() {
    const spotlightPositions = [
      { x: 300, y: 100 },
      { x: 500, y: 80 },
      { x: 700, y: 100 },
      { x: 900, y: 80 }
    ];
    
    spotlightPositions.forEach((pos, index) => {
      const spotlight = this.add.circle(pos.x, pos.y, 40, 0xffff00, 0.2);
      
      this.tweens.add({
        targets: spotlight,
        alpha: 0.3,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        delay: index * 250
      });
    });
  }

  createExitDoor() {
    const doorX = 100;
    const doorY = 470;
    const doorWidth = 60;
    const doorHeight = 100;
    
    this.exitDoor = { x: doorX + doorWidth / 2, y: doorY + doorHeight / 2 };
    
    const door = this.add.rectangle(
      doorX + doorWidth / 2,
      doorY + doorHeight / 2,
      doorWidth,
      doorHeight,
      0x654321
    );
    door.setStrokeStyle(3, 0x3a2617);
        
    const exitSign = this.add.text(doorX + doorWidth / 2, doorY - 20, 'EXIT', {
      fontSize: '14px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 2 }
    });
    exitSign.setOrigin(0.5);
  }

  createNPCs() {
    const sirAllisterData = getNPCData('sirAllister');
    
    const sirAllisterX = 1225;
    const sirAllisterY = 400;
    
    this.sirAllister = new NPC(this, sirAllisterX, sirAllisterY, 'sir_allister_idle', sirAllisterData);
    this.sirAllister.setDepth(sirAllisterData.depth);
    
    this.physics.add.collider(this.sirAllister, this.groundPlatform);
    this.physics.add.collider(this.sirAllister, this.barCollider);
    
    this.sirAllisterState = 'waiting';
    this.sirAllisterHasGreeted = false;
    
    this.sirAllister.play('sir_allister_idle');
    
    const lunaData = getNPCData('jojoGirl');
    
    const lunaX = 250;
    const lunaY = GAME_CONFIG.height - 230;
    
    this.lunaGirl = new NPC(this, lunaX, lunaY, 'jojo_girl_idle', lunaData);
    this.lunaGirl.setDepth(lunaData.depth);
    
    this.lunaGirl.play('girl_idle_right');
    
    this.physics.add.collider(this.lunaGirl, this.groundPlatform);
    
    this.lunaFollowEnabled = true;
  }

  updateSirAllister() {
    if (!this.sirAllister || !this.player) return;
    
    if (this.sirAllisterState === 'waiting' && this.player.x >= 500) {
      this.sirAllisterState = 'running';
      this.sirAllister.play('sir_allister_run_left');
    }
    
    if (this.sirAllisterState === 'running') {
      const distance = Phaser.Math.Distance.Between(
        this.sirAllister.x,
        this.sirAllister.y,
        this.player.x,
        this.player.y
      );
      
      if (distance > 100) {
        const angle = Phaser.Math.Angle.Between(
          this.sirAllister.x,
          this.sirAllister.y,
          this.player.x,
          this.player.y
        );
        
        const speed = 30;
        this.sirAllister.setVelocityX(Math.cos(angle) * speed);
        
        if (Math.cos(angle) < -0.5) {
          this.sirAllister.play('sir_allister_run_left', true);
        } else if (Math.cos(angle) > 0.5) {
          this.sirAllister.play('sir_allister_run_right', true);
        }
      } else {
        this.sirAllister.setVelocityX(0);
        this.sirAllister.play('sir_allister_idle');
        this.sirAllisterState = 'dialogue';
        
        this.dialogueManager.startDialogue("Sir Allister", this.sirAllister.npcData.dialogues);
        
        this.danceQuestActive = true;
        this.updateQuestUI();
        
        this.time.delayedCall(10000, () => {
          this.sirAllisterState = 'idle';
          this.startSirAllisterIdleBehavior();
        });
      }
    }
  }

  startSirAllisterIdleBehavior() {
    if (!this.sirAllister) return;
    
    this.time.addEvent({
      delay: 5000,
      callback: () => {
        if (this.sirAllister && this.sirAllisterState === 'idle') {
          if (this.sirAllister.anims.currentAnim.key === 'sir_allister_idle') {
            this.sirAllister.play('sir_allister_emote');
          } else {
            this.sirAllister.play('sir_allister_idle');
          }
        }
      },
      loop: true
    });
  }

  updateLunaFollowBehavior() {
    if (!this.lunaGirl || !this.player) return;
    
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.lunaGirl.x,
      this.lunaGirl.y
    );
    
    const followDistance = 80;
    
    if (distance > followDistance) {
      const angle = Phaser.Math.Angle.Between(
        this.lunaGirl.x,
        this.lunaGirl.y,
        this.player.x,
        this.player.y
      );
      
      const speed = 150;
      
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

  createQuestUI() {
    this.questText = this.add.text(
      GAME_CONFIG.width / 2,
      70,
      '',
      {
        fontSize: '18px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 12, y: 8 },
        align: 'center'
      }
    );
    this.questText.setOrigin(0.5);
    this.questText.setScrollFactor(0);
    this.questText.setDepth(2000);
    this.questText.setVisible(false);

    this.dancePrompt = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height - 100,
      'Hold D to dance!',
      {
        fontSize: '20px',
        fill: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 15, y: 10 },
        fontStyle: 'bold'
      }
    );
    this.dancePrompt.setOrigin(0.5);
    this.dancePrompt.setScrollFactor(0);
    this.dancePrompt.setDepth(2000);
    this.dancePrompt.setVisible(false);
  }

  updateQuestUI() {
    if (!this.questText) return;
    
    if (this.danceQuestActive && !this.danceQuestCompleted) {
      this.questText.setText(`Dance with Sir Allister: ${this.danceTime.toFixed(1)}s / ${this.danceTimeNeeded}s`);
      this.questText.setVisible(true);
      
      if (this.sirAllister && this.player) {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          this.sirAllister.x,
          this.sirAllister.y
        );
        
        this.dancePrompt.setVisible(distance < 150 && !this.isDancing);
      }
    } else if (this.danceQuestCompleted) {
      this.questText.setText('Dance Quest Complete! You may leave.');
      this.questText.setFill('#00ff00');
      this.dancePrompt.setVisible(false);
    } else {
      this.questText.setVisible(false);
      this.dancePrompt.setVisible(false);
    }
  }

  handleDanceMechanics(delta) {
    if (this.danceQuestActive && !this.danceQuestCompleted) {
      if (this.danceKey.isDown) {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          this.sirAllister.x,
          this.sirAllister.y
        );
        
        if (distance < 150) {
          if (!this.isDancing) {
            this.startDancing();
          }
          
          this.danceTime += delta / 1000;
          
          if (this.danceTime >= this.danceTimeNeeded) {
            this.completeDanceQuest();
          }
          
          this.updateQuestUI();
        } else {
          if (this.isDancing) {
            this.stopDancing();
          }
        }
      } else {
        if (this.isDancing) {
          this.stopDancing();
        }
      }
    }
    else if (this.danceQuestCompleted) {
      if (this.danceKey.isDown) {
        if (!this.isDancing) {
          this.startFreeDancing();
        }
      } else {
        if (this.isDancing) {
          this.stopFreeDancing();
        }
      }
    }
  }

  startDancing() {
    this.isDancing = true;
    
    this.player.setVelocity(0, 0);
    this.player.isDancing = true;
    
    this.player.play('player_emote', true);
    if (this.sirAllister) {
      this.sirAllister.play('sir_allister_emote', true);
    }
    
    if (this.lunaGirl) {
      this.lunaGirl.setVelocity(0, 0);
      this.lunaGirl.play('girl_emote', true);
    }
    
    this.updateQuestUI();
  }

  stopDancing() {
    this.isDancing = false;
    
    this.player.isDancing = false;
    
    this.player.play('idle_down', true);
    if (this.sirAllister) {
      this.sirAllister.play('sir_allister_idle', true);
    }
    
    if (this.lunaGirl) {
      const direction = this.player.x > this.lunaGirl.x ? 'right' : 'left';
      this.lunaGirl.play(`girl_idle_${direction}`, true);
    }
    
    this.updateQuestUI();
  }

  startFreeDancing() {
    this.isDancing = true;
    
    this.player.setVelocity(0, 0);
    this.player.isDancing = true;
    
    this.player.play('player_emote', true);
    
    if (this.lunaGirl) {
      this.lunaGirl.setVelocity(0, 0);
      this.lunaGirl.play('girl_emote', true);
    }
  }

  stopFreeDancing() {
    this.isDancing = false;
    
    this.player.isDancing = false;
    
    this.player.play('idle_down', true);
    
    if (this.lunaGirl) {
      const direction = this.player.x > this.lunaGirl.x ? 'right' : 'left';
      this.lunaGirl.play(`girl_idle_${direction}`, true);
    }
  }

  completeDanceQuest() {
    this.danceQuestCompleted = true;
    this.isDancing = false;
    
    this.player.isDancing = false;
    
    this.player.play('idle_down', true);
    if (this.sirAllister) {
      this.sirAllister.play('sir_allister_idle', true);
    }
    
    if (this.lunaGirl) {
      const direction = this.player.x > this.lunaGirl.x ? 'right' : 'left';
      this.lunaGirl.play(`girl_idle_${direction}`, true);
    }
    
    this.giveQuestRewards();
    
    this.dialogueManager.startDialogue("Sir Allister", [
      "You earned 100 gold and 150 XP!",
      "You may now leave whenever you wish. Cheers!"
    ]);
    
    this.updateQuestUI();
  }

  giveQuestRewards() {
    if (!this.playerStats) return;
    
    const quest = this.sirAllister.npcData.quests[0];
    const rewards = quest.rewards;
    
    if (rewards.gold) {
      this.playerStats.gold += rewards.gold;
    }
    
    if (rewards.experience) {
      this.playerStats.experience += rewards.experience;
    }
    
    if (rewards.items && rewards.items.length > 0) {
      this.playerStats.items.push(...rewards.items);
    }
    
    quest.completed = true;
    
    this.showRewardNotification(rewards);
  }

  showRewardNotification(rewards) {
    let rewardText = 'Rewards:\n';
    
    if (rewards.gold) {
      rewardText += `💰 +${rewards.gold} Gold\n`;
    }
    
    if (rewards.experience) {
      rewardText += `⭐ +${rewards.experience} XP\n`;
    }
    
    if (rewards.items && rewards.items.length > 0) {
      rewardText += `📦 ${rewards.items.join(', ')}`;
    }
    
    const notification = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 - 100,
      rewardText,
      {
        fontSize: '20px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 15 },
        align: 'center'
      }
    );
    notification.setOrigin(0.5);
    notification.setScrollFactor(0);
    notification.setDepth(3000);
    
    this.tweens.add({
      targets: notification,
      alpha: 0,
      duration: 1000,
      delay: 3000,
      onComplete: () => notification.destroy()
    });
  }

  showQuestIncompleteMessage() {
    if (!this.questWarningText) {
      this.questWarningText = this.add.text(
        GAME_CONFIG.width / 2,
        GAME_CONFIG.height / 2,
        'You must find Sir Allister before you can leave...',
        {
          fontSize: '20px',
          fill: '#ff0000',
          backgroundColor: '#000000',
          padding: { x: 20, y: 15 },
          align: 'center'
        }
      );
      this.questWarningText.setOrigin(0.5);
      this.questWarningText.setScrollFactor(0);
      this.questWarningText.setDepth(3000);
      
      this.time.delayedCall(3000, () => {
        if (this.questWarningText) {
          this.questWarningText.destroy();
          this.questWarningText = null;
        }
      });
    }
  }
}

