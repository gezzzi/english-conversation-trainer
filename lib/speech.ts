export class SpeechManager {
  private static instance: SpeechManager;
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private botVoice: SpeechSynthesisVoice | null = null;
  private userVoice: SpeechSynthesisVoice | null = null;
  private botVoiceType: 'voice1' | 'voice2' | 'voice3' | 'voice4' = 'voice1';
  private userVoiceType: 'voice1' | 'voice2' | 'voice3' | 'voice4' = 'voice2';
  private speakingRate: 'slow' | 'normal' | 'fast' = 'normal';

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

  setBotVoiceType(type: 'voice1' | 'voice2' | 'voice3' | 'voice4'): void {
    this.botVoiceType = type;
    this.loadVoices();
  }

  setUserVoiceType(type: 'voice1' | 'voice2' | 'voice3' | 'voice4'): void {
    this.userVoiceType = type;
    this.loadVoices();
  }

  setSpeakingRate(rate: 'slow' | 'normal' | 'fast'): void {
    this.speakingRate = rate;
  }

  private getRateValue(): number {
    switch (this.speakingRate) {
      case 'slow':
        return 0.7;
      case 'normal':
        return 1.0;
      case 'fast':
        return 1.3;
      default:
        return 1.0;
    }
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
    
    // 利用可能な英語音声を取得
    const englishVoices = this.voices.filter(voice => voice.lang.startsWith('en-'));
    
    // ボットとユーザーの音声を設定
    const getVoiceByType = (type: 'voice1' | 'voice2' | 'voice3' | 'voice4'): SpeechSynthesisVoice | null => {
      const index = parseInt(type.replace('voice', '')) - 1;
      return englishVoices[index] || englishVoices[0] || null;
    };

    this.botVoice = getVoiceByType(this.botVoiceType);
    this.userVoice = getVoiceByType(this.userVoiceType);
  }

  speak(text: string, isUserMessage: boolean = false, onEnd?: () => void): void {
    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // メッセージタイプに応じて音声を選択
    if (isUserMessage && this.userVoice) {
      utterance.voice = this.userVoice;
    } else if (!isUserMessage && this.botVoice) {
      utterance.voice = this.botVoice;
    } else {
      utterance.lang = 'en-US';
    }

    // Configure speech parameters
    utterance.rate = this.getRateValue();
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
  getCurrentVoices(): { botVoice: SpeechSynthesisVoice | null, userVoice: SpeechSynthesisVoice | null } {
    return {
      botVoice: this.botVoice,
      userVoice: this.userVoice
    };
  }
} 