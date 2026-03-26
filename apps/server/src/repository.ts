import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "./config.js";
import type {
  ClientInput,
  ClientRow,
  ClientUpdateInput,
  SettingsInput,
  SettingsRow,
  ReminderKind,
} from "./types.js";

const NO_ANSWER_REMINDER_DELAY_MS = 24 * 60 * 60 * 1000;

function normalizeText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  return fallback;
}

function normalizeBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

function normalizeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toIsoStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new Error("Некорректная дата перезвона");
  }
  return date.toISOString();
}

export class Repository {
  private readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async ensureSettingsRow(): Promise<SettingsRow> {
    const { data, error } = await this.client
      .from("crm_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as SettingsRow;

    const { data: inserted, error: insertError } = await this.client
      .from("crm_settings")
      .insert({ id: 1 })
      .select("*")
      .single();

    if (insertError) throw insertError;
    return inserted as SettingsRow;
  }

  async getSettings(): Promise<SettingsRow> {
    return this.ensureSettingsRow();
  }

  async updateSettings(input: SettingsInput): Promise<SettingsRow> {
    const payload: Record<string, unknown> = { id: 1 };
    if (input.telegramBotToken !== undefined) payload.telegram_bot_token = normalizeText(input.telegramBotToken);
    if (input.telegramBotUsername !== undefined) payload.telegram_bot_username = normalizeText(input.telegramBotUsername);
    if (input.telegramChatId !== undefined) payload.telegram_chat_id = normalizeText(input.telegramChatId);
    if (input.telegramEnabled !== undefined) payload.telegram_enabled = normalizeBoolean(input.telegramEnabled);

    const { data, error } = await this.client.from("crm_settings").upsert(payload).select("*").single();
    if (error) throw error;
    return data as SettingsRow;
  }

  async listClients(): Promise<ClientRow[]> {
    const { data, error } = await this.client
      .from("crm_clients")
      .select("*")
      .order("client_number", { ascending: false });

    if (error) throw error;
    return (data ?? []) as ClientRow[];
  }

  async getClient(id: string): Promise<ClientRow | null> {
    const { data, error } = await this.client.from("crm_clients").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as ClientRow | null) ?? null;
  }

  async createClient(input: ClientInput): Promise<ClientRow> {
    const payload = this.mapClientInput(input, true);
    const { data, error } = await this.client.from("crm_clients").insert(payload).select("*").single();
    if (error) throw error;
    return data as ClientRow;
  }

  async updateClient(id: string, input: ClientUpdateInput): Promise<ClientRow> {
    const current = await this.getClient(id);
    if (!current) {
      throw new Error("Клиент не найден");
    }

    const payload = this.mapClientInput(input, false, current);
    const { data, error } = await this.client.from("crm_clients").update(payload).eq("id", id).select("*").single();
    if (error) throw error;
    return data as ClientRow;
  }

  async deleteClient(id: string): Promise<void> {
    const { error } = await this.client.from("crm_clients").delete().eq("id", id);
    if (error) throw error;
  }

  async getDueReminders(nowIso: string): Promise<Array<{ client: ClientRow; kind: ReminderKind }>> {
    const { data, error } = await this.client
      .from("crm_clients")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const now = new Date(nowIso).getTime();

    return (data ?? []).flatMap((row) => {
      const client = row as ClientRow;
      const reminders: Array<{ client: ClientRow; kind: ReminderKind }> = [];
      if (client.is_archived) {
        return reminders;
      }
      const callbackAtMs = client.callback_at ? new Date(client.callback_at).getTime() : Number.NaN;
      const noAnswerMarkedAtMs = client.no_answer_marked_at ? new Date(client.no_answer_marked_at).getTime() : Number.NaN;

      if (Number.isFinite(callbackAtMs) && !client.callback_reminded_at && callbackAtMs <= now) {
        reminders.push({ client, kind: "callback_at" });
      }
      if (
        client.no_answer &&
        Number.isFinite(noAnswerMarkedAtMs) &&
        !client.no_answer_reminded_at &&
        noAnswerMarkedAtMs + NO_ANSWER_REMINDER_DELAY_MS <= now
      ) {
        reminders.push({ client, kind: "no_answer_24h" });
      }
      return reminders;
    });
  }

