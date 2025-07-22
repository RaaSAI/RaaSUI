import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  description?: string;
}

interface SingleSelectComponentProps {
  options: Option[];
  onSelectionComplete: (selectedId: string) => void;
  title: string;
  subtitle?: string;
  allowOther?: boolean;
  otherPlaceholder?: string;
}

export const SingleSelectComponent: React.FC<SingleSelectComponentProps> = ({
  options,
  onSelectionComplete,
  title = "",
  subtitle = "",
  allowOther = false,
  otherPlaceholder = "Please specify..."
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [otherValue, setOtherValue] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    if (optionId === 'other') {
      setShowOtherInput(true);
    } else {
      setShowOtherInput(false);
      setOtherValue('');
      // Auto-submit after selection
      setTimeout(() => onSelectionComplete(optionId), 300);
    }
  };

  const handleOtherSubmit = () => {
    if (otherValue.trim()) {
      onSelectionComplete(`other:${otherValue.trim()}`);
    }
  };

  const handleOtherKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOtherSubmit();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Options Grid */}
        <div className="p-6">
          <div className="grid gap-3">
            {options.map((option) => {
              const isSelected = selectedOption === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group hover:shadow-md ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Custom Radio Button */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300 group-hover:border-gray-400'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg mb-1 ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </h3>
                      {option.description && (
                        <p className={`text-sm leading-relaxed ${
                          isSelected ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {allowOther && (
              <div
                onClick={() => handleOptionSelect('other')}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group hover:shadow-md ${
                  selectedOption === 'other'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Custom Radio Button */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
                    selectedOption === 'other'
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    {selectedOption === 'other' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg mb-1 ${
                      selectedOption === 'other' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      Other
                    </h3>
                    <p className={`text-sm leading-relaxed ${
                      selectedOption === 'other' ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      Specify your own option
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Other Input */}
        {showOtherInput && (
          <div className="px-6 pb-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <input
                type="text"
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                onKeyPress={handleOtherKeyPress}
                placeholder={otherPlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                autoFocus
              />
              <button
                onClick={handleOtherSubmit}
                disabled={!otherValue.trim()}
                className="mt-3 w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};