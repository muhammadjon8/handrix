import { Module } from '@nestjs/common';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import 'dotenv/config';

const AI_PROVIDER_TOKEN = 'AI_PROVIDER';

const aiProviderFactory = {
  provide: AI_PROVIDER_TOKEN,
  useFactory: () => {
    const provider = process.env.AI_PROVIDER || 'gemini';
    if (provider === 'openai') return new OpenAIProvider();
    return new GeminiProvider(); // default
  },
};

@Module({
  providers: [aiProviderFactory, GeminiProvider, OpenAIProvider],
  exports: [AI_PROVIDER_TOKEN],
})
export class AiModule {}

export { AI_PROVIDER_TOKEN };
