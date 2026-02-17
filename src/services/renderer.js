import { chromium } from 'playwright';
import { config } from '../config.js';

class BrowserPool {
  constructor(size) {
    this.size = size;
    this.browsers = [];
    this.available = [];
    this.waiting = [];
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    for (let i = 0; i < this.size; i++) {
      const browser = await chromium.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
      this.browsers.push(browser);
      this.available.push(browser);
    }

    this.initialized = true;
    console.log(`Browser pool initialized with ${this.size} instances`);
  }

  async acquire() {
    if (this.available.length > 0) {
      return this.available.pop();
    }

    // Wait for a browser to become available
    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(browser) {
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift();
      resolve(browser);
    } else {
      this.available.push(browser);
    }
  }

  async shutdown() {
    for (const browser of this.browsers) {
      await browser.close();
    }
    this.browsers = [];
    this.available = [];
    this.initialized = false;
    console.log('Browser pool shut down');
  }
}

const pool = new BrowserPool(config.browserPoolSize);

export async function initBrowserPool() {
  await pool.initialize();
}

export async function shutdownBrowserPool() {
  await pool.shutdown();
}

export async function renderPdf(options) {
  const {
    html,
    format = 'A4',
    landscape = false,
    margin,
    scale = 1,
    printBackground = true,
  } = options;

  const browser = await pool.acquire();
  let context;

  try {
    context = await browser.newContext();
    const page = await context.newPage();

    await page.setContent(html, { waitUntil: 'networkidle' });

    const pdfOptions = {
      format,
      landscape,
      scale,
      printBackground,
    };

    if (margin) {
      pdfOptions.margin = {
        top: typeof margin.top === 'number' ? `${margin.top}px` : margin.top || '0px',
        right: typeof margin.right === 'number' ? `${margin.right}px` : margin.right || '0px',
        bottom: typeof margin.bottom === 'number' ? `${margin.bottom}px` : margin.bottom || '0px',
        left: typeof margin.left === 'number' ? `${margin.left}px` : margin.left || '0px',
      };
    }

    const pdfBuffer = await page.pdf(pdfOptions);
    return pdfBuffer;
  } finally {
    if (context) await context.close();
    pool.release(browser);
  }
}

export async function renderScreenshot(options) {
  const {
    url,
    html,
    width = 1280,
    height = 800,
    fullPage = false,
    format = 'png',
    quality,
    delay = 0,
  } = options;

  const browser = await pool.acquire();
  let context;

  try {
    context = await browser.newContext({
      viewport: { width, height },
    });
    const page = await context.newPage();

    if (url) {
      await page.goto(url, { waitUntil: 'networkidle' });
    } else {
      await page.setContent(html, { waitUntil: 'networkidle' });
    }

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const screenshotOptions = {
      fullPage,
      type: format,
    };

    // quality only applies to jpeg
    if (format === 'jpeg' && quality !== undefined) {
      screenshotOptions.quality = quality;
    }

    const imageBuffer = await page.screenshot(screenshotOptions);
    return imageBuffer;
  } finally {
    if (context) await context.close();
    pool.release(browser);
  }
}
