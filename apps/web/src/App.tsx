import { CSSProperties, FormEvent, TouchEvent, startTransition, useEffect, useRef, useState } from "react";
import { getTelegramWebApp, initTelegramApp, isTelegramMiniApp } from "./lib/telegram";

type Screen = "list" | "view" | "create" | "settings";
type CreatePanel = "preferences" | "objects" | "passport" | "comment" | null;

type ParkingSpot = {
  id: string;
  address: string;
  price: number | null;
  commission: number | null;
  utilitiesIncluded: boolean;
  deposit: number | null;
  area: number | null;
  floor: string;
};

type PropertyObject = {
  id: string;
  kind: "object" | "parking";
  title: string;
  notes: string;
};

type Client = {
  id: string;
  client_number: number;
  address: string;
  complex_name: string;
  name: string;
  phone: string;
  is_proxy_phone: boolean;
  commission: number | null;
  link: string;
  preferences: string;
  passport_data: string;
  is_duplicate: boolean;
  is_exclusive: boolean;
  only_clients: boolean;
  no_answer: boolean;
  callback_at: string | null;
  callback_reminded_at?: string | null;
  no_answer_marked_at?: string | null;
  no_answer_reminded_at?: string | null;
  notes: string;
  parking_spots: ParkingSpot[];
  objects: PropertyObject[];
  created_at: string;
  is_archived?: boolean;
};

type Settings = {
  telegramBotUsername: string;
  telegramChatId: string;
  telegramEnabled: boolean;
  telegramBotTokenPresent: boolean;
  listActionSearchEnabled: boolean;
  listActionReactionEnabled: boolean;
  listActionCreateEnabled: boolean;
};

type ParkingSpotFormState = {
  id: string;
  address: string;
  price: string;
  commission: string;
  utilitiesIncluded: boolean;
  deposit: string;
  area: string;
  floor: string;
};

type PropertyObjectFormState = {
  id: string;
  kind: "object" | "parking";
  title: string;
  notes: string;
};

type ClientFormState = {
  name: string;
  address: string;
  complexName: string;
  phone: string;
  isProxyPhone: boolean;
  commission: string;
  statusMode: ClientStatusMode;
  isDuplicate: boolean;
  isExclusive: boolean;
  onlyClients: boolean;
  noAnswer: boolean;
  callbackAt: string;
  preferences: string;
  passportData: string;
  notes: string;
  parkingSpots: ParkingSpotFormState[];
  objects: PropertyObjectFormState[];
};

type SettingsFormState = {
  telegramBotToken: string;
  telegramEnabled: boolean;
  listActionSearchEnabled: boolean;
  listActionReactionEnabled: boolean;
  listActionCreateEnabled: boolean;
};

type ClientPriorityTone = "normal" | "success" | "warning" | "danger";
type ClientFilter = "tasks" | "inWork" | "duplicate" | "callback" | "noAnswer" | "onlyClients" | "archive";
type ClientDueKind = "callback" | "noAnswer";
type ClientStatusMode = "none" | "duplicate" | "exclusive" | "noAnswer" | "onlyClients" | "callback";

const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

function createLocalId() {
  return Math.random().toString(36).slice(2, 10);
}

function createParkingSpotFormState(): ParkingSpotFormState {
  return {
    id: createLocalId(),
    address: "",
    price: "",
    commission: "",
    utilitiesIncluded: false,
    deposit: "",
    area: "",
    floor: "",
  };
}

function createPropertyObjectFormState(): PropertyObjectFormState {
  return {
    id: createLocalId(),
    kind: "object",
    title: "",
    notes: "",
  };
}

const COMMISSION_OPTIONS = Array.from({ length: 100 }, (_, index) => String(index + 1));

const initialFormState: ClientFormState = {
  name: "",
  address: "",
  complexName: "",
  phone: "",
  isProxyPhone: false,
  commission: "",
  statusMode: "none",
  isDuplicate: false,
  isExclusive: false,
  onlyClients: false,
  noAnswer: false,
  callbackAt: "",
  preferences: "",
  passportData: "",
  notes: "",
  parkingSpots: [],
  objects: [],
};

const initialSettingsState: SettingsFormState = {
  telegramBotToken: "",
  telegramEnabled: false,
  listActionSearchEnabled: true,
  listActionReactionEnabled: true,
  listActionCreateEnabled: true,
};

