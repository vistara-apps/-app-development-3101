import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [coins, setCoins] = useState([]);
  const [polls, setPolls] = useState([]);
  const [trades, setTrades] = useState([]);
  const [videos, setVideos] = useState([]);

  // Mock data initialization
  useEffect(() => {
    // Initialize mock meme coins data
    setCoins([
      {
        id: 'dogecoin',
        name: 'Dogecoin',
        symbol: 'DOGE',
        price: 0.08,
        change24h: 5.2,
        marketCap: 11500000000,
        image: '🐕'
      },
      {
        id: 'shiba-inu',
        name: 'Shiba Inu',
        symbol: 'SHIB',
        price: 0.000009,
        change24h: -2.1,
        marketCap: 5300000000,
        image: '🐕'
      },
      {
        id: 'pepe',
        name: 'Pepe',
        symbol: 'PEPE',
        price: 0.0000012,
        change24h: 15.7,
        marketCap: 500000000,
        image: '🐸'
      },
      {
        id: 'floki',
        name: 'Floki',
        symbol: 'FLOKI',
        price: 0.00003,
        change24h: 8.4,
        marketCap: 300000000,
        image: '🐕'
      }
    ]);

    // Initialize mock polls
    setPolls([
      {
        id: '1',
        question: 'Which meme coin will perform best next month?',
        options: ['DOGE', 'SHIB', 'PEPE', 'FLOKI'],
        votes: { 'DOGE': 45, 'SHIB': 32, 'PEPE': 78, 'FLOKI': 23 },
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalVotes: 178
      },
      {
        id: '2',
        question: 'What\'s the most important factor when choosing a meme coin?',
        options: ['Community Size', 'Market Cap', 'Utility', 'Meme Quality'],
        votes: { 'Community Size': 67, 'Market Cap': 34, 'Utility': 89, 'Meme Quality': 45 },
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        totalVotes: 235
      }
    ]);

    // Initialize mock educational videos
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
      },
      {
        id: '4',
        title: 'Community Analysis',
        description: 'How to evaluate the strength of a meme coin community',
        duration: 15,
        category: 'analysis',
        thumbnail: '👥'
      }
    ]);
  }, []);

  const addTrade = (trade) => {
    const newTrade = {
      id: Date.now().toString(),
      ...trade,
      timestamp: new Date()
    };
    setTrades(prev => [newTrade, ...prev]);
  };

  const voteOnPoll = (pollId, option) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          votes: {
            ...poll.votes,
            [option]: (poll.votes[option] || 0) + 1
          },
          totalVotes: poll.totalVotes + 1
        };
      }
      return poll;
    }));
  };

  const value = {
    coins,
    polls,
    trades,
    videos,
    addTrade,
    voteOnPoll,
    setCoins
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};