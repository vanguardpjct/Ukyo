import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import { fetchRows } from "../utils/planilha";

export const data = new SlashCommandBuilder()
  .setName("pendentes")
  .setDescription("Mostra pedidos pendentes");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const betagem = await fetchRows(process.env.BETAGEM_URL!);
  const design = await fetchRows(process.env.DESIGN_URL!);

  const pendentes: string[] = [];

  for (const row of [...betagem, ...design]) {
    const titulo = row["Titulo da história"]?.trim();

    const status = (row["STATUS"] ?? "").trim().toLowerCase();

    if (["em andamento", "aceito"].includes(status)) {
      pendentes.push(`🟡 ${titulo}`);
    }
  }

  if (!pendentes.length) {
    return interaction.editReply("✅ Nenhum pedido pendente.");
  }

  await interaction.editReply(
    `📍 **Pedidos pendentes:**\n\n${pendentes.join("\n")}`
  );
}