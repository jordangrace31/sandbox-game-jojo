# Project Structure Overview

```
sandbox-game-jojo/
│
├── 📋 Documentation
│   ├── QUICK_START.md           # How to add your first NPC
│   ├── REFACTORING_SUMMARY.md   # Before/after comparison
│   └── PROJECT_STRUCTURE.md     # This file!
│
├── 🎮 Game Source Code (src/)
│   │
│   ├── main.js                  # 🚀 Entry point - starts everything
│   ├── config.js                # ⚙️  Game settings & constants
│   └── README.md                # 📖 Detailed developer docs
│   │
│   ├── 🎬 scenes/               # Different game screens
│   │   ├── PreloadScene.js      # Loading screen with progress bar
│   │   └── MainScene.js         # Main gameplay (where you play!)
│   │
│   ├── 👾 entities/             # Game characters & objects
│   │   ├── Player.js            # Your playable character
│   │   └── NPC.js               # Non-player characters (villagers, etc.)
│   │
│   ├── 🔧 systems/              # Game systems & managers
│   │   ├── AnimationManager.js  # Creates all animations
│   │   ├── DialogueManager.js   # Shows NPC conversations
│   │   └── QuestManager.js      # Tracks quests & objectives
│   │
│   ├── 📊 data/                 # Game content (easy to edit!)
│   │   ├── npcs.js              # NPC definitions & dialogues
│   │   └── quests.js            # Quest definitions & rewards
│   │
│   └── 🛠️  utils/               # Helper functions (empty for now)
│
├── 🎨 Assets (public/assets/)
│   ├── images/                  # Sprite images
│   │   ├── jojo_boy_idle.png
│   │   ├── jojo_boy_jump.png
│   │   └── jojo_boy_walk.png
│   │
│   └── atlases/                 # Sprite data files
│       ├── jojo_boy_idle.json
│       ├── jojo_boy_jump.json
│       └── jojo_boy_walk.json
│
├── 🔧 Configuration
│   ├── package.json             # Dependencies & scripts
│   ├── vite.config.js           # Build tool settings
│   └── index.html               # HTML entry point
│
└── 💾 Backup
    └── main.js.old              # Your original code (safe!)
```

## File Descriptions

### Core Game Files

| File | Purpose | Size | Modify? |
|------|---------|------|---------|
| `src/main.js` | Game initialization | 26 lines | Rarely |
| `src/config.js` | Game settings | 28 lines | Often |
| `src/scenes/MainScene.js` | Main gameplay | ~60 lines | Very often |
| `src/scenes/PreloadScene.js` | Asset loading | ~90 lines | When adding assets |

### Character Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `src/entities/Player.js` | Player behavior | When changing controls |
| `src/entities/NPC.js` | NPC base class | Rarely (it's a template) |

### System Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `src/systems/AnimationManager.js` | Animation creation | When adding new sprites |
| `src/systems/DialogueManager.js` | Dialogue UI | To customize dialogue appearance |
| `src/systems/QuestManager.js` | Quest tracking | To change quest mechanics |

### Data Files (Edit These Often!)

| File | Purpose | Easy to Edit? |
|------|---------|---------------|
| `src/data/npcs.js` | NPC data | ✅ Very easy! |
| `src/data/quests.js` | Quest data | ✅ Very easy! |

## How Files Connect

```
index.html
    ↓
src/main.js (creates Phaser game)
    ↓
    ├── PreloadScene (loads assets)
    │   ↓
    └── MainScene (gameplay)
        ├── uses → Player class
        ├── uses → NPC class
        ├── uses → AnimationManager
        ├── uses → DialogueManager
        ├── uses → QuestManager
        └── reads → data/npcs.js
```

## Workflow Examples

### Adding Content (Easy!)

**Add a new NPC:**
1. Edit `src/data/npcs.js` - add NPC definition
2. Edit `src/scenes/MainScene.js` - create NPC instance
3. Done!

**Add a new quest:**
1. Edit `src/data/npcs.js` - add quest to NPC
2. System automatically handles it!

### Adding Features (Medium)

**Add a new sprite:**
1. Add image/atlas to `public/assets/`
2. Edit `src/scenes/PreloadScene.js` - load asset
3. Edit `src/systems/AnimationManager.js` - create animations

**Add a new scene:**
1. Create file in `src/scenes/`
2. Register in `src/main.js`
3. Switch to it from other scenes

### Advanced (Less Often)

**New game systems:**
- Create new file in `src/systems/`
- Initialize in MainScene
- Use throughout game

## Development Commands

```bash
npm run dev      # Start development server (hot reload)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Best Practices

### ✅ DO:
- Add new NPCs in `src/data/npcs.js`
- Put new character classes in `src/entities/`
- Create new scenes in `src/scenes/`
- Put reusable systems in `src/systems/`
- Change game settings in `src/config.js`

### ❌ DON'T:
- Put everything back in one file!
- Hardcode values (use config.js)
- Mix different concerns in one file
- Forget to document complex features

## File Dependencies

### No Dependencies (Edit Freely):
- `src/config.js`
- `src/data/npcs.js`
- `src/data/quests.js`

### Few Dependencies (Usually Safe):
- `src/entities/Player.js`
- `src/entities/NPC.js`
- `src/systems/*Manager.js`

### Many Dependencies (Be Careful):
- `src/main.js` (breaks entire game if wrong)
- `src/scenes/MainScene.js` (ties everything together)

## Quick Reference

### I want to...

**Add dialogue to an NPC:**
→ Edit `src/data/npcs.js`

**Change player speed:**
→ Edit `src/config.js` → `PLAYER_CONFIG.speed`

**Add a new character:**
→ Create class in `src/entities/`

**Add a new area/level:**
→ Create scene in `src/scenes/`

**Change how dialogue looks:**
→ Edit `src/systems/DialogueManager.js`

**Add background music:**
→ Load in `PreloadScene.js`, play in `MainScene.js`

**Save player progress:**
→ Create `src/systems/SaveManager.js`

**Add an inventory:**
→ Create `src/systems/InventoryManager.js`

## Growing Your Game

As you add features, create new files following the pattern:

```
src/
├── entities/
│   ├── Player.js
│   ├── NPC.js
│   ├── Enemy.js        ← Add new character types here
│   └── Merchant.js     ← Add new character types here
│
├── scenes/
│   ├── PreloadScene.js
│   ├── MainScene.js
│   ├── BattleScene.js  ← Add new scenes here
│   └── ShopScene.js    ← Add new scenes here
│
└── systems/
    ├── AnimationManager.js
    ├── DialogueManager.js
    ├── QuestManager.js
    ├── InventoryManager.js  ← Add new systems here
    └── CombatManager.js     ← Add new systems here
```

## Need Help?

1. Check `QUICK_START.md` for practical examples
2. Check `REFACTORING_SUMMARY.md` to see what changed
3. Check `src/README.md` for detailed API docs
4. Look at existing code as examples

Remember: This structure is designed to grow with your game! 🎮✨

