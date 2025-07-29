import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TrendingUp, GraduationCap, BarChart3, Users, Wallet, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: TrendingUp, color: 'text-primary-500' },
    { path: '/learn', label: 'Learn', icon: GraduationCap, color: 'text-success-500' },
    { path: '/trading', label: 'Trading', icon: BarChart3, color: 'text-accent-500' },
    { path: '/polls', label: 'Polls', icon: Users, color: 'text-warning-500' },
    { path: '/portfolio', label: 'Portfolio', icon: Wallet, color: 'text-primary-600' },
  ];

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <Sparkles className="h-10 w-10 text-primary-500 group-hover:text-accent-500 transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-success-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <span className="text-2xl font-bold text-gradient-meme">MemeLearn</span>
                  <div className="text-xs text-secondary-500 -mt-1">Trade Smart</div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navItems.map(({ path, label, icon: Icon, color }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    location.pathname === path
                      ? 'bg-gradient-to-r from-primary-50 to-accent-50 text-primary-600 shadow-md border border-primary-200'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${location.pathname === path ? color : 'group-hover:' + color} transition-colors`} />
                  <span>{label}</span>
                  {location.pathname === path && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="scale-90">
                <ConnectButton />
              </div>
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-secondary-900">Hi, {user.name}! 👋</div>
                    <div className="text-xs text-secondary-500">Welcome back</div>
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-secondary-500 hover:text-danger-600 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <div className="scale-75">
                <ConnectButton />
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-secondary-200 animate-slide-down">
            <div className="px-4 py-4 space-y-2">
              {navItems.map(({ path, label, icon: Icon, color }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                    location.pathname === path
                      ? 'bg-gradient-to-r from-primary-50 to-accent-50 text-primary-600 border border-primary-200'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${location.pathname === path ? color : ''}`} />
                  <span>{label}</span>
                  {location.pathname === path && (
                    <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  )}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-secondary-200 mt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 py-2">
                      <div className="text-base font-semibold text-secondary-900">Hi, {user.name}! 👋</div>
                      <div className="text-sm text-secondary-500">Welcome back</div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-base font-medium text-danger-600 hover:bg-danger-50 rounded-xl transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full btn-primary justify-center"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default Header;
