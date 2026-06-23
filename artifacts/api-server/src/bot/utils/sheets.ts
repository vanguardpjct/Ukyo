import { parse } from "csv-parse/sync";

function normalize(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .trim()
    .toLowerCase();
}

export async function fetchRows(url: string): Promise<any[]> {
  const res = await fetch(url);
  const text = await res.text();

  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });

  // 🔥 normaliza TODAS as chaves dos objetos
  return records.map((row: any) => {
    const obj: any = {};

    for (const key of Object.keys(row)) {
      obj[normalize(key)] = row[key];
    }

    return obj;
  });
}