import { parse } from "csv-parse/sync";

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

  return records.filter((row: any) =>
    Object.values(row).some(
      (v: any) => v && v.toString().trim() !== ""
    )
  );
}