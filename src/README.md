# Game Structure Documentation

This document explains the organization of your game code and how to extend it.

## Directory Structure

```
src/
├── main.js              # Entry point - initializes Phaser with all scenes
├── config.js            # Game configuration and constants
│
├── scenes/              # Different game screens/states
│   ├── PreloadScene.js  # Asset loading scene
│   └── MainScene.js     # Main gameplay scene
│
├── entities/            # Game objects and characters
│   ├── Player.js        # Player character class
│   └── NPC.js          # Non-player character base class
│
├── systems/             # Game systems and managers
│   ├── AnimationManager.js  # Handles animation creation
│   ├── DialogueManager.js   # Manages NPC dialogues
│   └── QuestManager.js      # Tracks quests and objectives
│
├── data/                # Game content and configurations
│   ├── npcs.js         # NPC definitions and dialogues
│   └── quests.js       # Quest definitions
│
└── utils/               # Helper functions and utilities
```

## How to Add Features

### Adding a New NPC

1. **Define the NPC data** in `src/data/npcs.js`:
```javascript
export const NPC_DATA = {
  // ... existing NPCs
  
  newNPC: {
    name: "Bob",
    dialogues: ["Hello!", "Nice to meet you!"],
    quests: []
  }
};
```

2. **Create the NPC** in `MainScene.js`:
```javascript
import NPC from '../entities/NPC.js';
import { getNPCData } from '../data/npcs.js';

// In create() method:
const npcData = getNPCData('newNPC');
const npc = new NPC(this, 300, 500, 'npc_sprite', npcData);

// Set up interaction
this.physics.add.overlap(this.player, npc, () => {
  // Press E to interact
  const eKey = this.input.keyboard.addKey('E');
  if (Phaser.Input.Keyboard.JustDown(eKey)) {
    const interaction = npc.interact();
    this.dialogueManager.startDialogue(interaction.name, interaction.dialogue);
  }
});
```

### Adding a New Scene

1. **Create the scene file** in `src/scenes/`:
```javascript
import Phaser from 'phaser';

export default class MyNewScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MyNewScene' });
  }

  create() {
    // Scene setup
  }

  update() {
    // Update logic
  }
}
```

2. **Register it** in `src/main.js`:
```javascript
import MyNewScene from './scenes/MyNewScene.js';

const config = {
  // ... other config
  scene: [
    PreloadScene,
    MainScene,
    MyNewScene  // Add here
  ]
};
```

3. **Switch to it** from another scene:
```javascript
this.scene.start('MyNewScene');
```

### Adding a New Quest

1. **Define the quest** in an NPC's data in `src/data/npcs.js`:
```javascript
quests: [
  {
    id: "my_quest",
    title: "Quest Title",
    description: "Quest description",
    objectives: {
      items_collected: 0,
      items_needed: 5
    },
    reward: {
      gold: 100,
      experience: 50
    },
    completed: false
  }
]
```

2. **Use QuestManager** in your scene:
```javascript
// Initialize in create()
this.questManager = new QuestManager(this);

// Accept quest when talking to NPC
this.questManager.acceptQuest(npc.getAvailableQuest());

// Update progress when collecting items
this.questManager.updateQuestProgress('my_quest', 'obj1', 1);
```

### Adding New Animations

1. **Load the asset** in `PreloadScene.js`:
```javascript
this.load.atlas('new_sprite', 'assets/images/new.png', 'assets/atlases/new.json');
```

2. **Create animations** in `AnimationManager.js` or directly in your scene:
```javascript
this.anims.create({
  key: 'new_animation',
  frames: this.anims.generateFrameNames('new_sprite', { 
    prefix: 'frame_', 
    start: 0, 
    end: 5 
  }),
  frameRate: 10,
  repeat: -1
});
```

## Game Configuration

All game settings are in `src/config.js`. Modify these constants instead of hardcoding values:

- `GAME_CONFIG` - Screen size, physics settings
- `PLAYER_CONFIG` - Player speed, jump power, starting position
- `ANIMATION_CONFIG` - Animation frame rates

## Next Steps

Here are some features you might want to add:

1. **Inventory System** - Create an `InventoryManager.js` to track items
2. **Battle System** - Create a `BattleScene.js` for combat
3. **Save/Load System** - Add localStorage or backend integration
4. **UI System** - Create health bars, quest log, inventory UI
5. **World Map** - Expand MainScene or create multiple area scenes
6. **Sound Manager** - Add music and sound effects

## Running the Game

```bash
npm run dev     # Development server
npm run build   # Build for production
npm run preview # Preview production build
```

