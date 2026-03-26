import { Telegraf } from "telegraf";
import type { Repository } from "./repository.js";
import type { ClientRow, ReminderKind, SettingsRow } from "./types.js";

const TELEGRAM_TIME_ZONE = "Europe/Moscow";

function formatTelegramDateTime(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: TELEGRAM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

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
  if (client.callback_at) parts.push(`Перезвонить: ${formatTelegramDateTime(client.callback_at)}`);
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

function isTelegramPollingConflict(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeResponse = "response" in error ? error.response : null;
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

export class TelegramManager {
  private bot: Telegraf | null = null;
  private activeToken: string | null = null;
  private activeChatId: string | null = null;
  private pollingBlocked = false;

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

    if (tokenChanged) {
      this.pollingBlocked = false;
    }

    if (this.pollingBlocked && !tokenChanged) {
      this.activeToken = token;
      this.activeChatId = chatId || null;
      return;
    }

    if (!this.bot || tokenChanged) {
      await this.stop();
      this.activeToken = token;
      this.activeChatId = chatId || null;
      this.bot = new Telegraf(token);
      this.registerHandlers();
      try {
        await this.bot.launch({ dropPendingUpdates: true });
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "error_code" in error.response &&
          error.response.error_code === 401
        ) {
          this.bot = null;
          this.activeToken = null;
          throw new Error("Неверный токен Telegram-бота");
        }

        if (isTelegramPollingConflict(error)) {
          console.warn(
            "Прием команд Telegram-бота уже запущен в другой копии приложения. Локально оставляю только отправку уведомлений.",
          );
          this.pollingBlocked = true;
          this.bot = null;
          return;
        }

        console.error("Не удалось запустить прием команд Telegram-бота, но отправка уведомлений останется доступной:", error);
        this.bot = null;
      }
      const username = this.bot?.botInfo?.username ?? "";
      if (username && username !== nextSettings.telegram_bot_username) {
        await this.repository.updateSettings({ telegramBotUsername: username });
      }
    }

    this.activeChatId = chatId || null;

    if (this.bot && chatChanged) {
      await this.bot.telegram.setMyCommands([]);
    }
  }

  async stop(): Promise<void> {
    if (this.bot) {
      try {
        await this.bot.stop();
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (!message.includes("Bot is not running")) {
          throw error;
        }
      }
      this.bot = null;
    }
    this.pollingBlocked = false;
    this.activeToken = null;
  }

  async sendMessage(text: string): Promise<boolean> {
    if (!this.activeToken || !this.activeChatId) {
      console.error("Не удалось отправить Telegram-уведомление: не задан токен бота или chat id");
      return false;
    }

    const telegram = this.bot?.telegram ?? new Telegraf(this.activeToken).telegram;

    try {
      await telegram.sendMessage(this.activeChatId, text);
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
