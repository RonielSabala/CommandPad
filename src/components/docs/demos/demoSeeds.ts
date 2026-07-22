import { RunbookConfig } from "@/common/config";
import { BlockType, NoteStyle } from "@/common/enums";
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
): Block => ({
  id: generateId(),
  type: BlockType.COMMAND,
  text,
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

export function buildDemoSeed(
  tabs: DemoContent[],
  library: DemoContent[],
  language: StoreState["language"],
): DemoSeed {
  const contentSeed: Record<string, RunbookContent> = {};
  const runbookLibrary: RunbookEntry[] = [];

  const register = (content: DemoContent): RunbookEntry => {
    const blocks = content.blocks ?? [];
    const variables = content.variables ?? [];
    const entry: RunbookEntry = {
      id: generateId(),
      label: getRunbookLabel(blocks, RunbookConfig.DEFAULT_LABEL),
      filename: "",
    };

    runbookLibrary.push(entry);
    contentSeed[entry.id] = { blocks, variables };
    return entry;
  };

  const seededTabs: Tab[] = tabs.map((content) => {
    const entry = register(content);
    return {
      id: generateId(),
      label: entry.label,
      runbookId: entry.id,
      blocks: content.blocks ?? [],
      variables: content.variables ?? [],
      scrollTop: 0,
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
