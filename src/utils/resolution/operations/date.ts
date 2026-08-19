import { DateSyntax, DateToken, DateTokenRegex } from "@/common/variableSyntax";

import { defineCallOperation } from "./call";
import type { OperationDefinition } from "./types";

function pad(value: number): string {
  return String(value).padStart(DateSyntax.PAD_LENGTH, DateSyntax.PAD_CHAR);
}

const DATE_PARTS: Record<string, ((date: Date) => string) | undefined> = {
  [DateToken.YEAR]: (date) => String(date.getFullYear()),
  [DateToken.YEAR_SHORT]: (date) => pad(date.getFullYear() % 100),
  [DateToken.MONTH]: (date) => pad(date.getMonth() + 1),
  [DateToken.DAY]: (date) => pad(date.getDate()),
  [DateToken.HOUR]: (date) => pad(date.getHours()),
  [DateToken.MINUTE]: (date) => pad(date.getMinutes()),
  [DateToken.SECOND]: (date) => pad(date.getSeconds()),
};

function formatDate(date: Date, format: string): string {
  return format.replace(
    DateTokenRegex,
    (token) => DATE_PARTS[token]?.(date) ?? token,
  );
}

export const DATE_OPERATION: OperationDefinition = defineCallOperation({
  arity: DateSyntax.ARITY,
  builders: {
    [DateSyntax.KEYWORD]: ([format = ""]) => {
      const pattern = format || DateSyntax.DEFAULT_FORMAT;
      return () => formatDate(new Date(), pattern);
    },
  },
});
