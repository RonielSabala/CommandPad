import { CssClass } from "@/common/constants/css";
import { BlockItem } from "@/components/blocks/BlockItem";
import "@/components/blocks/BlocksList.css";
import {
  EMPTY_BLOCKS,
  EMPTY_VARIABLES,
  getActiveTab,
  useStore,
} from "@/store/store";
import { getSecretKeys, getVariableMap } from "@/utils/resolution";
import { memo, useMemo } from "react";

import { MinimapMirror } from "./Minimap";

export const BlocksMirror = memo(function BlocksMirror({
  width,
}: {
  width: number;
}) {
  const activeTab = useStore(getActiveTab);
  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;

  const variableMap = useMemo(() => getVariableMap(variables), [variables]);
  const secretKeys = useMemo(() => getSecretKeys(variables), [variables]);

  return (
    <MinimapMirror className={CssClass.BLOCKS_LIST} width={width}>
      {blocks.map((block) => (
        <BlockItem
          key={block.id}
          block={block}
          variableMap={variableMap}
          secretKeys={secretKeys}
        />
      ))}
    </MinimapMirror>
  );
});
