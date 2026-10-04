// Audit C-05 — the login `redirect` parameter must only ever lead to a page on
// this site. Runs with Node's built-in test runner (no extra dependencies):
//   npm test
//
// Contract for zyncmart_frontend/lib/safeRedirect.ts (Phase 1, Step 1):
//   safeRedirect(value, fallback = '/')  → a same-origin path ("/x?y#z") or `fallback`
//   resolvePostLoginDestination({ requested, role }) → where to send a user after login
// Both must be pure (no window/document) so they can be tested here and used on the server.
import { test } from 'node:test';
import assert from 'node:assert/strict';

async function loadModule() {
  try {
    return await import('../lib/safeRedirect.ts');
  } catch (err) {
    if (err?.code === 'ERR_MODULE_NOT_FOUND') {
      assert.fail('lib/safeRedirect.ts does not exist yet — login redirects are currently unsanitised (LoginClient.tsx → useAuth.ts finishAuth). Implemented in Phase 1, Step 1.');
    }
    throw err;
  }
}

const MALICIOUS = [
  ['absolute external URL', 'https://evil.example'],
  ['scheme-relative URL', '//evil.example'],
  ['backslash scheme-relative', '/\\evil.example'],
  ['double backslash', '\\\\evil.example'],
  ['tab-smuggled scheme-relative', '/\t/evil.example'],
  ['newline-smuggled scheme-relative', '/\n/evil.example'],
  ['javascript: URL', 'javascript:alert(document.cookie)'],
  ['mixed-case javascript: with leading space', ' JaVaScRiPt:alert(1)'],
  ['data: URL', 'data:text/html,<script>alert(1)</script>'],
  ['vbscript: URL', 'vbscript:msgbox(1)'],
  ['scheme without slashes', 'http:evil.example'],
  ['bare host', 'evil.example/account'],
  ['empty string', ''],
  ['whitespace only', '   '],
  // Encoded / malformed values. URLSearchParams.get() has already decoded
  // the query string once, so anything still encoded here was encoded on purpose.
  ['encoded scheme-relative', '/%2F%2Fevil.example'],
  ['double-encoded scheme-relative', '/%252F%252Fevil.example'],
  ['encoded backslash', '/%5Cevil.example'],
  ['encoded leading slashes without a root', '%2F%2Fevil.example'],
  ['encoded javascript: scheme', 'javascript%3Aalert(1)'],
  ['encoded newline smuggling', '/%0A/evil.example'],
  ['malformed percent-encoding', '/%E0%A4%A'],
  ['lone percent sign', '/%'],
  ['backslash later in the path', '/account\\..\\..\\evil.example'],
  ['overlong value', `/${'a'.repeat(3000)}`],
];

test('non-string redirect values fall back', async () => {
  const { safeRedirect } = await loadModule();
  for (const value of [42, {}, ['/account'], true]) {
    assert.equal(safeRedirect(value, '/'), '/');
  }
});

for (const [label, value] of MALICIOUS) {
  test(`malicious login redirect is rejected: ${label}`, async () => {
    const { safeRedirect } = await loadModule();
    assert.equal(safeRedirect(value, '/'), '/');
  });
}

test('missing redirect falls back', async () => {
  const { safeRedirect } = await loadModule();
  assert.equal(safeRedirect(null, '/'), '/');
  assert.equal(safeRedirect(undefined, '/account'), '/account');
});

const SAFE = [
  '/',
  '/account',
  '/account/orders',
  '/checkout?step=payment',
  '/products/blue-saree#reviews',
  '/admin/orders/123',
  '/search?q=red%20saree&page=2',
  '/products/%E2%9C%93-tee',
];

for (const value of SAFE) {
  test(`safe internal login redirect is preserved: ${value}`, async () => {
    const { safeRedirect } = await loadModule();
    assert.equal(safeRedirect(value, '/'), value);
  });
}

test('post-login destination: admins go to the dashboard unless they asked for an admin page', async () => {
  const { resolvePostLoginDestination } = await loadModule();
  assert.equal(resolvePostLoginDestination({ requested: '/account', role: 'admin' }), '/admin/dashboard');
  assert.equal(resolvePostLoginDestination({ requested: '/admin/orders/1', role: 'admin' }), '/admin/orders/1');
});

test('post-login destination: customers never land on admin pages or external sites', async () => {
  const { resolvePostLoginDestination } = await loadModule();
  assert.equal(resolvePostLoginDestination({ requested: '/admin/dashboard', role: 'user' }), '/');
  assert.equal(resolvePostLoginDestination({ requested: '/checkout', role: 'user' }), '/checkout');
  assert.equal(resolvePostLoginDestination({ requested: 'https://evil.example', role: 'user' }), '/');
  assert.equal(resolvePostLoginDestination({ requested: 'javascript:alert(1)', role: 'admin' }), '/admin/dashboard');
});

test('post-login destination: path traversal cannot smuggle a customer into admin', async () => {
  const { resolvePostLoginDestination } = await loadModule();
  assert.equal(resolvePostLoginDestination({ requested: '/account/../admin/dashboard', role: 'user' }), '/');
});

test('post-login destination: a path that merely starts with "admin" is not an admin page', async () => {
  const { resolvePostLoginDestination } = await loadModule();
  assert.equal(resolvePostLoginDestination({ requested: '/administration-guide', role: 'user' }), '/administration-guide');
});

test('post-login destination: no requested page', async () => {
  const { resolvePostLoginDestination } = await loadModule();
  assert.equal(resolvePostLoginDestination({ requested: null, role: 'user' }), '/');
  assert.equal(resolvePostLoginDestination({ requested: undefined, role: 'admin' }), '/admin/dashboard');
});
