# Bring-a-Scraper
A NodeJS based web scraper API to collect current auction information from Bring-a-Trailer and analyze it using OpenAI to identify if a car is a good deal and important items to look out for.

## Sample Response

```
Listing: 20k-Mile 1994 Mazda MX-5 Miata M-Edition 5-Speed

https://bringatrailer.com/listing/1994-mazda-mx-5-miata-m-edition-6/

ChatGPT Response: As an expert in Mazda vehicles, I can confirm that this 1994 Mazda MX-5 Miata M-Edition is indeed a sought-after model among enthusiasts due to its limited production numbers and unique features. The low mileage of 20k miles adds to its desirability and overall value. In terms of whether the current price of $13,500 is a good deal, it appears to be in line with the market value for a well-maintained and low-mileage example of the M-Edition Miata. However, it's always a good idea for the buyer to conduct a thorough inspection or have a professional mechanic inspect the vehicle to ensure that it is in good overall condition, especially considering its age. Potential buyers should pay particular attention to the soft top condition, as convertible tops can show signs of wear over time. Additionally, checking for any signs of rust, especially on the undercarriage and around the wheel arches, is crucial when evaluating a vintage vehicle like this Miata. Considering the rarity and desirability of the M-Edition Miata, a good maximum bid for this vehicle would depend on its condition, maintenance history, and overall market demand in the buyer's area. Based on the provided information, a maximum bid in the range of $15,000 to $17,000 would be reasonable for a collector or enthusiast looking to acquire a well-preserved example of the iconic NA Miata.

```

## Usage

```
yarn install
```

```
yarn index.js
```

(open a new tab in your terminal)

```
touch .env
```

Add `OPENAI_API_KEY=....` with your [OpenAI API key](https://platform.openai.com/api-keys) to your `.env` file

```
yarn analyze.js
```

