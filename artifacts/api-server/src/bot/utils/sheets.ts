export type Row = Record<string, string>;

export async function fetchRows(url: string): Promise<Row[]> {
  const res = await (globalThis as any).fetch(url);

  if (!res) {
    throw new Error("Fetch não disponível no ambiente Node atual");
  }

  const text: string = await res.text();

  const lines: string[] = text.trim().split("\n");

  const headerLine: string = lines[0];
  const dataLines: string[] = lines.slice(1);

  const headers: string[] = headerLine.split(",").map((h: string) => h.trim());

  return dataLines.map((line: string) => {
    const values: string[] = line.split(",");

    const row: Row = {};

    headers.forEach((h: string, i: number) => {
      row[h] = values[i]?.trim() ?? "";
    });

    return row;
  });
}