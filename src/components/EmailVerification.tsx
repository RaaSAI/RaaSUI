import React, { useState, useEffect } from 'react';
import { Mail, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerificationComplete: () => void;
  onResendVerification: () => void;
  isVerifying: boolean;
  verificationError?: string;
  onCodeVerify: (email: string, code: string) => Promise<boolean>;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerificationComplete,
  onResendVerification,
  isVerifying,
  verificationError,
  onCodeVerify
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [localError, setLocalError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // Clear local error when user starts typing
  const handleCodeChange = (value: string) => {
    setVerificationCode(value);
    if (localError) setLocalError('');
    if (verificationError) setLocalError(''); // Clear any existing errors
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCodeExpired(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeSubmit = async () => {
    if (verificationCode.trim().length === 6) {
      setIsVerifyingCode(true);
      setLocalError('');
      try {
        const isValid = await onCodeVerify(email, verificationCode);
        if (isValid) {
          onVerificationComplete();
        } else {
          setLocalError('Invalid verification code. Please check your email and try again.');
          setVerificationCode('');
        }
      } catch (error) {
        console.error('Error verifying code:', error);
        setLocalError('Something went wrong. Please try again.');
        setVerificationCode('');
      } finally {
        setIsVerifyingCode(false);
      }
    }
  };

  const displayError = localError || verificationError;

  const handleResend = () => {
    setTimeLeft(300);
    setIsCodeExpired(false);
    setVerificationCode('');
    onResendVerification();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Check your email
          </h3>
          <p className="text-sm text-gray-600">
            We sent a code to <strong>{email}</strong>
          </p>
        </div>

        {/* Verification Code Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => handleCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className={`w-full px-3 py-2 border rounded-md text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:border-transparent ${
                displayError 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              maxLength={6}
              disabled={isVerifyingCode || isCodeExpired}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && verificationCode.length === 6) {
                  handleCodeSubmit();
                }
              }}
            />
            
            {displayError && (
              <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{displayError}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleCodeSubmit}
            disabled={verificationCode.length !== 6 || isVerifyingCode || isCodeExpired}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isVerifyingCode ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>
        </div>

        {/* Timer and Resend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            {!isCodeExpired ? (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                <Clock className="w-4 h-4" />
                <span>Code expires in {formatTime(timeLeft)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-red-600 mb-3">
                <AlertCircle className="w-4 h-4" />
                <span>Code expired</span>
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={!isCodeExpired && timeLeft > 240}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isCodeExpired || verificationError ? 'Send new code' : 'Resend code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};