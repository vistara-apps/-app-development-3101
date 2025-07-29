-- MemeLearn Database Schema
-- Based on the PRD data models

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  investment_goals TEXT[],
  portfolio_value DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades table
CREATE TABLE public.trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  coin TEXT NOT NULL,
  symbol TEXT NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  price DECIMAL(15,8) NOT NULL,
  total_value DECIMAL(15,2) NOT NULL,
  trade_type TEXT CHECK (trade_type IN ('buy', 'sell')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  transaction_hash TEXT,
  fees DECIMAL(15,8) DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Polls table
CREATE TABLE public.polls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of option strings
  votes JSONB DEFAULT '{}', -- Object with option -> vote count mapping
  total_votes INTEGER DEFAULT 0,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll responses table (to track individual user votes)
CREATE TABLE public.poll_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  option TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id) -- Ensure one vote per user per poll
);

-- Educational videos/content table
CREATE TABLE public.educational_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- Generated content/script
  category TEXT CHECK (category IN ('basics', 'analysis', 'strategy', 'risk', 'technical')) NOT NULL,
  duration INTEGER DEFAULT 15, -- Duration in seconds
  thumbnail TEXT, -- Emoji or image URL
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User portfolio holdings
CREATE TABLE public.portfolio_holdings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  coin_id TEXT NOT NULL, -- CoinGecko coin ID
  symbol TEXT NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  average_buy_price DECIMAL(15,8) NOT NULL,
  current_price DECIMAL(15,8),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coin_id)
);

-- User subscriptions for premium features
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')) NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('basic', 'premium', 'pro')) DEFAULT 'basic',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market data cache (to reduce API calls)
CREATE TABLE public.market_data_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coin_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  current_price DECIMAL(15,8),
  market_cap BIGINT,
  price_change_24h DECIMAL(10,4),
  price_change_percentage_24h DECIMAL(10,4),
  volume_24h BIGINT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coin_id)
);

-- Indexes for better performance
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_timestamp ON public.trades(timestamp DESC);
CREATE INDEX idx_poll_responses_poll_id ON public.poll_responses(poll_id);
CREATE INDEX idx_poll_responses_user_id ON public.poll_responses(user_id);
CREATE INDEX idx_portfolio_holdings_user_id ON public.portfolio_holdings(user_id);
CREATE INDEX idx_market_data_cache_last_updated ON public.market_data_cache(last_updated DESC);
CREATE INDEX idx_educational_content_category ON public.educational_content(category);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON public.polls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educational_content_updated_at BEFORE UPDATE ON public.educational_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

