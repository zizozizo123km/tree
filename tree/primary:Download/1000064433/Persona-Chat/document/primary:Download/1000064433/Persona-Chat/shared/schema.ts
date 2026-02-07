export * from "./models/auth";
export * from "./models/chat";

import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { conversations } from "./models/chat";

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  avatar: text("avatar"),
  personalityPrompt: text("personality_prompt").notNull(),
  userId: text("user_id").references(() => users.id), // Nullable for system characters
  isSystem: boolean("is_system").default(false).notNull(),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({ id: true });
export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
