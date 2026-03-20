const SOUND_URLS = {
  diamond: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  explosion: 'https://assets.mixkit.co/active_storage/sfx/2557/2557-preview.mp3', // Huge Cinematic Power Hit
  bomb: 'https://assets.mixkit.co/active_storage/sfx/1103/1103-preview.mp3', // Fuse/Bomb Warning
  bump: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Heavy Cinematic Explosion (Initial Hit)
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  start: 'https://assets.mixkit.co/active_storage/sfx/2562/2562-preview.mp3', // Professional Technology Power Up
  cashout: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Rich Win Chime
  cashRegister: 'https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3', // Cha-ching
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
