const axios = require('axios');
const cheerio = require('cheerio');

// Function to fetch the text content of a listing page
async function fetchListingTextContent(listingLink) {
    try {
        const response = await axios.get(listingLink);
        const html = response.data;
        const $ = cheerio.load(html);
        let textContent = ''; // Initialize an empty string to store concatenated text content
        textContent += $('.post-excerpt').text().replace(/[\t\n]/g, '').trim()
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
                textContent: textContent
            });
        }
    }
    return listingsTextContent;
}

// Example usage: hitting the endpoint and fetching text content of the listings
axios.get('http://localhost:8000/mazda')
    .then(async (response) => {
        const listings = response.data;
        const listingsTextContent = await fetchListingsTextContent(listings);
        console.log(listingsTextContent);
    })
    .catch((error) => {
        console.error('Error fetching listings:', error);
    });
