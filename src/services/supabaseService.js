import { supabase, handleSupabaseError } from '../lib/supabase.js';

class SupabaseService {
  // User management
  async createUserProfile(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userData.id,
          name: userData.name,
          email: userData.email,
          risk_tolerance: userData.riskTolerance,
          investment_goals: userData.investmentGoals
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  // Trading operations
  async createTrade(tradeData) {
    try {
      const { data, error } = await supabase
        .from('trades')
        .insert([tradeData])
        .select()
        .single();

      if (error) throw error;

      // Update portfolio holding
      if (tradeData.status === 'completed') {
        await this.updatePortfolioHolding(
          tradeData.user_id,
          tradeData.coin,
          tradeData.symbol,
          tradeData.trade_type === 'buy' ? tradeData.amount : -tradeData.amount,
          tradeData.price
        );
      }

      return data;
    } catch (error) {
      console.error('Error creating trade:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async getUserTrades(userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user trades:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async updateTradeStatus(tradeId, status, transactionHash = null) {
    try {
      const updates = { status };
      if (transactionHash) {
        updates.transaction_hash = transactionHash;
      }

      const { data, error } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', tradeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating trade status:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  // Portfolio management
  async updatePortfolioHolding(userId, coinId, symbol, amount, price) {
    try {
      const { error } = await supabase.rpc('upsert_portfolio_holding', {
        user_uuid: userId,
        coin_id_param: coinId,
        symbol_param: symbol,
        amount_param: amount,
        price_param: price
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating portfolio holding:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async getUserPortfolio(userId) {
    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', userId)
        .gt('amount', 0);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user portfolio:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async updatePortfolioValue(userId) {
    try {
      const { data, error } = await supabase.rpc('update_portfolio_value', {
        user_uuid: userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating portfolio value:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  // Polls management
  async createPoll(pollData) {
    try {
      const { data, error } = await supabase
        .from('polls')
        .insert([pollData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async getActivePolls(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .gt('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching active polls:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async voteOnPoll(pollId, option) {
    try {
      const { error } = await supabase.rpc('vote_on_poll', {
        poll_uuid: pollId,
        selected_option: option
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async getUserPollVote(pollId, userId) {
    try {
      const { data, error } = await supabase
        .from('poll_responses')
        .select('option')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data?.option || null;
    } catch (error) {
      console.error('Error fetching user poll vote:', error);
      return null;
    }
  }

  // Educational content management
  async getEducationalContent(category = null, limit = 20) {
    try {
      let query = supabase
        .from('educational_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching educational content:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async createEducationalContent(contentData) {
    try {
      const { data, error } = await supabase
        .from('educational_content')
        .insert([contentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating educational content:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async incrementContentViewCount(contentId) {
    try {
      const { error } = await supabase
        .from('educational_content')
        .update({ view_count: supabase.raw('view_count + 1') })
        .eq('id', contentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error incrementing view count:', error);
      return false;
    }
  }

  // Market data cache management
  async updateMarketDataCache(marketData) {
    try {
      const { error } = await supabase
        .from('market_data_cache')
        .upsert(marketData, { onConflict: 'coin_id' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating market data cache:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async getMarketDataCache(coinIds = null) {
    try {
      let query = supabase
        .from('market_data_cache')
        .select('*')
        .order('last_updated', { ascending: false });

      if (coinIds && coinIds.length > 0) {
        query = query.in('coin_id', coinIds);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching market data cache:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  // Subscription management
  async createSubscription(subscriptionData) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async getUserSubscription(userId) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  async updateSubscription(subscriptionId, updates) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  // Real-time subscriptions
  subscribeToUserTrades(userId, callback) {
    return supabase
      .channel(`user-trades-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'trades',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }

  subscribeToPolls(callback) {
    return supabase
      .channel('polls')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'polls'
      }, callback)
      .subscribe();
  }

  subscribeToMarketData(callback) {
    return supabase
      .channel('market-data')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'market_data_cache'
      }, callback)
      .subscribe();
  }

  // Utility functions
  async executeRawQuery(query, params = {}) {
    try {
      const { data, error } = await supabase.rpc(query, params);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error executing raw query:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  async getTableStats(tableName) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return { tableName, count };
    } catch (error) {
      console.error(`Error getting stats for table ${tableName}:`, error);
      return { tableName, count: 0, error: error.message };
    }
  }
}

export default new SupabaseService();

