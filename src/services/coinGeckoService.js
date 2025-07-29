import axios from 'axios';
import { API_CONFIG, MEME_COINS, DEFAULT_TIMEOUT, CACHE_DURATION } from '../config/api.js';

class CoinGeckoService {
  constructor() {
    this.baseURL = API_CONFIG.coinGecko.baseUrl;
    this.apiKey = API_CONFIG.coinGecko.apiKey;
    this.cache = new Map();
    this.lastRequestTime = 0;
    this.requestCount = 0;
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Accept': 'application/json',
        ...(this.apiKey && { 'x-cg-demo-api-key': this.apiKey })
      }
    });

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(async (config) => {
      await this.enforceRateLimit();
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('CoinGecko API Error:', error.response?.data || error.message);
        throw new Error(this.handleError(error));
      }
    );
  }

  // Rate limiting to respect API limits
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Reset counter if more than 1 minute has passed
    if (timeSinceLastRequest > API_CONFIG.coinGecko.rateLimit.window) {
      this.requestCount = 0;
    }
    
    // If we've hit the rate limit, wait
    if (this.requestCount >= API_CONFIG.coinGecko.rateLimit.requests) {
      const waitTime = API_CONFIG.coinGecko.rateLimit.window - timeSinceLastRequest;
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestCount = 0;
      }
    }
    
    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION.MARKET_DATA) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Get market data for meme coins
  async getMemeCoinsData() {
    const cacheKey = 'meme-coins-market-data';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.client.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          ids: MEME_COINS.join(','),
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h,7d'
        }
      });

      const formattedData = response.data.map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price,
        change24h: coin.price_change_24h,
        changePercentage24h: coin.price_change_percentage_24h,
        changePercentage7d: coin.price_change_percentage_7d_in_currency,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
        image: coin.image,
        lastUpdated: coin.last_updated
      }));

      this.setCachedData(cacheKey, formattedData);
      return formattedData;
    } catch (error) {
      console.error('Error fetching meme coins data:', error);
      
      // Return cached data if available, even if expired
      const expiredCache = this.cache.get(cacheKey);
      if (expiredCache) {
        console.warn('Returning expired cache data due to API error');
        return expiredCache.data;
      }
      
      throw error;
    }
  }

  // Get specific coin data
  async getCoinData(coinId) {
    const cacheKey = `coin-${coinId}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.client.get(`/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false
        }
      });

      const coin = response.data;
      const formattedData = {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.market_data.current_price.usd,
        change24h: coin.market_data.price_change_24h,
        changePercentage24h: coin.market_data.price_change_percentage_24h,
        changePercentage7d: coin.market_data.price_change_percentage_7d,
        marketCap: coin.market_data.market_cap.usd,
        volume24h: coin.market_data.total_volume.usd,
        circulatingSupply: coin.market_data.circulating_supply,
        totalSupply: coin.market_data.total_supply,
        maxSupply: coin.market_data.max_supply,
        image: coin.image.large,
        description: coin.description.en,
        lastUpdated: coin.market_data.last_updated
      };

      this.setCachedData(cacheKey, formattedData);
      return formattedData;
    } catch (error) {
      console.error(`Error fetching coin data for ${coinId}:`, error);
      throw error;
    }
  }

  // Get trending coins
  async getTrendingCoins() {
    const cacheKey = 'trending-coins';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.client.get('/search/trending');
      
      const trendingCoins = response.data.coins.map(item => ({
        id: item.item.id,
        name: item.item.name,
        symbol: item.item.symbol,
        marketCapRank: item.item.market_cap_rank,
        image: item.item.large,
        priceChangePercentage24h: item.item.data?.price_change_percentage_24h?.usd
      }));

      this.setCachedData(cacheKey, trendingCoins);
      return trendingCoins;
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      throw error;
    }
  }

  // Get global market data
  async getGlobalData() {
    const cacheKey = 'global-market-data';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.client.get('/global');
      
      const globalData = {
        totalMarketCap: response.data.data.total_market_cap.usd,
        totalVolume24h: response.data.data.total_volume.usd,
        marketCapChangePercentage24h: response.data.data.market_cap_change_percentage_24h_usd,
        activeCryptocurrencies: response.data.data.active_cryptocurrencies,
        markets: response.data.data.markets,
        marketCapPercentage: response.data.data.market_cap_percentage
      };

      this.setCachedData(cacheKey, globalData);
      return globalData;
    } catch (error) {
      console.error('Error fetching global market data:', error);
      throw error;
    }
  }

  // Search for coins
  async searchCoins(query) {
    try {
      const response = await this.client.get('/search', {
        params: { query }
      });

      return response.data.coins.map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        marketCapRank: coin.market_cap_rank,
        image: coin.large
      }));
    } catch (error) {
      console.error('Error searching coins:', error);
      throw error;
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || error.response.statusText;
      
      switch (status) {
        case 429:
          return 'Rate limit exceeded. Please try again later.';
        case 404:
          return 'Coin not found.';
        case 500:
          return 'CoinGecko service is temporarily unavailable.';
        default:
          return `API Error: ${message}`;
      }
    } else if (error.request) {
      return 'Network error. Please check your connection.';
    } else {
      return 'An unexpected error occurred.';
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default new CoinGeckoService();

