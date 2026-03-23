import { Router } from "express";
import { z } from "zod";
import type { Repository } from "./repository.js";
import type { ReminderScheduler } from "./scheduler.js";
import type { TelegramManager } from "./telegram-manager.js";

const clientSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя клиента"),
  phone: z.string().trim().min(1, "Укажите телефон"),
  commission: z.number().nonnegative().nullable().optional(),
  isDuplicate: z.boolean().optional(),
  isExclusive: z.boolean().optional(),
  link: z.string().trim().optional(),
  onlyClients: z.boolean().optional(),
  callbackAt: z.string().trim().nullable().optional(),
  noAnswer: z.boolean().optional(),
  notes: z.string().trim().optional(),
});

const settingsSchema = z.object({
  telegramBotToken: z.string().trim().optional(),
  telegramChatId: z.string().trim().optional(),
  telegramEnabled: z.boolean().optional(),
});

export function createRoutes(
  repository: Repository,
  telegramManager: TelegramManager,
  scheduler: ReminderScheduler,
): Router {
  const router = Router();

  router.get("/healthz", (_req, res) => {
    res.json({ ok: true, service: "crm-server" });
  });

  router.get("/api/settings", async (_req, res, next) => {
    try {
      const settings = await repository.getSettings();
      res.json({
        id: settings.id,
        telegramBotUsername: settings.telegram_bot_username,
        telegramChatId: settings.telegram_chat_id,
        telegramEnabled: settings.telegram_enabled,
        telegramBotTokenPresent: Boolean(settings.telegram_bot_token.trim()),
        createdAt: settings.created_at,
        updatedAt: settings.updated_at,
      });
    } catch (error) {
      next(error);
    }
  });

  router.put("/api/settings", async (req, res, next) => {
    try {
      const parsed = settingsSchema.parse(req.body ?? {});
      const settings = await repository.updateSettings(parsed);
      await telegramManager.sync(settings);
      res.json({
        id: settings.id,
        telegramBotUsername: settings.telegram_bot_username,
        telegramChatId: settings.telegram_chat_id,
        telegramEnabled: settings.telegram_enabled,
        telegramBotTokenPresent: Boolean(settings.telegram_bot_token.trim()),
        createdAt: settings.created_at,
        updatedAt: settings.updated_at,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/api/clients", async (_req, res, next) => {
    try {
      const clients = await repository.listClients();
      res.json(clients);
    } catch (error) {
      next(error);
    }
  });

  router.post("/api/clients", async (req, res, next) => {
    try {
      const parsed = clientSchema.parse(req.body ?? {});
      const client = await repository.createClient(parsed);
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/api/clients/:id", async (req, res, next) => {
    try {
      const parsed = clientSchema.partial().parse(req.body ?? {});
      const client = await repository.updateClient(req.params.id, parsed);
      res.json(client);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/api/clients/:id", async (req, res, next) => {
    try {
      await repository.deleteClient(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  router.post("/api/reminders/run", async (_req, res, next) => {
    try {
      await scheduler.tick();
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
