export class SpeechManager {
  private static instance: SpeechManager;
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private preferredVoice: SpeechSynthesisVoice | null = null;

  private constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    
    // voices might not be available immediately
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
    }
  }

  static getInstance(): SpeechManager {
    if (!SpeechManager.instance) {
      SpeechManager.instance = new SpeechManager();
    }
    return SpeechManager.instance;
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
    
    // Try to find a preferred English voice
    this.preferredVoice = this.voices.find(voice => 
      voice.lang.startsWith('en-') && voice.localService
    ) || this.voices.find(voice => 
      voice.lang.startsWith('en-')
    ) || null;
  }

  speak(text: string, onEnd?: () => void): void {
    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice preferences
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    } else {
      utterance.lang = 'en-US';
    }

    // Configure speech parameters
    utterance.rate = 0.9; // Slightly slower than normal
    utterance.pitch = 1;
    utterance.volume = 1;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synthesis.speak(utterance);
  }

  stop(): void {
    this.synthesis.cancel();
  }

  // 利用可能な音声の一覧を取得
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  // 現在選択されている音声を取得
  getCurrentVoice(): SpeechSynthesisVoice | null {
    return this.preferredVoice;
  }

  // 特定の音声を選択
  setVoice(voice: SpeechSynthesisVoice): void {
    this.preferredVoice = voice;
  }
} 