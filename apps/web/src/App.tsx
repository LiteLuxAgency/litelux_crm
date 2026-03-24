import { FormEvent, startTransition, useEffect, useState } from "react";
import { getTelegramWebApp, openExternalLink } from "./lib/telegram";

type Screen = "list" | "create" | "settings";

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

export default function App() {
  const [screen, setScreen] = useState<Screen>("list");
  const [clients, setClients] = useState<Client[]>([]);
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

  useEffect(() => {
    const telegram = getTelegramWebApp();
    telegram?.ready();
    telegram?.expand();
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
    setFormState(initialFormState);
    setScreen("create");
  }

  function openEditForm(client: Client) {
    setEditingClientId(client.id);
    setFormState(clientToFormState(client));
    setScreen("create");
  }

  function goToList() {
    setScreen("list");
    setEditingClientId(null);
    setFormState(initialFormState);
  }

  function renderMainHero() {
    return (
      <div className="sheet__hero">
        <div className="sheet__hero-copy">
          <span className="brand-mark">LiteLux CRM</span>
          <h1>Мини-приложение для Telegram</h1>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={() => setScreen("settings")}
          aria-label="Настройки"
        >
          ⚙
        </button>
      </div>
    );
  }

  function renderContent() {
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
        {renderMainHero()}

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="sheet__header">
          <div>
            <p className="eyebrow">Главная</p>
            <h2>Список клиентов</h2>
          </div>
          <div className="pill">{clients.length}</div>
        </div>

        <div className="hint-card hint-card--compact">
          Список клиентов. Нажмите на строку, чтобы открыть редактирование.
        </div>

        {loading ? <div className="hint-card">Загрузка клиентов...</div> : null}

        {!loading && clients.length === 0 ? (
          <div className="empty-card">
            <strong>Пока пусто</strong>
            <p>Нажмите кнопку `+` справа снизу и добавьте первого клиента.</p>
          </div>
        ) : null}

        <div className="list-head">
          <span>ID</span>
          <span>Адрес</span>
          <span>Имя</span>
        </div>

        <div className="client-list client-list--table">
          {clients.map((client) => (
            <article
              className="client-row"
              key={client.id}
              onClick={() => openEditForm(client)}
            >
              <div className="client-row__id">#{client.client_number}</div>
              <div className="client-row__address">
                <strong>{client.address || "Без адреса"}</strong>
                <span>{client.callback_at ? formatDate(client.callback_at) : "Без перезвона"}</span>
              </div>
              <div className="client-row__person">
                <strong>{client.name}</strong>
                <div className="client-row__subline">
                  <a href={`tel:${client.phone}`} onClick={(event) => event.stopPropagation()}>
                    {client.phone}
                  </a>
                  {client.link ? (
                    <button
                      type="button"
                      className="link-button link-button--small"
                      onClick={(event) => {
                        event.stopPropagation();
                        openExternalLink(client.link);
                      }}
                    >
                      Ссылка
                    </button>
                  ) : null}
                </div>
                <div className="client-row__tags">
                  {client.is_duplicate ? <span className="badge">Дубль</span> : null}
                  {client.is_exclusive ? <span className="badge">Эксклюзив</span> : null}
                  {client.only_clients ? <span className="badge">Клиенты</span> : null}
                  {client.no_answer ? <span className="badge">Нет ответа</span> : null}
                  {client.commission !== null ? (
                    <span className="badge badge--accent">{client.commission}%</span>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <main className="app-shell">
      <div className="app-shell__backdrop" />
      <div className="app-shell__content">
        {screen !== "list" ? (
          <>
            <header className="topbar">
              <div>
                <span className="brand-mark">LiteLux CRM</span>
                <h1>Мини-приложение для Telegram</h1>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setScreen("settings")}
                aria-label="Настройки"
              >
                ⚙
              </button>
            </header>

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