  async markReminderSent(clientId: string, kind: ReminderKind, sentAtIso: string): Promise<void> {
    const payload =
      kind === "callback_at"
        ? { callback_reminded_at: sentAtIso }
        : { no_answer_reminded_at: sentAtIso };
    const { error } = await this.client.from("crm_clients").update(payload).eq("id", clientId);
    if (error) throw error;

    const { error: logError } = await this.client.from("crm_notification_log").upsert(
      {
        client_id: clientId,
        kind,
        payload: { sent_at: sentAtIso },
        sent_at: sentAtIso,
      },
      { onConflict: "client_id,kind" },
    );
    if (logError) throw logError;
  }

  private mapClientInput(
    input: ClientInput | ClientUpdateInput,
    requireAll: boolean,
    current?: ClientRow,
  ): Record<string, unknown> {
    const nextName = input.name !== undefined ? normalizeText(input.name) : current?.name;
    const nextAddress = input.address !== undefined ? normalizeText(input.address) : current?.address;
    const nextPhone = input.phone !== undefined ? normalizeText(input.phone) : current?.phone;

    if (requireAll) {
      if (!nextName) throw new Error("Поле name обязательно");
      if (!nextPhone) throw new Error("Поле phone обязательно");
    }

    const callbackAtRaw = input.callbackAt !== undefined ? input.callbackAt : current?.callback_at ?? null;
    const nowIso = new Date().toISOString();

    const payload: Record<string, unknown> = {};

    if (nextName !== undefined) payload.name = nextName;
    if (nextAddress !== undefined) payload.address = nextAddress;
    else if (requireAll) payload.address = "";
    if (nextPhone !== undefined) payload.phone = nextPhone;
    if (input.commission !== undefined) payload.commission = normalizeNumber(input.commission);
    else if (requireAll) payload.commission = normalizeNumber(undefined, 0);

    if (input.isDuplicate !== undefined) payload.is_duplicate = normalizeBoolean(input.isDuplicate);
    else if (requireAll) payload.is_duplicate = false;

    if (input.isExclusive !== undefined) payload.is_exclusive = normalizeBoolean(input.isExclusive);
    else if (requireAll) payload.is_exclusive = false;

    if (input.isArchived !== undefined) payload.is_archived = normalizeBoolean(input.isArchived);
    else if (requireAll) payload.is_archived = false;

    if (input.link !== undefined) payload.link = normalizeText(input.link);
    else if (requireAll) payload.link = "";

    if (input.onlyClients !== undefined) payload.only_clients = normalizeBoolean(input.onlyClients);
    else if (requireAll) payload.only_clients = false;

    if (input.notes !== undefined) payload.notes = normalizeText(input.notes);
    else if (requireAll) payload.notes = "";

    if (input.callbackAt !== undefined) {
      payload.callback_at = toIsoStringOrNull(callbackAtRaw);
      payload.callback_reminded_at = null;
    } else if (requireAll) {
      payload.callback_at = toIsoStringOrNull(callbackAtRaw);
      payload.callback_reminded_at = null;
    }

    if (input.noAnswer !== undefined) {
      if (normalizeBoolean(input.noAnswer)) {
        payload.no_answer = true;
        payload.no_answer_marked_at = nowIso;
        payload.no_answer_reminded_at = null;
      } else {
        payload.no_answer = false;
        payload.no_answer_marked_at = null;
        payload.no_answer_reminded_at = null;
      }
    } else if (requireAll) {
      payload.no_answer = current?.no_answer ?? false;
      if (payload.no_answer) {
        payload.no_answer_marked_at = current?.no_answer_marked_at ?? nowIso;
        payload.no_answer_reminded_at = current?.no_answer_marked_at ? current.no_answer_reminded_at : null;
      } else {
        payload.no_answer_marked_at = null;
        payload.no_answer_reminded_at = null;
      }
    }

    return payload;
  }
}
