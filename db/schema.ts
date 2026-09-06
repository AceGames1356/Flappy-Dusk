import { pgTable, serial, text, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey(),
  name: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  admin: boolean().notNull().default(false),
  coins: integer().notNull().default(0),
  totalPipesPassed: integer("total_pipes_passed").notNull().default(0),
  ownedBirds: jsonb("owned_birds").notNull().default({ classic: true }),
  selectedBird: text("selected_bird").notNull().default("classic"),
  best: integer().notNull().default(0),
  pendingCoinDelta: integer("pending_coin_delta").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: text().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
