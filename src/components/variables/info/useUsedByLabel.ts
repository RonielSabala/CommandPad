import { useTranslation } from "@/i18n";

export function useUsedByLabel() {
  const t = useTranslation();

  return ({ blocks, variables }: { blocks: number; variables: number }) =>
    blocks + variables > 0 ? t.info.usedBy(blocks, variables) : t.info.unused;
}
