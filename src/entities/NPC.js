import Phaser from 'phaser';

export default class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, npcData) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.npcData = npcData;
    this.name = npcData.name;
    this.depth = npcData.depth;
    this.dialogues = npcData.dialogues;
    this.quests = npcData.quests || [];
    
    // Physics
    this.setImmovable(false);
    this.body.setAllowGravity(true);
    
    // Interaction
    this.canInteract = true;
    this.interactionKey = null;
    
    this.createNameLabel(scene);
  }

  /**
   * text label above the NPC's head
   */
  createNameLabel(scene) {
    this.nameText = scene.add.text(this.x, this.y - 40, this.name, {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 2 }
    });
    this.nameText.setOrigin(0.5);
    this.nameText.setDepth(this.depth + 1);
  }

  update() {
    if (this.nameText) {
      this.nameText.setPosition(this.x, this.y - 40);
    }
  }

  interact() {
    if (!this.canInteract) return;
    
    return {
      name: this.name,
      dialogues: this.dialogues,
      quest: this.getAvailableQuest()
    };
  }

  getNextDialogue() {
    if (!this.dialogues || this.dialogues.length === 0) {
      return "...";
    }
    
    return this.dialogues[0];
  }

  getAvailableQuest() {
    return this.quests.find(quest => !quest.completed) || null;
  }
}

