import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import { fetchRows } from "../utils/sheets";

const BASE =
  "https://docs.google.com/spreadsheets/d/1i2RSu61Q4ph51iMjJ3sd4IPjJsEnmfDrARmNNfCpe38/gviz/tq?tqx=out:csv";

const BETAGEM_URL = `${BASE}&gid=1086349845`;
const DESIGN_URL = `${BASE}&gid=8022561`;

export const data = new SlashCommandBuilder()
  .setName("pendentes")
  .setDescription("Mostra pedidos pendentes");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const [betagem, design] = await Promise.all([
      fetchRows(BETAGEM_URL),
      fetchRows(DESIGN_URL),
    ]);

    const pendentes: string[] = [];

    for (const row of [...betagem, ...design]) {
      const status = (row["STATUS"] ?? "").trim().toUpperCase();

      if (status === "ENTREGUE") continue;

      const titulo = row["Titulo da história"]?.trim() || "Sem título";
      const prazo =
        row["Prazo de entrega"]?.trim() ||
        row["Prazo de entrega:"]?.trim() ||
        "sem prazo";

      pendentes.push(`🟡 ${titulo} • ${status} • ${prazo}`);
    }

    if (!pendentes.length) {
      return interaction.editReply("✅ Nenhum pedido pendente.");
    }

    return interaction.editReply(
      `📋 **Pedidos pendentes:**\n\n${pendentes.join("\n")}`
    );
  } catch (err) {
    console.error("Erro no /pendentes:", err);
    return interaction.editReply(
      "❌ Erro ao buscar dados da planilha."
    );
  }
}