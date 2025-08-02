import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { EmailVerification } from './components/EmailVerification';
import { SingleSelectComponent } from './components/SingleSelectComponent';
import { MultiSelectComponent } from './components/MultiSelectComponent';
import { PhaseIndicator } from './components/PhaseIndicator';
import { useChatbot } from './hooks/useChatbot';
import { Brain, MessageSquare } from 'lucide-react';

function App() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    clientData,
    emailVerification,
    isProcessing,
    isCompleted,
    currentStepData,
    processUserInput,
    handleSingleSelect,
    handleMultiSelect,
    handleVerificationComplete,
    handleResendVerification,
    verifyEmailCode,
    initializeChat
  } = useChatbot();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showEmailVerification = emailVerification.email && !emailVerification.isVerified;
  const showSingleSelect = currentStepData?.options && !currentStepData?.isMultiSelect && emailVerification.isVerified;
  const showMultiSelect = currentStepData?.isMultiSelect && emailVerification.isVerified;
  const showChatInput = !isCompleted && !showEmailVerification && !showSingleSelect && !showMultiSelect;

  // Phase configuration
  const phases = [
    { number: 1, title: 'Basic Qualification', description: 'Email and company details' },
    { number: 2, title: 'Business Context', description: 'Industry and business model' },
    { number: 3, title: 'Research Objectives', description: 'Primary research goals' },
    { number: 4, title: 'Competitive & Market Focus', description: 'Competitors and geography' },
    { number: 5, title: 'Update Preferences', description: 'Frequency and timeline' }
  ];

  const currentPhase = currentStepData?.phase || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Research as a Service</h1>
              <p className="text-sm text-gray-600">AI-Powered Research Onboarding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Indicator */}
      {emailVerification.isVerified && !isCompleted && (
        <PhaseIndicator
          currentPhase={currentPhase}
          totalPhases={5}
          phases={phases}
        />
      )}

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col h-[calc(100vh-120px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Starting your research journey...</p>
              </div>
            )}
            
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Email Verification Component */}
            {showEmailVerification && !isCompleted && (
              <div className="max-w-[80%] mx-auto">
                <EmailVerification
                  email={emailVerification.email}
                  onVerificationComplete={handleVerificationComplete}
                  onResendVerification={handleResendVerification}
                  isVerifying={emailVerification.isVerifying}
                  verificationError={emailVerification.verificationError}
                  onCodeVerify={verifyEmailCode}
                />
              </div>
            )}

            {/* Single Select Component */}
            {showSingleSelect && !isCompleted && (
              <div className="max-w-[80%] mx-auto">
                <SingleSelectComponent
                  options={currentStepData.options || []}
                  onSelectionComplete={(selectedId) => handleSingleSelect(currentStepData.id, selectedId)}
                  title={currentStepData.question}
                  allowOther={currentStepData.id === 'business-model'}
                  otherPlaceholder="Please specify your business model"
                />
              </div>
            )}

            {/* Multi Select Component */}
            {showMultiSelect && !isCompleted && (
              <div className="max-w-[80%] mx-auto">
                <MultiSelectComponent
                  options={currentStepData.options || []}
                  maxSelections={currentStepData.maxSelections || 3}
                  onSelectionComplete={(selectedIds) => handleMultiSelect(currentStepData.id, selectedIds)}
                  title={currentStepData.question}
                  subtitle={`Select up to ${currentStepData.maxSelections || 3} options that best describe your research objectives.`}
                />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {showChatInput && !isCompleted && (
            <ChatInput
              onSendMessage={processUserInput}
              disabled={isProcessing}
              placeholder={currentStepData?.placeholder || "Type your message..."}
              suggestions={currentStepData?.suggestions || []}
            />
          )}

          {/* Completion Message */}
          {isCompleted && (
            <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center z-50">
              <div className="max-w-2xl mx-auto p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                
                <div className="mb-6">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    🎉 Onboarding Complete!
                  </h1>
                  <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto rounded-full mb-6"></div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Thank you, {clientData.companyName || 'valued client'}!
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg">
                      We've successfully received your research requirements and are excited to help you unlock valuable market insights.
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                      <h3 className="font-semibold text-gray-800 mb-2">What happens next:</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          Our research team will review your requirements within 24 hours
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          We'll prepare a customized research proposal for your {clientData.industry || 'industry'} needs
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          You'll receive a detailed proposal and timeline at <strong>{clientData.email}</strong>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          Our team will schedule a consultation call to discuss your project
                        </li>
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Contact Information:</strong> {clientData.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Reference ID:</strong> RaaS-{Date.now().toString().slice(-6)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Questions? Contact our team at <a href="mailto:support@raas.ai" className="text-blue-600 hover:underline">support@raas.ai</a>
                  </p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                  >
                    Start New Onboarding
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
