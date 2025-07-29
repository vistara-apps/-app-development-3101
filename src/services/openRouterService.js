import axios from 'axios';
import { API_CONFIG, DEFAULT_TIMEOUT, CACHE_DURATION } from '../config/api.js';

class OpenRouterService {
  constructor() {
    this.baseURL = API_CONFIG.openRouter.baseUrl;
    this.apiKey = API_CONFIG.openRouter.apiKey;
    this.cache = new Map();
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: DEFAULT_TIMEOUT * 3, // Longer timeout for LLM requests
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MemeLearn Educational Platform'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('OpenRouter API Error:', error.response?.data || error.message);
        throw new Error(this.handleError(error));
      }
    );
  }

  // Cache management
  getCachedContent(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION.EDUCATIONAL_CONTENT) {
      return cached.data;
    }
    return null;
  }

  setCachedContent(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Generate educational content about meme coins
  async generateEducationalContent(topic, difficulty = 'beginner', duration = 15) {
    const cacheKey = `educational-${topic}-${difficulty}-${duration}`;
    const cached = this.getCachedContent(cacheKey);
    
    if (cached) {
      return cached;
    }

    const prompt = this.buildEducationalPrompt(topic, difficulty, duration);
    
    try {
      const response = await this.client.post('/chat/completions', {
        model: difficulty === 'advanced' ? API_CONFIG.openRouter.models.premium : API_CONFIG.openRouter.models.default,
        messages: [
          {
            role: 'system',
            content: 'You are an expert cryptocurrency educator specializing in meme coins. Create engaging, accurate, and easy-to-understand educational content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9
      });

      const content = response.data.choices[0].message.content;
      const parsedContent = this.parseEducationalContent(content, topic, difficulty, duration);
      
      this.setCachedContent(cacheKey, parsedContent);
      return parsedContent;
    } catch (error) {
      console.error('Error generating educational content:', error);
      throw error;
    }
  }

  // Build prompt for educational content generation
  buildEducationalPrompt(topic, difficulty, duration) {
    const difficultyInstructions = {
      beginner: 'Use simple language, avoid jargon, and focus on basic concepts.',
      intermediate: 'Include some technical terms with explanations, and provide more detailed analysis.',
      advanced: 'Use technical language, include complex concepts, and provide in-depth analysis.'
    };

    return `Create a ${duration}-second educational video script about "${topic}" in meme coin trading.

Difficulty Level: ${difficulty}
Instructions: ${difficultyInstructions[difficulty]}

Requirements:
- Script should be exactly ${duration} seconds when read aloud (approximately ${Math.floor(duration * 2.5)} words)
- Include a catchy title
- Add a brief description (1-2 sentences)
- Make it engaging and memorable
- Include practical tips or examples
- Add relevant emojis for visual appeal
- End with a clear takeaway

Format your response as JSON:
{
  "title": "Catchy title here",
  "description": "Brief description here",
  "script": "Full video script here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "takeaway": "Main takeaway message"
}`;
  }

  // Parse the generated content
  parseEducationalContent(content, topic, difficulty, duration) {
    try {
      const parsed = JSON.parse(content);
      return {
        title: parsed.title,
        description: parsed.description,
        script: parsed.script,
        keyPoints: parsed.keyPoints || [],
        takeaway: parsed.takeaway,
        topic,
        difficulty,
        duration,
        wordCount: parsed.script.split(' ').length,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing educational content:', error);
      
      // Fallback parsing if JSON parsing fails
      return {
        title: `Understanding ${topic}`,
        description: 'Learn the fundamentals of meme coin trading.',
        script: content,
        keyPoints: [],
        takeaway: 'Always do your own research before investing.',
        topic,
        difficulty,
        duration,
        wordCount: content.split(' ').length,
        generatedAt: new Date().toISOString()
      };
    }
  }

  // Generate market analysis content
  async generateMarketAnalysis(coinData, timeframe = '24h') {
    const cacheKey = `analysis-${coinData.id}-${timeframe}`;
    const cached = this.getCachedContent(cacheKey);
    
    if (cached) {
      return cached;
    }

    const prompt = `Analyze the market data for ${coinData.name} (${coinData.symbol}):

Current Price: $${coinData.price}
24h Change: ${coinData.changePercentage24h?.toFixed(2)}%
Market Cap: $${coinData.marketCap?.toLocaleString()}
Volume 24h: $${coinData.volume24h?.toLocaleString()}

Provide a brief analysis (100-150 words) covering:
1. Price movement interpretation
2. Market sentiment
3. Key factors to watch
4. Risk assessment

Keep it educational and balanced. Avoid giving financial advice.`;

    try {
      const response = await this.client.post('/chat/completions', {
        model: API_CONFIG.openRouter.models.default,
        messages: [
          {
            role: 'system',
            content: 'You are a cryptocurrency market analyst. Provide educational market analysis without giving financial advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.5
      });

      const analysis = {
        coinId: coinData.id,
        coinName: coinData.name,
        analysis: response.data.choices[0].message.content,
        timeframe,
        generatedAt: new Date().toISOString(),
        marketData: {
          price: coinData.price,
          change24h: coinData.changePercentage24h,
          marketCap: coinData.marketCap,
          volume24h: coinData.volume24h
        }
      };

      this.setCachedContent(cacheKey, analysis);
      return analysis;
    } catch (error) {
      console.error('Error generating market analysis:', error);
      throw error;
    }
  }

  // Generate trading strategy content
  async generateTradingStrategy(riskTolerance, investmentGoals, experience) {
    const cacheKey = `strategy-${riskTolerance}-${investmentGoals.join('-')}-${experience}`;
    const cached = this.getCachedContent(cacheKey);
    
    if (cached) {
      return cached;
    }

    const prompt = `Create a personalized meme coin trading strategy for:

Risk Tolerance: ${riskTolerance}
Investment Goals: ${investmentGoals.join(', ')}
Experience Level: ${experience}

Provide:
1. Recommended portfolio allocation
2. Entry/exit strategies
3. Risk management tips
4. Specific considerations for meme coins
5. Common mistakes to avoid

Keep it educational and emphasize risk management. Limit to 200 words.`;

    try {
      const response = await this.client.post('/chat/completions', {
        model: API_CONFIG.openRouter.models.default,
        messages: [
          {
            role: 'system',
            content: 'You are a cryptocurrency trading educator. Provide educational trading strategies with strong emphasis on risk management.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.6
      });

      const strategy = {
        riskTolerance,
        investmentGoals,
        experience,
        strategy: response.data.choices[0].message.content,
        generatedAt: new Date().toISOString()
      };

      this.setCachedContent(cacheKey, strategy);
      return strategy;
    } catch (error) {
      console.error('Error generating trading strategy:', error);
      throw error;
    }
  }

  // Generate quiz questions for educational content
  async generateQuiz(topic, difficulty = 'beginner', questionCount = 5) {
    const prompt = `Create ${questionCount} multiple-choice quiz questions about "${topic}" in meme coin trading.

Difficulty: ${difficulty}

Format as JSON:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}`;

    try {
      const response = await this.client.post('/chat/completions', {
        model: API_CONFIG.openRouter.models.default,
        messages: [
          {
            role: 'system',
            content: 'You are an educational content creator specializing in cryptocurrency quizzes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      const content = response.data.choices[0].message.content;
      const quiz = JSON.parse(content);
      
      return {
        topic,
        difficulty,
        questions: quiz.questions,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.statusText;
      
      switch (status) {
        case 401:
          return 'Invalid API key. Please check your OpenRouter configuration.';
        case 429:
          return 'Rate limit exceeded. Please try again later.';
        case 500:
          return 'OpenRouter service is temporarily unavailable.';
        default:
          return `API Error: ${message}`;
      }
    } else if (error.request) {
      return 'Network error. Please check your connection.';
    } else {
      return 'An unexpected error occurred while generating content.';
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get available models
  async getAvailableModels() {
    try {
      const response = await this.client.get('/models');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching available models:', error);
      return [];
    }
  }
}

export default new OpenRouterService();

