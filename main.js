import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: { default: 'arcade' },
  scene: {
    preload,
    create,
    update,
  },
};

let player;
let cursors;

function preload() {
  this.load.atlas(
    'jojo_boy_walk',
    'assets/images/jojo_boy_walk.png',
    'assets/atlases/jojo_boy_walk.json'
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

  // Create physics sprite (important for movement!)
  player = this.physics.add.sprite(100, 300, 'jojo_boy_walk');
  
  // Make sprite walk right automatically
  player.setVelocityX(100);  // Move right at 100 pixels/second
  player.play('walk_right');
}

function update() {
    const speed = 160;
    player.setVelocity(0);
  
    if (cursors.left.isDown) {
      player.setVelocityX(-speed);
      player.play('walk_left', true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(speed);
      player.play('walk_right', true);
    } else if (cursors.up.isDown) {
      player.setVelocityY(-speed);
      player.play('walk_up', true);
    } else if (cursors.down.isDown) {
      player.setVelocityY(speed);
      player.play('walk_down', true);
    } else {
      player.anims.stop();
    }
  }

new Phaser.Game(config);
