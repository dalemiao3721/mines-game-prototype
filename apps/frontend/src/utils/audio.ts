const SOUND_URLS = {
  diamond: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  explosion: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Heavy Bloom
  shockwave: 'https://assets.mixkit.co/active_storage/sfx/2557/2557-preview.mp3', // Intense Shockwave Layer
  bump: 'https://assets.mixkit.co/active_storage/sfx/2558/2558-preview.mp3', // Metallic Trigger
  click: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3', // Short Pro Beep
  start: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
  cashout: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
  cashRegister: 'https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3',
}

class WebAudioManager {
  private context: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private pcmData: Map<string, ArrayBuffer> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.context = new AudioCtx();
        this.preload();
      } catch (e) {
        console.error('[AudioManager] AudioContext failed:', e);
      }
    }
  }

  private async preload() {
    if (!this.context) return;
    
    Object.entries(SOUND_URLS).forEach(async ([key, url]) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        this.pcmData.set(key, arrayBuffer);
        const decoded = await this.context!.decodeAudioData(arrayBuffer.slice(0));
        this.buffers.set(key, decoded);
      } catch (err) {
        console.warn(`[AudioManager] Preload failed for ${key}:`, err);
      }
    });
  }

  public async play(type: keyof typeof SOUND_URLS, volume: number = 2.0) {
    if (!this.context) return;

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    let buffer = this.buffers.get(type);
    if (!buffer && this.pcmData.has(type)) {
      try {
        buffer = await this.context.decodeAudioData(this.pcmData.get(type)!.slice(0));
        this.buffers.set(type, buffer);
      } catch (e) {}
    }

    if (buffer) {
      const source = this.context.createBufferSource();
      const gainNode = this.context.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      source.start(0);
    }
  }
}

export const audioManager = new WebAudioManager();
