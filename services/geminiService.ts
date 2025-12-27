
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Operation, GrammarResult, SimplifyResult } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeText(text: string, language: Language, operation: Operation): Promise<GrammarResult | SimplifyResult> {
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
      grammar: `Act as a professional linguist specializing in ${langMap[language]}. 
      Analyze the text for grammar, spelling, and punctuation errors. 
      Return a JSON object with:
      - correctedText: the full corrected version.
      - errors: array of { offset: number, length: number, original: string, suggestion: string, explanation: string }.
      Note: Offset should be the character index in the input text.`,
      
      simplify: `Act as an educator for ${langMap[language]}. 
      Rewrite the text to be much simpler and easier to understand for a student. 
      Return a JSON object with:
      - simplifiedText: the simplified version of the text.
      - summary: a one-sentence summary of the changes made.`
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
              offset: { type: Type.INTEGER },
              length: { type: Type.INTEGER },
              original: { type: Type.STRING },
              suggestion: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ['offset', 'length', 'original', 'suggestion', 'explanation']
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
      const result = await this.ai.models.generateContent({
        model,
        contents: text,
        config: {
          systemInstruction: systemInstructions[operation],
          responseMimeType: "application/json",
          responseSchema: responseSchema as any
        }
      });

      const responseText = result.text || '{}';
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to analyze text. Please try again.");
    }
  }
}
