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
  const steps = [
    { id: 'form', name: 'Registration Form' },
    { id: 'processing', name: 'Processing' },
    { id: 'checkout', name: 'Payment' },
    { id: 'complete', name: 'Complete' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className={cn('w-full py-4', className)}>
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className="md:flex-1">
              <div
                className={cn(
                  'flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4',
                  stepIdx <= currentStepIndex
                    ? 'border-primary'
                    : 'border-gray-200'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-medium',
                    stepIdx <= currentStepIndex
                      ? 'text-primary'
                      : 'text-gray-500'
                  )}
                >
                  {step.name}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
