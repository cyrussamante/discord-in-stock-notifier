// Packages
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

// const url = "https://a.co/d/9kCw3MX";
// const url =
//   "https://www.amazon.co.uk/Nintendo-Switch-Mario-Kart-World-Black/dp/B0F2T6WNG1/ref=sr_1_4?dib=eyJ2IjoiMSJ9.Nq7zfjdFeQN8qzd2FrLY5b_UeT-AMMw_PB9crRoCWxwQlUhnpasRPRJBCL4Uc9zAlbGx0Qq96EWNtxQV-Vk0kZH8yGXOujpihqRz68OEVxWtg0DSb5MGwPk8ldB4sV0k77No9VIqNcneIkvd8ULB8lRlHd9uLrTv9jdBBF1IaYPWxmVIqQlqDLfm1J87vO744lJZvkCCdm9PyUI7Iabd0pr38I_98bWOwRZ2DW1EK_k.KVPfZFtr8I0xMFRvF4MnRF0lNDxPAUC9fH9q5xw8mHU&dib_tag=se&keywords=nintendo+switch+2&qid=1744218580&sr=8-4";
const url =
  "https://www.amazon.co.uk/Nintendo-Switch-OLED-Model-White/dp/B098TVDYZ3/ref=sr_1_3?crid=2BQZRZOSZHYNS&dib=eyJ2IjoiMSJ9.bZeBwOvm7OcAATT7HRz-pGbzoxySXsWmvyNQT5gK193_hyERrfTPyMzhSP1IM8lbyPLLZ7HJ1Xvq9lU3YUOhk9pxdSpJWfC4XEQKNrSvipDAIyxpKLsdI_OzyR8J9DiVId8V1nUQQtzI8JxjPVB5O8P2AvOo4POhr31RMCsQCP1NT0yyBFlKhxAm6IT8pmI6mLRSfB-VrvprtwpnCilrxgDrblKOJxANCdcgsxal7Rc.E6DRGJI022e9wtehoqCOrIpGylvbv17U_4aWUy4RepU&dib_tag=se&keywords=nintendo+switch&qid=1744220288&sprefix=nintendo+switch+%2Caps%2C315&sr=8-3";
const product = { title: "", price: null, link: "", inStock: false };

async function scrape() {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extract the title
    product.title = $("#productTitle").text().trim();
    // Extract the price
    product.price = $("#corePrice_feature_div .a-price .a-offscreen")
      .first()
      .text()
      .trim();
    product.link = url;
    product.inStock = product.price ? true : false;

    console.log("Title:", product.title);
    console.log("Price:", product.price);
    console.log("URL:", product.link);
    console.log("In Stock:", product.inStock);
  } catch (error) {
    console.error("Error scraping the page:", error);
  }
}

scrape();
