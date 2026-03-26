import { FormEvent, TouchEvent, startTransition, useEffect, useRef, useState } from "react";
import { getTelegramWebApp, initTelegramApp, openExternalLink } from "./lib/telegram";

type Screen = "list" | "view" | "create" | "settings";

type Client = {
  id: string;
  client_number: number;
  address: string;
  name: string;
  phone: string;
  commission: number | null;
  link: string;
  is_duplicate: boolean;
  is_exclusive: boolean;
  only_clients: boolean;
  no_answer: boolean;
  callback_at: string | null;
  callback_reminded_at?: string | null;
  no_answer_marked_at?: string | null;
  no_answer_reminded_at?: string | null;
  notes: string;
  created_at: string;
  is_archived?: boolean;
};

type Settings = {
  telegramBotUsername: string;
  telegramChatId: string;
  telegramEnabled: boolean;
  telegramBotTokenPresent: boolean;
};

type ClientFormState = {
  name: string;
  address: string;
  phone: string;
  commission: string;
  link: string;
  isDuplicate: boolean;
  isExclusive: boolean;
  onlyClients: boolean;
  noAnswer: boolean;
  callbackAt: string;
  notes: string;
};

type SettingsFormState = {
  telegramBotToken: string;
  telegramEnabled: boolean;
};

type ClientPriorityTone = "normal" | "success" | "warning" | "danger";
type ClientFilter = "tasks" | "inWork" | "duplicate" | "callback" | "noAnswer" | "onlyClients" | "archive";
type ClientDueKind = "callback" | "noAnswer";

const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

const initialFormState: ClientFormState = {
  name: "",
  address: "",
  phone: "",
  commission: "",
  link: "",
  isDuplicate: false,
  isExclusive: false,
  onlyClients: false,
  noAnswer: false,
  callbackAt: "",
  notes: "",
};

const initialSettingsState: SettingsFormState = {
  telegramBotToken: "",
  telegramEnabled: false,
};

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15 6L9 12L15 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10.3 3.9H13.7L14.2 6.1C14.6 6.2 15 6.4 15.4 6.6L17.3 5.4L19.7 7.8L18.5 9.7C18.7 10.1 18.8 10.5 18.9 10.9L21.1 11.4V14.8L18.9 15.3C18.8 15.7 18.6 16.1 18.4 16.5L19.7 18.4L17.3 20.8L15.4 19.6C15 19.8 14.6 20 14.2 20.1L13.7 22.1H10.3L9.8 20.1C9.4 20 9 19.8 8.6 19.6L6.7 20.8L4.3 18.4L5.5 16.5C5.3 16.1 5.2 15.7 5.1 15.3L2.9 14.8V11.4L5.1 10.9C5.2 10.5 5.4 10.1 5.6 9.7L4.3 7.8L6.7 5.4L8.6 6.6C9 6.4 9.4 6.2 9.8 6.1L10.3 3.9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.9 4.8H9.4L10.6 8.7L9 10.2C10 12.2 11.6 13.8 13.8 15L15.3 13.4L19.2 14.6V17.1C19.2 18 18.5 18.8 17.6 18.8C10.7 18.4 5.6 13.3 5.2 6.4C5.2 5.5 6 4.8 6.9 4.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14 5H19V10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 13L19 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 14V18C19 18.6 18.6 19 18 19H6C5.4 19 5 18.6 5 18V6C5 5.4 5.4 5 6 5H10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 20L7.8 19.2L18 9L15 6L4.8 16.2L4 20Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.8 7.2L16.8 10.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4.5 10.5L12 4.5L19.5 10.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 9.8V19H17.5V9.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 19V13.5H14V19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Не назначено";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function clientToFormState(client: Client): ClientFormState {
  return {
    name: client.name,
    address: client.address ?? "",
    phone: client.phone,
    commission: client.commission !== null ? String(client.commission) : "",
    link: client.link ?? "",
    isDuplicate: client.is_duplicate,
    isExclusive: client.is_exclusive,
    onlyClients: client.only_clients,
    noAnswer: client.no_answer,
    callbackAt: toDateTimeLocalValue(client.callback_at),
    notes: client.notes ?? "",
  };
}

