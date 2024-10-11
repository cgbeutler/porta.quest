export function getProp<T>(o: object, key: string, def?: T ) {
  if (o.hasOwnProperty(key)) return ((o as any)[key]);
  return def ?? undefined as any
}
