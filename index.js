const fs = require("fs");
const path = require("path");
const Discord = require("discord.js");
const mongoose = require("mongoose");
require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { startServer } = require("./server"); // سيرفر الويب

const PREFIX = process.env.PREFIX; // البريفكس الخاص بالأوامر العادية

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// تحميل الأوامر
client.commands = new Collection();
const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) {
    client.commands.set(command.data.name, command); // دعم Slash Commands
  }
  if (command.name) {
    client.commands.set(command.name, command); // دعم Prefix Commands
  }
}

// استقبال الأوامر العادية (بالبريفكس `!`)
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).split(" ");
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("❌ حدث خطأ أثناء تنفيذ الأمر.");
  }
});

// استقبال الأوامر (Slash Commands)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "❌ حدث خطأ أثناء تنفيذ الأمر.",
      ephemeral: true,
    });
  }
});

// تسجيل الدخول
client.once("ready", () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  startServer(client); // تشغيل السيرفر
});

client.login(process.env.TOKEN);
