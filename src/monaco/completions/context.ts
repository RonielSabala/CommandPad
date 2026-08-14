import { ReferenceChunk, ReferenceSurface } from "@/common/enums";
import { CallSyntax, VariableSyntax } from "@/common/variableSyntax";
import {
  getTokenKey,
  openReferenceAt,
  splitReferenceBody,
} from "@/utils/resolution";

/** The chunk each separator opens. */
const CHUNK_BY_SEPARATOR: Record<string, ReferenceChunk | undefined> = {
  "": ReferenceChunk.KEY,
  [VariableSyntax.PARAM_SEPARATOR]: ReferenceChunk.PARAM,
  [VariableSyntax.OPERATION_SEPARATOR]: ReferenceChunk.OPERATION,
};

/** Whether a half-typed chunk is still on the name an editor can complete. */
const COMPLETABLE: Record<ReferenceChunk, (typed: string) => boolean> = {
  [ReferenceChunk.KEY]: () => true,
  [ReferenceChunk.PARAM]: (typed) =>
    !typed.includes(VariableSyntax.PARAM_ASSIGNMENT),
  [ReferenceChunk.OPERATION]: (typed) =>
    !typed.includes(CallSyntax.ARGUMENT_OPEN),
};

export interface CompletionContext {
  chunk: ReferenceChunk;
  key: string;
  start: number;
}

/**
 * The chunk being typed at `index`, or `null` when the caret is not in one an
 * editor can complete.
 */
export function readCompletionContext(
  text: string,
  index: number,
): CompletionContext | null {
  const reference = openReferenceAt(text, index, ReferenceSurface.COMMAND);
  if (!reference) {
    return null;
  }

  const chunks = splitReferenceBody(reference.raw);
  const typed = chunks[chunks.length - 1];
  const chunk = CHUNK_BY_SEPARATOR[typed.separator];
  const typedText = typed.text;

  if (!chunk || !COMPLETABLE[chunk](typedText)) {
    return null;
  }

  const leading = typedText.length - typedText.trimStart().length;
  return {
    chunk,
    key: getTokenKey(reference.raw),
    start: index - typedText.length + leading,
  };
}
