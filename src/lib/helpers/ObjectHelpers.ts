import { Ok, Err, Some, None, Option, Result } from 'bakutils-catcher';
export {}

function getProp(this: object, key: string): Option<any> {
  if (this.hasOwnProperty(key)) return Some((this as any)[key]);
  return None;
}

declare global {
  interface Object {
    getProp(this: object, key: string): any;
  }
}

Object.prototype.getProp = getProp;