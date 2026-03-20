const SOUND_URLS = {
  diamond: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  explosion: 'https://assets.mixkit.co/active_storage/sfx/2557/2557-preview.mp3', // Massive cinematic power hit
  bomb: 'https://assets.mixkit.co/active_storage/sfx/1103/1103-preview.mp3', // Fuse warning
  bump: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Initial explosion boom
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  start: 'https://assets.mixkit.co/active_storage/sfx/2565/2565-preview.mp3', // Stronger digital startup
  cashout: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Rich victory bell
  cashRegister: 'https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3', // Cha-ching
}

class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()

  constructor() {
    // Preload sounds
    if (typeof window !== 'undefined') {
      Object.entries(SOUND_URLS).forEach(([key, url]) => {
        const audio = new Audio(url)
        audio.preload = 'auto'
        // Load the audio to memory
        audio.load()
        this.sounds.set(key, audio)
      })
    }
  }

  public play(type: keyof typeof SOUND_URLS) {
    const audio = this.sounds.get(type)
    if (audio) {
      // Use a clone to allow overlapping sounds of the same type
      const playPromise = (audio.cloneNode(true) as HTMLAudioElement).play()
      
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // Fallback to playing original if clone fails
          console.warn('Audio clone play failed, trying original:', err)
          audio.currentTime = 0
          audio.play().catch(e => console.error('Audio play failed:', e))
        })
      }
    }
  }
}

export const audioManager = new AudioManager()
