import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X, 
  Palette, 
  Coffee, 
  Car, 
  Home, 
  Zap, 
  Heart, 
  Film, 
  ShoppingBag, 
  BookOpen, 
  Plane,
  Wallet,
  Laptop,
  TrendingUp,
  Building,
  Gift,
  Gamepad2,
  Music,
  Dumbbell,
  PiggyBank
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCategories } from '../../hooks/useCategories';
import clsx from 'clsx';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Name too long'),
  type: z.enum(['income', 'expense']),
  color: z.string().min(1, 'Please select a color'),
  icon: z.string().min(1, 'Please select an icon'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: any;
}

const COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
  '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#C026D3', '#DB2777', '#E11D48', '#DC2626'
];

const ICONS = [
  { name: 'Coffee', icon: Coffee, category: 'expense' },
  { name: 'Car', icon: Car, category: 'expense' },
  { name: 'Home', icon: Home, category: 'expense' },
  { name: 'Zap', icon: Zap, category: 'expense' },
  { name: 'Heart', icon: Heart, category: 'expense' },
  { name: 'Film', icon: Film, category: 'expense' },
  { name: 'ShoppingBag', icon: ShoppingBag, category: 'expense' },
  { name: 'BookOpen', icon: BookOpen, category: 'expense' },
  { name: 'Plane', icon: Plane, category: 'expense' },
  { name: 'Gamepad2', icon: Gamepad2, category: 'expense' },
  { name: 'Music', icon: Music, category: 'expense' },
  { name: 'Dumbbell', icon: Dumbbell, category: 'expense' },
  { name: 'Wallet', icon: Wallet, category: 'income' },
  { name: 'Laptop', icon: Laptop, category: 'income' },
  { name: 'TrendingUp', icon: TrendingUp, category: 'income' },
  { name: 'Building', icon: Building, category: 'income' },
  { name: 'Gift', icon: Gift, category: 'income' },
  { name: 'PiggyBank', icon: PiggyBank, category: 'income' }
];

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category
}) => {
  const { user } = useAuth();
  const { addCategory, updateCategory } = useCategories(user?.id || '');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type: 'expense',
      color: COLORS[0],
      icon: 'Coffee'
    }
  });

  const watchedType = watch('type');
  const watchedColor = watch('color');
  const watchedIcon = watch('icon');

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon
      });
    } else {
      reset({
        type: 'expense',
        color: COLORS[0],
        icon: 'Coffee'
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      if (category) {
        await updateCategory(category.id, data);
      } else {
        await addCategory(data);
      }
      onClose();
      reset();
    } catch (error) {
      console.error('Category error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIcons = ICONS.filter(iconItem => 
    iconItem.category === watchedType || iconItem.name === 'PiggyBank'
  );

  const SelectedIcon = ICONS.find(i => i.name === watchedIcon)?.icon || Coffee;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {category ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className={clsx(
                    'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                    errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  )}
                  placeholder="Enter category name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Type
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setValue('type', 'expense')}
                    className={clsx(
                      'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                      watchedType === 'expense'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('type', 'income')}
                    className={clsx(
                      'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                      watchedType === 'income'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Palette className="w-4 h-4 inline mr-2" />
                  Color
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('color', color)}
                      className={clsx(
                        'w-10 h-10 rounded-lg border-2 transition-all duration-200',
                        watchedColor === color
                          ? 'border-gray-400 scale-110 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Icon Preview
                </label>
                <div className="flex items-center space-x-4 mb-4">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: watchedColor }}
                  >
                    <SelectedIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{watch('name') || 'Category Name'}</p>
                    <p className="text-sm text-gray-500 capitalize">{watchedType}</p>
                  </div>
                </div>
                
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Icon
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                  {filteredIcons.map((iconItem) => {
                    const IconComponent = iconItem.icon;
                    return (
                      <button
                        key={iconItem.name}
                        type="button"
                        onClick={() => setValue('icon', iconItem.name)}
                        className={clsx(
                          'p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center',
                          watchedIcon === iconItem.name
                            ? 'border-blue-500 bg-blue-50 scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        )}
                      >
                        <IconComponent className="w-5 h-5 text-gray-600" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : (category ? 'Update' : 'Add Category')}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CategoryModal;