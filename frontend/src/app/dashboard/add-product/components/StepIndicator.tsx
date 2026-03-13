import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { CheckCircle } from 'lucide-react';
import { Step } from '../data/productData';

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="border-0 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              
              return (
                <div key={step.number} className="contents">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? `bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 shadow-lg`
                          : isCurrent
                          ? `bg-gradient-to-br from-${step.color}-400 to-${step.color}-500 shadow-xl ring-4 ring-${step.color}-200`
                          : 'bg-gray-200'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-7 w-7 text-white" />
                      ) : (
                        <StepIcon className={`h-7 w-7 ${isCurrent ? 'text-white' : 'text-gray-500'}`} />
                      )}
                    </motion.div>
                    <div className="text-center">
                      <p className={`text-xs font-semibold ${isCurrent ? `text-${step.color}-600` : 'text-gray-500'}`}>
                        Step {step.number}
                      </p>
                      <p className={`text-sm font-bold ${isCurrent ? `text-${step.color}-700` : 'text-gray-600'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 bg-gray-200 mx-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isCompleted ? '100%' : '0%' }}
                        transition={{ duration: 0.5 }}
                        className={`h-full bg-gradient-to-r from-${step.color}-400 to-${steps[index + 1].color}-400`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}