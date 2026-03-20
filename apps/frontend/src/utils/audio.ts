const SOUND_URLS = {
  diamond: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  explosion: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Heavy Cinematic Explosion
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
}

class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()

  constructor() {
    // Preload sounds
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      const audio = new Audio(url)
      audio.preload = 'auto'
      this.sounds.set(key, audio)
    })
  }

  public play(type: keyof typeof SOUND_URLS) {
    const audio = this.sounds.get(type)
    if (audio) {
      // Reset to start if already playing
      audio.currentTime = 0
      audio.play().catch(err => {
        console.warn('Audio play blocked or failed:', err)
      })
    }
  }
}

export const audioManager = new AudioManager()
