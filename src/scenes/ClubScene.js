/**
 * ClubScene
 * Interior of the Lock Stock club with bar, stools, and dancefloor
 */

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
    // Set world bounds (club interior)
    this.sceneWidth = 1400;
    this.sceneHeight = 700;
    this.physics.world.setBounds(0, 0, this.sceneWidth, this.sceneHeight);
    
    // Get player stats from registry (shared across scenes)
    this.playerStats = this.registry.get('playerStats');
    
    // Initialize systems (no MusicManager - music continues while in club)
    this.animationManager = new AnimationManager(this);
    this.dialogueManager = new DialogueManager(this);

        // Create the player
    this.player = new Player(this, 200, 100);
    this.player.setDepth(1000);
    
    // Create the club interior
    this.createWalls();
    this.createFloor();
    this.createBar();
    // this.createDancefloor();
    this.createBarStools();
    this.createLighting();
    this.createExitDoor();
    
    // Create NPCs
    this.createNPCs();
    
    // Set up camera
    this.cameras.main.setBounds(0, 0, this.sceneWidth, this.sceneHeight);
    
    // Set up collisions
    this.physics.add.collider(this.player, this.groundPlatform);
    
    // Set up interaction key
    this.interactionKey = this.input.keyboard.addKey('E');
    
    // Set up exit key
    this.exitKey = this.input.keyboard.addKey('Q');
    
    // Set up dance key
    this.danceKey = this.input.keyboard.addKey('D');
    
    // Quest tracking
    this.danceQuestActive = false;
    this.danceQuestCompleted = false;
    this.danceTime = 0;
    this.danceTimeNeeded = 20; // 20 seconds
    this.isDancing = false;
    
    // Add exit prompt
    // this.createExitPrompt();
    
    // Create quest UI
    this.createQuestUI();
    
    // Fade in from black
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update(time, delta) {
    // Update player
    this.player.update();
    
    // Update NPCs
    if (this.sirAllister) {
      this.sirAllister.update();
      this.updateSirAllister();
    }
    
    if (this.lunaGirl) {
      this.lunaGirl.update();
      
      // Make Luna follow player if enabled and not dancing
      if (this.lunaFollowEnabled && !this.isDancing) {
        this.updateLunaFollowBehavior();
      }
    }
    
    // Update dialogue manager
    if (this.dialogueManager) {
      this.dialogueManager.update();
    }
    
    // Handle dance mechanics
    this.handleDanceMechanics(delta);
    
    // Check for exit
    this.checkExit();
  }

  /**
   * Check if player wants to exit the club
   */
  checkExit() {
    // Check if quest is completed before allowing exit
    if (Phaser.Input.Keyboard.JustDown(this.exitKey)) {
      if (this.danceQuestCompleted) {
        this.returnToLockStockScene();
      } else if (this.danceQuestActive) {
        this.showQuestIncompleteMessage();
      } else {
        this.showQuestIncompleteMessage();
      }
    }
    
    // Also check if player is near the exit door
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

  /**
   * Show door interaction prompt
   */
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

  /**
   * Hide door prompt
   */
  hideDoorPrompt() {
    if (this.doorPrompt) {
      this.doorPrompt.destroy();
      this.doorPrompt = null;
    }
  }

  /**
   * Return to Lock Stock Scene
   */
  returnToLockStockScene() {
    // Get LockStock scene
    const lockStockScene = this.scene.get('LockStockScene');
    
    // Fade out
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    
    // Wait for fade out to complete before switching scenes
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Stop ClubScene
      this.scene.stop('ClubScene');
      
      // Resume LockStockScene (music will continue playing)
      if (lockStockScene) {
        this.scene.resume('LockStockScene');
        
        // Fade back in to LockStockScene
        lockStockScene.cameras.main.fadeIn(1000, 0, 0, 0);
      }
    });
  }

  /**
   * Create exit prompt
   */
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

  /**
   * Create club walls
   */
  createWalls() {
    const walls = this.add.graphics();
    
    // Dark walls with red tint
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

  /**
   * Create club floor
   */
  createFloor() {
    const floorY = GAME_CONFIG.height - 120;
    
    // Create main floor platform (physics body)
    this.groundPlatform = this.add.rectangle(
      700,
      floorY + 10,
      this.sceneWidth,
      40,
      0x2a2a2a
    );
    this.physics.add.existing(this.groundPlatform, true);
    
    // Floor graphics
    const floor = this.add.graphics();
    floor.fillStyle(0x1a1a1a, 1);
    floor.fillRect(0, floorY - 20, this.sceneWidth, 140);
    
    // Add floor tiles pattern
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

  /**
   * Create the bar
   */
  createBar() {
    const barX = 1100;
    const barY = 450;
    const barWidth = 250;
    const barHeight = 150;
    
    // Bar counter
    const bar = this.add.graphics();
    bar.fillStyle(0x4a2a0a, 1);
    bar.fillRect(barX, barY, barWidth, barHeight);
    
    // Bar top (darker wood)
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

  /**
   * Create bottles on the bar
   */
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
    const floorX = 300;
    const floorY = 400;
    const floorWidth = 400;
    const floorHeight = 200;
    
    // Dancefloor container
    const dancefloor = this.add.graphics();
    
    // Create checkered pattern
    const tileSize = 50;
    for (let row = 0; row < floorHeight / tileSize; row++) {
      for (let col = 0; col < floorWidth / tileSize; col++) {
        const isEven = (row + col) % 2 === 0;
        const color = isEven ? 0x1a1a1a : 0x2a2a2a;
        
        dancefloor.fillStyle(color, 1);
        dancefloor.fillRect(
          floorX + col * tileSize,
          floorY + row * tileSize,
          tileSize,
          tileSize
        );
      }
    }
    
    // Border around dancefloor
    dancefloor.lineStyle(3, 0xff0000, 0.6);
    dancefloor.strokeRect(floorX, floorY, floorWidth, floorHeight);
    
    // Add animated lights on dancefloor tiles
    this.createDancefloorLights(floorX, floorY, floorWidth, floorHeight, tileSize);
    
    // Dancefloor label
    const label = this.add.text(floorX + floorWidth / 2, floorY - 30, 'DANCEFLOOR', {
      fontSize: '20px',
      fill: '#ff00ff',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);
  }

  /**
   * Create animated dancefloor lights
   */
  createDancefloorLights(floorX, floorY, floorWidth, floorHeight, tileSize) {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0xffff00];
    
    for (let row = 0; row < floorHeight / tileSize; row++) {
      for (let col = 0; col < floorWidth / tileSize; col++) {
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

  /**
   * Create club lighting effects
   */
  createLighting() {
    // Spotlight effects
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

  /**
   * Create exit door
   */
  createExitDoor() {
    const doorX = 100;
    const doorY = 470;
    const doorWidth = 60;
    const doorHeight = 100;
    
    // Store door position for interaction check
    this.exitDoor = { x: doorX + doorWidth / 2, y: doorY + doorHeight / 2 };
    
    // Door
    const door = this.add.rectangle(
      doorX + doorWidth / 2,
      doorY + doorHeight / 2,
      doorWidth,
      doorHeight,
      0x654321
    );
    door.setStrokeStyle(3, 0x3a2617);
    
    // Door knob
    const knob = this.add.circle(doorX + doorWidth - 10, doorY + doorHeight / 2, 4, 0xffd700);
    
    // Exit sign above door
    const exitSign = this.add.text(doorX + doorWidth / 2, doorY - 20, 'EXIT', {
      fontSize: '14px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 2 }
    });
    exitSign.setOrigin(0.5);
  }

  /**
   * Create NPCs in the club
   */
  createNPCs() {
    const sirAllisterData = getNPCData('sirAllister');
    
    // Position Sir Allister on top of the bar (starting position)
    const sirAllisterX = 1225; // Center of bar (barX + barWidth/2)
    const sirAllisterY = 400; // On top of bar (barY - offset)
    
    this.sirAllister = new NPC(this, sirAllisterX, sirAllisterY, 'sir_allister_idle', sirAllisterData);
    this.sirAllister.setDepth(sirAllisterData.depth);
    
    // Add collision with ground and bar (so he can stand on top of it)
    this.physics.add.collider(this.sirAllister, this.groundPlatform);
    this.physics.add.collider(this.sirAllister, this.barCollider);
    
    // State tracking for Sir Allister
    this.sirAllisterState = 'waiting'; // States: 'waiting', 'running', 'dialogue', 'idle'
    this.sirAllisterHasGreeted = false;
    
    // Start with idle animation
    this.sirAllister.play('sir_allister_idle');
    
    // Create lunaGirl
    const lunaData = getNPCData('jojoGirl');
    
    // Position lunaGirl next to the player
    const lunaX = 250;
    const lunaY = GAME_CONFIG.height - 230;
    
    this.lunaGirl = new NPC(this, lunaX, lunaY, 'jojo_girl_idle', lunaData);
    this.lunaGirl.setDepth(lunaData.depth);
    
    // Make Luna start idle
    this.lunaGirl.play('girl_idle_right');
    
    // Add collision with ground
    this.physics.add.collider(this.lunaGirl, this.groundPlatform);
    
    // Luna will follow the player
    this.lunaFollowEnabled = true;
  }

  /**
   * Update Sir Allister's behavior
   */
  updateSirAllister() {
    if (!this.sirAllister || !this.player) return;
    
    // Check if player has reached x = 500 to trigger Sir Allister to run
    if (this.sirAllisterState === 'waiting' && this.player.x >= 500) {
      this.sirAllisterState = 'running';
      this.sirAllister.play('sir_allister_run_left');
    }
    
    if (this.sirAllisterState === 'running') {
      // Calculate distance to player
      const distance = Phaser.Math.Distance.Between(
        this.sirAllister.x,
        this.sirAllister.y,
        this.player.x,
        this.player.y
      );
      
      // Run towards player
      if (distance > 100) {
        // Determine direction and move
        const angle = Phaser.Math.Angle.Between(
          this.sirAllister.x,
          this.sirAllister.y,
          this.player.x,
          this.player.y
        );
        
        const speed = 30; // Very slow walk/run
        this.sirAllister.setVelocityX(Math.cos(angle) * speed);
        
        // Update animation based on direction
        if (Math.cos(angle) < -0.5) {
          this.sirAllister.play('sir_allister_run_left', true);
        } else if (Math.cos(angle) > 0.5) {
          this.sirAllister.play('sir_allister_run_right', true);
        }
      } else {
        // Reached player - stop and start dialogue
        this.sirAllister.setVelocityX(0);
        this.sirAllister.play('sir_allister_idle');
        this.sirAllisterState = 'dialogue';
        
        // Start dialogue and activate quest
        this.dialogueManager.startDialogue("Sir Allister", this.sirAllister.npcData.dialogues);
        
        // Activate the dance quest
        this.danceQuestActive = true;
        this.updateQuestUI();
        
        // After a delay, switch to idle/emote behavior
        this.time.delayedCall(10000, () => {
          this.sirAllisterState = 'idle';
          this.startSirAllisterIdleBehavior();
        });
      }
    }
  }

  /**
   * Start Sir Allister's idle/emote behavior after greeting
   */
  startSirAllisterIdleBehavior() {
    if (!this.sirAllister) return;
    
    // Set up alternating between idle and emote
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
      const speed = 150;
      
      // Move towards player
      this.lunaGirl.setVelocity(
        Math.cos(angle) * speed,
        0 // Keep Y velocity at 0 since we have gravity
      );
      
      // Update animation based on direction and speed
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
      // Stop moving when close enough
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
   * Create quest UI elements
   */
  createQuestUI() {
    // Quest container
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

    // Dance prompt
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

  /**
   * Update quest UI
   */
  updateQuestUI() {
    if (!this.questText) return;
    
    if (this.danceQuestActive && !this.danceQuestCompleted) {
      this.questText.setText(`Dance with Sir Allister: ${this.danceTime.toFixed(1)}s / ${this.danceTimeNeeded}s`);
      this.questText.setVisible(true);
      
      // Show dance prompt if near Sir Allister
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

  /**
   * Handle dance mechanics
   */
  handleDanceMechanics(delta) {
    // Quest phase: dance with Sir Allister
    if (this.danceQuestActive && !this.danceQuestCompleted) {
      // Check if player is holding down D to dance
      if (this.danceKey.isDown) {
        // Check if close enough to Sir Allister
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          this.sirAllister.x,
          this.sirAllister.y
        );
        
        if (distance < 150) {
          // Start dancing if not already dancing
          if (!this.isDancing) {
            this.startDancing();
          }
          
          // Update dance timer while holding D
          this.danceTime += delta / 1000; // Convert to seconds
          
          // Check if quest is completed
          if (this.danceTime >= this.danceTimeNeeded) {
            this.completeDanceQuest();
          }
          
          this.updateQuestUI();
        } else {
          // Too far from Sir Allister
          if (this.isDancing) {
            this.stopDancing();
          }
        }
      } else {
        // D key released - stop dancing
        if (this.isDancing) {
          this.stopDancing();
        }
      }
    }
    // Post-quest: free dancing anytime
    else if (this.danceQuestCompleted) {
      if (this.danceKey.isDown) {
        // Start dancing if not already dancing
        if (!this.isDancing) {
          this.startFreeDancing();
        }
      } else {
        // D key released - stop dancing
        if (this.isDancing) {
          this.stopFreeDancing();
        }
      }
    }
  }

  /**
   * Start dancing
   */
  startDancing() {
    this.isDancing = true;
    
    // Disable player movement and animation updates
    this.player.setVelocity(0, 0);
    this.player.isDancing = true;
    
    // Play dance animations
    this.player.play('player_emote', true);
    if (this.sirAllister) {
      this.sirAllister.play('sir_allister_emote', true);
    }
    
    // Make lunaGirl dance too!
    if (this.lunaGirl) {
      this.lunaGirl.setVelocity(0, 0);
      this.lunaGirl.play('girl_emote', true);
    }
    
    this.updateQuestUI();
  }

  /**
   * Stop dancing
   */
  stopDancing() {
    this.isDancing = false;
    
    // Re-enable player updates
    this.player.isDancing = false;
    
    // Return to idle animations
    this.player.play('idle_down', true);
    if (this.sirAllister) {
      this.sirAllister.play('sir_allister_idle', true);
    }
    
    // Make lunaGirl return to idle
    if (this.lunaGirl) {
      // Determine direction based on player position
      const direction = this.player.x > this.lunaGirl.x ? 'right' : 'left';
      this.lunaGirl.play(`girl_idle_${direction}`, true);
    }
    
    this.updateQuestUI();
  }

  /**
   * Start free dancing (after quest completion)
   */
  startFreeDancing() {
    this.isDancing = true;
    
    // Disable player movement and animation updates
    this.player.setVelocity(0, 0);
    this.player.isDancing = true;
    
    // Play dance animations
    this.player.play('player_emote', true);
    
    // Make lunaGirl dance too!
    if (this.lunaGirl) {
      this.lunaGirl.setVelocity(0, 0);
      this.lunaGirl.play('girl_emote', true);
    }
  }

  /**
   * Stop free dancing (after quest completion)
   */
  stopFreeDancing() {
    this.isDancing = false;
    
    // Re-enable player updates
    this.player.isDancing = false;
    
    // Return to idle animations
    this.player.play('idle_down', true);
    
    // Make lunaGirl return to idle
    if (this.lunaGirl) {
      // Determine direction based on player position
      const direction = this.player.x > this.lunaGirl.x ? 'right' : 'left';
      this.lunaGirl.play(`girl_idle_${direction}`, true);
    }
  }

  /**
   * Complete the dance quest
   */
  completeDanceQuest() {
    this.danceQuestCompleted = true;
    this.isDancing = false;
    
    // Re-enable player updates
    this.player.isDancing = false;
    
    // Return to idle
    this.player.play('idle_down', true);
    if (this.sirAllister) {
      this.sirAllister.play('sir_allister_idle', true);
    }
    
    // Make lunaGirl return to idle
    if (this.lunaGirl) {
      const direction = this.player.x > this.lunaGirl.x ? 'right' : 'left';
      this.lunaGirl.play(`girl_idle_${direction}`, true);
    }
    
    // Apply quest rewards
    this.giveQuestRewards();
    
    // Show completion message
    this.dialogueManager.startDialogue("Sir Allister", [
      "Excellent dancing! You've honored the tradition!",
      "You earned 100 gold and 150 XP!",
      "You may now leave whenever you wish. Cheers!"
    ]);
    
    this.updateQuestUI();
  }

  /**
   * Give quest rewards to player
   */
  giveQuestRewards() {
    if (!this.playerStats) return;
    
    const quest = this.sirAllister.npcData.quests[0];
    const rewards = quest.rewards;
    
    // Add gold
    if (rewards.gold) {
      this.playerStats.gold += rewards.gold;
    }
    
    // Add experience
    if (rewards.experience) {
      this.playerStats.experience += rewards.experience;
    }
    
    // Add items
    if (rewards.items && rewards.items.length > 0) {
      this.playerStats.items.push(...rewards.items);
    }
    
    // Mark quest as completed
    quest.completed = true;
    
    // Show reward notification
    this.showRewardNotification(rewards);
  }

  /**
   * Show reward notification
   */
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
    
    // Fade out after 3 seconds
    this.tweens.add({
      targets: notification,
      alpha: 0,
      duration: 1000,
      delay: 3000,
      onComplete: () => notification.destroy()
    });
  }

  /**
   * Show message when trying to exit with incomplete quest
   */
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
      
      // Remove after 3 seconds
      this.time.delayedCall(3000, () => {
        if (this.questWarningText) {
          this.questWarningText.destroy();
          this.questWarningText = null;
        }
      });
    }
  }
}

