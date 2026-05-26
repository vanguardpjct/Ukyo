import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import { fetchRows, calcularDias } from "../utils/atrasados";

export const data = new SlashCommandBuilder()
  .setName("atrasados")
  .setDescription("Mostra pedidos atrasados");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const betagem = await fetchRows(process.env.BETAGEM_URL!);
  const design = await fetchRows(process.env.DESIGN_URL!);

  const atrasados: string[] = [];

  for (const row of [...betagem, ...design]) {
    const titulo = row["Titulo da história"]?.trim();

    const prazo =
      row["Prazo de entrega"]?.trim() ||
      row["Prazo de entrega:"]?.trim();

    const status = (row["STATUS"] ?? "").trim().toLowerCase();

    const dias = calcularDias(prazo);

    if (
      dias !== null &&
      dias < 0 &&
      ["em andamento", "aceito"].includes(status)
    ) {
      atrasados.push(`🔴 ${titulo} (${dias} dias)`);
    }
  }

  if (!atrasados.length) {
    return interaction.editReply("✅ Nenhum pedido atrasado.");
  }

  await interaction.editReply(
    `📍 **Pedidos atrasados:**\n\n${atrasados.join("\n")}`
  );
}