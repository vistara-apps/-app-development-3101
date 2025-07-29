// API Configuration
export const API_CONFIG = {
  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // CoinGecko API
  coinGecko: {
    baseUrl: 'https://api.coingecko.com/api/v3',
    apiKey: import.meta.env.VITE_COINGECKO_API_KEY,
    endpoints: {
      coins: '/coins/markets',
      coin: '/coins',
      trending: '/search/trending',
      global: '/global'
    },
    // Rate limiting: 10-50 calls/minute for free tier
    rateLimit: {
      requests: 10,
      window: 60000 // 1 minute
    }
  },
  
  // OpenRouter LLM API
  openRouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    endpoints: {
      completions: '/chat/completions'
    },
    models: {
      default: 'anthropic/claude-3-haiku',
      premium: 'anthropic/claude-3-sonnet'
    }
  },
  
  // Stripe
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    apiVersion: '2023-10-16'
  },
  
  // App settings
  app: {
    environment: import.meta.env.VITE_APP_ENV || 'development',
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  }
};

// Validate required environment variables
export const validateConfig = () => {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// API endpoints for meme coins we want to track
export const MEME_COINS = [
  'dogecoin',
  'shiba-inu',
  'pepe',
  'floki',
  'bonk',
  'dogwifcoin',
  'memecoin',
  'book-of-meme'
];

// Default request timeout
export const DEFAULT_TIMEOUT = 10000;

// Cache durations (in milliseconds)
export const CACHE_DURATION = {
  MARKET_DATA: 30000, // 30 seconds
  EDUCATIONAL_CONTENT: 3600000, // 1 hour
  USER_DATA: 300000, // 5 minutes
  POLLS: 60000 // 1 minute
};

