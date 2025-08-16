import { useState, useEffect } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { User } from '../types';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDoc);
          
          if (userSnap.exists()) {
            const userData = userSnap.data() as Omit<User, 'id'>;
            setUser({ id: firebaseUser.uid, ...userData });
          } else {
            // Create user document if it doesn't exist
            const newUser: Omit<User, 'id'> = {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              photoURL: firebaseUser.photoURL || undefined,
              currency: 'USD',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              preferences: {
                theme: 'light',
                notifications: true,
                language: 'en'
              },
              createdAt: serverTimestamp() as any,
              updatedAt: serverTimestamp() as any
            };
            
            await setDoc(userDoc, newUser);
            setUser({ id: firebaseUser.uid, ...newUser });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Failed to load user data');
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      const newUser: Omit<User, 'id'> = {
        email,
        displayName,
        currency: 'USD',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        },
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      toast.success('Account created successfully!');
      
      return userCredential.user;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      return userCredential.user;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user document exists
      const userDoc = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userDoc);
      
      if (!userSnap.exists()) {
        const newUser: Omit<User, 'id'> = {
          email: result.user.email || '',
          displayName: result.user.displayName || 'User',
          photoURL: result.user.photoURL || undefined,
          currency: 'USD',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          },
          createdAt: serverTimestamp() as any,
          updatedAt: serverTimestamp() as any
        };
        
        await setDoc(userDoc, newUser);
      }
      
      toast.success('Welcome back!');
      return result.user;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return {
    user,
    firebaseUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword
  };
};