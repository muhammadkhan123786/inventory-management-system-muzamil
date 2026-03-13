import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Button } from '@/components/form/CustomButton';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
 onNext: (e: React.MouseEvent<HTMLButtonElement>) => void;
 
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between items-center gap-4 pt-6">
      <Button
        type="button"
        onClick={onPrev}
        disabled={currentStep === 1}
        variant="outline"
        className="border-2 border-gray-300 disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-12 rounded-full transition-all ${
              index + 1 === currentStep
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : index + 1 < currentStep
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {currentStep < totalSteps ? (
        <Button
          type="button"
          onClick={onNext}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button
       
          type="submit"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Product
        </Button>
      )}
    </div>
  );
}