import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Check if the bot is alive and measure latency");

export async function execute(interaction: ChatInputCommandInteraction) {
  const sent = await interaction.reply({
    content: "Pinging...",
    fetchReply: true,
  });
  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  await interaction.editReply(
    `Pong! 🏓 Latency: **${latency}ms** | API: **${Math.round(interaction.client.ws.ping)}ms**`,
  );
}
