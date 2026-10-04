import type { AppContext } from '../env.js';
import { renderHomePage } from '../ui/page.js';

/** The page doesn't depend on the request, so it is built once per isolate. */
let page: string | undefined;

/** GET / — the badge builder. */
export function homeRoute(c: AppContext): Response {
  page ??= renderHomePage();
  return c.html(page);
}
