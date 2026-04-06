import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { AIProvider, AIResponse, ChatMessage } from '../ai-provider.interface';
import 'dotenv/config';

// Gemini function-calling schema for job classification
const classifyJobFunction: FunctionDeclaration = {
  name: 'classify_job',
  description:
    'Call this function when you have enough information to fully classify the home service job. Do not call it until you are confident about the job type, scope, and materials needed.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      job_type: {
        type: SchemaType.STRING,
        description:
          'Short snake_case identifier for the job type. Examples: pipe_leak, electrical_fault, door_hinge, ac_service, wall_painting',
      },
      description: {
        type: SchemaType.STRING,
        description: 'A clear 1-2 sentence summary of the problem the client described.',
      },
      estimated_duration_hours: {
        type: SchemaType.NUMBER,
        description: 'Estimated hours to complete the job, as a number (e.g. 1.5).',
      },
      materials: {
        type: SchemaType.ARRAY,
        description: 'List of materials/parts likely needed for this job.',
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: 'Material or part name' },
            quantity: { type: SchemaType.NUMBER, description: 'Estimated quantity needed' },
          },
          required: ['name', 'quantity'],
        },
      },
    },
    required: ['job_type', 'description', 'estimated_duration_hours', 'materials'],
  },
};

@Injectable()
export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.modelName = process.env.AI_MODEL || 'gemini-1.5-flash';
  }

  async chat(messages: ChatMessage[], systemPrompt?: string): Promise<AIResponse> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt,
      tools: [{ functionDeclarations: [classifyJobFunction] }],
    });

    // Convert our ChatMessage[] to Gemini's history format
    // The last user message is sent as the current turn
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;

    // Check if Gemini decided to call classify_job
    const functionCall = response.functionCalls()?.[0];
    if (functionCall && functionCall.name === 'classify_job') {
      return {
        message: 'I have enough information to classify your job.',
        classified_job: functionCall.args as any,
      };
    }

    return {
      message: response.text(),
    };
  }
}
