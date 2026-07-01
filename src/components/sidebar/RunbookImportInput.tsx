import { useEffect, useRef } from 'react';
import { useStore } from '@/store/store';
import { registerImportTrigger } from '@/utils/importTrigger';

/** Hidden file input for importing runbook JSON. Exposed via `importTrigger`. */
export function RunbookImportInput() {
  const importRunbooks = useStore((s) => s.importRunbooks);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    registerImportTrigger(() => ref.current?.click());
    return () => registerImportTrigger(null);
  }, []);

  return (
    <input
      ref={ref}
      id="runbook-import-input"
      type="file"
      accept=".json"
      multiple
      style={{ display: 'none' }}
      onChange={(e) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length > 0) {
          void importRunbooks(files);
        }
        e.target.value = '';
      }}
    />
  );
}
