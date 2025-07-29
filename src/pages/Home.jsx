import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, GraduationCap, Shield, Users, Sparkles, Zap, Target } from 'lucide-react';
import { useData } from '../context/DataContext';

const Home = () => {
  const { coins } = useData();
  const topCoins = coins.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative text-center mb-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Sparkles className="h-16 w-16 text-accent-500 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-success-400 rounded-full animate-bounce"></div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-bold mb-6 animate-slide-up">
            <span className="text-secondary-900">Secure and Simple</span>
            <br />
            <span className="text-gradient-meme animate-gradient-x bg-gradient-to-r from-primary-500 via-accent-500 to-success-500 bg-clip-text text-transparent">
              Meme Coin Trading
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-secondary-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
            🚀 Learn, trade, and connect with the meme coin community through 
            <span className="text-primary-600 font-semibold"> bite-sized explainers</span> and 
            <span className="text-accent-600 font-semibold"> community insights</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{animationDelay: '0.4s'}}>
            <Link to="/learn" className="btn-primary group">
              <GraduationCap className="h-5 w-5 mr-2 group-hover:animate-bounce-subtle" />
              Start Learning
            </Link>
            <Link to="/trading" className="btn-accent group">
              <TrendingUp className="h-5 w-5 mr-2 group-hover:animate-bounce-subtle" />
              Explore Trading
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="card-glow text-center group hover-lift animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <GraduationCap className="h-16 w-16 text-primary-500 mx-auto relative z-10 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-bold text-secondary-900 mb-3">
            ⚡ 15-Second Explainers
          </h3>
          <p className="text-secondary-600 leading-relaxed">
            Quick, humorous videos that break down complex meme coin concepts into 
            <span className="text-primary-600 font-medium"> bite-sized lessons</span>.
          </p>
          <div className="mt-4 flex justify-center">
            <span className="status-info">🎯 Learn Fast</span>
          </div>
        </div>

        <div className="card-glow text-center group hover-lift animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-success-400 to-success-600 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <Shield className="h-16 w-16 text-success-500 mx-auto relative z-10 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-bold text-secondary-900 mb-3">
            🛡️ Secure Trading
          </h3>
          <p className="text-secondary-600 leading-relaxed">
            Safe and intuitive platform for buying and selling popular meme coins with 
            <span className="text-success-600 font-medium"> real-time data</span>.
          </p>
          <div className="mt-4 flex justify-center">
            <span className="status-success">🔒 Protected</span>
          </div>
        </div>

        <div className="card-glow text-center group hover-lift animate-slide-up" style={{animationDelay: '0.3s'}}>
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <Users className="h-16 w-16 text-accent-500 mx-auto relative z-10 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-bold text-secondary-900 mb-3">
            🗳️ Community Polls
          </h3>
          <p className="text-secondary-600 leading-relaxed">
            Leverage collective wisdom through community polls and surveys on 
            <span className="text-accent-600 font-medium"> the next big opportunities</span>.
          </p>
          <div className="mt-4 flex justify-center">
            <span className="status-warning">🚀 Trending</span>
          </div>
        </div>
      </div>

      {/* Top Meme Coins */}
      <div className="card-gradient mb-16 animate-slide-up" style={{animationDelay: '0.5s'}}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">
              🔥 Trending Meme Coins
            </h2>
            <p className="text-secondary-600">Real-time market data for the hottest meme coins</p>
          </div>
          <Link 
            to="/trading" 
            className="btn-primary group"
          >
            <span>View All</span>
            <TrendingUp className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {topCoins.map((coin, index) => (
            <div 
              key={coin.id} 
              className="card-interactive group animate-slide-up"
              style={{animationDelay: `${0.6 + index * 0.1}s`}}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <span className="text-3xl group-hover:scale-110 transition-transform inline-block">
                    {coin.image}
                  </span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-success-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-secondary-900 text-lg group-hover:text-primary-600 transition-colors">
                    {coin.name}
                  </h3>
                  <p className="text-sm text-secondary-500 uppercase tracking-wide font-medium">
                    {coin.symbol}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
                    ${coin.price.toFixed(6)}
                  </span>
                  <p className="text-xs text-secondary-500 mt-1">Current Price</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                    coin.change24h > 0 
                      ? 'bg-success-100 text-success-800 border border-success-200' 
                      : 'bg-danger-100 text-danger-800 border border-danger-200'
                  }`}>
                    {coin.change24h > 0 ? '📈 +' : '📉 '}{Math.abs(coin.change24h).toFixed(2)}%
                  </span>
                  <p className="text-xs text-secondary-500 mt-1">24h Change</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-secondary-100">
                <div className="flex justify-between text-xs text-secondary-500">
                  <span>Market Cap</span>
                  <span className="font-medium">${(coin.price * 1000000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden rounded-2xl animate-slide-up" style={{animationDelay: '0.8s'}}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-accent-500 to-success-500 animate-gradient-x"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative z-10 p-12 text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Target className="h-20 w-20 text-white animate-pulse" />
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your 
            <br />
            <span className="text-yellow-300">Meme Coin Journey?</span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-8 opacity-95 max-w-2xl mx-auto leading-relaxed">
            🎯 Join <span className="font-bold text-yellow-300">thousands of users</span> learning and trading meme coins safely with MemeLearn.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/learn" 
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-50 transition-all transform hover:scale-105 hover:shadow-xl group"
            >
              <Sparkles className="h-5 w-5 mr-2 inline group-hover:animate-bounce-subtle" />
              Get Started Today
            </Link>
            <Link 
              to="/trading" 
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all transform hover:scale-105 border border-white/30 group"
            >
              <Zap className="h-5 w-5 mr-2 inline group-hover:animate-bounce-subtle" />
              Start Trading
            </Link>
          </div>
          
          <div className="mt-8 flex justify-center space-x-8 text-sm opacity-80">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>Community Driven</span>
            </div>
            <div className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              <span>Learn & Earn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
