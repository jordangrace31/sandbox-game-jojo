
export default class DialogueManager {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;
    this.currentDialogue = null;
    this.dialogueBox = null;
    this.enterKey = scene.input.keyboard.addKey('ENTER');
    this.dialogueList = [];
    this.currentDialogueIndex = 0;
  }
   
  startDialogue(npcName, dialogueText) {
    this.isActive = true;
    
    if (Array.isArray(dialogueText)) {
      this.dialogueList = dialogueText;
    } else {
      this.dialogueList = [dialogueText];
    }
    
    this.currentDialogueIndex = 0;
    this.currentDialogue = {
      npcName: npcName,
      text: this.dialogueList[0]
    };
    
    this.showDialogueBox();
  }

  showDialogueBox() {
    if (this.dialogueBox) return;
    
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
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
    
    const progress = `${this.currentDialogueIndex + 1}/${this.dialogueList.length}`;
    const promptMessage = this.currentDialogueIndex < this.dialogueList.length - 1 
      ? `Press ENTER (${progress})` 
      : `Press ENTER to close`;
    
    const promptText = this.scene.add.text(
      width - 200,
      height - 35,
      promptMessage,
      {
        fontSize: '14px',
        fill: '#aaaaaa'
      }
    );
    
    this.dialogueBox.add([box, nameText, dialogueText, promptText]);
    this.dialogueBox.setDepth(2000); 
    this.dialogueBox.setScrollFactor(0); // Fixed to camera, not world
  }

  closeDialogue() {
    if (this.dialogueBox) {
      this.dialogueBox.destroy();
      this.dialogueBox = null;
    }
    
    this.isActive = false;
    this.currentDialogue = null;
  }

  isDialogueActive() {
    return this.isActive;
  }

  nextDialogue() {
    this.currentDialogueIndex++;
    
    if (this.currentDialogueIndex < this.dialogueList.length) {
      this.currentDialogue.text = this.dialogueList[this.currentDialogueIndex];
      this.updateDialogueBox();
    } else {
      this.closeDialogue();
    }
  }

  updateDialogueBox() {
    if (!this.dialogueBox) return;
    
    this.dialogueBox.destroy();
    this.dialogueBox = null;
    this.showDialogueBox();
  }

  update() {
    if (this.isActive) {
      if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.nextDialogue();
      }
    }
  }
}

