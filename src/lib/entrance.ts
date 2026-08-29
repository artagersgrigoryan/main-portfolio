/**
 * Entrance animations vs. prerendered HTML.
 *
 * The build ships each route's body as static HTML, so content is on screen
 * roughly a second before React boots on a phone. The entrance animations all
 * start from `opacity: 0` — run unchanged, they would take content the visitor
 * is already reading and blink it out to fade it back in.
 *
 * The rule: on a prerendered first load, an element that is *already in the
 * viewport* must not be hidden. Anything below the fold was never seen, so it
 * keeps its reveal exactly as designed — scroll down and the work list still
 * staggers in.
 *
 * The guard lifts on the first client-side navigation: from then on React owns
 * the DOM, nothing is pre-painted, and every animation behaves normally.
 */

let guardActive: boolean | null = null;

function isPrerenderedLoad(): boolean {
  if (guardActive === null) {
    guardActive = document.documentElement.dataset.prerendered === 'true';
  }
  return guardActive;
}

/** Called on the first route change — after that nothing is pre-painted. */
export function releaseEntranceGuard(): void {
  guardActive = false;
  delete document.documentElement.dataset.prerendered;
}

/**
 * True when `el` is already painted on screen from prerendered HTML, and so
 * must be left visible rather than animated in.
 */
export function alreadyPainted(el: Element | null | undefined): boolean {
  if (!el || !isPrerenderedLoad()) return false;
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0 && r.width > 0;
}
