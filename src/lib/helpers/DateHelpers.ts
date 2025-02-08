import moment from "moment/moment";

export function daysSince(year: number, month: number, day: number): number {
  return moment().diff(moment([year, month, day], true).local(), "days")
}