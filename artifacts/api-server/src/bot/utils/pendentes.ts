export type Row = { [key: string]: string };

export async function fetchRows(url: string): Promise<Row[]> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Erro ao buscar dados: ${res.status}`);
  }

  const data = (await res.json()) as Row[];

  return data;
}

export function calcularDias(prazo?: string): number | null {
  if (!prazo) return null;

  const dataPrazo = new Date(prazo);
  const hoje = new Date();

  const diffMs = dataPrazo.getTime() - hoje.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDias;
}