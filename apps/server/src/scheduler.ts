import type { Repository } from "./repository.js";
import type { TelegramManager } from "./telegram-manager.js";

function isTransientNetworkError(error: unknown): boolean {
  const text = error instanceof Error ? error.stack || error.message : String(error ?? "");
  const normalized = text.toLowerCase();

  return (
    normalized.includes("fetch failed") ||
    normalized.includes("connecttimeouterror") ||
    normalized.includes("und_err_connect_timeout") ||
    normalized.includes("etimedout") ||
    normalized.includes("econnreset") ||
    normalized.includes("enotfound") ||
    normalized.includes("eai_again")
  );
}

export class ReminderScheduler {
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private lastNetworkWarningAt = 0;

  constructor(
    private readonly repository: Repository,
    private readonly telegramManager: TelegramManager,
    private readonly intervalMs: number,
  ) {}

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.tick().catch((error) => {
        this.logTickError(error);
      });
    }, this.intervalMs);
    void this.tick().catch((error) => {
      this.logTickError(error);
    });
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;

    try {
      const settings = await this.repository.getSettings();
      if (!settings.telegram_enabled) {
        return;
      }

      const nowIso = new Date().toISOString();
      const reminders = await this.repository.getDueReminders(nowIso);

      for (const reminder of reminders) {
        const sent = await this.telegramManager.sendReminder(reminder.client, reminder.kind);
        if (sent) {
          await this.repository.markReminderSent(reminder.client.id, reminder.kind, nowIso);
        }
      }
    } finally {
      this.running = false;
    }
  }

  private logTickError(error: unknown): void {
    if (isTransientNetworkError(error)) {
      const now = Date.now();
      if (now - this.lastNetworkWarningAt >= 60_000) {
        this.lastNetworkWarningAt = now;
        console.warn("Планировщик напоминаний: временная сетевая ошибка. Повторю автоматически.");
      }
      return;
    }

    console.error("Ошибка планировщика напоминаний:", error);
  }
}

export function startReminderScheduler(
  repository: Repository,
  telegramManager: TelegramManager,
  intervalMs: number,
): ReminderScheduler {
  const scheduler = new ReminderScheduler(repository, telegramManager, intervalMs);
  scheduler.start();
  return scheduler;
}
