import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  UserProfile 
} from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  signInAnonymously,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getUserProfile, 
  createOrUpdateUserProfile 
} from '../services/dbOperations';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, handle: string) => Promise<void>;
  loginGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const p = await getUserProfile(uid);
      if (p) {
        setUserProfile(p);
      } else {
        // Auto initialize profile
        const created = await createOrUpdateUserProfile({
          uid,
          name: auth.currentUser?.displayName || 'مستخدم مهارة',
          email: auth.currentUser?.email || '',
          handle: `@user_${uid.slice(0, 5)}`,
        });
        setUserProfile(created);
      }
    } catch (e) {
      console.error('Error in fetchProfile:', e);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        // Automatically sign in as a demo/guest user so app is immediately usable
        try {
          const cred = await signInAnonymously(auth);
          await createOrUpdateUserProfile({
            uid: cred.user.uid,
            name: 'متعلم جديد 🚀',
            handle: `@learner_${cred.user.uid.slice(0, 4)}`,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          });
          await fetchProfile(cred.user.uid);
        } catch (err) {
          console.log('Anonymous sign in notice:', err);
        }
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await fetchProfile(res.user.uid);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, handle: string) => {
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(res.user, { displayName: name });
      const newProfile = await createOrUpdateUserProfile({
        uid: res.user.uid,
        email: email.trim(),
        name: name.trim(),
        handle: handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${res.user.uid}`,
        role: email.trim() === 'admin@mahara.app' ? 'admin' : 'user',
      });
      setUserProfile(newProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const loginGuest = async () => {
    setIsLoading(true);
    try {
      const res = await signInAnonymously(auth);
      await fetchProfile(res.user.uid);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await fbSignOut(auth);
    setUserProfile(null);
  };

  const updateCurrentProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = await createOrUpdateUserProfile({
      uid: currentUser.uid,
      ...data,
    });
    setUserProfile(updated);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isLoading,
        loginWithEmail,
        registerWithEmail,
        loginGuest,
        logout,
        updateCurrentProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
