import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ChartData {
  month: string;
  income: number;
  expenses: number;
  netBalance: number;
}

interface IncomeExpenseChartProps {
  data: ChartData[];
  chartType: 'line' | 'bar';
  onChartTypeChange: (type: 'line' | 'bar') => void;
}

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ 
  data, 
  chartType, 
  onChartTypeChange 
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.name}:</span>
              <span className="font-medium text-gray-900">
                ${entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Income vs Expenses</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Track your financial flow over time</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onChartTypeChange('line')}
            className={`p-2 rounded-lg transition-colors ${
              chartType === 'line' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <LineChartIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onChartTypeChange('bar')}
            className={`p-2 rounded-lg transition-colors ${
              chartType === 'bar' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-emerald-800">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-red-800">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        
        <div className={`rounded-xl p-4 ${
          netBalance >= 0 ? 'bg-blue-50' : 'bg-orange-50'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-5 h-5 rounded-full ${
              netBalance >= 0 ? 'bg-blue-600' : 'bg-orange-600'
            }`} />
            <span className={`text-sm font-medium ${
              netBalance >= 0 ? 'text-blue-700' : 'text-orange-700'
            }`}>
              Net Balance
            </span>
          </div>
          <p className={`text-2xl font-bold ${
            netBalance >= 0 ? 'text-blue-800' : 'text-orange-800'
          }`}>
            {formatCurrency(Math.abs(netBalance))}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#ef4444', strokeWidth: 2 }}
                name="Expenses"
              />
              <Line 
                type="monotone" 
                dataKey="netBalance" 
                stroke="#3b82f6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Net Balance"
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="income" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
                name="Income"
              />
              <Bar 
                dataKey="expenses" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
                name="Expenses"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default IncomeExpenseChart;