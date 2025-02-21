const express = require("express");

const app = express();
const PORT = process.env.PORT || 8080;

// تصدير وظيفة لإعداد السيرفر عند جاهزية البوت
function startServer(client) {
  app.get("/", (req, res) => {
    res.send(`
      <h1>Bot is working properly! ✅</h1>
      <p>🔹 Name Bot: ${client.user.tag}</p>
      <p>🔹Number of servers: ${client.guilds.cache.size}</p>
    `);
  });

  app.listen(PORT, () => {
    console.log(`🌐 Web Server is running on http://localhost:${PORT}`);
  });
}

module.exports = { startServer };
