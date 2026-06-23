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
  console.log("🚨 PENDENTES FOI CHAMADO 🚨");

  await interaction.deferReply();

  try {
    const [betagem, design] = await Promise.all([
      fetchRows(BETAGEM_URL),
      fetchRows(DESIGN_URL),
    ]);

    console.log("BETAGEM:", betagem.length);
    console.log("DESIGN:", design.length);

    console.log("📄 PRIMEIRA LINHA BETAGEM:");
    console.log(JSON.stringify(betagem[0], null, 2));

    console.log("📄 PRIMEIRA LINHA DESIGN:");
    console.log(JSON.stringify(design[0], null, 2));

    console.log("🧾 COLUNAS BETAGEM:");
    console.log(Object.keys(betagem[0] ?? {}));

    console.log("🧾 COLUNAS DESIGN:");
    console.log(Object.keys(design[0] ?? {}));
    
    console.log(JSON.stringify(betagem[0], null, 2));
    console.log(JSON.stringify(betagem[1], null, 2));
    console.log(JSON.stringify(betagem[2], null, 2));

    const betagemPendentes: string[] = [];
    const designPendentes: string[] = [];

    for (const row of betagem) {
      const status = (row["STATUS"] ?? "")
        .trim()
        .toUpperCase();

      if (status === "ENTREGUE") continue;

      const titulo =
        row["Titulo da história"]?.trim() ||
        "Sem título";

      const prazo =
        row["Prazo de entrega"]?.trim() ||
        row["Prazo de entrega:"]?.trim() ||
        "sem prazo";

      betagemPendentes.push(
        `🟡 ${titulo} • ${status || "SEM STATUS"} • ${prazo}`
      );
    }

    for (const row of design) {
      const status = (row["STATUS"] ?? "")
        .trim()
        .toUpperCase();

      if (status === "ENTREGUE") continue;

      const titulo =
        row["Titulo da história"]?.trim() ||
        "Sem título";

      const prazo =
        row["Prazo de entrega"]?.trim() ||
        row["Prazo de entrega:"]?.trim() ||
        "sem prazo";

      designPendentes.push(
        `🟡 ${titulo} • ${status || "SEM STATUS"} • ${prazo}`
      );
    }

    if (!betagemPendentes.length && !designPendentes.length) {
      await interaction.editReply(
        "✅ Nenhum pedido pendente."
      );
      return;
    }

    let texto = "📋 **Pedidos pendentes:**\n\n";

    if (betagemPendentes.length) {
      texto += "🎬 **BETAGEM**\n";
      texto += betagemPendentes.join("\n");
      texto += "\n\n";
    } else {
      texto += "🎬 **BETAGEM**\nNenhum pedido pendente.\n\n";
    }

    if (designPendentes.length) {
      texto += "🎨 **DESIGN**\n";
      texto += designPendentes.join("\n");
    } else {
      texto += "🎨 **DESIGN**\nNenhum pedido pendente.";
    }

    await interaction.editReply(texto.slice(0, 2000));
  } catch (err) {
    console.error("❌ ERRO NO /pendentes:");
    console.error(err);

    await interaction.editReply(
      "❌ Erro ao buscar dados da planilha."
    );
  }
}