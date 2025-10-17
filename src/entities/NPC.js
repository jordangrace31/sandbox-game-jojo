/**
 * NPC (Non-Player Character) Class
 * Base class for all NPCs in the game
 * Extend this class to create specific NPCs with unique behaviors
 */

import Phaser from 'phaser';

export default class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, npcData) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // NPC properties
    this.npcData = npcData;
    this.name = npcData.name;
    this.dialogues = npcData.dialogues;
    this.quests = npcData.quests || [];
    
    // Physics
    this.setImmovable(false);
    this.body.setAllowGravity(true);
    
    // Interaction
    this.canInteract = true;
    this.interactionKey = null;
    
    // Add name label above NPC
    this.createNameLabel(scene);
  }

  /**
   * Create a text label above the NPC's head
   */
  createNameLabel(scene) {
    this.nameText = scene.add.text(this.x, this.y - 40, this.name, {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 2 }
    });
    this.nameText.setOrigin(0.5);
  }

  /**
   * Update NPC (called from scene's update)
   */
  update() {
    // Keep name label positioned above NPC
    if (this.nameText) {
      this.nameText.setPosition(this.x, this.y - 40);
    }
  }

  /**
   * Handle interaction with player
   */
  interact() {
    if (!this.canInteract) return;
    
    // Return dialogue or quest data
    return {
      name: this.name,
      dialogues: this.dialogues,
      quest: this.getAvailableQuest()
    };
  }

  /**
   * Get the next dialogue line
   */
  getNextDialogue() {
    if (!this.dialogues || this.dialogues.length === 0) {
      return "...";
    }
    
    // Simple dialogue rotation
    return this.dialogues[0];
  }

  /**
   * Get available quest from this NPC
   */
  getAvailableQuest() {
    return this.quests.find(quest => !quest.completed) || null;
  }

  /**
   * Show interaction indicator (e.g., "Press E to talk")
   */
  showInteractionPrompt() {
    // Future: Add visual indicator
  }

  /**
   * Hide interaction indicator
   */
  hideInteractionPrompt() {
    // Future: Remove visual indicator
  }
}

