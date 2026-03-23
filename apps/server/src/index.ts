import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { Repository } from "./repository.js";
import { ReminderScheduler } from "./scheduler.js";
import { createRoutes } from "./routes.js";
import { TelegramManager } from "./telegram-manager.js";

async function main(): Promise<void> {
  const repository = new Repository();
  const telegramManager = new TelegramManager(repository);
  const scheduler = new ReminderScheduler(repository, telegramManager, config.REMINDER_CHECK_INTERVAL_MS);
  const app = express();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: config.CORS_ORIGIN === "*" ? true : config.CORS_ORIGIN.split(",").map((value) => value.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(createRoutes(repository, telegramManager, scheduler));

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка сервера";
    const statusCode = message.toLowerCase().includes("не найден") ? 404 : 500;
    console.error("Ошибка сервера:", error);
    res.status(statusCode).json({ ok: false, error: message });
  });

  const settings = await repository.getSettings();
  await telegramManager.sync(settings);
  scheduler.start();

  setInterval(() => {
    void telegramManager.sync().catch((error) => {
      console.error("Не удалось синхронизировать Telegram-бота:", error);
    });
  }, config.SETTINGS_SYNC_INTERVAL_MS);

  app.listen(config.PORT, () => {
    console.log(`CRM backend запущен на порту ${config.PORT}`);
  });

  process.on("SIGINT", async () => {
    scheduler.stop();
    await telegramManager.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    scheduler.stop();
    await telegramManager.stop();
    process.exit(0);
  });
}

void main().catch((error) => {
  console.error("Не удалось запустить сервер:", error);
  process.exit(1);
});
