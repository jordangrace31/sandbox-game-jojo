# Using Sprite Atlas in Phaser 3

## What You Need:
1. **Image file** (e.g., `spritesheet.png`) - contains all your sprites
2. **JSON file** (e.g., `spritesheet.json`) - describes where each sprite is located

## Loading Different Atlas Formats:

### 1. JSON Hash Format (Texture Packer)
```javascript
function preload() {
  this.load.atlas(
    'player',                          // Key to reference
    'assets/player-sprites.png',       // Image file
    'assets/player-sprites.json'       // JSON file
  );
}

function create() {
  // Use a specific frame from the atlas
  player = this.physics.add.sprite(400, 300, 'player', 'idle_01.png');
}
```

### 2. Sprite Sheet (Grid-based, no JSON)
If your sprites are evenly spaced in a grid:
```javascript
function preload() {
  this.load.spritesheet(
    'player',
    'assets/player-sheet.png',
    { frameWidth: 32, frameHeight: 32 }  // Size of each sprite
  );
}

function create() {
  // Frame 0 is first sprite, frame 1 is second, etc.
  player = this.physics.add.sprite(400, 300, 'player', 0);
}
```

### 3. Multi-Atlas (Large games)
```javascript
function preload() {
  this.load.multiatlas(
    'megaAtlas',
    'assets/mega-atlas.json'  // JSON references multiple PNG files
  );
}
```

## Creating Animations from Atlas:

```javascript
function create() {
  // Create animation from atlas frames
  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNames('player', {
      prefix: 'walk_',        // Looks for: walk_0001.png, walk_0002.png, etc.
      start: 1,
      end: 8,
      zeroPad: 4              // Pads numbers: 0001, 0002, etc.
    }),
    frameRate: 10,
    repeat: -1                // Loop forever
  });

  player = this.physics.add.sprite(400, 300, 'player');
  player.play('walk');
}
```

## Example with JSON Array Format:

```javascript
function preload() {
  this.load.atlas(
    'player',
    'assets/player.png',
    'assets/player.json'
  );
}

function create() {
  // Different animations
  this.anims.create({
    key: 'idle',
    frames: [{ key: 'player', frame: 'idle' }],
    frameRate: 1
  });

  this.anims.create({
    key: 'walk_right',
    frames: this.anims.generateFrameNames('player', {
      prefix: 'walk_right_',
      start: 0,
      end: 3
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'walk_left',
    frames: this.anims.generateFrameNames('player', {
      prefix: 'walk_left_',
      start: 0,
      end: 3
    }),
    frameRate: 10,
    repeat: -1
  });

  player = this.physics.add.sprite(400, 300, 'player');
  player.play('idle');
}

function update() {
  const speed = 200;
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
    player.play('walk_left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
    player.play('walk_right', true);
  } else if (cursors.up.isDown) {
    player.setVelocityY(-speed);
    player.play('walk_right', true);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
    player.play('walk_right', true);
  } else {
    player.play('idle', true);
  }
}
```

## Tools to Create Sprite Atlases:

1. **TexturePacker** - https://www.codeandweb.com/texturepacker (most popular)
2. **Free Texture Packer** - http://free-tex-packer.com/ (online, free)
3. **Shoebox** - https://renderhjs.net/shoebox/ (free)
4. **Leshy SpriteSheet Tool** - https://www.leshylabs.com/apps/sstool/ (online, free)

## Debugging Tips:

```javascript
function create() {
  // List all frames in your atlas
  const frames = this.textures.get('player').getFrameNames();
  console.log('Available frames:', frames);
  
  // Use a specific frame
  player = this.physics.add.sprite(400, 300, 'player', frames[0]);
}
```

