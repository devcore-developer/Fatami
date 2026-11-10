// Admin authentication helpers
// Simple session-token based auth (HTTP-only cookie).
// In production, pair with proper bcrypt password hashing.

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE = "Futami_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Demo password check. Replace the seeded passwordHash with a real bcrypt hash
// generated from your chosen password, then swap this for bcrypt.compare.
// For now we accept a known demo password to make the panel usable.
const DEMO_PASSWORD = "admin123";

export async function verifyAdmin(email: string, password: string) {
  const user = await db.adminUser.findUnique({ where: { email } });
  if (!user) return null;
  // Demo: accept DEMO_PASSWORD for the seeded admin.
  // Real implementation: const ok = await bcrypt.compare(password, user.passwordHash)
  if (password !== DEMO_PASSWORD) return null;
  return user;
}

export async function createAdminSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  // Store session in a lightweight in-memory map (persisted via cookie only).
  // For production use a DB-backed Session model or JWT.
  sessions.set(token, { userId, expires });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
  return token;
}

export async function getAdminSession(): Promise<{ userId: string } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expires < new Date()) {
    sessions.delete(token);
    return null;
  }
  return { userId: session.userId };
}

export async function destroyAdminSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) sessions.delete(token);
  store.delete(SESSION_COOKIE);
}

export async function getCurrentAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  const user = await db.adminUser.findUnique({ where: { id: session.userId } });
  return user;
}

// In-memory session store (fine for single-instance deployment).
// For multi-instance production, persist sessions in the DB.
const sessions = new Map<string, { userId: string; expires: Date }>();
