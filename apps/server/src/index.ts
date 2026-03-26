import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { Repository } from "./repository.js";
import { ReminderScheduler } from "./scheduler.js";
import { createRoutes } from "./routes.js";
import { TelegramManager } from "./telegram-manager.js";

function isPollingConflict(reason: unknown): boolean {
  if (!reason || typeof reason !== "object") {
    return false;
  }

  const maybeResponse = "response" in reason ? reason.response : null;
  const errorCode =
    maybeResponse && typeof maybeResponse === "object" && "error_code" in maybeResponse
      ? maybeResponse.error_code
      : null;
  const description =
    maybeResponse && typeof maybeResponse === "object" && "description" in maybeResponse
      ? String(maybeResponse.description)
      : "";

  return (
    errorCode === 409 ||
    description.toLowerCase().includes("terminated by other getupdates request") ||
    description.toLowerCase().includes("conflict")
  );
}

async function main(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const webDistPath = path.resolve(__dirname, "../../web/dist");
  const webIndexPath = path.join(webDistPath, "index.html");
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

  if (existsSync(webIndexPath)) {
    app.use(express.static(webDistPath));
    app.get(/^(?!\/api(?:\/|$)|\/healthz$).*/, (_req, res) => {
      res.sendFile(webIndexPath);
    });
  } else {
    console.warn(`Фронтенд не найден по пути ${webIndexPath}`);
  }

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка сервера";
    const statusCode = message.toLowerCase().includes("не найден") ? 404 : 500;
    console.error("Ошибка сервера:", error);
    res.status(statusCode).json({ ok: false, error: message });
  });

  app.listen(config.PORT, () => {
    console.log(`CRM backend запущен на порту ${config.PORT}`);
  });

  void (async () => {
    try {
      const settings = await repository.getSettings();

      try {
        await telegramManager.sync(settings);
      } catch (error) {
        console.error("Не удалось запустить Telegram-бота при старте:", error);
      }

      scheduler.start();

      setInterval(() => {
        void telegramManager.sync().catch((error) => {
          console.error("Не удалось синхронизировать Telegram-бота:", error);
        });
      }, config.SETTINGS_SYNC_INTERVAL_MS);
    } catch (error) {
      console.error("Не удалось завершить инициализацию после старта сервера:", error);
    }
  })();

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

  process.on("unhandledRejection", (reason) => {
    if (isPollingConflict(reason)) {
      console.warn(
        "Пойман конфликт getUpdates от другой копии бота. Локальный сервер продолжает работать без приема команд.",
      );
      return;
    }

    console.error("Необработанное отклонение промиса:", reason);
  });
}

void main().catch((error) => {
  console.error("Не удалось запустить сервер:", error);
  process.exit(1);
});
