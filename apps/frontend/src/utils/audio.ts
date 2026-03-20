const SOUND_URLS = {
  diamond: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  explosion: 'https://assets.mixkit.co/active_storage/sfx/2792/2792-preview.mp3', // Massive Cinematic Explosion with Debris
  bump: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Crisp Mechanical Click/Trigger
  click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Minimal Digital Click
  start: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Same short digital click for startup
  cashout: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Rich victory bell
  cashRegister: 'https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3', // Cha-ching
}

class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      Object.entries(SOUND_URLS).forEach(([key, url]) => {
        const audio = new Audio(url)
        audio.preload = 'auto'
        audio.load()
        this.sounds.set(key, audio)
      })
    }
  }

  public play(type: keyof typeof SOUND_URLS) {
    const audio = this.sounds.get(type)
    if (audio) {
      // Use clone for overlapping if needed, but for UI clicks, we want crisp one-shot
      const sound = audio.cloneNode(true) as HTMLAudioElement
      sound.volume = 0.8
      sound.play().catch(err => console.warn('Audio play failed:', err))
    }
  }
}

export const audioManager = new AudioManager()
