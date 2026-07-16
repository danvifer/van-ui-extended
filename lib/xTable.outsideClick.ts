/**
 * Single module-level `document` click listener delegates to every live
 * `xTable` instance. Each instance registers its own "close all popovers"
 * callback; the delegate invokes them when the click target is not inside
 * the instance's wrapper element.
 *
 * Cleanup is best-effort: a `MutationObserver` watches the document for
 * the wrapper's detachment and removes the callback when it goes away.
 * If `MutationObserver` is unavailable, the callback stays registered —
 * a bounded memory leak proportional to the number of mounted/unmounted
 * tables, which we accept rather than pay for explicit lifecycle hooks.
 */

type OutsideClickHandler = (target: EventTarget | null) => void;

const handlers = new Set<OutsideClickHandler>();
let installed = false;

const installListener = (): void => {
  if (installed) return;
  if (typeof document === "undefined") return;
  document.addEventListener("click", (e: MouseEvent) => {
    for (const fn of handlers) fn(e.target);
  });
  installed = true;
};

/**
 * Register an "outside click" closer for the supplied wrapper element.
 * Calls `onOutside` when the click target is outside the wrapper.
 */
export const registerOutsideClick = (
  wrapper: Element,
  onOutside: () => void,
): void => {
  const handler: OutsideClickHandler = (target) => {
    if (target instanceof Node && wrapper.contains(target)) return;
    onOutside();
  };
  handlers.add(handler);
  installListener();

  if (typeof MutationObserver !== "undefined") {
    const obs = new MutationObserver(() => {
      if (!wrapper.isConnected) {
        handlers.delete(handler);
        obs.disconnect();
      }
    });
    queueMicrotask(() => {
      const root =
        wrapper.ownerDocument?.body ?? wrapper.parentNode ?? null;
      if (root) obs.observe(root, { childList: true, subtree: true });
    });
  }
};
