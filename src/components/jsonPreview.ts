import { get, writable } from "svelte/store";

export type JsonPreviewCopyHandler = (text: string) => Promise<void> | void;

export interface JsonPreviewOpenOptions {
  value: unknown;
  label?: string;
  maxHeightRem?: number;
  onCopy?: JsonPreviewCopyHandler;
}

export interface JsonPreviewState {
  open: boolean;
  value: unknown;
  label: string;
  maxHeightRem: number;
  onCopy: JsonPreviewCopyHandler | undefined;
  x: number;
  y: number;
  frozen: boolean;
}

const defaultState: JsonPreviewState = {
  open: false,
  value: undefined,
  label: "JSON",
  maxHeightRem: 18,
  onCopy: undefined,
  x: 0,
  y: 0,
  frozen: false,
};

export const jsonPreviewState = writable<JsonPreviewState>(defaultState);

let hideTimer: ReturnType<typeof setTimeout> | undefined;

export function jsonPreviewCancelHide(): void {
  if (!hideTimer) return;
  clearTimeout(hideTimer);
  hideTimer = undefined;
}

export function jsonPreviewScheduleHide(): void {
  jsonPreviewCancelHide();
  hideTimer = setTimeout(() => {
    jsonPreviewState.update((s) => ({ ...s, open: false, frozen: false }));
    hideTimer = undefined;
  }, 500);
}

export function jsonPreviewHideNow(): void {
  jsonPreviewCancelHide();
  jsonPreviewState.update((s) => ({ ...s, open: false, frozen: false }));
}

export function jsonPreviewSetFrozen(frozen: boolean): void {
  jsonPreviewState.update((s) => ({ ...s, frozen }));
}

export function jsonPreviewMove(x: number, y: number): void {
  const s = get(jsonPreviewState);
  if (!s.open) return;
  if (s.frozen) return;
  if (s.x === x && s.y === y) return;
  jsonPreviewState.update((cur) => ({ ...cur, x, y }));
}

export function jsonPreviewShow(options: JsonPreviewOpenOptions, x?: number, y?: number): void {
  jsonPreviewCancelHide();
  jsonPreviewState.update((s) => ({
    ...s,
    open: true,
    value: options.value,
    label: options.label ?? "JSON",
    maxHeightRem: options.maxHeightRem ?? 18,
    onCopy: options.onCopy,
    frozen: false,
  }));
  if (typeof x === "number" && typeof y === "number") {
    jsonPreviewMove(x, y);
  }
}
