import { ValidationResult } from '../types';

export const validateEmail = (input: string): ValidationResult => {
  const trimmed = input.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, message: "Please provide a valid email address." };
  }
  return { isValid: true, extractedValue: trimmed };
};

export const validateCompanyName = (input: string): ValidationResult => {
  const trimmed = input.trim();
  if (trimmed.length < 2) {
    return { isValid: false, message: "Please provide a valid company name with at least 2 characters." };
  }
  return { isValid: true, extractedValue: trimmed };
};

export const validateIndustry = (input: string): ValidationResult => {
  const trimmed = input.trim();
  if (trimmed.length < 2) {
    return { isValid: false, message: "Please specify your industry or business sector." };
  }
  return { isValid: true, extractedValue: trimmed };
};

export const validateBusinessModel = (input: string): ValidationResult => {
  const trimmed = input.trim().toLowerCase();
  const models = {
    'b2b-software': ['b2b', 'software', 'saas', 'enterprise', 'business software'],
    'ecommerce': ['ecommerce', 'e-commerce', 'retail', 'online store', 'marketplace'],
    'professional-services': ['consulting', 'services', 'professional', 'agency', 'advisory'],
    'manufacturing': ['manufacturing', 'production', 'industrial', 'factory', 'maker'],
    'healthcare': ['healthcare', 'medical', 'health', 'biotech', 'pharma'],
    'financial-services': ['finance', 'financial', 'banking', 'fintech', 'investment']
  };
  
  for (const [model, keywords] of Object.entries(models)) {
    if (keywords.some(keyword => trimmed.includes(keyword))) {
      return { isValid: true, extractedValue: model };
    }
  }
  
  return { isValid: true, extractedValue: 'other' };
};

export const validateResearchDriver = (input: string): ValidationResult => {
  const trimmed = input.trim();
  if (trimmed.length < 3) {
    return { isValid: false, message: "Please tell us what's driving your need for market research." };
  }
  return { isValid: true, extractedValue: trimmed };
};

export const validateCompetitors = (input: string): ValidationResult => {
  const trimmed = input.trim();
  if (trimmed.toLowerCase().includes('not sure') || trimmed.toLowerCase().includes("don't know")) {
    return { isValid: true, extractedValue: "Need help identifying competitors" };
  }
  
  if (trimmed.length === 0) {
    return { isValid: false, message: "Please list your competitors or let us know if you need help identifying them." };
  }
  
  return { isValid: true, extractedValue: trimmed };
};

export const validateKeyProducts = (input: string): ValidationResult => {
  const trimmed = input.trim();
  if (trimmed.length < 5) {
    return { isValid: false, message: "Please describe the key products or services we should focus on." };
  }
  return { isValid: true, extractedValue: trimmed };
};

export const validateAdditionalRequirements = (input: string): ValidationResult => {
  const trimmed = input.trim();
  return { isValid: true, extractedValue: trimmed };
};

export const validateResearchTopic = (input: string): ValidationResult => {
  const trimmed = input.trim();
  if (trimmed.length < 10) {
    return { isValid: false, message: "Please provide more details about your research topic (at least 10 characters)." };
  }
  return { isValid: true, extractedValue: trimmed };
};

export const validateGeneric = (input: string): ValidationResult => {
  const trimmed = input.trim();
  if (trimmed.length < 1) {
    return { isValid: false, message: "Please provide a response." };
  }
  return { isValid: true, extractedValue: trimmed };
};