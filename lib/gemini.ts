import { GoogleGenerativeAI } from '@google/generative-ai';
import { Settings } from '@/types';

if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
  throw new Error('NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

// 難易度に基づいたプロンプトを生成
function getSystemPrompt(difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
  const basePrompt = `
You are an English conversation partner. Follow these guidelines strictly:

1. ALWAYS respond in English first, followed by a Japanese translation
2. Respond naturally as if in a real conversation
3. DO NOT repeat or echo back the user's input
4. Keep the conversation flowing with natural follow-up questions or comments
5. Keep context from previous messages in mind
6. Be encouraging and friendly
7. ONLY include greetings when responding to a user's greeting
8. DO NOT include greetings in every response
9. IMPORTANT: Vary your response styles, sentence structures, and expressions
10. Avoid falling into repetitive patterns of responses
11. Each response should feel fresh and different from previous ones`;

  // 難易度に応じた指示を追加
  let difficultySpecificPrompt = '';
  
  switch (difficulty) {
    case 'beginner':
      difficultySpecificPrompt = `
For BEGINNER level:
- Use simple vocabulary and short sentences
- Speak slowly and clearly (use simple grammar)
- Avoid idioms and complex expressions
- Be very patient and encouraging
- Provide more explanations for new words
- Grammar corrections should be for very basic mistakes only`;
      break;
    case 'intermediate':
      difficultySpecificPrompt = `
For INTERMEDIATE level:
- Use moderate vocabulary with occasional new words
- Use a mix of simple and complex sentences
- Introduce some common idioms and expressions
- Be patient but challenge the learner
- Provide corrections for common grammar mistakes`;
      break;
    case 'advanced':
      difficultySpecificPrompt = `
For ADVANCED level:
- Use rich, natural vocabulary with idioms and expressions
- Use complex and varied sentence structures
- Engage in deeper conversations on a variety of topics
- Challenge the learner with sophisticated language
- Correct subtle grammar and usage mistakes
- Introduce nuanced expressions and cultural contexts`;
      break;
  }

  const examplesPrompt = `
Your responses should be natural and contextual. For example:
- If asked about hobbies: "I love hiking! Have you ever tried any outdoor activities?"
- If discussing travel: "Paris is amazing in spring! What's your dream destination?"
- If the topic is food: "Italian cuisine is my favorite. Do you enjoy cooking?"

IMPORTANT: Even though the user writes in Japanese, you MUST respond in English first.
ONLY include greetings like "Hello" or "Hi" when the user has greeted you first.
DO NOT start every response with a greeting.

Respond with a JSON object (without any markdown formatting or code blocks) in the following structure:
{
  "response": "Your response in English",
  "translation": "日本語での翻訳",
  "corrections": [
    {
      "original": "Original text with mistake (only include if there's an actual error)",
      "correction": "Corrected text",
      "explanation": "Brief, friendly explanation of the correction"
    }
  ]
}

Important rules:
- The "response" field MUST always be in English
- Only include corrections if there are actual grammar mistakes
- Keep responses concise and conversational
- Focus on maintaining a natural flow of conversation`;

  return basePrompt + difficultySpecificPrompt + examplesPrompt;
}

// デフォルト難易度
let currentDifficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export class ConversationManager {
  private history: ChatMessage[] = [];
  private model: any;
  private settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
    currentDifficulty = settings.difficulty;
    
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
    
    // 初期化時にシステムプロンプトを追加
    this.history.push({
      role: 'assistant',
      content: getSystemPrompt(settings.difficulty)
    });
  }

  // 設定を更新
  updateSettings(settings: Settings): void {
    // 難易度が変更された場合は、システムプロンプトを更新
    if (settings.difficulty !== this.settings.difficulty) {
      this.settings = settings;
      this.history[0] = {
        role: 'assistant',
        content: getSystemPrompt(settings.difficulty)
      };
      currentDifficulty = settings.difficulty;
    } else {
      this.settings = settings;
    }
  }

  async sendMessage(
    userText: string
  ): Promise<{
    response: string;
    translation: string;
    corrections?: Array<{
      original: string;
      correction: string;
      explanation: string;
    }>;
  }> {
    try {
      // 入力が英語かどうかを判定
      const isEnglish = /^[A-Za-z\s\d.,!?'"()-]+$/.test(userText.trim());
      
      // ユーザーメッセージを履歴に追加
      this.history.push({
        role: 'user',
        content: userText
      });

      // 履歴から会話の文脈を構築
      const conversationContext = this.history
        .slice(1) // システムプロンプトをスキップ
        .slice(-9) // 最新の9つのメッセージを使用（より広い会話の文脈を提供する）
        .map((msg, index, arr) => {
          // インデックスを計算（配列内での相対位置）
          const relativeIndex = index;
          
          if (msg.role === 'user') {
            // 最新のユーザーメッセージは特別に扱う
            if (relativeIndex === arr.length - 1) {
              return { text: `Current user message: ${msg.content}` };
            }
            // それ以前のメッセージはオプションで
            return { text: `Previous user message: ${msg.content}` };
          } else if (msg.role === 'assistant') {
            // 最新のアシスタントメッセージのみ含める
            if (relativeIndex === arr.length - 2) {
              return { text: `Previous response: ${msg.content}` };
            }
            return null;
          }
          return null;
        })
        .filter(Boolean); // nullを除外

      const result = await this.model.generateContent([
        { text: getSystemPrompt(this.settings.difficulty) },
        ...conversationContext,
        { text: `Respond naturally to the current user message (${this.settings.difficulty} level). 
ONLY include greetings like "Hello" or "Hi" when replying to a user's greeting.
DO NOT include greetings in every response.
Focus primarily on the current message and generate a fresh, unique response.
Avoid repetitive patterns in your responses.
Each response should be different in structure and wording from previous ones.
Be creative and varied in your expression style.` }
      ]);
      
      const response = await result.response.text();
      
      try {
        const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
        const parsedResponse = JSON.parse(cleanJson);

        // 応答が英語であることを確認
        if (!parsedResponse.response || typeof parsedResponse.response !== 'string' || /^[ぁ-んァ-ン一-龥]/.test(parsedResponse.response)) {
          console.error('Response is not in English:', parsedResponse);
          throw new Error('Response must be in English');
        }

        // アシスタントの応答を履歴に追加
        this.history.push({
          role: 'assistant',
          content: parsedResponse.response
        });

        // 履歴が長すぎる場合は古いメッセージを削除（システムプロンプトは保持）
        if (this.history.length > 10) {
          this.history = [
            this.history[0], // システムプロンプト
            ...this.history.slice(-9) // 最新の9メッセージ
          ];
        }

        return parsedResponse;
      } catch (error) {
        console.error('Failed to parse Gemini response:', error);
        console.error('Raw response:', response);
        throw new Error('Invalid JSON response from Gemini');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        response: 'I apologize, but I encountered an error processing your message.',
        translation: '申し訳ありませんが、メッセージの処理中にエラーが発生しました。'
      };
    }
  }

  // 会話履歴をクリア（システムプロンプトは保持）
  clearHistory() {
    const currentSystemPrompt = this.history[0];
    this.history = [currentSystemPrompt];
  }

  // 会話履歴を取得
  getHistory(): ChatMessage[] {
    return this.history;
  }
}

// エクスポートする関数を更新
let conversationManager: ConversationManager | null = null;

export function getConversationManager(settings?: Settings): ConversationManager {
  if (!conversationManager) {
    if (!settings) {
      settings = {
        difficulty: 'beginner',
        autoSpeak: true,
        showTranslation: true,
        botVoiceType: 'voice1',
        userVoiceType: 'voice2',
        speakingRate: 'normal'
      };
    }
    conversationManager = new ConversationManager(settings);
  } else if (settings) {
    conversationManager.updateSettings(settings);
  }
  return conversationManager;
}

export async function generateConversationResponse(
  japaneseText: string,
  settings?: Settings
): Promise<{
  response: string;
  translation: string;
  corrections?: Array<{
    original: string;
    correction: string;
    explanation: string;
  }>;
}> {
  const manager = getConversationManager(settings);
  return manager.sendMessage(japaneseText);
}

// 日本語を英語に翻訳する関数
export async function translateJapaneseToEnglish(text: string): Promise<string> {
  try {
    // 入力が英語かどうかを判定
    const isEnglish = /^[A-Za-z\s\d.,!?'"()-]+$/.test(text.trim());
    
    // 英語の場合は翻訳不要
    if (isEnglish) {
      return text;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent([
      { text: 'Translate the following Japanese text to English. Only provide the translation without any explanation or additional text.' },
      { text }
    ]);
    
    return result.response.text().trim();
  } catch (error) {
    console.error('Translation error:', error);
    return text; // エラーの場合は元のテキストを返す
  }
} 