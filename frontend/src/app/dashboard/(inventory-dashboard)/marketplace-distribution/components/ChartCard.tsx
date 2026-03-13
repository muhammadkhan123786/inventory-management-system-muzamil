import { Card, CardContent, CardHeader, CardTitle } from '@/components/form/Card';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  gradient: string;
  delay?: number;
  children: ReactNode;
}

export function ChartCard({ 
  title, 
  icon: Icon, 
  iconColor, 
  gradient, 
  delay = 0,
  children 
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <div className={`h-1 ${gradient}`} />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {children}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}