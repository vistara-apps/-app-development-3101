import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, GraduationCap, Shield, Users } from 'lucide-react';
import { useData } from '../context/DataContext';

const Home = () => {
  const { coins } = useData();
  const topCoins = coins.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-secondary-900 mb-6">
          Secure and Simple
          <span className="text-primary-500"> Meme Coin Trading</span>
        </h1>
        <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
          Learn, trade, and connect with the meme coin community through bite-sized explainers and community insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/learn" className="btn-primary">
            Start Learning
          </Link>
          <Link to="/trading" className="btn-secondary">
            Explore Trading
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="card text-center">
          <GraduationCap className="h-12 w-12 text-primary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary-900 mb-2">
            15-Second Explainers
          </h3>
          <p className="text-secondary-600">
            Quick, humorous videos that break down complex meme coin concepts into bite-sized lessons.
          </p>
        </div>

        <div className="card text-center">
          <Shield className="h-12 w-12 text-primary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary-900 mb-2">
            Secure Trading
          </h3>
          <p className="text-secondary-600">
            Safe and intuitive platform for buying and selling popular meme coins with real-time data.
          </p>
        </div>

        <div className="card text-center">
          <Users className="h-12 w-12 text-primary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary-900 mb-2">
            Community Polls
          </h3>
          <p className="text-secondary-600">
            Leverage collective wisdom through community polls and surveys on the next big opportunities.
          </p>
        </div>
      </div>

      {/* Top Meme Coins */}
      <div className="card mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-secondary-900">Trending Meme Coins</h2>
          <Link to="/trading" className="text-primary-500 hover:text-primary-600 font-medium">
            View All →
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {topCoins.map((coin) => (
            <div key={coin.id} className="border border-secondary-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{coin.image}</span>
                <div>
                  <h3 className="font-semibold text-secondary-900">{coin.name}</h3>
                  <p className="text-sm text-secondary-500">{coin.symbol}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-secondary-900">
                  ${coin.price.toFixed(6)}
                </span>
                <span className={`text-sm font-medium ${
                  coin.change24h > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {coin.change24h > 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Meme Coin Journey?</h2>
        <p className="text-lg mb-6 opacity-90">
          Join thousands of users learning and trading meme coins safely with MemeLearn.
        </p>
        <Link to="/learn" className="bg-white text-primary-500 px-8 py-3 rounded-lg font-semibold hover:bg-secondary-50 transition-colors">
          Get Started Today
        </Link>
      </div>
    </div>
  );
};

export default Home;