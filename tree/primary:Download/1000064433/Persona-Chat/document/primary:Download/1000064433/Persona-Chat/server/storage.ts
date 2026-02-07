import { db } from "./db";
import { characters, type InsertCharacter, type Character } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Characters
  getAllCharacters(): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character>;
  deleteCharacter(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Characters
  async getAllCharacters(): Promise<Character[]> {
    return db.select().from(characters);
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character;
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const [character] = await db.insert(characters).values(insertCharacter).returning();
    return character;
  }

  async updateCharacter(id: number, updates: Partial<InsertCharacter>): Promise<Character> {
    const [character] = await db.update(characters).set(updates).where(eq(characters.id, id)).returning();
    return character;
  }

  async deleteCharacter(id: number): Promise<void> {
    await db.delete(characters).where(eq(characters.id, id));
  }
}

export const storage = new DatabaseStorage();
