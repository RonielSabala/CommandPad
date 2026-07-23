import { useMemo } from "react";
import "./SymbolField.css";

// Fragments that evoke command blocks: shell punctuation, braces, pipes, and
// tiny snippets. This is the landing page's decorative "code rain".
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
 * hero and demo. Purely decorative (aria-hidden) and pointer-transparent.
 *
 * Each column is a single pre-formatted text node (one glyph per line) rather
 * than one element per glyph, so the whole field is ~22 DOM nodes and animates
 * cheaply on the GPU.
 */
export function SymbolField() {
  const columns = useMemo<Column[]>(
    () =>
      Array.from({ length: COLUMN_COUNT }, () => {
        const half = Array.from({ length: GLYPHS_PER_COLUMN }, randomGlyph);
        // Duplicated so the vertical scroll loops seamlessly at -50%.
        return {
          text: [...half, ...half].join("\n"),
          duration: 26 + Math.random() * 34,
          delay: -Math.random() * 40,
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
