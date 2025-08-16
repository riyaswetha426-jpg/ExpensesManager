import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { Transaction, Category } from '../../types';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface CategoryAnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
}

const CategoryAnalytics: React.FC<CategoryAnalyticsProps> = ({ transactions, categories }) => {
  const categoryStats = useMemo(() => {
    const currentMonth = new Date();
    const startOfCurrentMonth = startOfMonth(currentMonth);
    const endOfCurrentMonth = endOfMonth(currentMonth);

    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = t.date.toDate();
      return transactionDate >= startOfCurrentMonth && transactionDate <= endOfCurrentMonth;
    });

    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    
    // Group by category and type
    const incomeByCategory = new Map<string, { amount: number; count: number; category: Category }>();
    const expenseByCategory = new Map<string, { amount: number; count: number; category: Category }>();

    currentMonthTransactions.forEach(transaction => {
      const category = categoryMap.get(transaction.categoryId);
      if (!category) return;

      const map = transaction.type === 'income' ? incomeByCategory : expenseByCategory;
      const existing = map.get(category.id) || { amount: 0, count: 0, category };
      
      map.set(category.id, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1,
        category
      });
    });

    // Convert to arrays and sort
    const incomeCategories = Array.from(incomeByCategory.values())
      .sort((a, b) => b.amount - a.amount);
    
    const expenseCategories = Array.from(expenseByCategory.values())
      .sort((a, b) => b.amount - a.amount);

    const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.amount, 0);
    const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0);

    return {
      incomeCategories,
      expenseCategories,
      totalIncome,
      totalExpenses
    };
  }, [transactions, categories]);

  const CategoryCard: React.FC<{
    category: { amount: number; count: number; category: Category };
    total: number;
    index: number;
  }> = ({ category, total, index }) => {
    const percentage = total > 0 ? (category.amount / total) * 100 : 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: category.category.color + '20' }}
            >
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: category.category.color }}
              />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {category.category.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {category.count} transaction{category.count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold text-lg ${
              category.category.type === 'income' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(category.amount)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {percentage.toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: category.category.color
            }}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm">Total Income</p>
              <p className="text-2xl font-bold">{formatCurrency(categoryStats.totalIncome)}</p>
            </div>
          </div>
          <p className="text-green-100 text-sm">
            {categoryStats.incomeCategories.length} income categories
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-red-100 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold">{formatCurrency(categoryStats.totalExpenses)}</p>
            </div>
          </div>
          <p className="text-red-100 text-sm">
            {categoryStats.expenseCategories.length} expense categories
          </p>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Income by Category</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(), 'MMMM yyyy')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {categoryStats.incomeCategories.length > 0 ? (
              categoryStats.incomeCategories.map((category, index) => (
                <CategoryCard
                  key={category.category.id}
                  category={category}
                  total={categoryStats.totalIncome}
                  index={index}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No income transactions this month</p>
              </div>
            )}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expenses by Category</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(), 'MMMM yyyy')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {categoryStats.expenseCategories.length > 0 ? (
              categoryStats.expenseCategories.map((category, index) => (
                <CategoryCard
                  key={category.category.id}
                  category={category}
                  total={categoryStats.totalExpenses}
                  index={index}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No expense transactions this month</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryAnalytics;