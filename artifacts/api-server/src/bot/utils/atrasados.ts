export function parseData(prazo: string | undefined): Date | null {
  if (!prazo) return null;

  const onlyDate = prazo.split(" ")[0];
  const parts = onlyDate.split("/");

  if (parts.length !== 3) return null;

  let [dd, mm, yyyy] = parts;

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

export function calcularDias(prazo: string | undefined) {
  const dataPrazo = parseData(prazo);
  if (!dataPrazo) return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  dataPrazo.setHours(0, 0, 0, 0);

  return Math.ceil(
    (dataPrazo.getTime() - hoje.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

export function estaAtrasado(prazo: string | undefined) {
  const dias = calcularDias(prazo);
  if (dias === null) return false;
  return dias < 0;
}