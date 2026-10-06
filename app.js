const express = require('express');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');

// CRITICAL FOR PASSENGER: Let the server dynamically assign the port environment variable
const PORT = process.env.PORT || 3000; 

const SHOP_URL = 'https://www.whatnot.com/user/hobbyhavenbycmhr/shop';

async function scrapeWhatnotData() {
    const { data } = await axios.get(SHOP_URL, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });

    const $ = cheerio.load(data);
    const listings = [];

    // Target product structure (adjust selectors inside browsers via inspect element)
    $('.product-card-class, [data-testid="product-card"]').each((index, element) => {
        const title = $(element).find('.product-title-class').text().trim();
        const price = $(element).find('.product-price-class').text().trim();
        const imageUrl = $(element).find('img').attr('src');
        const itemLink = $(element).find('a').attr('href');

        if (title) {
            listings.push({
                id: index + 1,
                title,
                price,
                imageUrl,
                url: itemLink ? `https://whatnot.com/${itemLink}` : null
            });
        }
    });

    return listings;
}

// Route setup
app.get('/api/listings', async (req, res) => {
    try {
        const productData = await scrapeWhatnotData();
        res.json({
            success: true,
            count: productData.length,
            data: productData
        });
    } catch (error) {
        console.error("Scraping failed:", error.message);
        res.status(500).json({ success: false, error: "Failed to retrieve store listings. ", message: error.message});
    }
});

// Fallback index message for root URL testing
app.get('/', (req, res) => {
    res.send('Whatnot Scraper Server is running via Passenger.');
});

// CRITICAL FOR PASSENGER: Bind to the environment variable 
app.listen(PORT, () => {
    console.log(`Server handling traffic on port ${PORT}`);
});
