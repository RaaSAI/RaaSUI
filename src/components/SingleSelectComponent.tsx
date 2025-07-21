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
  title,
  subtitle,
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
      onSelectionComplete(optionId);
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
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {option.label}
                  </h4>
                  {option.description && (
                    <p className={`text-sm mt-1 ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {allowOther && (
          <button
            onClick={() => handleOptionSelect('other')}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              selectedOption === 'other'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                selectedOption === 'other'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedOption === 'other' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${
                  selectedOption === 'other' ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  Other
                </h4>
                <p className={`text-sm mt-1 ${
                  selectedOption === 'other' ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  Specify your own option
                </p>
              </div>
            </div>
          </button>
        )}

        {showOtherInput && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="text"
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              onKeyPress={handleOtherKeyPress}
              placeholder={otherPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              onClick={handleOtherSubmit}
              disabled={!otherValue.trim()}
              className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};