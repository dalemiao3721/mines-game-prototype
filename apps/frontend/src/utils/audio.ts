const SOUND_URLS = {
  diamond: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  explosion: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Heavy Cinematic Explosion
  bomb: 'https://assets.mixkit.co/active_storage/sfx/1103/1103-preview.mp3', // Fuse/Bomb Warning
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  start: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // For now, use click, will find better
  cashout: 'https://assets.mixkit.co/active_storage/sfx/1117/1117-preview.mp3', // Coins
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
