// Post-login redirect sanitising.
//
// The `?redirect=` query parameter is attacker-controlled: anyone can send a
// victim a link like `/login?redirect=…`. Only same-origin paths may come out
// of here — never another origin, a scheme-relative URL (`//host`), or a
// script-bearing scheme (`javascript:`, `data:`, …).
//
// Pure functions (no window/document) so they run identically in the browser,
// on the server and under `node --test` (tests/safeRedirect.test.mjs).

// Parsing base only; never navigated to. `.invalid` is a reserved TLD.
const PARSE_BASE = 'https://zyncmart.invalid';
const MAX_LENGTH = 2048;
const ADMIN_HOME = '/admin/dashboard';
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

// A path is only safe if it is rooted at "/" and cannot be read by a browser
// as a host: "//host", "/\host" and any backslash are rejected because
// browsers treat "\" as "/" in URLs.
function hasSafePathShape(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\') && !CONTROL_CHARS.test(path);
}

// Fully percent-decodes the path part (handles double encoding such as
// "%252F"). Returns null for malformed encodings.
function decodedPathPart(value: string): string | null {
  let current = value.split(/[?#]/, 1)[0];
  for (let i = 0; i < 5; i += 1) {
    let next: string;
    try {
      next = decodeURIComponent(current);
    } catch {
      return null;
    }
    if (next === current) return current;
    current = next;
  }
  return null; // still changing after 5 rounds — refuse rather than guess
}

/**
 * Returns `value` as a same-origin path ("/path?query#hash") when it is safe
 * to navigate to after login, otherwise `fallback`.
 */
export function safeRedirect(value: unknown, fallback = '/'): string {
  if (typeof value !== 'string') return fallback;
  const candidate = value.trim();
  if (!candidate || candidate.length > MAX_LENGTH || !hasSafePathShape(candidate)) return fallback;

  const decodedPath = decodedPathPart(candidate);
  if (decodedPath === null || !hasSafePathShape(decodedPath)) return fallback;

  let url: URL;
  try {
    url = new URL(candidate, PARSE_BASE);
  } catch {
    return fallback;
  }
  if (url.origin !== PARSE_BASE) return fallback;

  return `${url.pathname}${url.search}${url.hash}`;
}

function isAdminPath(path: string): boolean {
  return path === '/admin' || /^\/admin[/?#]/.test(path);
}

/**
 * Where a user lands after signing in: admins go to the admin dashboard unless
 * they asked for a specific admin page; customers go to their (safe) requested
 * page but never to an admin page.
 */
export function resolvePostLoginDestination({ requested, role }: { requested?: string | null; role?: string | null }): string {
  const safe = safeRedirect(requested, '/');
  if (role === 'admin') return isAdminPath(safe) ? safe : ADMIN_HOME;
  return isAdminPath(safe) ? '/' : safe;
}
