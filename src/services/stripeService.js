import { loadStripe } from '@stripe/stripe-js';
import { API_CONFIG } from '../config/api.js';

class StripeService {
  constructor() {
    this.stripePromise = loadStripe(API_CONFIG.stripe.publishableKey);
    this.stripe = null;
    this.init();
  }

  async init() {
    try {
      this.stripe = await this.stripePromise;
    } catch (error) {
      console.error('Error initializing Stripe:', error);
    }
  }

  // Get Stripe instance
  async getStripe() {
    if (!this.stripe) {
      this.stripe = await this.stripePromise;
    }
    return this.stripe;
  }

  // Create payment intent for one-time payments
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      // This would typically call your backend API
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      return clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to initialize payment. Please try again.');
    }
  }

  // Process payment with card element
  async processPayment(clientSecret, cardElement, billingDetails = {}) {
    try {
      const stripe = await this.getStripe();
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create subscription checkout session
  async createSubscriptionCheckout(priceId, customerId = null, metadata = {}) {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerId,
          metadata,
          mode: 'subscription',
          successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/subscription/cancelled`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      const stripe = await this.getStripe();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      throw new Error('Failed to start subscription process. Please try again.');
    }
  }

  // Create one-time payment checkout session
  async createPaymentCheckout(amount, currency = 'usd', description = '', metadata = {}) {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          description,
          metadata,
          mode: 'payment',
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/cancelled`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      const stripe = await this.getStripe();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error creating payment checkout:', error);
      throw new Error('Failed to start payment process. Please try again.');
    }
  }

  // Create setup intent for saving payment methods
  async createSetupIntent(customerId, metadata = {}) {
    try {
      const response = await fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create setup intent');
      }

      const { clientSecret } = await response.json();
      return clientSecret;
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw new Error('Failed to initialize payment method setup. Please try again.');
    }
  }

  // Confirm setup intent
  async confirmSetupIntent(clientSecret, cardElement, billingDetails = {}) {
    try {
      const stripe = await this.getStripe();
      
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        setupIntent
      };
    } catch (error) {
      console.error('Error confirming setup intent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get customer's payment methods
  async getPaymentMethods(customerId) {
    try {
      const response = await fetch(`/api/payment-methods/${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const { paymentMethods } = await response.json();
      return paymentMethods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Failed to load payment methods. Please try again.');
    }
  }

  // Delete payment method
  async deletePaymentMethod(paymentMethodId) {
    try {
      const response = await fetch(`/api/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment method');
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw new Error('Failed to delete payment method. Please try again.');
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId) {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const subscription = await response.json();
      return subscription;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw new Error('Failed to load subscription details. Please try again.');
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelAtPeriodEnd
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      const subscription = await response.json();
      return subscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription. Please try again.');
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, priceId) {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      const subscription = await response.json();
      return subscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription. Please try again.');
    }
  }

  // Get pricing plans
  async getPricingPlans() {
    try {
      const response = await fetch('/api/pricing-plans', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pricing plans');
      }

      const plans = await response.json();
      return plans;
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      return [
        {
          id: 'basic',
          name: 'Basic',
          price: 0,
          interval: 'month',
          features: ['Basic market data', 'Educational videos', 'Community polls']
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 9.99,
          interval: 'month',
          features: ['Real-time market data', 'Advanced analytics', 'Premium content', 'Trading signals']
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 19.99,
          interval: 'month',
          features: ['Everything in Premium', 'Portfolio management', 'API access', 'Priority support']
        }
      ];
    }
  }

  // Validate card number
  validateCardNumber(cardNumber) {
    const stripe = this.stripe;
    if (!stripe) return { valid: false, error: 'Stripe not initialized' };
    
    // Basic validation - Stripe Elements handles more comprehensive validation
    const cleaned = cardNumber.replace(/\s/g, '');
    const isValid = /^\d{13,19}$/.test(cleaned);
    
    return {
      valid: isValid,
      error: isValid ? null : 'Invalid card number format'
    };
  }

  // Format card number for display
  formatCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    const match = cleaned.match(/(\d{1,4})(\d{1,4})?(\d{1,4})?(\d{1,4})?/);
    
    if (!match) return cardNumber;
    
    return [match[1], match[2], match[3], match[4]]
      .filter(Boolean)
      .join(' ');
  }

  // Get card brand from number
  getCardBrand(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6/.test(cleaned)) return 'discover';
    
    return 'unknown';
  }
}

export default new StripeService();

