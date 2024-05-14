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
        let textContent = $('.post-excerpt').text().replace(/[\t\n]/g, '').trim();
        textContent += "\n Comments: \n";

        commentsScript = $('#bat-theme-viewmodels-js-extra').text().replace("var BAT_VMS =", "").replace(/;/g, "")
        comments = JSON.parse(commentsScript)["comments"]
        for (item in comments) {
            comment = comments[item]
            textContent += comment["content"] + "\n"
        }
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
                currentPrice: listing.price
            });
        }
    }
    return listingsTextContent;
}

const runPrompt = async ({ brand = "automotive", currentPrice = 0, textContent }) => {
    const prompt = `Imagine you're a seasoned expert specializing in ${brand} vehicles. Review the provided details: the current price of the given ${brand} model. Evaluate if it's a worthwhile deal, advise on key factors for the buyer to consider, suggest a reasonable maximum bid, and provide a concise summary of the comments section's insights. Do not begin with, "As a seasoned expert..." or similar; just jump right in. Given the following information: listing text content: \n\n${textContent}\n\n Current price: ${currentPrice}\n\n`;
    const gptResponse = await queryChatGPT(prompt);

    return gptResponse;
};

const listingUrl = process.env.URL;
const price = process.env.PRICE;
if (listingUrl) {
    fetchListingTextContent(listingUrl).then(result => {
        const data = {
            link: listingUrl,
            textContent: result,
            currentPrice: price
        };
        result = runPrompt({ currentPrice: data.currentPrice, textContent: data.textContent }).then(result => console.log(result))
    });

} else {
    const models = process.env.MODELS.split(",");
    console.log(models)
    for (const item in models) {
        const model = models[item];
        axios.get(`http://localhost:8000/${model}`)
            .then(async (response) => {
                const listings = response.data;
                const listingsTextContent = await fetchListingsTextContent(listings);
                // Query ChatGPT for each listing's text content and current price
                for (const listing of listingsTextContent) {
                    const brand = model.split('/')[0];
                    result = await runPrompt({ brand, currentPrice: listing.currentPrice, textContent: listing.textContent })
                    if (result) {
                        console.log(`Listing: ${listing.title}`);
                        console.log(`${listing.link} \n`);
                        console.log(result);
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
    }
}

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