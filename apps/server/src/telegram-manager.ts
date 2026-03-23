import { Telegraf } from "telegraf";
import type { Repository } from "./repository.js";
import type { ClientRow, ReminderKind, SettingsRow } from "./types.js";

function formatClientCard(client: ClientRow): string {
  const parts = [
    `Клиент: ${client.name}`,
    `Телефон: ${client.phone}`,
    `Комиссия: ${client.commission}`,
    `Дубль: ${client.is_duplicate ? "да" : "нет"}`,
    `Эксклюзив: ${client.is_exclusive ? "да" : "нет"}`,
    `Только клиенты: ${client.only_clients ? "да" : "нет"}`,
  ];

  if (client.link) parts.push(`Ссылка: ${client.link}`);
  if (client.callback_at) parts.push(`Перезвонить: ${new Date(client.callback_at).toLocaleString("ru-RU")}`);
  if (client.no_answer) parts.push("Статус: нет ответа");
  if (client.notes) parts.push(`Комментарий: ${client.notes}`);

  return parts.join("\n");
}

function formatReminder(client: ClientRow, kind: ReminderKind): string {
  const title =
    kind === "callback_at"
      ? "Напоминание: перезвонить по времени"
      : "Напоминание: нет ответа, пора перезвонить";

  return [title, "", formatClientCard(client)].join("\n");
}

export class TelegramManager {
  private bot: Telegraf | null = null;
  private activeToken: string | null = null;
  private activeChatId: string | null = null;

  constructor(private readonly repository: Repository) {}

  async sync(settings?: SettingsRow): Promise<void> {
    const nextSettings = settings ?? (await this.repository.getSettings());
    const token = nextSettings.telegram_bot_token.trim();
    const enabled = nextSettings.telegram_enabled;
    const chatId = nextSettings.telegram_chat_id.trim();

    if (!token || !enabled) {
      await this.stop();
      this.activeChatId = chatId || null;
      return;
    }

    const tokenChanged = token !== this.activeToken;
    const chatChanged = chatId !== this.activeChatId;

    if (!this.bot || tokenChanged) {
      await this.stop();
      this.bot = new Telegraf(token);
      this.registerHandlers();
      await this.bot.launch({ dropPendingUpdates: true });
      this.activeToken = token;
      const username = this.bot.botInfo?.username ?? "";
      if (username && username !== nextSettings.telegram_bot_username) {
        await this.repository.updateSettings({ telegramBotUsername: username });
      }
    }

    this.activeChatId = chatId || null;

    if (this.bot && chatChanged) {
      await this.bot.telegram.setMyCommands([
        { command: "start", description: "Сохранить текущий чат для уведомлений" },
        { command: "status", description: "Показать состояние бота" },
      ]);
    }
  }

  async stop(): Promise<void> {
    if (this.bot) {
      await this.bot.stop();
      this.bot = null;
    }
    this.activeToken = null;
  }

  async sendMessage(text: string): Promise<boolean> {
    if (!this.bot || !this.activeChatId) return false;
    try {
      await this.bot.telegram.sendMessage(this.activeChatId, text);
      return true;
    } catch (error) {
      console.error("Не удалось отправить Telegram-уведомление:", error);
      return false;
    }
  }

  private registerHandlers(): void {
    if (!this.bot) return;

    this.bot.start(async (ctx) => {
      const chatId = String(ctx.chat.id);
      const username = ctx.botInfo.username ?? "";
      await this.repository.updateSettings({
        telegramChatId: chatId,
        telegramEnabled: true,
        telegramBotUsername: username,
      });
      this.activeChatId = chatId;
      await ctx.reply(`Чат сохранен для уведомлений.\nБот: @${username || "неизвестно"}`);
    });

    this.bot.command("status", async (ctx) => {
      await ctx.reply(
        [
          "Статус CRM-бота:",
          `Активен: ${this.bot ? "да" : "нет"}`,
          `Чат уведомлений: ${this.activeChatId || "не задан"}`,
        ].join("\n"),
      );
    });
  }

  async sendReminder(client: ClientRow, kind: ReminderKind): Promise<boolean> {
    return this.sendMessage(formatReminder(client, kind));
  }
}
