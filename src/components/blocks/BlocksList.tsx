import './Blocks.css';

import { useMemo } from 'react';

import { ElementId } from '@/common/constants/dom';
import type { Block, Variable } from '@/common/types';
import { getActiveTab, useStore } from '@/store/store';
import { getSecretKeys, getVariableMap } from '@/utils/resolution';
import { BlockItem } from './BlockItem';

const EMPTY_BLOCKS: Block[] = [];
const EMPTY_VARIABLES: Variable[] = [];

export function BlocksList() {
  const activeTab = useStore(getActiveTab);
  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;

  const variableMap = useMemo(() => getVariableMap(variables), [variables]);
  const secretKeys = useMemo(() => getSecretKeys(variables), [variables]);

  return (
    <div id={ElementId.BLOCKS_LIST}>
      {blocks.map((block) => (
        <BlockItem key={block.id} block={block} variableMap={variableMap} secretKeys={secretKeys} />
      ))}
    </div>
  );
}
