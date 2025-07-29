import React from 'react';

export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`skeleton-text ${index === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="skeleton-avatar" />
        <div className="flex-1">
          <div className="skeleton-title" />
          <div className="skeleton-text w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
};

export const SkeletonCoinCard = ({ className = '' }) => {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="skeleton w-10 h-10 rounded-full" />
          <div>
            <div className="skeleton h-5 w-20 mb-1" />
            <div className="skeleton h-4 w-16" />
          </div>
        </div>
        <div className="skeleton h-6 w-24" />
      </div>
      <div className="flex justify-between items-center">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-6 w-20" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      <div className="skeleton-title mb-6" />
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={`skeleton h-4 ${colIndex === 0 ? 'w-1/4' : 'flex-1'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonChart = ({ className = '' }) => {
  return (
    <div className={`card ${className}`}>
      <div className="skeleton-title mb-6" />
      <div className="h-64 bg-secondary-100 rounded-lg flex items-end justify-between p-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="skeleton w-6"
            style={{
              height: `${Math.random() * 80 + 20}%`,
              animationDelay: `${index * 0.1}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

const SkeletonLoader = ({ type = 'text', ...props }) => {
  const components = {
    text: SkeletonText,
    card: SkeletonCard,
    coin: SkeletonCoinCard,
    table: SkeletonTable,
    chart: SkeletonChart
  };

  const Component = components[type] || SkeletonText;
  return <Component {...props} />;
};

export default SkeletonLoader;

