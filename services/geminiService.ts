
import { GoogleGenAI, Type } from "@google/genai";
import { PromptSuggestions, PromptElements } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export const generateSuggestionsForIdea = async (idea: string): Promise<PromptSuggestions> => {
  const prompt = `ユーザーのアイデア:「${idea}」

上記アイデアに基づき、生成AI向けのプロンプトを作成するための要素を提案してください。
各要素について、具体的で多様な選択肢を3つずつ生成してください。

- AIへの役割 (role): AIにどのような専門家やキャラクターとして振る舞ってほしいか
- 目的 (purpose): このプロンプトで達成したい具体的なゴールは何か
- 制約条件 (constraints): 出力に含めるべき、または含めてはいけない条件は何か`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'AIに割り当てる役割の候補3つ',
            },
            purposes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'プロンプトの目的の候補3つ',
            },
            constraints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '出力の制約条件の候補3つ',
            },
          },
          required: ['roles', 'purposes', 'constraints'],
        },
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (Array.isArray(parsed.roles) && Array.isArray(parsed.purposes) && Array.isArray(parsed.constraints)) {
        return parsed as PromptSuggestions;
    } else {
        throw new Error("Invalid JSON structure from Gemini API for suggestions");
    }

  } catch (error) {
    console.error("Error calling Gemini API for suggestions:", error);
    throw new Error("Failed to generate suggestions from AI.");
  }
};

export const generateInitialPromptFromIdea = async (idea: string): Promise<Partial<PromptElements>> => {
    const prompt = `ユーザーのアイデア: 「${idea}」
    
    上記アイデアを分析し、生成AI向けのプロンプトの骨子を作成してください。
    - AIに与えるべき最も適切な「役割」
    - このプロンプトで達成すべき「目的」
    - 必要だと思われる「制約条件」
    を抽出し、JSON形式で返してください。`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        role: { type: Type.STRING, description: "AIに割り当てる役割" },
                        purpose: { type: Type.STRING, description: "プロンプトの目的" },
                        constraints: { type: Type.STRING, description: "出力の制約条件" },
                    },
                    required: ['role', 'purpose', 'constraints'],
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error calling Gemini API for initial prompt:", error);
        throw new Error("Failed to generate initial prompt from AI.");
    }
};


export const refinePrompt = async (promptToRefine: string): Promise<string[]> => {
    const prompt = `あなたはプロンプトエンジニアリングの専門家です。以下のプロンプトを分析し、より具体的で、ユニークで、効果的な結果を生むための改善案を提案してください。

提案は、元のプロンプトに直接追加できるような、短く具体的なテキスト形式でなければなりません。解説は不要です。5つ提案してください。

## 分析対象のプロンプト
${promptToRefine}
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'プロンプトを改善するための具体的なテキスト提案5つ'
                        }
                    },
                    required: ['suggestions']
                }
            }
        });
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        if (Array.isArray(parsed.suggestions)) {
            return parsed.suggestions;
        } else {
            throw new Error("Invalid JSON structure for prompt refinement");
        }
    } catch (error) {
        console.error("Error calling Gemini API for refinement:", error);
        throw new Error("Failed to generate refinements from AI.");
    }
}

export const getRealtimeSuggestion = async (currentPrompt: string): Promise<string> => {
    const prompt = `あなたは優秀なプロンプトアシスタントです。以下の作成途中のプロンプト全体を分析し、その文脈を深く理解してください。

その上で、次に追加すべき最も効果的で具体的な項目を提案してください。
提案は**複数行**にわたっても構いません。
提案はすぐにプロンプトに追加できる形式で、テキストのみを返してください。例えば、箇条書きで「- 具体的な提案内容」のように返してください。
解説や前置きは一切不要です。
もし適切な提案がなければ、空の文字列を返してください。

## 作成途中のプロンプト
\`\`\`
${currentPrompt}
\`\`\`
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestion: {
                            type: Type.STRING,
                            description: '追記すべき改善案のテキスト（複数行可）、または空の文字列'
                        }
                    },
                    required: ['suggestion']
                }
            }
        });
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed.suggestion || '';
    } catch (error) {
        console.error("Error calling Gemini API for real-time suggestion:", error);
        return ''; // Return empty string on error to not break UI
    }
};

export const generateIdeaKeywords = async (theme: string): Promise<string[]> => {
    const prompt = `あなたは創造的なブレインストーミングアシスタントです。
中心的なテーマ「${theme}」について、関連するコンセプト、キーワード、または意外な連想を10個、簡潔な単語や短いフレーズで生成してください。`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        keywords: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'テーマに関連するキーワードまたは短いフレーズ10個'
                        }
                    },
                    required: ['keywords']
                }
            }
        });
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed.keywords)) {
            return parsed.keywords;
        } else {
            throw new Error("Invalid JSON structure for idea keywords");
        }
    } catch (error) {
        console.error("Error calling Gemini API for keywords:", error);
        throw new Error("Failed to generate keywords from AI.");
    }
};