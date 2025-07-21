import { useState, useCallback, useRef } from 'react';
import { ChatMessage, ClientData, OnboardingStep, EmailVerificationState } from '../types';
import { AnthropicService } from '../utils/anthropic';
import { NLPProcessor } from '../utils/nlp';
import { validateEmail, validateCompanyName, validateIndustry, validateResearchTopic } from '../utils/validation';
import { fetchIpGeoData } from '../utils/ipGeo';

// n8n webhook URLs
const SEND_VERIFICATION_WEBHOOK = 'https://shajobland.app.n8n.cloud/webhook/send-verification-email';
const VERIFY_CODE_WEBHOOK = 'https://shajobland.app.n8n.cloud/webhook/verify-email';
const FINAL_WEBHOOK_URL = 'https://shajobland.app.n8n.cloud/webhook/client-onboarding';

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
      field: 'email',
      question: "Welcome to our Research as a Service platform! We help businesses get valuable insights through professional research. To get started, please provide your email address.",
      placeholder: "Enter your email address",
      validation: validateEmail,
      suggestions: []
    },
    {
      id: 'company-name',
      field: 'companyName',
      question: "Great! What's your company name?",
      placeholder: "Enter your company name",
      validation: validateCompanyName,
      suggestions: []
    },
    {
      id: 'industry',
      field: 'industry',
      question: "What industry or business sector is your company in?",
      placeholder: "e.g., Technology, Healthcare, Finance",
      validation: validateIndustry,
      suggestions: ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Others']
    },
    {
      id: 'research-type',
      field: 'researchType',
      question: "What type of research are you looking for?",
      placeholder: "",
      validation: () => ({ isValid: true }),
      suggestions: []
    },
    {
      id: 'research-topic',
      field: 'researchTopic',
      question: "Tell me about your research topic. What specific insights are you looking for?",
      placeholder: "Describe your research needs in detail",
      validation: validateResearchTopic,
      suggestions: [
        'Market size and growth potential',
        'Customer behavior analysis',
        'Industry trends and forecasts',
        'Product market fit research', 
        'Others'
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Verification HTTP error:', errorText);
      return false;
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
      return false;
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
          verificationError: 'Invalid verification code. Please check your email and try again.'
        }));
        
        addMessage(
          "❌ The verification code you entered is incorrect or has expired. Please check your email for the correct 6-digit code and try again. If you need a new code, type 'resend'!",
          'bot'
        );
      }
    } catch (error) {
      console.error('Exception during verification:', error);
      setEmailVerification(prev => ({ 
        ...prev, 
        isVerifying: false,
        verificationError: 'Verification failed. Please try again.'
      }));
      
      addMessage(
        "⚠️ There was an issue verifying your code. Please try again or type 'resend' to get a new verification email.",
        'bot'
      );
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
    if (emailVerification.email) {
      sendVerificationEmail(emailVerification.email);
      addMessage(`Verification email resent to ${emailVerification.email}`, 'bot');
    }
  }, [emailVerification.email, sendVerificationEmail, addMessage]);

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
          await handleEmailVerification(validation.extractedValue!);
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
  }, [currentStep, isCompleted, isProcessing, emailVerification.isVerified, addMessage, updateMessage, anthropicService, onboardingSteps, handleEmailVerification]);

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
    handleResearchTypeSelect,
    handleVerificationComplete,
    handleResendVerification,
    handleVerificationCodeInput,
    verifyEmailCode,
    initializeChat
  };
};