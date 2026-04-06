import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  FunctionDeclaration,
  SchemaType,
  DynamicRetrievalMode,
} from '@google/generative-ai';
import { AIProvider, AIResponse, ChatMessage } from '../ai-provider.interface';
import 'dotenv/config';

const classifyJobFunction: FunctionDeclaration = {
  name: 'classify_job',
  description:
    'Call this function to save the final job classification once all details are known.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      job_type: { type: SchemaType.STRING },
      description: { type: SchemaType.STRING },
      estimated_duration_hours: { type: SchemaType.NUMBER },
      materials: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            quantity: { type: SchemaType.NUMBER },
          },
          required: ['name', 'quantity'],
        },
      },
    },
    required: [
      'job_type',
      'description',
      'estimated_duration_hours',
      'materials',
    ],
  },
};

@Injectable()
export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    // Ensure the API key exists
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async chat(
    messages: ChatMessage[],
    systemPrompt?: string,
  ): Promise<AIResponse> {
    if (!messages.length) {
      throw new HttpException('No messages provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: process.env.AI_MODEL || 'gemini-2.5-flash',
        systemInstruction: systemPrompt,
        tools: [{ functionDeclarations: [classifyJobFunction] }],
      });

      // Prepare history (all but the last message)
      const history = messages.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const lastMessage = messages[messages.length - 1].content;

      const chat = model.startChat({
        history,
        // Optional: Force the model to stay focused
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.1, // Lower temperature is better for classification
        },
      });

      const result = await chat.sendMessage(lastMessage);
      const response = result.response;

      // Extract function calls safely
      const call = response.functionCalls()?.[0];

      if (call && call.name === 'classify_job') {
        return {
          message: 'Job classified successfully.',
          classified_job: call.args as any,
        };
      }

      return {
        message: response.text(),
      };
    } catch (error) {
      // Handle Rate Limits (Free Tier)
      if (error.status === 429 || error.message?.includes('429')) {
        return {
          message:
            "I'm a bit busy right now (Rate limit reached). Please wait a moment.",
        };
      }

      console.error('Gemini API Error:', error);
      throw new HttpException(
        'AI Provider Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
