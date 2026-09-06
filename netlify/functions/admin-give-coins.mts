import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { getAuthUser } from "../../lib/accounts.js";

export default async (req: Request) => {
  const requester = await getAuthUser(req);

  if (!requester) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  if (!requester.admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  const targetName = String(body.targetName || "").trim();
  const amount = Number(body.amount);

  if (!Number.isFinite(amount)) {
    return Response.json({ error: "Amount must be a number." }, { status: 400 });
  }

  const [target] = await db.select().from(users).where(eq(users.name, targetName));

  if (!target) {
    return Response.json({ error: "No player with that name." }, { status: 404 });
  }

  const coins = Math.max(0, target.coins + amount);
  const pendingCoinDelta = target.pendingCoinDelta + amount;

  await db.update(users).set({ coins, pendingCoinDelta }).where(eq(users.id, target.id));

  return Response.json({ ok: true, coins });
};

export const config: Config = {
  path: "/api/admin/give-coins",
  method: "POST",
};
