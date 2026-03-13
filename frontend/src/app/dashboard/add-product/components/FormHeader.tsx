import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { Button } from '@/components/form/CustomButton';
import Link from 'next/link'
import { Package, X } from 'lucide-react';

interface FormHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}

export function FormHeader({ currentStep, totalSteps, stepTitle }: FormHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
      <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/30"
              >
                <Package className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                  Add New Product
                </h1>
                <p className="text-white/90 mt-1 text-lg">Step {currentStep} of {totalSteps}: {stepTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                asChild
                variant="outline"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Link href="/dashboard/product">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}