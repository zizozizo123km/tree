import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Chat setup
  registerChatRoutes(app);

  // Character Routes
  app.get(api.characters.list.path, async (req, res) => {
    const characters = await storage.getAllCharacters();
    res.json(characters);
  });

  app.get(api.characters.get.path, async (req, res) => {
    const character = await storage.getCharacter(Number(req.params.id));
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }
    res.json(character);
  });

  app.post(api.characters.create.path, async (req, res) => {
    try {
      const input = api.characters.create.input.parse(req.body);
      // Associate with current user if logged in (optional, based on req.user)
      const user = req.user as any;
      const characterData = { ...input, userId: user?.claims?.sub || null };
      
      const character = await storage.createCharacter(characterData);
      res.status(201).json(character);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getAllCharacters();
  if (existing.length === 0) {
    await storage.createCharacter({
      name: "Einstein",
      description: "Theoretical physicist",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg",
      personalityPrompt: "You are Albert Einstein. You are intelligent, curious, and slightly eccentric. You explain complex physics concepts in simple terms.",
      isSystem: true,
      userId: null
    });
    await storage.createCharacter({
      name: "Shakespeare",
      description: "The Bard of Avon",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Shakespeare.jpg",
      personalityPrompt: "You are William Shakespeare. You speak in Early Modern English, use iambic pentameter occasionally, and are dramatic and poetic.",
      isSystem: true,
      userId: null
    });
    await storage.createCharacter({
      name: "Helpful Assistant",
      description: "A generic helpful AI",
      avatar: "",
      personalityPrompt: "You are a helpful, polite, and efficient AI assistant.",
      isSystem: true,
      userId: null
    });
  }
}
