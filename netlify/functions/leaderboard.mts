import type { Config } from "@netlify/functions";
import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";

export default async () => {
  const rows = await db
    .select({
      name: users.name,
      pipes: users.totalPipesPassed,
      best: users.best,
    })
    .from(users)
    .orderBy(desc(users.totalPipesPassed), desc(users.best))
    .limit(20);

  return Response.json({ rows });
};

export const config: Config = {
  path: "/api/leaderboard",
  method: "GET",
};
