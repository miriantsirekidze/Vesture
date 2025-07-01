// File: functions/utils/scraper.js

const axios = require('axios');
const cheerio = require('cheerio');
const metascraper = require('metascraper')([
  require('metascraper-title')(),
  require('metascraper-image')(),
]);

// Playwright Extra + Stealth (no proxies, zero cost)
const { chromium } = require('playwright-extra');
const StealthPlugin = require('');
chromium.use(StealthPlugin());

// User-Agent rotation & viewport randomization
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.199 Safari/537.36',
  // add more real UA strings if desired
];

const DEFAULT_HEADERS = {
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

async function fetchHTML(url) {
  console.log('[fetchHTML] fetching:', url);
  const headers = { ...DEFAULT_HEADERS, 'User-Agent': pickRandom(USER_AGENTS) };
  const { data } = await axios.get(url, { headers, timeout: 10000 });
  console.log('[fetchHTML] success');
  return data;
}

async function browserFallback(url) {
  console.log('[browserFallback] start for', url);
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const context = await browser.newContext({
    userAgent: pickRandom(USER_AGENTS),
    locale: 'en-US',
    viewport: {
      width: randBetween(1024, 1920),
      height: randBetween(768, 1080),
    },
  });

  // Block heavy resources
  await context.route('**/*', route => {
    const type = route.request().resourceType();
    if (['image', 'font', 'stylesheet', 'media'].includes(type)) {
      return route.abort();
    }
    route.continue();
  });

  const page = await context.newPage();
  await page.setExtraHTTPHeaders({ ...DEFAULT_HEADERS, 'User-Agent': pickRandom(USER_AGENTS) });

  // Navigate with random waitUntil and timeout
  await page.goto(url, {
    waitUntil: pickRandom(['domcontentloaded', 'networkidle']),
    timeout: 45000,
  });

  // Randomized think time to mimic human behavior
  await page.waitForTimeout(randBetween(1000, 3000));

  // Extract data
  const data = await page.evaluate(() => ({
    title: document.querySelector('h1')?.innerText.trim() || document.title,
    price: document.querySelector('[itemprop=price]')?.innerText.trim() || null,
    images: Array.from(document.querySelectorAll('img')).map(img => img.src).slice(0, 5),
  }));

  await browser.close();
  console.log('[browserFallback] end for', url);
  return data;
}

async function scrapeProduct(url) {
  console.log('[scrapeProduct] start for', url);
  const result = { url, metascraper: null, heuristic: null, browser: null };

  // 1. Try static fetch + cheerio
  let html;
  try {
    html = await fetchHTML(url);
  } catch (err) {
    console.error('[fetchHTML] failed:', err.message);
  }

  if (html) {
    const $ = cheerio.load(html);
    try {
      result.metascraper = await metascraper({ html, url });
    } catch (e) {
      console.warn('[metascraper] error:', e.message);
    }
    const titleText = $('h1').first().text().trim() || $('title').text().trim() || null;
    let price = $('[itemprop=price]').attr('content') || $('[itemprop=price]').text().trim();
    if (!price) {
      const m = $('*[class*=price], *[id*=price]').first().text().match(/[$€£]\s?[\d,.]+/);
      price = m ? m[0].trim() : null;
    }
    const images = $('img').map((_, el) => $(el).attr('src')).get().filter(Boolean).slice(0, 5);
    result.heuristic = { title: titleText, price, images };
  }

  // 2. If static scrape missed title, use browser fallback
  if (!result.heuristic || !result.heuristic.title) {
    try {
      const data = await browserFallback(url);
      result.browser = data;
      if (data.title) {
        result.heuristic = data;
      }
    } catch (err) {
      console.warn('[browserFallback] error:', err.message);
    }
  }

  console.log('[scrapeProduct] end', result);
  return result;
}

module.exports = { scrapeProduct };
