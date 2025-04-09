import http from "http";

const PORT = process.env.PORT || 3000;

http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running.\n");
}).listen(PORT, () => {
  console.log(`Keep-alive server running on port ${PORT}`);
});
