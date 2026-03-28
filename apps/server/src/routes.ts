import { type NextFunction, type Request, type Response, Router } from "express";
import { z } from "zod";
import type { Repository } from "./repository.js";
import type { ReminderScheduler } from "./scheduler.js";
import type { TelegramManager } from "./telegram-manager.js";

const parkingSpotSchema = z.object({
  id: z.string().trim().optional(),
  address: z.string().trim().optional(),
  price: z.number().nullable().optional(),
  commission: z.number().nullable().optional(),
  utilitiesIncluded: z.boolean().optional(),
  deposit: z.number().nullable().optional(),
  area: z.number().nullable().optional(),
  floor: z.string().trim().optional(),
});

const propertyObjectSchema = z.object({
  id: z.string().trim().optional(),
  kind: z.enum(["object", "parking"]).optional(),
  title: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const clientSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя клиента"),
  address: z.string().trim().optional(),
  complexName: z.string().trim().optional(),
  phone: z.string().trim().min(1, "Укажите телефон"),
  isProxyPhone: z.boolean().optional(),
  commission: z.number().nonnegative().nullable().optional(),
  isDuplicate: z.boolean().optional(),
  isExclusive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  preferences: z.string().trim().optional(),
  passportData: z.string().trim().optional(),
  onlyClients: z.boolean().optional(),
  callbackAt: z.string().trim().nullable().optional(),
  noAnswer: z.boolean().optional(),
  notes: z.string().trim().optional(),
  parkingSpots: z.array(parkingSpotSchema).optional(),
  objects: z.array(propertyObjectSchema).optional(),
});

const settingsSchema = z.object({
  telegramBotToken: z.string().trim().optional(),
  telegramChatId: z.string().trim().optional(),
  telegramEnabled: z.boolean().optional(),
  listActionSearchEnabled: z.boolean().optional(),
  listActionReactionEnabled: z.boolean().optional(),
  listActionCreateEnabled: z.boolean().optional(),
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
        listActionSearchEnabled: settings.list_action_search_enabled,
        listActionReactionEnabled: settings.list_action_reaction_enabled,
        listActionCreateEnabled: settings.list_action_create_enabled,
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
        listActionSearchEnabled: settings.list_action_search_enabled,
        listActionReactionEnabled: settings.list_action_reaction_enabled,
        listActionCreateEnabled: settings.list_action_create_enabled,
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

  async function runReminders(_req: Request, res: Response, next: NextFunction) {
    try {
      await scheduler.tick();
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  }

  router.get("/api/reminders/run", runReminders);
  router.post("/api/reminders/run", runReminders);

  return router;
}
