import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import { fetchRows } from "../utils/sheets";

const BASE =
  "https://docs.google.com/spreadsheets/d/1i2RSu61Q4ph51iMjJ3sd4IPjJsEnmfDrARmNNfCpe38/gviz/tq?tqx=out:csv";

const BETAGEM_URL = `${BASE}&gid=1086349845`;
const DESIGN_URL = `${BASE}&gid=8022561`;

function limparLinhas(rows: any[]) {
  return rows.filter((row) =>
    Array.isArray(row) &&
    row.some((v) => String(v ?? "").trim() !== "")
  );
}

function get(row: any[], index: number) {
  return String(row?.[index] ?? "").trim();
}

export const data = new SlashCommandBuilder()
  .setName("pendentes")
  .setDescription("Mostra pedidos pendentes");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const [betagemRaw, designRaw] = await Promise.all([
      fetchRows(BETAGEM_URL),
      fetchRows(DESIGN_URL),
    ]);

    const betagem = limparLinhas(betagemRaw);
    const design = limparLinhas(designRaw);

    const betagemPendentes: string[] = [];
    const designPendentes: string[] = [];

    // =========================
    // BETAGEM
    // =========================
    for (const row of betagem) {
      const titulo = get(row, 10); // K
      const status = get(row, 4).toUpperCase(); // E
      const prazo = get(row, 25); // Z

      if (!status) continue;
      if (status === "ENTREGUE") continue;

      betagemPendentes.push(
        `🟡 ${titulo || "Sem título"} • ${status || "SEM STATUS"} • ${prazo || "sem prazo"}`
      );
    }

    // =========================
    // DESIGN
    // =========================
    for (const row of design) {
      const titulo = get(row, 10); // K
      const status = get(row, 4).toUpperCase(); // E
      const prazo = get(row, 25); // Z

      if (!status) continue;
      if (status === "ENTREGUE") continue;

      designPendentes.push(
        `🟡 ${titulo || "Sem título"} • ${status || "SEM STATUS"} • ${prazo || "sem prazo"}`
      );
    }

    // =========================
    // RESPOSTA
    // =========================
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
    console.error("❌ ERRO NO /pendentes:", err);
    await interaction.editReply("❌ Erro ao buscar dados da planilha.");
  }
}