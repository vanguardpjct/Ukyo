import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import { fetchRows } from "../utils/sheets";

const BASE =
  "https://docs.google.com/spreadsheets/d/1i2RSu61Q4ph51iMjJ3sd4IPjJsEnmfDrARmNNfCpe38/gviz/tq?tqx=out:csv";

const BETAGEM_URL = `${BASE}&gid=1086349845`;
const DESIGN_URL = `${BASE}&gid=8022561`;

function diasDesde(data?: string): number | null {
  if (!data) return null;

  const inicio = new Date(data);
  if (isNaN(inicio.getTime())) return null;

  const hoje = new Date();

  const diffMs = hoje.getTime() - inicio.getTime();

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export const data = new SlashCommandBuilder()
  .setName("atrasados")
  .setDescription("Mostra pedidos atrasados (15 dias)");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const [betagem, design] = await Promise.all([
      fetchRows(BETAGEM_URL),
      fetchRows(DESIGN_URL),
    ]);

    const atrasados: string[] = [];

    for (const row of [...betagem, ...design]) {
      const status = (row["STATUS"] ?? "").trim().toLowerCase();

      if (status === "entregue") continue;

      const titulo =
        row["Titulo da história"]?.trim() || "Sem título";

      const dataInicio =
        row["Data de entrega"]?.trim() ||
        row["Data de entrega:"]?.trim();

      const dias = diasDesde(dataInicio);

      if (dias !== null && dias > 15) {
        const excesso = dias - 15;

        atrasados.push(
          `🔴 ${titulo} • ${excesso} dia(s) atrasado (de ${dias} dias)`
        );
      }
    }

    if (!atrasados.length) {
      await interaction.editReply("✅ Nenhum pedido atrasado.");
      return;
    }

    await interaction.editReply(
      `📍 **Pedidos atrasados:**\n\n${atrasados.join("\n")}`
    );
  } catch (err) {
    console.error("Erro no /atrasados:", err);
    await interaction.editReply(
      "❌ Erro ao buscar dados da planilha."
    );
  }
}