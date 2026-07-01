import { IndexedDbTransactionMode, RunbookConfig } from '@/common/config';
import type { RunbookContent } from '@/common/types';

/**
 * IndexedDB access for runbook *content* (variables + blocks), keyed by runbook
 * id. Lightweight pointers/UI flags live in localStorage (see persistence.ts);
 * heavy content lives here.
 */

let runbookDbInstance: IDBDatabase | null = null;

function openRunbookDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (runbookDbInstance) {
      resolve(runbookDbInstance);
      return;
    }

    const request = indexedDB.open(RunbookConfig.DB_NAME, RunbookConfig.DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RunbookConfig.STORE_NAME)) {
        db.createObjectStore(RunbookConfig.STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      runbookDbInstance = request.result;
      resolve(runbookDbInstance);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function putRunbookContent(id: string, content: RunbookContent): Promise<void> {
  const db = await openRunbookDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RunbookConfig.STORE_NAME, IndexedDbTransactionMode.READ_WRITE);
    tx.objectStore(RunbookConfig.STORE_NAME).put({ id, content });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getRunbookContent(id: string): Promise<RunbookContent | null> {
  const db = await openRunbookDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RunbookConfig.STORE_NAME, IndexedDbTransactionMode.READ_ONLY);
    const request = tx.objectStore(RunbookConfig.STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result ? request.result.content : null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteRunbookContent(id: string): Promise<void> {
  const db = await openRunbookDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RunbookConfig.STORE_NAME, IndexedDbTransactionMode.READ_WRITE);
    tx.objectStore(RunbookConfig.STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
