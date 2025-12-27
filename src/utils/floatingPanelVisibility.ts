export function getSessionFlag(sessionKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(sessionKey) === "1";
  } catch {
    return false;
  }
}

export type FloatingPanelVisibilityOptions = {
  sessionKey: string;
  closeDelayMs?: number;
  autoCloseMs?: number;
  getContainer: () => HTMLElement | null | undefined;
  getOpen: () => boolean;
  setOpen: (next: boolean) => void;
  setEnableTransitions?: (enabled: boolean) => void;
};

export type FloatingPanelVisibilityController = {
  requestOpen: () => void;
  onPointerEnter: () => void;
  onPointerMove: () => void;
  onPointerLeave: () => void;
  closeImmediately: () => void;
  mount: () => () => void;
};

export function createFloatingPanelVisibility(
  options: FloatingPanelVisibilityOptions
): FloatingPanelVisibilityController {
  const closeDelayMs = options.closeDelayMs ?? 500;
  const autoCloseMs = options.autoCloseMs ?? 3000;

  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let autoCloseTimer: ReturnType<typeof setTimeout> | undefined;
  let isPointerInside = false;

  function clearTimers(): void {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = undefined;
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    autoCloseTimer = undefined;
  }

  function openNow(): void {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = undefined;
    if (options.getOpen()) return;
    options.setOpen(true);
  }

  function scheduleClose(): void {
    if (closeTimer) clearTimeout(closeTimer);
    if (!options.getOpen()) return;
    closeTimer = setTimeout(() => {
      options.setOpen(false);
      closeTimer = undefined;
    }, closeDelayMs);
  }

  function closeImmediately(): void {
    clearTimers();
    isPointerInside = false;
    options.setOpen(false);
  }

  function requestOpen(): void {
    openNow();
  }

  function onPointerEnter(): void {
    isPointerInside = true;
    openNow();
  }

  function onPointerMove(): void {
    openNow();
  }

  function onPointerLeave(): void {
    isPointerInside = false;
    scheduleClose();
  }

  function mount(): () => void {
    try {
      window.sessionStorage.setItem(options.sessionKey, "1");
    } catch (e) {
      void e;
    }

    const onOutsidePointerDown = (event: PointerEvent) => {
      const container = options.getContainer();
      if (!container) return;
      if (event.target instanceof Node && container.contains(event.target)) return;
      closeImmediately();
    };

    const onOutsideKeyDown = (event: KeyboardEvent) => {
      const container = options.getContainer();
      if (!container) return;
      if (event.target instanceof Node && container.contains(event.target)) return;
      closeImmediately();
    };

    const onOutsideWheel = (event: WheelEvent) => {
      const container = options.getContainer();
      if (!container) return;
      if (event.target instanceof Node && container.contains(event.target)) return;
      closeImmediately();
    };

    const onOutsideFocusIn = (event: FocusEvent) => {
      const container = options.getContainer();
      if (!container) return;
      if (event.target instanceof Node && container.contains(event.target)) return;
      closeImmediately();
    };

    document.addEventListener("pointerdown", onOutsidePointerDown, true);
    document.addEventListener("keydown", onOutsideKeyDown, true);
    document.addEventListener("wheel", onOutsideWheel, { capture: true, passive: true });
    document.addEventListener("focusin", onOutsideFocusIn, true);

    options.setEnableTransitions?.(true);

    if (options.getOpen()) {
      autoCloseTimer = setTimeout(() => {
        if (!isPointerInside && options.getOpen()) options.setOpen(false);
        autoCloseTimer = undefined;
      }, autoCloseMs);
    }

    return () => {
      clearTimers();
      document.removeEventListener("pointerdown", onOutsidePointerDown, true);
      document.removeEventListener("keydown", onOutsideKeyDown, true);
      document.removeEventListener("wheel", onOutsideWheel, true);
      document.removeEventListener("focusin", onOutsideFocusIn, true);
    };
  }

  return {
    requestOpen,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    closeImmediately,
    mount,
  };
}
