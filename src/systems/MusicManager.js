/**
 * MusicManager
 * Manages background music and sound effects across scenes
 */

export default class MusicManager {
  constructor(scene) {
    this.scene = scene;
    this.currentMusic = null;
    this.currentKey = null;
    this.globalVolume = 0.5;
    this.isMuted = false;
  }

  /**
   * Play a music track
   * @param {string} key - The audio key to play
   * @param {number} volume - Volume level (0.0 to 1.0)
   * @param {boolean} loop - Whether to loop the track
   * @param {number} fadeInDuration - Duration of fade in (ms), 0 for no fade
   */
  play(key, volume = 0.5, loop = true, fadeInDuration = 0) {
    // Don't restart if same track is already playing
    if (this.currentKey === key && this.currentMusic && this.currentMusic.isPlaying) {
      return;
    }

    // Stop current music if playing
    if (this.currentMusic) {
      this.stop(fadeInDuration > 0 ? fadeInDuration : 0);
    }

    // Wait for fade out before starting new track
    const delay = fadeInDuration > 0 && this.currentMusic ? fadeInDuration : 0;
    
    this.scene.time.delayedCall(delay, () => {
      this.currentMusic = this.scene.sound.add(key, {
        volume: fadeInDuration > 0 ? 0 : volume * this.globalVolume,
        loop: loop
      });

      this.currentKey = key;
      this.currentMusic.play();

      // Fade in if requested
      if (fadeInDuration > 0) {
        this.scene.tweens.add({
          targets: this.currentMusic,
          volume: volume * this.globalVolume,
          duration: fadeInDuration,
          ease: 'Linear'
        });
      }

      // Apply mute state if necessary
      if (this.isMuted) {
        this.currentMusic.setVolume(0);
      }
    });
  }

  /**
   * Stop the current music
   * @param {number} fadeOutDuration - Duration of fade out (ms), 0 for instant stop
   */
  stop(fadeOutDuration = 0) {
    if (!this.currentMusic) return;

    if (fadeOutDuration > 0) {
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: 0,
        duration: fadeOutDuration,
        ease: 'Linear',
        onComplete: () => {
          if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic.destroy();
            this.currentMusic = null;
            this.currentKey = null;
          }
        }
      });
    } else {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
      this.currentKey = null;
    }
  }

  /**
   * Pause the current music
   */
  pause() {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.pause();
    }
  }

  /**
   * Resume the current music
   */
  resume() {
    if (this.currentMusic && this.currentMusic.isPaused) {
      this.currentMusic.resume();
    }
  }

  /**
   * Set the volume of the current music
   * @param {number} volume - Volume level (0.0 to 1.0)
   * @param {number} fadeDuration - Duration to fade to new volume (ms)
   */
  setVolume(volume, fadeDuration = 0) {
    if (!this.currentMusic) return;

    const targetVolume = volume * this.globalVolume;

    if (fadeDuration > 0) {
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: targetVolume,
        duration: fadeDuration,
        ease: 'Linear'
      });
    } else {
      this.currentMusic.setVolume(targetVolume);
    }
  }

  /**
   * Set global volume multiplier for all music
   * @param {number} volume - Global volume level (0.0 to 1.0)
   */
  setGlobalVolume(volume) {
    this.globalVolume = volume;
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.currentMusic.volume * this.globalVolume);
    }
  }

  /**
   * Mute/unmute music
   * @param {boolean} mute - True to mute, false to unmute
   */
  setMute(mute) {
    this.isMuted = mute;
    if (this.currentMusic) {
      if (mute) {
        this.currentMusic.setVolume(0);
      } else {
        this.currentMusic.setVolume(this.currentMusic.volume);
      }
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.setMute(!this.isMuted);
  }

  /**
   * Cross-fade from current track to a new track
   * @param {string} newKey - The audio key to fade to
   * @param {number} volume - Target volume for new track
   * @param {number} duration - Duration of cross-fade (ms)
   */
  crossFade(newKey, volume = 0.5, duration = 2000) {
    // Don't cross-fade to the same track
    if (this.currentKey === newKey) return;

    const oldMusic = this.currentMusic;

    // Fade out old track
    if (oldMusic) {
      this.scene.tweens.add({
        targets: oldMusic,
        volume: 0,
        duration: duration,
        ease: 'Linear',
        onComplete: () => {
          oldMusic.stop();
          oldMusic.destroy();
        }
      });
    }

    // Start new track with fade in
    this.currentMusic = this.scene.sound.add(newKey, {
      volume: 0,
      loop: true
    });

    this.currentKey = newKey;
    this.currentMusic.play();

    this.scene.tweens.add({
      targets: this.currentMusic,
      volume: volume * this.globalVolume,
      duration: duration,
      ease: 'Linear'
    });

    if (this.isMuted) {
      this.currentMusic.setVolume(0);
    }
  }

  /**
   * Play a sound effect
   * @param {string} key - The audio key to play
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  playSoundEffect(key, volume = 0.5) {
    if (this.isMuted) return;
    
    this.scene.sound.play(key, {
      volume: volume * this.globalVolume
    });
  }

  /**
   * Check if music is currently playing
   * @returns {boolean}
   */
  isPlaying() {
    return this.currentMusic && this.currentMusic.isPlaying;
  }

  /**
   * Get the current track key
   * @returns {string|null}
   */
  getCurrentTrack() {
    return this.currentKey;
  }

  /**
   * Clean up resources (call when scene shuts down)
   */
  destroy() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
      this.currentKey = null;
    }
  }
}

