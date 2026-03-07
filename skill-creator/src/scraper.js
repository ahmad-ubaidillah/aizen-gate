const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Aizen-Gate Scraper
 * Pulls text content from a URL to feed into the skill generator.
 */
async function scrapeUrl(url) {
  try {
    console.log(`[SA] Scraping URL: ${url}`);
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Aizen-GateBot/1.0; +http://aizen-gate.ai)",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);

    // Remove boilerplate tags
    $("script, style, nav, footer, header, iframe, noscript").remove();

    // Target main content areas if they exist, otherwise use body
    const contentSelector = "main, article, .content, .main-content, body";
    const rawText = $(contentSelector).text().replace(/\s+/g, " ").trim();

    // Extract title and metadata
    const title = $("title").text() || $("h1").first().text();
    const description = $('meta[name="description"]').attr("content") || "";

    return {
      url,
      title,
      description,
      text: rawText,
    };
  } catch (error) {
    console.error(`[SA] Scraper Error: ${error.message}`);
    throw error;
  }
}

module.exports = { scrapeUrl };
