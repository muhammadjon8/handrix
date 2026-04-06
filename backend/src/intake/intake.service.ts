import { Inject, Injectable } from '@nestjs/common';
import { type AIProvider, ChatMessage } from '../ai/ai-provider.interface';
import { AI_PROVIDER_TOKEN } from '../ai/ai.module';

const SYSTEM_PROMPT = `You are a friendly home service intake assistant for Handrix, a platform that connects clients with skilled local handymen for same-day repairs.

Your job is to gather enough information about the client's home repair problem so it can be classified and priced accurately. Ask clear, conversational follow-up questions one at a time to understand:
1. What the problem is (e.g. leaking pipe, broken hinge, faulty switch)
2. Where it is located in the home (kitchen, bathroom, bedroom, etc.)
3. How long the problem has been occurring
4. Any relevant details (severity, materials, brand of appliance, etc.)

Once you have a clear picture — typically after 2-4 exchanges — call the classify_job function to submit the classification. Do not call it until you are confident.

Keep your tone warm, concise, and professional. Do not mention pricing.`;

@Injectable()
export class IntakeService {
  constructor(
    @Inject(AI_PROVIDER_TOKEN) private aiProvider: AIProvider,
  ) {}

  async chat(messages: ChatMessage[]) {
    const result = await this.aiProvider.chat(messages, SYSTEM_PROMPT);

    if (result.classified_job) {
      return {
        type: 'classification',
        message: result.message,
        classified_job: result.classified_job,
      };
    }

    return {
      type: 'message',
      message: result.message,
    };
  }
}
