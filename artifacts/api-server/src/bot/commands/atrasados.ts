import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import { fetchRows } from "../utils/sheets";
import { estaAtrasado } from "../utils/atrasados";

const BASE =
  "https://docs.google.com/spreadsheets/d/1i2RSu61Q4ph51iMjJ3sd4IPjJsEnmfDrARmNNfCpe38/gviz/tq?tqx=out:csv";

const BETAGEM_URL = `${BASE}&gid=1086349845`;
const DESIGN_URL = `${BASE}&gid=8022561`;

export const data = new SlashCommandBuilder()
  .setName("atrasados")
  .setDescription("Mostra pedidos atrasados");

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

    const atrasadosBetagem: string[] = [];
    const atrasadosDesign: string[] = [];

    // 🔵 BETAGEM
    for (const row of betagem) {
      const status = get(row, ["status"]).toUpperCase();

      if (status === "ENTREGUE") continue;

      const titulo = get(row, ["titulo da historia"]) || "Sem título";
      const prazo = get(row, ["prazo de entrega"]);

      if (estaAtrasado(prazo)) {
        atrasadosBetagem.push(
          `🔴 ${titulo} • ${status} • ${prazo}`
        );
      }
    }

    // 🎨 DESIGN
    for (const row of design) {
      const status = get(row, ["status"]).toUpperCase();

      if (status === "ENTREGUE") continue;

      const titulo = get(row, ["titulo da historia"]) || "Sem título";
      const prazo = get(row, ["prazo de entrega"]);

      if (estaAtrasado(prazo)) {
        atrasadosDesign.push(
          `🔴 ${titulo} • ${status} • ${prazo}`
        );
      }
    }

    // 📭 nada atrasado
    if (!atrasadosBetagem.length && !atrasadosDesign.length) {
      await interaction.editReply("✅ Nenhum pedido atrasado.");
      return;
    }

    // 📦 resposta final
    let texto = "⏰ **Pedidos atrasados:**\n\n";

    texto += "🎬 **BETAGEM**\n";
    texto += atrasadosBetagem.length
      ? atrasadosBetagem.join("\n") + "\n\n"
      : "Nenhum atrasado.\n\n";

    texto += "🎨 **DESIGN**\n";
    texto += atrasadosDesign.length
      ? atrasadosDesign.join("\n")
      : "Nenhum atrasado.\n";

    await interaction.editReply(texto.slice(0, 2000));
  } catch (err) {
    console.error("Erro no /atrasados:", err);
    await interaction.editReply("❌ Erro ao buscar atrasados.");
  }
}