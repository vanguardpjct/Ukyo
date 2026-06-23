import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import { fetchRows } from "../utils/sheets";

const BASE =
  "https://docs.google.com/spreadsheets/d/1i2RSu61Q4ph51iMjJ3sd4IPjJsEnmfDrARmNNfCpe38/gviz/tq?tqx=out:csv";

const BETAGEM_URL = `${BASE}&gid=1086349845`;
const DESIGN_URL = `${BASE}&gid=8022561`;

// 🔧 limpa linhas vazias
function limparLinhas(rows: any[]) {
  return rows.filter((row) => {
    if (!row) return false;

    return Object.values(row).some(
      (v) => String(v ?? "").trim() !== ""
    );
  });
}

// 🔧 normaliza headers (remove espaços invisíveis)
function normalizarRow(row: any) {
  const obj: any = {};

  for (const key of Object.keys(row)) {
    obj[key.trim()] = row[key];
  }

  return obj;
}

// 🔧 leitura segura de campo
function get(row: any, key: string, fallback = "") {
  return String(row?.[key] ?? fallback).trim();
}

export const data = new SlashCommandBuilder()
  .setName("pendentes")
  .setDescription("Mostra pedidos pendentes");

export async function execute(interaction: ChatInputCommandInteraction) {
  console.log("🚨 /pendentes chamado");

  await interaction.deferReply();

  try {
    const [betagemRaw, designRaw] = await Promise.all([
      fetchRows(BETAGEM_URL),
      fetchRows(DESIGN_URL),
    ]);

    const betagem = limparLinhas(betagemRaw).map(normalizarRow);
    const design = limparLinhas(designRaw).map(normalizarRow);

    const betagemPendentes: string[] = [];
    const designPendentes: string[] = [];

    // =========================
    // BETAGEM
    // =========================
    for (const row of betagem) {
      const status = get(row, "STATUS").toUpperCase();

      if (!status) continue;
      if (status === "ENTREGUE") continue;

      const titulo =
        get(row, "Titulo da história") ||
        get(row, "Título da história") ||
        "Sem título";

      const prazo =
        get(row, "Prazo de entrega") ||
        get(row, "Prazo de entrega:") ||
        "sem prazo";

      betagemPendentes.push(
        `🟡 ${titulo} • ${status || "SEM STATUS"} • ${prazo}`
      );
    }

    // =========================
    // DESIGN
    // =========================
    for (const row of design) {
      const status = get(row, "STATUS").toUpperCase();

      if (!status) continue;
      if (status === "ENTREGUE") continue;

      const titulo =
        get(row, "Titulo da história") ||
        get(row, "Título da história") ||
        "Sem título";

      const prazo =
        get(row, "Prazo de entrega") ||
        get(row, "Prazo de entrega:") ||
        "sem prazo";

      designPendentes.push(
        `🟡 ${titulo} • ${status || "SEM STATUS"} • ${prazo}`
      );
    }

    // =========================
    // RESPOSTA FINAL
    // =========================
    if (!betagemPendentes.length && !designPendentes.length) {
      await interaction.editReply("✅ Nenhum pedido pendente.");
      return;
    }

    let texto = "📋 **Pedidos pendentes:**\n\n";

    texto += "🎬 **BETAGEM**\n";
    texto += betagemPendentes.length
      ? betagemPendentes.join("\n")
      : "Nenhum pedido pendente.";
    texto += "\n\n";

    texto += "🎨 **DESIGN**\n";
    texto += designPendentes.length
      ? designPendentes.join("\n")
      : "Nenhum pedido pendente.";

    await interaction.editReply(texto.slice(0, 2000));
  } catch (err) {
    console.error("❌ ERRO NO /pendentes:", err);

    await interaction.editReply(
      "❌ Erro ao buscar dados da planilha."
    );
  }
}