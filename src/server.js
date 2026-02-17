import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { initBrowserPool, shutdownBrowserPool } from './services/renderer.js';
import pdfRoutes from './routes/pdf.js';
import screenshotRoutes from './routes/screenshot.js';
import healthRoutes from './routes/health.js';
import { formatError, ErrorCodes } from './utils/errors.js';

const fastify = Fastify({
  logger: {
    level: config.nodeEnv === 'development' ? 'info' : 'warn',
  },
});

// Plugins
await fastify.register(cors, {
  origin: true,
});

// Routes
await fastify.register(healthRoutes);
await fastify.register(pdfRoutes);
await fastify.register(screenshotRoutes);

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  request.log.error(error);

  if (error.statusCode === 429) {
    return reply.status(429).send(
      formatError(ErrorCodes.RATE_LIMIT_EXCEEDED, error.message, {
        retry_after: error.retryAfter || 60,
      })
    );
  }

  const statusCode = error.statusCode || 500;
  const code = statusCode >= 500 ? ErrorCodes.INTERNAL_ERROR : ErrorCodes.INVALID_REQUEST;
  const message =
    statusCode >= 500
      ? 'An internal error occurred. Please try again later.'
      : error.message;

  return reply.status(statusCode).send(formatError(code, message));
});

// Startup
const start = async () => {
  try {
    console.log('Initializing browser pool...');
    await initBrowserPool();

    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`SnapRender API running on port ${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down...`);
  await fastify.close();
  await shutdownBrowserPool();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();

export { fastify };
