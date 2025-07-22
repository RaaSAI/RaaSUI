import React, { useState } from 'react';
import { Check } from 'lucide-react';

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Selection Counter */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {selectedOptions.length} of {maxSelections} selected
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Select up to {maxSelections}
            </div>
          </div>
        </div>

        {/* Options Grid */}
        <div className="px-6 pb-6">
          <div className="grid gap-3 mb-6">
            {options.map((option) => {
              const isSelected = selectedOptions.includes(option.id);
              const isDisabled = !isSelected && selectedOptions.length >= maxSelections;

              return (
                <div
                  key={option.id}
                  onClick={() => !isDisabled && handleOptionToggle(option.id)}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : isDisabled
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Custom Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500' 
                        : isDisabled
                        ? 'border-gray-300 bg-gray-100'
                        : 'border-gray-300 group-hover:border-gray-400'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg mb-1 ${
                        isSelected 
                          ? 'text-blue-900' 
                          : isDisabled 
                          ? 'text-gray-500' 
                          : 'text-gray-900'
                      }`}>
                        {option.label}
                      </h3>
                      {option.description && (
                        <p className={`text-sm leading-relaxed ${
                          isSelected 
                            ? 'text-blue-700' 
                            : isDisabled 
                            ? 'text-gray-400' 
                            : 'text-gray-600'
                        }`}>
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleComplete}
            disabled={selectedOptions.length === 0}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Continue with {selectedOptions.length} selection{selectedOptions.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};