import app from "./app";
import { logger } from "./lib/logger";
import { createBot, registerCommands } from "./bot/client";
import axios from "axios";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const token = process.env["TOKEN"] ?? process.env["DISCORD_TOKEN"];
const clientId = process.env["DISCORD_CLIENT_ID"];

if (!token || !clientId) {
  throw new Error(
    "DISCORD_TOKEN and DISCORD_CLIENT_ID environment variables are required.",
  );
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  try {
    await registerCommands(token, clientId);

const client = createBot(token);

client.on("shardDisconnect", () => {
  logger.warn("Shard desconectada");
});

client.on("shardReconnecting", () => {
  logger.info("Reconectando shard...");
});

client.on("shardResume", () => {
  logger.info("Shard retomada");
});
  } catch (err) {
    logger.error({ err }, "Failed to start Discord bot");
    process.exit(1);
  }

  const selfUrl = `http://localhost:${port}/api/`;
  setInterval(async () => {
    try {
      await axios.get(selfUrl);
      logger.info("Keep-alive ping sent");
    } catch {
      logger.warn("Keep-alive ping failed");
    }
  }, 1 * 60 * 1000);
});
