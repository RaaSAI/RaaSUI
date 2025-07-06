// Mock Anthropic integration for MVP
// Replace with actual Anthropic SDK integration when you have API keys

export class AnthropicService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || 'mock-api-key';
  }

  async generateResponse(userInput: string, context: string, stepId?: string, userName?: string): Promise<string> {
    // Mock response for MVP - replace with actual Anthropic API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    // Special handling for name step
    if (stepId === 'welcome' && userName) {
      return `Welcome ${userName}! `;
    }
    
    const responses = [
      "That's great! I'll make sure to capture that information.",
      "Perfect! I have that noted down.",
      "Excellent choice. That will help us provide better research insights.",
      "Thank you for that information. It's very helpful for our research process."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async analyzeInput(input: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    entities: string[];
    intent: string;
  }> {
    // Mock analysis - replace with actual Anthropic API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      sentiment: 'positive',
      entities: [],
      intent: 'provide_information'
    };
  }
}
