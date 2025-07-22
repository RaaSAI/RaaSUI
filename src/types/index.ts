export interface ClientData {
  // Phase 1: Basic Qualification
  email: string;
  companyName: string;
  
  // Phase 2: Business Context
  industry: string;
  businessModel: 'b2b-software' | 'ecommerce' | 'professional-services' | 'manufacturing' | 'healthcare' | 'financial-services' | 'other';
  businessModelOther?: string;
  
  // Phase 3: Research Scope & Objectives
  researchDriver: 'new-market' | 'competitive-intelligence' | 'product-launch' | 'strategic-planning' | 'investment-decision' | 'performance-benchmarking';
  researchObjectives: string[]; // Up to 3 selections
  
  // Phase 4: Competitive & Market Focus
  competitors: string;
  geographicMarkets: string[];
  
  // Phase 5: Research Preferences & Timeline
  updateFrequency: 'real-time' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  
  // System fields
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
  extractedValue?: string | string[];
}

export interface OnboardingStep {
  id: string;
  phase: number;
  phaseTitle: string;
  field: keyof ClientData;
  question: string;
  placeholder: string;
  validation: (input: string) => ValidationResult;
  suggestions?: string[];
  isMultiSelect?: boolean;
  maxSelections?: number;
  options?: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
  conditionalLogic?: (data: Partial<ClientData>) => boolean;
  followUpQuestions?: Array<{
    condition: (data: Partial<ClientData>) => boolean;
    question: string;
    field: keyof ClientData;
  }>;
}

export interface EmailVerificationState {
  email: string;
  isVerifying: boolean;
  isVerified: boolean;
  verificationError?: string;
}

export interface MultiSelectState {
  selectedOptions: string[];
  isComplete: boolean;
}