export function* chunk<T>(arr:Array<T>, n:number) { for (let i = 0; i < arr.length; i += n) { yield arr.slice(i, i + n); } }
export function groupBy<T extends {[key: string]: any}>(arr: Array<T>, keyLookup: string | ((obj: T)=>string)): {[key: string]: Array<T>} {
  return arr.reduce( function(grouped: {[key: string]: Array<T>}, curr: T) {
    let key = keyLookup instanceof Function ? keyLookup(curr) : curr[(<string>keyLookup)];
    (grouped[key] = grouped[key] || []).push(curr);
    return grouped;
  }, {});
};
export function interleave<T>([ x, ...xs ]:Array<T>, ys:Array<T> = []): Array<T> { return x === undefined ? ys : [ x, ...interleave (ys, xs) ] }
export function pair<T>([ x, ...xs ]:Array<T>, [ y, ...ys ]:Array<T> = []): Array<Array<T>> { return [ [x,y], ...pair(xs, ys) ] }