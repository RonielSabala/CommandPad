import { InsertPosition, VariableEntryKind } from "@/common/enums";
import type { Variable, VariableSection } from "@/common/types";

interface VariableLayout {
  variables: Variable[];
  variableSections: VariableSection[];
}

type VariableLayoutRow =
  | { kind: typeof VariableEntryKind.VARIABLE; variable: Variable }
  | {
      kind: typeof VariableEntryKind.SECTION;
      section: VariableSection;
      count: number;
    };

export type VariableEntry =
  | { kind: typeof VariableEntryKind.VARIABLE; variable: Variable }
  | { kind: typeof VariableEntryKind.SECTION; section: VariableSection };

export const entryId = (entry: VariableEntry) =>
  entry.kind === VariableEntryKind.VARIABLE
    ? entry.variable.id
    : entry.section.id;

/** Interleave the sections with the variables they open onto. */
export function toVariableEntries(
  variables: Variable[],
  sections: VariableSection[],
): VariableEntry[] {
  const entries: VariableEntry[] = [];
  const variableCount = variables.length;
  const sectionCount = sections.length;

  let next = 0;

  for (let i = 0; i <= variableCount; i++) {
    while (
      next < sectionCount &&
      (sections[next].start <= i || i === variableCount)
    ) {
      entries.push({
        kind: VariableEntryKind.SECTION,
        section: sections[next],
      });

      next++;
    }

    if (i < variableCount) {
      entries.push({
        kind: VariableEntryKind.VARIABLE,
        variable: variables[i],
      });
    }
  }

  return entries;
}

/** Split interleaved entries back, recomputing each section's `start`. */
export function fromVariableEntries(entries: VariableEntry[]): VariableLayout {
  const variables: Variable[] = [];
  const variableSections: VariableSection[] = [];

  for (const entry of entries) {
    if (entry.kind === VariableEntryKind.VARIABLE) {
      variables.push(entry.variable);
      continue;
    }

    variableSections.push({ ...entry.section, start: variables.length });
  }

  return { variables, variableSections };
}

/** Apply `mutate` to the interleaved entries of a layout. */
export function mapVariableEntries(
  layout: VariableLayout,
  mutate: (entries: VariableEntry[]) => VariableEntry[],
): VariableLayout {
  return fromVariableEntries(
    mutate(toVariableEntries(layout.variables, layout.variableSections)),
  );
}

/** Coerce stored sections into ones that fit `count` variables, in order. */
export function normalizeVariableSections(
  sections: readonly VariableSection[] | undefined,
  count: number,
): VariableSection[] {
  let floor = 0;

  return (sections ?? []).map((section) => {
    const start = Math.min(Math.max(section.start, floor), count);
    floor = start;
    return { ...section, start };
  });
}

/** Index of the section holding the variable at `index`, or -1 for none. */
function sectionIndexOf(
  sections: readonly VariableSection[],
  index: number,
): number {
  for (let at = sections.length - 1; at >= 0; at--) {
    if (sections[at].start <= index) {
      return at;
    }
  }

  return -1;
}

/** How many variables each section holds. */
function sectionCount(
  sections: readonly VariableSection[],
  at: number,
  total: number,
): number {
  return (sections[at + 1]?.start ?? total) - sections[at].start;
}

/** The rows the editor shows. */
export function buildVariableLayout(
  variables: Variable[],
  sections: VariableSection[],
): VariableLayoutRow[] {
  const rows: VariableLayoutRow[] = [];
  const variableCount = variables.length;
  const counts = new Map(
    sections.map((section, at) => [
      section.id,
      sectionCount(sections, at, variableCount),
    ]),
  );

  let hidden = false;
  for (const entry of toVariableEntries(variables, sections)) {
    if (entry.kind === VariableEntryKind.SECTION) {
      hidden = !!entry.section.collapsed;
      rows.push({ ...entry, count: counts.get(entry.section.id) ?? 0 });
    } else if (!hidden) {
      rows.push(entry);
    }
  }

  return rows;
}

/** Ids of the variables a collapsed section currently hides. */
export function hiddenVariableIds(
  variables: Variable[],
  sections: VariableSection[],
): Set<string> {
  const hidden = new Set<string>();
  const variableCount = variables.length;

  sections.forEach((section, at) => {
    if (!section.collapsed) {
      return;
    }

    const end = section.start + sectionCount(sections, at, variableCount);
    for (let i = section.start; i < end; i++) {
      hidden.add(variables[i].id);
    }
  });

  return hidden;
}

/** Expand whichever section holds each of `variableIds`. */
export function revealVariables(
  layout: VariableLayout,
  variableIds: readonly string[],
): VariableSection[] {
  const owners = new Set(
    variableIds.map((id) =>
      sectionIndexOf(
        layout.variableSections,
        layout.variables.findIndex((variable) => variable.id === id),
      ),
    ),
  );

  const sections = layout.variableSections.map((section, at) =>
    owners.has(at) && section.collapsed
      ? { ...section, collapsed: false }
      : section,
  );
  const changed = sections.some(
    (section, at) => section !== layout.variableSections[at],
  );

  return changed ? sections : layout.variableSections;
}

/** Insert `entry` above or below `targetId`. */
export function insertVariableEntry(
  entries: VariableEntry[],
  entry: VariableEntry,
  targetId: string,
  position: InsertPosition,
): VariableEntry[] {
  let index = entries.findIndex((item) => entryId(item) === targetId);
  if (index < 0) {
    return [...entries, entry];
  }

  const target = entries[index];
  if (position === InsertPosition.BELOW) {
    index++;

    if (target.kind === VariableEntryKind.SECTION && target.section.collapsed) {
      while (entries[index]?.kind === VariableEntryKind.VARIABLE) {
        index++;
      }
    }
  }

  return [...entries.slice(0, index), entry, ...entries.slice(index)];
}

/** Move `movingIds` onto `targetId`. */
export function moveVariableEntries(
  entries: VariableEntry[],
  movingIds: ReadonlySet<string>,
  sourceId: string,
  targetId: string,
): VariableEntry[] {
  const sourceIndex = entries.findIndex((entry) => entryId(entry) === sourceId);
  if (sourceIndex < 0) {
    return entries;
  }

  const targetIndex = entries.findIndex((entry) => entryId(entry) === targetId);
  if (targetIndex < 0) {
    return entries;
  }

  const remaining = entries.filter((entry) => !movingIds.has(entryId(entry)));
  const newTargetIndex = remaining.findIndex(
    (entry) => entryId(entry) === targetId,
  );

  if (newTargetIndex < 0) {
    return entries;
  }

  const moving = entries.filter((entry) => movingIds.has(entryId(entry)));
  remaining.splice(
    sourceIndex < targetIndex ? newTargetIndex + 1 : newTargetIndex,
    0,
    ...moving,
  );

  return remaining;
}
