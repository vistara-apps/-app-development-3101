# MemeLearn Database Schema

This document describes the database schema for the MemeLearn application, implemented using Supabase PostgreSQL.

## Overview

The database is designed to support a meme coin trading platform with educational content, user portfolios, trading functionality, and community polls. The schema follows the data models specified in the PRD.

## Tables

### 1. Users (`public.users`)

Extends Supabase's built-in authentication with additional user profile information.

```sql
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
```

**Fields:**
- `id`: UUID from Supabase auth.users
- `name`: User's display name
- `email`: User's email address
- `risk_tolerance`: User's risk preference (low, medium, high)
- `investment_goals`: Array of investment goals
- `portfolio_value`: Calculated total portfolio value
- `created_at`, `updated_at`: Timestamps

### 2. Trades (`public.trades`)

Records all trading transactions.

```sql
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
```

**Fields:**
- `id`: Unique trade identifier
- `user_id`: Reference to the user who made the trade
- `coin`: Coin identifier (e.g., 'dogecoin')
- `symbol`: Coin symbol (e.g., 'DOGE')
- `amount`: Amount of coins traded
- `price`: Price per coin at time of trade
- `total_value`: Total USD value of the trade
- `trade_type`: 'buy' or 'sell'
- `status`: Current status of the trade
- `transaction_hash`: Blockchain transaction hash (if applicable)
- `fees`: Trading fees charged

### 3. Polls (`public.polls`)

Community polls for gathering user sentiment.

```sql
CREATE TABLE public.polls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  votes JSONB DEFAULT '{}',
  total_votes INTEGER DEFAULT 0,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique poll identifier
- `question`: The poll question
- `options`: JSONB array of poll options
- `votes`: JSONB object mapping options to vote counts
- `total_votes`: Total number of votes cast
- `end_date`: When the poll expires
- `created_by`: User who created the poll
- `is_active`: Whether the poll is currently active

### 4. Poll Responses (`public.poll_responses`)

Individual user votes on polls.

```sql
CREATE TABLE public.poll_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  option TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);
```

**Fields:**
- `id`: Unique response identifier
- `poll_id`: Reference to the poll
- `user_id`: Reference to the user who voted
- `option`: The option the user selected
- Unique constraint ensures one vote per user per poll

### 5. Educational Content (`public.educational_content`)

Educational videos and content about meme coin trading.

```sql
CREATE TABLE public.educational_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT CHECK (category IN ('basics', 'analysis', 'strategy', 'risk', 'technical')) NOT NULL,
  duration INTEGER DEFAULT 15,
  thumbnail TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique content identifier
- `title`: Content title
- `description`: Brief description
- `content`: Full content/script
- `category`: Content category
- `duration`: Duration in seconds
- `thumbnail`: Emoji or image URL
- `difficulty_level`: Target audience level
- `tags`: Array of tags for categorization
- `view_count`: Number of times viewed
- `is_premium`: Whether premium subscription is required

### 6. Portfolio Holdings (`public.portfolio_holdings`)

User's current cryptocurrency holdings.

```sql
CREATE TABLE public.portfolio_holdings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  coin_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  average_buy_price DECIMAL(15,8) NOT NULL,
  current_price DECIMAL(15,8),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coin_id)
);
```

**Fields:**
- `id`: Unique holding identifier
- `user_id`: Reference to the user
- `coin_id`: CoinGecko coin identifier
- `symbol`: Coin symbol
- `amount`: Amount of coins held
- `average_buy_price`: Average purchase price
- `current_price`: Current market price (cached)
- Unique constraint ensures one holding record per user per coin

### 7. Subscriptions (`public.subscriptions`)

User subscription management for premium features.

```sql
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
```

**Fields:**
- `id`: Unique subscription identifier
- `user_id`: Reference to the user
- `stripe_subscription_id`: Stripe subscription ID
- `status`: Current subscription status
- `plan_type`: Type of subscription plan
- `current_period_start/end`: Billing period dates

### 8. Market Data Cache (`public.market_data_cache`)

Cached market data to reduce API calls.

```sql
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
```

**Fields:**
- `id`: Unique cache entry identifier
- `coin_id`: CoinGecko coin identifier
- `symbol`: Coin symbol
- `name`: Coin name
- Market data fields from CoinGecko API
- `last_updated`: When the data was last refreshed

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

### User Data Access
- Users can only view/modify their own profile data
- Users can only view/modify their own trades and portfolio
- Users can only view/modify their own subscriptions

### Public Data Access
- Anyone can view active polls
- Anyone can view free educational content
- Premium users can view premium educational content
- Authenticated users can view market data cache

### Administrative Access
- Service role can manage market data cache
- Poll creators can update their own polls

## Database Functions

### `update_portfolio_value(user_uuid UUID)`
Calculates and updates a user's total portfolio value based on their holdings.

### `vote_on_poll(poll_uuid UUID, selected_option TEXT)`
Handles poll voting with proper vote counting and duplicate prevention.

### `upsert_portfolio_holding(...)`
Adds or updates a portfolio holding, calculating average buy price.

## Indexes

Performance indexes are created on:
- `trades.user_id` and `trades.timestamp`
- `poll_responses.poll_id` and `poll_responses.user_id`
- `portfolio_holdings.user_id`
- `market_data_cache.last_updated`
- `educational_content.category`

## Triggers

Automatic `updated_at` timestamp triggers are set up for:
- `users`
- `polls`
- `educational_content`
- `subscriptions`

## Migration Files

The schema is implemented in two migration files:

1. `001_initial_schema.sql` - Creates all tables, indexes, and functions
2. `002_rls_policies.sql` - Sets up Row Level Security policies

## Usage Notes

1. **Authentication**: Uses Supabase Auth with extended user profiles
2. **Real-time**: Supports real-time subscriptions for trades, polls, and market data
3. **Caching**: Market data is cached to respect API rate limits
4. **Scalability**: Designed to handle growth with proper indexing
5. **Security**: RLS ensures data isolation between users

## Environment Setup

To set up the database:

1. Create a new Supabase project
2. Run the migration files in order
3. Configure environment variables in your application
4. Set up API keys for external services (CoinGecko, OpenRouter, Stripe)

## API Integration Points

The schema supports integration with:
- **CoinGecko API**: Market data caching
- **OpenRouter LLM API**: Educational content generation
- **Stripe**: Subscription management
- **Supabase Auth**: User authentication
- **Supabase Realtime**: Live updates

