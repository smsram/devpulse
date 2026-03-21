import React, { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import API from '../services/api';
import Loader from './ui/Loader';

export default function ProtectedRoute({ children }) {
  const { username } = useParams();
  // Store loading state, validity, and the user's actual username
  const [authStatus, setAuthStatus] = useState({ 
    loading: true, 
    isValid: false, 
    trueUsername: null 
  });
  const token = localStorage.getItem('devpulse_token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setAuthStatus({ loading: false, isValid: false, trueUsername: null });
        return;
      }

      try {
        const res = await API.get('/auth/me');
        const loggedInUser = res.data.username; // Matches the 'username' field in User schema

        // SECURITY CHECK: Does the URL match the token?
        if (loggedInUser !== username) {
          // They are logged in, but trying to snoop on another user's URL.
          setAuthStatus({ loading: false, isValid: false, trueUsername: loggedInUser });
          return;
        }

        // All good!
        setAuthStatus({ loading: false, isValid: true, trueUsername: loggedInUser });
      } catch (err) {
        console.error("Token verification failed:", err);
        localStorage.removeItem('devpulse_token');
        setAuthStatus({ loading: false, isValid: false, trueUsername: null });
      }
    };

    verifyToken();
  }, [token, username]);

  // 1. Show loader while checking DB
  if (authStatus.loading) {
    return <Loader fullPage={true} size="48px" color="var(--primary)" />;
  }

  // 2. If valid token but WRONG URL, redirect to their correct URL
  if (!authStatus.isValid && authStatus.trueUsername) {
    return <Navigate to={`/app/${authStatus.trueUsername}`} replace />;
  }

  // 3. If completely invalid/expired token, go to login
  if (!authStatus.isValid) {
    return <Navigate to="/login" replace />;
  }

  // 4. Everything matches! Render the page.
  return children;
}