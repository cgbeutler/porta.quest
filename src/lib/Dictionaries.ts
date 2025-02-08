const cache: {[file: string]: string} = {}

export async function getDictionary(file: string): Promise<string> {
  if (file in cache) return cache[file]
  const response = await fetch("./dictionaries/" + file)
  if (!response.ok) throw new Error(response.statusText)
  cache[file] = await response.text()
  return cache[file]
}

export async function getDictionaries(files: string[]): Promise<{[file:string]: string}> {
  const promises = files.map(f => getDictionary(f))
  let results = await Promise.all(promises)
  return Object.fromEntries(files.map((f, i) => [f, results[i]]))
}