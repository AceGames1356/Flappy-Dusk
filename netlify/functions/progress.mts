import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { getAuthUser } from "../../lib/accounts.js";

export default async (req: Request) => {
  const user = await getAuthUser(req);

  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const pendingDelta = user.pendingCoinDelta || 0;
  const incomingCoins = Number(body.coins) || 0;
  const ownedBirds =
    body.ownedBirds && typeof body.ownedBirds === "object" ? body.ownedBirds : { classic: true };

  await db
    .update(users)
    .set({
      coins: Math.max(0, incomingCoins + pendingDelta),
      totalPipesPassed: Number(body.totalPipesPassed) || 0,
      ownedBirds,
      selectedBird: String(body.selectedBird || "classic"),
      best: Number(body.best) || 0,
      pendingCoinDelta: 0,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return Response.json({ ok: true });
};

export const config: Config = {
  path: "/api/progress",
  method: "PUT",
};
