// src/utils/atrasados.ts

export async function fetchRows(url: string) {
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

export function calcularDias(prazo: string | undefined) {
  if (!prazo) return null;

  const dataPrazo = new Date(prazo);
  const hoje = new Date();

  // diferença em dias
  const diff = Math.ceil(
    (dataPrazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diff;
}