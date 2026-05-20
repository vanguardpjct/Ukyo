import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  type TextChannel,
} from "discord.js";
import { enviarNotificacoes } from "../notifier";

const CANAL_ID = "1358514235763855420";

export const data = new SlashCommandBuilder()
  .setName("avisar")
  .setDescription("Envia notificações de pedidos próximos para os staffs");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const canal = (await interaction.client.channels.fetch(
      CANAL_ID,
    )) as TextChannel;

    const count = await enviarNotificacoes(canal);

    await interaction.editReply(
      count > 0
        ? `✅ **${count}** notificações enviadas!`
        : `ℹ️ Nenhum pedido pendente encontrado.`,
    );
  } catch (err) {
    await interaction.editReply(
      "❌ Ocorreu um erro ao buscar a planilha. Tente novamente.",
    );
    throw err;
  }
}
