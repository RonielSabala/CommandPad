import { createDefaultScrollTop, RunbookConfig } from "@/common/config";
import { DEFAULT_COMMAND_LANGUAGE } from "@/common/editorConfig";
import {
  BlockType,
  type CodeLanguage,
  NoteStyle,
  RunbookView,
} from "@/common/enums";
import type {
  Block,
  LibraryFolder,
  LibraryRunbook,
  RunbookContent,
  Tab,
  Variable,
  VariableSection,
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

export const demoRunbook = (
  label: string,
  overrides?: Record<string, string>,
): Block => ({
  id: generateId(),
  type: BlockType.RUNBOOK,
  label,
  ...(overrides !== undefined ? { overrides } : {}),
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

export const demoSection = (
  name: string,
  start: number,
  collapsed?: boolean,
): VariableSection => ({
  id: generateId(),
  name,
  start,
  ...(collapsed !== undefined ? { collapsed } : {}),
});

const DEMO_VARIABLE_KEY_RATIO = 0.25;

export interface DemoContent {
  blocks?: Block[];
  variables?: Variable[];
  variableSections?: VariableSection[];
  /** The names of the library folders holding it. */
  folderPath?: string[];
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
  const folders: LibraryFolder[] = [];
  const runbooks: LibraryRunbook[] = [];
  const previousFolders = previous?.state.libraryFolders ?? [];
  const previousRunbooks = previous?.state.libraryRunbooks ?? [];
  const previousTabs = previous?.state.tabs ?? [];

  const registerFolders = (path: string[] = []) => {
    let parentId: string | null = null;

    for (const name of path) {
      const existing = folders.find(
        (f) => f.parentId === parentId && f.name === name,
      );

      const folder: LibraryFolder = existing ?? {
        id: previousFolders[folders.length]?.id ?? generateId(),
        name,
        parentId,
      };

      if (!existing) {
        folders.push(folder);
      }

      parentId = folder.id;
    }

    return parentId ?? undefined;
  };

  const register = (content: DemoContent): LibraryRunbook => {
    const previousRunbook = previousRunbooks[runbooks.length];
    const previousContent =
      previousRunbook && previous?.contentSeed[previousRunbook.id];

    const blocks = reuseIds(
      content.blocks ?? [],
      previousContent?.blocks,
      (block, previousBlock) => block.type === previousBlock.type,
    );
    const variables = reuseIds(
      content.variables ?? [],
      previousContent?.variables,
    );
    const variableSections = reuseIds(
      content.variableSections ?? [],
      previousContent?.variableSections,
    );

    const runbook: LibraryRunbook = {
      id: previousRunbook?.id ?? generateId(),
      label: getRunbookLabel(blocks, RunbookConfig.DEFAULT_LABEL),
      filename: "",
      folderId: registerFolders(content.folderPath),
    };

    runbooks.push(runbook);
    contentSeed[runbook.id] = { blocks, variables, variableSections };
    return runbook;
  };

  const seededTabs: Tab[] = tabs.map((content, index) => {
    const runbook = register(content);
    return {
      id: previousTabs[index]?.id ?? generateId(),
      label: runbook.label,
      runbookId: runbook.id,
      ...contentSeed[runbook.id],
      view: RunbookView.PREVIEW,
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
      activeRunbookId: seededTabs[0]?.runbookId ?? runbooks[0]?.id ?? null,
      libraryFolders: folders,
      libraryRunbooks: runbooks,
      language,
      variableKeyRatio: DEMO_VARIABLE_KEY_RATIO,
      initialized: true,
    },
  };
}