const STATUS_MODE_OPTIONS: Array<{ value: ClientStatusMode; label: string }> = [
  { value: "none", label: "Без статуса" },
  { value: "duplicate", label: "Дубль" },
  { value: "exclusive", label: "Эксклюзив" },
  { value: "noAnswer", label: "Нет ответа" },
  { value: "onlyClients", label: "Только клиенты" },
  { value: "callback", label: "Перезвонить" },
];

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

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7H19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M5 12H19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M5 17H19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16.1 16.1L20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SmileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path
        d="M8.5 14C9.4 15.1 10.6 15.7 12 15.7C13.4 15.7 14.6 15.1 15.5 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6.5" cy="12" r="1.7" fill="currentColor" />
      <circle cx="12" cy="12" r="1.7" fill="currentColor" />
      <circle cx="17.5" cy="12" r="1.7" fill="currentColor" />
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

function toNumberOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeClientParkingSpots(items: ParkingSpot[] | null | undefined): ParkingSpotFormState[] {
  return (items ?? []).map((item) => ({
    id: item.id || createLocalId(),
    address: item.address ?? "",
    price: item.price !== null && item.price !== undefined ? String(item.price) : "",
    commission: item.commission !== null && item.commission !== undefined ? String(item.commission) : "",
    utilitiesIncluded: Boolean(item.utilitiesIncluded),
    deposit: item.deposit !== null && item.deposit !== undefined ? String(item.deposit) : "",
    area: item.area !== null && item.area !== undefined ? String(item.area) : "",
    floor: item.floor ?? "",
  }));
}

function normalizeClientObjects(items: PropertyObject[] | null | undefined): PropertyObjectFormState[] {
  return (items ?? []).map((item) => ({
    id: item.id || createLocalId(),
    kind: item.kind === "parking" ? "parking" : "object",
    title: item.title ?? "",
    notes: item.notes ?? "",
  }));
}

function getClientStatusMode(client: Client): ClientStatusMode {
  if (client.is_duplicate) return "duplicate";
  if (client.is_exclusive) return "exclusive";
  if (client.no_answer) return "noAnswer";
  if (client.only_clients) return "onlyClients";
  if (client.callback_at) return "callback";
  return "none";
}

function clientToFormState(client: Client): ClientFormState {
  return {
    name: client.name,
    address: client.address ?? "",
    complexName: client.complex_name ?? "",
    phone: client.phone,
    isProxyPhone: Boolean(client.is_proxy_phone),
    commission: client.commission !== null ? String(client.commission) : "",
    statusMode: getClientStatusMode(client),
    isDuplicate: client.is_duplicate,
    isExclusive: client.is_exclusive,
    onlyClients: client.only_clients,
    noAnswer: client.no_answer,
    callbackAt: toDateTimeLocalValue(client.callback_at),
    preferences: client.preferences ?? "",
    passportData: client.passport_data ?? "",
    notes: client.notes ?? "",
    parkingSpots: normalizeClientParkingSpots(client.parking_spots),
    objects: normalizeClientObjects(client.objects),
  };
}

