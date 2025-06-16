import { psudorand } from "./helpers/RandomHelpers";

const cache: {[file: string]: NDictionary} = {}

export class NDictionary {
  contents: string
  contentsLength: number
  wordLen: number
  numWords: number
  wordsStart: number

  constructor(contents: string) {
    this.contents = contents;
    this.contentsLength = contents.length;
    let end = this.contents.indexOf("\n");
    this.wordLen = Number(this.contents.slice(0, end));
    this.wordsStart = end +1;
    this.numWords = (this.contentsLength - this.wordsStart) / (this.wordLen + 1);
  }

  containsWord(word: string): boolean {
    return this.contents.indexOf(word.toLowerCase()) >= 0;
  }

  getWord(index: number): string | undefined {
    const start = this.wordsStart + index * (this.wordLen+1);
    const end = start+ (this.wordLen);
    if (start > this.contentsLength) return undefined;
    if (end === this.contentsLength) return this.contents.slice(start);
    if (end > this.contentsLength) return this.contents.slice(start);
    return this.contents.slice(start, end)
  }

  pseudorandomWord(index: number): string {
    index = index % this.numWords
    let rand = psudorand(index)
    let randIndex = Math.floor(rand * this.numWords)
    return this.getWord(randIndex)!
  }
}

export async function getNDictionary(wordLength: number): Promise<NDictionary> {
  if (wordLength < 3 || wordLength === 26 || wordLength === 30 || wordLength > 31) throw new Error("Not implemented. Out of range.");

  const filename = `dictionary${wordLength}.txt`;
  if (filename in cache) return cache[filename];
  const response = await fetch("./dictionaries/" + filename);
  if (!response.ok) throw new Error(response.statusText);
  const dict = new NDictionary(await response.text());
  cache[filename] = dict;
  return dict;
}

export async function getNDictionaryCommon(wordLength: number): Promise<NDictionary> {
  if (wordLength !== 5) throw new Error("Not implemented. Out of range.");

  const filename = `common_words${wordLength}.txt`;
  if (filename in cache) return cache[filename];
  const response = await fetch("./dictionaries/" + filename);
  if (!response.ok) throw new Error(response.statusText);
  const dict = new NDictionary(await response.text());
  cache[filename] = dict;
  return dict;
}
