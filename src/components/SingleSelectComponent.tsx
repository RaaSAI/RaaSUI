import React, { useState } from 'react';

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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = selectedOption === option.id;

            return (
              <label
                key={option.id}
                className={`block p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:border-gray-300 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="single-select"
                    value={option.id}
                    checked={isSelected}
                    onChange={() => handleOptionSelect(option.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className={`font-medium ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </div>
                    {option.description && (
                      <div className={`text-sm mt-1 ${
                        isSelected ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </label>
            );
          })}

          {allowOther && (
            <label
              className={`block p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:border-gray-300 ${
                selectedOption === 'other'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="single-select"
                  value="other"
                  checked={selectedOption === 'other'}
                  onChange={() => handleOptionSelect('other')}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className={`font-medium ${
                    selectedOption === 'other' ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    Other
                  </div>
                  <div className={`text-sm mt-1 ${
                    selectedOption === 'other' ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    Specify your own option
                  </div>
                </div>
              </div>
            </label>
          )}
        </div>

        {/* Other Input */}
        {showOtherInput && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <input
              type="text"
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              onKeyPress={handleOtherKeyPress}
              placeholder={otherPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              onClick={handleOtherSubmit}
              disabled={!otherValue.trim()}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};