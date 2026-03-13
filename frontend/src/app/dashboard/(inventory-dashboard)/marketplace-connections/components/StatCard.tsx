import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  textColor: string;
  borderColor: string;
  delay: number;
  iconAnimation?: 'rotate' | 'bounce' | 'pulse';
  onClick?: () => void;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconBg, 
  iconColor, 
  textColor, 
  borderColor, 
  delay,
  iconAnimation = 'bounce',
  onClick 
}: StatCardProps) {
  const iconAnimations = {
    rotate: { rotate: 360 },
    bounce: { y: [0, -5, 0] },
    pulse: { scale: [1, 1.1, 1] }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`relative bg-white rounded-2xl shadow-xl p-6 border-2 ${borderColor} overflow-hidden group cursor-pointer ${onClick ? 'hover:cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${iconBg} opacity-0 group-hover:opacity-10`}
        transition={{ duration: 0.3 }}
      />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-semibold">{title}</p>
          <motion.p 
            className={`text-4xl font-bold bg-gradient-to-r ${textColor} bg-clip-text text-transparent`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: delay + 0.1 }}
          >
            {value}
          </motion.p>
          <p className={`text-xs ${textColor.split(' ')[2]} mt-1 font-medium`}>{subtitle}</p>
        </div>
        <motion.div 
          className={`h-16 w-16 bg-gradient-to-br ${iconBg} rounded-2xl flex items-center justify-center shadow-lg ${iconColor}`}
          animate={iconAnimations[iconAnimation]}
          transition={{ repeat: Infinity, duration: iconAnimation === 'rotate' ? 4 : 2 }}
        >
          <Icon className="h-8 w-8 text-white" />
        </motion.div>
      </div>
      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${iconBg}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.2 }}
      />
    </motion.div>
  );
}