import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import coinGeckoService from '../services/coinGeckoService.js';
import supabaseService from '../services/supabaseService.js';
import openRouterService from '../services/openRouterService.js';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [coins, setCoins] = useState([]);
  const [polls, setPolls] = useState([]);
  const [trades, setTrades] = useState([]);
  const [videos, setVideos] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState({
    coins: false,
    polls: false,
    trades: false,
    videos: false,
    portfolio: false
  });
  const [errors, setErrors] = useState({});

  // Load initial data
  useEffect(() => {
    loadMarketData();
    loadPolls();
    loadEducationalContent();
  }, []);

  // Load user-specific data when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUserTrades();
      loadUserPortfolio();
    } else {
      setTrades([]);
      setPortfolio([]);
    }
  }, [isAuthenticated, user?.id]);

  // Set loading state helper
  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  // Set error state helper
  const setErrorState = (key, error) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  };

  // Load market data from CoinGecko
  const loadMarketData = async () => {
    try {
      setLoadingState('coins', true);
      setErrorState('coins', null);
      
      const marketData = await coinGeckoService.getMemeCoinsData();
      setCoins(marketData);
      
      // Cache market data in Supabase
      if (isAuthenticated) {
        await supabaseService.updateMarketDataCache(
          marketData.map(coin => ({
            coin_id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            current_price: coin.price,
            market_cap: coin.marketCap,
            price_change_24h: coin.change24h,
            price_change_percentage_24h: coin.changePercentage24h,
            volume_24h: coin.volume24h
          }))
        );
      }
    } catch (error) {
      console.error('Error loading market data:', error);
      setErrorState('coins', error.message);
      
      // Try to load cached data as fallback
      if (isAuthenticated) {
        try {
          const cachedData = await supabaseService.getMarketDataCache();
          if (cachedData.length > 0) {
            const formattedCache = cachedData.map(coin => ({
              id: coin.coin_id,
              name: coin.name,
              symbol: coin.symbol,
              price: coin.current_price,
              change24h: coin.price_change_24h,
              changePercentage24h: coin.price_change_percentage_24h,
              marketCap: coin.market_cap,
              volume24h: coin.volume_24h,
              lastUpdated: coin.last_updated
            }));
            setCoins(formattedCache);
          }
        } catch (cacheError) {
          console.error('Error loading cached market data:', cacheError);
        }
      }
    } finally {
      setLoadingState('coins', false);
    }
  };

  // Load polls from Supabase
  const loadPolls = async () => {
    try {
      setLoadingState('polls', true);
      setErrorState('polls', null);
      
      const pollsData = await supabaseService.getActivePolls();
      setPolls(pollsData);
    } catch (error) {
      console.error('Error loading polls:', error);
      setErrorState('polls', error.message);
    } finally {
      setLoadingState('polls', false);
    }
  };

  // Load educational content
  const loadEducationalContent = async () => {
    try {
      setLoadingState('videos', true);
      setErrorState('videos', null);
      
      const content = await supabaseService.getEducationalContent();
      setVideos(content);
    } catch (error) {
      console.error('Error loading educational content:', error);
      setErrorState('videos', error.message);
      
      // Fallback to basic content if database fails
      setVideos([
        {
          id: '1',
          title: 'What are Meme Coins?',
          description: 'Learn the basics of meme coins and how they differ from traditional cryptocurrencies',
          duration: 15,
          category: 'basics',
          thumbnail: '💰'
        },
        {
          id: '2',
          title: 'Understanding Market Cap',
          description: 'Why market cap matters when evaluating meme coin investments',
          duration: 15,
          category: 'analysis',
          thumbnail: '📊'
        },
        {
          id: '3',
          title: 'Risk Management',
          description: 'How to manage risk when trading volatile meme coins',
          duration: 15,
          category: 'strategy',
          thumbnail: '⚠️'
        }
      ]);
    } finally {
      setLoadingState('videos', false);
    }
  };

  // Load user trades
  const loadUserTrades = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingState('trades', true);
      setErrorState('trades', null);
      
      const userTrades = await supabaseService.getUserTrades(user.id);
      setTrades(userTrades);
    } catch (error) {
      console.error('Error loading user trades:', error);
      setErrorState('trades', error.message);
    } finally {
      setLoadingState('trades', false);
    }
  };

  // Load user portfolio
  const loadUserPortfolio = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingState('portfolio', true);
      setErrorState('portfolio', null);
      
      const userPortfolio = await supabaseService.getUserPortfolio(user.id);
      setPortfolio(userPortfolio);
    } catch (error) {
      console.error('Error loading user portfolio:', error);
      setErrorState('portfolio', error.message);
    } finally {
      setLoadingState('portfolio', false);
    }
  };

  // Add trade
  const addTrade = async (tradeData) => {
    if (!user?.id) throw new Error('User must be logged in to trade');
    
    try {
      const trade = await supabaseService.createTrade({
        user_id: user.id,
        coin: tradeData.coin,
        symbol: tradeData.symbol,
        amount: tradeData.amount,
        price: tradeData.price,
        total_value: tradeData.amount * tradeData.price,
        trade_type: tradeData.type,
        status: 'pending'
      });
      
      setTrades(prev => [trade, ...prev]);
      return trade;
    } catch (error) {
      console.error('Error adding trade:', error);
      throw new Error(error.message || 'Failed to create trade');
    }
  };

  // Update trade status
  const updateTradeStatus = async (tradeId, status, transactionHash = null) => {
    try {
      const updatedTrade = await supabaseService.updateTradeStatus(tradeId, status, transactionHash);
      
      setTrades(prev => prev.map(trade => 
        trade.id === tradeId ? updatedTrade : trade
      ));
      
      // Reload portfolio if trade completed
      if (status === 'completed') {
        await loadUserPortfolio();
      }
      
      return updatedTrade;
    } catch (error) {
      console.error('Error updating trade status:', error);
      throw new Error(error.message || 'Failed to update trade');
    }
  };

  // Vote on poll
  const voteOnPoll = async (pollId, option) => {
    if (!user?.id) throw new Error('User must be logged in to vote');
    
    try {
      await supabaseService.voteOnPoll(pollId, option);
      
      // Update local state
      setPolls(prev => prev.map(poll => {
        if (poll.id === pollId) {
          const newVotes = { ...poll.votes };
          newVotes[option] = (newVotes[option] || 0) + 1;
          
          return {
            ...poll,
            votes: newVotes,
            total_votes: poll.total_votes + 1
          };
        }
        return poll;
      }));
      
      return true;
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw new Error(error.message || 'Failed to vote on poll');
    }
  };

  // Generate educational content
  const generateEducationalContent = async (topic, difficulty = 'beginner') => {
    try {
      const content = await openRouterService.generateEducationalContent(topic, difficulty);
      
      // Save to database
      const savedContent = await supabaseService.createEducationalContent({
        title: content.title,
        description: content.description,
        content: content.script,
        category: 'generated',
        difficulty_level: difficulty,
        duration: content.duration,
        thumbnail: '🤖'
      });
      
      setVideos(prev => [savedContent, ...prev]);
      return savedContent;
    } catch (error) {
      console.error('Error generating educational content:', error);
      throw new Error(error.message || 'Failed to generate content');
    }
  };

  // Get market analysis for a coin
  const getMarketAnalysis = async (coinId) => {
    try {
      const coinData = coins.find(coin => coin.id === coinId);
      if (!coinData) throw new Error('Coin not found');
      
      const analysis = await openRouterService.generateMarketAnalysis(coinData);
      return analysis;
    } catch (error) {
      console.error('Error getting market analysis:', error);
      throw new Error(error.message || 'Failed to generate analysis');
    }
  };

  // Refresh market data
  const refreshMarketData = async () => {
    await loadMarketData();
  };

  // Refresh all data
  const refreshAllData = async () => {
    await Promise.all([
      loadMarketData(),
      loadPolls(),
      loadEducationalContent(),
      isAuthenticated && user?.id ? loadUserTrades() : Promise.resolve(),
      isAuthenticated && user?.id ? loadUserPortfolio() : Promise.resolve()
    ]);
  };

  const value = {
    // Data
    coins,
    polls,
    trades,
    videos,
    portfolio,
    
    // Loading states
    loading,
    errors,
    
    // Actions
    addTrade,
    updateTradeStatus,
    voteOnPoll,
    generateEducationalContent,
    getMarketAnalysis,
    
    // Refresh functions
    refreshMarketData,
    refreshAllData,
    loadUserTrades,
    loadUserPortfolio,
    
    // Legacy compatibility
    setCoins
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