function getNoAnswerDueAt(client: Client): number | null {
  if (!client.no_answer || !client.no_answer_marked_at) {
    return null;
  }

  const markedAtMs = new Date(client.no_answer_marked_at).getTime();
  if (Number.isNaN(markedAtMs)) {
    return null;
  }

  return markedAtMs + 24 * 60 * 60 * 1000;
}

function getClientDueInfo(client: Client): { kind: ClientDueKind; dueAtMs: number } | null {
  const dueEntries: Array<{ kind: ClientDueKind; dueAtMs: number }> = [];

  if (client.callback_at) {
    const callbackAtMs = new Date(client.callback_at).getTime();
    if (!Number.isNaN(callbackAtMs)) {
      dueEntries.push({ kind: "callback", dueAtMs: callbackAtMs });
    }
  }

  const noAnswerDueAt = getNoAnswerDueAt(client);
  if (noAnswerDueAt !== null) {
    dueEntries.push({ kind: "noAnswer", dueAtMs: noAnswerDueAt });
  }

  if (dueEntries.length === 0) {
    return null;
  }

  return dueEntries.sort((left, right) => left.dueAtMs - right.dueAtMs)[0];
}

function getClientPriorityTone(client: Client, now = Date.now()): ClientPriorityTone {
  const dueInfo = getClientDueInfo(client);
  if (!dueInfo) {
    return "normal";
  }

  if (dueInfo.dueAtMs <= now) {
    return "danger";
  }

  if (dueInfo.dueAtMs - now <= 24 * 60 * 60 * 1000) {
    return "warning";
  }

  return "success";
}

function getClientSortWeight(client: Client, now = Date.now()): number {
  const tone = getClientPriorityTone(client, now);

  if (tone === "danger") return 0;
  if (tone === "warning") return 1;
  if (tone === "success") return 2;
  return 3;
}

function sortClientsByPriority(clients: Client[]): Client[] {
  const now = Date.now();

  return [...clients].sort((left, right) => {
    const toneDiff = getClientSortWeight(left, now) - getClientSortWeight(right, now);
    if (toneDiff !== 0) {
      return toneDiff;
    }

    const leftCallback = getClientDueInfo(left)?.dueAtMs ?? Number.POSITIVE_INFINITY;
    const rightCallback = getClientDueInfo(right)?.dueAtMs ?? Number.POSITIVE_INFINITY;

    if (leftCallback !== rightCallback) {
      return leftCallback - rightCallback;
    }

    return right.client_number - left.client_number;
  });
}

function pluralize(value: number, one: string, few: string, many: string): string {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }

  return many;
}

function formatDurationLabel(diffMs: number): string {
  const totalMinutes = Math.floor(diffMs / (60 * 1000));
  const totalHours = Math.floor(diffMs / (60 * 60 * 1000));
  const totalDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const totalWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  const totalMonths = Math.floor(diffMs / (30 * 24 * 60 * 60 * 1000));

  if (totalMonths >= 1) {
    return `${totalMonths} ${pluralize(totalMonths, "месяц", "месяца", "месяцев")}`;
  }

  if (totalWeeks >= 1) {
    return `${totalWeeks} ${pluralize(totalWeeks, "неделя", "недели", "недель")}`;
  }

  if (totalDays >= 1) {
    return `${totalDays} ${pluralize(totalDays, "день", "дня", "дней")}`;
  }

  if (totalHours >= 1) {
    const hours = Math.max(1, totalHours);
    return `${hours} ${pluralize(hours, "час", "часа", "часов")}`;
  }

  const minutes = Math.max(1, totalMinutes);
  return `${minutes} ${pluralize(minutes, "минута", "минуты", "минут")}`;
}

function getClientDueLabel(client: Client, now = Date.now()): string | null {
  const dueInfo = getClientDueInfo(client);
  if (!dueInfo) {
    return null;
  }

  const diffMs = dueInfo.dueAtMs - now;

  if (diffMs <= 0) {
    return `${formatDurationLabel(Math.abs(diffMs))} назад`;
  }

  return `осталось ${formatDurationLabel(diffMs)}`;
}

