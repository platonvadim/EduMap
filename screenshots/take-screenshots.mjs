import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('Taking screenshots...');
  
  // Mobile View
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 }); // iPhone 13 Pro
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // Wait for map to load
  await delay(3000);
  
  // 1. Mobile Home Map
  await page.screenshot({ path: path.join(__dirname, 'mobile-home.png') });
  console.log('Saved mobile-home.png');

  // 2. Mobile Filters Open
  await page.click('[data-tour="map-filter-button"]');
  await delay(1000);
  await page.screenshot({ path: path.join(__dirname, 'mobile-filters.png') });
  console.log('Saved mobile-filters.png');

  // 3. Mobile Catalog
  await page.goto('http://localhost:5173/catalog', { waitUntil: 'networkidle0' });
  await delay(2000);
  await page.screenshot({ path: path.join(__dirname, 'mobile-catalog.png'), fullPage: false });
  console.log('Saved mobile-catalog.png');

  // 4. Mobile Insights
  await page.goto('http://localhost:5173/insights', { waitUntil: 'networkidle0' });
  await delay(2000);
  await page.screenshot({ path: path.join(__dirname, 'mobile-insights.png'), fullPage: false });
  console.log('Saved mobile-insights.png');

  // Desktop View
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await delay(3000);

  // 5. Desktop Home
  await page.screenshot({ path: path.join(__dirname, 'desktop-home.png') });
  console.log('Saved desktop-home.png');

  // 6. Desktop Dark Mode Catalog
  // Toggle dark mode (assuming there's a dark mode toggle button)
  // Let's just evaluate JS to set the dark class
  await page.goto('http://localhost:5173/catalog', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    window.localStorage.setItem('edumap-theme', 'dark');
  });
  await delay(500);
  await page.screenshot({ path: path.join(__dirname, 'desktop-catalog-dark.png') });
  console.log('Saved desktop-catalog-dark.png');

  await browser.close();
  console.log('Done!');
})();
