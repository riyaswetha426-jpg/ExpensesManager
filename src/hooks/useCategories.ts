import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Category } from '../types';
import toast from 'react-hot-toast';

const DEFAULT_CATEGORIES = [
  // Income categories
  { name: 'Salary', type: 'income' as const, color: '#10B981', icon: 'Wallet' },
  { name: 'Freelance', type: 'income' as const, color: '#8B5CF6', icon: 'Laptop' },
  { name: 'Investments', type: 'income' as const, color: '#F59E0B', icon: 'TrendingUp' },
  { name: 'Business', type: 'income' as const, color: '#3B82F6', icon: 'Building' },
  { name: 'Gifts', type: 'income' as const, color: '#EC4899', icon: 'Gift' },
  
  // Expense categories
  { name: 'Food', type: 'expense' as const, color: '#EF4444', icon: 'Coffee' },
  { name: 'Transportation', type: 'expense' as const, color: '#6366F1', icon: 'Car' },
  { name: 'Housing', type: 'expense' as const, color: '#8B5CF6', icon: 'Home' },
  { name: 'Utilities', type: 'expense' as const, color: '#059669', icon: 'Zap' },
  { name: 'Healthcare', type: 'expense' as const, color: '#DC2626', icon: 'Heart' },
  { name: 'Entertainment', type: 'expense' as const, color: '#F59E0B', icon: 'Film' },
  { name: 'Shopping', type: 'expense' as const, color: '#EC4899', icon: 'ShoppingBag' },
  { name: 'Education', type: 'expense' as const, color: '#3B82F6', icon: 'BookOpen' },
  { name: 'Travel', type: 'expense' as const, color: '#06B6D4', icon: 'Plane' }
];

export const useCategories = (userId: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const q = query(
      collection(db, 'categories'),
      where('userId', '==', userId)
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const categoryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      
      // If no categories exist, create default ones
      if (categoryData.length === 0) {
        try {
          const promises = DEFAULT_CATEGORIES.map(cat => 
            addDoc(collection(db, 'categories'), {
              ...cat,
              userId,
              isCustom: false,
              isActive: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            })
          );
          await Promise.all(promises);
        } catch (error) {
          console.error('Error creating default categories:', error);
        }
      } else {
        setCategories(categoryData);
        setLoading(false);
      }
    });
    
    return unsubscribe;
  }, [userId]);

  const addCategory = async (categoryData: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...categoryData,
        userId,
        isCustom: true,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      toast.success('Category added successfully!');
      return docRef.id;
    } catch (error: any) {
      toast.error('Failed to add category');
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const categoryRef = doc(db, 'categories', id);
      await updateDoc(categoryRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      toast.success('Category updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update category');
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast.success('Category deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete category');
      throw error;
    }
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory
  };
};