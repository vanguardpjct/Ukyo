import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import axios from "axios";
import csvParser from "csv-parser";

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

const STATUS_EMOJI: Record<string, string> = {
  "EM ANDAMENTO": "🔄",
  "EM AVALIAÇÃO": "🔍",
  ACEITO: "✅",
  ENTREGUE: "📦",
};

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("Mostra os pedidos de um membro do staff")
  .addUserOption((opt) =>
    opt
      .setName("membro")
      .setDescription("O membro do staff para consultar")
      .setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const membro = interaction.options.getUser("membro", true);

  const [betagem, design] = await Promise.all([
    fetchRows(BETAGEM_URL),
    fetchRows(DESIGN_URL),
  ]);

  const pedidosBeta = betagem.filter(
    (row) => row["ID DO DISCORD"]?.trim() === membro.id,
  );

  const pedidosDesign = design.filter(
    (row) => row["ID DO DISCORD"]?.trim() === membro.id,
  );

  if (pedidosBeta.length === 0 && pedidosDesign.length === 0) {
    await interaction.editReply(
      `ℹ️ Nenhum pedido encontrado para **${membro.displayName}**.`,
    );
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`📋 Pedidos de ${membro.displayName}`)
    .setColor(0x5865f2)
    .setThumbnail(membro.displayAvatarURL());

  if (pedidosBeta.length > 0) {
    const lines = pedidosBeta.map((row) => {
      const titulo = row["Titulo da história"]?.trim() || "Sem título";
      const status = row["STATUS"]?.trim() || "—";
      const prazo = row["Prazo de entrega"]?.trim() || "—";
      const emoji = STATUS_EMOJI[status] ?? "❓";
      return `${emoji} **${titulo}**\n> Status: ${status} • Prazo: ${prazo}`;
    });
    embed.addFields({
      name: "📖 Betagem",
      value: lines.join("\n\n"),
    });
  }

  if (pedidosDesign.length > 0) {
    const lines = pedidosDesign.map((row) => {
      const titulo = row["Titulo da história"]?.trim() || "Sem título";
      const status = row["STATUS"]?.trim() || "—";
      const prazo = row["Prazo de entrega:"]?.trim() || "—";
      const emoji = STATUS_EMOJI[status] ?? "❓";
      return `${emoji} **${titulo}**\n> Status: ${status} • Prazo: ${prazo}`;
    });
    embed.addFields({
      name: "🎨 Design",
      value: lines.join("\n\n"),
    });
  }

  embed.setFooter({
    text: `Total: ${pedidosBeta.length + pedidosDesign.length} pedido(s)`,
  });

  await interaction.editReply({ embeds: [embed] });
}
