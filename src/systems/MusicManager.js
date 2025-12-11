
export default class MusicManager {
  constructor(scene) {
    this.scene = scene;
    this.currentMusic = null;
    this.currentKey = null;
    this.globalVolume = 0.5;
    this.isMuted = false;
  }

  /**
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
    const shouldDelay = this.currentMusic && fadeInDuration > 0;
    if (this.currentMusic) {
      this.stop(fadeInDuration > 0 ? fadeInDuration : 0);
    }

    // Wait for fade out before starting new track
    const delay = shouldDelay ? fadeInDuration : 0;
    
    this.scene.time.delayedCall(delay, () => {
      // Safety check: ensure scene is still active
      if (!this.scene || !this.scene.sound) {
        return;
      }
      
      this.currentMusic = this.scene.sound.add(key, {
        volume: fadeInDuration > 0 ? 0 : volume * this.globalVolume,
        loop: loop
      });

      this.currentKey = key;
      this.currentMusic.play();

      // Fade in if requested
      if (fadeInDuration > 0) {
        const musicToFade = this.currentMusic;
        this.scene.tweens.add({
          targets: musicToFade,
          volume: volume * this.globalVolume,
          duration: fadeInDuration,
          ease: 'Linear',
          onUpdate: (tween) => {
            // Safety check during tween
            if (!musicToFade || musicToFade.pendingDestroy) {
              tween.stop();
            }
          }
        });
      }

      // Apply mute state if necessary
      if (this.isMuted && this.currentMusic) {
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
      // Store reference to music to stop
      const musicToStop = this.currentMusic;
      
      // Clear references immediately to prevent race conditions
      this.currentMusic = null;
      this.currentKey = null;
      
      this.scene.tweens.add({
        targets: musicToStop,
        volume: 0,
        duration: fadeOutDuration,
        ease: 'Linear',
        onComplete: () => {
          if (musicToStop && !musicToStop.pendingDestroy) {
            musicToStop.stop();
            musicToStop.destroy();
          }
        }
      });
    } else {
      const musicToStop = this.currentMusic;
      this.currentMusic = null;
      this.currentKey = null;
      
      if (musicToStop && !musicToStop.pendingDestroy) {
        musicToStop.stop();
        musicToStop.destroy();
      }
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
    if (!this.currentMusic || this.currentMusic.pendingDestroy) return;

    const targetVolume = volume * this.globalVolume;

    if (fadeDuration > 0) {
      const musicToFade = this.currentMusic;
      this.scene.tweens.add({
        targets: musicToFade,
        volume: targetVolume,
        duration: fadeDuration,
        ease: 'Linear',
        onUpdate: (tween) => {
          // Safety check during tween
          if (!musicToFade || musicToFade.pendingDestroy) {
            tween.stop();
          }
        }
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
    if (this.currentMusic && !this.currentMusic.pendingDestroy) {
      this.currentMusic.setVolume(this.currentMusic.volume * this.globalVolume);
    }
  }

  /**
   * Mute/unmute music
   * @param {boolean} mute - True to mute, false to unmute
   */
  setMute(mute) {
    this.isMuted = mute;
    if (this.currentMusic && !this.currentMusic.pendingDestroy) {
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
        onUpdate: (tween) => {
          // Safety check during tween
          if (!oldMusic || oldMusic.pendingDestroy) {
            tween.stop();
          }
        },
        onComplete: () => {
          if (oldMusic && !oldMusic.pendingDestroy) {
            oldMusic.stop();
            oldMusic.destroy();
          }
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

    const musicToFade = this.currentMusic;
    this.scene.tweens.add({
      targets: musicToFade,
      volume: volume * this.globalVolume,
      duration: duration,
      ease: 'Linear',
      onUpdate: (tween) => {
        // Safety check during tween
        if (!musicToFade || musicToFade.pendingDestroy) {
          tween.stop();
        }
      }
    });

    if (this.isMuted && this.currentMusic) {
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

