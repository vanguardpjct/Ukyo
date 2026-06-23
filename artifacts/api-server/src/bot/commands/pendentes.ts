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

// 🔥 helper seguro de leitura
function get(row: any, keys: string[]) {
  for (const key of keys) {
    const value = row?.[key];
    if (value && value.toString().trim()) {
      return value.toString().trim();
    }
  }
  return "";
}

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const [betagem, design] = await Promise.all([
      fetchRows(BETAGEM_URL),
      fetchRows(DESIGN_URL),
    ]);

    const betagemPendentes: string[] = [];
    const designPendentes: string[] = [];

    // 🔵 BETAGEM
    for (const row of betagem) {
      const status = get(row, ["status"]).toUpperCase();

      if (!status || status === "ENTREGUE") continue;

      const titulo = get(row, ["titulo da historia"]) || "Sem título";
      const prazo = get(row, ["prazo de entrega"]) || "sem prazo";

      betagemPendentes.push(
        `🟡 ${titulo} • ${status} • ${prazo}`
      );
    }

    // 🎨 DESIGN
    for (const row of design) {
      const status = get(row, ["status"]).toUpperCase();

      if (!status || status === "ENTREGUE") continue;

      const titulo = get(row, ["titulo da historia"]) || "Sem título";
      const prazo = get(row, ["prazo de entrega"]) || "sem prazo";

      designPendentes.push(
        `🟡 ${titulo} • ${status} • ${prazo}`
      );
    }

    // 📭 vazio total
    if (!betagemPendentes.length && !designPendentes.length) {
      await interaction.editReply("✅ Nenhum pedido pendente.");
      return;
    }

    // 📦 resposta final
    let texto = "📋 **Pedidos pendentes:**\n\n";

    texto += "🎬 **BETAGEM**\n";
    texto += betagemPendentes.length
      ? betagemPendentes.join("\n") + "\n\n"
      : "Nenhum pedido pendente.\n\n";

    texto += "🎨 **DESIGN**\n";
    texto += designPendentes.length
      ? designPendentes.join("\n")
      : "Nenhum pedido pendente.\n";

    await interaction.editReply(texto.slice(0, 2000));
  } catch (err) {
    console.error("Erro no /pendentes:", err);
    await interaction.editReply("❌ Erro ao buscar dados da planilha.");
  }
}