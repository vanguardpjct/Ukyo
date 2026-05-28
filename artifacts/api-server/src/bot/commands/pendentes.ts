import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("pendentes")
  .setDescription("Teste");

export async function execute(interaction: ChatInputCommandInteraction) {
  console.log("COMANDO EXECUTADO");

  try {
    await interaction.reply("FUNCIONOU");
  } catch (err) {
    console.error("ERRO:", err);
  }
}