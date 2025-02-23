export function* chunk(str:string, n:number): Generator<string, void> {
  for (let i = 0; i < str.length; i += n) {
    yield str.slice(i, i + n);
  }
}