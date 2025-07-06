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

export const validateResearchTopic = (input: string): ValidationResult => {
  const trimmed = input.trim();
  if (trimmed.length < 5) {
    return { isValid: false, message: "Please provide more details about your research topic (at least 5 characters)." };
  }
  return { isValid: true, extractedValue: trimmed };
};