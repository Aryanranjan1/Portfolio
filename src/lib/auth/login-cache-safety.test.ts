import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const loginPage = readFileSync(join(root, "src/app/admin/login/page.tsx"), "utf8");
const authConfig = readFileSync(join(root, "src/auth.ts"), "utf8");
const authRoute = readFileSync(join(root, "src/app/api/auth/[...nextauth]/route.ts"), "utf8");
const adminLayout = readFileSync(join(root, "src/app/admin/(protected)/layout.tsx"), "utf8");

test("prerendered login UI contains no server session or request-specific credential data", () => {
  assert.match(loginPage, /^"use client";/);
  assert.match(loginPage, /from "next-auth\/react"/);
  assert.match(loginPage, /signIn\("credentials"/);
  assert.match(loginPage, /useSearchParams\(\)/);
  assert.doesNotMatch(loginPage, /\bauth\(|\bcookies\(|\bheaders\(|getServerSession|sessionToken|csrfToken/i);
  assert.match(loginPage, /useState\(""\)/);
});

test("credentials and sessions are handled by the server Auth.js endpoint", () => {
  assert.match(authRoute, /export const \{ GET, POST \} = handlers/);
  assert.match(authConfig, /Credentials\(/);
  assert.match(authConfig, /async authorize\(credentials\)/);
  assert.match(authConfig, /bcrypt\.compare\(/);
  assert.match(authConfig, /strategy: "jwt"/);
  assert.match(authConfig, /secret: process\.env\.AUTH_SECRET/);
});

test("protected admin routes verify the session and are request-dynamic", () => {
  assert.match(adminLayout, /dynamic = "force-dynamic"/);
  assert.match(adminLayout, /await requireAdmin\(\)/);
});
