import app from "./app";
import { logger } from "./lib/logger";
import { createBot, registerCommands } from "./bot/client";

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

const token = process.env["DISCORD_TOKEN"];
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
    createBot(token);
  } catch (err) {
    logger.error({ err }, "Failed to start Discord bot");
    process.exit(1);
  }
});
