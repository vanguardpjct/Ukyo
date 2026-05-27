import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("pendentes")
  .setDescription("Teste");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply("FUNCIONANDO");
}