export type ParkingSpotRow = {
  id: string;
  address: string;
  price: number | null;
  commission: number | null;
  utilitiesIncluded: boolean;
  deposit: number | null;
  area: number | null;
  floor: string;
};

export type ParkingSpotInput = {
  id?: string;
  address?: string;
  price?: number | null;
  commission?: number | null;
  utilitiesIncluded?: boolean;
  deposit?: number | null;
  area?: number | null;
  floor?: string;
};

export type PropertyObjectRow = {
  id: string;
  title: string;
  notes: string;
};

export type PropertyObjectInput = {
  id?: string;
  title?: string;
  notes?: string;
};

export type ClientRow = {
  id: string;
  client_number: number;
  address: string;
  complex_name: string;
  name: string;
  phone: string;
  is_proxy_phone: boolean;
  commission: number | null;
  is_duplicate: boolean;
  is_exclusive: boolean;
  is_archived: boolean;
  link: string;
  only_clients: boolean;
  callback_at: string | null;
  callback_reminded_at: string | null;
  no_answer: boolean;
  no_answer_marked_at: string | null;
  no_answer_reminded_at: string | null;
  notes: string;
  parking_spots: ParkingSpotRow[];
  objects: PropertyObjectRow[];
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
  list_action_search_enabled: boolean;
  list_action_reaction_enabled: boolean;
  list_action_create_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type ClientInput = {
  name: string;
  address?: string;
  complexName?: string;
  phone: string;
  isProxyPhone?: boolean;
  commission?: number | null;
  isDuplicate?: boolean;
  isExclusive?: boolean;
  isArchived?: boolean;
  link?: string;
  onlyClients?: boolean;
  callbackAt?: string | null;
  noAnswer?: boolean;
  notes?: string;
  parkingSpots?: ParkingSpotInput[];
  objects?: PropertyObjectInput[];
};

export type ClientUpdateInput = Partial<ClientInput>;

export type SettingsInput = {
  telegramBotToken?: string;
  telegramBotUsername?: string;
  telegramChatId?: string;
  telegramEnabled?: boolean;
  listActionSearchEnabled?: boolean;
  listActionReactionEnabled?: boolean;
  listActionCreateEnabled?: boolean;
};

export type ReminderKind = "callback_at" | "no_answer_24h";
