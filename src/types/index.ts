import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  currency: string;
  timezone: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  isCustom: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: Timestamp;
  paymentMethod: string;
  receiptUrl?: string;
  tags: string[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Timestamp;
  endDate: Timestamp;
  spent: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ExportFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  categories: string[];
  type?: 'income' | 'expense' | 'both';
  format: 'excel' | 'csv' | 'pdf';
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyChange: number;
  transactionCount: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}