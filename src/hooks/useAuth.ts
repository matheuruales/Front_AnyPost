import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { isAxiosError } from 'axios';
import { auth } from '../services/firebase';
import { backendApi } from '../services/backend';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const sanitizeEmail = (value: string) => value.trim().toLowerCase();
const sanitizePassword = (value: string) => value.trim();

const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please try again or reset your password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try signing in instead.';
      case 'auth/weak-password':
        return 'Password must contain at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected authentication error occurred. Please try again.';
};

const getBackendErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const responseMessage =
      (typeof error.response?.data === 'string' && error.response.data) ||
      (typeof error.response?.data === 'object' && error.response?.data?.message);
    return (
      responseMessage ||
      'Unable to register the user in the backend service. Please confirm the API is running.'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to register the user in the backend service. Please confirm the API is running.';
};

export const useAuth = (): AuthContextType => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const ensureBackendProfile = async () => {
      if (!currentUser) {
        return;
      }

      try {
        // Force token refresh to get a fresh token
        const token = await currentUser.getIdToken(true);
        localStorage.setItem('token', token);

        const profileEmail =
          currentUser.email ||
          currentUser.providerData.find((provider) => provider.email)?.email;

        if (!profileEmail) {
          console.warn('Unable to sync profile: no email found for the current user.');
          return;
        }

        await backendApi.createUserProfile({
          email: profileEmail,
          displayName: profileEmail.split('@')[0] || 'Creator',
          authUserId: currentUser.uid,
        });
      } catch (error) {
        console.error('Error ensuring backend profile:', error);
      }
    };

    ensureBackendProfile();
  }, [currentUser]);

  // Set up token refresh listener
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    // Firebase automatically refreshes tokens, but we need to update localStorage
    const refreshToken = async () => {
      try {
        const token = await currentUser.getIdToken(true);
        localStorage.setItem('token', token);
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    };

    // Refresh token every 50 minutes (tokens expire after 1 hour)
    const tokenRefreshInterval = setInterval(refreshToken, 50 * 60 * 1000);

    // Also listen to token refresh events from Firebase
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    });

    return () => {
      clearInterval(tokenRefreshInterval);
      unsubscribe();
    };
  }, [currentUser]);

  const register = async (email: string, password: string) => {
    try {
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedPassword = sanitizePassword(password);
      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
      const token = await userCredential.user.getIdToken();
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Register the collaborator profile in the Spring backend
      const profileEmail = userCredential.user.email || sanitizedEmail;
      await backendApi.createUserProfile({
        email: profileEmail,
        displayName: profileEmail.split('@')[0] || 'Creator',
        authUserId: userCredential.user.uid,
      });
    } catch (error) {
      console.error('Error registering:', error);
      if (isAxiosError(error)) {
        throw new Error(getBackendErrorMessage(error));
      }
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedPassword = sanitizePassword(password);
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      const profileEmail = userCredential.user.email || sanitizedEmail;
      await backendApi.createUserProfile({
        email: profileEmail,
        displayName: profileEmail.split('@')[0] || 'Creator',
        authUserId: userCredential.user.uid,
      });
    } catch (error) {
      console.error('Error logging in:', error);
      if (isAxiosError(error)) {
        throw new Error(getBackendErrorMessage(error));
      }
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error logging out:', error);
      throw new Error('Failed to log out. Please try again.');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const sanitizedEmail = sanitizeEmail(email);
      await sendPasswordResetEmail(auth, sanitizedEmail);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  };

  return {
    currentUser,
    login,
    register,
    logout,
    resetPassword,
    loading
  };
};
