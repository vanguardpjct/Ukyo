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

interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const commands: Command[] = [ping, hello, roll, help];

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
    logger.info(`Online como ${c.user.tag}`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commandMap.get(interaction.commandName);
    if (!command) {
      logger.warn({ command: interaction.commandName }, "Unknown command");
      return;
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      logger.error({ err, command: interaction.commandName }, "Command failed");
      const msg = { content: "An error occurred while running this command.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg);
      } else {
        await interaction.reply(msg);
      }
    }
  });

  client.login(token);
  return client;
}
