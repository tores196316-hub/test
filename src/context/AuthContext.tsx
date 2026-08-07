import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  demoAdminLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const isAdminUser = user.email === 'tores196316@gmail.com';
        setIsAdmin(isAdminUser);
        setUserProfile({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
          photoURL: user.photoURL || undefined,
          role: isAdminUser ? 'admin' : 'user',
          apiKey: 'pv_live_' + Math.random().toString(36).substring(2, 18),
          totalUploads: 5,
          totalViews: 120,
          totalDownloads: 34,
          totalStorageBytes: 15400000,
          createdAt: new Date().toISOString(),
        });
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginGoogle = async () => {
    await loginWithGoogle();
  };

  const logout = async () => {
    await logoutUser();
    setUserProfile(null);
    setIsAdmin(false);
  };

  const demoAdminLogin = () => {
    setIsAdmin(true);
    setUserProfile({
      uid: 'demo-admin-uid',
      email: 'tores196316@gmail.com',
      displayName: 'Sistem Yöneticisi',
      role: 'admin',
      apiKey: 'pv_live_admin_992039128390',
      totalUploads: 24,
      totalViews: 840,
      totalDownloads: 190,
      totalStorageBytes: 42000000,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        loginGoogle,
        logout,
        demoAdminLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
