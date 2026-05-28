import axios from "axios";
import csvParser from "csv-parser";
import { Readable } from "stream";

export type Row = Record<string, string>;

export async function fetchRows(url: string): Promise<Row[]> {
  const response = await axios.get(url);

  return new Promise((resolve, reject) => {
    const rows: Row[] = [];

    Readable.from(response.data)
      .pipe(csvParser())
      .on("data", (row: Row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}