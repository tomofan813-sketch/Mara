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
  signInWithPopup,
  GoogleAuthProvider,
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
  loginWithGoogle: () => Promise<void>;
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

  const fetchProfile = async (uid: string, fallbackUser?: FirebaseUser) => {
    try {
      const p = await getUserProfile(uid);
      if (p) {
        setUserProfile(p);
      } else {
        const u = fallbackUser || auth.currentUser;
        const defaultName = u?.displayName || 'مستخدم مهارة';
        const defaultHandle = `@user_${uid.slice(0, 5)}`;
        const defaultAvatar = u?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`;

        const created = await createOrUpdateUserProfile({
          uid,
          name: defaultName,
          email: u?.email || '',
          handle: defaultHandle,
          avatar: defaultAvatar,
          role: u?.email === 'admin@mahara.app' ? 'admin' : 'user',
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
        await fetchProfile(user.uid, user);
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await fetchProfile(res.user.uid, res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, handle: string) => {
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name.trim()) {
        try {
          await updateProfile(res.user, { displayName: name.trim() });
        } catch (nameErr) {
          console.warn('Could not update displayName:', nameErr);
        }
      }
      const formattedHandle = handle.trim() 
        ? (handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`)
        : `@${name.trim().toLowerCase().replace(/\s+/g, '_') || res.user.uid.slice(0, 5)}`;

      const newProfile = await createOrUpdateUserProfile({
        uid: res.user.uid,
        email: email.trim(),
        name: name.trim() || 'صانع مهارة',
        handle: formattedHandle,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${res.user.uid}`,
        role: email.trim() === 'admin@mahara.app' ? 'admin' : 'user',
      });
      setUserProfile(newProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      await fetchProfile(res.user.uid, res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginGuest = async () => {
    setIsLoading(true);
    try {
      const res = await signInAnonymously(auth);
      await fetchProfile(res.user.uid, res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await fbSignOut(auth);
    setUserProfile(null);
    setCurrentUser(null);
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
      await fetchProfile(currentUser.uid, currentUser);
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
        loginWithGoogle,
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
