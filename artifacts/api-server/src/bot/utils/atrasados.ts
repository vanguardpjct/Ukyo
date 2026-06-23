export function parseData(prazo: string | undefined): Date | null {
  if (!prazo) return null;

  // remove hora se existir
  const onlyDate = prazo.split(" ")[0];

  // tenta dd/mm/yyyy
  const parts = onlyDate.split("/");

  if (parts.length !== 3) return null;

  let [dd, mm, yyyy] = parts;

  // corrige ano curto (26 → 2026)
  if (yyyy.length === 2) {
    yyyy = "20" + yyyy;
  }

  const date = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd)
  );

  return isNaN(date.getTime()) ? null : date;
}

// 🔥 calcula dias até ou depois do prazo
export function calcularDias(prazo: string | undefined) {
  const dataPrazo = parseData(prazo);
  if (!dataPrazo) return null;

  const hoje = new Date();

  // zera hora pra comparação justa
  hoje.setHours(0, 0, 0, 0);
  dataPrazo.setHours(0, 0, 0, 0);

  const diff = Math.ceil(
    (dataPrazo.getTime() - hoje.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return diff;
}

// 🔥 helper direto pra saber se está atrasado
export function estaAtrasado(prazo: string | undefined) {
  const dias = calcularDias(prazo);
  if (dias === null) return false;

  return dias < 0;
}