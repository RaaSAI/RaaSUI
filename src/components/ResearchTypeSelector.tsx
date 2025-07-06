import React from 'react';
import { TrendingUp, GraduationCap, Target, Lock } from 'lucide-react';

interface ResearchTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (type: 'market-research' | 'academic-research' | 'competitive-analysis') => void;
}

export const ResearchTypeSelector: React.FC<ResearchTypeSelectorProps> = ({
  selectedType,
  onTypeSelect
}) => {
  const researchTypes = [
    {
      id: 'market-research',
      name: 'Market Research',
      description: 'Consumer insights, market trends, and opportunity analysis',
      icon: TrendingUp,
      available: true
    },
    {
      id: 'academic-research',
      name: 'Academic Research',
      description: 'Scholarly research and literature reviews',
      icon: GraduationCap,
      available: false
    },
    {
      id: 'competitive-analysis',
      name: 'Competitive Analysis',
      description: 'Competitor insights and market positioning',
      icon: Target,
      available: false
    }
  ];

  return (
    <div className="space-y-3">
      {researchTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => type.available && onTypeSelect(type.id as any)}
          disabled={!type.available}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
            selectedType === type.id
              ? 'border-blue-500 bg-blue-50'
              : type.available
              ? 'border-gray-200 hover:border-gray-300 bg-white'
              : 'border-gray-100 bg-gray-50 cursor-not-allowed'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              selectedType === type.id
                ? 'bg-blue-100 text-blue-600'
                : type.available
                ? 'bg-gray-100 text-gray-600'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {type.available ? (
                <type.icon className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-medium ${
                type.available ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {type.name}
                {!type.available && (
                  <span className="ml-2 text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                )}
              </h3>
              <p className={`text-sm mt-1 ${
                type.available ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {type.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};