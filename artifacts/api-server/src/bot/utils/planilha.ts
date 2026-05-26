export async function fetchRows(url: string) {
  const res = await fetch(url);
  return await res.json();
}

export function calcularDias(prazo: string | undefined) {
  if (!prazo) return null;

  const dataPrazo = new Date(prazo);
  const hoje = new Date();

  return Math.ceil(
    (dataPrazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );
}