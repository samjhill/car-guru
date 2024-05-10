const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');

require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



function cleanText(text) {
    // Remove special characters and excess whitespace
    const cleanedText = text.replace(/[\n\t]/g, ' ').replace(/\s{2,}/g, ' ').trim();
    return cleanedText;
}

// Function to fetch the text content of a listing page
async function fetchListingTextContent(listingLink) {
    try {
        const response = await axios.get(listingLink);
        const html = response.data;
        const $ = cheerio.load(html);
        let textContent = $('.post-excerpt').text().replace(/[\t\n]/g, '').trim(); // Update selector to target the item-excerpt class
        return textContent;
    } catch (error) {
        console.error('Error fetching listing text content:', error);
        return null;
    }
}

// Function to loop through the listings, visit their pages, and fetch text content
async function fetchListingsTextContent(listings) {
    const listingsTextContent = [];
    for (const listing of listings) {
        const textContent = await fetchListingTextContent(listing.link);
        if (textContent) {
            listingsTextContent.push({
                title: listing.title,
                link: listing.link,
                textContent: textContent,
                currentPrice: listing.price // Add current price to the fetched text content
            });
        }
    }
    return listingsTextContent;
}

// Example usage: hitting the endpoint, fetching text content of the listings, and querying ChatGPT
axios.get('http://localhost:8000/mazda')
    .then(async (response) => {
        const listings = response.data;
        const listingsTextContent = await fetchListingsTextContent(listings);
        // Query ChatGPT for each listing's text content and current price
        for (const listing of listingsTextContent) {
            const prompt = `Roleplay as an expert in Mazda vehicles. Given the following information:\n\n${listing.textContent}\n\nCurrent price: ${listing.currentPrice}\n\nIs this a good deal? What should the buyer look out for? And what is a good maximum bid for this vehicle?`;
            const gptResponse = await queryChatGPT(prompt);
            if (gptResponse) {
                console.log(`Listing: ${listing.title}`);
                console.log(`${listing.link}`);
                console.log('ChatGPT Response:', gptResponse);
                console.log('------------------------------------------');
            }
            else {
                console.log(`no gpt response for ${listing.title}`)
            }
        }
    })
    .catch((error) => {
        console.error('Error fetching listings:', error);
    });

// Function to query OpenAI's ChatGPT API
async function queryChatGPT(prompt) {
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-3.5-turbo",
          });
        return cleanText(completion.choices[0].message.content);
    } catch (error) {
        console.error('Error querying ChatGPT:', error.response ? error.response.data : error.message);
        return null;
    }
}