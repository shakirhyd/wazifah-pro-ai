import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Wazifah, WazifahSession, UserSettings } from '../types/wazifah';

// Initialize Firebase App
const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

export const auth = getAuth(app);

// Use custom firestore database ID if specified
const configRecord = firebaseConfig as Record<string, any>;
export const db = configRecord.firestoreDatabaseId && configRecord.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, configRecord.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

// Boot check to validate connection as per Firebase skill guidelines
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline. Please check your internet or Firebase configuration.');
    }
  }
}
testFirestoreConnection();

// --- Auth Helper Functions ---

export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  // Ensure user document exists
  await setDoc(
    doc(db, 'users', user.uid),
    {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Wazifah Reciter',
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );
  return user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const user = result.user;
  if (displayName) {
    await updateProfile(user, { displayName });
  }
  await setDoc(
    doc(db, 'users', user.uid),
    {
      id: user.uid,
      email: user.email || '',
      displayName: displayName || user.displayName || 'Wazifah Reciter',
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );
  return user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function sendResetEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// --- Cloud Data Synchronization ---

// Custom Wazifahs
export async function fetchUserCustomWazifahs(userId: string): Promise<Wazifah[]> {
  try {
    const colRef = collection(db, 'users', userId, 'customWazifahs');
    const snapshot = await getDocs(colRef);
    const items: Wazifah[] = [];
    snapshot.forEach(docSnap => {
      items.push(docSnap.data() as Wazifah);
    });
    return items;
  } catch (err) {
    console.error('Error fetching custom wazifahs from cloud:', err);
    return [];
  }
}

export async function saveUserCustomWazifahCloud(userId: string, wazifah: Wazifah): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'customWazifahs', wazifah.id);
    await setDoc(
      docRef,
      {
        ...wazifah,
        userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error saving custom wazifah to cloud:', err);
  }
}

export async function deleteUserCustomWazifahCloud(userId: string, wazifahId: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'customWazifahs', wazifahId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting custom wazifah from cloud:', err);
  }
}

// Sessions & Metrics
export async function fetchUserSessions(userId: string): Promise<WazifahSession[]> {
  try {
    const colRef = collection(db, 'users', userId, 'sessions');
    const snapshot = await getDocs(colRef);
    const items: WazifahSession[] = [];
    snapshot.forEach(docSnap => {
      items.push(docSnap.data() as WazifahSession);
    });
    // Sort descending by completion time
    items.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    return items;
  } catch (err) {
    console.error('Error fetching sessions from cloud:', err);
    return [];
  }
}

export async function saveUserSessionCloud(userId: string, session: WazifahSession): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'sessions', session.id);
    await setDoc(docRef, {
      ...session,
      userId,
    });
  } catch (err) {
    console.error('Error saving session to cloud:', err);
  }
}

export async function deleteUserSessionCloud(userId: string, sessionId: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'sessions', sessionId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting session from cloud:', err);
  }
}

export async function clearAllUserSessionsCloud(userId: string): Promise<void> {
  try {
    const colRef = collection(db, 'users', userId, 'sessions');
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (err) {
    console.error('Error clearing sessions from cloud:', err);
  }
}

// Settings
export async function fetchUserSettingsCloud(userId: string): Promise<UserSettings | null> {
  try {
    const docRef = doc(db, 'users', userId, 'settings', 'preferences');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserSettings;
    }
    return null;
  } catch (err) {
    console.error('Error loading settings from cloud:', err);
    return null;
  }
}

export async function saveUserSettingsCloud(userId: string, settings: UserSettings): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'settings', 'preferences');
    await setDoc(docRef, {
      ...settings,
      userId,
    });
  } catch (err) {
    console.error('Error saving settings to cloud:', err);
  }
}
