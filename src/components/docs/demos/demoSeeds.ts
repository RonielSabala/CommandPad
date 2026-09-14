import { createDefaultScrollTop, RunbookConfig } from "@/common/config";
import { DEFAULT_COMMAND_LANGUAGE } from "@/common/editorConfig";
import { BlockType, type CodeLanguage, NoteStyle } from "@/common/enums";
import type {
  Block,
  RunbookContent,
  RunbookEntry,
  Tab,
  Variable,
} from "@/common/types";
import type { StoreState } from "@/store/store";
import { generateId } from "@/utils/id";
import { getRunbookLabel } from "@/utils/runbook";

export const demoCommand = (
  text: string,
  editorCollapsed?: boolean,
  language: CodeLanguage = DEFAULT_COMMAND_LANGUAGE,
): Block => ({
  id: generateId(),
  type: BlockType.COMMAND,
  text,
  language,
  ...(editorCollapsed !== undefined ? { editorCollapsed } : {}),
});

export const demoNote = (
  text: string,
  style: NoteStyle = NoteStyle.BODY,
): Block => ({
  id: generateId(),
  type: BlockType.NOTE,
  text,
  style,
});

export const demoImage = (src: string, alt?: string): Block => ({
  id: generateId(),
  type: BlockType.IMAGE,
  src,
  ...(alt !== undefined ? { alt } : {}),
});

export const demoDivider = (): Block => ({
  id: generateId(),
  type: BlockType.DIVIDER,
});

export const demoVariable = (
  key: string,
  value: string,
  secret?: boolean,
): Variable => ({
  id: generateId(),
  key,
  value,
  ...(secret !== undefined ? { secret } : {}),
});

const DEMO_VARIABLE_KEY_RATIO = 0.25;

export interface DemoContent {
  blocks?: Block[];
  variables?: Variable[];
}

export interface DemoSeed {
  state: Partial<StoreState>;
  contentSeed: Record<string, RunbookContent>;
}

/** A demo's seeded content, ids excluded. */
export const demoSeedSignature = (
  tabs: DemoContent[],
  library: DemoContent[],
): string =>
  JSON.stringify([tabs, library], (key, value: unknown) =>
    key === "id" ? undefined : value,
  );

/** Takes each item's id from the previous seed's item in the same slot, when it is the same kind. */
function reuseIds<T extends { id: string }>(
  items: T[],
  previous: T[] = [],
  sameKind: (item: T, previousItem: T) => boolean = () => true,
): T[] {
  return items.map((item, index) => {
    const previousItem = previous[index];
    return previousItem && sameKind(item, previousItem)
      ? { ...item, id: previousItem.id }
      : item;
  });
}

/** Builds a demo's store seed. */
export function buildDemoSeed(
  tabs: DemoContent[],
  library: DemoContent[],
  language: StoreState["language"],
  previous?: DemoSeed,
): DemoSeed {
  const contentSeed: Record<string, RunbookContent> = {};
  const runbookLibrary: RunbookEntry[] = [];
  const previousLibrary = previous?.state.runbookLibrary ?? [];
  const previousTabs = previous?.state.tabs ?? [];

  const register = (content: DemoContent): RunbookEntry => {
    const previousEntry = previousLibrary[runbookLibrary.length];
    const previousContent =
      previousEntry && previous?.contentSeed[previousEntry.id];

    const blocks = reuseIds(
      content.blocks ?? [],
      previousContent?.blocks,
      (block, previousBlock) => block.type === previousBlock.type,
    );
    const variables = reuseIds(
      content.variables ?? [],
      previousContent?.variables,
    );

    const entry: RunbookEntry = {
      id: previousEntry?.id ?? generateId(),
      label: getRunbookLabel(blocks, RunbookConfig.DEFAULT_LABEL),
      filename: "",
    };

    runbookLibrary.push(entry);
    contentSeed[entry.id] = { blocks, variables };
    return entry;
  };

  const seededTabs: Tab[] = tabs.map((content, index) => {
    const entry = register(content);
    return {
      id: previousTabs[index]?.id ?? generateId(),
      label: entry.label,
      runbookId: entry.id,
      ...contentSeed[entry.id],
      scrollTop: createDefaultScrollTop(),
    };
  });

  for (const content of library) {
    register(content);
  }

  return {
    contentSeed,
    state: {
      tabs: seededTabs,
      activeTabId: seededTabs[0]?.id ?? null,
      activeRunbookId:
        seededTabs[0]?.runbookId ?? runbookLibrary[0]?.id ?? null,
      runbookLibrary,
      language,
      variableKeyRatio: DEMO_VARIABLE_KEY_RATIO,
      initialized: true,
    },
  };
}
