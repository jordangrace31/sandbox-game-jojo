import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: { 
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },  // Add gravity for jumping
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update,
  },
};

let player;
let cursors;
let spaceKey;  // Add spacebar for jumping
let ground;
let lastDirection = 'down';  // Track which direction player is facing

function preload() {
  this.load.atlas(
    'jojo_boy_walk',
    'assets/images/jojo_boy_walk.png',
    'assets/atlases/jojo_boy_walk.json'
  );

  this.load.atlas(
    'jojo_boy_jump',
    'assets/images/jojo_boy_jump.png',
    'assets/atlases/jojo_boy_jump.json'
  );

  this.load.atlas(
    'jojo_boy_idle',
    'assets/images/jojo_boy_idle.png',
    'assets/atlases/jojo_boy_idle.json'
  );
}

function create() {
  cursors = this.input.keyboard.createCursorKeys();

  // Create all four directional animations
  this.anims.create({
    key: 'walk_down',
    frames: this.anims.generateFrameNames('jojo_boy_walk', { 
      prefix: 'jojo_boy_front_', 
      start: 0, 
      end: 8 
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'walk_up',
    frames: this.anims.generateFrameNames('jojo_boy_walk', { 
      prefix: 'jojo_boy_back_', 
      start: 0, 
      end: 8 
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'walk_left',
    frames: this.anims.generateFrameNames('jojo_boy_walk', { 
      prefix: 'jojo_boy_left_', 
      start: 0, 
      end: 8 
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'walk_right',
    frames: this.anims.generateFrameNames('jojo_boy_walk', { 
      prefix: 'jojo_boy_right_', 
      start: 0, 
      end: 8 
    }),
    frameRate: 10,
    repeat: -1
  });


  // Create all four jumping directional animations
  this.anims.create({
    key: 'jump_down',
    frames: this.anims.generateFrameNames('jojo_boy_jump', { 
      prefix: 'jojo_boy_front_', 
      start: 0, 
      end: 4  // Fixed: jump atlas has 0-4 frames
    }),
    frameRate: 10,
    repeat: 0  // Play once
  });

  this.anims.create({
    key: 'jump_up',
    frames: this.anims.generateFrameNames('jojo_boy_jump', { 
      prefix: 'jojo_boy_back_', 
      start: 0, 
      end: 4 
    }),
    frameRate: 10,
    repeat: 0
  });

  this.anims.create({
    key: 'jump_left',
    frames: this.anims.generateFrameNames('jojo_boy_jump', { 
      prefix: 'jojo_boy_left_', 
      start: 0, 
      end: 4 
    }),
    frameRate: 10,
    repeat: 0
  });

  this.anims.create({
    key: 'jump_right',
    frames: this.anims.generateFrameNames('jojo_boy_jump', { 
      prefix: 'jojo_boy_right_', 
      start: 0, 
      end: 4 
    }),
    frameRate: 10,
    repeat: 0
  });

  // Create all four idle directional animations
  this.anims.create({
    key: 'idle_down',
    frames: this.anims.generateFrameNames('jojo_boy_idle', { 
      prefix: 'jojo_boy_front_', 
      start: 0, 
      end: 1 
    }),
    frameRate: 4,  // Slower for idle breathing effect
    repeat: -1
  });

  this.anims.create({
    key: 'idle_up',
    frames: this.anims.generateFrameNames('jojo_boy_idle', { 
      prefix: 'jojo_boy_back_', 
      start: 0, 
      end: 1 
    }),
    frameRate: 4,
    repeat: -1
  });

  this.anims.create({
    key: 'idle_left',
    frames: this.anims.generateFrameNames('jojo_boy_idle', { 
      prefix: 'jojo_boy_left_', 
      start: 0, 
      end: 1 
    }),
    frameRate: 4,
    repeat: -1
  });

  this.anims.create({
    key: 'idle_right',
    frames: this.anims.generateFrameNames('jojo_boy_idle', { 
      prefix: 'jojo_boy_right_', 
      start: 0, 
      end: 1 
    }),
    frameRate: 4,
    repeat: -1
  });

  // Create ground platform
  ground = this.add.rectangle(400, 580, 800, 40, 0x00aa00);  // Green ground
  this.physics.add.existing(ground, true);  // true = static (immovable)

  // Create physics sprite
  player = this.physics.add.sprite(100, 450, 'jojo_boy_walk');
  player.setBounce(0.1);  // Slight bounce when landing
  player.setCollideWorldBounds(true);  // Don't fall through edges
  
  // Start with idle animation
  player.play('idle_down');
  
  // Add collision between player and ground
  this.physics.add.collider(player, ground);
  
  // Set up keyboard controls
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function update() {
  const speed = 160;
  const jumpPower = -400;  // Negative = upward
  
  // Check if player is on the ground (touching down)
  const onGround = player.body.touching.down;
  
  // Horizontal movement
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
    player.flipX = false;  // Face left
    lastDirection = 'left';  // Track direction
    
    if (onGround) {
      player.play('walk_left', true);
    } else {
      player.play('jump_left', true);
    }
  } 
  else if (cursors.right.isDown) {
    player.setVelocityX(speed);
    player.flipX = false;  // Face right
    lastDirection = 'right';  // Track direction
    
    if (onGround) {
      player.play('walk_right', true);
    } else {
      player.play('jump_right', true);
    }
  }
  else if (cursors.up.isDown) {
    player.setVelocityX(0);
    lastDirection = 'up';  // Track direction
    
    if (onGround) {
      player.play('idle_up', true);  // Idle while holding up
    }
  }
  else if (cursors.down.isDown) {
    player.setVelocityX(0);
    lastDirection = 'down';  // Track direction
    
    if (onGround) {
      player.play('idle_down', true);  // Idle while holding down
    }
  }
  else {
    player.setVelocityX(0);
    
    // Play idle animation in the direction player is facing
    if (onGround) {
      player.play('idle_' + lastDirection, true);
    }
  }
  
  // Jumping with SPACEBAR
  if (Phaser.Input.Keyboard.JustDown(spaceKey) && onGround) {
    player.setVelocityY(jumpPower);
    
    // Play jump animation based on current direction
    player.play('jump_' + lastDirection, true);
  }
}

new Phaser.Game(config);
