import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pdfSchema, screenshotSchema } from '../src/utils/validation.js';

describe('pdfSchema', () => {
  it('accepts valid minimal input', () => {
    const result = pdfSchema.safeParse({ html: '<h1>Hello</h1>' });
    assert.ok(result.success);
    assert.equal(result.data.html, '<h1>Hello</h1>');
    assert.equal(result.data.format, 'A4');
    assert.equal(result.data.landscape, false);
    assert.equal(result.data.scale, 1);
    assert.equal(result.data.printBackground, true);
  });

  it('accepts valid full input', () => {
    const result = pdfSchema.safeParse({
      html: '<h1>Invoice</h1>',
      format: 'Letter',
      landscape: true,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      scale: 1.5,
      printBackground: false,
    });
    assert.ok(result.success);
    assert.equal(result.data.format, 'Letter');
    assert.equal(result.data.landscape, true);
    assert.equal(result.data.scale, 1.5);
  });

  it('rejects missing html', () => {
    const result = pdfSchema.safeParse({});
    assert.ok(!result.success);
  });

  it('rejects empty html', () => {
    const result = pdfSchema.safeParse({ html: '' });
    assert.ok(!result.success);
  });

  it('rejects invalid format', () => {
    const result = pdfSchema.safeParse({ html: '<p>test</p>', format: 'B5' });
    assert.ok(!result.success);
  });

  it('rejects scale out of range', () => {
    const result = pdfSchema.safeParse({ html: '<p>test</p>', scale: 3.0 });
    assert.ok(!result.success);
  });

  it('rejects scale too small', () => {
    const result = pdfSchema.safeParse({ html: '<p>test</p>', scale: 0.05 });
    assert.ok(!result.success);
  });
});

describe('screenshotSchema', () => {
  it('accepts valid URL input', () => {
    const result = screenshotSchema.safeParse({ url: 'https://example.com' });
    assert.ok(result.success);
    assert.equal(result.data.url, 'https://example.com');
    assert.equal(result.data.width, 1280);
    assert.equal(result.data.height, 800);
    assert.equal(result.data.format, 'png');
  });

  it('accepts valid HTML input', () => {
    const result = screenshotSchema.safeParse({ html: '<h1>Hello</h1>' });
    assert.ok(result.success);
  });

  it('accepts full options', () => {
    const result = screenshotSchema.safeParse({
      url: 'https://example.com',
      width: 1920,
      height: 1080,
      fullPage: true,
      format: 'jpeg',
      quality: 90,
      delay: 2000,
    });
    assert.ok(result.success);
    assert.equal(result.data.fullPage, true);
    assert.equal(result.data.format, 'jpeg');
    assert.equal(result.data.quality, 90);
  });

  it('rejects when neither url nor html is provided', () => {
    const result = screenshotSchema.safeParse({});
    assert.ok(!result.success);
  });

  it('rejects invalid url', () => {
    const result = screenshotSchema.safeParse({ url: 'not-a-url' });
    assert.ok(!result.success);
  });

  it('rejects width too large', () => {
    const result = screenshotSchema.safeParse({ url: 'https://example.com', width: 5000 });
    assert.ok(!result.success);
  });

  it('rejects quality out of range', () => {
    const result = screenshotSchema.safeParse({ url: 'https://example.com', quality: 101 });
    assert.ok(!result.success);
  });

  it('rejects delay too high', () => {
    const result = screenshotSchema.safeParse({ url: 'https://example.com', delay: 20000 });
    assert.ok(!result.success);
  });

  it('rejects invalid format', () => {
    const result = screenshotSchema.safeParse({ url: 'https://example.com', format: 'gif' });
    assert.ok(!result.success);
  });
});
