import axios from "axios";
import csvParser from "csv-parser";
import { type TextChannel } from "discord.js";
import { logger } from "../lib/logger";

const BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSIeJra7GmTou29HUi5nVKU3VqunWq1nEMumqZgwYh9KEwjzRkZ_kQUAyln8GNNd6sn1he7NPr3Kq4K/pub?output=csv";

const BETAGEM_URL = `${BASE}&gid=1086349845`;
const DESIGN_URL = `${BASE}&gid=8022561`;

async function fetchRows(url: string): Promise<Record<string, string>[]> {
  const response = await axios.get<NodeJS.ReadableStream>(url, {
    responseType: "stream",
  });
  return new Promise((resolve, reject) => {
    const rows: Record<string, string>[] = [];
    (response.data as NodeJS.ReadableStream)
      .pipe(csvParser({ skipLines: 1 }))
      .on("data", (row: Record<string, string>) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

export async function enviarNotificacoes(canal: TextChannel): Promise<number> {
  logger.info("Buscando dados da planilha...");

  const [betagem, design] = await Promise.all([
    fetchRows(BETAGEM_URL),
    fetchRows(DESIGN_URL),
  ]);

  let count = 0;

  for (const row of betagem) {
    const id = row["ID DO DISCORD"]?.trim();
    const titulo = row["Titulo da história"]?.trim();
    const status = row["STATUS"]?.trim();
    const prazo = row["Prazo de entrega"]?.trim();

    if (!id || !titulo || status === "ENTREGUE") continue;

    await canal.send(
      `<@${id}> 📍 Pedido próximo!\n📖 **${titulo}**${prazo ? `\n🗓️ Prazo: **${prazo}**` : ""}\n> *Betagem*`,
    );
    count++;
  }

  for (const row of design) {
    const id = row["ID DO DISCORD"]?.trim();
    const titulo = row["Titulo da história"]?.trim();
    const status = row["STATUS"]?.trim();
    const prazo = row["Prazo de entrega:"]?.trim();

    if (!id || !titulo || status === "ENTREGUE") continue;

    await canal.send(
      `<@${id}> 📍 Pedido próximo!\n🎨 **${titulo}**${prazo ? `\n🗓️ Prazo: **${prazo}**` : ""}\n> *Design*`,
    );
    count++;
  }

  logger.info({ count }, "Notificações enviadas");
  return count;
}
