export type Row = Record<string, string>;

export async function fetchRows(url: string): Promise<Row[]> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Erro ao buscar planilha: ${res.status}`);
  }

  const text = await res.text();

  const lines = text.trim().split("\n");

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",");

    const row: Row = {};

    headers.forEach((h, i) => {
      row[h] = values[i]?.trim() ?? "";
    });

    return row;
  });
}