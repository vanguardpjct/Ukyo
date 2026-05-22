import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  REST,
  Routes,
  type ChatInputCommandInteraction,
  type SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { logger } from "../lib/logger";
import * as ping from "./commands/ping";
import * as hello from "./commands/hello";
import * as roll from "./commands/roll";
import * as help from "./commands/help";
import * as avisar from "./commands/avisar";
import * as status from "./commands/status";

interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const commands: Command[] = [ping, hello, roll, help, avisar, status];

const commandMap = new Collection<string, Command>();
for (const cmd of commands) {
  commandMap.set(cmd.data.name, cmd);
}

export async function registerCommands(token: string, clientId: string) {
  const rest = new REST().setToken(token);
  const body = commands.map((c) => c.data.toJSON());

  logger.info({ count: body.length }, "Registering slash commands");
  await rest.put(Routes.applicationCommands(clientId), { body });
  logger.info("Slash commands registered successfully");
}

export function createBot(token: string) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once(Events.ClientReady, (c) => {
    logger.info(`Logado como ${c.user.tag}`);
  });

  client.on("shardDisconnect", () => {
    logger.warn("Shard desconectada");
  });

  client.on("shardReconnecting", () => {
    logger.info("Reconectando shard...");
  });

  client.on("shardResume", () => {
    logger.info("Shard retomada");
  });

  client.login(token);
  return client;}
