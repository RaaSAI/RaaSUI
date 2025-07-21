import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

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
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        <p className="text-sm text-blue-600 mt-2">
          Select up to {maxSelections} options ({selectedOptions.length}/{maxSelections} selected)
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          const isDisabled = !isSelected && selectedOptions.length >= maxSelections;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionToggle(option.id)}
              disabled={isDisabled}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
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
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleComplete}
          disabled={selectedOptions.length === 0}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Continue with {selectedOptions.length} selection{selectedOptions.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};