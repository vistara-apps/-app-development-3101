import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    white: 'text-white',
    accent: 'text-accent-500'
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]} ${className}`} />
  );
};

export const LoadingDots = ({ className = '', color = 'primary' }) => {
  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    white: 'text-white',
    accent: 'text-accent-500'
  };

  return (
    <div className={`loading-dots ${colorClasses[color]} ${className}`}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export const LoadingButton = ({ children, loading, disabled, className = '', ...props }) => {
  return (
    <button
      className={`btn-primary ${loading || disabled ? 'btn-loading' : ''} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" color="white" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingSpinner;

