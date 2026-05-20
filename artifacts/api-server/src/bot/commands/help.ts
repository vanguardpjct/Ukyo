import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Show all available commands");

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle("📖 Bot Commands")
    .setColor(0x5865f2)
    .addFields(
      {
        name: "/ping",
        value: "Check if the bot is alive and measure latency",
        inline: false,
      },
      {
        name: "/hello",
        value: "Say hello to the bot",
        inline: false,
      },
      {
        name: "/roll [sides] [count]",
        value: "Roll dice. Defaults to 1d6. Max 20 dice, up to 1000 sides.",
        inline: false,
      },
      {
        name: "/help",
        value: "Show this help message",
        inline: false,
      },
    )
    .setFooter({ text: "Use any command to get started!" });

  await interaction.reply({ embeds: [embed] });
}
