const DEBOUNCE_MS = 800;

export type PersistStorage = {
  getItem: (name: string) => string | null | Promise<string | null>;
  setItem: (name: string, value: string) => void | Promise<void>;
  removeItem: (name: string) => void | Promise<void>;
};

/**
 * Wraps a persist storage and debounces setItem to reduce write frequency (e.g. during rapid edits).
 */
export function createDebouncedStorage(base: PersistStorage, debounceMs = DEBOUNCE_MS): PersistStorage {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let pending: { name: string; value: string } | null = null;

  const flush = () => {
    timeout = null;
    if (pending) {
      const { name, value } = pending;
      pending = null;
      base.setItem(name, value);
    }
  };

  return {
    getItem: base.getItem,
    setItem(name: string, value: string) {
      pending = { name, value };
      if (timeout === null) {
        timeout = setTimeout(flush, debounceMs);
      }
    },
    removeItem(name: string) {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      pending = null;
      base.removeItem(name);
    },
  };
}
