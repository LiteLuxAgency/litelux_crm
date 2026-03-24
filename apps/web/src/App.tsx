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

type ClientPriorityTone = "normal" | "warning" | "danger";
type ClientFilter = "inWork" | "duplicate" | "callback" | "noAnswer" | "onlyClients" | "archive";
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

  return "normal";
}

function getClientSortWeight(client: Client, now = Date.now()): number {
  const tone = getClientPriorityTone(client, now);

  if (tone === "danger") return 0;
  if (tone === "warning") return 1;
  return 2;
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

function formatDurationLabel(diffMs: number): string {
  const totalHours = Math.floor(diffMs / (60 * 60 * 1000));
  const totalDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (totalDays >= 1) {
    return `${totalDays} д.`;
  }

  const hours = Math.max(1, totalHours);
  return `${hours} ч.`;
}

function getClientDueLabel(client: Client, now = Date.now()): string | null {
  const dueInfo = getClientDueInfo(client);
  if (!dueInfo) {
    return null;
  }

  const prefix = dueInfo.kind === "callback" ? "Перезвонить" : "Нет ответа";
  const diffMs = dueInfo.dueAtMs - now;

  if (diffMs <= 0) {
    return `${prefix}: просрочено ${formatDurationLabel(Math.abs(diffMs))}`;
  }

  return `${prefix}: через ${formatDurationLabel(diffMs)}`;
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
  const overdueTasks = sortedClients.filter((client) => getClientPriorityTone(client) === "danger");
  const todayTasks = sortedClients.filter((client) => getClientPriorityTone(client) === "warning");
  const visibleClients = sortedClients.filter((client) => {
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
          ←
        </button>

        <span className="brand-mark">LiteLux CRM</span>
        {showSettings ? (
          <button
            type="button"
            className="icon-button"
            onClick={() => setScreen("settings")}
            aria-label="Настройки"
          >
            ⚙
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

  function renderTaskList(title: string, taskClients: Client[]) {
    if (taskClients.length === 0) {
      return null;
    }

    return (
      <div className="task-block">
        <div className="task-block__title">{title}</div>
        <div className="client-list client-list--table client-list--tasks">
          {taskClients.map((client) => (
            <article
              className={`client-row client-row--${getClientPriorityTone(client)}`}
              key={`${title}-${client.id}`}
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
      </div>
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

            {selectedClient.notes ? (
              <div className="detail-card__notes">{selectedClient.notes}</div>
            ) : null}

            <div className="detail-card__actions">
              <button
                type="button"
                className="detail-action"
                onClick={() => window.open(`tel:${selectedClient.phone}`)}
                aria-label="Позвонить"
              >
                ☎
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
                ↗
              </button>
              <button
                type="button"
                className="detail-action"
                onClick={() => openEditForm(selectedClient)}
                aria-label="Редактировать"
              >
                ✎
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

        <div className="section-block">
          <div className="section-block__title">Задачи</div>
          {renderTaskList("Просрочено", overdueTasks)}
          {renderTaskList("Сегодня", todayTasks)}
        </div>

        <div className="filter-row">
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
      ) : (
        <button
          type="button"
          className="fab fab--secondary"
          onClick={goToList}
          aria-label="Вернуться назад"
        >
          ←
        </button>
      )}
    </main>
  );
}
