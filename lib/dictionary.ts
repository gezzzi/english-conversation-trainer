import { GoogleGenerativeAI } from '@google/generative-ai';

// APIキーがない場合のエラーを表示
if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
  throw new Error('NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

/**
 * 英単語の意味と例文を自動生成する
 * @param word 英単語
 * @returns 意味と例文のオブジェクト
 */
export async function generateWordDefinition(
  word: string,
  level: 'beginner' | 'intermediate' | 'advanced'
): Promise<{ definition: string; example: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `
単語: "${word}"
難易度: ${level}

以下の形式で回答してください:
- 日本語での意味: [簡潔な日本語訳]
- 例文: [その単語を使った自然な例文]

意味は簡潔に、例文は${level}レベルに適した難易度で作成してください。
意味は30文字以内、例文は60文字以内にしてください。
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 結果をパース
    let definition = '';
    let example = '';

    const meaningMatch = text.match(/日本語での意味[:：]\s*(.+?)(?:\n|$)/);
    if (meaningMatch && meaningMatch[1]) {
      definition = meaningMatch[1].trim();
    }

    const exampleMatch = text.match(/例文[:：]\s*(.+?)(?:\n|$)/);
    if (exampleMatch && exampleMatch[1]) {
      example = exampleMatch[1].trim();
    }

    return {
      definition: definition || '（自動生成に失敗しました）',
      example: example || '（自動生成に失敗しました）'
    };
  } catch (error) {
    console.error('単語の自動生成に失敗しました:', error);
    return {
      definition: '（自動生成に失敗しました）',
      example: '（自動生成に失敗しました）'
    };
  }
} 