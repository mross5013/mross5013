// playwright-crawler.js
// Run: npm install playwright
const express = require("express");
const axios = require("axios");

const router = express.Router();

const playwright = require('playwright');

async function scrapePage(url) {
    if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided.');
    }

    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log(`Navigating to: ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for a specific selector (optional)
        await page.waitForSelector('body', { timeout: 10000 });

        // Extract all links and text
        const data = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'))
                .map(a => ({ text: a.innerText.trim(), href: a.href }))
                .filter(l => l.href);

            const paragraphs = Array.from(document.querySelectorAll('p'))
                .map(p => p.innerText.trim())
                .filter(Boolean);

            return { links, paragraphs };
        });

        console.log(`Found ${data.links.length} links and ${data.paragraphs.length} paragraphs.`);
        return data;

    } catch (err) {
        console.error(`Error scraping ${url}:`, err.message);
        return null;
    } finally {
        await browser.close();
    }
}

// // Example usage
// (async () => {
    try {
        const result = await scrapePage('https://www.whatnot.com/user/hobbyhavenbycmhr/shop');
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Fatal error:', err.message);
    }
// })();

router.get("/JSON/whatnot", async (req, res) => {
  try {
    try {
        const response = await scrapePage('https://www.whatnot.com/user/hobbyhavenbycmhr/shop');
        console.log(JSON.stringify(result, null, 2));
        const items = response.data.items.map(item => ({
            title: item.title,
            price: item.price,
            image: item.image,
            link: item.url
        }));
        res.json({
            success: true,
            items
        });
    } catch (err) {
        console.error('Fatal error:', err.message);
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
