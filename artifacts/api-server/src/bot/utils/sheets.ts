export async function fetchRows(url: string): Promise<any[]> {
  const res = await fetch(url);
  const text = await res.text();

  const lines = text.split("\n");

  if (lines.length === 0) return [];

  // 🔥 pega headers e remove vazios (corrige colunas fantasmas do Google Sheets)
  const rawHeaders = parseCSVLine(lines[0]);

  const headers = rawHeaders
    .map((h) => h.trim().toLowerCase())
    .filter((h) => h && h.length > 0);

  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);

    const obj: any = {};

    headers.forEach((h, i) => {
      obj[h] = (values[i] ?? "").trim();
    });

    return obj;
  });

  // 🔥 remove linhas totalmente vazias
  return rows.filter((row) =>
    Object.values(row).some(
      (v) => v && v.toString().trim() !== ""
    )
  );
}

// CSV parser seguro (com suporte a aspas)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    // aspas escapadas ""
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
      continue;
    }

    // toggle aspas
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    // separador CSV
    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);

  return result.map((v) => v.trim());
}