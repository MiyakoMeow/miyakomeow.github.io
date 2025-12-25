import { writable } from "svelte/store";

export type JsonPreviewCopyHandler = (text: string) => Promise<void> | void;

export interface JsonPreviewOpenOptions {
  value: unknown;
  label?: string;
  maxHeightRem?: number;
  onCopy?: JsonPreviewCopyHandler;
}

export interface JsonPreviewItem {
  id: string;
  open: boolean;
  value: unknown;
  label: string;
  maxHeightRem: number;
  onCopy: JsonPreviewCopyHandler | undefined;
  x: number;
  y: number;
}

export const jsonPreviewStore = writable<JsonPreviewItem[]>([]);

const hideTimers = new Map<string, ReturnType<typeof setTimeout>>();

function upsert(id: string, updater: (prev: JsonPreviewItem) => JsonPreviewItem): void {
  jsonPreviewStore.update((items) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) {
      const created: JsonPreviewItem = {
        id,
        open: false,
        value: undefined,
        label: "JSON",
        maxHeightRem: 14,
        onCopy: undefined,
        x: 0,
        y: 0,
      };
      return [...items, updater(created)];
    }
    const next = updater(items[idx]);
    const copy = items.slice();
    copy[idx] = next;
    return copy;
  });
}

export function jsonPreviewCancelHide(id: string): void {
  const t = hideTimers.get(id);
  if (!t) return;
  clearTimeout(t);
  hideTimers.delete(id);
}

export function jsonPreviewScheduleHide(id: string): void {
  jsonPreviewCancelHide(id);
  const t = setTimeout(() => {
    upsert(id, (prev) => ({ ...prev, open: false }));
    hideTimers.delete(id);
  }, 500);
  hideTimers.set(id, t);
}

export function jsonPreviewHideNow(id: string): void {
  jsonPreviewCancelHide(id);
  upsert(id, (prev) => ({ ...prev, open: false }));
}

export function jsonPreviewHideAllNow(): void {
  for (const id of hideTimers.keys()) {
    jsonPreviewCancelHide(id);
  }
  jsonPreviewStore.update((items) => items.map((i) => ({ ...i, open: false })));
}

export function jsonPreviewShow(id: string, options: JsonPreviewOpenOptions, x: number, y: number): void {
  jsonPreviewCancelHide(id);
  upsert(id, (prev) => ({
    ...prev,
    open: true,
    value: options.value,
    label: options.label ?? "JSON",
    maxHeightRem: options.maxHeightRem ?? 14,
    onCopy: options.onCopy,
    x,
    y,
  }));
}
