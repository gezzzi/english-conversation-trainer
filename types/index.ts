export interface Message {
  id: string
  content: string
  type: 'user' | 'bot'
  translation?: string
  correction?: GrammarCorrection[]
}

export interface GrammarCorrection {
  original: string
  correction: string
  explanation: string
}

export type Settings = {
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  autoSpeak: boolean
  showTranslation: boolean
  botVoiceType: 'voice1' | 'voice2' | 'voice3' | 'voice4'
  userVoiceType: 'voice1' | 'voice2' | 'voice3' | 'voice4'
  speakingRate: 'slow' | 'normal' | 'fast'
}

export interface Progress {
  totalMessages: number
  correctSentences: number
  vocabularyLearned: number
  lastPracticed: string
  streak: number
  level: number
  experience: number
  knownVocabulary: VocabularyWord[]   // 知っている単語リスト
  studyVocabulary: VocabularyWord[]   // 学習中の単語リスト
}

export interface VocabularyWord {
  id: string
  word: string
  translation: string
  example?: string
  mastered?: boolean
  lastStudied?: string
}

// Web Speech API用の型定義
export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

export interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// コンストラクタインターフェース定義
export interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
  prototype: SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}