import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  startAfter,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Transaction } from '../types';
import toast from 'react-hot-toast';

export const useTransactions = (userId: string, limitCount = 50) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      setTransactions(transactionData);
      setHasMore(snapshot.docs.length === limitCount);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [userId, limitCount]);

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      toast.success('Transaction added successfully!');
      return docRef.id;
    } catch (error: any) {
      toast.error('Failed to add transaction');
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const transactionRef = doc(db, 'transactions', id);
      await updateDoc(transactionRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      toast.success('Transaction updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update transaction');
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
      toast.success('Transaction deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete transaction');
      throw error;
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading || transactions.length === 0) return;
    
    try {
      setLoading(true);
      const lastTransaction = transactions[transactions.length - 1];
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        startAfter(lastTransaction.date),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      const newTransactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      setTransactions(prev => [...prev, ...newTransactions]);
      setHasMore(snapshot.docs.length === limitCount);
    } catch (error) {
      toast.error('Failed to load more transactions');
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    hasMore,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loadMore
  };
};