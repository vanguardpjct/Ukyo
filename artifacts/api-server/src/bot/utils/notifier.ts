import {
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";



const CANAL_ID = "1358514235763855420";

const BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSIeJra7GmTou29HUi5nVKU3VqunWq1nEMumqZgwYh9KEwjzRkZ_kQUAyln8GNNd6sn1he7NPr3Kq4K/pub?output=csv";

const BETAGEM_URL = `${BASE}&gid=1086349845`;
const DESIGN_URL = `${BASE}&gid=8022561`;

/* ---------------- UTIL ---------------- */

function parseDataGoogle(dateStr: string): Date | null {
  if (!dateStr) return null;

  // formato: 20/06/2026 00:00:00
  const [data] = dateStr.split(" ");
  const [d, m, y] = data.split("/");

  if (!d || !m || !y) return null;

  return new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    0,
    0,
    0
  );
}

function diasEntre(a: Date, b: Date) {
  const diff = b.getTime() - a.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function buildMensagem(id: string, titulo: string, prazo: string, tipo: string) {
  return (
    `📍 **Pedido próximo do prazo!**\n` +
    `<@${id}>\n` +
    `🎨 ${titulo}\n` +
    `🗓️ ${prazo}\n` +
    `📌 ${tipo}\n`
  );
}

/* ---------------- COMMAND ---------------- */

export const data = new SlashCommandBuilder()
  .setName("avisar")
  .setDescription("Notifica pedidos com 7 dias ou menos para entrega");

export default async function fetchSheetCSV(interaction: any) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const [betagem, design] = await Promise.all([
      fetchSheetCSV(BETAGEM_URL),
      fetchSheetCSV(DESIGN_URL),
    ]);

    const hoje = new Date();

    const canal = (await interaction.client.channels.fetch(
      CANAL_ID
    )) as TextChannel;

    let enviados = 0;

    const processar = (rows: any[], tipo: string) => {
      for (const row of rows) {
        const status = (row["STATUS"] ?? "").trim().toUpperCase();

        // ignora entregues
        if (status === "ENTREGUE") continue;

        const idDiscord = row["ID DO DISCORD"]?.trim();
        const titulo = row["Titulo da história"]?.trim() || "Sem título";
        const prazoStr = row["Prazo de entrega"]?.trim();

        if (!idDiscord || !prazoStr) continue;

        const prazoDate = parseDataGoogle(prazoStr);
        if (!prazoDate) continue;

        const dias = diasEntre(hoje, prazoDate);

        // 🔥 regra principal: 7 dias ou menos (inclui atrasados)
        if (dias <= 7) {
          const msg = buildMensagem(idDiscord, titulo, prazoStr, tipo);
          canal.send({ content: msg });
          enviados++;
        }
      }
    };

    processar("BETAGEM");
    processar(design, "DESIGN");

    await interaction.editReply(
      `✅ Notificações enviadas: ${enviados}`
    );
  } catch (err) {
    console.error("Erro no /avisar:", err);
    await interaction.editReply("❌ Erro ao processar planilha.");
  }
}