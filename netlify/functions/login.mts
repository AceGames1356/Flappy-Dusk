import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users, sessions } from "../../db/schema.js";
import { makeToken, progressFromUser, verifyPassword } from "../../lib/accounts.js";

export default async (req: Request) => {
  const body = await req.json().catch(() => ({}));

  const name = String(body.name || "").trim();
  const password = String(body.password || "");

  const [user] = await db.select().from(users).where(eq(users.name, name));

  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return Response.json({ error: "Name or password is incorrect." }, { status: 401 });
  }

  const token = makeToken();
  await db.insert(sessions).values({ token, userId: user.id });

  return Response.json({
    token,
    user: { name: user.name, admin: user.admin },
    progress: progressFromUser(user),
  });
};

export const config: Config = {
  path: "/api/login",
  method: "POST",
};
