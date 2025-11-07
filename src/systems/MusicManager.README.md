# MusicManager

A comprehensive music and sound effect manager for Phaser 3 games.

## Features

- Play background music with looping
- Fade in/out effects
- Cross-fade between tracks
- Volume control (individual and global)
- Mute/unmute functionality
- Sound effect support
- Scene transition handling

## Usage

### Basic Setup

Import and initialize in your scene:

```javascript
import MusicManager from '../systems/MusicManager.js';

// In your scene's create() method:
this.musicManager = new MusicManager(this);
```

### Playing Music

```javascript
// Simple play with defaults (50% volume, looping)
this.musicManager.play('dear_katara');

// Play with custom volume and fade in
this.musicManager.play('dear_katara', 0.5, true, 2000);
// Parameters: (key, volume, loop, fadeInDuration)
```

### Stopping Music

```javascript
// Instant stop
this.musicManager.stop();

// Fade out stop
this.musicManager.stop(1000); // 1 second fade out
```

### Cross-Fading

Smoothly transition from one track to another:

```javascript
this.musicManager.crossFade('hells_bells', 0.4, 2000);
// Parameters: (newKey, volume, duration)
```

### Volume Control

```javascript
// Set volume for current track
this.musicManager.setVolume(0.7); // 70% volume

// Fade to new volume
this.musicManager.setVolume(0.3, 1000); // Fade to 30% over 1 second

// Set global volume multiplier
this.musicManager.setGlobalVolume(0.5);
```

### Mute/Unmute

```javascript
// Mute
this.musicManager.setMute(true);

// Unmute
this.musicManager.setMute(false);

// Toggle
this.musicManager.toggleMute();
```

### Pause/Resume

```javascript
// Pause current music
this.musicManager.pause();

// Resume
this.musicManager.resume();
```

### Sound Effects

Play one-shot sound effects:

```javascript
this.musicManager.playSoundEffect('pickup_sound', 0.5);
// Parameters: (key, volume)
```

### Utility Methods

```javascript
// Check if music is playing
if (this.musicManager.isPlaying()) {
  console.log('Music is playing');
}

// Get current track
const currentTrack = this.musicManager.getCurrentTrack();
console.log(`Playing: ${currentTrack}`);
```

### Scene Transitions

When transitioning between scenes, properly stop music:

```javascript
// In the scene you're leaving:
startCampQuest() {
  // Fade out music before scene transition
  this.musicManager.stop(1000);
  
  // ... rest of scene transition code
}
```

When returning to a scene, restart the music:

```javascript
// In the scene you're returning to:
if (mainScene.musicManager) {
  mainScene.musicManager.play('dear_katara', 0.5, true, 1000);
}
```

### Cleanup

When shutting down a scene, call destroy to clean up resources:

```javascript
shutdown() {
  if (this.musicManager) {
    this.musicManager.destroy();
  }
}
```

## Examples

### Main Menu with Music

```javascript
create() {
  this.musicManager = new MusicManager(this);
  
  // Start menu music with fade in
  this.musicManager.play('menu_music', 0.6, true, 2000);
  
  // Add mute button
  const muteButton = this.add.text(10, 10, 'Mute', { fontSize: '20px' });
  muteButton.setInteractive();
  muteButton.on('pointerdown', () => {
    this.musicManager.toggleMute();
    muteButton.setText(this.musicManager.isMuted ? 'Unmute' : 'Mute');
  });
}
```

### Boss Battle Music Transition

```javascript
startBossBattle() {
  // Cross-fade from normal music to boss music
  this.musicManager.crossFade('boss_battle_music', 0.7, 3000);
}

endBossBattle() {
  // Cross-fade back to normal music
  this.musicManager.crossFade('normal_music', 0.5, 3000);
}
```

### Pickup Item with Sound

```javascript
pickUpItem(item) {
  // Play pickup sound
  this.musicManager.playSoundEffect('pickup_sound', 0.3);
  
  // ... rest of pickup logic
}
```

### Dynamic Volume Based on Game State

```javascript
update() {
  // Lower music volume during dialogue
  if (this.dialogueManager.isDialogueActive()) {
    this.musicManager.setVolume(0.2, 500);
  } else {
    this.musicManager.setVolume(0.5, 500);
  }
}
```

## Audio File Support

The MusicManager works with all Phaser 3 supported audio formats:
- MP3 (recommended for music)
- OGG
- WAV (recommended for sound effects)
- M4A
- WebM

### File Organization

Organize your audio files in the `public/assets/audio/` directory:

```
public/
  assets/
    audio/
      music/
        - menu-theme.mp3
        - main-theme.mp3
        - boss-battle.mp3
      sfx/
        - pickup.wav
        - jump.wav
        - success.wav
```

## Best Practices

1. **Use Fade Effects**: Always fade in/out when starting or stopping music for smoother transitions
2. **Cross-Fade for Transitions**: Use cross-fade instead of stop/play for seamless music transitions
3. **Lower Volume During Dialogue**: Reduce music volume when dialogue is active
4. **Clean Up**: Call `destroy()` in scene shutdown to prevent memory leaks
5. **Mute Option**: Always provide players with a mute/volume option
6. **File Formats**: Use MP3 for music (smaller file size), WAV for sound effects (better quality for short clips)
7. **Preload All Audio**: Load all audio in PreloadScene to avoid delays during gameplay

## Common Issues

### Music Doesn't Play
- Ensure the audio file is loaded in PreloadScene
- Check browser console for loading errors
- Verify file path is correct
- Some browsers require user interaction before playing audio

### Music Overlaps
- Always stop previous music before playing new track
- Or use cross-fade for smoother transitions

### Volume Too Loud/Quiet
- Adjust the volume parameter when calling `play()`
- Use `setGlobalVolume()` to control overall game volume
- Consider normalizing audio files before importing

### Scene Transition Issues
- Always stop music with fade out before transitioning scenes
- Restart music in the new scene's create() or when resuming

