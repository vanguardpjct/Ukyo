export async function fetchRows(url: string) {
  const res = await fetch(url);
  const text = await res.text();

  const lines = text
    .split("\n")
    .filter((l) => l.trim() !== "");

  const headers = parseCSVLine(lines[0]);

  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);

    const obj: any = {};

    headers.forEach((h, i) => {
      obj[h.trim()] = values[i] ?? "";
    });

    return obj;
  });

  return rows;
}

// parser correto de CSV (respeita aspas e vírgulas internas)
function parseCSVLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

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