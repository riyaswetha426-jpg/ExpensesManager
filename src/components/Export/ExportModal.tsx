import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Calendar, Filter, FileSpreadsheet, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import * as XLSX from 'xlsx';
import { formatCurrency } from '../../utils/currency';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPORT_COLUMNS = [
  { key: 'date', label: 'Date', default: true },
  { key: 'type', label: 'Type', default: true },
  { key: 'category', label: 'Category', default: true },
  { key: 'description', label: 'Description', default: true },
  { key: 'amount', label: 'Amount', default: true },
  { key: 'paymentMethod', label: 'Payment Method', default: false },
  { key: 'tags', label: 'Tags', default: false },
  { key: 'balance', label: 'Running Balance', default: false },
];

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { transactions } = useTransactions(user?.id || '');
  const { categories } = useCategories(user?.id || '');
  const [loading, setLoading] = useState(false);
  
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(subMonths(new Date(), 2)), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    EXPORT_COLUMNS.filter(col => col.default).map(col => col.key)
  );
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
  const [transactionType, setTransactionType] = useState<'all' | 'income' | 'expense'>('all');

  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = transaction.date.toDate();
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    const dateMatch = transactionDate >= startDate && transactionDate <= endDate;
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(transaction.categoryId);
    const typeMatch = transactionType === 'all' || transaction.type === transactionType;
    
    return dateMatch && categoryMatch && typeMatch;
  });

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const calculateRunningBalance = (transactions: any[]) => {
    let balance = 0;
    return transactions.map(transaction => {
      if (transaction.type === 'income') {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
      return { ...transaction, runningBalance: balance };
    });
  };

  const exportData = async () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions found for the selected criteria');
      return;
    }

    setLoading(true);
    try {
      const sortedTransactions = [...filteredTransactions].sort(
        (a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()
      );
      
      const transactionsWithBalance = calculateRunningBalance(sortedTransactions);

      const exportData = transactionsWithBalance.map(transaction => {
        const category = categoryMap.get(transaction.categoryId);
        const row: any = {};

        if (selectedColumns.includes('date')) {
          row['Date'] = format(transaction.date.toDate(), 'dd/MM/yyyy');
        }
        if (selectedColumns.includes('type')) {
          row['Type'] = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
        }
        if (selectedColumns.includes('category')) {
          row['Category'] = category?.name || 'Other';
        }
        if (selectedColumns.includes('description')) {
          row['Description'] = transaction.description;
        }
        if (selectedColumns.includes('amount')) {
          row['Amount'] = transaction.amount;
        }
        if (selectedColumns.includes('paymentMethod')) {
          row['Payment Method'] = transaction.paymentMethod;
        }
        if (selectedColumns.includes('tags')) {
          row['Tags'] = transaction.tags?.join(', ') || '';
        }
        if (selectedColumns.includes('balance')) {
          row['Running Balance'] = transaction.runningBalance;
        }

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

      // Add summary sheet
      const summary = [
        ['Export Summary', ''],
        ['Date Range', `${format(new Date(dateRange.start), 'dd/MM/yyyy')} to ${format(new Date(dateRange.end), 'dd/MM/yyyy')}`],
        ['Total Transactions', filteredTransactions.length],
        ['Total Income', formatCurrency(filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))],
        ['Total Expenses', formatCurrency(filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))],
        ['Net Balance', formatCurrency(filteredTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0))],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summary);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      const fileName = `transactions_${format(new Date(), 'yyyy-MM-dd')}.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`;
      
      if (exportFormat === 'excel') {
        XLSX.writeFile(workbook, fileName);
      } else {
        XLSX.writeFile(workbook, fileName, { bookType: 'csv' });
      }

      toast.success(`Data exported successfully! ${filteredTransactions.length} transactions exported.`);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Export Transactions</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Customize and download your financial data</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Date Range & Filters */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Date Range
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction Type</h4>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'income', label: 'Income' },
                      { key: 'expense', label: 'Expense' }
                    ].map((type) => (
                      <button
                        key={type.key}
                        onClick={() => setTransactionType(type.key as any)}
                        className={clsx(
                          'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                          transactionType === type.key
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Categories
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-2"
                    >
                      {selectedCategories.length === 0 ? 'Select Categories' : 'Clear All'}
                    </button>
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                          <span className={clsx(
                            'text-xs px-2 py-1 rounded-full',
                            category.type === 'income' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          )}>
                            {category.type}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Columns & Export Options */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Columns</h4>
                  <div className="space-y-2">
                    {EXPORT_COLUMNS.map((column) => (
                      <label key={column.key} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(column.key)}
                          onChange={() => handleColumnToggle(column.key)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{column.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Format</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setExportFormat('excel')}
                      className={clsx(
                        'flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all',
                        exportFormat === 'excel'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      )}
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                      <span className="font-medium">Excel</span>
                    </button>
                    <button
                      onClick={() => setExportFormat('csv')}
                      className={clsx(
                        'flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all',
                        exportFormat === 'csv'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      )}
                    >
                      <FileText className="w-5 h-5" />
                      <span className="font-medium">CSV</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Export Preview</h5>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <p>Transactions: <span className="font-medium">{filteredTransactions.length}</span></p>
                    <p>Columns: <span className="font-medium">{selectedColumns.length}</span></p>
                    <p>Format: <span className="font-medium capitalize">{exportFormat}</span></p>
                    <p>Total Income: <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}
                    </span></p>
                    <p>Total Expenses: <span className="font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))}
                    </span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportData}
                disabled={loading || filteredTransactions.length === 0 || selectedColumns.length === 0}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>{loading ? 'Exporting...' : `Export ${filteredTransactions.length} Transactions`}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExportModal;