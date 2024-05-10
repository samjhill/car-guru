const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

app.get('/', (req, res) => {
  res.json('Welcome to the Bring a Trailer web scraper. Usage: \'/make\' or \'/make/model\'')
})

app.get('/:make', (req, res) => {
  axios.get(`https://bringatrailer.com/${req.params.make}`)
  .then((resp) => {
    const html = resp.data
    const listings = [];

    const $ = cheerio.load(html)
    $(".listing-card").each(function () {
      
      const title = $("h3 a", this).text()
      const link = $("h3 a", this).attr('href')
      const rawPrice = $(".bidding-bid .bid-formatted", this).text()
      const price = rawPrice.replace('$', '').replace(',', '')
      const ending = $(this).attr('data-timestamp_end')

      listings.push({
        title,
        price,
        ending,
        link
      })
    })
    if (listings.length > 0) res.json(listings)
    else res.json(`no current '${req.params.make}' listings found`)
  }).catch(err => res.json({
    error: `${req.params.make} not found`,
    status: "404"
  }))
})

app.get('/:make/:model', (req, res) => {
  axios.get(`https://bringatrailer.com/${req.params.make}/${req.params.model}`)
  .then((resp) => {
    const html = resp.data
    const listings = [];

    const $ = cheerio.load(html)
    $(".listing-card").each(function () {
      
      const title = $("h3 a", this).text()
      const link = $("h3 a", this).attr('href')
      const rawPrice = $(".bidding-bid .bid-formatted", this).text()
      const price = rawPrice.replace('$', '').replace(',', '')
      const ending = $(this).attr('data-timestamp_end')

      listings.push({
        title,
        price,
        ending,
        link
      })
    })
    if (listings.length > 0) res.json(listings)
    else res.json(`no current '${req.params.make} ${req.params.model}' listings found`)
  }).catch(err => res.json({
    error: `${req.params.make} ${req.params.model} not found`,
    status: "404"
  }))
})

app.listen(PORT, () => console.log("server running on PORT " + PORT))
