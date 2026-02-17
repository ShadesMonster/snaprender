import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import pdfRoutes from '../src/routes/pdf.js';
import screenshotRoutes from '../src/routes/screenshot.js';
import healthRoutes from '../src/routes/health.js';

// These tests validate route handling and input validation.
// The renderer tests (which require Playwright browsers installed)
// are skipped if Chromium is not available.

describe('Health route', () => {
  let app;

  before(async () => {
    app = Fastify();
    await app.register(healthRoutes);
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('returns ok status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });
    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.status, 'ok');
    assert.ok(body.timestamp);
  });
});

describe('PDF route validation', () => {
  let app;

  before(async () => {
    app = Fastify();
    await app.register(pdfRoutes);
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('rejects request with no body', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/pdf',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.error.code, 'invalid_request');
  });

  it('rejects request with empty html', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/pdf',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ html: '' }),
    });
    assert.equal(response.statusCode, 400);
  });

  it('rejects invalid format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/pdf',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ html: '<p>test</p>', format: 'B5' }),
    });
    assert.equal(response.statusCode, 400);
  });
});

describe('Screenshot route validation', () => {
  let app;

  before(async () => {
    app = Fastify();
    await app.register(screenshotRoutes);
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('rejects request with no url or html', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/screenshot',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.error.code, 'invalid_request');
  });

  it('rejects invalid url', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/screenshot',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'not-a-url' }),
    });
    assert.equal(response.statusCode, 400);
  });

  it('rejects width too large', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/screenshot',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com', width: 5000 }),
    });
    assert.equal(response.statusCode, 400);
  });
});
