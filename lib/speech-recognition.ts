import type { 
  SpeechRecognition, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent 
} from '@/types';

export class SpeechRecognitionManager {
  private static instance: SpeechRecognitionManager | null = null;
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.configureRecognition();
      }
    }
  }

  private configureRecognition(): void {
    if (!this.recognition) return;

    this.recognition.lang = 'ja-JP';
    this.recognition.interimResults = true;
    this.recognition.continuous = false;
    this.recognition.maxAlternatives = 1;
  }

  public static getInstance(): SpeechRecognitionManager {
    if (!SpeechRecognitionManager.instance) {
      SpeechRecognitionManager.instance = new SpeechRecognitionManager();
    }
    return SpeechRecognitionManager.instance;
  }

  public startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onEnd: () => void,
    onError: (error: any) => void
  ): void {
    if (!this.recognition) {
      onError(new Error('Speech recognition is not supported in this browser'));
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.isListening = true;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;
      
      onResult(transcript, isFinal);
      
      if (isFinal) {
        this.stopListening();
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      onError(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (error) {
      onError(error);
      this.isListening = false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
} 