function formatBooleanLabel(value: boolean): string {
  return value ? "Да" : "Нет";
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("list");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({
    telegramBotUsername: "",
    telegramChatId: "",
    telegramEnabled: false,
    telegramBotTokenPresent: false,
  });
  const [settingsForm, setSettingsForm] = useState<SettingsFormState>(initialSettingsState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<ClientFormState>(initialFormState);
  const [activeFilter, setActiveFilter] = useState<ClientFilter>("inWork");
  const sortedClients = sortClientsByPriority(clients);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? null;
  const visibleClients = sortedClients.filter((client) => {
    if (activeFilter !== "archive" && client.is_archived) return false;
    if (activeFilter === "archive") return Boolean(client.is_archived);
    if (activeFilter === "tasks") {
      const tone = getClientPriorityTone(client);
      return tone === "danger" || tone === "warning";
    }
    if (activeFilter === "inWork") return !client.no_answer;
    if (activeFilter === "duplicate") return client.is_duplicate;
    if (activeFilter === "callback") return Boolean(client.callback_at);
    if (activeFilter === "noAnswer") return client.no_answer;
    if (activeFilter === "onlyClients") return client.only_clients;
    return !client.callback_at && !client.no_answer;
  });

  useEffect(() => {
    initTelegramApp();
  }, []);

  useEffect(() => {
    void loadClients();
    void loadSettings();
  }, []);

  async function loadClients() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/clients`);
      if (!response.ok) {
        throw new Error("Не удалось загрузить клиентов");
      }

      const payload = (await response.json()) as Client[];
      setClients(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  async function loadSettings() {
    try {
      const response = await fetch(`${API_URL}/api/settings`);
      if (!response.ok) {
        throw new Error("Не удалось получить настройки");
      }

      const payload = (await response.json()) as Settings;
      setSettings(payload);
      setSettingsForm({
        telegramBotToken: "",
        telegramEnabled: payload.telegramEnabled,
      });
    } catch {
      setSettings((current) => ({ ...current, telegramEnabled: false }));
    }
  }

  async function handleSaveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSettings(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(settingsForm.telegramBotToken.trim()
            ? { telegramBotToken: settingsForm.telegramBotToken.trim() }
            : {}),
          telegramEnabled: settingsForm.telegramEnabled,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Не удалось сохранить настройки");
      }

      await loadSettings();
    } catch (settingsError) {
      setError(
        settingsError instanceof Error ? settingsError.message : "Ошибка сохранения настроек",
      );
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        name: formState.name,
        address: formState.address,
        phone: formState.phone,
        isDuplicate: formState.isDuplicate,
        isExclusive: formState.isExclusive,
        onlyClients: formState.onlyClients,
        noAnswer: formState.noAnswer,
        callbackAt: formState.callbackAt
          ? new Date(formState.callbackAt).toISOString()
          : null,
        notes: formState.notes,
      };

      if (formState.commission.trim()) {
        payload.commission = Number(formState.commission);
      }

      if (formState.link.trim()) {
        payload.link = formState.link.trim();
      }

      const isEditing = Boolean(editingClientId);
      const response = await fetch(
        isEditing ? `${API_URL}/api/clients/${editingClientId}` : `${API_URL}/api/clients`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(
          payload?.error ||
            (isEditing ? "Не удалось обновить клиента" : "Не удалось сохранить клиента"),
        );
      }

      setFormState(initialFormState);
      setEditingClientId(null);
      startTransition(() => {
        setScreen("list");
      });
      await loadClients();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  function openCreateForm() {
    setEditingClientId(null);
    setSelectedClientId(null);
    setFormState(initialFormState);
    setScreen("create");
  }

  function openView(client: Client) {
    setSelectedClientId(client.id);
    setScreen("view");
  }

  function openEditForm(client: Client) {
    setSelectedClientId(client.id);
    setEditingClientId(client.id);
    setFormState(clientToFormState(client));
    setScreen("create");
  }

  async function handleMarkArchived(client: Client) {
    if (client.is_archived) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/clients/${client.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isArchived: true }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Не удалось переместить клиента в архив");
      }

      await loadClients();
      goToList();
      setActiveFilter("archive");
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Ошибка архивации");
    } finally {
      setSaving(false);
    }
  }

  function goToList() {
    setScreen("list");
    setSelectedClientId(null);
    setEditingClientId(null);
    setFormState(initialFormState);
  }

  function handleTopBack() {
    if (screen !== "list") {
      goToList();
      return;
    }

    const telegram = getTelegramWebApp();
    const closeTelegram = (telegram as { close?: () => void } | null)?.close;
    if (closeTelegram) {
      closeTelegram();
      return;
    }

    window.history.back();
  }

  function renderMainHero(showSettings = false) {
    return (
      <div className="topbar topbar--compact">
        <button
          type="button"
          className="icon-button icon-button--compact"
          onClick={handleTopBack}
          aria-label="Назад"
        >
          <ArrowLeftIcon />
        </button>

        <span className="brand-mark">LiteLux CRM</span>
        {showSettings ? (
          <button
            type="button"
            className="icon-button"
            onClick={() => setScreen("settings")}
            aria-label="Настройки"
          >
            <SettingsIcon />
          </button>
        ) : (
          <span className="topbar__spacer" />
        )}
      </div>
    );
  }

  function renderFilterButton(filter: ClientFilter, label: string) {
    const active = activeFilter === filter;

    return (
      <button
        type="button"
        className={`filter-chip ${active ? "is-active" : ""}`}
        onClick={() => setActiveFilter(filter)}
      >
        {label}
      </button>
    );
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (!swipeStartRef.current) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - swipeStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - swipeStartRef.current.y);
    const startedFromEdge = swipeStartRef.current.x <= 32;
    swipeStartRef.current = null;

    if (startedFromEdge && deltaX >= 72 && deltaY <= 48) {
      handleTopBack();
    }
  }

  function renderContent() {
    if (screen === "view" && selectedClient) {
      return (
        <section className="sheet sheet--view">
          <div className="detail-view-shell">
            <div className={`detail-card detail-card--${getClientPriorityTone(selectedClient)}`}>
              <div className="detail-card__top">
                <div className="detail-card__number">{selectedClient.client_number}</div>
                <div className="detail-card__info">
                  <h2>{selectedClient.name}</h2>
                  <a href={`tel:${selectedClient.phone}`}>{selectedClient.phone}</a>
                  <div className="detail-card__address">{selectedClient.address || "Без адреса"}</div>
                </div>
              </div>

              <div className="detail-card__meta">{getClientDueLabel(selectedClient) || "Без задачи"}</div>

              <div className="detail-card__grid">
                <div className="detail-item">
                  <span>Комиссия</span>
                  <strong>{selectedClient.commission ?? 0}%</strong>
                </div>
                <div className="detail-item">
                  <span>Перезвонить</span>
                  <strong>{selectedClient.callback_at ? formatDate(selectedClient.callback_at) : "Не назначено"}</strong>
                </div>
                <div className="detail-item">
                  <span>Нет ответа</span>
                  <strong>{formatBooleanLabel(selectedClient.no_answer)}</strong>
                </div>
                <div className="detail-item">
                  <span>Только клиенты</span>
                  <strong>{formatBooleanLabel(selectedClient.only_clients)}</strong>
                </div>
                <div className="detail-item">
                  <span>Дубль</span>
                  <strong>{formatBooleanLabel(selectedClient.is_duplicate)}</strong>
                </div>
                <div className="detail-item">
                  <span>Эксклюзив</span>
                  <strong>{formatBooleanLabel(selectedClient.is_exclusive)}</strong>
                </div>
                <div className="detail-item">
                  <span>Ссылка</span>
                  <strong>{selectedClient.link ? "Есть" : "Нет"}</strong>
                </div>
              </div>

              {selectedClient.notes ? (
                <div className="detail-card__notes">
                  <span>Комментарий</span>
                  <strong>{selectedClient.notes}</strong>
                </div>
              ) : null}
            </div>

            <div className="detail-action-bar">
              <button
                type="button"
                className="detail-action"
                onClick={() => window.open(`tel:${selectedClient.phone}`)}
                aria-label="Позвонить"
              >
                <PhoneIcon />
              </button>
              <button
                type="button"
                className="detail-action"
                onClick={() => {
                  if (selectedClient.link) {
                    openExternalLink(selectedClient.link);
                  }
                }}
                disabled={!selectedClient.link}
                aria-label="Открыть ссылку"
              >
                <ExternalLinkIcon />
              </button>
              <button
                type="button"
                className="detail-action"
                onClick={() => openEditForm(selectedClient)}
                aria-label="Редактировать"
              >
                <EditIcon />
              </button>
              <button
                type="button"
                className="detail-action"
                onClick={() => void handleMarkArchived(selectedClient)}
                disabled={Boolean(selectedClient.is_archived) || saving}
                aria-label="Сдано"
              >
                <HomeIcon />
              </button>
            </div>
          </div>
        </section>
      );
    }

    if (screen === "settings") {
      const connectLink = settings.telegramBotUsername
        ? `https://t.me/${settings.telegramBotUsername}`
        : null;

      return (
        <section className="sheet">
          <div className="sheet__header">
            <div>
              <p className="eyebrow">Настройки</p>
              <h2>Подключение Telegram</h2>
            </div>
          </div>

          <form className="settings-grid" onSubmit={handleSaveSettings}>
            <label className="field">
              <span className="field__label">Токен Telegram-бота</span>
              <input
                value={settingsForm.telegramBotToken}
                onChange={(event) =>
                  setSettingsForm((current) => ({
                    ...current,
                    telegramBotToken: event.target.value,
                  }))
                }
                placeholder={
                  settings.telegramBotTokenPresent
                    ? "Токен уже сохранён, сюда можно вставить новый"
                    : "123456:ABC..."
                }
              />
            </label>

            <label className="toggle">
              <input
                type="checkbox"
                checked={settingsForm.telegramEnabled}
                onChange={(event) =>
                  setSettingsForm((current) => ({
                    ...current,
                    telegramEnabled: event.target.checked,
                  }))
                }
              />
              <span>Включить Telegram-бота</span>
            </label>

            <div className="status-card">
              <span
                className={`status-dot ${
                  settings.telegramEnabled && settings.telegramChatId ? "is-live" : ""
                }`}
              />
              <div>
                <strong>
                  {settings.telegramEnabled && settings.telegramChatId
                    ? "Бот подключён"
                    : "Бот не подключён"}
                </strong>
                <p>
                  {settings.telegramChatId
                    ? `chat_id: ${settings.telegramChatId}`
                    : "После сохранения настроек откройте бота и нажмите Start"}
                </p>
              </div>
            </div>

            {connectLink ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => openExternalLink(connectLink)}
              >
                Открыть бота
              </button>
            ) : (
              <div className="hint-card">
                Сначала сохраните валидный токен бота. После этого здесь появится ссылка.
              </div>
            )}

            <button type="submit" className="primary-button" disabled={savingSettings}>
              {savingSettings ? "Сохраняю..." : "Сохранить настройки"}
            </button>
          </form>
        </section>
      );
    }

    if (screen === "create") {
      const isEditing = Boolean(editingClientId);

      return (
        <section className="sheet">
          <div className="sheet__header">
            <div>
              <p className="eyebrow">{isEditing ? "Редактирование" : "Новый клиент"}</p>
              <h2>
                {isEditing
                  ? `Изменение клиента #${
                      clients.find((client) => client.id === editingClientId)?.client_number ?? ""
                    }`
                  : "Добавление собственника"}
              </h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field__label">Имя</span>
              <input
                required
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Иван Петров"
              />
            </label>

            <label className="field">
              <span className="field__label">Адрес</span>
              <input
                value={formState.address}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, address: event.target.value }))
                }
                placeholder="Улица, дом, район"
              />
            </label>

            <label className="field">
              <span className="field__label">Номер телефона</span>
              <input
                required
                value={formState.phone}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, phone: event.target.value }))
                }
                placeholder="+7 999 123-45-67"
              />
            </label>

            <label className="field">
              <span className="field__label">Комиссия</span>
              <input
                value={formState.commission}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    commission: event.target.value,
                  }))
                }
                inputMode="decimal"
                placeholder="Например, 3"
              />
            </label>

            <label className="field">
              <span className="field__label">Ссылка</span>
              <input
                value={formState.link}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, link: event.target.value }))
                }
                placeholder="https://..."
              />
            </label>

            <label className="field">
              <span className="field__label">Перезвонить</span>
              <input
                type="datetime-local"
                value={formState.callbackAt}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    callbackAt: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span className="field__label">Комментарий</span>
              <input
                value={formState.notes}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Короткая заметка"
              />
            </label>

            <div className="switch-grid">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={formState.isDuplicate}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      isDuplicate: event.target.checked,
                    }))
                  }
                />
                <span>Дубль</span>
              </label>

              <label className="toggle">
                <input
                  type="checkbox"
                  checked={formState.isExclusive}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      isExclusive: event.target.checked,
                    }))
                  }
                />
                <span>Эксклюзив</span>
              </label>

              <label className="toggle">
                <input
                  type="checkbox"
                  checked={formState.onlyClients}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      onlyClients: event.target.checked,
                    }))
                  }
                />
                <span>Только клиенты</span>
              </label>

              <label className="toggle">
                <input
                  type="checkbox"
                  checked={formState.noAnswer}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      noAnswer: event.target.checked,
                    }))
                  }
                />
                <span>Нет ответа</span>
              </label>
            </div>

            <button type="submit" className="primary-button" disabled={saving}>
              {saving
                ? "Сохраняю..."
                : isEditing
                  ? "Сохранить изменения"
                  : "Сохранить клиента"}
            </button>
          </form>
        </section>
      );
    }

    return (
      <section className="sheet sheet--list">
        {renderMainHero(true)}

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="filter-row">
          {renderFilterButton("tasks", "Задачи")}
          {renderFilterButton("inWork", "В работе")}
          {renderFilterButton("duplicate", "Дубль")}
          {renderFilterButton("callback", "Перезвонить")}
          {renderFilterButton("noAnswer", "Нет ответа")}
          {renderFilterButton("onlyClients", "Только клиенты")}
          {renderFilterButton("archive", "Архив")}
        </div>

        {loading ? <div className="hint-card">Загрузка клиентов...</div> : null}

        {!loading && visibleClients.length === 0 ? (
          <div className="empty-card">
            <strong>{clients.length === 0 ? "Пока пусто" : "Ничего не найдено"}</strong>
            <p>
              {clients.length === 0
                ? "Нажмите кнопку `+` справа снизу и добавьте первого клиента."
                : "Снимите фильтр или переключитесь на другой."}
            </p>
          </div>
        ) : null}

        <div className="client-list client-list--table">
          {visibleClients.map((client) => (
            <article
              className={`client-row client-row--${getClientPriorityTone(client)}`}
              key={client.id}
              onClick={() => openView(client)}
            >
              <div className="client-row__id">{client.client_number}</div>
              <div className="client-row__body">
                <div className="client-row__main">
                  <strong>{client.name}</strong>
                  <a href={`tel:${client.phone}`} onClick={(event) => event.stopPropagation()}>
                    {client.phone}
                  </a>
                </div>

                <div className="client-row__address-line">{client.address || "Без адреса"}</div>
                <div className="client-row__meta">{getClientDueLabel(client)}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <main className="app-shell" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="app-shell__backdrop" />
      <div className="app-shell__content">
        {screen !== "list" ? (
          <>
            {renderMainHero(false)}

            {error ? <div className="error-banner">{error}</div> : null}
          </>
        ) : null}

        {renderContent()}
      </div>

      {screen === "list" ? (
        <button
          type="button"
          className="fab"
          onClick={openCreateForm}
          aria-label="Добавить клиента"
        >
          +
        </button>
      ) : null}
    </main>
  );
}
