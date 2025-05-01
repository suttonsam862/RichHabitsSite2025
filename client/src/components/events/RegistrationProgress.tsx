import React from 'react';

export type Step = 'form' | 'processing' | 'checkout' | 'complete';

interface RegistrationProgressProps {
  currentStep: Step;
}

export const RegistrationProgress: React.FC<RegistrationProgressProps> = ({ currentStep }) => {
  const steps: { key: Step; label: string }[] = [
    { key: 'form', label: 'Registration Form' },
    { key: 'processing', label: 'Processing' },
    { key: 'checkout', label: 'Payment' },
    { key: 'complete', label: 'Complete' },
  ];

  const getStepStatus = (step: Step) => {
    if (step === currentStep) return 'current';
    
    const currentIndex = steps.findIndex((s) => s.key === currentStep);
    const stepIndex = steps.findIndex((s) => s.key === step);
    
    return stepIndex < currentIndex ? 'complete' : 'upcoming';
  };

  return (
    <div className="flex items-center justify-center max-w-3xl mx-auto">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);
          const isLast = index === steps.length - 1;
          
          return (
            <li key={step.key} className={`flex items-center ${isLast ? 'w-auto' : 'w-full'}`}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${status === 'complete' ? 'bg-primary text-white' : ''}
                    ${status === 'current' ? 'bg-primary text-white ring-4 ring-primary/30' : ''}
                    ${status === 'upcoming' ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {status === 'complete' ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`
                    hidden sm:block text-xs font-medium mt-1
                    ${status === 'complete' ? 'text-primary' : ''}
                    ${status === 'current' ? 'text-primary font-semibold' : ''}
                    ${status === 'upcoming' ? 'text-gray-500' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>
              
              {!isLast && (
                <div
                  className={`
                    w-full h-0.5 mx-2
                    ${status === 'upcoming' ? 'bg-gray-200' : 'bg-primary'}
                  `}
                ></div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
