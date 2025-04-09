import { Client, Events, GatewayIntentBits, TextChannel } from "discord.js";
const scrapeProduct = require("./scraper");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

interface TrackedProduct {
  url: string;
  lastInStock: boolean;
}

let trackedProducts: TrackedProduct[] = [];

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user?.tag}`);
  startAutoCheck();
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(" ");
  const command = args[0];

  if (command === "!checkstock") {
    const arg = args[1];

    let url: string | undefined;
    if (!arg) {
      return message.channel.send("❌ Please provide a URL or product number from `!list`.");
    } else if (arg.startsWith("http")) {
      url = arg;
    } else {
      const index = parseInt(arg, 10);
      if (isNaN(index) || index < 1 || index > trackedProducts.length) {
        return message.channel.send("❌ Invalid index. Use `!list` to view tracked products.");
      }
      const product = trackedProducts[index - 1];
      if (!product) {
        return message.channel.send("❌ Invalid index. Use `!list` to view tracked products.");
      }
      url = product.url;
    }

    const product = await scrapeProduct(url);
    if (!product) {
      return message.channel.send("❌ Error fetching product info.");
    }

    if (product.inStock) {
      message.channel.send(`🟢 **${message.author} - ${product.title}** is in stock for ${product.price}!\n${product.link}`);
    } else {
      message.channel.send(`🔴 **${message.author} - ${product.title}** is currently out of stock.`);
    }
  }

  if (command === "!addurl") {
    const url = args[1];
    if (!url || !url.startsWith("http")) {
      return message.channel.send("❌ Please provide a valid Amazon product URL.");
    }

    if (trackedProducts.find(p => p.url === url)) {
      return message.channel.send("⚠️ This URL is already being tracked.");
    }

    trackedProducts.push({ url, lastInStock: false });
    message.channel.send(`✅ Added product to tracking list:\n${url}`);
  }

  if (command === "!list") {
    if (trackedProducts.length === 0) {
      return message.channel.send("📭 No products are currently being tracked.");
    }
  
    let listMessage = "🛒 Currently tracked products:\n";
  
    // Fetch latest status for each
    for (let i = 0; i < trackedProducts.length; i++) {
      const product = trackedProducts[i];
      if (!product) continue;
      const { url } = product;
      const data = await scrapeProduct(url);
      const status = data?.inStock ? "✅ In Stock" : "❌ Out of Stock";
      listMessage += `\n${i + 1}. ${status} - ${url}`;
    }
  
    message.channel.send(listMessage);
  }
  

  if (command === "!remove") {
    const index = parseInt(args[1] ?? "", 10);
    if (isNaN(index) || index < 1 || index > trackedProducts.length) {
      return message.channel.send("❌ Invalid index. Use `!list` to view tracked products.");
    }

    const removed = trackedProducts.splice(index - 1, 1)[0];
    if (removed) {
      message.channel.send(`🗑️ Removed product from tracking list:\n${removed.url}`);
    } else {
      message.channel.send("❌ Failed to remove product. Please try again.");
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

function startAutoCheck() {
  const channelId = process.env.ALERT_CHANNEL_ID;
  const userID = process.env.ALERT_CHANNEL_ID;
  const interval = 60 * 1000; // 1 minute

  setInterval(async () => {
    if (!channelId) {
      console.error("ALERT_CHANNEL_ID is not defined in the environment variables.");
      return;
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      console.error("Invalid channel ID or channel is not a text channel.");
      return;
    }

    for (const product of trackedProducts) {
      const data = await scrapeProduct(product.url);
      if (!data) continue;

      if (!product.lastInStock && data.inStock) {
        (channel as TextChannel).send(`🚨 @everyone - **${data.title}** is now IN STOCK for ${data.price}!\n${data.link}`);
      } else if (product.lastInStock && !data.inStock) {
        (channel as TextChannel).send(
          `@everyone - 🔴 **${data.title}** is now OUT OF STOCK.\n${data.link}`
        );
      }
      
      product.lastInStock = data.inStock;
    }
  }, interval);
}
