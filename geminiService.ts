
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Operation, GrammarResult, SimplifyResult } from "./types.ts";

export class GeminiService {
  constructor() {}

  private getClient() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY is missing. Please ensure your .env file is correctly set up with API_KEY=...");
    }
    return new GoogleGenAI({ apiKey });
  }

  async analyzeText(text: string, language: Language, operation: Operation): Promise<GrammarResult | SimplifyResult> {
    const ai = this.getClient();
    const model = 'gemini-3-flash-preview';
    
    const langMap = {
      EN: 'English',
      UZ: 'Uzbek',
      RU: 'Russian',
      DE: 'German',
      AR: 'Arabic',
      TR: 'Turkish',
      ZH: 'Chinese',
      ES: 'Spanish'
    };

    const systemInstructions = {
      grammar: `You are an expert ${langMap[language]} proofreader. 
      Analyze the text provided. Fix all grammar, spelling, and punctuation errors.
      Provide a comprehensive list of every correction made.
      Return a JSON object:
      {
        "correctedText": "The fully corrected text",
        "errors": [
          {
            "original": "the wrong part",
            "suggestion": "the correct part",
            "explanation": "Brief student-friendly reason why this was changed"
          }
        ]
      }
      If there are no errors, the errors array should be empty. Output ONLY JSON.`,
      
      simplify: `You are a helpful teacher in ${langMap[language]}. 
      Rewrite the text to be much simpler and clear (Grade 5 level). Use shorter sentences and easier vocabulary.
      Return a JSON object:
      {
        "simplifiedText": "The simplified text",
        "summary": "One sentence explaining how you simplified it (e.g., used shorter sentences)"
      }
      Output ONLY JSON.`
    };

    const responseSchema = operation === 'grammar' ? {
      type: Type.OBJECT,
      properties: {
        correctedText: { type: Type.STRING },
        errors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING },
              suggestion: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ['original', 'suggestion', 'explanation']
          }
        }
      },
      required: ['correctedText', 'errors']
    } : {
      type: Type.OBJECT,
      properties: {
        simplifiedText: { type: Type.STRING },
        summary: { type: Type.STRING }
      },
      required: ['simplifiedText', 'summary']
    };

    try {
      const response = await ai.models.generateContent({
        model,
        contents: text,
        config: {
          systemInstruction: systemInstructions[operation],
          responseMimeType: "application/json",
          responseSchema: responseSchema as any
        }
      });

      const textOutput = response.text;
      if (!textOutput) throw new Error("Empty response from AI");
      return JSON.parse(textOutput);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      if (error.status === 403 || error.message?.includes("API_KEY")) {
        throw new Error("Invalid API Key. Please double check your key at Google AI Studio.");
      }
      throw new Error("Unable to reach the AI engine. Please try again later.");
    }
  }
}
