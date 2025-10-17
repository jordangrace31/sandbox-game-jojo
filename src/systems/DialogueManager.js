/**
 * DialogueManager
 * Manages dialogue display and progression
 * Can be used to create a dialogue UI overlay
 */

export default class DialogueManager {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;
    this.currentDialogue = null;
    this.dialogueBox = null;
  }

  /**
   * Start a dialogue sequence
   */
  startDialogue(npcName, dialogueText) {
    this.isActive = true;
    this.currentDialogue = {
      npcName: npcName,
      text: dialogueText
    };
    
    this.showDialogueBox();
  }

  /**
   * Show the dialogue box UI
   */
  showDialogueBox() {
    if (this.dialogueBox) return;
    
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Create dialogue box background
    this.dialogueBox = this.scene.add.container(0, 0);
    
    const boxHeight = 120;
    const box = this.scene.add.rectangle(
      width / 2, 
      height - boxHeight / 2 - 20, 
      width - 40, 
      boxHeight, 
      0x000000, 
      0.8
    );
    
    // NPC name
    const nameText = this.scene.add.text(
      30,
      height - boxHeight - 10,
      this.currentDialogue.npcName,
      {
        fontSize: '18px',
        fill: '#ffff00',
        fontStyle: 'bold'
      }
    );
    
    // Dialogue text
    const dialogueText = this.scene.add.text(
      30,
      height - boxHeight + 20,
      this.currentDialogue.text,
      {
        fontSize: '16px',
        fill: '#ffffff',
        wordWrap: { width: width - 80 }
      }
    );
    
    // Prompt to continue
    const promptText = this.scene.add.text(
      width - 150,
      height - 35,
      'Press SPACE',
      {
        fontSize: '14px',
        fill: '#aaaaaa'
      }
    );
    
    this.dialogueBox.add([box, nameText, dialogueText, promptText]);
    this.dialogueBox.setDepth(1000); // Ensure it's on top
  }

  /**
   * Close the dialogue box
   */
  closeDialogue() {
    if (this.dialogueBox) {
      this.dialogueBox.destroy();
      this.dialogueBox = null;
    }
    
    this.isActive = false;
    this.currentDialogue = null;
  }

  /**
   * Check if dialogue is currently active
   */
  isDialogueActive() {
    return this.isActive;
  }

  /**
   * Update dialogue (call in scene's update)
   */
  update() {
    if (this.isActive) {
      // Listen for space to close dialogue
      const spaceKey = this.scene.input.keyboard.addKey('SPACE');
      if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        this.closeDialogue();
      }
    }
  }
}

