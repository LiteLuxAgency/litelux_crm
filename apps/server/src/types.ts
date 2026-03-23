export type ClientRow = {
  id: string;
  client_number: number;
  name: string;
  phone: string;
  commission: number | null;
  is_duplicate: boolean;
  is_exclusive: boolean;
  link: string;
  only_clients: boolean;
  callback_at: string | null;
  callback_reminded_at: string | null;
  no_answer: boolean;
  no_answer_marked_at: string | null;
  no_answer_reminded_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type SettingsRow = {
  id: number;
  telegram_bot_token: string;
  telegram_bot_username: string;
  telegram_chat_id: string;
  telegram_enabled: boolean;
  reminders_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type ClientInput = {
  name: string;
  phone: string;
  commission?: number | null;
  isDuplicate?: boolean;
  isExclusive?: boolean;
  link?: string;
  onlyClients?: boolean;
  callbackAt?: string | null;
  noAnswer?: boolean;
  notes?: string;
};

export type ClientUpdateInput = Partial<ClientInput>;

export type SettingsInput = {
  telegramBotToken?: string;
  telegramBotUsername?: string;
  telegramChatId?: string;
  telegramEnabled?: boolean;
};

export type ReminderKind = "callback_at" | "no_answer_24h";
