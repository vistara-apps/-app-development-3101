import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { usePaymentContext } from '../hooks/usePaymentContext';

const Trading = () => {
  const { coins, addTrade } = useData();
  const { user, updateUser } = useAuth();
  const { createSession } = usePaymentContext();
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState('buy');
  const [showTradeModal, setShowTradeModal] = useState(false);

  const handleTrade = async () => {
    if (!user) {
      alert('Please sign in to trade');
      return;
    }

    if (!selectedCoin || !tradeAmount) {
      alert('Please select a coin and enter an amount');
      return;
    }

    try {
      // Create payment session for trading fees
      await createSession("$1"); // $1 trading fee
      
      const trade = {
        coin: selectedCoin.symbol,
        amount: parseFloat(tradeAmount),
        price: selectedCoin.price,
        type: tradeType,
        user: user.id
      };

      addTrade(trade);

      // Update user portfolio
      const portfolioUpdate = { ...user.portfolio };
      if (tradeType === 'buy') {
        portfolioUpdate.totalValue += trade.amount * trade.price;
        const existingCoin = portfolioUpdate.coins.find(c => c.symbol === trade.coin);
        if (existingCoin) {
          existingCoin.amount += trade.amount;
        } else {
          portfolioUpdate.coins.push({
            symbol: trade.coin,
            name: selectedCoin.name,
            amount: trade.amount,
            averagePrice: trade.price
          });
        }
      }

      updateUser({ portfolio: portfolioUpdate });
      setShowTradeModal(false);
      setSelectedCoin(null);
      setTradeAmount('');
      
    } catch (error) {
      console.error('Trade failed:', error);
      alert('Trade failed. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          📈 Meme Coin Trading
        </h1>
        <p className="text-lg text-secondary-600">
          Trade popular meme coins with real-time data and secure transactions
        </p>
      </div>

      {/* Market Overview */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Market Overview</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {coins.filter(c => c.change24h > 0).length}
            </div>
            <div className="text-sm text-green-600">Gainers</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {coins.filter(c => c.change24h < 0).length}
            </div>
            <div className="text-sm text-red-600">Losers</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              ${(coins.reduce((sum, c) => sum + c.marketCap, 0) / 1e9).toFixed(1)}B
            </div>
            <div className="text-sm text-blue-600">Total Market Cap</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <ShoppingCart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{coins.length}</div>
            <div className="text-sm text-purple-600">Available Coins</div>
          </div>
        </div>
      </div>

      {/* Trading Table */}
      <div className="card">
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Available Coins</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="text-left py-3 px-4 font-semibold text-secondary-900">Coin</th>
                <th className="text-right py-3 px-4 font-semibold text-secondary-900">Price</th>
                <th className="text-right py-3 px-4 font-semibold text-secondary-900">24h Change</th>
                <th className="text-right py-3 px-4 font-semibold text-secondary-900">Market Cap</th>
                <th className="text-center py-3 px-4 font-semibold text-secondary-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin) => (
                <tr key={coin.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{coin.image}</span>
                      <div>
                        <div className="font-semibold text-secondary-900">{coin.name}</div>
                        <div className="text-sm text-secondary-500">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 font-semibold">
                    ${coin.price.toFixed(6)}
                  </td>
                  <td className={`text-right py-4 px-4 font-semibold ${
                    coin.change24h > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {coin.change24h > 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </td>
                  <td className="text-right py-4 px-4">
                    ${(coin.marketCap / 1e6).toFixed(0)}M
                  </td>
                  <td className="text-center py-4 px-4">
                    <button
                      onClick={() => {
                        setSelectedCoin(coin);
                        setShowTradeModal(true);
                      }}
                      className="btn-primary text-sm"
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && selectedCoin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-secondary-900 mb-4">
              Trade {selectedCoin.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Trade Type
                </label>
                <select
                  value={tradeType}
                  onChange={(e) => setTradeType(e.target.value)}
                  className="input-field"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Amount ({selectedCoin.symbol})
                </label>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="input-field"
                  placeholder="Enter amount"
                />
              </div>

              <div className="bg-secondary-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span>Price per coin:</span>
                  <span>${selectedCoin.price.toFixed(6)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total cost:</span>
                  <span>${(parseFloat(tradeAmount || 0) * selectedCoin.price).toFixed(6)}</span>
                </div>
                <div className="flex justify-between text-sm text-secondary-600">
                  <span>Trading fee:</span>
                  <span>$1.00</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowTradeModal(false);
                    setSelectedCoin(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTrade}
                  className="flex-1 btn-primary"
                >
                  {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedCoin.symbol}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trading;