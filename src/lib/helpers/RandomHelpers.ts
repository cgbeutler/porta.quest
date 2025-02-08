
// from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript splitMix32
export function psudorand(a: number) {
  a |= 0;
  a = a + 0x9e3779b9 | 0;
  let t = a ^ (a >>> 16);
  t = Math.imul(t, 0x21f0aaad);
  t = t ^ (t >>> 15);
  t = Math.imul(t, 0x735a2d97);
  return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
}
