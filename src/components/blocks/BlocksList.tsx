import { DataAttr, ScrollIntoView } from "@/common/constants/dom";
import type { Block, Variable } from "@/common/types";
import { getActiveTab, useStore } from "@/store/store";
import { getSecretKeys, getVariableMap } from "@/utils/resolution";
import { useEffect, useMemo, useRef } from "react";
import { BlockItem } from "./BlockItem";
import "./BlocksList.css";

const EMPTY_BLOCKS: Block[] = [];
const EMPTY_VARIABLES: Variable[] = [];

export function BlocksList() {
  const activeTab = useStore(getActiveTab);
  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;
  const pendingFocusBlockId = useStore((state) => state.pendingFocusBlockId);

  const variableMap = useMemo(() => getVariableMap(variables), [variables]);
  const secretKeys = useMemo(() => getSecretKeys(variables), [variables]);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pendingFocusBlockId) {
      return;
    }

    const blockEl = listRef.current?.querySelector(
      `[${DataAttr.BLOCK_ID}="${pendingFocusBlockId}"]`,
    );

    blockEl?.scrollIntoView({
      block: ScrollIntoView.BLOCK_CENTER,
      behavior: ScrollIntoView.BEHAVIOR_SMOOTH,
    });
  }, [pendingFocusBlockId]);

  return (
    <div id="blocks-list" ref={listRef}>
      {blocks.map((block) => (
        <BlockItem
          key={block.id}
          block={block}
          variableMap={variableMap}
          secretKeys={secretKeys}
        />
      ))}
    </div>
  );
}
