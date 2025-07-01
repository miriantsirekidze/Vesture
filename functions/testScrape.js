const { scrapeProduct } = require('./scraper');

const testUrls = [
  'https://www.nordstrom.com/s/ink-letter-button-up-shirt/8251953?origin=category-personalizedsort&breadcrumb=Home%2FSale%2FNew%20Markdowns&color=100',
  'https://www.zappos.com/p/mens-armani-exchange-micro-allover-printed-pique-polo-off-white-circle-ax-logo/product/10007428/color/1110354',
  'https://www.giglio.com/en-ge/clothing-men_sweater-stone-island-5100053s00b2.html?cSel=009',
  'https://www.levi.com/US/en_US/clothing/women/jeans/mid-rise-boyfriend-womens-jeans/p/198870390',
];

(async () => {
  for (const url of testUrls) {
    console.log(`\nScraping: ${url}`);
    try {
      const data = await scrapeProduct(url);
      console.log('Result:', data);
    } catch (err) {
      console.error('Error:', err);
    }
  }
})();