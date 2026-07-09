interface BlockDragState {
  srcId: string | null;
  sourceTabId: string | null;
  blockIds: string[];
}

export const blockDrag: BlockDragState = {
  srcId: null,
  sourceTabId: null,
  blockIds: [],
};

export function clearBlockDrag(): void {
  blockDrag.srcId = null;
  blockDrag.sourceTabId = null;
  blockDrag.blockIds = [];
}
