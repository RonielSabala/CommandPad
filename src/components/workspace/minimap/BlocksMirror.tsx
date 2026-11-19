import { CssClass } from "@/common/constants/css";
import { BlockItems } from "@/components/blocks/BlockItem";
import "@/components/blocks/BlocksList.css";
import {
  EMPTY_BLOCKS,
  EMPTY_VARIABLES,
  getActiveTab,
  useStore,
} from "@/store/store";
import { memo } from "react";

import { MinimapMirror } from "./Minimap";

export const BlocksMirror = memo(function BlocksMirror({
  width,
}: {
  width: number;
}) {
  const activeTab = useStore(getActiveTab);
  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;

  return (
    <MinimapMirror className={CssClass.BLOCKS_LIST} width={width}>
      <BlockItems blocks={blocks} variables={variables} />
    </MinimapMirror>
  );
});
