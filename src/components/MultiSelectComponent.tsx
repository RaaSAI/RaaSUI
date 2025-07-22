import React, { useState } from 'react';

interface Option {
  id: string;
  label: string;
  description?: string;
}

interface MultiSelectComponentProps {
  options: Option[];
  maxSelections?: number;
  onSelectionComplete: (selectedIds: string[]) => void;
  title: string;
  subtitle?: string;
}

export const MultiSelectComponent: React.FC<MultiSelectComponentProps> = ({
  options,
  maxSelections = 3,
  onSelectionComplete,
  title,
  subtitle
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else if (prev.length < maxSelections) {
        return [...prev, optionId];
      }
      return prev;
    });
  };

  const handleComplete = () => {
    if (selectedOptions.length > 0) {
      onSelectionComplete(selectedOptions);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mb-2">{subtitle}</p>}
          <p className="text-sm text-blue-600">
            Select up to {maxSelections} options ({selectedOptions.length}/{maxSelections} selected)
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {options.map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            const isDisabled = !isSelected && selectedOptions.length >= maxSelections;

            return (
              <label
                key={option.id}
                className={`block p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleOptionToggle(option.id)}
                    disabled={isDisabled}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
        </div>

        {/* Continue Button */}
        <button
          onClick={handleComplete}
          disabled={selectedOptions.length === 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Continue with {selectedOptions.length} selection{selectedOptions.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};