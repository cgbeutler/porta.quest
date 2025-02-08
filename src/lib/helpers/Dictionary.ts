import { psudorand } from "./RandomHelpers";

const newlinePattern = new RegExp(/\n/g);

export class Dictionary {
  contents: string
  lines: number

  constructor(contents: string) {
    this.contents = contents
    this.lines = this.contents.match(newlinePattern)?.length ?? 0
  }

  containsWord(word: string): boolean {
    return this.contents.indexOf(word) >= 0
  }

  getWord(index: number): string | undefined {
    let line: number = 0
    let startIndex: number = 0
    let endIndex: number = this.contents.indexOf('\n');
  
    if (line === index) return this.contents.slice(startIndex, endIndex)
  
    while(line < index && endIndex >= 0) {
      startIndex = endIndex + 1
      endIndex = this.contents.indexOf('\n', startIndex)
      line++
    }

    if (endIndex >= 0) return this.contents.slice(startIndex, endIndex)
    let lineContents = this.contents.slice(startIndex)
    return lineContents ? lineContents : undefined

  }

  psudorandomWord(index: number): string {
    index = index % this.lines
    let rand = psudorand(index)
    let randIndex = Math.floor(rand * this.lines)
    return this.getWord(randIndex)!
  }
}