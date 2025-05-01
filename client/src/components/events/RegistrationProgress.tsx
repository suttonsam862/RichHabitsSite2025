import React from 'react';
import { ChevronRight, Check } from 'lucide-react';

type Step = 'register' | 'checkout' | 'complete';

interface RegistrationProgressProps {
  currentStep: Step;
}

export const RegistrationProgress: React.FC<RegistrationProgressProps> = ({ currentStep }) => {
  const steps: { key: Step; label: string }[] = [
    { key: 'register', label: 'Registration' },
    { key: 'checkout', label: 'Payment' },
    { key: 'complete', label: 'Confirmation' },
  ];

  const getStepStatus = (step: Step) => {
    if (currentStep === 'complete') {
      // If we're at the complete step, all previous steps are complete
      return 'complete';
    }
    if (currentStep === 'checkout' && step === 'register') {
      // If we're at checkout, registration is complete
      return 'complete';
    }
    if (currentStep === step) {
      return 'current';
    }
    return 'incomplete';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${getStepStatus(step.key) === 'complete' 
                  ? 'bg-primary text-white' 
                  : getStepStatus(step.key) === 'current'
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-gray-200 text-gray-500'}`}
              >
                {getStepStatus(step.key) === 'complete' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="mt-2 text-sm font-medium text-gray-600">{step.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div className="w-16 h-[1px] bg-gray-300 flex-1 mx-2">
                <div
                  className={`h-full ${getStepStatus(step.key) === 'complete' ? 'bg-primary' : 'bg-transparent'}`}
                  style={{ width: getStepStatus(step.key) === 'complete' ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
