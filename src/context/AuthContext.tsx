import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isOwner: boolean;
  isCustomer: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  registerCustomer: (data: { fullName: string; email: string; phone: string; address?: string; city?: string; pass: string }) => Promise<void>;
  updateCustomerProfile: (data: Partial<UserProfile>) => Promise<void>;
  registerOwner: (data: { fullName: string; email: string; phone: string; pass: string }) => Promise<void>;
  createAdditionalOwnerAccount: (data: { fullName: string; email: string; phone: string; pass: string }) => Promise<void>;
  deleteCustomer: (uid: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  allCustomers: UserProfile[];
  loadingCustomers: boolean;
  refreshCustomers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Primary authorized owner email from user brief
export const PRIMARY_OWNER_EMAIL = 'ahmadsaadnoor44550@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Customer Management list (for Owner Dashboard)
  const [allCustomers, setAllCustomers] = useState<UserProfile[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(false);

  // Fetch or create user profile on auth change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userEmail = (user.email || '').toLowerCase().trim();
          const isPrimary = userEmail === PRIMARY_OWNER_EMAIL.toLowerCase();

          // Check if admin doc exists in Firestore
          let adminDocExists = false;
          try {
            const adminDocRef = doc(db, 'admins', user.uid);
            const docSnap = await getDoc(adminDocRef);
            if (docSnap.exists()) {
              adminDocExists = true;
            } else if (isPrimary) {
              await setDoc(adminDocRef, {
                uid: user.uid,
                email: user.email,
                role: 'owner',
                createdAt: new Date().toISOString()
              });
              adminDocExists = true;
            }
          } catch (e) {
            console.warn('Admin check note:', e);
          }

          // Check profile in /users
          let profile: UserProfile | null = null;
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              profile = userSnap.data() as UserProfile;
            } else {
              // Create default profile if not present
              const role = (isPrimary || adminDocExists) ? 'owner' : 'customer';
              profile = {
                uid: user.uid,
                fullName: user.displayName || (role === 'owner' ? 'Ahmad Saad (Owner)' : 'Customer'),
                email: user.email || '',
                phone: user.phoneNumber || '',
                address: '',
                city: '',
                role: role,
                createdAt: new Date().toISOString()
              };
              await setDoc(userDocRef, profile);
            }
          } catch (e) {
            console.warn('Profile read note:', e);
          }

          const determinedIsOwner = isPrimary || adminDocExists || profile?.role === 'owner';
          setIsOwner(determinedIsOwner);
          setUserProfile(profile);

        } catch (err) {
          console.error('Auth verification error:', err);
          setIsOwner(false);
          setUserProfile(null);
        }
      } else {
        setIsOwner(false);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch customers list for Owner Dashboard
  const refreshCustomers = async () => {
    if (!isOwner) return;
    setLoadingCustomers(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        const u = d.data() as UserProfile;
        if (u.role === 'customer') {
          list.push(u);
        }
      });
      // Sort newest registration first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllCustomers(list);
    } catch (err) {
      console.warn('Could not load customers list:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      refreshCustomers();
    } else {
      setAllCustomers([]);
    }
  }, [isOwner]);

  // Standard Login (for both Customer and Owner)
  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check credentials.';
      setError(msg);
      throw err;
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in was cancelled or failed.';
      setError(msg);
      throw err;
    }
  };

  // Customer Registration with Name, Email, Phone, Delivery Address, Password
  const registerCustomer = async (data: { 
    fullName: string; 
    email: string; 
    phone: string; 
    address?: string; 
    city?: string; 
    pass: string 
  }) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, data.email.trim(), data.pass);
      const user = res.user;

      await updateProfile(user, { displayName: data.fullName.trim() });

      const newProfile: UserProfile = {
        uid: user.uid,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        address: data.address?.trim() || '',
        city: data.city?.trim() || '',
        role: 'customer',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
      setIsOwner(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Customer registration failed.';
      setError(msg);
      throw err;
    }
  };

  // Update Customer Profile (name, phone, address, city)
  const updateCustomerProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    setError(null);
    try {
      const updatedData: Partial<UserProfile> = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      if (data.fullName) {
        await updateProfile(currentUser, { displayName: data.fullName.trim() });
      }
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, updatedData, { merge: true });
      setUserProfile((prev) => (prev ? { ...prev, ...updatedData } : null));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setError(msg);
      throw err;
    }
  };

  // Owner Registration
  const registerOwner = async (data: { fullName: string; email: string; phone: string; pass: string }) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, data.email.trim(), data.pass);
      const user = res.user;

      await updateProfile(user, { displayName: data.fullName.trim() });

      // Save to admins registry
      await setDoc(doc(db, 'admins', user.uid), {
        uid: user.uid,
        email: data.email.trim().toLowerCase(),
        role: 'owner',
        createdAt: new Date().toISOString()
      });

      const ownerProfile: UserProfile = {
        uid: user.uid,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        role: 'owner',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), ownerProfile);
      setUserProfile(ownerProfile);
      setIsOwner(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Owner account creation failed.';
      setError(msg);
      throw err;
    }
  };

  // Additional Owner Account (from inside Dashboard)
  const createAdditionalOwnerAccount = async (data: { fullName: string; email: string; phone: string; pass: string }) => {
    setError(null);
    try {
      // Create user and mark as admin doc
      const res = await createUserWithEmailAndPassword(auth, data.email.trim(), data.pass);
      const user = res.user;
      await updateProfile(user, { displayName: data.fullName.trim() });

      await setDoc(doc(db, 'admins', user.uid), {
        uid: user.uid,
        email: data.email.trim().toLowerCase(),
        role: 'owner',
        createdAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        role: 'owner',
        createdAt: new Date().toISOString()
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not create new business owner account.';
      setError(msg);
      throw err;
    }
  };

  const deleteCustomer = async (uid: string) => {
    setError(null);
    try {
      await deleteDoc(doc(db, 'users', uid));
      setAllCustomers((prev) => prev.filter((c) => c.uid !== uid));
    } catch (err: unknown) {
      console.error('Error deleting customer:', err);
      handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
    }
  };

  const logout = async () => {
    setError(null);
    await firebaseSignOut(auth);
    setIsOwner(false);
    setUserProfile(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isOwner,
        isCustomer: !!currentUser && !isOwner,
        loading,
        error,
        login,
        loginWithGoogle,
        registerCustomer,
        updateCustomerProfile,
        registerOwner,
        createAdditionalOwnerAccount,
        deleteCustomer,
        logout,
        clearError,
        allCustomers,
        loadingCustomers,
        refreshCustomers,
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
