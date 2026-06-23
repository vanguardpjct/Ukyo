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

    const betagemPendentes: string[] = [];
    const designPendentes: string[] = [];

    for (const row of betagem) {
      const status = String(row["STATUS"] ?? "").trim().toUpperCase();
      if (!status || status === "ENTREGUE") continue;

      const titulo = String(row["Titulo da história"] ?? "").trim();
      const prazo = String(row["Prazo de entrega"] ?? "").trim();

      betagemPendentes.push(
        `🟡 ${titulo || "Sem título"} • ${status || "SEM STATUS"} • ${prazo || "sem prazo"}`
      );
    }

    for (const row of design) {
      const status = String(row["STATUS"] ?? "").trim().toUpperCase();
      if (!status || status === "ENTREGUE") continue;

      const titulo = String(row["Titulo da história"] ?? "").trim();
      const prazo = String(row["Prazo de entrega"] ?? "").trim();

      designPendentes.push(
        `🟡 ${titulo || "Sem título"} • ${status || "SEM STATUS"} • ${prazo || "sem prazo"}`
      );
    }

    if (!betagemPendentes.length && !designPendentes.length) {
      await interaction.editReply("✅ Nenhum pedido pendente.");
      return;
    }

    let texto = "📋 **Pedidos pendentes:**\n\n";

    texto += "🎬 **BETAGEM**\n";
    texto += betagemPendentes.join("\n") || "Nenhum pedido pendente.";
    texto += "\n\n";

    texto += "🎨 **DESIGN**\n";
    texto += designPendentes.join("\n") || "Nenhum pedido pendente.";

    await interaction.editReply(texto.slice(0, 2000));
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Erro ao buscar dados da planilha.");
  }
}