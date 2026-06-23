export type Row = Record<string, string>;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());

  return result;
}

export async function fetchRows(url: string): Promise<Row[]> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Erro ao buscar planilha: ${res.status}`);
  }

  const text = await res.text();

  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (!lines.length) return [];

  const headers = parseCSVLine(lines[0]);

  console.log("Cabeçalhos encontrados:", headers);

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);

    const row: Row = {};

    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() ?? "";
    });

    return row;
  });
}