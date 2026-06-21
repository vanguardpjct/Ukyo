export function parseGoogleDate(value: string): Date | null {
  if (!value) return null;

  // pega só "dd/mm/yyyy"
  const clean = value.split(" ")[0];
  const [day, month, year] = clean.split("/");

  if (!day || !month || !year) return null;

  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function diffDays(target: Date): number {
  const now = new Date();

  // zera horas pra evitar bug de timezone
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}