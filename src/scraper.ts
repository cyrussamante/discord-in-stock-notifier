const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeProduct(url : string) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $("#productTitle").text().trim();
    const price = $("#corePrice_feature_div .a-price .a-offscreen")
      .first()
      .text()
      .trim();

    return {
      title,
      price,
      link: url,
      inStock: !!price,
    };
  } catch (error) {
    console.error("Scraping error:", error);
    return null;
  }
}

module.exports = scrapeProduct;
