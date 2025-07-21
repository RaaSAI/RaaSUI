import React, { useState, useEffect } from 'react';
import { Mail, Shield, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

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
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

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
      try {
        const isValid = await onCodeVerify(email, verificationCode);
        if (isValid) {
          onVerificationComplete();
        } else {
          // Handle invalid code
          setVerificationCode('');
        }
      } catch (error) {
        console.error('Error verifying code:', error);
        setVerificationCode('');
      } finally {
        setIsVerifyingCode(false);
      }
    }
  };

  const handleResend = () => {
    setTimeLeft(300);
    setIsCodeExpired(false);
    setVerificationCode('');
    // Clear any existing error when resending
    if (verificationError) {
      // The parent component will handle clearing the error
    }
    onResendVerification();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Verify Your Email
          </h3>
          <p className="text-gray-600 text-sm">
            We've sent a verification email to <strong>{email}</strong>
          </p>
        </div>

        {/* Verification Methods */}
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Enter Verification Code</span>
            </div>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-center text-lg font-mono tracking-wider ${
                verificationError 
                  ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              maxLength={6}
              disabled={isVerifyingCode || isCodeExpired}
            />
            
            {/* Show error message directly under the input */}
            {verificationError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{verificationError}</span>
                </div>
              </div>
            )}
            
            <button
              onClick={handleCodeSubmit}
              disabled={verificationCode.length !== 6 || isVerifyingCode || isCodeExpired}
              className={`w-full mt-3 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 ${
                verificationError
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-300'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300'
              } text-white`}
            >
              {isVerifyingCode ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {verificationError ? 'Try Again' : 'Verify Code'}
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-gray-500 text-sm">or</span>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Check Your Email</span>
            </div>
            <p className="text-green-700 text-sm">
              Click the verification link in your email to complete the process instantly.
            </p>
          </div>
        </div>

        {/* Timer and Resend */}
        <div className="border-t border-gray-200 pt-4">
          {!isCodeExpired ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
              <Clock className="w-4 h-4" />
              <span>Code expires in {formatTime(timeLeft)}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-red-600 mb-3">
              <AlertCircle className="w-4 h-4" />
              <span>Verification code has expired</span>
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={!isCodeExpired && timeLeft > 240} // Allow resend after 1 minute
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors duration-200 ${
              verificationError
                ? 'text-red-600 border-red-600 hover:bg-red-50 focus:ring-red-500 disabled:text-gray-400 disabled:border-gray-300'
                : 'text-blue-600 border-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:text-gray-400 disabled:border-gray-300'
            }`}
          >
            {isCodeExpired || verificationError ? 'Send New Code' : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};