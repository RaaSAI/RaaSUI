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
    { number: 3, title: 'Research Scope', description: 'Objectives and drivers' },
    { number: 4, title: 'Market Focus', description: 'Competitors and geography' },
    { number: 5, title: 'Preferences', description: 'Timeline and frequency' },
    { number: 6, title: 'Budget & Expectations', description: 'Budget and requirements' }
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
      {emailVerification.isVerified && (
        <PhaseIndicator
          currentPhase={currentPhase}
          totalPhases={6}
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
            {showEmailVerification && (
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
            {showSingleSelect && (
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
            {showMultiSelect && (
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
          {showChatInput && (
            <ChatInput
              onSendMessage={processUserInput}
              disabled={isProcessing}
              placeholder={currentStepData?.placeholder || "Type your message..."}
              suggestions={currentStepData?.suggestions || []}
            />
          )}

          {/* Completion Message */}
          {isCompleted && (
            <div className="p-6 bg-green-50 border-t border-green-200">
              <div className="max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Onboarding Complete!
                </h3>
                <p className="text-green-700">
                  Thank you for choosing our research services. We'll be in touch soon with your research proposal.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;