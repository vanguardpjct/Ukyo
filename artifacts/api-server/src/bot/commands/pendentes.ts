import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import { fetchRows } from "../utils/sheets";

const BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSIeJra7GmTou29HUi5nVKU3VqunWq1nEMumqZgwYh9KEwjzRkZ_kQUAyln8GNNd6sn1he7NPr3Kq4P/pub?output=csv";

const BETAGEM_URL = `${BASE}&gid=1086349845`;
const DESIGN_URL = `${BASE}&gid=8022561`;

export const data = new SlashCommandBuilder()
  .setName("pendentes")
  .setDescription("Mostra pedidos pendentes");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const [betagem, design] = await Promise.all([
    fetchRows(BETAGEM_URL),
    fetchRows(DESIGN_URL),
  ]);

  const pendentes: string[] = [];

  for (const row of [...betagem, ...design]) {
    const status = (row["STATUS"] ?? "").trim().toUpperCase();

    if (status === "ENTREGUE") continue;

    const titulo = row["Titulo da história"]?.trim();
    const prazo =
      row["Prazo de entrega"]?.trim() ||
      row["Prazo de entrega:"]?.trim();

    pendentes.push(`🟡 ${titulo} • ${status} • ${prazo}`);
  }

  if (!pendentes.length) {
    await interaction.editReply("✅ Nenhum pedido pendente.");
    return;
  }

  await interaction.editReply(
    `📋 **Pedidos pendentes:**\n\n${pendentes.join("\n")}`
  );
}