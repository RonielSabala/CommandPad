import { CssClass } from "@/common/constants/css";
import { BlockItems } from "@/components/blocks/BlockItem";
import "@/components/blocks/BlocksList.css";
import { KeptTabs } from "@/components/tabs/KeptTabs";
import { useScopedTab } from "@/components/tabs/tabScope";
import { EMPTY_BLOCKS, EMPTY_VARIABLES } from "@/store/store";
import { memo } from "react";

import { MinimapMirror } from "./Minimap";

const TabBlocksMirror = memo(function TabBlocksMirror({
  width,
}: {
  width: number;
}) {
  const tab = useScopedTab();
  const blocks = tab?.blocks ?? EMPTY_BLOCKS;
  const variables = tab?.variables ?? EMPTY_VARIABLES;

  return (
    <MinimapMirror className={CssClass.BLOCKS_LIST} width={width}>
      <BlockItems blocks={blocks} variables={variables} />
    </MinimapMirror>
  );
});

export const BlocksMirror = memo(function BlocksMirror({
  width,
}: {
  width: number;
}) {
  return (
    <KeptTabs afterPaint>{() => <TabBlocksMirror width={width} />}</KeptTabs>
  );
});
