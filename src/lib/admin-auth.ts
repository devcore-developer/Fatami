// Admin authentication helpers
// Stateless signed-token sessions (HTTP-only cookie) — serverless-safe.
// The old in-memory Map broke on Vercel: every Lambda instance has its own
// memory, so sessions vanished between requests (random 401s).
// The token now carries userId + expiry and is signed with HMAC-SHA256,
// so ANY instance can verify it. No new dependencies, no migration.

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE = "Futami_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Demo password check. Replace the seeded passwordHash with a real bcrypt hash
// generated from your chosen password, then swap this for bcrypt.compare.
const DEMO_PASSWORD = "admin123";

// Set ADMIN_SESSION_SECRET on Vercel (any long random string).
// The fallback keeps local dev working but must never be relied on in production.
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.AUTH_SECRET ||
  "fatami-dev-secret-change-me-in-production";

function sign(payload: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
}

function buildToken(userId: string, expiresMs: number): string {
  const payload = `${userId}.${expiresMs}`;
  return `${payload}.${sign(payload)}`;
}

function parseToken(token: string | undefined): { userId: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresStr, signature] = parts;

  const payload = `${userId}.${expiresStr}`;
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const expiresMs = Number(expiresStr);
  if (!Number.isFinite(expiresMs) || Date.now() > expiresMs) return null;
  return { userId };
}

export async function verifyAdmin(email: string, password: string) {
  const user = await db.adminUser.findUnique({ where: { email } });
  if (!user) return null;
  // Demo: accept DEMO_PASSWORD for the seeded admin.
  // Real implementation: const ok = await bcrypt.compare(password, user.passwordHash)
  if (password !== DEMO_PASSWORD) return null;
  return user;
}

export async function createAdminSession(userId: string) {
  const expiresMs = Date.now() + SESSION_MAX_AGE * 1000;
  const token = buildToken(userId, expiresMs);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresMs),
  });
  return token;
}

export async function getAdminSession(): Promise<{ userId: string } | null> {
  const store = await cookies();
  return parseToken(store.get(SESSION_COOKIE)?.value);
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  const user = await db.adminUser.findUnique({ where: { id: session.userId } });
  return user;
}