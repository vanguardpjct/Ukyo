import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { REST, Routes } from "discord.js";

// recria __dirname (necessário em ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// carrega o .env da mesma pasta do arquivo
dotenv.config({ path: path.resolve(__dirname, ".env") });

// IMPORTA SEUS COMANDOS (ajuste se necessário)
import { data as pendentes } from "./src/bot/commands/pendentes";
import { data as atrasados } from "./src/bot/commands/atrasados";
import { data as hello } from "./src/bot/commands/hello";

const commands = [
  hello.toJSON(),
  pendentes.toJSON(),
  atrasados.toJSON(),
];

async function main() {
  console.log("Registrando comandos...");

  const token = process.env.TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId || !guildId) {
    throw new Error("TOKEN, CLIENT_ID ou GUILD_ID não estão no .env");
  }

  const rest = new REST({ version: "10" }).setToken(token);

  await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands }
  );

  console.log("Comandos registrados com sucesso!");
}

main().catch((err) => {
  console.error("Erro ao registrar comandos:", err);
});