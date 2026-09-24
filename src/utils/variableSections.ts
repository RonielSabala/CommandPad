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

/** Index just past the last variable of the section at `at`. */
function sectionEnd(
  sections: readonly VariableSection[],
  at: number,
  total: number,
): number {
  return sections[at + 1]?.start ?? total;
}

/** `previous` when `next` holds the same items. */
function keepIfSame<T>(next: T[], previous: T[] | undefined): T[] {
  return previous &&
    next.length === previous.length &&
    next.every((item, index) => item === previous[index])
    ? previous
    : next;
}

/** Interleave the sections with the variables they open onto. */
export function toVariableEntries(
  variables: Variable[],
  sections: VariableSection[],
): VariableEntry[] {
  const entries: VariableEntry[] = [];
  let next = 0;

  const pushSectionsUpTo = (index: number) => {
    while (next < sections.length && sections[next].start <= index) {
      entries.push({
        kind: VariableEntryKind.SECTION,
        section: sections[next++],
      });
    }
  };

  variables.forEach((variable, index) => {
    pushSectionsUpTo(index);
    entries.push({ kind: VariableEntryKind.VARIABLE, variable });
  });

  pushSectionsUpTo(Infinity);
  return entries;
}

/** Split interleaved entries back, recomputing each section's `start`. */
export function fromVariableEntries(
  entries: VariableEntry[],
  previous?: VariableLayout,
): VariableLayout {
  const variables: Variable[] = [];
  const variableSections: VariableSection[] = [];

  for (const entry of entries) {
    if (entry.kind === VariableEntryKind.VARIABLE) {
      variables.push(entry.variable);
      continue;
    }

    const { section } = entry;
    const start = variables.length;
    variableSections.push(
      section.start === start ? section : { ...section, start },
    );
  }

  return {
    variables: keepIfSame(variables, previous?.variables),
    variableSections: keepIfSame(variableSections, previous?.variableSections),
  };
}

/** Apply `mutate` to the interleaved entries of a layout. */
export function mapVariableEntries(
  layout: VariableLayout,
  mutate: (entries: VariableEntry[]) => VariableEntry[],
): VariableLayout {
  return fromVariableEntries(
    mutate(toVariableEntries(layout.variables, layout.variableSections)),
    layout,
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
    return start === section.start ? section : { ...section, start };
  });
}

/** The rows the editor shows. */
export function buildVariableLayout(
  variables: Variable[],
  sections: VariableSection[],
): VariableLayoutRow[] {
  const rows: VariableLayoutRow[] = [];
  const total = variables.length;

  const pushVariables = (from: number, to: number) => {
    for (let i = from; i < to; i++) {
      rows.push({
        kind: VariableEntryKind.VARIABLE,
        variable: variables[i],
      });
    }
  };

  pushVariables(0, sections[0]?.start ?? total);

  sections.forEach((section, at) => {
    const end = sectionEnd(sections, at, total);
    rows.push({
      kind: VariableEntryKind.SECTION,
      section,
      count: end - section.start,
    });

    if (!section.collapsed) {
      pushVariables(section.start, end);
    }
  });

  return rows;
}

/** The variables the section at `at` holds. */
export function sectionVariables(
  layout: VariableLayout,
  at: number,
): Variable[] {
  const { variables, variableSections: sections } = layout;
  return variables.slice(
    sections[at].start,
    sectionEnd(sections, at, variables.length),
  );
}

/** Expand whichever collapsed section holds any of `variableIds`. */
export function revealVariables(
  layout: VariableLayout,
  variableIds: ReadonlySet<string>,
): VariableSection[] {
  const { variables, variableSections: sections } = layout;
  let changed = false;

  const next = sections.map((section, at) => {
    if (!section.collapsed) {
      return section;
    }

    const end = sectionEnd(sections, at, variables.length);
    for (let i = section.start; i < end; i++) {
      if (variableIds.has(variables[i].id)) {
        changed = true;
        return { ...section, collapsed: false };
      }
    }

    return section;
  });

  return changed ? next : sections;
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
    index = entries.length;
  } else if (position === InsertPosition.BELOW) {
    const target = entries[index++];

    // Below a collapsed section means below what it hides
    if (target.kind === VariableEntryKind.SECTION && target.section.collapsed) {
      while (entries[index]?.kind === VariableEntryKind.VARIABLE) {
        index++;
      }
    }
  }

  const next = entries.slice();
  next.splice(index, 0, entry);
  return next;
}

/** Move `movingIds` onto `targetId`. */
export function moveVariableEntries(
  entries: VariableEntry[],
  movingIds: ReadonlySet<string>,
  sourceId: string,
  targetId: string,
): VariableEntry[] {
  const remaining: VariableEntry[] = [];
  const moving: VariableEntry[] = [];
  let sourceIndex = -1;
  let targetIndex = -1;
  let remainingTargetIndex = -1;

  entries.forEach((entry, i) => {
    const id = entryId(entry);
    if (id === sourceId) {
      sourceIndex = i;
    }

    if (movingIds.has(id)) {
      moving.push(entry);
      return;
    }

    if (id === targetId) {
      targetIndex = i;
      remainingTargetIndex = remaining.length;
    }

    remaining.push(entry);
  });

  if (sourceIndex < 0 || remainingTargetIndex < 0) {
    return entries;
  }

  remaining.splice(
    sourceIndex < targetIndex ? remainingTargetIndex + 1 : remainingTargetIndex,
    0,
    ...moving,
  );

  return remaining;
}
