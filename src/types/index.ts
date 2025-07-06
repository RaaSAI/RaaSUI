export interface ClientData {
  email: string;
  companyName: string;
  industry: string;
  researchTopic: string;
  researchType: 'market-research' | 'academic-research' | 'competitive-analysis';
  ipAddress?: string;
  country?: string;
  city?: string;
}

export interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  extractedValue?: string;
}

export interface OnboardingStep {
  id: string;
  field: keyof ClientData;
  question: string;
  placeholder: string;
  validation: (input: string) => ValidationResult;
  suggestions?: string[];
}

export interface EmailVerificationState {
  email: string;
  isVerifying: boolean;
  isVerified: boolean;
  verificationError?: string;
}
