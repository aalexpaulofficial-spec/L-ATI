/**
 * LIGHTNING ATI — JS → CSS bridge.
 *
 * Scene renderers publish numeric reveal values as CSS custom properties so all
 * grading and reveal work stays in stylesheets. Writes are de-duped: a scroll
 * tick that changes nothing touches no style at all.
 */
export type VarMap = Record<string, number>;

export function createVarWriter(precision = 3) {
  const cache = new Map<string, string>();
  return function write(el: HTMLElement | null, vars: VarMap) {
    if (!el) return;
    for (const key in vars) {
      const next = vars[key].toFixed(precision);
      if (cache.get(key) === next) continue;
      cache.set(key, next);
      el.style.setProperty(key, next);
    }
  };
}
