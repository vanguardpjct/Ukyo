import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("pendentes")
  .setDescription("Teste do comando");

export async function execute(interaction: ChatInputCommandInteraction) {
  console.log("🚨 PENDENTES FOI CHAMADO 🚨");
  console.log("Interaction ID:", interaction.id);
  console.log("Deferred:", interaction.deferred);
  console.log("Replied:", interaction.replied);

  try {
    await interaction.reply("✅ Comando funcionando!");
    console.log("✅ Reply enviada");
  } catch (err) {
    console.error("❌ Erro ao responder:");
    console.error(err);
  }
}