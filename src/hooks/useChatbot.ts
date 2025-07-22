import { useState, useCallback, useRef } from 'react';
import { ChatMessage, ClientData, OnboardingStep, EmailVerificationState } from '../types';
import { AnthropicService } from '../utils/anthropic';
import { NLPProcessor } from '../utils/nlp';
import { validateEmail, validateCompanyName, validateIndustry, validateResearchTopic } from '../utils/validation';
import { fetchIpGeoData } from '../utils/ipGeo';

// n8n webhook URLs
const SEND_VERIFICATION_WEBHOOK = 'https://sharifaistarttest1.app.n8n.cloud/webhook/send-verification-email';
const VERIFY_CODE_WEBHOOK = 'https://sharifaistarttest1.app.n8n.cloud/webhook/verify-email';
const FINAL_WEBHOOK_URL = 'https://sharifaistarttest1.app.n8n.cloud/webhook/client-onboarding';

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [clientData, setClientData] = useState<Partial<ClientData>>({});
  const [emailVerification, setEmailVerification] = useState<EmailVerificationState>({
    email: '',
    isVerifying: false,
    isVerified: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  const anthropicService = new AnthropicService();
  const nlpProcessor = new NLPProcessor();

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      phase: 1,
      phaseTitle: 'Basic Qualification',
      field: 'email',
      question: "Welcome to our Research as a Service platform! We help businesses get valuable insights through professional research. To get started, please provide your email address.",
      placeholder: "Enter your email address",
      validation: validateEmail,
      suggestions: []
    },
    {
      id: 'company-name',
      phase: 1,
      phaseTitle: 'Basic Qualification',
      field: 'companyName',
      question: "Great! What's your company name?",
      placeholder: "Enter your company name",
      validation: validateCompanyName,
      suggestions: []
    },
    {
      id: 'industry',
      phase: 2,
      phaseTitle: 'Business Context',
      field: 'industry',
      question: "What industry or business sector is your company in?",
      placeholder: "e.g., Technology, Healthcare, Finance",
      validation: validateIndustry,
      suggestions: ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Others']
    },
    {
      id: 'business-model',
      phase: 2,
      phaseTitle: 'Business Context',
      field: 'businessModel',
      question: "What type of business model best describes your company?",
      placeholder: "Select your business model",
      validation: () => ({ isValid: true }),
      suggestions: [],
      options: [
        { id: 'b2b-software', label: 'B2B Software', description: 'Software solutions for businesses' },
        { id: 'ecommerce', label: 'E-commerce', description: 'Online retail and marketplace' },
        { id: 'professional-services', label: 'Professional Services', description: 'Consulting, legal, accounting, etc.' },
        { id: 'manufacturing', label: 'Manufacturing', description: 'Physical product manufacturing' },
        { id: 'healthcare', label: 'Healthcare', description: 'Medical services and products' },
        { id: 'financial-services', label: 'Financial Services', description: 'Banking, insurance, fintech' }
      ]
    },
    {
      id: 'research-driver',
      phase: 2,
      phaseTitle: 'Business Context',
      field: 'researchDriver',
      question: "What's driving your need for research?",
      placeholder: "Select your research driver",
      validation: () => ({ isValid: true }),
      suggestions: [],
      options: [
        { id: 'new-market', label: 'New Market Entry', description: 'Exploring new markets or segments' },
        { id: 'competitive-intelligence', label: 'Competitive Intelligence', description: 'Understanding competitor strategies' },
        { id: 'product-launch', label: 'Product Launch', description: 'Supporting new product introduction' },
        { id: 'strategic-planning', label: 'Strategic Planning', description: 'Long-term business planning' },
        { id: 'investment-decision', label: 'Investment Decision', description: 'Due diligence and investment analysis' },
        { id: 'performance-benchmarking', label: 'Performance Benchmarking', description: 'Comparing against industry standards' }
      ]
    },
    {
      id: 'research-objectives',
      phase: 3,
      phaseTitle: 'Research Objectives',
      field: 'researchObjectives',
      question: "Primary research objectives (select up to 3):",
      placeholder: "Select your research objectives",
      validation: () => ({ isValid: true }),
      suggestions: [],
      isMultiSelect: true,
      maxSelections: 3,
      options: [
        { id: 'market-size', label: 'Understand market size & opportunity', description: 'Market sizing and growth potential analysis' },
        { id: 'competitor-analysis', label: 'Analyze competitor strategies & positioning', description: 'Competitive landscape and positioning' },
        { id: 'pricing-trends', label: 'Track pricing trends & dynamics', description: 'Pricing analysis and market dynamics' },
        { id: 'brand-sentiment', label: 'Monitor brand sentiment & reputation', description: 'Brand perception and reputation tracking' },
        { id: 'emerging-trends', label: 'Identify emerging trends & threats', description: 'Market trends and potential disruptions' },
        { id: 'customer-behavior', label: 'Customer behavior & preferences', description: 'Consumer insights and behavior patterns' },
        { id: 'regulatory-developments', label: 'Regulatory & industry developments', description: 'Regulatory changes and industry updates' }
      ]
    },
    {
      id: 'competitors',
      phase: 4,
      phaseTitle: 'Competitive & Market Focus',
      field: 'competitors',
      question: "Who are your top 3-5 competitors?",
      placeholder: "Enter competitor names (one per line or separated by commas)",
      validation: () => ({ isValid: true }),
      suggestions: ["Not sure? We can help identify them"]
    },
    {
      id: 'geographic-markets',
      phase: 4,
      phaseTitle: 'Competitive & Market Focus',
      field: 'geographicMarkets',
      question: "Geographic markets of interest:",
      placeholder: "Select your target markets",
      validation: () => ({ isValid: true }),
      suggestions: [],
      isMultiSelect: true,
      maxSelections: 6,
      options: [
        { id: 'north-america', label: 'North America', description: 'United States, Canada, Mexico' },
        { id: 'europe', label: 'Europe', description: 'European Union and surrounding regions' },
        { id: 'asia-pacific', label: 'Asia-Pacific', description: 'Asia and Pacific region countries' },
        { id: 'latin-america', label: 'Latin America', description: 'Central and South America' },
        { id: 'global', label: 'Global', description: 'Worldwide market coverage' },
        { id: 'other', label: 'Other', description: 'Specific regions not listed above' }
      ]
    },
    {
      id: 'update-frequency',
      phase: 5,
      phaseTitle: 'Update Preferences',
      field: 'updateFrequency',
      question: "How often do you need research updates?",
      placeholder: "Select update frequency",
      validation: () => ({ isValid: true }),
      suggestions: [],
      options: [
        { id: 'real-time', label: 'Real-time alerts for critical changes', description: 'Immediate notifications for important developments' },
        { id: 'daily', label: 'Daily summary reports', description: 'Daily digest of key market updates' },
        { id: 'weekly', label: 'Weekly comprehensive reports', description: 'Detailed weekly analysis and insights' },
        { id: 'monthly', label: 'Monthly deep-dive analysis', description: 'In-depth monthly research reports' },
        { id: 'quarterly', label: 'Quarterly strategic reviews', description: 'Comprehensive quarterly strategic analysis' }
      ]
    }
  ];

  const addMessage = useCallback((content: string, type: 'bot' | 'user', isTyping = false) => {
    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
      isTyping
    };
    setMessages(prev => [...prev, message]);
    return message.id;
  }, []);

  const updateMessage = useCallback((id: string, content: string, isTyping = false) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, content, isTyping } : msg
    ));
  }, []);

  // Updated sendVerificationEmail function with better error handling
