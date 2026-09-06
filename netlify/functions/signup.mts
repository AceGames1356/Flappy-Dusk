import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users, sessions } from "../../db/schema.js";
import { ADMIN_USERNAMES, makePassword, makeToken, progressFromUser } from "../../lib/accounts.js";

export default async (req: Request) => {
  const body = await req.json().catch(() => ({}));

  const name = String(body.name || "").trim().slice(0, 20);
  const password = String(body.password || "");

  if (!/^[A-Za-z0-9 _-]{2,20}$/.test(name) || password.length < 4) {
    return Response.json(
      { error: "Use a 2–20 character name and a 4+ character password." },
      { status: 400 },
    );
  }

  const [existing] = await db.select().from(users).where(eq(users.name, name));

  if (existing) {
    return Response.json({ error: "That name is already taken." }, { status: 409 });
  }

  const { salt, hash } = makePassword(password);

  const [user] = await db
    .insert(users)
    .values({
      name,
      passwordHash: hash,
      passwordSalt: salt,
      admin: ADMIN_USERNAMES.has(name),
    })
    .returning();

  const token = makeToken();
  await db.insert(sessions).values({ token, userId: user.id });

  return Response.json({
    token,
    user: { name: user.name, admin: user.admin },
    progress: progressFromUser(user),
  });
};

export const config: Config = {
  path: "/api/signup",
  method: "POST",
};
