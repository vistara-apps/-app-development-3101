import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import supabaseService from '../services/supabaseService.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser) => {
    try {
      const profile = await supabaseService.getUserProfile(authUser.id);
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: profile.name,
        riskTolerance: profile.risk_tolerance,
        investmentGoals: profile.investment_goals,
        portfolioValue: profile.portfolio_value,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      // If profile doesn't exist, user might need to complete registration
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email.split('@')[0],
        needsProfileSetup: true
      });
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await supabaseService.createUserProfile({
          id: data.user.id,
          name: userData.name,
          email: userData.email,
          riskTolerance: userData.riskTolerance,
          investmentGoals: userData.investmentGoals
        });
      }

      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      if (!user?.id) throw new Error('No user logged in');

      const updatedProfile = await supabaseService.updateUserProfile(user.id, {
        name: userData.name,
        risk_tolerance: userData.riskTolerance,
        investment_goals: userData.investmentGoals
      });

      setUser(prev => ({
        ...prev,
        name: updatedProfile.name,
        riskTolerance: updatedProfile.risk_tolerance,
        investmentGoals: updatedProfile.investment_goals,
        portfolioValue: updatedProfile.portfolio_value,
        updatedAt: updatedProfile.updated_at
      }));

      return updatedProfile;
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  };

  const completeProfileSetup = async (profileData) => {
    try {
      if (!user?.id) throw new Error('No user logged in');

      await supabaseService.createUserProfile({
        id: user.id,
        name: profileData.name,
        email: user.email,
        riskTolerance: profileData.riskTolerance,
        investmentGoals: profileData.investmentGoals
      });

      // Reload user profile
      await loadUserProfile({ id: user.id, email: user.email });
      
      return true;
    } catch (error) {
      console.error('Complete profile setup error:', error);
      throw new Error(error.message || 'Failed to complete profile setup');
    }
  };

  const refreshUser = async () => {
    if (session?.user) {
      await loadUserProfile(session.user);
    }
  };

  const value = {
    user,
    session,
    login,
    register,
    logout,
    updateUser,
    resetPassword,
    updatePassword,
    completeProfileSetup,
    refreshUser,
    loading,
    isAuthenticated: !!session?.user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
