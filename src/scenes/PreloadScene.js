/**
 * PreloadScene
 * Handles loading all game assets (images, spritesheets, audio, etc.)
 */

import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Create loading bar (optional, but nice to have)
    this.createLoadingBar();
    
    // Load player sprite atlases
    this.loadPlayerAssets();
    
    // Load NPC assets
    this.loadNPCAssets();

    // Load audio assets
    this.loadAudioAssets();
  }

  create() {
    // Once loading is complete, start the main scene
    this.scene.start('MainScene');
  }

  /**
   * Create a visual loading bar
   */
  createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    loadingText.setOrigin(0.5);
    
    // Progress bar background
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);
    
    // Update progress bar as assets load
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 30);
    });
    
    // Clean up when complete
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  /**
   * Load all player-related assets
   */
  loadPlayerAssets() {
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

    this.load.atlas(
      'jojo_boy_climb',
      'assets/images/jojo_boy_climb.png',
      'assets/atlases/jojo_boy_climb.json'
    );

    this.load.atlas(
      'jojo_boy_emote',
      'assets/images/jojo_boy_emote.png',
      'assets/atlases/jojo_boy_emote.json'
    );
  }

  /**
   * Load all NPC-related assets
   */
  loadNPCAssets() {
    this.load.atlas(
      'jojo_girl_walk',
      'assets/images/jojo_girl_walk.png',
      'assets/atlases/jojo_girl_walk.json'
    );

    this.load.atlas(
      'jojo_girl_run',
      'assets/images/jojo_girl_run.png',
      'assets/atlases/jojo_girl_run.json'
    );

    this.load.atlas(
      'jojo_girl_idle',
      'assets/images/jojo_girl_idle.png',
      'assets/atlases/jojo_girl_idle.json'
    );

    this.load.atlas(
      'jojo_girl_climb',
      'assets/images/jojo_girl_climb.png',
      'assets/atlases/jojo_girl_climb.json'
    );

    this.load.atlas(
      'jojo_girl_jump',
      'assets/images/jojo_girl_jump.png',
      'assets/atlases/jojo_girl_jump.json'
    );

    this.load.atlas(
      'jojo_girl_emote',
      'assets/images/jojo_girl_emote.png',
      'assets/atlases/jojo_girl_emote.json'
    );

    this.load.atlas(
      'background',
      'assets/images/background.png',
      'assets/atlases/background_atlas.json'
    );

    this.load.atlas(
      'platform',
      'assets/images/generic_platformer_tiles.png',
      'assets/atlases/platform_atlas.json'
    );

    this.load.image('rope', 'assets/images/rope-png.png');
    this.load.image('bed', 'assets/images/bed-png.png');
    this.load.image('tent', 'assets/images/tent-png.png');
    this.load.image('lock-stock-logo', 'assets/images/lock-stock-logo.png');
    this.load.image('cloth', 'assets/images/sleep-blanket-bgr.png');
    this.load.image('value-logo', 'assets/images/valuegroup-logo.png');
    this.load.image('inhance-logo', 'assets/images/Inhance_Logo.png');
    this.load.image('keys', 'assets/images/keys-bgr.png');

    this.load.atlas(
      'hamilton_emote',
      'assets/images/hamilton_emote.png',
      'assets/atlases/hamilton_emote.json'
    );

    this.load.atlas(
      'hamilton_idle',
      'assets/images/hamilton_idle.png',
      'assets/atlases/hamilton_idle.json'
    );

    this.load.atlas(
      'sir_allister_emote',
      'assets/images/sir_allister_emote.png',
      'assets/atlases/sir_allister_emote.json'
    );

    this.load.atlas(
      'sir_allister_idle',
      'assets/images/sir_allister_idle.png',
      'assets/atlases/sir_allister_idle.json'
    );

    this.load.atlas(
      'sir_allister_run',
      'assets/images/sir_allister_run.png',
      'assets/atlases/sir_allister_run.json'
    );

    this.load.atlas(
      'ly_idle',
      'assets/images/ly_idle.png',
      'assets/atlases/ly_idle.json'
    );

    this.load.atlas(
      'tom_idle',
      'assets/images/tom_idle.png',
      'assets/atlases/tom_idle.json'
    );

    this.load.atlas(
      'cars',
      'assets/images/vehicles-bgr.png',
      'assets/atlases/cars_atlas.json'
    );

    // Load Piepsie sprites
    this.load.image('piepsie-tail-1', 'assets/images/piepsie-tail-1-bgr.png');
    this.load.image('piepsie-tail-2', 'assets/images/piepsie-tail-2-bgr.png');
    this.load.image('piepsie-hearts-1', 'assets/images/piepsie-hearts-1.png');
    this.load.image('piepsie-hearts-2', 'assets/images/piepsie-hearts-2.png');
  }

  /**
   * Load all audio assets
   */
  loadAudioAssets() {
    // Load background music
    this.load.audio('dear_katara', 'assets/audio/DearKatara.m4a');
    this.load.audio('hells_bells', 'assets/audio/HellsBells.m4a');
    this.load.audio('lock_stock', 'assets/audio/TheWayIAre.m4a');
    this.load.audio('shell', 'assets/audio/Shell.m4a');
    
    // Load sound effects (add these if you have the files)
    // this.load.audio('pickup_sound', 'assets/audio/pickup.mp3');
    // this.load.audio('success_sound', 'assets/audio/success.mp3');
    // this.load.audio('jump_sound', 'assets/audio/jump.mp3');
  }
}

