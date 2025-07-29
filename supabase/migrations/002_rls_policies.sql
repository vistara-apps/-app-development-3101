-- Row Level Security (RLS) Policies for MemeLearn

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trades table policies
CREATE POLICY "Users can view their own trades" ON public.trades
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades" ON public.trades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" ON public.trades
    FOR UPDATE USING (auth.uid() = user_id);

-- Polls table policies (public read, authenticated users can create)
CREATE POLICY "Anyone can view active polls" ON public.polls
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create polls" ON public.polls
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Poll creators can update their polls" ON public.polls
    FOR UPDATE USING (auth.uid() = created_by);

-- Poll responses policies
CREATE POLICY "Users can view poll responses" ON public.poll_responses
    FOR SELECT USING (true); -- Public read for vote counts

CREATE POLICY "Users can insert their own poll responses" ON public.poll_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own poll responses" ON public.poll_responses
    FOR UPDATE USING (auth.uid() = user_id);

-- Educational content policies
CREATE POLICY "Anyone can view free educational content" ON public.educational_content
    FOR SELECT USING (is_premium = false);

CREATE POLICY "Premium users can view premium content" ON public.educational_content
    FOR SELECT USING (
        is_premium = false OR 
        (is_premium = true AND EXISTS (
            SELECT 1 FROM public.subscriptions 
            WHERE user_id = auth.uid() 
            AND status = 'active' 
            AND plan_type IN ('premium', 'pro')
        ))
    );

-- Portfolio holdings policies
CREATE POLICY "Users can view their own portfolio" ON public.portfolio_holdings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own portfolio" ON public.portfolio_holdings
    FOR ALL USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Market data cache policies (public read for all authenticated users)
CREATE POLICY "Authenticated users can view market data" ON public.market_data_cache
    FOR SELECT USING (auth.role() = 'authenticated');

-- Service role policies for market data updates
CREATE POLICY "Service role can manage market data" ON public.market_data_cache
    FOR ALL USING (auth.role() = 'service_role');

-- Functions for common operations

-- Function to update portfolio value
CREATE OR REPLACE FUNCTION update_portfolio_value(user_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_value DECIMAL(15,2) := 0;
BEGIN
    SELECT COALESCE(SUM(amount * COALESCE(current_price, average_buy_price)), 0)
    INTO total_value
    FROM public.portfolio_holdings
    WHERE user_id = user_uuid;
    
    UPDATE public.users
    SET portfolio_value = total_value,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    RETURN total_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle poll voting
CREATE OR REPLACE FUNCTION vote_on_poll(poll_uuid UUID, selected_option TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_uuid UUID := auth.uid();
    existing_vote TEXT;
BEGIN
    -- Check if user already voted
    SELECT option INTO existing_vote
    FROM public.poll_responses
    WHERE poll_id = poll_uuid AND user_id = user_uuid;
    
    IF existing_vote IS NOT NULL THEN
        -- Update existing vote
        UPDATE public.poll_responses
        SET option = selected_option
        WHERE poll_id = poll_uuid AND user_id = user_uuid;
        
        -- Update poll vote counts (decrement old, increment new)
        UPDATE public.polls
        SET votes = votes - jsonb_build_object(existing_vote, 1) + jsonb_build_object(selected_option, 1),
            updated_at = NOW()
        WHERE id = poll_uuid;
    ELSE
        -- Insert new vote
        INSERT INTO public.poll_responses (poll_id, user_id, option)
        VALUES (poll_uuid, user_uuid, selected_option);
        
        -- Update poll vote counts and total
        UPDATE public.polls
        SET votes = COALESCE(votes, '{}'::jsonb) + jsonb_build_object(selected_option, 1),
            total_votes = total_votes + 1,
            updated_at = NOW()
        WHERE id = poll_uuid;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add or update portfolio holding
CREATE OR REPLACE FUNCTION upsert_portfolio_holding(
    user_uuid UUID,
    coin_id_param TEXT,
    symbol_param TEXT,
    amount_param DECIMAL,
    price_param DECIMAL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.portfolio_holdings (user_id, coin_id, symbol, amount, average_buy_price)
    VALUES (user_uuid, coin_id_param, symbol_param, amount_param, price_param)
    ON CONFLICT (user_id, coin_id)
    DO UPDATE SET
        amount = portfolio_holdings.amount + amount_param,
        average_buy_price = (
            (portfolio_holdings.amount * portfolio_holdings.average_buy_price) + 
            (amount_param * price_param)
        ) / (portfolio_holdings.amount + amount_param),
        last_updated = NOW();
        
    -- Update user's total portfolio value
    PERFORM update_portfolio_value(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

