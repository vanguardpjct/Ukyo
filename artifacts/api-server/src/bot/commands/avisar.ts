import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  TextChannel,
} from "discord.js";

import { fetchRows } from "../utils/sheets";
import { parseData } from "../utils/atrasados";

const CANAL_ID = "1358514235763855420";

const BASE =
  "https://docs.google.com/spreadsheets/d/1i2RSu61Q4ph51iMjJ3sd4IPjJsEnmfDrARmNNfCpe38/gviz/tq?tqx=out:csv";

const BETAGEM_URL = `${BASE}&gid=1086349845`;
const DESIGN_URL = `${BASE}&gid=8022561`;

// 🔥 helper padrão (igual dos outros comandos)
function get(row: any, keys: string[]) {
  for (const key of keys) {
    const value = row?.[key];
    if (value && value.toString().trim()) {
      return value.toString().trim();
    }
  }
  return "";
}

// 🔥 dias restantes usando parser já corrigido
function diasRestantes(prazo: string) {
  const data = parseData(prazo);
  if (!data) return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  data.setHours(0, 0, 0, 0);

  return Math.ceil(
    (data.getTime() - hoje.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

export const data = new SlashCommandBuilder()
  .setName("avisar")
  .setDescription("Avisa pedidos próximos do prazo");

function buildMensagem(id: string, titulo: string, prazo: string, tipo: string) {
  return (
    `📍 **Pedido próximo do prazo!**\n` +
    `<@${id}>\n` +
    `🎨 ${titulo}\n` +
    `🗓️ ${prazo}\n` +
    `📌 ${tipo}`
  );
}

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const [betagem, design] = await Promise.all([
      fetchRows(BETAGEM_URL),
      fetchRows(DESIGN_URL),
    ]);

    const canal = await interaction.client.channels.fetch(CANAL_ID);

    if (!canal || !(canal instanceof TextChannel)) {
      await interaction.editReply("❌ Canal de avisos não encontrado.");
      return;
    }

    let enviados = 0;

    const processar = async (rows: any[], tipo: string) => {
      for (const row of rows) {
        const status = get(row, ["status"]).toUpperCase();

        if (status !== "ACEITO" && status !== "EM ANDAMENTO") {
          continue;
        }

        const id = get(row, ["id do discord"]);
        const titulo = get(row, ["titulo da historia"]) || "Sem título";
        const prazo = get(row, ["prazo de entrega"]);

        if (!id || !prazo) continue;

        const dias = diasRestantes(prazo);

        if (dias === null) continue;

        console.log({ tipo, titulo, status, prazo, dias, id });

        if (dias <= 7) {
          await canal.send(
            buildMensagem(id, titulo, prazo, tipo)
          );

          enviados++;
        }
      }
    };

    await processar(betagem, "BETAGEM");
    await processar(design, "DESIGN");

    await interaction.editReply(`✅ Avisos enviados: ${enviados}`);
  } catch (err) {
    console.error("Erro no /avisar:", err);
    await interaction.editReply("❌ Erro ao buscar dados da planilha.");
  }
}