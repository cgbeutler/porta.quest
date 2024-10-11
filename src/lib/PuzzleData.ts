const todaySuffix = "_today"
const somedaySuffix = "_someday"
const customSuffix = "_custom"

export function savePuzzleData(data: object, puzzleKey: string, puzzleNumber: number, todaysPuzzleNumber: number, baseKey: string) {
  localStorage.setItem(
    baseKey + (puzzleNumber === -1 ? customSuffix : puzzleNumber === todaysPuzzleNumber ? todaySuffix : somedaySuffix),
    JSON.stringify({
      puzzleKey: puzzleNumber === -1 ? puzzleKey : puzzleNumber,
      data
    })
  )
}

export function loadPuzzleData(puzzleKey: string, puzzleNumber: number|undefined, todaysPuzzleNumber: number, baseKey: string): object|undefined {
  if (puzzleNumber === undefined) { // Custom Puzzle
    console.log("Loading Latest Custom Data")
    let saveStr = localStorage.getItem(baseKey + customSuffix)
    if (saveStr) {
      console.log("Found a save")
      let save = JSON.parse(saveStr)
      if (save.puzzleKey === puzzleKey) { // Puzzle Matches
        console.log("Save matches")
        return save.data
      }
    }
    return undefined
  }
  if (puzzleNumber === todaysPuzzleNumber) { // Today's Puzzle
    console.log("Loading Today's Data")
    let saveStr = localStorage.getItem(baseKey + todaySuffix)
    if (saveStr) {
      console.log("Found a save")
      let save = JSON.parse(saveStr)
      if (save.puzzleKey === puzzleNumber) { // Puzzle Matches Today's
        console.log("Save is from today")
        return save.data
      }
    }
    return undefined
  }
  console.log("Loading a random day's Data")
  let saveStr = localStorage.getItem(baseKey + somedaySuffix)
  if (saveStr) {
    console.log("Found a save")
    let save = JSON.parse(saveStr)
    if (save.puzzleKey === puzzleNumber) { // Puzzle Matches
      console.log("Save matches")
      return save.data
    }
  }
  return undefined
}