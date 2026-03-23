import type { Repository } from "./repository.js";
import type { TelegramManager } from "./telegram-manager.js";

export class ReminderScheduler {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly repository: Repository,
    private readonly telegramManager: TelegramManager,
    private readonly intervalMs: number,
  ) {}

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.tick();
    }, this.intervalMs);
    void this.tick();
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
