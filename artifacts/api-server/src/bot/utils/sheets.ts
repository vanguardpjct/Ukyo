export async function fetchRows(url: string): Promise<any[]> {
  const res = await fetch(url);
  const text = await res.text();

  const lines = text.split("\n");

  if (lines.length === 0) return [];

  // 🔥 normaliza headers (evita problema de espaços e diferenças de escrita)
  const headers = parseCSVLine(lines[0]).map((h) =>
    h.trim().toLowerCase()
  );

  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);

    const obj: any = {};

    headers.forEach((h, i) => {
      obj[h] = (values[i] ?? "").trim();
    });

    return obj;
  });

  // 🔥 remove linhas totalmente vazias (corrige seu bug de “pendentes fantasmas”)
  return rows.filter((row) =>
    Object.values(row).some(
      (v) => v && v.toString().trim() !== ""
    )
  );
}

// CSV parser seguro (mantido, mas levemente ajustado)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    // aspas duplas escapadas ""
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
      continue;
    }

    // toggle de aspas
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    // separador de coluna
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