
export const alphaUpper = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'] as const
export const alphaLower = [...alphaUpper.map(c => c.toLocaleLowerCase())] as const
export const alpha = [...alphaLower,...alphaUpper] as const

export const keyboardUpper = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  [ "A","S","D","F","G","H","J","K","L"],
  [     "Z","X","C","V","B","N","M"],
] as const