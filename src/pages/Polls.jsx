import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, Users, TrendingUp } from 'lucide-react';
import { useData } from '../context/DataContext';

const Polls = () => {
  const { polls, voteOnPoll } = useData();
  const [votedPolls, setVotedPolls] = useState(new Set());

  const handleVote = (pollId, option) => {
    if (votedPolls.has(pollId)) return;
    
    voteOnPoll(pollId, option);
    setVotedPolls(prev => new Set([...prev, pollId]));
  };

  const formatTimeLeft = (endDate) => {
    const now = new Date();
    const timeLeft = endDate - now;
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getChartData = (poll) => {
    return poll.options.map(option => ({
      name: option,
      votes: poll.votes[option] || 0,
      percentage: ((poll.votes[option] || 0) / poll.totalVotes * 100).toFixed(1)
    }));
  };

  const colors = ['#f97316', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          🗳️ Community Polls
        </h1>
        <p className="text-lg text-secondary-600">
          Share your insights and see what the community thinks about meme coin trends
        </p>
      </div>

      {/* Poll Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <Users className="h-8 w-8 text-primary-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-secondary-900">
            {polls.reduce((sum, poll) => sum + poll.totalVotes, 0)}
          </div>
          <div className="text-sm text-secondary-600">Total Votes</div>
        </div>
        <div className="card text-center">
          <TrendingUp className="h-8 w-8 text-primary-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-secondary-900">{polls.length}</div>
          <div className="text-sm text-secondary-600">Active Polls</div>
        </div>
        <div className="card text-center">
          <Clock className="h-8 w-8 text-primary-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-secondary-900">
            {Math.round(polls.reduce((sum, poll) => sum + poll.totalVotes, 0) / polls.length)}
          </div>
          <div className="text-sm text-secondary-600">Avg Participation</div>
        </div>
      </div>

      {/* Active Polls */}
      <div className="space-y-8">
        {polls.map((poll) => {
          const hasVoted = votedPolls.has(poll.id);
          const chartData = getChartData(poll);

          return (
            <div key={poll.id} className="card">
              <div className="flex flex-col lg:flex-row lg:space-x-8">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-secondary-900">{poll.question}</h3>
                    <div className="flex items-center space-x-2 text-sm text-secondary-500">
                      <Clock className="h-4 w-4" />
                      <span>{formatTimeLeft(poll.endDate)} left</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-secondary-600 mb-2">
                      <span>Total votes: {poll.totalVotes}</span>
                      {hasVoted && <span className="text-primary-500">✓ Voted</span>}
                    </div>
                  </div>

                  {/* Voting Options */}
                  <div className="space-y-3">
                    {poll.options.map((option) => {
                      const votes = poll.votes[option] || 0;
                      const percentage = poll.totalVotes > 0 ? (votes / poll.totalVotes) * 100 : 0;

                      return (
                        <button
                          key={option}
                          onClick={() => handleVote(poll.id, option)}
                          disabled={hasVoted}
                          className={`w-full relative overflow-hidden rounded-lg border-2 transition-all ${
                            hasVoted
                              ? 'border-secondary-200 cursor-not-allowed'
                              : 'border-secondary-200 hover:border-primary-500 hover:shadow-md'
                          }`}
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-primary-100 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="relative flex justify-between items-center p-4">
                            <span className="font-medium text-secondary-900">{option}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-secondary-600">{votes} votes</span>
                              <span className="text-sm font-bold text-primary-600">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chart Visualization */}
                <div className="lg:w-80 mt-6 lg:mt-0">
                  <h4 className="text-lg font-semibold text-secondary-900 mb-4 text-center">
                    Results
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="votes"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {chartData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center space-x-2 text-sm">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="text-secondary-700">{entry.name}</span>
                        <span className="text-secondary-500">({entry.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Poll CTA */}
      <div className="card mt-8 text-center bg-gradient-to-r from-primary-50 to-orange-50">
        <h3 className="text-xl font-bold text-secondary-900 mb-2">
          Want to create your own poll?
        </h3>
        <p className="text-secondary-600 mb-4">
          Premium members can create custom polls and surveys for the community
        </p>
        <button className="btn-primary">
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
};

export default Polls;