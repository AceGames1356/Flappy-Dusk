import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, sessions } from "../db/schema.js";

// Usernames in this list get `admin: true` on their account, which the
// client uses to unlock the in-game admin commands (skip pipe / immortal).
// This only gates client-side single-player cheats.
export const ADMIN_USERNAMES = new Set(["ViLocity", "RAINDEV123"]);

export function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function makePassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  return { salt, hash: hashPassword(password, salt) };
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const a = Buffer.from(hashPassword(password, salt), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function makeToken() {
  return crypto.randomBytes(32).toString("hex");
}

type UserRow = typeof users.$inferSelect;

export function progressFromUser(user: UserRow) {
  return {
    coins: user.coins,
    totalPipesPassed: user.totalPipesPassed,
    ownedBirds: user.ownedBirds,
    selectedBird: user.selectedBird,
    best: user.best,
    updatedAt: user.updatedAt.getTime(),
  };
}

export async function getAuthUser(req: Request): Promise<UserRow | null> {
  const header = req.headers.get("authorization") || "";

  if (!header.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice(7);
  const [session] = await db.select().from(sessions).where(eq(sessions.token, token));

  if (!session) {
    return null;
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId));

  return user || null;
}
