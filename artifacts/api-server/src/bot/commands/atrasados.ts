import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import { fetchRows } from "../utils/sheets";
import { estaAtrasado } from "../utils/atrasados";

const BASE =
  "https://docs.google.com/spreadsheets/d/1i2RSu61Q4ph51iMjJ3sd4IPjJsEnmfDrARmNNfCpe38/gviz/tq?tqx=out:csv";

const URL = `${BASE}&gid=1086349845`;

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
    const rows = await fetchRows(URL);

    const atrasados: string[] = [];

    for (const row of rows) {
      const status = get(row, ["status"]).toUpperCase();

      // se já foi entregue, ignora
      if (status === "ENTREGUE") continue;

      const titulo = get(row, ["titulo da historia"]) || "Sem título";
      const prazo = get(row, ["prazo de entrega"]);

      if (estaAtrasado(prazo)) {
        atrasados.push(`🔴 ${titulo} • ${status} • ${prazo}`);
      }
    }

    if (!atrasados.length) {
      await interaction.editReply("✅ Nenhum pedido atrasado.");
      return;
    }

    await interaction.editReply(
      "⏰ **Pedidos atrasados:**\n\n" +
        atrasados.join("\n").slice(0, 2000)
    );
  } catch (err) {
    console.error("Erro no /atrasados:", err);
    await interaction.editReply("❌ Erro ao buscar atrasados.");
  }
}