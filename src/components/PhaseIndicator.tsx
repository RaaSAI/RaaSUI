import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface PhaseIndicatorProps {
  currentPhase: number;
  totalPhases: number;
  phases: Array<{
    number: number;
    title: string;
    description: string;
  }>;
}

export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  currentPhase,
  totalPhases,
  phases
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Phase {currentPhase} of {totalPhases}
            </h2>
            <p className="text-sm text-gray-600">
              {phases.find(p => p.number === currentPhase)?.title}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {Math.round((currentPhase / totalPhases) * 100)}% Complete
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentPhase / totalPhases) * 100}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {phases.map((phase) => (
            <div key={phase.number} className="flex items-center gap-2">
              {phase.number < currentPhase ? (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : phase.number === currentPhase ? (
                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <div className={`text-xs font-medium ${
                  phase.number < currentPhase 
                    ? 'text-green-600' 
                    : phase.number === currentPhase 
                    ? 'text-blue-600' 
                    : 'text-gray-400'
                }`}>
                  Phase {phase.number}
                </div>
                <div className={`text-xs truncate ${
                  phase.number < currentPhase 
                    ? 'text-green-500' 
                    : phase.number === currentPhase 
                    ? 'text-blue-500' 
                    : 'text-gray-400'
                }`}>
                  {phase.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};