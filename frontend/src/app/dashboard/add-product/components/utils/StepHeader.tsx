import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StepCardProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  bgGradient: string;
  borderGradient: string;
}

export function StepHeader({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  gradient, 
  bgGradient, 
  borderGradient 
}: StepCardProps) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className={`absolute inset-0 ${borderGradient.replace('border-', 'bg-')} rounded-2xl blur-xl opacity-20 -z-10`}></div>
      <Card className={`border-0 shadow-2xl overflow-hidden ${bgGradient}`}>
        <div className={`h-2 ${borderGradient}`}></div>
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              whileHover={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
            >
              <Icon className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {title}
              </h2>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </div>
         
        </CardContent>
      </Card>
    </motion.div>
  );
}