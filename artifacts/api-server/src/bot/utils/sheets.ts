export async function fetchSheetCSV(url: string) {
  const res = await fetch(url);
  const text = await res.text();

  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const headers = lines[0].split(",");

  return lines.slice(1).map(line => {
    const values = line.split(",");

    const obj: Record<string, string> = {};

    headers.forEach((h, i) => {
      obj[h.trim()] = (values[i] ?? "").trim();
    });

    return obj;
  });
}