import { ClientData } from '../types';

// Simple NLP utilities for entity extraction and intent recognition
export class NLPProcessor {
  private industryKeywords = {
    'technology': ['tech', 'software', 'it', 'digital', 'saas', 'ai', 'ml', 'data'],
    'healthcare': ['health', 'medical', 'pharma', 'biotech', 'hospital', 'clinic'],
    'finance': ['bank', 'fintech', 'investment', 'insurance', 'trading', 'crypto'],
    'retail': ['retail', 'ecommerce', 'shopping', 'consumer', 'fashion', 'apparel'],
    'manufacturing': ['manufacturing', 'production', 'industrial', 'automotive', 'machinery'],
    'education': ['education', 'learning', 'school', 'university', 'training'],
    'real estate': ['real estate', 'property', 'construction', 'housing', 'development'],
    'food & beverage': ['food', 'restaurant', 'beverage', 'hospitality', 'catering']
  };

  extractIndustry(input: string): string | null {
    const lowerInput = input.toLowerCase();
    
    for (const [industry, keywords] of Object.entries(this.industryKeywords)) {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        return industry;
      }
    }
    
    return null;
  }

  extractEmail(input: string): string | null {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = input.match(emailRegex);
    return match ? match[0] : null;
  }

  extractCompanyName(input: string): string | null {
    // Simple company name extraction - look for capitalized words or common company suffixes
    const companyRegex = /\b[A-Z][a-zA-Z\s&.,'-]+(?:\s+(?:Inc|LLC|Corp|Ltd|Company|Co|Corporation|Limited)\.?)?/;
    const match = input.match(companyRegex);
    return match ? match[0].trim() : null;
  }

  detectIntent(input: string): 'greeting' | 'question' | 'data' | 'confirmation' | 'unknown' {
    const lowerInput = input.toLowerCase();
    
    if (/^(hi|hello|hey|good morning|good afternoon)/.test(lowerInput)) {
      return 'greeting';
    }
    
    if (/\?/.test(input) || /^(what|how|when|where|why|can|could|would)/.test(lowerInput)) {
      return 'question';
    }
    
    if (/^(yes|yeah|yep|sure|ok|okay|correct|right)/.test(lowerInput)) {
      return 'confirmation';
    }
    
    return 'data';
  }

  processUserInput(input: string, currentField?: keyof ClientData): {
    intent: string;
    extractedData: Partial<ClientData>;
    confidence: number;
  } {
    const intent = this.detectIntent(input);
    const extractedData: Partial<ClientData> = {};
    
    // Extract relevant data based on current context
    const email = this.extractEmail(input);
    if (email) extractedData.email = email;
    
    const companyName = this.extractCompanyName(input);
    if (companyName) extractedData.companyName = companyName;
    
    const industry = this.extractIndustry(input);
    if (industry) extractedData.industry = industry;
    
    // If we're asking for research topic, treat the whole input as the topic
    if (currentField === 'researchTopic' && input.trim().length > 5) {
      extractedData.researchTopic = input.trim();
    }
    
    return {
      intent,
      extractedData,
      confidence: Object.keys(extractedData).length > 0 ? 0.8 : 0.3
    };
  }
}