import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  loginWithGoogle as fbLoginWithGoogle,
  loginWithEmail as fbLoginWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  logoutUser as fbLogoutUser,
  sendResetEmail as fbSendResetEmail,
  fetchUserCustomWazifahs,
  saveUserCustomWazifahCloud,
  fetchUserSessions,
  saveUserSessionCloud,
  fetchUserSettingsCloud,
  saveUserSettingsCloud,
} from '../lib/firebase';
import {
  getCustomWazifahs,
  saveCustomWazifahs,
  getSessionsLog,
  getUserSettings,
  saveUserSettings,
} from '../utils/storage';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'guest' | 'error';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  syncState: SyncState;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  syncNow: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; onDataSynced?: () => void }> = ({
  children,
  onDataSynced,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncState, setSyncState] = useState<SyncState>('guest');

  // Full two-way merge between Local Storage and Firestore
  const performSync = useCallback(async (user: User) => {
    try {
      setSyncState('syncing');

      // 1. Sync Custom Wazifahs
      const cloudWazifahs = await fetchUserCustomWazifahs(user.uid);
      const localWazifahs = getCustomWazifahs();

      // Combine by ID, preferring newest
      const wazifahMap = new Map<string, any>();
      cloudWazifahs.forEach(w => wazifahMap.set(w.id, w));
      for (const localW of localWazifahs) {
        if (!wazifahMap.has(localW.id)) {
          // Push local custom wazifah to cloud
          await saveUserCustomWazifahCloud(user.uid, localW);
          wazifahMap.set(localW.id, localW);
        }
      }
      const mergedWazifahs = Array.from(wazifahMap.values());
      saveCustomWazifahs(mergedWazifahs);

      // 2. Sync Practice Sessions & Metrics Log
      const cloudSessions = await fetchUserSessions(user.uid);
      const localSessions = getSessionsLog();

      const sessionMap = new Map<string, any>();
      cloudSessions.forEach(s => sessionMap.set(s.id, s));
      for (const localS of localSessions) {
        if (!sessionMap.has(localS.id)) {
          // Push local session to cloud
          await saveUserSessionCloud(user.uid, localS);
          sessionMap.set(localS.id, localS);
        }
      }
      const mergedSessions = Array.from(sessionMap.values()).sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('wazifah_sessions_log_v2', JSON.stringify(mergedSessions));
      }

      // 3. Sync Settings
      const cloudSettings = await fetchUserSettingsCloud(user.uid);
      if (cloudSettings) {
        saveUserSettings(cloudSettings);
      } else {
        const localSettings = getUserSettings();
        await saveUserSettingsCloud(user.uid, localSettings);
      }

      setSyncState('synced');
      if (onDataSynced) {
        onDataSynced();
      }
    } catch (err) {
      console.error('Data synchronization failed:', err);
      setSyncState('error');
    }
  }, [onDataSynced]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        await performSync(user);
      } else {
        setSyncState('guest');
      }
    });
    return () => unsubscribe();
  }, [performSync]);

  const loginWithGoogle = async () => {
    const user = await fbLoginWithGoogle();
    await performSync(user);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const user = await fbLoginWithEmail(email, pass);
    await performSync(user);
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    const user = await fbRegisterWithEmail(email, pass, name);
    await performSync(user);
  };

  const logout = async () => {
    await fbLogoutUser();
    setSyncState('guest');
  };

  const resetPassword = async (email: string) => {
    await fbSendResetEmail(email);
  };

  const syncNow = async () => {
    if (currentUser) {
      await performSync(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        syncState,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        resetPassword,
        syncNow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
