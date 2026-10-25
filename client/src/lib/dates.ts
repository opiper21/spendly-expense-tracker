export interface DateRange {
  from: string;
  to: string;
}

export type RangePreset = "month" | "30d" | "year" | "all" | "custom";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getRange(preset: RangePreset, customFrom: string, customTo: string): DateRange {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  switch (preset) {
    case "month":
      return {
        from: toISODate(new Date(year, month, 1)),
        to: toISODate(new Date(year, month + 1, 0)),
      };
    case "30d":
      return {
        from: toISODate(new Date(year, month, today.getDate() - 29)),
        to: toISODate(today),
      };
    case "year":
      return { from: `${year}-01-01`, to: `${year}-12-31` };
    case "all":
      return { from: "", to: "" };
    case "custom":
      return { from: customFrom, to: customTo };
  }
}