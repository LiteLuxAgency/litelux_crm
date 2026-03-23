import { FormEvent, startTransition, useEffect, useState } from "react";
import { getTelegramWebApp, openExternalLink } from "./lib/telegram";

type Screen = "list" | "create" | "settings";

type Client = {
  id: string;
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

export default function App() {
  const [screen, setScreen] = useState<Screen>("list");
  const [clients, setClients] = useState<Client[]>([]);
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
        phone: formState.phone,
        isDuplicate: formState.isDuplicate,
        isExclusive: formState.isExclusive,
        onlyClients: formState.onlyClients,
        noAnswer: formState.noAnswer,
        callbackAt: formState.callbackAt || null,
        notes: formState.notes,
      };

      if (formState.commission.trim()) {
        payload.commission = Number(formState.commission);
      }

      if (formState.link.trim()) {
        payload.link = formState.link.trim();
      }

      const response = await fetch(`${API_URL}/api/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Не удалось сохранить клиента");
      }

      setFormState(initialFormState);
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
      return (
        <section className="sheet">
          <div className="sheet__header">
            <div>
              <p className="eyebrow">Новый клиент</p>
              <h2>Добавление собственника</h2>
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
              {saving ? "Сохраняю..." : "Сохранить клиента"}
            </button>
          </form>
        </section>
      );
    }

    return (
      <section className="sheet sheet--list">
        <div className="sheet__header">
          <div>
            <p className="eyebrow">Главная</p>
            <h2>Список клиентов</h2>
          </div>
          <div className="pill">{clients.length}</div>
        </div>

        <div className="hint-card">
          Напоминания придут в Telegram после того, как вы включите бота в настройках и нажмёте
          `Start` у бота.
        </div>

        {loading ? <div className="hint-card">Загрузка клиентов...</div> : null}

        {!loading && clients.length === 0 ? (
          <div className="empty-card">
            <strong>Пока пусто</strong>
            <p>Нажмите кнопку `+` справа снизу и добавьте первого клиента.</p>
          </div>
        ) : null}

        <div className="client-list">
          {clients.map((client) => (
            <article className="client-card" key={client.id}>
              <div className="client-card__top">
                <div>
                  <h3>{client.name}</h3>
                  <a href={`tel:${client.phone}`}>{client.phone}</a>
                </div>
                <div className="commission-badge">
                  {client.commission !== null ? `${client.commission}%` : "Без %"}
                </div>
              </div>

              <div className="badge-row">
                {client.is_duplicate ? <span className="badge">Дубль</span> : null}
                {client.is_exclusive ? <span className="badge">Эксклюзив</span> : null}
                {client.only_clients ? <span className="badge">Только клиенты</span> : null}
                {client.no_answer ? <span className="badge">Нет ответа</span> : null}
              </div>

              <div className="client-card__meta">
                <div>
                  <span>Перезвонить</span>
                  <strong>{formatDate(client.callback_at)}</strong>
                </div>
                {client.link ? (
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => openExternalLink(client.link)}
                  >
                    Открыть ссылку
                  </button>
                ) : (
                  <span className="muted-text">Ссылки нет</span>
                )}
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
        {renderContent()}
      </div>

      {screen === "list" ? (
        <button
          type="button"
          className="fab"
          onClick={() => setScreen("create")}
          aria-label="Добавить клиента"
        >
          +
        </button>
      ) : (
        <button
          type="button"
          className="fab fab--secondary"
          onClick={() => setScreen("list")}
          aria-label="Вернуться назад"
        >
          ←
        </button>
      )}
    </main>
  );
}
