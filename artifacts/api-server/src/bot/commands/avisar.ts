import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  TextChannel,
} from "discord.js";

import { fetchRows } from "../utils/sheets";

const CANAL_ID = "1358514235763855420";

const BASE =
  "https://docs.google.com/spreadsheets/d/1i2RSu61Q4ph51iMjJ3sd4IPjJsEnmfDrARmNNfCpe38/gviz/tq?tqx=out:csv";

const BETAGEM_URL = `${BASE}&gid=1086349845`;
const DESIGN_URL = `${BASE}&gid=8022561`;

export const data = new SlashCommandBuilder()
  .setName("avisar")
  .setDescription("Avisa pedidos próximos do prazo");

function diasRestantes(dataStr: string): number | null {
  if (!dataStr) return null;

  const dataLimpa = dataStr.split(" ")[0];
  const partes = dataLimpa.split("/");

  if (partes.length !== 3) return null;

  const dia = Number(partes[0]);
  const mes = Number(partes[1]) - 1;
  const ano = Number(partes[2]);

  const prazo = new Date(ano, mes, dia);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  prazo.setHours(0, 0, 0, 0);

  return Math.ceil(
    (prazo.getTime() - hoje.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

function buildMensagem(
  id: string,
  titulo: string,
  prazo: string,
  tipo: string
) {
  return (
    `📍 **Pedido próximo do prazo!**\n` +
    `<@${id}>\n` +
    `🎨 ${titulo}\n` +
    `🗓️ ${prazo}\n` +
    `📌 ${tipo}`
  );
}

export async function execute(
  interaction: ChatInputCommandInteraction
) {
  await interaction.deferReply();

  try {
    const [betagem, design] = await Promise.all([
      fetchRows(BETAGEM_URL),
      fetchRows(DESIGN_URL),
    ]);

    const canal = await interaction.client.channels.fetch(
      CANAL_ID
    );

    if (!canal || !(canal instanceof TextChannel)) {
      await interaction.editReply(
        "❌ Canal de avisos não encontrado."
      );
      return;
    }

    let enviados = 0;

    const processar = async (
      rows: Record<string, string>[],
      tipo: string
    ) => {
      for (const row of rows) {
        const status = (row["STATUS"] ?? "")
          .trim()
          .toUpperCase();

        if (
          status !== "ACEITO" &&
          status !== "EM ANDAMENTO"
        ) {
          continue;
        }

        const id =
          row["ID DO DISCORD"]?.trim() || "";

        const prazo =
          row["PRAZO DE ENTREGA"]?.trim() ||
          row["Prazo de entrega"]?.trim() ||
          row["Prazo de entrega:"]?.trim() ||
          "";

        const titulo =
          row["TITULO"]?.trim() ||
          row["Titulo da história"]?.trim() ||
          "Sem título";

        if (!id || !prazo) continue;

        const dias = diasRestantes(prazo);

        if (dias === null) continue;

        console.log({
          tipo,
          titulo,
          status,
          prazo,
          dias,
          id,
        });

        if (dias <= 7) {
          await canal.send(
            buildMensagem(
              id,
              titulo,
              prazo,
              tipo
            )
          );

          enviados++;
        }
      }
    };

    await processar(betagem, "BETAGEM");
    await processar(design, "DESIGN");

    await interaction.editReply(
      `✅ Avisos enviados: ${enviados}`
    );
  } catch (err) {
    console.error("Erro no /avisar:", err);

    await interaction.editReply(
      "❌ Erro ao buscar dados da planilha."
    );
  }
}