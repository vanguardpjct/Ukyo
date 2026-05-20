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

function calcularDias(prazo: string): number | null {
  const match = prazo.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;

  const day = parseInt(match[1]!, 10);
  const month = parseInt(match[2]!, 10) - 1;

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const deadline = new Date(ano, month, day);

  const diff = deadline.getTime() - hoje.setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function buildMensagem(id: string, titulo: string, prazo: string): string {
  const dias = calcularDias(prazo);
  const diasTexto =
    dias === null
      ? prazo
      : dias < 0
        ? `atrasado ${Math.abs(dias)} dia(s)`
        : dias === 0
          ? `hoje!`
          : `${dias} dia(s)`;

  void diasTexto;
  return `<@${id}> 📍 Pedido próximo!\n🎨 ${titulo}\n\n`;
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
    const status = (row["STATUS"] ?? "").trim().toLowerCase();
    const prazo = row["Prazo de entrega"]?.trim();

    if (!id || !titulo || !prazo) continue;

    const dias = calcularDias(prazo);
    if (status !== "em andamento" || dias === null || dias < 0 || dias > 7) continue;

    await canal.send(buildMensagem(id, titulo, prazo));
    count++;
  }

  for (const row of design) {
    const id = row["ID DO DISCORD"]?.trim();
    const titulo = row["Titulo da história"]?.trim();
    const status = (row["STATUS"] ?? "").trim().toLowerCase();
    const prazo = row["Prazo de entrega:"]?.trim();

    if (!id || !titulo || !prazo) continue;

    const dias = calcularDias(prazo);
    if (status !== "em andamento" || dias === null || dias < 0 || dias > 7) continue;

    await canal.send(buildMensagem(id, titulo, prazo));
    count++;
  }

  logger.info({ count }, "Notificações enviadas");
  return count;
}
