# Quick Start Guide - Adding Your First NPC

This guide shows you how to add an interactive NPC to your game using the new structure.

## Current Game State

Your game has been refactored into a clean, maintainable structure:

✅ **Player character** with movement and jumping  
✅ **Scene system** with PreloadScene and MainScene  
✅ **Animation system** centralized in AnimationManager  
✅ **Ready for NPCs, dialogue, and quests**

## File Organization

```
src/
├── main.js                    # Game entry point
├── config.js                  # Game settings
├── scenes/
│   ├── PreloadScene.js        # Asset loading
│   └── MainScene.js           # Main gameplay
├── entities/
│   ├── Player.js              # Your player character
│   └── NPC.js                 # NPC base class (ready to use!)
├── systems/
│   ├── AnimationManager.js    # Animation handling
│   ├── DialogueManager.js     # Dialogue system (ready!)
│   └── QuestManager.js        # Quest tracking (ready!)
└── data/
    ├── npcs.js                # NPC definitions
    └── quests.js              # Quest definitions
```

## What Changed?

### Before (single file, 271 lines):
- Everything in one `main.js`
- Hard to add features
- Would become messy quickly

### After (organized structure):
- Separated into logical modules
- Easy to add NPCs, quests, dialogue
- Each file has a single responsibility
- Ready to scale to a full game!

## Next Steps to Build Your Game

### 1. Add Dialogue to Existing NPCs

The NPC system is already set up! To add an NPC:

**Step 1:** In `src/scenes/MainScene.js`, add these imports at the top:
```javascript
import NPC from '../entities/NPC.js';
import DialogueManager from '../systems/DialogueManager.js';
import { getNPCData } from '../data/npcs.js';
```

**Step 2:** In the `create()` method, add:
```javascript
// Initialize dialogue system
this.dialogueManager = new DialogueManager(this);

// Create an NPC
const villagerData = getNPCData('villager1');
this.villager = new NPC(this, 400, 540, 'jojo_boy_idle', villagerData);

// Add collision with ground
this.physics.add.collider(this.villager, this.ground);

// Set up interaction key
this.eKey = this.input.keyboard.addKey('E');
```

**Step 3:** In the `update()` method, add:
```javascript
// Update dialogue system
if (this.dialogueManager) {
  this.dialogueManager.update();
}

// Update NPC
if (this.villager) {
  this.villager.update();
}

// Check for NPC interaction
if (this.villager) {
  const distance = Phaser.Math.Distance.Between(
    this.player.x, this.player.y,
    this.villager.x, this.villager.y
  );
  
  if (distance < 80 && Phaser.Input.Keyboard.JustDown(this.eKey)) {
    const interaction = this.villager.interact();
    this.dialogueManager.startDialogue(interaction.name, interaction.dialogue);
  }
}
```

### 2. Add Quest System

In `src/scenes/MainScene.js`:

```javascript
import QuestManager from '../systems/QuestManager.js';

// In create():
this.questManager = new QuestManager(this);

// When NPC is interacted with, check for quests:
const interaction = this.villager.interact();
if (interaction.quest && !this.questManager.isQuestActive(interaction.quest.id)) {
  // Show quest to player
  this.questManager.acceptQuest(interaction.quest);
}
```

### 3. Create More NPCs

Modify `src/data/npcs.js` to add more characters with unique dialogues and quests!

## Testing Your Game

Run the development server:
```bash
npm run dev
```

Your game should work exactly as before, but now with:
- Clean, organized code
- Easy-to-add NPCs
- Built-in dialogue system
- Quest tracking ready to go
- Room to grow infinitely!

## What You Can Add Next

1. **More NPCs** - Create merchants, quest givers, enemies
2. **Inventory System** - Track items the player collects
3. **Battle Scene** - Add turn-based or action combat
4. **World Areas** - Create different scenes for different locations
5. **Save System** - Save player progress
6. **UI Elements** - Health bar, quest log, inventory menu

## Questions?

- Check `src/README.md` for detailed documentation
- Look at the example files in `src/data/` for reference
- Each class and function has comments explaining what it does

Happy coding! 🎮

