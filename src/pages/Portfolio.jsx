import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const Portfolio = () => {
  const { user } = useAuth();
  const { trades } = useData();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">
            Sign In Required
          </h2>
          <p className="text-secondary-600 mb-6">
            Please sign in to view your portfolio and trading history
          </p>
          <button className="btn-primary">Sign In</button>
        </div>
      </div>
    );
  }

  const userTrades = trades.filter(trade => trade.user === user.id);
  const portfolio = user.portfolio || { totalValue: 0, coins: [] };

  // Generate mock performance data
  const performanceData = [
    { date: '7d ago', value: portfolio.totalValue * 0.9 },
    { date: '6d ago', value: portfolio.totalValue * 0.95 },
    { date: '5d ago', value: portfolio.totalValue * 0.88 },
    { date: '4d ago', value: portfolio.totalValue * 0.92 },
    { date: '3d ago', value: portfolio.totalValue * 0.96 },
    { date: '2d ago', value: portfolio.totalValue * 0.98 },
    { date: 'Today', value: portfolio.totalValue }
  ];

  const totalReturn = portfolio.totalValue * 0.1; // Mock 10% return
  const totalReturnPercent = 10;
  const colors = ['#f97316', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          💼 Your Portfolio
        </h1>
        <p className="text-lg text-secondary-600">
          Track your meme coin investments and trading performance
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <DollarSign className="h-8 w-8 mx-auto mb-2" />
          <div className="text-2xl font-bold">${portfolio.totalValue.toFixed(2)}</div>
          <div className="text-sm opacity-90">Total Value</div>
        </div>
        
        <div className="card text-center">
          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">
            ${Math.abs(totalReturn).toFixed(2)}
          </div>
          <div className="text-sm text-secondary-600">
            {totalReturn > 0 ? 'Total Gains' : 'Total Loss'}
          </div>
        </div>
        
        <div className="card text-center">
          <Percent className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className={`text-2xl font-bold ${totalReturn > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalReturn > 0 ? '+' : ''}{totalReturnPercent.toFixed(2)}%
          </div>
          <div className="text-sm text-secondary-600">Return Rate</div>
        </div>
        
        <div className="card text-center">
          <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">{userTrades.length}</div>
          <div className="text-sm text-secondary-600">Total Trades</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Portfolio Composition */}
        <div className="card">
          <h3 className="text-xl font-bold text-secondary-900 mb-4">Portfolio Composition</h3>
          {portfolio.coins.length > 0 ? (
            <>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolio.coins.map((coin, index) => ({
                        name: coin.symbol,
                        value: coin.amount * coin.averagePrice,
                        percentage: ((coin.amount * coin.averagePrice) / portfolio.totalValue * 100).toFixed(1)
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {portfolio.coins.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {portfolio.coins.map((coin, index) => (
                  <div key={coin.symbol} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="font-medium text-secondary-900">{coin.symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${(coin.amount * coin.averagePrice).toFixed(2)}</div>
                      <div className="text-sm text-secondary-500">
                        {coin.amount.toFixed(4)} coins
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-secondary-500 py-8">
              <p className="mb-4">No coins in portfolio yet</p>
              <p className="text-sm">Start trading to build your portfolio</p>
            </div>
          )}
        </div>

        {/* Performance Chart */}
        <div className="card">
          <h3 className="text-xl font-bold text-secondary-900 mb-4">Performance (7 days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Portfolio Value']} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      {portfolio.coins.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-xl font-bold text-secondary-900 mb-4">Holdings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 font-semibold text-secondary-900">Coin</th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary-900">Amount</th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary-900">Avg Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary-900">Value</th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary-900">P&L</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.coins.map((coin) => {
                  const value = coin.amount * coin.averagePrice;
                  const pnl = value * 0.1; // Mock 10% gain
                  const pnlPercent = 10;

                  return (
                    <tr key={coin.symbol} className="border-b border-secondary-100">
                      <td className="py-4 px-4 font-semibold text-secondary-900">
                        {coin.name} ({coin.symbol})
                      </td>
                      <td className="text-right py-4 px-4">{coin.amount.toFixed(4)}</td>
                      <td className="text-right py-4 px-4">${coin.averagePrice.toFixed(6)}</td>
                      <td className="text-right py-4 px-4 font-semibold">${value.toFixed(2)}</td>
                      <td className={`text-right py-4 px-4 font-semibold ${
                        pnl > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {pnl > 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)} ({pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Trades */}
      <div className="card">
        <h3 className="text-xl font-bold text-secondary-900 mb-4">Recent Trades</h3>
        {userTrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 font-semibold text-secondary-900">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-secondary-900">Coin</th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary-900">Amount</th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary-900">Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary-900">Total</th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {userTrades.slice(0, 10).map((trade) => (
                  <tr key={trade.id} className="border-b border-secondary-100">
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        trade.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium">{trade.coin}</td>
                    <td className="text-right py-4 px-4">{trade.amount}</td>
                    <td className="text-right py-4 px-4">${trade.price.toFixed(6)}</td>
                    <td className="text-right py-4 px-4">${(trade.amount * trade.price).toFixed(2)}</td>
                    <td className="text-right py-4 px-4 text-secondary-500">
                      {trade.timestamp.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-secondary-500 py-8">
            <p className="mb-4">No trades yet</p>
            <p className="text-sm">Start trading to see your history here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;