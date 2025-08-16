import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, DollarSign, Tag, FileText, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import CategoryModal from '../Categories/CategoryModal';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.string().min(1, 'Please select a category'),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  date: z.string(),
  paymentMethod: z.string().min(1, 'Please select a payment method'),
  tags: z.array(z.string()).default([]),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense';
  transaction?: any;
}

const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Online Payment',
  'PayPal',
  'Cryptocurrency',
  'Other'
];

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
  transaction
}) => {
  const { user } = useAuth();
  const { addTransaction, updateTransaction } = useTransactions(user?.id || '');
  const { categories } = useCategories(user?.id || '');
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialType,
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'Online Payment',
      tags: []
    }
  });

  const watchedType = watch('type');

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        amount: transaction.amount,
        categoryId: transaction.categoryId,
        description: transaction.description,
        date: format(transaction.date.toDate(), 'yyyy-MM-dd'),
        paymentMethod: transaction.paymentMethod,
        tags: transaction.tags || []
      });
    } else {
      reset({
        type: initialType,
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'Online Payment',
        tags: []
      });
    }
  }, [transaction, initialType, reset]);

  const onSubmit = async (data: TransactionFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const transactionData = {
        ...data,
        date: Timestamp.fromDate(new Date(data.date)),
        tags: data.tags || []
      };

      if (transaction) {
        await updateTransaction(transaction.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }

      onClose();
      reset();
    } catch (error) {
      console.error('Transaction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === watchedType);

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
                {transaction ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                placeholder="₹0.00"
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
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

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('amount', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    id="amount"
                    className={clsx(
                      'w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                      errors.amount ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    )}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    {...register('categoryId')}
                    id="categoryId"
                    className={clsx(
                      'w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none',
                      errors.categoryId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    )}
                  >
                    <option value="">Select a category</option>
                    {filteredCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add New Category
                </button>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                  <textarea
                    {...register('description')}
                    id="description"
                    rows={3}
                    className={clsx(
                      'w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none',
                      errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    )}
                    placeholder="Enter transaction description..."
                  />
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('date')}
                    type="date"
                    id="date"
                    className={clsx(
                      'w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                      errors.date ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    )}
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    {...register('paymentMethod')}
                    id="paymentMethod"
                    className={clsx(
                      'w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none',
                      errors.paymentMethod ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    )}
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
                )}
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
                  {loading ? 'Saving...' : (transaction ? 'Update' : 'Add Transaction')}
                </motion.button>
              </div>
            </form>
          </motion.div>
          
          <CategoryModal
            isOpen={showCategoryModal}
            onClose={() => setShowCategoryModal(false)}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default TransactionModal;