export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClassifiedJob {
  job_type: string;            // e.g. "pipe_leak", "electrical_fault"
  description: string;         // human-readable summary of the problem
  estimated_duration_hours: number;
  materials: Array<{
    name: string;
    quantity: number;
  }>;
}

export interface AIResponse {
  message: string;             // reply to show the user
  classified_job?: ClassifiedJob; // set when AI is confident enough to classify
}

export interface AIProvider {
  chat(messages: ChatMessage[], systemPrompt?: string): Promise<AIResponse>;
}