const sendVerificationEmail = useCallback(async (email: string) => {
  try {
    console.log('Sending verification email to:', email);
    const response = await fetch(SEND_VERIFICATION_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email,
        timestamp: new Date().toISOString()
      })
    });

    // Log response details for debugging
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // Check content type
    const contentType = response.headers.get("content-type");
    console.log('Content-Type:', contentType);

    // Try to parse response
    let result;
    if (contentType && contentType.includes("application/json")) {
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Only parse if there's actual content
      if (responseText.trim()) {
        result = JSON.parse(responseText);
      } else {
        console.log('Empty response body, treating as success');
        result = { success: true };
      }
    } else {
      // Non-JSON response
      const responseText = await response.text();
      console.log('Non-JSON response:', responseText);
      // Assume success if we got a 200 status
      result = { success: true };
    }

    console.log('Verification email response:', result);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}, []);

  const verifyEmailCode = useCallback(async (email: string, code: string) => {
  try {
    console.log('Verifying email code for:', email, 'with code:', code);
    const response = await fetch(VERIFY_CODE_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email,
        code,
        timestamp: new Date().toISOString()
      })
    });

    console.log('Verification response status:', response.status);

    // Handle different HTTP status codes
    if (response.status === 400) {
      console.log('Bad request - invalid verification code');
      return false;
    } else if (!response.ok) {
      const errorText = await response.text();
      console.error('Verification HTTP error:', errorText);
      throw new Error(`Verification failed: ${response.status}`);
    }

    // Safe JSON parsing
    const contentType = response.headers.get("content-type");
    let result;
    
    if (contentType && contentType.includes("application/json")) {
      const responseText = await response.text();
      console.log('Verification response text:', responseText);
      
      if (responseText.trim()) {
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          return false;
        }
      } else {
        console.log('Empty response body - treating as failure');
        return false;
      }
    } else {
      const responseText = await response.text();
      console.log('Non-JSON verification response:', responseText);
      // For non-JSON responses, assume success if status is 200
      return response.status === 200;
    }

    console.log('Parsed verification response:', result);
    
    // More explicit success checking
    if (result.success === true || result.verified === true || (result.status && result.status === 'verified')) {
      console.log('Verification successful');
      return true;
    } else {
      console.log('Verification failed - invalid code');
      return false;
    }
  } catch (error) {
    console.error('Error verifying email code:', error);
    return false;
  }
}, []);

  const handleEmailVerification = useCallback(async (email: string) => {
    setEmailVerification(prev => ({ ...prev, isVerifying: true, verificationError: undefined }));
    
    const success = await sendVerificationEmail(email);
    
    if (success) {
      setEmailVerification(prev => ({ 
        ...prev, 
        email, 
        isVerifying: false 
      }));
      
      addMessage(
        `Perfect! I've sent a verification email to ${email}. Please check your email and either click the verification link or enter the 6-digit code below to continue.`,
        'bot'
      );
    } else {
      setEmailVerification(prev => ({ 
        ...prev, 
        isVerifying: false,
        verificationError: 'Failed to send verification email. Please try again.'
      }));
      
      addMessage(
        "I'm sorry, there was an issue sending the verification email. Please try again or contact support if the problem persists.",
        'bot'
      );
    }
  }, [addMessage, sendVerificationEmail]);

  const handleVerificationCodeInput = useCallback(async (code: string) => {
    if (!emailVerification.email) {
      console.error('No email found for verification');
      return;
    }
    
    console.log('Starting verification code input handling for code:', code);
    setEmailVerification(prev => ({ ...prev, isVerifying: true, verificationError: undefined }));
    
    try {
      console.log('Calling verifyEmailCode...');
      const isValid = await verifyEmailCode(emailVerification.email, code);
      console.log('Verification result:', isValid);
      
      if (isValid === true) {
        console.log('Code is valid - proceeding with success flow');
        setEmailVerification(prev => ({ ...prev, isVerified: true, isVerifying: false }));
        setClientData(prev => ({ ...prev, email: emailVerification.email }));
        
        addMessage("🎉 Excellent! Your email has been verified successfully. Let's continue with your onboarding.", 'bot');
        
        setTimeout(() => {
          setCurrentStep(1); // Move to company name step
          addMessage(onboardingSteps[1].question, 'bot');
        }, 1000);
      } else {
        console.log('Code is invalid - showing error message');
        setEmailVerification(prev => ({ 
          ...prev, 
          isVerifying: false,
          verificationError: 'The verification code you entered is incorrect or has expired. Please check your email for the correct 6-digit code and try again.'
        }));
        
        // Don't add a chat message here - let the EmailVerification component handle the error display
      }
    } catch (error) {
      console.error('Exception during verification:', error);
      setEmailVerification(prev => ({ 
        ...prev, 
        isVerifying: false,
        verificationError: 'There was a technical issue verifying your code. Please try again or request a new code.'
      }));
    }
  }, [emailVerification.email, verifyEmailCode, addMessage, onboardingSteps]);

  const handleVerificationComplete = useCallback(() => {
    setEmailVerification(prev => ({ ...prev, isVerified: true }));
    setClientData(prev => ({ ...prev, email: emailVerification.email }));
    
    addMessage("Email verified successfully! Let's continue with your onboarding.", 'bot');
    
    setTimeout(() => {
      setCurrentStep(1); // Move to company name step
      addMessage(onboardingSteps[1].question, 'bot');
    }, 1000);
  }, [emailVerification.email, addMessage, onboardingSteps]);

  const handleResendVerification = useCallback(() => {
    // Clear any existing verification errors
    setEmailVerification(prev => ({ ...prev, verificationError: undefined }));
    
    if (emailVerification.email) {
      sendVerificationEmail(emailVerification.email);
      addMessage(`Verification email resent to ${emailVerification.email}`, 'bot');
    }
  }, [emailVerification.email, sendVerificationEmail, addMessage]);

  const completeOnboarding = useCallback(async () => {
    try {
      const requiredFields = ['email', 'companyName', 'industry', 'businessModel', 'researchDriver'];
      const missingFields = requiredFields.filter(field => !clientData[field as keyof ClientData]);
      
      // commented out for now, need to fix this
      //if (missingFields.length > 0) {
        //console.error('Missing required fields:', missingFields);
        //throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      //}

      const payload = {
        email: clientData.email || '',
        companyName: clientData.companyName || '',
        industry: clientData.industry || '',
        businessModel: clientData.businessModel || '',
        businessModelOther: clientData.businessModelOther || '',
        researchDriver: clientData.researchDriver || '',
        researchObjectives: clientData.researchObjectives || [],
        competitors: clientData.competitors || [],
        geographicMarkets: clientData.geographicMarkets || [],
        keyProducts: clientData.keyProducts || '',
        updateFrequency: clientData.updateFrequency || '',
        timeline: clientData.timeline || '',
        budgetRange: clientData.budgetRange || '',
        additionalRequirements: clientData.additionalRequirements || '',
        ipAddress: clientData.ipAddress || '',
        country: clientData.country || '',
        city: clientData.city || '',
        timestamp: new Date().toISOString(),
        source: 'raas-chatbot'
      };

      console.log('Sending final data to webhook:', payload);
      const response = await fetch(FINAL_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Final webhook response:', result);

      setIsCompleted(true);
      addMessage(
        `Thank you! I've collected all the information we need. Our research team will review your comprehensive requirements and get back to you at ${clientData.email} within 24 hours with a detailed proposal tailored to your ${clientData.researchDriver} research needs.`,
        'bot'
      );
    } catch (error) {
      console.error('Error sending to webhook:', error);
      setIsCompleted(true);
      addMessage(
        `Thank you! I've collected all the information we need. Our research team will review your comprehensive requirements and get back to you at ${clientData.email} within 24 hours with a detailed proposal tailored to your research needs.`,
        'bot'
      );
    }
  }, [clientData, addMessage]);

  const moveToNextStep = useCallback(() => {
    setCurrentStep(prev => {
      const nextStep = prev + 1;
      if (nextStep < onboardingSteps.length) {
        addMessage(onboardingSteps[nextStep].question, 'bot');
        return nextStep;
      } else {
        // If we've completed all steps, trigger completion
        completeOnboarding();
        return prev;
      }
    });
  }, [addMessage, onboardingSteps, completeOnboarding]);

  const processUserInput = useCallback(async (input: string) => {
    if (isCompleted || isProcessing || !input.trim()) return;

    const trimmedInput = input.trim();
    setIsProcessing(true);
    
    // Add user message
    addMessage(trimmedInput, 'user');

    // Add typing indicator for bot response
    const typingId = addMessage('', 'bot', true);

    try {
      const currentStepData = onboardingSteps[currentStep];
      
      // Handle email verification step
      if (currentStepData.id === 'welcome' && !emailVerification.isVerified) {
        // If user has already provided email and we're waiting for verification code
        if (emailVerification.email && !emailVerification.isVerified) {
          // Check if input looks like a verification code (6 digits) or "resend"
          if (trimmedInput.toLowerCase().includes('resend') || trimmedInput.toLowerCase().includes('new code')) {
            updateMessage(typingId, `Sending a new verification code to ${emailVerification.email}...`);
            await handleEmailVerification(emailVerification.email);
            setIsProcessing(false);
            return;
          } else if (/^\d{6}$/.test(trimmedInput)) {
            // Handle 6-digit verification code
            updateMessage(typingId, "Verifying your code...");
            await handleVerificationCodeInput(trimmedInput);
            setIsProcessing(false);
            return;
          } else {
            updateMessage(typingId, "Please enter the 6-digit verification code from your email, or type 'resend' to get a new code.");
            setIsProcessing(false);
            return;
          }
        } else {
          // Handle initial email input
          const validation = validateEmail(trimmedInput);
          
          if (!validation.isValid) {
            updateMessage(typingId, validation.message || "Please provide a valid email address.");
            setIsProcessing(false);
            return;
          }

          updateMessage(typingId, "Thank you! I'm sending a verification email now...");
          await handleEmailVerification(validation.extractedValue as string);
          setIsProcessing(false);
          return;
        }
      }

      // Handle steps with options (single/multi select) - these should use the UI components
      if (currentStepData.options && currentStepData.options.length > 0) {
        updateMessage(typingId, "Please use the options above to make your selection.");
        setIsProcessing(false);
        return;
      }

      // Handle other steps
      const validation = currentStepData.validation(trimmedInput);
      
      if (!validation.isValid) {
        updateMessage(typingId, validation.message || "I didn't quite understand that. Could you please try again?");
        setIsProcessing(false);
        return;
      }

      // Update client data
      const extractedValue = validation.extractedValue || trimmedInput;
      setClientData(prev => ({ 
        ...prev, 
        [currentStepData.field]: extractedValue
      }));

      // Generate AI response
      const aiResponse = await anthropicService.generateResponse(
        trimmedInput, 
        `User provided: ${extractedValue} for ${currentStepData.field}. Current step: ${currentStep + 1}/${onboardingSteps.length}`,
        currentStepData.id
      );
      
      updateMessage(typingId, aiResponse);

      // Move to next step or complete
      setTimeout(() => {
        moveToNextStep();
      }, 1500);

    } catch (error) {
      console.error('Error processing input:', error);
      updateMessage(typingId, "I apologize, but I encountered an error. Please try again.");
    }

    setIsProcessing(false);
  }, [currentStep, isCompleted, isProcessing, emailVerification.isVerified, addMessage, updateMessage, anthropicService, onboardingSteps, handleEmailVerification, moveToNextStep]);

  const handleSingleSelect = useCallback((stepId: string, selectedId: string) => {
    const currentStepData = onboardingSteps[currentStep];
    if (!currentStepData || currentStepData.id !== stepId) return;

    let selectedValue = selectedId;
    let displayValue = selectedId;

    // Handle "other" option
    if (selectedId.startsWith('other:')) {
      selectedValue = selectedId.substring(6); // Remove "other:" prefix
      displayValue = selectedValue;
    } else {
      // Find the option label for display
      const option = currentStepData.options?.find(opt => opt.id === selectedId);
      displayValue = option?.label || selectedId;
    }

    // Update client data
    setClientData(prev => ({ 
      ...prev, 
      [currentStepData.field]: selectedValue
    }));

    // Add user message showing selection
    addMessage(displayValue, 'user');

    // Add bot response
    const typingId = addMessage('', 'bot', true);
    
    setTimeout(async () => {
      try {
        const aiResponse = await anthropicService.generateResponse(
          displayValue, 
          `User selected: ${displayValue} for ${currentStepData.field}. Current step: ${currentStep + 1}/${onboardingSteps.length}`,
          currentStepData.id
        );
        
        updateMessage(typingId, aiResponse);

        // Move to next step
        setTimeout(() => {
          moveToNextStep();
        }, 1500);
      } catch (error) {
        console.error('Error generating AI response:', error);
        updateMessage(typingId, "Thank you for your selection! Let's continue.");
        
        setTimeout(() => {
          moveToNextStep();
        }, 1000);
      }
    }, 500);
  }, [currentStep, onboardingSteps, addMessage, updateMessage, anthropicService, moveToNextStep]);

  const handleMultiSelect = useCallback((stepId: string, selectedIds: string[]) => {
    const currentStepData = onboardingSteps[currentStep];
    if (!currentStepData || currentStepData.id !== stepId) return;

    // Get display values for selected options
    const selectedOptions = selectedIds.map(id => {
      const option = currentStepData.options?.find(opt => opt.id === id);
      return option?.label || id;
    });

    // Update client data
    setClientData(prev => ({ 
      ...prev, 
      [currentStepData.field]: selectedIds
    }));

    // Add user message showing selections
    addMessage(selectedOptions.join(', '), 'user');

    // Add bot response
    const typingId = addMessage('', 'bot', true);
    
    setTimeout(async () => {
      try {
        const aiResponse = await anthropicService.generateResponse(
          selectedOptions.join(', '), 
          `User selected: ${selectedOptions.join(', ')} for ${currentStepData.field}. Current step: ${currentStep + 1}/${onboardingSteps.length}`,
          currentStepData.id
        );
        
        updateMessage(typingId, aiResponse);

        // Move to next step
        setTimeout(() => {
          moveToNextStep();
        }, 1500);
      } catch (error) {
        console.error('Error generating AI response:', error);
        updateMessage(typingId, "Thank you for your selections! Let's continue.");
        
        setTimeout(() => {
          moveToNextStep();
        }, 1000);
      }
    }, 500);
  }, [currentStep, onboardingSteps, addMessage, updateMessage, anthropicService, moveToNextStep]);

  const handleResearchTypeSelect = useCallback((type: 'market-research' | 'academic-research' | 'competitive-analysis') => {
    if (type !== 'market-research') return;
    
    setClientData(prev => ({ ...prev, researchType: type }));
    addMessage('Market Research', 'user');
    
    const typingId = addMessage('', 'bot', true);
    
    setTimeout(() => {
      updateMessage(typingId, "Perfect! Market research is our specialty. We'll help you uncover valuable insights about your market.");
      
      setTimeout(() => {
        setCurrentStep(prev => {
          const nextStep = prev + 1;
          if (nextStep < onboardingSteps.length) {
            addMessage(onboardingSteps[nextStep].question, 'bot');
            return nextStep;
          }
          return prev;
        });
      }, 1000);
    }, 500);
  }, [addMessage, updateMessage, onboardingSteps]);

  const initializeChat = useCallback(async () => {
    if (!initializationRef.current && !isInitialized) {
      initializationRef.current = true;
      
      // Capture IP and geography data
      try {
        const ipGeoData = await fetchIpGeoData();
        if (ipGeoData) {
          setClientData(prev => ({
            ...prev,
            ipAddress: ipGeoData.ip,
            country: ipGeoData.country,
            city: ipGeoData.city
          }));
          console.log('IP/Geo data captured:', {
            ip: ipGeoData.ip,
            country: ipGeoData.country,
            city: ipGeoData.city
          });
        }
      } catch (error) {
        console.error('Failed to capture IP/Geo data:', error);
        // Continue with chat initialization even if IP/Geo capture fails
      }
      
      addMessage(onboardingSteps[0].question, 'bot');
      setIsInitialized(true);
    }
  }, [isInitialized, addMessage, onboardingSteps]);

  return {
    messages,
    currentStep,
    totalSteps: onboardingSteps.length,
    clientData,
    emailVerification,
    isProcessing,
    isCompleted,
    currentStepData: onboardingSteps[currentStep],
    processUserInput,
    handleSingleSelect,
    handleMultiSelect,
    handleResearchTypeSelect,
    handleVerificationComplete,
    handleResendVerification,
    handleVerificationCodeInput,
    verifyEmailCode,
    initializeChat
  };
};
