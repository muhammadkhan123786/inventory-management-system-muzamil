import { Card, CardContent } from '@/components/form/Card';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  color: string;
  delay?: number;
  children?: ReactNode;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient, 
  color, 
  delay = 0,
  children 
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={`border-0 shadow-lg text-white ${gradient}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`${color} text-sm`}>{title}</p>
              <p className="text-3xl font-bold mt-1">{value}</p>
              <p className={`${color} text-xs mt-1`}>{subtitle}</p>
              {children}
            </div>
            <Icon className="h-12 w-12 opacity-80" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}