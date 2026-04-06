import { Injectable } from '@nestjs/common';
import { AIProvider, AIResponse, ChatMessage } from '../ai-provider.interface';

/**
 * OpenAI provider stub — swap in by setting AI_PROVIDER=openai in .env
 * Install: npm install openai
 * Then implement using: import OpenAI from 'openai'
 */
@Injectable()
export class OpenAIProvider implements AIProvider {
  async chat(_messages: ChatMessage[], _systemPrompt?: string): Promise<AIResponse> {
    throw new Error(
      'OpenAI provider is not yet configured. Set AI_PROVIDER=gemini or install and configure openai package.',
    );
  }
}
