import { getCurrentUser } from '@aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log("Current User: ", currentUser);
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      console.log("Auth event received: ", payload);
      const { event } = payload;
      if (['signedIn', 'signedOut'].includes(event)) {
        fetchUser();
      }
    });

    return () => unsubscribe();

  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
