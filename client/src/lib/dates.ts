export interface DateRange {
  from: string;
  to: string;
}

export type RangePreset = "month" | "30d" | "year" | "monthPick" | "all" | "custom";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function currentMonthValue(): string {
  return toISODate(new Date()).slice(0, 7);
}

function parseMonth(value: string): { year: number; month: number } {
  const [year, month] = value.split("-").map(Number);
  return { year, month };
}

export function shiftMonth(value: string, delta: number): string {
  const { year, month } = parseMonth(value);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

export function formatMonth(value: string): string {
  const { year, month } = parseMonth(value);
  return monthFormatter.format(new Date(year, month - 1, 1));
}

export function getRange(
  preset: RangePreset,
  customFrom: string,
  customTo: string,
  pickedMonth: string
): DateRange {
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
    case "monthPick": {
      const picked = parseMonth(pickedMonth);
      return {
        from: toISODate(new Date(picked.year, picked.month - 1, 1)),
        to: toISODate(new Date(picked.year, picked.month, 0)),
      };
    }
    case "all":
      return { from: "", to: "" };
    case "custom":
      return { from: customFrom, to: customTo };
  }
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}