function startOfLocalDayMs(value: number | string | Date) {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
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

function getClientDueInfo(
  client: Client,
): { kind: ClientDueKind; dueAtMs: number; priorityAtMs: number; displayDiffMs: number } | null {
  if (client.callback_at) {
    const callbackDate = new Date(client.callback_at);
    const callbackAtMs = callbackDate.getTime();
    if (!Number.isNaN(callbackAtMs)) {
      return {
        kind: "callback",
        dueAtMs: callbackAtMs,
        priorityAtMs: startOfLocalDayMs(callbackDate),
        displayDiffMs: startOfLocalDayMs(callbackDate) - startOfLocalDayMs(Date.now()),
      };
    }
  }

  const noAnswerDueAt = getNoAnswerDueAt(client);
  if (noAnswerDueAt !== null) {
    return {
      kind: "noAnswer",
      dueAtMs: noAnswerDueAt,
      priorityAtMs: noAnswerDueAt,
      displayDiffMs: noAnswerDueAt - Date.now(),
    };
  }

  return null;
}

function getClientPriorityTone(client: Client, now = Date.now()): ClientPriorityTone {
  const dueInfo = getClientDueInfo(client);
  if (!dueInfo) {
    return "normal";
  }

  if (dueInfo.priorityAtMs <= now) {
    return "danger";
  }

  if (dueInfo.priorityAtMs - now <= 24 * 60 * 60 * 1000) {
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

  const diffMs = dueInfo.kind === "callback"
    ? startOfLocalDayMs(dueInfo.dueAtMs) - startOfLocalDayMs(now)
    : dueInfo.displayDiffMs;

  if (dueInfo.kind === "callback" && diffMs === 0) {
    return "сегодня";
  }

  if (diffMs <= 0) {
    return `${formatDurationLabel(Math.abs(diffMs))} назад`;
  }

  return `через ${formatDurationLabel(diffMs)}`;
}

function applyStatusMode(mode: ClientStatusMode, callbackAt = "") {
  return {
    statusMode: mode,
    isDuplicate: mode === "duplicate",
    isExclusive: mode === "exclusive",
    onlyClients: mode === "onlyClients",
    noAnswer: mode === "noAnswer",
    callbackAt: mode === "callback" ? callbackAt : "",
  };
}

function getClientStatusLabel(client: Client): string | null {
  const mode = getClientStatusMode(client);
  if (mode === "none") return null;
  if (mode === "duplicate") return "Дубль";
  if (mode === "exclusive") return "Эксклюзив";
  if (mode === "noAnswer") return "Нет ответа";
  if (mode === "onlyClients") return "Только клиенты";
  if (mode === "callback") return client.callback_at ? `Перезвонить ${getClientDueLabel(client) ?? ""}`.trim() : "Перезвонить";
  return null;
}

function getObjectKindLabel(kind: "object" | "parking") {
  return kind === "parking" ? "Машиноместо" : "Объект";
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("list");
  const isTelegram = isTelegramMiniApp();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({
    telegramBotUsername: "",
    telegramChatId: "",
    telegramEnabled: false,
    telegramBotTokenPresent: false,
    listActionSearchEnabled: true,
    listActionReactionEnabled: true,
    listActionCreateEnabled: true,
  });
  const [settingsForm, setSettingsForm] = useState<SettingsFormState>(initialSettingsState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<ClientFormState>(initialFormState);
  const [activeFilter, setActiveFilter] = useState<ClientFilter>("tasks");
  const [activeMenuClientId, setActiveMenuClientId] = useState<string | null>(null);
  const [confirmDeleteClientId, setConfirmDeleteClientId] = useState<string | null>(null);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchKeyboardOffset, setSearchKeyboardOffset] = useState(0);
  const [openCreatePanel, setOpenCreatePanel] = useState<CreatePanel>("preferences");
  const [isObjectMenuOpen, setIsObjectMenuOpen] = useState(false);
  const sortedClients = sortClientsByPriority(clients);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeDeltaRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? null;
  const screenClassName = `app-shell--screen-${screen}`;
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleClients = sortedClients.filter((client) => {
    if (normalizedSearch) {
      const searchable = [
        client.name,
        client.phone,
        client.address,
        client.complex_name,
        client.preferences,
        client.passport_data,
        client.notes,
        client.objects.map((item) => `${item.title} ${item.notes}`).join(" "),
        client.client_number.toString(),
      ]
        .join(" ")
        .toLowerCase();

      if (!searchable.includes(normalizedSearch)) {
        return false;
      }

      return true;
    }

    if (activeFilter !== "archive" && client.is_archived) return false;
    if (activeFilter === "archive") return Boolean(client.is_archived);
    if (activeFilter === "tasks") {
      const tone = getClientPriorityTone(client);
      return tone !== "normal";
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

  useEffect(() => {
    setIsFabMenuOpen(false);
  }, [screen]);

  useEffect(() => {
    if (!showSearch) {
      setSearchKeyboardOffset(0);
      return;
    }

    const focusId = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });

    const viewport = window.visualViewport;
    if (!viewport) {
      return () => window.cancelAnimationFrame(focusId);
    }

    const updateOffset = () => {
      const nextOffset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      setSearchKeyboardOffset(nextOffset);
    };

    updateOffset();
    viewport.addEventListener("resize", updateOffset);
    viewport.addEventListener("scroll", updateOffset);

    return () => {
      window.cancelAnimationFrame(focusId);
      viewport.removeEventListener("resize", updateOffset);
      viewport.removeEventListener("scroll", updateOffset);
    };
  }, [showSearch]);

  useEffect(() => {
    if (!activeMenuClientId) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(".client-row__menu") || target.closest(".client-row__menu-trigger")) {
        return;
      }
      setActiveMenuClientId(null);
      setConfirmDeleteClientId(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [activeMenuClientId]);

  function closeFloatingUi() {
    setActiveMenuClientId(null);
    setConfirmDeleteClientId(null);
    setIsFabMenuOpen(false);
  }

  function openSearch() {
    setActiveMenuClientId(null);
    setConfirmDeleteClientId(null);
    setShowSearch((current) => {
      const next = !current;
      if (!next) {
        setSearchQuery("");
        setSearchKeyboardOffset(0);
      }
      return next;
    });
    setIsFabMenuOpen(true);
  }

  function closeSearch() {
    setSearchQuery("");
    setShowSearch(false);
    setSearchKeyboardOffset(0);
    setIsFabMenuOpen(false);
  }

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
        listActionSearchEnabled: payload.listActionSearchEnabled,
        listActionReactionEnabled: payload.listActionReactionEnabled,
        listActionCreateEnabled: payload.listActionCreateEnabled,
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
          listActionSearchEnabled: settingsForm.listActionSearchEnabled,
          listActionReactionEnabled: settingsForm.listActionReactionEnabled,
          listActionCreateEnabled: settingsForm.listActionCreateEnabled,
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
        complexName: formState.complexName,
        phone: formState.phone,
        isProxyPhone: formState.isProxyPhone,
        isDuplicate: formState.isDuplicate,
        isExclusive: formState.isExclusive,
        onlyClients: formState.onlyClients,
        noAnswer: formState.noAnswer,
        callbackAt: formState.callbackAt
          ? new Date(formState.callbackAt).toISOString()
          : null,
        preferences: formState.preferences,
        passportData: formState.passportData,
        notes: formState.notes,
        parkingSpots: [],
        objects: formState.objects.map((item) => ({
          id: item.id,
          kind: item.kind,
          title: item.title,
          notes: item.notes,
        })),
      };

      payload.commission = toNumberOrNull(formState.commission);

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
    closeFloatingUi();
    setShowSearch(false);
    setEditingClientId(null);
    setSelectedClientId(null);
    setFormState(initialFormState);
    setOpenCreatePanel(null);
    setIsObjectMenuOpen(false);
    setScreen("create");
    window.requestAnimationFrame(() => {
      document.querySelector(".app-shell__content")?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function openView(client: Client) {
    closeFloatingUi();
    setShowSearch(false);
    setSelectedClientId(client.id);
    setScreen("view");
  }

  function openEditForm(client: Client) {
    closeFloatingUi();
    setShowSearch(false);
    setSelectedClientId(client.id);
    setEditingClientId(client.id);
    setFormState(clientToFormState(client));
    setOpenCreatePanel(null);
    setIsObjectMenuOpen(false);
    setScreen("create");
    window.requestAnimationFrame(() => {
      document.querySelector(".app-shell__content")?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  async function handleMarkArchived(client: Client) {
    setSaving(true);
    setError(null);

    try {
      const nextArchivedState = !client.is_archived;
      const response = await fetch(`${API_URL}/api/clients/${client.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isArchived: nextArchivedState }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(
          payload?.error ||
            (nextArchivedState
              ? "Не удалось переместить клиента в архив"
              : "Не удалось вернуть клиента из архива"),
        );
      }

      closeFloatingUi();
      await loadClients();

      if (nextArchivedState) {
        goToList();
        setActiveFilter("archive");
      }
    } catch (archiveError) {
      setError(
        archiveError instanceof Error
          ? archiveError.message
          : client.is_archived
            ? "Ошибка возврата из архива"
            : "Ошибка архивации",
      );
    } finally {
      setSaving(false);
    }
  }

  function goToList() {
    closeFloatingUi();
    setScreen("list");
    setSelectedClientId(null);
    setEditingClientId(null);
    setOpenCreatePanel(null);
    setIsObjectMenuOpen(false);
    setFormState(initialFormState);
  }

  async function handleDeleteClient(client: Client) {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/clients/${client.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Не удалось удалить клиента");
      }

      closeFloatingUi();

      if (selectedClientId === client.id || editingClientId === client.id) {
        goToList();
      }

      await loadClients();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Ошибка удаления");
    } finally {
      setSaving(false);
    }
  }

  function handleStatusModeChange(mode: ClientStatusMode) {
    setFormState((current) => ({
      ...current,
      ...applyStatusMode(
        mode,
        mode === "callback"
          ? current.callbackAt || toDateTimeLocalValue(new Date().toISOString())
          : current.callbackAt,
      ),
    }));
  }

  function addParkingSpot() {
    setFormState((current) => ({
      ...current,
      parkingSpots: [...current.parkingSpots, createParkingSpotFormState()],
    }));
  }

  function updateParkingSpot(
    id: string,
    field: keyof ParkingSpotFormState,
    value: string | boolean,
  ) {
    setFormState((current) => ({
      ...current,
      parkingSpots: current.parkingSpots.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeParkingSpot(id: string) {
    setFormState((current) => ({
      ...current,
      parkingSpots: current.parkingSpots.filter((item) => item.id !== id),
    }));
  }

  function addPropertyObject(kind: "object" | "parking") {
    setFormState((current) => ({
      ...current,
      objects: [
        ...current.objects,
        {
          ...createPropertyObjectFormState(),
          kind,
          title: kind === "parking" ? "Машиноместо" : "",
        },
      ],
    }));
    setIsObjectMenuOpen(false);
    setOpenCreatePanel("objects");
  }

  function updatePropertyObject(
    id: string,
    field: keyof PropertyObjectFormState,
    value: string,
  ) {
    setFormState((current) => ({
      ...current,
      objects: current.objects.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removePropertyObject(id: string) {
    setFormState((current) => ({
      ...current,
      objects: current.objects.filter((item) => item.id !== id),
    }));
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
    const isMainMenu = showSettings;

    return (
      <div className={`topbar topbar--compact ${isMainMenu ? "topbar--main" : ""}`}>
        {isMainMenu ? (
          <span className="topbar__spacer topbar__spacer--main" aria-hidden="true" />
        ) : (
          <button
            type="button"
            className="icon-button icon-button--compact"
            onClick={handleTopBack}
            aria-label="Назад"
          >
            <ArrowLeftIcon />
          </button>
        )}

        <span className={`brand-mark ${isMainMenu ? "brand-mark--main" : ""}`}>LiteLux CRM</span>
        <span className="topbar__spacer" />
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
    swipeDeltaRef.current = { x: 0, y: 0 };
  }

  function handleTouchMove(event: TouchEvent<HTMLElement>) {
    if (!swipeStartRef.current) {
      return;
    }

    const touch = event.touches[0];
    swipeDeltaRef.current = {
      x: touch.clientX - swipeStartRef.current.x,
      y: touch.clientY - swipeStartRef.current.y,
    };
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (!swipeStartRef.current) {
      return;
    }

    const deltaX = swipeDeltaRef.current.x;
    const deltaY = Math.abs(swipeDeltaRef.current.y);
    const startedFromEdge = swipeStartRef.current.x <= 56;
    swipeStartRef.current = null;
    swipeDeltaRef.current = { x: 0, y: 0 };

    if (screen !== "list" && startedFromEdge && deltaX >= 64 && deltaY <= 56) {
      handleTopBack();
    }
  }

  function renderContent() {
    if (screen === "view" && selectedClient) {
      const selectedClientStatus = getClientStatusLabel(selectedClient);

      return (
        <section className="sheet sheet--view">
          <div className="detail-view-shell">
            <div className="detail-card detail-card--plain">
              <button
                type="button"
                className="detail-card__edit"
                onClick={() => openEditForm(selectedClient)}
                aria-label="Редактировать клиента"
              >
                <EditIcon />
              </button>

              <div className="detail-card__top">
                <div className="detail-card__identity">
                  <div className="detail-card__id-label">ID: {selectedClient.client_number}</div>
                  <h2>{selectedClient.name}</h2>
                </div>
                <div className="detail-card__info detail-card__info--location">
                  <div className="detail-card__address">{selectedClient.address || "Без адреса"}</div>
                  {selectedClientStatus ? (
                    <div className="detail-card__status">{selectedClientStatus}</div>
                  ) : null}
                  {selectedClient.complex_name ? (
                    <div className="detail-card__complex">ЖК: {selectedClient.complex_name}</div>
                  ) : null}
                </div>
              </div>

              <div className="detail-card__grid">
                <div className="detail-item">
                  <span>Комиссия</span>
                  <strong>{selectedClient.commission ?? 0}%</strong>
                </div>
                {selectedClient.preferences ? (
                  <div className="detail-item detail-item--wide">
                    <span>Предпочтения</span>
                    <strong>{selectedClient.preferences}</strong>
                  </div>
                ) : null}
              </div>

              {selectedClient.notes ? (
                <div className="detail-card__notes">
                  <span>Комментарий</span>
                  <strong>{selectedClient.notes}</strong>
                </div>
              ) : null}

              {selectedClient.objects?.length ? (
                <details className="detail-disclosure" open>
                  <summary>
                    <span>Объекты</span>
                    <strong>{selectedClient.objects.length}</strong>
                  </summary>
                  <div className="detail-related__list">
                    {selectedClient.objects.map((item, index) => (
                      <div className="detail-related__card" key={item.id || `${item.title}-${index}`}>
                        <strong>
                          {getObjectKindLabel(item.kind === "parking" ? "parking" : "object")} {index + 1}
                        </strong>
                        <span>{item.title || "Без названия"}</span>
                        {item.notes ? <span>{item.notes}</span> : null}
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}

              {selectedClient.passport_data ? (
                <details className="detail-disclosure">
                  <summary>
                    <span>Паспортные данные</span>
                  </summary>
                  <div className="detail-card__notes detail-card__notes--nested">
                    <strong>{selectedClient.passport_data}</strong>
                  </div>
                </details>
              ) : null}
            </div>

            <div className="detail-action-bar">
              <button
                type="button"
                className="detail-action detail-action--wide"
                onClick={() => {
                  window.location.href = `tel:${selectedClient.phone}`;
                }}
                aria-label="Позвонить"
              >
                <PhoneIcon />
                <span>Позвонить</span>
              </button>
            </div>
          </div>
        </section>
      );
    }

    if (screen === "settings") {
      return (
        <section className="sheet">
          <div className="sheet__header">
            <div>
              <p className="eyebrow">Telegram</p>
              <h2>Подключение бота</h2>
            </div>
          </div>

          <div className="settings-grid">
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
                    : "Подключение останется для теста, параметры потом поменяешь вручную"}
                </p>
              </div>
            </div>

            <div className="hint-card">
              Экран настроек упрощён. Быстрые кнопки меню больше не настраиваются отсюда.
            </div>
          </div>
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
              <span className="field__label">ЖК</span>
              <input
                value={formState.complexName}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, complexName: event.target.value }))
                }
                placeholder="Название жилого комплекса"
              />
            </label>

            <div className="field field--phone">
              <span className="field__label">Номер телефона</span>
              <div className="field__inline">
                <input
                  required
                  value={formState.phone}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="+7 999 123-45-67"
                />
                <label className="toggle toggle--compact">
                  <input
                    type="checkbox"
                    checked={formState.isProxyPhone}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        isProxyPhone: event.target.checked,
                      }))
                    }
                  />
                  <span>Подменный</span>
                </label>
              </div>
            </div>

            <label className="field">
              <span className="field__label">Комиссия</span>
              <select
                value={formState.commission}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    commission: event.target.value,
                  }))
                }
              >
                <option value="">Не выбрано</option>
                {COMMISSION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}%
                  </option>
                ))}
              </select>
            </label>

            <label className="field field--full">
              <span className="field__label">Статус</span>
              <select
                value={formState.statusMode}
                onChange={(event) =>
                  handleStatusModeChange(event.target.value as ClientStatusMode)
                }
              >
                {STATUS_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {formState.statusMode === "callback" ? (
              <label className="field field--full">
                <span className="field__label">Дата перезвона</span>
                <input
                  type="date"
                  value={formState.callbackAt ? formState.callbackAt.slice(0, 10) : ""}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      callbackAt: event.target.value ? `${event.target.value}T00:00` : "",
                    }))
                  }
                />
              </label>
            ) : null}

            <div className="accordion-stack">
              <section className={`accordion-card ${openCreatePanel === "preferences" ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="accordion-card__button"
                  onClick={() =>
                    setOpenCreatePanel((current) =>
                      current === "preferences" ? null : "preferences",
                    )
                  }
                >
                  <span>Предпочтения</span>
                </button>
                {openCreatePanel === "preferences" ? (
                  <div className="accordion-card__panel">
                    <label className="field field--full">
                      <span className="field__label">Предпочтения</span>
                      <textarea
                        value={formState.preferences}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            preferences: event.target.value,
                          }))
                        }
                        placeholder="Что важно по клиенту, пожелания, формат работы"
                      />
                    </label>
                  </div>
                ) : null}
              </section>

              <section className={`accordion-card ${openCreatePanel === "objects" ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="accordion-card__button"
                  onClick={() =>
                    setOpenCreatePanel((current) => (current === "objects" ? null : "objects"))
                  }
                >
                  <span>Объекты</span>
                  <strong>{formState.objects.length}</strong>
                </button>
                {openCreatePanel === "objects" ? (
                  <div className="accordion-card__panel">
                    <div className="subform-section__header">
                      <div className="hint-card hint-card--compact">
                        На `+` можно выбрать, что добавлять: объект или машиноместо.
                      </div>
                      <div className="object-add-menu">
                        <button
                          type="button"
                          className="secondary-button secondary-button--compact"
                          onClick={() => setIsObjectMenuOpen((current) => !current)}
                        >
                          +
                        </button>
                        {isObjectMenuOpen ? (
                          <div className="object-add-menu__panel">
                            <button
                              type="button"
                              className="client-row__menu-item"
                              onClick={() => addPropertyObject("object")}
                            >
                              Добавить объект
                            </button>
                            <button
                              type="button"
                              className="client-row__menu-item"
                              onClick={() => addPropertyObject("parking")}
                            >
                              Добавить машиноместо
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="subform-list">
                      {formState.objects.map((item, index) => (
                        <div className="subform-card" key={item.id}>
                          <div className="subform-card__header">
                            <strong>{getObjectKindLabel(item.kind)} #{index + 1}</strong>
                            <button
                              type="button"
                              className="link-button link-button--danger"
                              onClick={() => removePropertyObject(item.id)}
                            >
                              Удалить
                            </button>
                          </div>

                          <div className="subform-grid">
                            <label className="field">
                              <span className="field__label">Название</span>
                              <input
                                value={item.title}
                                onChange={(event) =>
                                  updatePropertyObject(item.id, "title", event.target.value)
                                }
                                placeholder={
                                  item.kind === "parking"
                                    ? "Например, место 12А"
                                    : "Например, квартира 3Е"
                                }
                              />
                            </label>

                            <label className="field field--full">
                              <span className="field__label">Описание</span>
                              <textarea
                                value={item.notes}
                                onChange={(event) =>
                                  updatePropertyObject(item.id, "notes", event.target.value)
                                }
                                placeholder="Короткое описание объекта"
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              <section className={`accordion-card ${openCreatePanel === "passport" ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="accordion-card__button"
                  onClick={() =>
                    setOpenCreatePanel((current) => (current === "passport" ? null : "passport"))
                  }
                >
                  <span>Паспортные данные</span>
                </button>
                {openCreatePanel === "passport" ? (
                  <div className="accordion-card__panel">
                    <label className="field field--full">
                      <span className="field__label">Паспортные данные</span>
                      <textarea
                        value={formState.passportData}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            passportData: event.target.value,
                          }))
                        }
                        placeholder="Серия, номер, кем и когда выдан, дата рождения"
                      />
                    </label>
                  </div>
                ) : null}
              </section>

              <section className={`accordion-card ${openCreatePanel === "comment" ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="accordion-card__button"
                  onClick={() =>
                    setOpenCreatePanel((current) => (current === "comment" ? null : "comment"))
                  }
                >
                  <span>Комментарий</span>
                </button>
                {openCreatePanel === "comment" ? (
                  <div className="accordion-card__panel">
                    <label className="field field--full">
                      <span className="field__label">Комментарий</span>
                      <textarea
                        value={formState.notes}
                        onChange={(event) =>
                          setFormState((current) => ({ ...current, notes: event.target.value }))
                        }
                        placeholder="Свободный текст"
                      />
                    </label>
                  </div>
                ) : null}
              </section>
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

        <div className="filter-strip">
          <div className="filter-strip__primary">{renderFilterButton("tasks", "Задачи")}</div>
          <div className="filter-strip__divider" aria-hidden="true" />
          <div className="filter-row">
            {renderFilterButton("inWork", "В работе")}
            {renderFilterButton("duplicate", "Дубль")}
            {renderFilterButton("callback", "Перезвонить")}
            {renderFilterButton("noAnswer", "Нет ответа")}
            {renderFilterButton("onlyClients", "Только клиенты")}
            {renderFilterButton("archive", "Архив")}
          </div>
        </div>

        {loading ? <div className="hint-card">Загрузка клиентов...</div> : null}

        {!loading && visibleClients.length === 0 ? (
          <div className="empty-card">
            <strong>{clients.length === 0 ? "Пока пусто" : "Ничего не найдено"}</strong>
            <p>
              {clients.length === 0
                ? "Откройте меню справа снизу и выберите `+`, чтобы добавить первого клиента."
                : "Снимите фильтр или переключитесь на другой."}
            </p>
          </div>
        ) : null}

        {activeMenuClientId ? (
          <button
            type="button"
            className="client-row__menu-overlay"
            aria-label="Закрыть меню карточки"
            onClick={closeFloatingUi}
          />
        ) : null}

        <div className="client-list client-list--table">
          {visibleClients.map((client) => {
            const clientTone = getClientPriorityTone(client);
            const clientDueLabel = getClientDueLabel(client);

            return (
              <article
                className={`client-row client-row--${clientTone}`}
                key={client.id}
                onClick={() => openView(client)}
              >
                <button
                  type="button"
                  className="client-row__menu-trigger"
                  aria-label="Действия с клиентом"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsFabMenuOpen(false);
                    setConfirmDeleteClientId((current) =>
                      current === client.id ? null : current,
                    );
                    setActiveMenuClientId((current) => (current === client.id ? null : client.id));
                  }}
                >
                  <MoreIcon />
                </button>

                {activeMenuClientId === client.id ? (
                  <div
                    className="client-row__menu"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    {confirmDeleteClientId === client.id ? (
                      <div className="client-row__menu-confirm">
                        <strong>Удалить клиента?</strong>
                        <div className="client-row__menu-confirm-actions">
                          <button
                            type="button"
                            className="client-row__menu-item client-row__menu-item--danger"
                            onClick={() => void handleDeleteClient(client)}
                            disabled={saving}
                          >
                            Да
                          </button>
                          <button
                            type="button"
                            className="client-row__menu-item"
                            onClick={() => setConfirmDeleteClientId(null)}
                          >
                            Нет
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="client-row__menu-item"
                          onClick={() => openEditForm(client)}
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          className="client-row__menu-item"
                          onClick={() => void handleMarkArchived(client)}
                          disabled={saving}
                        >
                          {client.is_archived ? "Из архива" : "В архив"}
                        </button>
                        <button
                          type="button"
                          className="client-row__menu-item client-row__menu-item--danger"
                          onClick={() => setConfirmDeleteClientId(client.id)}
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </div>
                ) : null}

                <div className="client-row__body">
                  <div className="client-row__top">
                    <div className="client-row__main">
                      <span className="client-row__label">ID: {client.client_number}</span>
                      <strong>{client.name}</strong>
                    </div>

                    <div className="client-row__location">
                      <div className="client-row__location-top">
                        <div className="client-row__address-line">{client.address || "Без адреса"}</div>
                        <div className={`client-row__meta client-row__meta--${clientTone}`}>
                          {client.callback_at
                            ? `Перезвонить ${clientDueLabel || ""}`.trim()
                            : clientDueLabel}
                        </div>
                      </div>
                      {client.complex_name ? (
                        <div className="client-row__complex">ЖК: {client.complex_name}</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="client-row__footer">
                    <div className="client-row__flags">
                      {client.is_proxy_phone ? <span className="badge">Подменный</span> : null}
                      {client.objects?.length ? (
                        <span className="badge">Объекты: {client.objects.length}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <main
      className={`app-shell ${screenClassName} ${isTelegram ? "app-shell--telegram" : ""} ${
        screen === "list" ? "app-shell--list" : ""
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="app-shell__backdrop" />
      <div className={`app-shell__content app-shell__content--${screen}`}>
        {screen !== "list" ? (
          <>
            {renderMainHero(false)}

            {error ? <div className="error-banner">{error}</div> : null}
          </>
        ) : null}

        {renderContent()}
      </div>

      {screen === "list" ? (
        <div
          className="fab-menu"
          style={{
            "--search-keyboard-offset": `${searchKeyboardOffset}px`,
            transform: searchKeyboardOffset ? `translateY(-${searchKeyboardOffset}px)` : undefined,
          } as CSSProperties}
        >
          <div className={`search-flyout ${showSearch ? "is-open" : ""}`}>
            <div className="search-flyout__field">
              <SearchIcon />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Поиск по всей базе"
              />
            </div>
          </div>

          <div className={`fab-menu__actions ${isFabMenuOpen ? "is-open" : ""}`}>
            {settings.listActionReactionEnabled ? (
              <button
                type="button"
                className="fab fab--action"
                onClick={() => {
                  closeFloatingUi();
                  setShowSearch(false);
                  setScreen("settings");
                }}
                aria-label="Настройки меню"
              >
                <SettingsIcon />
              </button>
            ) : null}

            {settings.listActionSearchEnabled ? (
              <button
                type="button"
                className="fab fab--action"
                onClick={openSearch}
                aria-label="Поиск"
              >
                <SearchIcon />
              </button>
            ) : null}

            {settings.listActionCreateEnabled ? (
              <button
                type="button"
                className="fab fab--action"
                onClick={openCreateForm}
                aria-label="Добавить клиента"
              >
                +
              </button>
            ) : null}
          </div>

          <button
            type="button"
            className={`fab ${isFabMenuOpen ? "fab--open" : ""}`}
            onClick={() => setIsFabMenuOpen((current) => !current)}
            aria-label="Открыть меню"
          >
            <MenuIcon />
          </button>
        </div>
      ) : null}
    </main>
  );
}
