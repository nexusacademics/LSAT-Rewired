export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1RmhfvHtUuh9fiLpkndRQ2cO',
    name: 'LSAT Rewired Subscription',
    description: 'Access to all LSAT Rewired features including unlimited practice tests, circuit building, and AI analysis assistance.',
    mode: 'subscription',
    price: '$50.00/month'
  }
];