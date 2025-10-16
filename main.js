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
  this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {
  player = this.physics.add.sprite(400, 300, 'player');
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  const speed = 200;
  player.setVelocity(0);

  if (cursors.left.isDown) player.setVelocityX(-speed);
  if (cursors.right.isDown) player.setVelocityX(speed);
  if (cursors.up.isDown) player.setVelocityY(-speed);
  if (cursors.down.isDown) player.setVelocityY(speed);
}

new Phaser.Game(config);
