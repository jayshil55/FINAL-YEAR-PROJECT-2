import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  confirmResetPassword as confirmResetPasswordRequest,
  confirmSignUp,
  getCurrentUser,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from 'aws-amplify/auth';

const AuthContext = createContext(null);

const authErrorMessages = {
  UserNotFoundException: 'No account was found with those details.',
  NotAuthorizedException: 'Incorrect email or password.',
  UsernameExistsException: 'An account already exists with this email address.',
  UserNotConfirmedException: 'Please confirm your email address before signing in.',
  CodeMismatchException: 'The verification code is incorrect. Please try again.',
  ExpiredCodeException: 'The verification code has expired. Please request a new one.',
  LimitExceededException: 'Too many attempts. Please wait a while before trying again.',
};

function toReadableAuthError(error) {
  const message = authErrorMessages[error?.name] || error?.message || 'Authentication failed. Please try again.';
  const readableError = new Error(message);
  readableError.name = error?.name || 'AuthError';
  return readableError;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);

    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      return user;
    } catch (error) {
      setCurrentUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    console.group('LOGIN');
    console.log('email', email);
    console.log('request', { username: email });
    setLoading(true);

    try {
      const result = await signIn({ username: email, password });
      console.log('Amplify response', result);

      if (result.isSignedIn) {
        const user = await getCurrentUser();
        setCurrentUser(user);
      }

      return result;
    } catch (error) {
      console.error('error', error);
      throw toReadableAuthError(error);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, []);

  const signup = useCallback(async (email, password) => {
    console.group('SIGNUP');
    console.log('email', email);
    console.log('request', { username: email, options: { userAttributes: { email } } });
    setLoading(true);

    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });

      console.log('Amplify response', result);

      return result;
    } catch (error) {
      console.error('error', error);
      throw toReadableAuthError(error);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, []);

  const confirmSignup = useCallback(async (email, code) => {
    setLoading(true);

    try {
      return await confirmSignUp({ username: email, confirmationCode: code });
    } catch (error) {
      throw toReadableAuthError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      await signOut();
      setCurrentUser(null);
    } catch (error) {
      throw toReadableAuthError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);

    try {
      return await resetPassword({ username: email });
    } catch (error) {
      throw toReadableAuthError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmResetPassword = useCallback(async (email, code, newPassword) => {
    setLoading(true);

    try {
      return await confirmResetPasswordRequest({
        username: email,
        confirmationCode: code,
        newPassword,
      });
    } catch (error) {
      throw toReadableAuthError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      isAuthenticated: Boolean(currentUser),
      login,
      signup,
      confirmSignup,
      logout,
      forgotPassword,
      confirmResetPassword,
      refreshUser,
    }),
    [
      confirmResetPassword,
      confirmSignup,
      currentUser,
      forgotPassword,
      loading,
      login,
      logout,
      refreshUser,
      signup,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }

  return context;
}
