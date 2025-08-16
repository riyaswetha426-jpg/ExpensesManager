import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient: string;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  gradient,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', gradient)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={clsx(
          'text-sm font-medium px-2 py-1 rounded-full',
          changeType === 'positive' && 'text-emerald-700 bg-emerald-100',
          changeType === 'negative' && 'text-red-700 bg-red-100',
          changeType === 'neutral' && 'text-gray-700 bg-gray-100'
        )}>
          {change}
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;