import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  resendApiKey: process.env.RESEND_API_KEY,
  apiKeySalt: process.env.API_KEY_SALT || 'dev-salt',
  browserPoolSize: parseInt(process.env.BROWSER_POOL_SIZE || '3', 10),
};
