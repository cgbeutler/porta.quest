export function* chunk(s:string, n:number): Generator<string, void> {
  for (let i = 0; i < s.length; i += n) {
    yield s.slice(i, i + n);
  }
}

export function getFirstLine(s:string): string {
    const index = s.indexOf("\n");
    if (index === -1) return s.substring(0);
    return s.substring(0, index);
}

export function getLine(s:string, n:number): string | undefined {
  const len = s.length
  let line = 0
  let start = 0
  let end = s.indexOf("\n")
  while (line < n) {
    if (end === -1) return undefined
    ++line;
    start = end+1;
    if (start >= len) {
      return line === n ? "" : undefined;
    }
    end = s.indexOf("\n", start);
  }
  return end === -1 ? s.slice(start) : s.slice(start, end);
}

export function replaceAt(s:string, index: number, replacement: string) {
  return s.substring(0, index) + replacement + s.substring(index + replacement.length);
}