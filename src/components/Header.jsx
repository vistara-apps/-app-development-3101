import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TrendingUp, GraduationCap, BarChart3, Users, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: TrendingUp },
    { path: '/learn', label: 'Learn', icon: GraduationCap },
    { path: '/trading', label: 'Trading', icon: BarChart3 },
    { path: '/polls', label: 'Polls', icon: Users },
    { path: '/portfolio', label: 'Portfolio', icon: Wallet },
  ];

  return (
    <>
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-primary-500" />
                <span className="text-xl font-bold text-secondary-900">MemeLearn</span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'text-primary-500 bg-primary-50'
                      : 'text-secondary-500 hover:text-secondary-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <ConnectButton />
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary-600">Hi, {user.name}</span>
                  <button
                    onClick={logout}
                    className="text-sm text-secondary-500 hover:text-secondary-900"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default Header;