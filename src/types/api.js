// API Type definitions and interfaces

// User types
export const UserRiskTolerance = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const InvestmentGoals = {
  SHORT_TERM: 'short_term',
  LONG_TERM: 'long_term',
  SPECULATION: 'speculation',
  LEARNING: 'learning'
};

// Trade types
export const TradeType = {
  BUY: 'buy',
  SELL: 'sell'
};

export const TradeStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// Educational content types
export const ContentCategory = {
  BASICS: 'basics',
  ANALYSIS: 'analysis',
  STRATEGY: 'strategy',
  RISK: 'risk',
  TECHNICAL: 'technical',
  GENERATED: 'generated'
};

export const DifficultyLevel = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

// Subscription types
export const SubscriptionStatus = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid'
};

export const PlanType = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  PRO: 'pro'
};

// API Response types
export const createApiResponse = (data = null, error = null, loading = false) => ({
  data,
  error,
  loading,
  success: !error && !loading
});

// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return {
    isValid: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

export const validateTradeAmount = (amount, balance = 0) => {
  const numAmount = parseFloat(amount);
  return {
    isValid: numAmount > 0 && numAmount <= balance,
    isPositive: numAmount > 0,
    hasBalance: numAmount <= balance,
    amount: numAmount
  };
};

// Format helpers
export const formatCurrency = (amount, currency = 'USD', decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
};

export const formatNumber = (number, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

export const formatPercentage = (value, decimals = 2) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

export const formatMarketCap = (marketCap) => {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else if (marketCap >= 1e3) {
    return `$${(marketCap / 1e3).toFixed(2)}K`;
  } else {
    return `$${marketCap.toFixed(2)}`;
  }
};

export const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

// Error types
export const ErrorType = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  VALIDATION: 'validation',
  API: 'api',
  UNKNOWN: 'unknown'
};

export const createError = (message, type = ErrorType.UNKNOWN, details = null) => ({
  message,
  type,
  details,
  timestamp: new Date().toISOString()
});

// Loading states
export const LoadingState = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Cache utilities
export const createCacheKey = (...parts) => {
  return parts.filter(Boolean).join(':');
};

export const isCacheExpired = (timestamp, maxAge) => {
  return Date.now() - timestamp > maxAge;
};

// Coin utilities
export const getCoinEmoji = (coinId) => {
  const emojiMap = {
    'dogecoin': '🐕',
    'shiba-inu': '🐕',
    'pepe': '🐸',
    'floki': '🐕',
    'bonk': '🐕',
    'dogwifcoin': '🐕',
    'memecoin': '🎭',
    'book-of-meme': '📚'
  };
  
  return emojiMap[coinId] || '🪙';
};

export const getCoinColor = (changePercentage) => {
  if (changePercentage > 0) return 'text-green-600';
  if (changePercentage < 0) return 'text-red-600';
  return 'text-gray-600';
};

// Risk assessment
export const assessRiskLevel = (coin) => {
  const { marketCap, volume24h, changePercentage24h } = coin;
  
  let riskScore = 0;
  
  // Market cap risk (lower = higher risk)
  if (marketCap < 100000000) riskScore += 3; // < 100M
  else if (marketCap < 1000000000) riskScore += 2; // < 1B
  else riskScore += 1;
  
  // Volatility risk
  const volatility = Math.abs(changePercentage24h);
  if (volatility > 20) riskScore += 3;
  else if (volatility > 10) riskScore += 2;
  else riskScore += 1;
  
  // Volume risk (lower volume = higher risk)
  const volumeToMarketCapRatio = volume24h / marketCap;
  if (volumeToMarketCapRatio < 0.01) riskScore += 2;
  else if (volumeToMarketCapRatio < 0.05) riskScore += 1;
  
  if (riskScore >= 6) return 'HIGH';
  if (riskScore >= 4) return 'MEDIUM';
  return 'LOW';
};

// Portfolio utilities
export const calculatePortfolioMetrics = (holdings, marketData) => {
  let totalValue = 0;
  let totalCost = 0;
  let totalPnL = 0;
  
  const enrichedHoldings = holdings.map(holding => {
    const marketPrice = marketData.find(coin => coin.id === holding.coin_id)?.price || holding.current_price;
    const currentValue = holding.amount * marketPrice;
    const costBasis = holding.amount * holding.average_buy_price;
    const pnl = currentValue - costBasis;
    const pnlPercentage = (pnl / costBasis) * 100;
    
    totalValue += currentValue;
    totalCost += costBasis;
    totalPnL += pnl;
    
    return {
      ...holding,
      currentPrice: marketPrice,
      currentValue,
      costBasis,
      pnl,
      pnlPercentage
    };
  });
  
  const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  
  return {
    holdings: enrichedHoldings,
    totalValue,
    totalCost,
    totalPnL,
    totalPnLPercentage
  };
};

