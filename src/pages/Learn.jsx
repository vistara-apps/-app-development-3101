import React, { useState } from 'react';
import { Play, Clock, BookOpen, Star } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePaymentContext } from '../hooks/usePaymentContext';
import VideoGenerator from '../components/VideoGenerator';

const Learn = () => {
  const { videos } = useData();
  const { createSession } = usePaymentContext();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);

  const categories = [
    { id: 'all', name: 'All Videos' },
    { id: 'basics', name: 'Basics' },
    { id: 'analysis', name: 'Analysis' },
    { id: 'strategy', name: 'Strategy' }
  ];

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const handlePremiumAccess = async () => {
    try {
      await createSession("$5");
      setPremiumUnlocked(true);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handleWatchVideo = (videoId) => {
    setWatchedVideos(prev => new Set([...prev, videoId]));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          🎓 Meme Coin Education Center
        </h1>
        <p className="text-lg text-secondary-600">
          Master meme coin trading with our bite-sized video explainers
        </p>
      </div>

      {/* Premium Features */}
      {!premiumUnlocked && (
        <div className="card mb-8 border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-secondary-900 mb-2">
                🌟 Premium Learning Features
              </h3>
              <p className="text-secondary-600 mb-4">
                Generate custom educational videos, get advanced analytics, and access exclusive content
              </p>
              <ul className="text-sm text-secondary-600 space-y-1">
                <li>• AI-generated custom explainer videos</li>
                <li>• Advanced trading tutorials</li>
                <li>• Personalized learning paths</li>
                <li>• Priority community support</li>
              </ul>
            </div>
            <button 
              onClick={handlePremiumAccess}
              className="btn-primary whitespace-nowrap"
            >
              Upgrade for $5
            </button>
          </div>
        </div>
      )}

      {/* Video Generator (Premium Feature) */}
      {premiumUnlocked && (
        <div className="card mb-8">
          <h3 className="text-xl font-bold text-secondary-900 mb-4">
            🤖 AI Video Generator
          </h3>
          <VideoGenerator />
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary-500 text-white'
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => {
          const isWatched = watchedVideos.has(video.id);
          
          return (
            <div key={video.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center h-32 bg-secondary-100 rounded-lg mb-4 text-4xl">
                {video.thumbnail}
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-secondary-900">{video.title}</h3>
                {isWatched && <Star className="h-5 w-5 text-primary-500 fill-current" />}
              </div>
              
              <p className="text-sm text-secondary-600 mb-4">
                {video.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-secondary-500">
                  <Clock className="h-4 w-4" />
                  <span>{video.duration}s</span>
                </div>
                
                <button 
                  onClick={() => handleWatchVideo(video.id)}
                  className="flex items-center space-x-1 text-primary-500 hover:text-primary-600 font-medium"
                >
                  <Play className="h-4 w-4" />
                  <span>Watch</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Tracker */}
      <div className="card mt-8">
        <h3 className="text-xl font-bold text-secondary-900 mb-4">
          📈 Your Learning Progress
        </h3>
        
        <div className="flex items-center space-x-4 mb-4">
          <BookOpen className="h-6 w-6 text-primary-500" />
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Videos Watched</span>
              <span>{watchedVideos.size} / {videos.length}</span>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(watchedVideos.size / videos.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-secondary-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary-500">{watchedVideos.size}</div>
            <div className="text-sm text-secondary-600">Videos Completed</div>
          </div>
          <div className="bg-secondary-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary-500">
              {Math.round((watchedVideos.size / videos.length) * 100)}%
            </div>
            <div className="text-sm text-secondary-600">Course Progress</div>
          </div>
          <div className="bg-secondary-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary-500">
              {watchedVideos.size * 15}s
            </div>
            <div className="text-sm text-secondary-600">Time Invested</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;