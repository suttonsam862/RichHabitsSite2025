import React from 'react';
import { cn } from '@/lib/utils';

export type RegistrationStep = 'form' | 'processing' | 'checkout' | 'complete';

interface RegistrationProgressProps {
  currentStep: RegistrationStep;
  className?: string;
}

export function RegistrationProgress({
  currentStep,
  className,
}: RegistrationProgressProps) {
  // Define steps
  const steps = [
    { id: 'form', name: 'Registration Form' },
    { id: 'processing', name: 'Processing' },
    { id: 'checkout', name: 'Payment' },
    { id: 'complete', name: 'Confirmation' },
  ];

  return (
    <div className={cn('', className)}>
      <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 sm:text-base">
        {steps.map((step, index) => {
          // Calculate status based on currentStep
          const isActive = step.id === currentStep;
          const isComplete = (
            (currentStep === 'processing' && step.id === 'form') ||
            (currentStep === 'checkout' && ['form', 'processing'].includes(step.id)) ||
            (currentStep === 'complete')
          );
          
          return (
            <li 
              key={step.id} 
              className={cn(
                'flex items-center',
                index < steps.length - 1 ? 'md:w-full sm:after:content-[""] after:w-full after:h-1 after:border-b after:border-gray-200 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10' : ''
              )}
            >
              <span className="flex items-center">
                <span 
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
                    isComplete ? 'bg-primary text-white' : 
                    isActive ? 'bg-primary/10 text-primary border border-primary' : 
                    'bg-gray-100 border border-gray-200'
                  )}
                >
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>
                <span 
                  className={cn(
                    'hidden sm:inline-block ml-2',
                    isActive ? 'text-primary font-semibold' :
                    isComplete ? 'text-primary' : ''
                  )}
                >
                  {step.name}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
