import { alpha } from "./AlphabetHelpers";

function _shift( s: string, d: 1|-1 ) {
  return s.split("").map((c, c_i) => {
    let original_i = alpha.indexOf(c)
    if (original_i < 0) return c
    let new_i = (original_i + d * ((c_i % 2 ? -1 : 1) * 13 + c_i)) % alpha.length
    if (new_i < 0) new_i += alpha.length
    return alpha[new_i]
  }).join("")
}

export function cipher( s: string ) { return _shift(s, 1) }
export function decipher( s: string ) { return _shift(s, -1) }