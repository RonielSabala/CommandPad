import { useMemo } from "react";
import "./SymbolField.css";

const GLYPHS = [
  "{",
  "}",
  "$",
  ">",
  "_",
  ";",
  "|",
  "&",
  "/",
  "~",
  "#",
  "*",
  "=",
  "+",
  "-",
  ":",
  ".",
  "\\",
  "%",
  "!",
  "?",
  "@",
  "[",
  "]",
  "<",
  "^",
  "{VAR}",
  "&&",
  "->",
  "|>",
  "$_",
  "::",
  "//",
  "cd",
  "ls",
  "ssh",
  "git",
  "curl",
  "sudo",
  "cp",
  "run",
  "0",
  "1",
];

const COLUMN_COUNT = 22;
const GLYPHS_PER_COLUMN = 24;

// Per-column animation timing
const MIN_FALL_DURATION_S = 26;
const FALL_DURATION_RANGE_S = 34;
const MAX_START_DELAY_S = 40;

interface Column {
  text: string;
  duration: number;
  delay: number;
}

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

/**
 * A subtle, animated field of command-like symbols drifting downward behind the
 * hero and demo.
 */
export function SymbolField() {
  const columns = useMemo<Column[]>(
    () =>
      Array.from({ length: COLUMN_COUNT }, () => {
        const half = Array.from({ length: GLYPHS_PER_COLUMN }, randomGlyph);

        return {
          text: [...half, ...half].join("\n"),
          duration: MIN_FALL_DURATION_S + Math.random() * FALL_DURATION_RANGE_S,
          delay: -Math.random() * MAX_START_DELAY_S,
        };
      }),
    [],
  );

  return (
    <div className="home-symbol-field" aria-hidden="true">
      {columns.map((column, i) => (
        <pre
          key={i}
          className="home-symbol-col"
          style={{
            animationDuration: `${column.duration}s`,
            animationDelay: `${column.delay}s`,
          }}
        >
          {column.text}
        </pre>
      ))}
    </div>
  );
}
