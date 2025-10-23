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
      'background',
      'assets/images/background.png',
      'assets/atlases/background_atlas.json'
    );

    this.load.atlas(
      'platform',
      'assets/images/generic_platformer_tiles.png',
      'assets/atlases/platform_atlas.json'
    );

    this.load.atlas(
      'ground',
      'assets/images/generic_platformer_tile_ground.png',
      'assets/atlases/ground.json'
    );
  }
}

