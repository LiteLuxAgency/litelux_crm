import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Crown,
  Globe,
  LayoutDashboard,
  Layers3,
  Menu,
  MessageSquare,
  Minus,
  MoreHorizontal,
  Pencil,
  Phone,
  PhoneOff,
  Plus,
  Search,
  User,
  ImagePlus,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { deleteJson, getJson, postFormData, postJson } from "@/lib/api";

const createCardId = (prefix: string) => {
  if (typeof globalThis !== "undefined" && "crypto" in globalThis && typeof globalThis.crypto.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeCommentText = (value: string) => value.replace(/\s*\n+\s*/g, " ").replace(/\s{2,}/g, " ").trim();

const buildOwnerSeed = ({
  id,
  fullName,
  phone,
  phoneType,
  stageTitle,
  nextAction,
  nextActionAt = "",
  touchesCount = 0,
  comment = "",
  agentExperience = "",
  clientOnlyState = "",
  leadsState = "",
  showingsState = "",
  commissionPercent = "",
  cooperationType = "",
  dealType = "Аренда",
  objectAddress = "",
  objectComplex = "",
  objectPrice = "",
  objectLink = "",
  lastContactAt = "",
  responsible = "LiteLux CRM",
  history = [],
}: {
  id: string;
  fullName: string;
  phone: string;
  phoneType: string;
  stageTitle: string;
  nextAction: string;
  nextActionAt?: string;
  touchesCount?: number;
  comment?: string;
  agentExperience?: string;
  clientOnlyState?: string;
  leadsState?: string;
  showingsState?: string;
  commissionPercent?: string;
  cooperationType?: string;
  dealType?: string;
  objectAddress?: string;
  objectComplex?: string;
  objectPrice?: string;
  objectLink?: string;
  lastContactAt?: string;
  responsible?: string;
  history?: { id: string; title: string; meta?: string; at: string }[];
}) => ({
  id,
  cardType: "owner" as const,
  title: fullName,
  price: phone,
  status: stageTitle,
  person: phoneType,
  tag: "Собственник",
  fullName,
  phone,
  phoneType,
  stageTitle,
  nextAction,
  nextActionAt,
  touchesCount,
  comment,
  agentExperience,
  clientOnlyState,
  leadsState,
  showingsState,
  commissionPercent,
  cooperationType,
  dealType,
  objectAddress,
  objectComplex,
  objectPrice,
  objectLink,
  lastContactAt,
  responsible,
  history,
});

const funnelCatalog = [
  {
    id: "collection",
    label: "Набор",
    stages: [
      {
        id: "no-answer",
        title: "Нет ответа",
        cards: [
          buildOwnerSeed({
            id: "owner-oleg-melnikov",
            fullName: "Олег Мельников",
            phone: "+7 999 112-34-56",
            phoneType: "Подменный",
            stageTitle: "Нет ответа",
            nextAction: "Перезвонить",
            nextActionAt: "2026-04-04T12:00",
            touchesCount: 3,
            comment: "Были агенты, мало показов",
            agentExperience: "Да",
            clientOnlyState: "Нет",
            leadsState: "Мало",
            showingsState: "Редко",
            commissionPercent: "50",
            cooperationType: "Дубль",
            dealType: "Аренда",
            objectAddress: "Патриаршие, Малый Козихинский 8",
            objectComplex: "Patriarch",
            objectPrice: "420 000 ₽",
            objectLink: "https://example.com/patriarch",
            lastContactAt: "2026-04-03T18:20",
            history: [
              { id: "history-oleg-1", title: "Звонок", meta: "Нет ответа", at: "2026-04-03T18:20" },
              { id: "history-oleg-2", title: "Карточка создана", meta: "Новый собственник", at: "2026-04-03T14:10" },
            ],
          }),
        ],
      },
      {
        id: "dialogue",
        title: "Диалог",
        cards: [
          buildOwnerSeed({
            id: "owner-alexey-stepanov",
            fullName: "Алексей Степанов",
            phone: "+7 999 310-11-22",
            phoneType: "Неизвестно",
            stageTitle: "Диалог",
            nextAction: "Встреча",
            nextActionAt: "2026-04-06T13:00",
            touchesCount: 4,
            comment: "Готов обсуждать старт после встречи",
            agentExperience: "Негатив",
            clientOnlyState: "Нет",
            leadsState: "Норм",
            showingsState: "Активно",
            commissionPercent: "40",
            cooperationType: "Дубль",
            dealType: "Аренда",
            objectAddress: "Фрунзенская наб., 14",
            objectComplex: "River Side",
            objectPrice: "350 000 ₽",
            objectLink: "https://example.com/river-side",
            lastContactAt: "2026-04-05T09:45",
            history: [
              { id: "history-alexey-1", title: "Звонок", meta: "Уточнил условия размещения", at: "2026-04-05T09:45" },
              { id: "history-alexey-2", title: "Сообщение", meta: "Отправлен медиаплан", at: "2026-04-04T17:20" },
            ],
          }),
        ],
      },
      {
        id: "meeting",
        title: "Встреча",
        cards: [
          buildOwnerSeed({
            id: "owner-kirill-serov",
            fullName: "Кирилл Серов",
            phone: "+7 999 412-78-90",
            phoneType: "Подменный",
            stageTitle: "Встреча",
            nextAction: "Встреча",
            nextActionAt: "2026-04-05T17:00",
            touchesCount: 2,
            comment: "Встреча в офисе, ждёт расчёт по цене",
            agentExperience: "Да",
            clientOnlyState: "Нет",
            leadsState: "Мало",
            showingsState: "Редко",
            commissionPercent: "50",
            cooperationType: "Эксклюзив",
            dealType: "Продажа",
            objectAddress: "Ленинский проспект, 22",
            objectComplex: "",
            objectPrice: "67 000 000 ₽",
            objectLink: "",
            lastContactAt: "2026-04-04T15:55",
            history: [
              { id: "history-kirill-1", title: "Задача", meta: "Подготовить встречу", at: "2026-04-04T15:55" },
            ],
          }),
        ],
      },
      {
        id: "taken",
        title: "Взял",
        cards: [
          buildOwnerSeed({
            id: "owner-marina-frolova",
            fullName: "Марина Фролова",
            phone: "+7 999 521-43-21",
            phoneType: "Прямой",
            stageTitle: "Взял",
            nextAction: "Нет действий",
            touchesCount: 5,
            comment: "Объект уже в работе у команды",
            agentExperience: "Да",
            clientOnlyState: "Нет",
            leadsState: "Много",
            showingsState: "Активно",
            commissionPercent: "50",
            cooperationType: "Эксклюзив",
            dealType: "Аренда",
            objectAddress: "Бронная, 17",
            objectComplex: "White Loft",
            objectPrice: "290 000 ₽",
            objectLink: "https://example.com/white-loft",
            lastContactAt: "2026-04-04T12:40",
            history: [
              { id: "history-marina-1", title: "Статус обновлён", meta: "Карточка взята в работу", at: "2026-04-04T12:40" },
            ],
          }),
        ],
      },
      {
        id: "clients-only",
        title: "Только клиенты",
        cards: [
          buildOwnerSeed({
            id: "owner-natalya-ilina",
            fullName: "Наталья Ильина",
            phone: "+7 999 210-45-67",
            phoneType: "Прямой",
            stageTitle: "Только клиенты",
            nextAction: "Написать",
            nextActionAt: "2026-04-05T16:30",
            touchesCount: 1,
            comment: "Спокойная коммуникация, просила написать условия",
            agentExperience: "Нет",
            clientOnlyState: "Да",
            leadsState: "Нет",
            showingsState: "Нет",
            commissionPercent: "50",
            cooperationType: "Эксклюзив",
            dealType: "Продажа",
            objectAddress: "Пресненская наб., 12",
            objectComplex: "White House",
            objectPrice: "54 000 000 ₽",
            objectLink: "https://example.com/white-house",
            lastContactAt: "2026-04-05T11:10",
            history: [
              { id: "history-natalya-1", title: "Сообщение", meta: "Отправлены условия", at: "2026-04-05T11:10" },
            ],
          }),
        ],
      },
      {
        id: "reject",
        title: "Отказ",
        cards: [
          buildOwnerSeed({
            id: "owner-viktor-panov",
            fullName: "Виктор Панов",
            phone: "+7 999 623-67-54",
            phoneType: "Неизвестно",
            stageTitle: "Отказ",
            nextAction: "Нет действий",
            touchesCount: 1,
            comment: "Уже работает с другим агентом",
            agentExperience: "Да",
            clientOnlyState: "Нет",
            leadsState: "Нет",
            showingsState: "Нет",
            commissionPercent: "",
            cooperationType: "Дубль",
            dealType: "Продажа",
            objectAddress: "",
            objectComplex: "",
            objectPrice: "",
            objectLink: "",
            lastContactAt: "2026-04-02T13:15",
            history: [
              { id: "history-viktor-1", title: "Отказ", meta: "Уже с агентом", at: "2026-04-02T13:15" },
            ],
          }),
        ],
      },
    ],
  },
  {
    id: "selection",
    label: "Подбор",
    stages: [
      {
        id: "clarify",
        title: "Запрос",
        cards: [
          {
            title: "Семья ищет 3BR у парка",
            price: "Бюджет до 420 000 ₽",
            status: "Новый запрос",
            person: "Мария Лебедева",
            tag: "Клиент",
          },
        ],
      },
      {
        id: "options",
        title: "Подбор",
        cards: [
          {
            title: "3 объекта подобраны",
            price: "Patriarch / White Loft / River Park",
            status: "Подбор собран",
            person: "Илья Ковалев",
            tag: "Подбор",
          },
        ],
      },
      {
        id: "showings",
        title: "Показы",
        cards: [
          {
            title: "Показ White Loft",
            price: "Сегодня · 19:30",
            status: "Подтвержден",
            person: "Анна Смирнова",
            tag: "Показ",
          },
        ],
      },
      {
        id: "decision",
        title: "Решение",
        cards: [
          {
            title: "Сравнение двух вариантов",
            price: "Ожидание решения",
            status: "Думает",
            person: "Владислав Орлов",
            tag: "Финал",
          },
        ],
      },
      {
        id: "deal",
        title: "Сделка",
        cards: [
          {
            title: "Согласование договора",
            price: "Подписание завтра",
            status: "Юр. этап",
            person: "Егор Волков",
            tag: "Сделка",
          },
        ],
      },
      {
        id: "rejection",
        title: "Отказ",
        cards: [
          {
            title: "Клиент ушел в паузу",
            price: "Возврат через 2 недели",
            status: "Отложено",
            person: "Дарья Петрова",
            tag: "Отказ",
          },
        ],
      },
    ],
  },
  {
    id: "rent",
    label: "Аренда",
    stages: [
      {
        id: "published",
        title: "Опубликован",
        cards: [
          {
            title: "Арбат Loft · 64 м²",
            price: "250 000 ₽/мес",
            status: "ЦИАН + Авито",
            person: "Анна Смирнова",
            tag: "Объект",
          },
        ],
      },
      {
        id: "showings",
        title: "Есть показы",
        cards: [
          {
            title: "2 показа на неделе",
            price: "Пятница и суббота",
            status: "График собран",
            person: "Сергей Морозов",
            tag: "Показы",
          },
        ],
      },
      {
        id: "candidate",
        title: "Есть кандидат",
        cards: [
          {
            title: "Основной кандидат",
            price: "Проверка документов",
            status: "Финальный этап",
            person: "Ирина Климова",
            tag: "Кандидат",
          },
        ],
      },
      {
        id: "deal",
        title: "Сделка",
        cards: [
          {
            title: "Подписание аренды",
            price: "Завтра в 13:00",
            status: "Подготовка",
            person: "Максим Яшин",
            tag: "Сделка",
          },
        ],
      },
      {
        id: "reject",
        title: "Отказ",
        cards: [
          {
            title: "Кандидат отказался",
            price: "Вернуть в показы",
            status: "Повторный запуск",
            person: "Лев Мартынов",
            tag: "Отказ",
          },
        ],
      },
    ],
  },
  {
    id: "sale",
    label: "Продажа",
    stages: [
      {
        id: "published",
        title: "Опубликован",
        cards: [
          {
            title: "Capital Towers · 110 м²",
            price: "54 000 000 ₽",
            status: "Топ-размещение",
            person: "Елена Попова",
            tag: "Продажа",
          },
        ],
      },
      {
        id: "showings",
        title: "Показы",
        cards: [
          {
            title: "3 показа за 5 дней",
            price: "Высокий интерес",
            status: "В работе",
            person: "Алексей Зотов",
            tag: "Показы",
          },
        ],
      },
      {
        id: "negotiation",
        title: "Переговоры",
        cards: [
          {
            title: "Торг по цене",
            price: "Минус 2,5 млн обсуждается",
            status: "Активно",
            person: "Тимур Соловьев",
            tag: "Переговоры",
          },
        ],
      },
      {
        id: "deposit",
        title: "Аванс",
        cards: [
          {
            title: "Подтвержден аванс",
            price: "Перевод завтра",
            status: "Финализация",
            person: "Ольга Кравец",
            tag: "Аванс",
          },
        ],
      },
      {
        id: "deal",
        title: "Сделка",
        cards: [
          {
            title: "Выход на сделку",
            price: "Подписание в пятницу",
            status: "Готово",
            person: "Никита Беляев",
            tag: "Сделка",
          },
        ],
      },
      {
        id: "reject",
        title: "Отказ",
        cards: [
          {
            title: "Покупатель выбыл",
            price: "Вернуть в показы",
            status: "Отказ",
            person: "Людмила Сафина",
            tag: "Отказ",
          },
        ],
      },
    ],
  },
] as const;

const bottomNav = [
  { id: "dashboard", label: "Дашборд", icon: LayoutDashboard },
  { id: "tasks", label: "Задачи", icon: Layers3 },
  { id: "crm", label: "CRM", icon: Building2 },
  { id: "messages", label: "Сообщения", icon: MessageSquare },
  { id: "profile", label: "Профиль", icon: User },
] as const;

const propertyTypeOptions = [
  { label: "Квартира", value: "flat" },
  { label: "Апартаменты", value: "apartments" },
] as const;
const propertyDealOptions = [
  { label: "Аренда", value: "rent" },
  { label: "Продажа", value: "sale" },
] as const;
const propertySegmentOptions = [
  { label: "Жилая", value: "residential" },
  { label: "Коммерческая", value: "commercial" },
] as const;
const layoutTypeOptions = [
  { label: "Смежная", value: "open" },
  { label: "Изолированная", value: "isolated" },
  { label: "Смежно-изолированная", value: "mixed" },
] as const;
const windowsViewOptions = [
  { label: "Во двор", value: "yard" },
  { label: "На улицу", value: "street" },
  { label: "Во двор и на улицу", value: "yard_street" },
] as const;
const repairTypeOptions = [
  { label: "Без ремонта", value: "no_repair" },
  { label: "Косметический", value: "cosmetic" },
  { label: "Евро", value: "euro" },
  { label: "Дизайнерский", value: "designer" },
] as const;
const furnitureModeOptions = [
  { label: "Без мебели", value: "none" },
  { label: "На кухне", value: "kitchen_only" },
  { label: "В комнатах", value: "rooms_only" },
  { label: "Полностью", value: "full" },
] as const;
const utilitiesModeOptions = [
  { label: "Включены", value: "included" },
  { label: "Не включены", value: "excluded" },
] as const;
const meterModeOptions = [
  { label: "Включены", value: "included" },
  { label: "Не включены", value: "excluded" },
] as const;
const commissionTypeOptions = [
  { label: "%", value: "percent" },
  { label: "₽", value: "fixed" },
] as const;
const metroTransportOptions = [
  { label: "Пешком", value: "walk" },
  { label: "Транспорт", value: "transport" },
] as const;
const parkingTypeOptions = [
  { label: "Наземная", value: "ground" },
  { label: "Многоуровневая", value: "multilevel" },
  { label: "Подземная", value: "underground" },
  { label: "На крыше", value: "roof" },
] as const;
const liquidityOptions = [
  { label: "Быстрая", value: "fast" },
  { label: "Средняя", value: "medium" },
  { label: "Сложная", value: "hard" },
] as const;
const marketPriceOptions = [
  { label: "Ниже рынка", value: "below_market" },
  { label: "В рынке", value: "in_market" },
  { label: "Выше рынка", value: "above_market" },
] as const;
const roomOptions = ["Студия", "1", "2", "3", "4", "5", "6+"] as const;
const prepaymentMonthOptions = ["0", "1", "2", "3", "4", "6", "12"] as const;
const minimumTermOptions = ["1", "2", "3", "6", "12"] as const;
const rentTermOptions = ["От года", "Несколько месяцев"] as const;
const ownerNextActionOptions = ["Нет действий", "Перезвонить", "Написать", "Встреча"] as const;
const ownerPhoneTypeOptions = ["Прямой", "Подменный", "Неизвестно"] as const;
const ownerAgentExperienceOptions = ["Да", "Нет", "Негатив"] as const;
const ownerClientOnlyOptions = ["Да", "Нет"] as const;
const ownerLeadsOptions = ["Нет", "Мало", "Норм", "Много"] as const;
const ownerShowingOptions = ["Нет", "Редко", "Активно"] as const;
const ownerCooperationOptions = ["Дубль", "Эксклюзив", "Думает"] as const;
const ownerDealTypeOptions = ["Аренда", "Продажа"] as const;
const ownerCallResultOptions = ["Не звонил", "Нет ответа", "Дозвонились", "Занят", "Сбросил"] as const;
const ownerCallFollowUpOptions = ["Перезвонить", "Встреча", "Написать"] as const;
const ownerNoAnswerPresetOptions = [
  { id: "plus-hour", label: "Через 1 час" },
  { id: "evening", label: "Сегодня вечером" },
  { id: "tomorrow", label: "Завтра" },
  { id: "custom", label: "Выбрать" },
] as const;
const clientSourceOptions = ["Входящий", "Рекомендация", "Повторный", "Реклама"] as const;
const clientChannelOptions = ["Telegram", "WhatsApp", "Email"] as const;
const clientMoveInOptions = ["Сразу", "До 2 недель", "До месяца", "Гибко"] as const;
const clientPreferenceOptions = ["Можно с детьми", "Можно с животными", "Нужна мебель", "Нужна парковка"] as const;
const clientPropertyTypeOptions = ["Квартира", "Апартаменты", "Дом, дача", "Пентхаус"] as const;

const normalizeRussianPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  let normalized = digits;

  if (normalized.startsWith("8")) {
    normalized = `7${normalized.slice(1)}`;
  } else if (normalized.startsWith("9")) {
    normalized = `7${normalized}`;
  } else if (!normalized.startsWith("7")) {
    normalized = `7${normalized}`;
  }

  normalized = normalized.slice(0, 11);
  const local = normalized.slice(1);

  let result = "+7";

  if (local.length > 0) {
    result += ` ${local.slice(0, 3)}`;
  }

  if (local.length > 3) {
    result += ` ${local.slice(3, 6)}`;
  }

  if (local.length > 6) {
    result += `-${local.slice(6, 8)}`;
  }

  if (local.length > 8) {
    result += `-${local.slice(8, 10)}`;
  }

  return result.trim();
};

const hasCompleteRussianPhone = (value: string) => value.replace(/\D/g, "").length === 11;

const normalizeCommissionPercent = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 3);

  if (!digits) {
    return "";
  }

  return String(Math.min(Number(digits), 100));
};

const normalizeScheduleDate = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
};

const normalizeScheduleTime = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

const padDateNumber = (value: number) => String(value).padStart(2, "0");

const formatDateForSchedule = (value: Date) =>
  `${padDateNumber(value.getDate())}.${padDateNumber(value.getMonth() + 1)}.${value.getFullYear()}`;

const formatTimeForSchedule = (value: Date) => `${padDateNumber(value.getHours())}:${padDateNumber(value.getMinutes())}`;

const buildNoAnswerPresetSchedule = (presetId: (typeof ownerNoAnswerPresetOptions)[number]["id"]) => {
  const next = new Date();

  if (presetId === "plus-hour") {
    next.setHours(next.getHours() + 1);
    return {
      date: formatDateForSchedule(next),
      time: formatTimeForSchedule(next),
    };
  }

  if (presetId === "evening") {
    next.setHours(19, 0, 0, 0);

    if (next.getTime() <= Date.now()) {
      next.setDate(next.getDate() + 1);
    }

    return {
      date: formatDateForSchedule(next),
      time: formatTimeForSchedule(next),
    };
  }

  if (presetId === "tomorrow") {
    next.setDate(next.getDate() + 1);
    next.setHours(12, 0, 0, 0);
    return {
      date: formatDateForSchedule(next),
      time: formatTimeForSchedule(next),
    };
  }

  return {
    date: "",
    time: "",
  };
};

const buildScheduleValue = (date: string, time: string) => {
  const dateMatch = date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  const timeMatch = time.match(/^(\d{2}):(\d{2})$/);

  if (!dateMatch || !timeMatch) {
    return "";
  }

  const [, day, month, year] = dateMatch;
  const [, hours, minutes] = timeMatch;

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toPickerDateValue = (date: string) => {
  const match = date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) {
    return "";
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
};

const fromPickerDateValue = (date: string) => {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return "";
  }

  return `${match[3]}.${match[2]}.${match[1]}`;
};

const splitScheduleValue = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

  if (!match) {
    return { date: "", time: "" };
  }

  return {
    date: `${match[3]}.${match[2]}.${match[1]}`,
    time: `${match[4]}:${match[5]}`,
  };
};

const formatSchedulePreview = (date: string, time: string) => {
  if (date && time) {
    return `${date} · ${time}`;
  }

  return date || time || "";
};

const formatHistoryPreview = (value: string) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const formatOwnerSchedule = (value: string) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const now = new Date();
  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(parsed) - startOfDay(now)) / 86400000);
  const timeLabel = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);

  if (dayDiff === 0) {
    return `сегодня ${timeLabel}`;
  }

  if (dayDiff === 1) {
    return `завтра ${timeLabel}`;
  }

  if (dayDiff === -1) {
    return `вчера ${timeLabel}`;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const isOwnerCardOverdue = (card: OwnerCrmCard) => {
  if (!card.nextActionAt || !card.nextAction || card.nextAction === "Нет действий") {
    return false;
  }

  const parsed = new Date(card.nextActionAt);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.getTime() < Date.now();
};

const formatOwnerActionLine = (card: OwnerCrmCard) => {
  if (!card.nextAction || card.nextAction === "Нет действий") {
    return "—";
  }

  const scheduleLabel = formatOwnerSchedule(card.nextActionAt);
  return scheduleLabel ? `${card.nextAction} · ${scheduleLabel}` : card.nextAction;
};

const clampCommentPreview = (value: string, maxLength = 42) => {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "—";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
};

const buildOwnerCallHistoryMeta = ({
  result,
  comment,
  nextAction,
  nextActionAt,
}: {
  result: OwnerCallResult;
  comment: string;
  nextAction?: string;
  nextActionAt?: string;
}) => {
  const parts: string[] = [result];

  if (nextAction) {
    const scheduleLabel = nextActionAt ? formatOwnerSchedule(nextActionAt) : "";
    parts.push(scheduleLabel ? `${nextAction} · ${scheduleLabel}` : nextAction);
  }

  if (comment.trim()) {
    parts.push(clampCommentPreview(comment, 56));
  }

  return parts.join(" · ");
};

const propertyTypeLabelMap = {
  flat: "Квартира",
  apartments: "Апартаменты",
} as const satisfies Record<PropertyFormState["propertyType"], string>;

const propertyDealLabelMap = {
  rent: "Аренда",
  sale: "Продажа",
} as const satisfies Record<PropertyDealType, string>;

const propertySegmentLabelMap = {
  residential: "Жилая",
  commercial: "Коммерческая",
} as const satisfies Record<PropertySegmentType, string>;

const buildPropertyFlowPills = (scenario?: PropertyCreateScenario | null) => {
  if (!scenario) {
    return ["Долгосрочная аренда", "Жилая"];
  }

  if (scenario.dealType === "rent" && scenario.segment === "residential") {
    return ["Долгосрочная аренда", "Жилая"];
  }

  return [propertyDealLabelMap[scenario.dealType], propertySegmentLabelMap[scenario.segment]];
};

const isSupportedPropertyScenario = (scenario: PropertyCreateScenario) =>
  scenario.dealType === "rent" && scenario.segment === "residential";

const composePropertyAddress = (location: PropertyFormState["location"]) =>
  [location.city, location.street, location.houseNumber, location.buildingNumber && `к${location.buildingNumber}`, location.blockNumber && `стр${location.blockNumber}`]
    .filter(Boolean)
    .join(", ");

const formatPropertyLocationPreview = (location: PropertyFormState["location"]) => {
  const address = composePropertyAddress(location);
  const metro = location.undergroundStation.trim();
  const metroLabel = metro ? `м. ${metro}` : "";

  if (address && metroLabel) {
    return `${address} · ${metroLabel}`;
  }

  return address || metroLabel;
};

const formatPropertySummary = (form: PropertyFormState) => {
  const parts = [
    form.basicInfo.internalTitle.trim(),
    composePropertyAddress(form.location),
    form.pricing.rentPrice.trim() ? `${form.pricing.rentPrice} ₽` : "",
  ].filter(Boolean);

  return parts.join(" · ");
};

function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const rawValue = window.localStorage.getItem(key);
      if (!rawValue) {
        return initialValue;
      }

      const parsedValue = JSON.parse(rawValue) as T;

      if (
        parsedValue &&
        typeof parsedValue === "object" &&
        !Array.isArray(parsedValue) &&
        initialValue &&
        typeof initialValue === "object" &&
        !Array.isArray(initialValue)
      ) {
        return {
          ...(initialValue as Record<string, unknown>),
          ...(parsedValue as Record<string, unknown>),
        } as T;
      }

      return parsedValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Игнорируем переполнение/блокировку хранилища и не ломаем UI.
    }
  }, [key, state]);

  return [state, setState] as const;
}

const createExternalObjectId = () => `LL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const initialPropertyForm = (): PropertyFormState => ({
  ownerId: "",
  ownerLabel: "",
  dealType: "rent",
  rentType: "long_term",
  propertyType: "flat",
  status: "draft",
  basicInfo: {
    internalTitle: "",
    residentialComplexName: "",
    shortDescription: "",
    fullDescription: "",
  },
  location: {
    city: "Москва",
    street: "",
    houseNumber: "",
    buildingNumber: "",
    blockNumber: "",
    entranceNumber: "",
    floorNumber: "",
    totalFloors: "",
    apartmentNumber: "",
    cadastralNumber: "",
    undergroundStation: "",
    undergroundTimeMinutes: "",
    undergroundTransportType: "walk",
    lat: "",
    lng: "",
  },
  pricing: {
    rentPrice: "",
    currency: "RUB",
    depositAmount: "",
    commissionAmount: "",
    commissionType: "percent",
    utilitiesMode: "included",
    meterMode: "excluded",
    utilitiesComment: "",
    prepaymentMonths: "",
    minimumRentTermMonths: "",
  },
  layout: {
    totalArea: "",
    livingArea: "",
    kitchenArea: "",
    layoutType: "",
    isStudio: false,
    isFreeLayout: false,
    ceilingHeight: "",
    balconyCount: 0,
    loggiaCount: 0,
    bathroomSeparateCount: 0,
    bathroomCombinedCount: 0,
    windowsView: "",
  },
  interior: {
    repairType: "",
    furnitureMode: "",
    hasBath: false,
    hasShower: false,
    hasConditioner: false,
    hasRefrigerator: false,
    hasDishwasher: false,
    hasTv: false,
    hasWasher: false,
    hasInternet: false,
    hasPhone: false,
    hasWardrobeRoom: false,
    hasStorageRoom: false,
    hasPanoramicWindows: false,
    hasTerrace: false,
    hasFireplace: false,
  },
  building: {
    passengerLiftsCount: 0,
    cargoLiftsCount: 0,
    hasRamp: false,
    hasGarbageChute: false,
    hasConcierge: false,
    hasSecurity: false,
    parkingTypes: [],
  },
  media: {
    photos: [],
    videoUrl: "",
    vkVideoUrl: "",
    tour3dUrl: "",
    layoutImageUrl: "",
  },
  publication: {
    externalId: createExternalObjectId(),
    xmlCategory: "flatRent",
    isReadyForExport: false,
  },
  crmMeta: {
    liquidityLevel: "",
    marketPriceLevel: "",
    agentComment: "",
    managerId: "",
  },
});

const clonePropertyForm = (form: PropertyFormState): PropertyFormState => ({
  ...form,
  basicInfo: { ...form.basicInfo },
  location: { ...form.location },
  pricing: { ...form.pricing },
  layout: { ...form.layout },
  interior: { ...form.interior },
  building: {
    ...form.building,
    parkingTypes: [...form.building.parkingTypes],
  },
  media: {
    ...form.media,
    photos: [...form.media.photos],
  },
  publication: { ...form.publication },
  crmMeta: { ...form.crmMeta },
});

const initialPropertySections = {
  basic: false,
  location: false,
  pricing: false,
  layout: false,
  interior: false,
  building: false,
  media: false,
  publication: false,
};

const initialClientForm: ClientFormState = {
  fullName: "",
  telegram: "",
  email: "",
  source: "Входящий",
  preferredChannel: "Telegram",
  requestType: "Долгосрочная аренда",
  propertyType: "Квартира",
  rooms: "2",
  budgetFrom: "",
  budgetTo: "",
  preferredAreas: "",
  preferredMetro: "",
  moveIn: "До 2 недель",
  rentTerm: "От года",
  preferences: [],
  notes: "",
};

const initialClientSections = {
  client: false,
  request: false,
  location: false,
  conditions: false,
  notes: false,
};

type PropertyFormState = {
  ownerId: string;
  ownerLabel: string;
  dealType: "rent";
  rentType: "long_term";
  propertyType: "flat" | "apartments";
  status: "draft" | "in_work" | "published" | "archived";
  basicInfo: {
    internalTitle: string;
    residentialComplexName: string;
    shortDescription: string;
    fullDescription: string;
  };
  location: {
    city: string;
    street: string;
    houseNumber: string;
    buildingNumber: string;
    blockNumber: string;
    entranceNumber: string;
    floorNumber: string;
    totalFloors: string;
    apartmentNumber: string;
    cadastralNumber: string;
    undergroundStation: string;
    undergroundTimeMinutes: string;
    undergroundTransportType: "walk" | "transport";
    lat: string;
    lng: string;
  };
  pricing: {
    rentPrice: string;
    currency: "RUB";
    depositAmount: string;
    commissionAmount: string;
    commissionType: "percent" | "fixed";
    utilitiesMode: "included" | "excluded";
    meterMode: "included" | "excluded";
    utilitiesComment: string;
    prepaymentMonths: string;
    minimumRentTermMonths: string;
  };
  layout: {
    totalArea: string;
    livingArea: string;
    kitchenArea: string;
    layoutType: "" | "open" | "isolated" | "mixed";
    isStudio: boolean;
    isFreeLayout: boolean;
    ceilingHeight: string;
    balconyCount: number;
    loggiaCount: number;
    bathroomSeparateCount: number;
    bathroomCombinedCount: number;
    windowsView: "" | "yard" | "street" | "yard_street";
  };
  interior: {
    repairType: "" | "no_repair" | "cosmetic" | "euro" | "designer";
    furnitureMode: "" | "none" | "kitchen_only" | "rooms_only" | "full";
    hasBath: boolean;
    hasShower: boolean;
    hasConditioner: boolean;
    hasRefrigerator: boolean;
    hasDishwasher: boolean;
    hasTv: boolean;
    hasWasher: boolean;
    hasInternet: boolean;
    hasPhone: boolean;
    hasWardrobeRoom: boolean;
    hasStorageRoom: boolean;
    hasPanoramicWindows: boolean;
    hasTerrace: boolean;
    hasFireplace: boolean;
  };
  building: {
    passengerLiftsCount: number;
    cargoLiftsCount: number;
    hasRamp: boolean;
    hasGarbageChute: boolean;
    hasConcierge: boolean;
    hasSecurity: boolean;
    parkingTypes: Array<"ground" | "multilevel" | "underground" | "roof">;
  };
  media: {
    photos: UploadedPhoto[];
    videoUrl: string;
    vkVideoUrl: string;
    tour3dUrl: string;
    layoutImageUrl: string;
  };
  publication: {
    externalId: string;
    xmlCategory: "flatRent";
    isReadyForExport: boolean;
  };
  crmMeta: {
    liquidityLevel: "" | "fast" | "medium" | "hard";
    marketPriceLevel: "" | "below_market" | "in_market" | "above_market";
    agentComment: string;
    managerId: string;
  };
};

type UploadedPhoto = {
  name: string;
  path: string;
  publicUrl: string;
  size: number;
  mimeType: string;
};

type PropertyOwnerOption = {
  id: string;
  name: string;
  phone: string;
  phoneType: string;
};

type PropertyCreateResult = {
  card: CrmCard;
  propertyId?: string;
  propertyTitle: string;
};

type OwnerFormState = {
  fullName: string;
  phone: string;
  phoneType: string;
  comment: string;
  stageKey: string;
  nextAction: string;
  nextActionDate: string;
  nextActionTime: string;
  agentExperience: string;
  clientOnlyState: string;
  leadsState: string;
  showingsState: string;
  commissionPercent: string;
  cooperationState: string;
  duplicateState: string;
  exclusiveState: string;
  dealType: string;
  objectAddress: string;
  objectComplex: string;
  objectPrice: string;
  objectLink: string;
  returnDate: string;
};

type ClientFormState = {
  fullName: string;
  telegram: string;
  email: string;
  source: string;
  preferredChannel: string;
  requestType: string;
  propertyType: string;
  rooms: string;
  budgetFrom: string;
  budgetTo: string;
  preferredAreas: string;
  preferredMetro: string;
  moveIn: string;
  rentTerm: string;
  preferences: string[];
  notes: string;
};

type ClientArrayField = "preferences";
type CreateEntityType = "property" | "owner" | "client";
type CreateScreen = CreateEntityType | "property-scenario";
type PropertyDealType = (typeof propertyDealOptions)[number]["value"];
type PropertySegmentType = (typeof propertySegmentOptions)[number]["value"];
type PropertyCreateScenario = {
  dealType: PropertyDealType;
  segment: PropertySegmentType;
};
type OwnerHistoryEntry = {
  id: string;
  title: string;
  meta?: string;
  at: string;
};

type AddressSuggestion = {
  value: string;
  unrestrictedValue: string;
  data: {
    region: string;
    regionWithType: string;
    city: string;
    cityWithType: string;
    settlement: string;
    settlementWithType: string;
    street: string;
    streetWithType: string;
    house: string;
    block: string;
    blockTypeFull: string;
    geoLat: string;
    geoLon: string;
  };
};

type CleanAddressResponse = {
  address: null | {
    result: string;
    entrance: string;
    metro: Array<{
      name: string;
      line: string;
      distance: number | string;
    }>;
  };
};

type OwnerCallResult = (typeof ownerCallResultOptions)[number];
type OwnerCallFollowUpAction = (typeof ownerCallFollowUpOptions)[number];

type CrmCardBase = {
  id?: string;
  cardType?: "owner";
  title: string;
  price: string;
  status: string;
  person: string;
  tag: string;
};

type OwnerCrmCard = CrmCardBase & {
  cardType: "owner";
  fullName: string;
  phone: string;
  phoneType: string;
  stageTitle: string;
  nextAction: string;
  nextActionAt: string;
  touchesCount: number;
  comment: string;
  agentExperience: string;
  clientOnlyState: string;
  leadsState: string;
  showingsState: string;
  commissionPercent: string;
  cooperationType: string;
  dealType: string;
  objectAddress: string;
  objectComplex: string;
  objectPrice: string;
  objectLink: string;
  lastContactAt: string;
  responsible: string;
  history: OwnerHistoryEntry[];
};

type CrmCard = CrmCardBase | OwnerCrmCard;

const isOwnerCrmCard = (card: CrmCard): card is OwnerCrmCard => card.cardType === "owner";

function AmbientGlow({ className = "" }: { className?: string }) {
  return <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} aria-hidden="true" />;
}

function Screen({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="pointer-events-none absolute -left-8 top-4 h-40 w-40 rounded-full bg-[#D9A54D]/7 blur-[96px]" />
      <div className="pointer-events-none absolute right-[-30px] top-24 h-36 w-36 rounded-full bg-[#D9A54D]/4 blur-[88px]" />
      <div
        className={[
          "relative overflow-hidden rounded-[36px] border border-white/[0.07] bg-[#0A0D12] text-white",
          "shadow-[0_28px_80px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.03)]",
          className,
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_22%,rgba(255,255,255,0.01)_100%)]" />
        {children}
      </div>
    </div>
  );
}

function Surface({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <Card
      className={[
        "relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#11161D] shadow-[0_14px_32px_rgba(0,0,0,0.3)]",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent_36%)]" />
      {children}
    </Card>
  );
}

function HeaderAction({
  children,
  onClick,
  active = false,
  className = "",
}: React.PropsWithChildren<{ onClick?: () => void; active?: boolean; className?: string }>) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985, y: 1 }}
      onClick={onClick}
      className={[
        "flex h-11 w-11 items-center justify-center rounded-[20px] border text-white/70 transition-all",
        active
          ? "border-white/14 bg-white/[0.08] shadow-[0_12px_24px_rgba(242,204,122,0.10)]"
          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]",
        className,
      ].join(" ")}
    >
      {children}
    </motion.button>
  );
}

function ModeChip({
  active,
  children,
  onClick,
}: React.PropsWithChildren<{ active: boolean; onClick: () => void }>) {
  return (
    <motion.button
      whileTap={{ scale: 0.985, y: 1 }}
      onClick={onClick}
      className={[
        "relative overflow-hidden rounded-[18px] border px-4 py-2.5 text-sm whitespace-nowrap transition-all",
        active
          ? "border-white/14 bg-white/[0.08] text-white shadow-[0_14px_28px_rgba(242,204,122,0.10)]"
          : "border-white/8 bg-transparent text-white/42",
      ].join(" ")}
    >
      {active && <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(242,204,122,0.16),rgba(255,255,255,0.03),transparent_72%)]" />}
      <span className={["relative", active ? "text-[#E8C67B]" : ""].join(" ")}>{children}</span>
    </motion.button>
  );
}

function PhoneTypeIndicator({
  phoneType,
  compact = false,
}: {
  phoneType: string;
  compact?: boolean;
}) {
  const isDirect = phoneType === "Прямой";
  const isForwarded = phoneType === "Подменный";
  const Icon = isForwarded ? PhoneOff : Phone;

  return (
    <div
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        isDirect
          ? "border-[#E8C67B]/30 bg-[#E8C67B]/10 text-[#F4D488]"
          : isForwarded
            ? "border-white/[0.08] bg-[#151C25] text-white/72"
            : "border-white/[0.08] bg-[#151C25] text-white/52",
      ].join(" ")}
      aria-label={`Тип номера: ${phoneType}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {!compact ? <span>{phoneType}</span> : null}
    </div>
  );
}

function OwnerInfoValue({ value }: { value: string }) {
  return (
    <div className="inline-flex min-h-[40px] items-center rounded-[16px] border border-[#E8C67B]/28 bg-[linear-gradient(180deg,rgba(232,198,123,0.12),rgba(255,255,255,0.02)_100%)] px-3 text-[13px] font-medium text-[#F5D893]">
      {value}
    </div>
  );
}

function OwnerInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/[0.07] bg-[#121821] px-3 py-2.5">
      <div className="min-w-0 text-[13px] font-medium text-white/62">{label}</div>
      <div className="shrink-0">
        <OwnerInfoValue value={value} />
      </div>
    </div>
  );
}

const hasOwnerObjectInfo = (card: Pick<OwnerCrmCard, "objectAddress" | "objectComplex" | "objectPrice" | "objectLink">) =>
  [card.objectAddress, card.objectComplex, card.objectPrice, card.objectLink].some((value) => value.trim());

function OwnerObjectPreviewCard({ card }: { card: OwnerCrmCard }) {
  const rows = [
    { label: "Адрес", value: card.objectAddress.trim() },
    { label: "ЖК", value: card.objectComplex.trim() },
    { label: "Ссылка", value: card.objectLink.trim(), compact: true },
  ].filter((item) => item.value);

  return (
    <div className="rounded-[20px] border border-white/[0.08] bg-[#121821] p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex min-h-[32px] items-center rounded-full border border-[#E8C67B]/24 bg-[#E8C67B]/10 px-3 text-[12px] font-medium text-[#F3D58C]">
          {card.dealType || "Объект"}
        </div>
        {card.objectPrice.trim() ? <div className="text-right text-[13px] font-medium text-white">{card.objectPrice.trim()}</div> : null}
      </div>

      {rows.length ? (
        <div className="mt-3 space-y-2">
          {rows.map((item) => (
            <div key={item.label} className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <div className="text-[11px] font-medium text-white/42">{item.label}</div>
              <div className={["mt-1 text-[13px] leading-5 text-white", item.compact ? "truncate" : "break-words"].join(" ")}>{item.value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PropertyCardModal({
  card,
  onClose,
}: {
  card: CrmCard | null;
  onClose: () => void;
}) {
  if (!card || isOwnerCrmCard(card)) {
    return null;
  }

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-[rgba(5,8,12,0.76)] backdrop-blur-[10px]"
        aria-label="Закрыть просмотр объекта"
      />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-x-4 top-20 z-[110] mx-auto w-full max-w-[420px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0F151D] shadow-[0_32px_70px_rgba(0,0,0,0.42)]"
      >
        <div className="relative p-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#151C25] text-white/62 transition-all hover:bg-[#19212C] hover:text-white"
            aria-label="Закрыть карточку объекта"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="pr-12">
            <div className="inline-flex min-h-[32px] items-center rounded-full border border-[#E8C67B]/24 bg-[#E8C67B]/10 px-3 text-[12px] font-medium text-[#F3D58C]">
              {card.tag}
            </div>
            <div className="mt-4 text-[24px] font-semibold leading-8 tracking-tight text-white">{card.title}</div>
            <div className="mt-2 text-[14px] text-white/46">{card.status}</div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-[18px] border border-white/[0.07] bg-[#141B24] px-4 py-3">
              <div className="text-[12px] font-medium text-white/42">Адрес</div>
              <div className="mt-1 text-[14px] leading-6 text-white">{card.person || "Не указан"}</div>
            </div>

            <div className="rounded-[18px] border border-white/[0.07] bg-[#141B24] px-4 py-3">
              <div className="text-[12px] font-medium text-white/42">Цена</div>
              <div className="mt-1 text-[16px] font-medium leading-6 text-white">{card.price || "Не указана"}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function OwnerCardPreview({ card }: { card: OwnerCrmCard }) {
  const overdue = isOwnerCardOverdue(card);
  const PhoneIcon = card.phoneType === "Подменный" ? PhoneOff : Phone;

  return (
    <div className="grid grid-rows-[auto_auto_auto] gap-1.5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="truncate text-[15px] font-medium leading-5 text-white">{card.fullName}</div>
        <div className="flex items-center gap-1 whitespace-nowrap text-[12px] text-white/62">
          <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-[#E8C67B]" />
          <span>{card.phone}</span>
        </div>
      </div>

      <div className={["min-w-0 text-[12px] font-medium", overdue ? "text-[#F29B87]" : "text-[#E8C67B]"].join(" ")}>
        {formatOwnerActionLine(card)}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="text-[10px] text-white/44">{card.touchesCount} касания</div>
        <div className="max-w-[44%] shrink-0 line-clamp-1 text-right text-[10px] leading-4 text-white/54">
          {clampCommentPreview(card.comment)}
        </div>
      </div>
    </div>
  );
}

function StageCard({
  card,
  onArchive,
  onOpen,
  onEdit,
  onView,
  onCall,
  onOpenListing,
}: {
  card: CrmCard;
  onArchive?: () => void;
  onOpen?: () => void;
  onEdit?: () => void;
  onView?: () => void;
  onCall?: () => void;
  onOpenListing?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const ownerCard = isOwnerCrmCard(card) ? card : null;
  const overdue = ownerCard ? isOwnerCardOverdue(ownerCard) : false;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.14 }}
      className={["h-full", ownerCard ? "mr-auto w-[calc(100%-2px)]" : "w-full"].join(" ")}
    >
      <Surface
        className={[
          "h-full w-full rounded-[24px] bg-[#15191F]/92 shadow-[0_10px_28px_rgba(0,0,0,0.18)]",
          "overflow-visible",
          ownerCard
            ? overdue
              ? "border-[#F29B87]/52 bg-[linear-gradient(180deg,rgba(242,155,135,0.12),rgba(21,25,31,0.96)_30%,rgba(21,25,31,0.96))]"
              : "border-white/8"
            : "border-white/8",
        ].join(" ")}
      >
        <CardContent
          role={ownerCard && onOpen ? "button" : undefined}
          tabIndex={ownerCard && onOpen ? 0 : undefined}
          onClick={ownerCard && onOpen ? onOpen : undefined}
          onKeyDown={
            ownerCard && onOpen
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen();
                  }
                }
              : undefined
          }
          className={[
            "relative h-full px-3 py-2.5",
            ownerCard && onOpen ? "cursor-pointer rounded-[24px]" : "",
          ].join(" ")}
        >
          <div className="absolute -left-3 top-[-10px] h-10 w-10 rounded-full bg-[#F2CC7A]/8 blur-2xl" />
          {ownerCard && onArchive ? (
            <div ref={menuRef} className="absolute right-2.5 top-2.5 z-20">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuOpen((current) => !current);
                }}
                className="flex h-8 w-8 items-center justify-center text-white/88 transition-all hover:text-white"
                aria-label="Действия с карточкой"
              >
                <MoreHorizontal className="h-4.5 w-4.5" />
              </button>

              <AnimatePresence initial={false}>
                {menuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    className="absolute right-0 top-[calc(100%+8px)] z-40 min-w-[196px] overflow-hidden rounded-[18px] border border-white/12 bg-[#0F141C] shadow-[0_22px_40px_rgba(0,0,0,0.42)]"
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setMenuOpen(false);
                        onEdit?.();
                      }}
                      className="w-full px-4 py-3 text-left text-[13px] font-medium text-white transition-colors hover:bg-white/[0.05]"
                    >
                      Редактировать
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setMenuOpen(false);
                        onCall?.();
                      }}
                      className="w-full px-4 py-3 text-left text-[13px] font-medium text-white/84 transition-colors hover:bg-white/[0.05]"
                    >
                      Позвонить
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (!ownerCard.objectLink.trim()) {
                          return;
                        }
                        setMenuOpen(false);
                        onOpenListing?.();
                      }}
                      disabled={!ownerCard.objectLink.trim()}
                      className={[
                        "w-full px-4 py-3 text-left text-[13px] font-medium transition-colors",
                        ownerCard.objectLink.trim() ? "text-white/84 hover:bg-white/[0.05]" : "cursor-not-allowed text-white/30",
                      ].join(" ")}
                    >
                      Ссылка
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setMenuOpen(false);
                        onArchive();
                      }}
                      className="w-full px-4 py-3 text-left text-[13px] font-medium text-white/84 transition-colors hover:bg-white/[0.05]"
                    >
                      В архив
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}
          {!ownerCard ? (
            <div className="relative flex items-start justify-between gap-2">
              <Badge className="rounded-full border-0 bg-white/[0.05] px-2 py-0.5 text-[8px] font-medium text-white/60 hover:bg-white/[0.05]">
                {card.tag}
              </Badge>
              <div className="flex items-start gap-1.5">
                <div className="pt-0.5 text-[9px] text-[#C8A56A]">{card.status}</div>
                {onArchive ? (
                  <div ref={menuRef} className="relative">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setMenuOpen((current) => !current);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-white/34 transition-all hover:bg-white/[0.05] hover:text-white/72"
                      aria-label="Действия с карточкой"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    <AnimatePresence initial={false}>
                      {menuOpen ? (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.14, ease: "easeOut" }}
                          className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[122px] overflow-hidden rounded-[16px] border border-white/10 bg-[#12161D]/98 shadow-[0_16px_30px_rgba(0,0,0,0.32)]"
                        >
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setMenuOpen(false);
                              onView?.();
                            }}
                            className="w-full px-4 py-3 text-left text-[13px] font-medium text-white transition-colors hover:bg-white/[0.05]"
                          >
                            Посмотреть
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setMenuOpen(false);
                              onArchive();
                            }}
                            className="w-full px-4 py-3 text-left text-[13px] font-medium text-white/84 transition-colors hover:bg-white/[0.05]"
                          >
                            В архив
                          </button>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          <div className="relative">
            {ownerCard ? (
              <div className="pr-14">
                <OwnerCardPreview card={ownerCard} />
              </div>
            ) : (
              <div className="grid h-full grid-rows-[auto_1fr_auto] gap-2.5">
                <div className="min-h-0">
                  <div className="text-[12px] font-medium leading-5 text-white">{card.title}</div>
                  <div className="mt-1 text-[10px] text-white/44">{card.person}</div>
                </div>
                <div />
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-medium text-white">{card.price}</div>
                  <div className="flex items-center gap-1.5 text-white/34">
                    <Phone className="h-3 w-3" />
                    <CalendarDays className="h-3 w-3" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Surface>
    </motion.div>
  );
}

function FormChip({
  active,
  children,
  onClick,
}: React.PropsWithChildren<{ active: boolean; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-[15px] border px-3 py-1.5 text-[13px] font-medium transition-all",
        active
          ? "border-[#E8C67B]/60 bg-[linear-gradient(180deg,rgba(232,198,123,0.18),rgba(18,20,24,0.96))] text-[#F7D992]"
          : "border-white/10 bg-[#141922] text-white/76",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function FormField({
  label,
  value,
  onChange,
  suffix,
  placeholder = "",
  multiline = false,
  required = false,
  error = "",
  hint = "",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}) {
  const fieldId = useId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!multiline || !textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "0px";
    const nextHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 72), 220);
    textareaRef.current.style.height = `${nextHeight}px`;
  }, [multiline, value]);

  return (
    <div className={["space-y-1.5", className].join(" ").trim()}>
      <div className="flex items-center gap-2">
        <label htmlFor={fieldId} className="text-[12px] font-medium text-white/62">
          {label}
          {required ? <span className="ml-1 text-[#E8C67B]">*</span> : null}
        </label>
      </div>
      <div className="relative">
        {multiline ? (
          <textarea
            ref={textareaRef}
            id={fieldId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={1}
            className={[
              "min-h-[72px] w-full resize-none overflow-hidden rounded-[18px] border bg-[#121821] px-4 py-3 text-[14px] leading-6 text-white outline-none placeholder:text-white/24 whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
              error
                ? "border-[#F2A27A]/60 shadow-[0_0_0_1px_rgba(242,162,122,0.16)]"
                : "border-white/[0.1]",
            ].join(" ")}
          />
        ) : (
          <Input
            id={fieldId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={[
              "h-11 rounded-[18px] bg-[#121821] pr-10 text-white placeholder:text-white/24",
              error
                ? "border-[#F2A27A]/60 shadow-[0_0_0_1px_rgba(242,162,122,0.16)]"
                : "border-white/[0.1]",
            ].join(" ")}
          />
        )}
        {suffix ? (
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-white/34">
            {suffix}
          </div>
        ) : null}
      </div>
      {error ? <div className="text-[11px] leading-4 text-[#F2A27A]">{error}</div> : null}
      {!error && hint ? <div className="text-[11px] leading-4 text-white/28">{hint}</div> : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  open,
  onToggle,
  onClose,
  onSelect,
  options,
  required = false,
  error = "",
}: {
  label: string;
  value: string;
  placeholder: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (value: string) => void;
  options: readonly string[];
  required?: boolean;
  error?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, onClose]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="text-[12px] font-medium text-white/62">
          {label}
          {required ? <span className="ml-1 text-[#E8C67B]">*</span> : null}
        </div>
      </div>

      <div ref={wrapperRef} className={["relative", open ? "z-[220]" : "z-10"].join(" ")}>
        <button
          type="button"
          onClick={onToggle}
          className={[
            "flex h-11 w-full cursor-pointer select-none items-center justify-between rounded-[18px] border bg-[#141922] px-4 text-left text-[14px] transition-all",
            error
              ? "border-[#F2A27A]/60 shadow-[0_0_0_1px_rgba(242,162,122,0.16)]"
              : "border-white/10",
          ].join(" ")}
        >
          <span className={["pointer-events-none", value ? "text-white" : "text-white/28"].join(" ")}>{value || placeholder}</span>
          <ChevronRight className={["pointer-events-none h-4 w-4 text-white/34 transition-transform", open ? "rotate-90" : ""].join(" ")} />
        </button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute left-0 right-0 top-[calc(100%+8px)] z-[120] overflow-hidden rounded-[18px] border border-white/10 bg-[#11161D] shadow-[0_18px_40px_rgba(0,0,0,0.36)]"
            >
              {options.map((option) => {
                const active = option === value;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSelect(option)}
                    className={[
                      "flex w-full cursor-pointer select-none items-center justify-between px-4 py-2.5 text-left text-[14px] transition-colors",
                      active ? "bg-[#E8C67B]/12 text-[#F7D992]" : "text-white/78 hover:bg-white/[0.04]",
                    ].join(" ")}
                  >
                    <span>{option}</span>
                    {active ? <div className="h-2.5 w-2.5 rounded-full bg-[#E8C67B]" /> : null}
                  </button>
                );
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {error ? <div className="text-[11px] leading-4 text-[#F2A27A]">{error}</div> : null}
    </div>
  );
}

function CounterField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (delta: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-[#141922] px-4 py-2.5">
      <div className="text-[14px] text-white/82">{label}</div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/62"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <div className="min-w-4 text-center text-[14px] font-medium text-white">{value}</div>
        <button
          type="button"
          onClick={() => onChange(1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#E8C67B]"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function FormSection({
  title,
  open,
  onToggle,
  children,
  summary,
  complete = false,
}: React.PropsWithChildren<{
  title: string;
  open: boolean;
  onToggle: () => void;
  summary?: string;
  complete?: boolean;
}>) {
  return (
    <Surface className="rounded-[24px] border-white/[0.08] bg-[#10161E]">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between px-4 py-2.5 text-left"
        >
          <div className="space-y-1">
            <div className="text-[14px] font-medium text-white">{title}</div>
            {summary ? (
              <div
                className={[
                  "inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-medium",
                  complete
                    ? "border-[#E8C67B]/30 bg-[#E8C67B]/12 text-[#F7D992]"
                    : "border-white/10 bg-white/[0.04] text-white/38",
                ].join(" ")}
              >
                {summary}
              </div>
            ) : null}
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-[#161C25] text-[#E8C67B]">
            <ChevronRight className={["h-3.5 w-3.5 transition-transform", open ? "rotate-90" : ""].join(" ")} />
          </div>
        </button>
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/[0.06] px-4 pb-3.5 pt-3.5">{children}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Surface>
  );
}

function AddressSuggestField({
  value,
  loading,
  error = "",
  open,
  suggestions,
  onChange,
  onSelect,
  onClose,
  onFocus,
}: {
  value: string;
  loading: boolean;
  error?: string;
  open: boolean;
  suggestions: AddressSuggestion[];
  onChange: (value: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  onClose: () => void;
  onFocus: () => void;
}) {
  const fieldId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, onClose]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label htmlFor={fieldId} className="text-[12px] font-medium text-white/62">
          Адрес
        </label>
      </div>

      <div ref={wrapperRef} className={["relative", open ? "z-[220]" : "z-10"].join(" ")}>
        <div className="relative">
          <Input
            id={fieldId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={onFocus}
            placeholder="Начни вводить адрес"
            className={[
              "h-11 rounded-[18px] bg-[#121821] pl-10 pr-10 text-white placeholder:text-white/24",
              error ? "border-[#F2A27A]/60 shadow-[0_0_0_1px_rgba(242,162,122,0.16)]" : "border-white/[0.1]",
            ].join(" ")}
          />
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/24" />
          {loading ? <Clock3 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/28" /> : null}
        </div>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute left-0 right-0 top-[calc(100%+8px)] z-[120] overflow-hidden rounded-[18px] border border-white/10 bg-[#11161D] shadow-[0_18px_40px_rgba(0,0,0,0.36)]"
            >
              {suggestions.length > 0 ? (
                suggestions.map((suggestion) => (
                  <button
                    key={suggestion.unrestrictedValue || suggestion.value}
                    type="button"
                    onClick={() => onSelect(suggestion)}
                    className="w-full border-b border-white/[0.06] px-4 py-3 text-left last:border-b-0 hover:bg-white/[0.04]"
                  >
                    <div className="text-[13px] font-medium text-white">{suggestion.value}</div>
                    {suggestion.unrestrictedValue && suggestion.unrestrictedValue !== suggestion.value ? (
                      <div className="mt-1 text-[11px] leading-4 text-white/42">{suggestion.unrestrictedValue}</div>
                    ) : null}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-[12px] text-white/42">{loading ? "Ищем адрес..." : "Ничего не найдено"}</div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {error ? <div className="text-[11px] leading-4 text-[#F2A27A]">{error}</div> : null}
      {!error ? <div className="text-[11px] leading-4 text-white/28">Выбери подсказку, и город, улица, дом заполнятся автоматически</div> : null}
    </div>
  );
}

function InlineAccordionSection({
  title,
  open,
  onToggle,
  children,
}: React.PropsWithChildren<{
  title: string;
  open: boolean;
  onToggle: () => void;
}>) {
  return (
    <div className="border-t border-white/6 pt-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 py-1 text-left"
      >
        <div className="text-[13px] font-medium text-white/86">{title}</div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#E8C67B]">
          <ChevronRight className={["h-3.5 w-3.5 transition-transform", open ? "rotate-90" : ""].join(" ")} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FormScreenShell({
  title,
  onClose,
  children,
  footer,
  headerMode = "default",
  enableSwipeBack = false,
}: React.PropsWithChildren<{
  title: string;
  onClose: () => void;
  footer: React.ReactNode;
  headerMode?: "default" | "backOnly";
  enableSwipeBack?: boolean;
}>) {
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!enableSwipeBack) {
      return;
    }

    const touch = event.changedTouches[0];
    swipeStartX.current = touch?.clientX ?? null;
    swipeStartY.current = touch?.clientY ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!enableSwipeBack || swipeStartX.current === null || swipeStartY.current === null) {
      return;
    }

    const touch = event.changedTouches[0];
    const endX = touch?.clientX ?? swipeStartX.current;
    const endY = touch?.clientY ?? swipeStartY.current;
    const deltaX = endX - swipeStartX.current;
    const deltaY = Math.abs(endY - swipeStartY.current);
    const startedFromEdge = swipeStartX.current <= 36;

    swipeStartX.current = null;
    swipeStartY.current = null;

    if (startedFromEdge && deltaX >= 88 && deltaY <= 64) {
      onClose();
    }
  };

  return (
    <Screen className="h-[calc(100dvh-48px)] overflow-y-auto overflow-x-hidden overscroll-contain">
      <div
        className="relative min-h-full px-4 pb-32 pt-4"
        style={{ WebkitOverflowScrolling: "touch" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {headerMode === "backOnly" ? (
          <div className="mb-4 flex items-center justify-start">
            <HeaderAction onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </HeaderAction>
          </div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-[44px_1fr_44px] items-center gap-2">
              <HeaderAction onClick={onClose}>
                <ArrowLeft className="h-5 w-5" />
              </HeaderAction>
              <div className="text-center text-[24px] font-semibold tracking-tight text-white">{title}</div>
              <div className="h-11 w-11" />
            </div>

            <div className="mx-auto mb-4 h-px w-full max-w-[300px] bg-gradient-to-r from-transparent via-white/6 to-transparent" />
          </>
        )}

        <div className="space-y-3">
          {children}
          {footer}
        </div>
      </div>
    </Screen>
  );
}

function BottomBar({ active, onChange, searchOpen }: { active: string; onChange: (id: string) => void; searchOpen: boolean }) {
  return (
    <div className="fixed bottom-8 left-1/2 z-30 w-[calc(100%-24px)] max-w-[396px] -translate-x-1/2">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#111317]/92 p-2 backdrop-blur-[28px] shadow-[0_18px_50px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="grid grid-cols-5 gap-1.5">
          {bottomNav.map((item) => {
            const isActive = active === item.id;
            const showSearchState = item.id === "crm" && isActive;
            const Icon = showSearchState ? Search : item.icon;
            const label = showSearchState ? "Поиск" : item.label;

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.985, y: 1 }}
                onClick={() => onChange(item.id)}
                className={[
                  "relative overflow-hidden rounded-[20px] px-2 py-2.5 text-[10px] transition-all",
                  isActive ? "text-white" : "text-white/38",
                ].join(" ")}
              >
                {isActive && !searchOpen && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(242,204,122,0.16),rgba(255,255,255,0.04)_90%)] shadow-[0_12px_24px_rgba(242,204,122,0.12)]" />
                    <div className="pointer-events-none absolute left-1/2 top-[-2px] h-px w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </>
                )}
                {isActive && searchOpen && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(242,204,122,0.18),rgba(255,255,255,0.03)_90%)] shadow-[0_12px_24px_rgba(242,204,122,0.14)]" />
                    <div className="pointer-events-none absolute left-1/2 top-[-2px] h-px w-14 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#F2CC7A] to-transparent" />
                  </>
                )}
                <div className="relative flex flex-col items-center justify-center">
                  <Icon className={["mb-1 h-4 w-4", isActive ? "text-[#E8C67B]" : "text-white/38"].join(" ")} />
                  {label}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <Screen>
      <div className="relative px-4 pb-28 pt-4">
        <div className="mb-4">
          <div className="text-[22px] font-semibold tracking-tight">Дашборд</div>
          <div className="mt-1 text-xs text-white/38">Обзор, фокус и проблемные точки</div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          {[
            ["Активные сделки", "22"],
            ["Потенциал", "67,4 млн ₽"],
            ["Показы", "11"],
            ["Закрыто", "4"],
          ].map(([label, value], index) => (
            <Surface
              key={label}
              className={index === 0 ? "bg-[linear-gradient(180deg,rgba(242,204,122,0.12),rgba(255,255,255,0.03)_38%,rgba(255,255,255,0.02))]" : "bg-[#121418]"}
            >
              <CardContent className="p-4">
                <div className="text-[11px] text-white/36">{label}</div>
                <div className="mt-3 text-xl font-medium text-white">{value}</div>
              </CardContent>
            </Surface>
          ))}
        </div>

        <Surface className="mb-3 bg-[#121418]">
          <CardContent className="p-4">
            <div className="mb-2 text-xs text-white/36">Фокус сегодня</div>
            <div className="space-y-2 text-sm text-white/68">
              <div>• 5 собственников без ответа</div>
              <div>• 2 объекта просели по звонкам</div>
              <div>• 1 сделка зависла на переговорах</div>
            </div>
          </CardContent>
        </Surface>

        <Surface className="border-[#4A3022] bg-[linear-gradient(180deg,rgba(214,160,122,0.10),rgba(255,255,255,0.02)_36%,rgba(255,255,255,0.02))]">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2 text-[13px] text-[#D8A27C]">
              <AlertTriangle className="h-4 w-4" />
              Проблемы
            </div>
            <div className="space-y-2 text-sm text-white/64">
              <div>• Жалоба по объявлению на ЦИАН</div>
              <div>• Просадка показов на Авито</div>
            </div>
          </CardContent>
        </Surface>
      </div>
    </Screen>
  );
}

function TasksScreen({ onOpenCreate }: { onOpenCreate: () => void }) {
  const [selectedTaskGroup, setSelectedTaskGroup] = useState("overdue");
  const taskTouchStartX = useRef<number | null>(null);
  const taskTabsRef = useRef<HTMLDivElement | null>(null);

  const taskGroups = [
    {
      id: "overdue",
      title: "Просроченные",
      accent: "text-[#F2A27A]",
      items: [
        {
          title: "Перезвонить собственнику по Ривер Парку",
          time: "Вчера · 18:30",
          tone: "text-[#F2A27A]",
        },
        {
          title: "Проверить жалобу на ЦИАН",
          time: "Сегодня · срочно",
          tone: "text-[#F2A27A]",
        },
      ],
    },
    {
      id: "upcoming",
      title: "Ближайшие",
      accent: "text-[#E8C67B]",
      items: [
        {
          title: "Назначить показ White Loft",
          time: "Сегодня · 19:30",
          tone: "text-white/44",
        },
        {
          title: "Отправить подбор клиенту",
          time: "Сегодня · 21:00",
          tone: "text-white/44",
        },
      ],
    },
    {
      id: "later",
      title: "Потом",
      accent: "text-white/54",
      items: [
        {
          title: "Обновить описание объекта",
          time: "Завтра",
          tone: "text-white/38",
        },
        {
          title: "Сверить цены по аренде",
          time: "Завтра · после обеда",
          tone: "text-white/38",
        },
      ],
    },
  ] as const;

  const activeTaskGroup = taskGroups.find((group) => group.id === selectedTaskGroup) ?? taskGroups[0];

  useEffect(() => {
    const container = taskTabsRef.current;
    const activeIndex = taskGroups.findIndex((group) => group.id === selectedTaskGroup);

    if (!container || activeIndex < 0) {
      return;
    }

    const activeButton = container.children[activeIndex] as HTMLElement | undefined;
    if (!activeButton) {
      return;
    }

    const nextLeft = activeButton.offsetLeft - 12;
    container.scrollTo({ left: Math.max(0, nextLeft), behavior: "smooth" });
  }, [selectedTaskGroup]);

  const handleTaskGroupStep = (direction: "prev" | "next") => {
    const currentIndex = taskGroups.findIndex((group) => group.id === selectedTaskGroup);
    if (currentIndex < 0) {
      return;
    }

    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    const nextGroup = taskGroups[nextIndex];

    if (nextGroup) {
      setSelectedTaskGroup(nextGroup.id);
    }
  };

  const handleTaskTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    taskTouchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTaskTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (taskTouchStartX.current === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? taskTouchStartX.current;
    const deltaX = taskTouchStartX.current - endX;
    taskTouchStartX.current = null;

    if (Math.abs(deltaX) < 44) {
      return;
    }

    handleTaskGroupStep(deltaX > 0 ? "next" : "prev");
  };

  return (
    <Screen>
      <div className="relative min-h-[calc(100dvh-140px)] px-4 pb-32 pt-4">
        <div className="mb-4">
          <div className="text-center text-[24px] font-semibold tracking-tight text-white">Задачи</div>
          <div className="mx-auto mt-3 h-px w-full max-w-[300px] bg-gradient-to-r from-transparent via-white/6 to-transparent" />
        </div>

        <div
          ref={taskTabsRef}
          className="relative z-20 mb-4 overflow-x-auto pb-2 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max gap-2.5 pr-4">
            {taskGroups.map((group) => {
              const active = group.id === activeTaskGroup.id;

              return (
                <button
                  type="button"
                  key={group.id}
                  onClick={() => setSelectedTaskGroup(group.id)}
                  className={[
                    "relative shrink-0 min-w-[146px] rounded-[20px] border px-4 py-3 text-left transition-all",
                    active
                      ? "border-[#E8C67B]/55 bg-[linear-gradient(180deg,rgba(232,198,123,0.18),rgba(28,24,18,0.92)_42%,rgba(18,20,24,0.96))] shadow-[0_16px_28px_rgba(232,198,123,0.14)]"
                      : "border-white/8 bg-[#15191F]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className={["text-[14px] font-medium", active ? "text-[#F7D992]" : "text-white/78"].join(" ")}>
                      {group.title}
                    </div>
                    <div className={["text-[12px] font-medium leading-none", active ? "text-[#F7D992]/80" : "text-white/30"].join(" ")}>
                      {group.items.length}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden" onTouchStart={handleTaskTouchStart} onTouchEnd={handleTaskTouchEnd}>
          <div className="space-y-3">
            {activeTaskGroup.items.map((item) => {
                const stripeClass =
                  activeTaskGroup.id === "overdue"
                    ? "bg-[#FF6B6B]"
                    : activeTaskGroup.id === "upcoming"
                      ? "bg-[#F0CF84]"
                      : "bg-[#7CCF8A]";

                const taskToneClass =
                  activeTaskGroup.id === "overdue"
                    ? "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(18,20,24,0.96)_42%,rgba(18,20,24,0.96))] shadow-[0_16px_30px_rgba(255,107,107,0.08)]"
                    : activeTaskGroup.id === "upcoming"
                      ? "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(18,20,24,0.96)_42%,rgba(18,20,24,0.96))] shadow-[0_16px_30px_rgba(240,207,132,0.08)]"
                      : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(18,20,24,0.96)_42%,rgba(18,20,24,0.96))] shadow-[0_16px_30px_rgba(124,207,138,0.08)]";

                const iconToneClass =
                  activeTaskGroup.id === "overdue"
                    ? "text-[#FF6B6B]"
                    : activeTaskGroup.id === "upcoming"
                      ? "text-[#F0CF84]"
                      : "text-[#7CCF8A]";

                return (
                <Surface key={item.title} className={taskToneClass}>
                  <CardContent className="relative flex items-center justify-between p-4">
                    <div className={`absolute bottom-4 left-0 top-4 w-1 rounded-r-full ${stripeClass}`} />
                    <div>
                      <div className="text-sm text-white">{item.title}</div>
                      <div className={`mt-1 text-xs ${item.tone}`}>{item.time}</div>
                    </div>
                    <CheckCircle2 className={`h-4 w-4 ${iconToneClass}`} />
                  </CardContent>
                </Surface>
              )})}
          </div>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={onOpenCreate}
          className="absolute bottom-3 right-2 z-20 flex h-12 w-12 items-center justify-center text-[#E8C67B]"
          aria-label="Добавить задачу"
        >
          <Plus className="h-7 w-7 drop-shadow-[0_0_12px_rgba(232,198,123,0.22)]" />
        </motion.button>
      </div>
    </Screen>
  );
}

function PropertyScenarioScreen({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (scenario: PropertyCreateScenario) => void;
}) {
  const scenarios: Array<{ label: string; scenario: PropertyCreateScenario; available: boolean }> = [
    {
      label: "Аренда · Жилая",
      scenario: { dealType: "rent", segment: "residential" },
      available: true,
    },
    {
      label: "Продажа · Жилая",
      scenario: { dealType: "sale", segment: "residential" },
      available: false,
    },
    {
      label: "Аренда · Коммерция",
      scenario: { dealType: "rent", segment: "commercial" },
      available: false,
    },
    {
      label: "Продажа · Коммерция",
      scenario: { dealType: "sale", segment: "commercial" },
      available: false,
    },
  ];

  return (
    <FormScreenShell title="Новый объект" onClose={onClose} footer={<div className="h-4" />}>
      <div className="space-y-4">
        <Surface className="rounded-[24px] border-white/[0.08] bg-[#10161E]">
          <CardContent className="space-y-4 p-4">
            <div className="space-y-1">
              <div className="text-[18px] font-semibold text-white">Сценарий объекта</div>
              <div className="text-[13px] leading-5 text-white/48">
                Выбираешь готовый сценарий, дальше открывается нужная форма объекта.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {scenarios.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={!item.available}
                  onClick={() => {
                    if (!item.available || !isSupportedPropertyScenario(item.scenario)) {
                      return;
                    }

                    onSelect(item.scenario);
                  }}
                  className={[
                    "rounded-[18px] border px-4 py-4 text-left transition-all",
                    item.available
                      ? "border-[#E8C67B]/28 bg-[linear-gradient(180deg,rgba(232,198,123,0.14),rgba(255,255,255,0.02)_100%)]"
                      : "cursor-not-allowed border-white/8 bg-[#141922] opacity-60",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className={item.available ? "text-[15px] font-medium text-[#F7D992]" : "text-[15px] font-medium text-white/72"}>
                        {item.label}
                      </div>
                      <div className="text-[12px] text-white/42">
                        {item.available ? "Открывает текущую форму заполнения" : "Закрыто, добавим отдельную форму"}
                      </div>
                    </div>
                    {item.available ? (
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#F7D992]" />
                    ) : (
                      <span className="text-[11px] font-medium text-white/28">Скоро</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-[18px] border border-[#E8C67B]/16 bg-[linear-gradient(180deg,rgba(232,198,123,0.08),rgba(255,255,255,0.02)_100%)] px-4 py-3 text-[13px] leading-5 text-white/58">
              Сейчас открыта ветка по XML ЦИАН: <span className="font-medium text-[#F7D992]">Аренда · Жилая · flatRent</span>.
            </div>
          </CardContent>
        </Surface>
      </div>
    </FormScreenShell>
  );
}

function PropertyCreateScreen({
  onClose,
  onCreated,
  onAddOwner,
  linkedOwner,
  initialDraft,
  onDraftChange,
  ownerOptions,
  scenario,
}: {
  onClose: () => void;
  onCreated: (result: PropertyCreateResult) => void;
  onAddOwner: () => void;
  linkedOwner?: PropertyOwnerOption | null;
  initialDraft?: PropertyFormState | null;
  onDraftChange?: (draft: PropertyFormState) => void;
  ownerOptions: PropertyOwnerOption[];
  scenario?: PropertyCreateScenario | null;
}) {
  const createInitialForm = () => {
    const next = initialDraft ? clonePropertyForm(initialDraft) : initialPropertyForm();

    if (linkedOwner) {
      next.ownerId = linkedOwner.id;
      next.ownerLabel = [linkedOwner.name, linkedOwner.phone].filter(Boolean).join(" · ");
    }

    return next;
  };

  const [form, setForm] = useState<PropertyFormState>(() => createInitialForm());
  const [openSections, setOpenSections] = useState(initialPropertySections);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [photoUploadError, setPhotoUploadError] = useState("");
  const [photosUploading, setPhotosUploading] = useState(false);
  const [openLocationExtras, setOpenLocationExtras] = useState(false);
  const [openLayoutExtras, setOpenLayoutExtras] = useState(false);
  const [openMediaExtras, setOpenMediaExtras] = useState(false);
  const [addressQuery, setAddressQuery] = useState(() => composePropertyAddress(createInitialForm().location));
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [addressSuggestOpen, setAddressSuggestOpen] = useState(false);
  const [addressSuggestLoading, setAddressSuggestLoading] = useState(false);
  const [addressSuggestError, setAddressSuggestError] = useState("");
  const [addressSuggestInteracted, setAddressSuggestInteracted] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const skipAddressSuggestRequestRef = useRef(false);
  const latestAddressSuggestRequestRef = useRef(0);

  useEffect(() => {
    if (!linkedOwner || form.ownerId === linkedOwner.id) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      ownerId: linkedOwner.id,
      ownerLabel: [linkedOwner.name, linkedOwner.phone].filter(Boolean).join(" · "),
    }));
  }, [form.ownerId, linkedOwner]);

  useEffect(() => {
    onDraftChange?.(form);
  }, [form, onDraftChange]);

  useEffect(() => {
    const query = addressQuery.trim();

    if (skipAddressSuggestRequestRef.current) {
      skipAddressSuggestRequestRef.current = false;
      return;
    }

    if (query.length < 3) {
      setAddressSuggestions([]);
      setAddressSuggestOpen(false);
      setAddressSuggestLoading(false);
      setAddressSuggestError("");
      return;
    }

    const requestId = latestAddressSuggestRequestRef.current + 1;
    latestAddressSuggestRequestRef.current = requestId;
    setAddressSuggestLoading(true);
    setAddressSuggestError("");

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await postJson<{ suggestions: AddressSuggestion[] }>("/api/address/suggest", { query });

        if (latestAddressSuggestRequestRef.current !== requestId) {
          return;
        }

        setAddressSuggestions(response.suggestions ?? []);
        setAddressSuggestOpen(addressSuggestInteracted);
      } catch (error) {
        if (latestAddressSuggestRequestRef.current !== requestId) {
          return;
        }

        setAddressSuggestions([]);
        setAddressSuggestOpen(addressSuggestInteracted);
        setAddressSuggestError(error instanceof Error ? error.message : "Не удалось получить подсказки адреса");
      } finally {
        if (latestAddressSuggestRequestRef.current === requestId) {
          setAddressSuggestLoading(false);
        }
      }
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [addressQuery, addressSuggestInteracted]);

  const ownerSelectOptions = useMemo(
    () =>
      ownerOptions.map((owner) => ({
        id: owner.id,
        label: [owner.name, owner.phone].filter(Boolean).join(" · "),
      })),
    [ownerOptions],
  );

  const setBasicField = <K extends keyof PropertyFormState["basicInfo"]>(
    field: K,
    value: PropertyFormState["basicInfo"][K],
  ) => {
    setForm((previous) => ({
      ...previous,
      basicInfo: {
        ...previous.basicInfo,
        [field]: value,
      },
    }));
  };

  const setLocationField = <K extends keyof PropertyFormState["location"]>(
    field: K,
    value: PropertyFormState["location"][K],
  ) => {
    setForm((previous) => ({
      ...previous,
      location: {
        ...previous.location,
        [field]: value,
      },
    }));
  };

  const setPricingField = <K extends keyof PropertyFormState["pricing"]>(
    field: K,
    value: PropertyFormState["pricing"][K],
  ) => {
    setForm((previous) => ({
      ...previous,
      pricing: {
        ...previous.pricing,
        [field]: value,
      },
    }));
  };

  const setLayoutField = <K extends keyof PropertyFormState["layout"]>(
    field: K,
    value: PropertyFormState["layout"][K],
  ) => {
    setForm((previous) => ({
      ...previous,
      layout: {
        ...previous.layout,
        [field]: value,
      },
    }));
  };

  const setInteriorField = <K extends keyof PropertyFormState["interior"]>(
    field: K,
    value: PropertyFormState["interior"][K],
  ) => {
    setForm((previous) => ({
      ...previous,
      interior: {
        ...previous.interior,
        [field]: value,
      },
    }));
  };

  const setBuildingField = <K extends keyof PropertyFormState["building"]>(
    field: K,
    value: PropertyFormState["building"][K],
  ) => {
    setForm((previous) => ({
      ...previous,
      building: {
        ...previous.building,
        [field]: value,
      },
    }));
  };

  const setMediaField = <K extends keyof PropertyFormState["media"]>(
    field: K,
    value: PropertyFormState["media"][K],
  ) => {
    setForm((previous) => ({
      ...previous,
      media: {
        ...previous.media,
        [field]: value,
      },
    }));
  };

  const setPublicationField = <K extends keyof PropertyFormState["publication"]>(
    field: K,
    value: PropertyFormState["publication"][K],
  ) => {
    setForm((previous) => ({
      ...previous,
      publication: {
        ...previous.publication,
        [field]: value,
      },
    }));
  };

  const setCrmMetaField = <K extends keyof PropertyFormState["crmMeta"]>(
    field: K,
    value: PropertyFormState["crmMeta"][K],
  ) => {
    setForm((previous) => ({
      ...previous,
      crmMeta: {
        ...previous.crmMeta,
        [field]: value,
      },
    }));
  };

  const toggleSection = (sectionId: keyof typeof openSections) => {
    setOpenSections((previous) => ({ ...previous, [sectionId]: !previous[sectionId] }));
  };

  const toggleInteriorFlag = (field: keyof PropertyFormState["interior"]) => {
    setForm((previous) => ({
      ...previous,
      interior: {
        ...previous.interior,
        [field]: !previous.interior[field],
      },
    }));
  };

  const toggleBuildingFlag = (field: keyof PropertyFormState["building"]) => {
    setForm((previous) => ({
      ...previous,
      building: {
        ...previous.building,
        [field]: !previous.building[field],
      },
    }));
  };

  const toggleParkingType = (value: (typeof parkingTypeOptions)[number]["value"]) => {
    setForm((previous) => {
      const nextTypes = previous.building.parkingTypes.includes(value)
        ? previous.building.parkingTypes.filter((item) => item !== value)
        : [...previous.building.parkingTypes, value];

      return {
        ...previous,
        building: {
          ...previous.building,
          parkingTypes: nextTypes,
        },
      };
    });
  };

  const propertyFieldErrors = {
    ownerId: form.ownerId ? "" : "Выбери собственника",
    internalTitle: form.basicInfo.internalTitle.trim() ? "" : "Укажи краткое название объекта",
    city: form.location.city.trim() ? "" : "Укажи город",
    street: form.location.street.trim() ? "" : "Укажи улицу",
    houseNumber: form.location.houseNumber.trim() ? "" : "Укажи дом",
    rentPrice: form.pricing.rentPrice.trim() ? "" : "Укажи цену аренды",
    photos: form.media.photos.length > 0 ? "" : "Добавь минимум одну фотографию",
    externalId: form.publication.externalId.trim() ? "" : "Укажи внешний ID",
  };

  const propertyMissingLabels = [
    propertyFieldErrors.ownerId ? "собственника" : "",
    propertyFieldErrors.internalTitle ? "название" : "",
    propertyFieldErrors.city ? "город" : "",
    propertyFieldErrors.street ? "улицу" : "",
    propertyFieldErrors.houseNumber ? "дом" : "",
    propertyFieldErrors.rentPrice ? "цену" : "",
    propertyFieldErrors.photos ? "фото" : "",
    propertyFieldErrors.externalId ? "внешний ID" : "",
  ].filter(Boolean);

  const propertyCanSave = propertyMissingLabels.length === 0;

  const handleOwnerSelect = (label: string) => {
    const selectedOwner = ownerSelectOptions.find((owner) => owner.label === label);

    setForm((previous) => ({
      ...previous,
      ownerId: selectedOwner?.id ?? "",
      ownerLabel: label,
    }));

    setOpenDropdown(null);
  };

  const handleAddressSuggestionSelect = (suggestion: AddressSuggestion) => {
    const city =
      suggestion.data.city.trim() ||
      suggestion.data.settlement.trim() ||
      suggestion.data.region.trim();
    const blockType = suggestion.data.blockTypeFull.trim().toLowerCase();
    const isBuilding = blockType.includes("корп");
    const isBlock = blockType.includes("стро");

    skipAddressSuggestRequestRef.current = true;
    setAddressQuery(suggestion.value);
    setAddressSuggestOpen(false);
    setAddressSuggestInteracted(false);
    setAddressSuggestError("");
    setForm((previous) => ({
      ...previous,
      location: {
        ...previous.location,
        city,
        street: suggestion.data.streetWithType.trim() || suggestion.data.street.trim(),
        houseNumber: suggestion.data.house.trim(),
        buildingNumber: isBuilding ? suggestion.data.block.trim() : "",
        blockNumber: isBlock ? suggestion.data.block.trim() : "",
        lat: suggestion.data.geoLat.trim(),
        lng: suggestion.data.geoLon.trim(),
      },
    }));

    void (async () => {
      try {
        const response = await postJson<CleanAddressResponse>("/api/address/clean", {
          query: suggestion.unrestrictedValue || suggestion.value,
        });

        const firstMetro = response.address?.metro?.find((station) => station.name)?.name?.trim() ?? "";
        const entrance = response.address?.entrance?.trim() ?? "";

        setForm((previous) => ({
          ...previous,
          location: {
            ...previous.location,
            undergroundStation: firstMetro,
            entranceNumber: entrance || previous.location.entranceNumber,
          },
        }));
      } catch {
        // ignore clean enrichment errors to avoid blocking address selection
      }
    })();
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    try {
      setPhotosUploading(true);
      setPhotoUploadError("");

      const payload = new FormData();
      Array.from(files).forEach((file) => {
        payload.append("photos", file);
      });

      const response = await postFormData<{ files: UploadedPhoto[] }>("/api/uploads/property-photos", payload);
      setForm((previous) => ({
        ...previous,
        media: {
          ...previous.media,
          photos: [...previous.media.photos, ...response.files],
        },
      }));
    } catch (error) {
      setPhotoUploadError(error instanceof Error ? error.message : "Не удалось загрузить фотографии");
    } finally {
      setPhotosUploading(false);

      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    }
  };

  const handlePhotoRemove = async (photoPath: string) => {
    setForm((previous) => ({
      ...previous,
      media: {
        ...previous.media,
        photos: previous.media.photos.filter((photo) => photo.path !== photoPath),
      },
    }));

    try {
      await deleteJson("/api/uploads/property-photos", { paths: [photoPath] });
    } catch (error) {
      setPhotoUploadError(error instanceof Error ? error.message : "Не удалось удалить фотографию");
    }
  };

  const handleSave = async () => {
    if (!propertyCanSave) {
      setOpenSections((previous) => ({
        ...previous,
        basic: previous.basic || Boolean(propertyFieldErrors.ownerId || propertyFieldErrors.internalTitle),
        location: previous.location || Boolean(propertyFieldErrors.city || propertyFieldErrors.street || propertyFieldErrors.houseNumber),
        pricing: previous.pricing || Boolean(propertyFieldErrors.rentPrice),
        media: previous.media || Boolean(propertyFieldErrors.photos),
        publication: previous.publication || Boolean(propertyFieldErrors.externalId),
      }));
      setSaveError(`Заполни обязательные поля: ${propertyMissingLabels.join(", ")}`);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError("");

      const response = await postJson<{ property?: { id?: string | number } }>("/api/properties", form);
      const propertyTitle =
        form.basicInfo.internalTitle.trim() ||
        `${propertyTypeLabelMap[form.propertyType]}${form.layout.totalArea.trim() ? ` · ${form.layout.totalArea.trim()} м²` : ""}`;

      onCreated({
        propertyId: response?.property?.id ? String(response.property.id) : undefined,
        propertyTitle,
        card: {
          title: propertyTitle,
          price: form.pricing.rentPrice.trim() ? `${form.pricing.rentPrice.trim()} ₽/мес` : "Цена не указана",
          status: "Новый объект",
          person: formatPropertyLocationPreview(form.location) || "Адрес не заполнен",
          tag: "Объект",
        },
      });
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Не удалось сохранить объект");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormScreenShell
      title="Новый объект"
      onClose={onClose}
      footer={
        <div className="space-y-3">
          {saveError ? <div className="text-sm text-[#F2A27A]">{saveError}</div> : null}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 w-full rounded-[20px] border border-[#E8C67B]/20 bg-[linear-gradient(180deg,rgba(232,198,123,0.16),rgba(255,255,255,0.03)_100%)] text-[#F7D992] shadow-[0_16px_28px_rgba(0,0,0,0.20)] hover:bg-[linear-gradient(180deg,rgba(232,198,123,0.20),rgba(255,255,255,0.04)_100%)] disabled:opacity-60"
          >
            {isSaving ? "Сохраняем..." : "Сохранить объект"}
          </Button>
        </div>
      }
    >
      <Surface className="rounded-[24px] border-white/[0.08] bg-[#10161E]">
        <CardContent className="space-y-4 p-4">
          <div className="text-[14px] font-medium text-white">База</div>

          <Button
            type="button"
            onClick={onAddOwner}
            className="h-11 w-full rounded-[18px] border border-white/[0.08] bg-[#151D27] text-white hover:bg-[#1A2330]"
          >
            <Plus className="h-4 w-4" />
            Добавить собственника
          </Button>

          <SelectField
            label="Собственник"
            value={form.ownerLabel}
            placeholder={ownerOptions.length > 0 ? "Выбери собственника" : "Сначала создай собственника"}
            open={openDropdown === "owner"}
            onToggle={() => setOpenDropdown((current) => (current === "owner" ? null : "owner"))}
            onClose={() => setOpenDropdown(null)}
            onSelect={handleOwnerSelect}
            options={ownerSelectOptions.map((owner) => owner.label)}
            required
            error={propertyFieldErrors.ownerId}
          />
        </CardContent>
      </Surface>

      <FormSection title="Расположение" open={openSections.location} onToggle={() => toggleSection("location")}>
        <div className="space-y-4">
          <AddressSuggestField
            value={addressQuery}
            loading={addressSuggestLoading}
            error={addressSuggestError}
            open={addressSuggestOpen}
            suggestions={addressSuggestions}
            onFocus={() => {
              setAddressSuggestInteracted(true);
              const query = addressQuery.trim();
              const shouldOpen = query.length >= 3 && (addressSuggestions.length > 0 || addressSuggestLoading || Boolean(addressSuggestError));
              setAddressSuggestOpen(shouldOpen);
            }}
            onChange={(value) => {
              setAddressQuery(value);
              setAddressSuggestInteracted(true);
              setAddressSuggestError("");
            }}
            onSelect={handleAddressSuggestionSelect}
            onClose={() => {
              setAddressSuggestOpen(false);
              setAddressSuggestInteracted(false);
            }}
          />

          {form.location.undergroundStation.trim() ? (
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 sm:col-span-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="text-[12px] font-medium text-white/62">Метро</div>
                  </div>
                  <div className="flex h-11 items-center rounded-[18px] border border-[#E8C67B]/28 bg-[linear-gradient(180deg,rgba(232,198,123,0.12),rgba(255,255,255,0.02)_100%)] px-4 text-[14px] font-medium text-[#F5D893]">
                    м. {form.location.undergroundStation}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-12 gap-3">
            <FormField
              label="Город"
              value={form.location.city}
              onChange={(value) => setLocationField("city", value)}
              required
              error={propertyFieldErrors.city}
              className="col-span-4"
            />
            <FormField
              label="Улица"
              value={form.location.street}
              onChange={(value) => setLocationField("street", value)}
              required
              error={propertyFieldErrors.street}
              className="col-span-5"
            />
            <FormField
              label="Дом"
              value={form.location.houseNumber}
              onChange={(value) => setLocationField("houseNumber", value)}
              required
              error={propertyFieldErrors.houseNumber}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-12 gap-3">
            <FormField
              label="Этаж"
              value={form.location.floorNumber}
              onChange={(value) => setLocationField("floorNumber", value.replace(/[^\d]/g, ""))}
              className="col-span-3"
            />
            <FormField
              label="Этажей"
              value={form.location.totalFloors}
              onChange={(value) => setLocationField("totalFloors", value.replace(/[^\d]/g, ""))}
              className="col-span-5"
            />
            <FormField
              label="Подъезд"
              value={form.location.entranceNumber}
              onChange={(value) => setLocationField("entranceNumber", value)}
              className="col-span-4"
            />
          </div>

          <InlineAccordionSection
            title="Дополнительно"
            open={openLocationExtras}
            onToggle={() => setOpenLocationExtras((current) => !current)}
          >
            <div className="grid grid-cols-12 gap-3">
              <FormField
                label="ЖК"
                value={form.basicInfo.residentialComplexName}
                onChange={(value) => setBasicField("residentialComplexName", value)}
                placeholder="Название ЖК"
                className="col-span-12"
              />
            </div>

            <div className="grid grid-cols-12 gap-3">
              <FormField
                label="Корпус"
                value={form.location.buildingNumber}
                onChange={(value) => setLocationField("buildingNumber", value)}
                className="col-span-3"
              />
              <FormField
                label="Строение"
                value={form.location.blockNumber}
                onChange={(value) => setLocationField("blockNumber", value)}
                className="col-span-3"
              />
              <FormField
                label="Квартира"
                value={form.location.apartmentNumber}
                onChange={(value) => setLocationField("apartmentNumber", value)}
                className="col-span-6"
              />
            </div>

            <div className="grid grid-cols-12 gap-3">
              <FormField
                label="Кадастровый номер"
                value={form.location.cadastralNumber}
                onChange={(value) => setLocationField("cadastralNumber", value)}
                className="col-span-12"
              />
            </div>
          </InlineAccordionSection>
        </div>
      </FormSection>

      <FormSection title="Параметры квартиры" open={openSections.layout} onToggle={() => toggleSection("layout")}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {propertyTypeOptions.map((option) => (
              <FormChip
                key={option.value}
                active={form.propertyType === option.value}
                onClick={() => setForm((previous) => ({ ...previous, propertyType: option.value }))}
              >
                {option.label}
              </FormChip>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField
              label="Общая площадь"
              value={form.layout.totalArea}
              onChange={(value) => setLayoutField("totalArea", value.replace(/[^\d.,]/g, ""))}
              suffix="м²"
            />
            <FormField
              label="Жилая площадь"
              value={form.layout.livingArea}
              onChange={(value) => setLayoutField("livingArea", value.replace(/[^\d.,]/g, ""))}
              suffix="м²"
            />
            <FormField
              label="Кухня"
              value={form.layout.kitchenArea}
              onChange={(value) => setLayoutField("kitchenArea", value.replace(/[^\d.,]/g, ""))}
              suffix="м²"
            />
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Планировка</div>
            <div className="flex flex-wrap gap-2">
              {layoutTypeOptions.map((option) => (
                <FormChip
                  key={option.value}
                  active={form.layout.layoutType === option.value}
                  onClick={() => setLayoutField("layoutType", option.value)}
                >
                  {option.label}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <FormChip active={form.layout.isStudio} onClick={() => setLayoutField("isStudio", !form.layout.isStudio)}>
              Студия
            </FormChip>
            <FormChip active={form.layout.isFreeLayout} onClick={() => setLayoutField("isFreeLayout", !form.layout.isFreeLayout)}>
              Свободная планировка
            </FormChip>
          </div>

          <InlineAccordionSection
            title="Дополнительно"
            open={openLayoutExtras}
            onToggle={() => setOpenLayoutExtras((current) => !current)}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                label="Высота потолков"
                value={form.layout.ceilingHeight}
                onChange={(value) => setLayoutField("ceilingHeight", value.replace(/[^\d.,]/g, ""))}
                suffix="м"
              />
              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Вид из окна</div>
                <div className="flex flex-wrap gap-2">
                  {windowsViewOptions.map((option) => (
                    <FormChip
                      key={option.value}
                      active={form.layout.windowsView === option.value}
                      onClick={() => setLayoutField("windowsView", option.value)}
                    >
                      {option.label}
                    </FormChip>
                  ))}
                </div>
              </div>
            </div>

            <CounterField
              label="Балконов"
              value={form.layout.balconyCount}
              onChange={(delta) => setLayoutField("balconyCount", Math.max(0, form.layout.balconyCount + delta))}
            />
            <CounterField
              label="Лоджий"
              value={form.layout.loggiaCount}
              onChange={(delta) => setLayoutField("loggiaCount", Math.max(0, form.layout.loggiaCount + delta))}
            />
            <CounterField
              label="Санузел раздельный"
              value={form.layout.bathroomSeparateCount}
              onChange={(delta) => setLayoutField("bathroomSeparateCount", Math.max(0, form.layout.bathroomSeparateCount + delta))}
            />
            <CounterField
              label="Санузел совмещённый"
              value={form.layout.bathroomCombinedCount}
              onChange={(delta) => setLayoutField("bathroomCombinedCount", Math.max(0, form.layout.bathroomCombinedCount + delta))}
            />
          </InlineAccordionSection>
        </div>
      </FormSection>

      <FormSection title="Особенности и оснащения" open={openSections.interior} onToggle={() => toggleSection("interior")}>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Ремонт</div>
            <div className="flex flex-wrap gap-2">
              {repairTypeOptions.map((option) => (
                <FormChip
                  key={option.value}
                  active={form.interior.repairType === option.value}
                  onClick={() => setInteriorField("repairType", option.value)}
                >
                  {option.label}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Мебель</div>
            <div className="flex flex-wrap gap-2">
              {furnitureModeOptions.map((option) => (
                <FormChip
                  key={option.value}
                  active={form.interior.furnitureMode === option.value}
                  onClick={() => setInteriorField("furnitureMode", option.value)}
                >
                  {option.label}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Ванная</div>
            <div className="flex flex-wrap gap-2">
              <FormChip active={form.interior.hasBath} onClick={() => toggleInteriorFlag("hasBath")}>
                Ванна
              </FormChip>
              <FormChip active={form.interior.hasShower} onClick={() => toggleInteriorFlag("hasShower")}>
                Душевая кабина
              </FormChip>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Техника</div>
            <div className="flex flex-wrap gap-2">
              <FormChip active={form.interior.hasConditioner} onClick={() => toggleInteriorFlag("hasConditioner")}>
                Кондиционер
              </FormChip>
              <FormChip active={form.interior.hasRefrigerator} onClick={() => toggleInteriorFlag("hasRefrigerator")}>
                Холодильник
              </FormChip>
              <FormChip active={form.interior.hasDishwasher} onClick={() => toggleInteriorFlag("hasDishwasher")}>
                Посудомоечная машина
              </FormChip>
              <FormChip active={form.interior.hasTv} onClick={() => toggleInteriorFlag("hasTv")}>
                Телевизор
              </FormChip>
              <FormChip active={form.interior.hasWasher} onClick={() => toggleInteriorFlag("hasWasher")}>
                Стиральная машина
              </FormChip>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Ещё</div>
            <div className="flex flex-wrap gap-2">
              <FormChip active={form.interior.hasWardrobeRoom} onClick={() => toggleInteriorFlag("hasWardrobeRoom")}>
                Гардеробная
              </FormChip>
              <FormChip active={form.interior.hasStorageRoom} onClick={() => toggleInteriorFlag("hasStorageRoom")}>
                Кладовая
              </FormChip>
              <FormChip active={form.interior.hasPanoramicWindows} onClick={() => toggleInteriorFlag("hasPanoramicWindows")}>
                Панорамные окна
              </FormChip>
              <FormChip active={form.interior.hasTerrace} onClick={() => toggleInteriorFlag("hasTerrace")}>
                Терраса
              </FormChip>
              <FormChip active={form.interior.hasFireplace} onClick={() => toggleInteriorFlag("hasFireplace")}>
                Камин
              </FormChip>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Дом / подъезд" open={openSections.building} onToggle={() => toggleSection("building")}>
        <div className="space-y-4">
          <CounterField
            label="Пассажирских лифтов"
            value={form.building.passengerLiftsCount}
            onChange={(delta) => setBuildingField("passengerLiftsCount", Math.max(0, form.building.passengerLiftsCount + delta))}
          />
          <CounterField
            label="Грузовых лифтов"
            value={form.building.cargoLiftsCount}
            onChange={(delta) => setBuildingField("cargoLiftsCount", Math.max(0, form.building.cargoLiftsCount + delta))}
          />

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Подъезд</div>
            <div className="flex flex-wrap gap-2">
              <FormChip active={form.building.hasRamp} onClick={() => toggleBuildingFlag("hasRamp")}>
                Пандус
              </FormChip>
              <FormChip active={form.building.hasGarbageChute} onClick={() => toggleBuildingFlag("hasGarbageChute")}>
                Мусоропровод
              </FormChip>
              <FormChip active={form.building.hasConcierge} onClick={() => toggleBuildingFlag("hasConcierge")}>
                Консьерж
              </FormChip>
              <FormChip active={form.building.hasSecurity} onClick={() => toggleBuildingFlag("hasSecurity")}>
                Охрана
              </FormChip>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Парковка</div>
            <div className="flex flex-wrap gap-2">
              {parkingTypeOptions.map((option) => (
                <FormChip
                  key={option.value}
                  active={form.building.parkingTypes.includes(option.value)}
                  onClick={() => toggleParkingType(option.value)}
                >
                  {option.label}
                </FormChip>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Описание" open={openSections.publication} onToggle={() => toggleSection("publication")}>
        <div className="space-y-4">
          <FormField
            label="Краткое название объекта"
            value={form.basicInfo.internalTitle}
            onChange={(value) => setBasicField("internalTitle", value)}
            placeholder="Например 2к River Park 180к"
            required
            error={propertyFieldErrors.internalTitle}
          />

          <FormField
            label="Полное описание"
            value={form.basicInfo.fullDescription}
            onChange={(value) => setBasicField("fullDescription", value)}
            placeholder="Полное описание для сайта и выгрузки"
            multiline
          />
        </div>
      </FormSection>

      <FormSection title="Медиа" open={openSections.media} onToggle={() => toggleSection("media")}>
        <div className="space-y-4">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            className="hidden"
            onChange={(event) => handlePhotoUpload(event.target.files)}
          />

          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={photosUploading}
            className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-dashed border-white/12 bg-[#141922] px-4 py-4 text-[14px] font-medium text-white/78 transition-all hover:border-[#E8C67B]/36 hover:text-white disabled:opacity-60"
          >
            <ImagePlus className="h-4 w-4 text-[#E8C67B]" />
            {photosUploading ? "Загружаем фотографии..." : "Загрузить фотографии"}
          </button>

          {photoUploadError ? <div className="text-sm text-[#F2A27A]">{photoUploadError}</div> : null}
          {propertyFieldErrors.photos ? <div className="text-sm text-[#F2A27A]">{propertyFieldErrors.photos}</div> : null}

          {form.media.photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {form.media.photos.map((photo) => (
                <div key={photo.path} className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[#141922]">
                  <img src={photo.publicUrl} alt={photo.name} className="h-24 w-full object-cover" loading="lazy" />
                  <button
                    type="button"
                    onClick={() => handlePhotoRemove(photo.path)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white/80 backdrop-blur"
                    aria-label={`Удалить ${photo.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <InlineAccordionSection
            title="Дополнительно"
            open={openMediaExtras}
            onToggle={() => setOpenMediaExtras((current) => !current)}
          >
            <div className="grid grid-cols-1 gap-3">
              <FormField
                label="Видео"
                value={form.media.videoUrl}
                onChange={(value) => setMediaField("videoUrl", value)}
                placeholder="https://..."
              />
              <FormField
                label="Ссылка на VK видео"
                value={form.media.vkVideoUrl}
                onChange={(value) => setMediaField("vkVideoUrl", value)}
                placeholder="https://..."
              />
              <FormField
                label="3D тур"
                value={form.media.tour3dUrl}
                onChange={(value) => setMediaField("tour3dUrl", value)}
                placeholder="https://..."
              />
              <FormField
                label="Планировка"
                value={form.media.layoutImageUrl}
                onChange={(value) => setMediaField("layoutImageUrl", value)}
                placeholder="https://..."
              />
            </div>
          </InlineAccordionSection>
        </div>
      </FormSection>

      <FormSection title="Цена и условия" open={openSections.pricing} onToggle={() => toggleSection("pricing")}>
        <div className="space-y-4">
          <FormField
            label="Цена аренды"
            value={form.pricing.rentPrice}
            onChange={(value) => setPricingField("rentPrice", value.replace(/[^\d\s]/g, ""))}
            suffix="₽"
            required
            error={propertyFieldErrors.rentPrice}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              label="Залог / депозит"
              value={form.pricing.depositAmount}
              onChange={(value) => setPricingField("depositAmount", value.replace(/[^\d\s]/g, ""))}
              suffix="₽"
            />
            <FormField
              label="Комиссия"
              value={form.pricing.commissionAmount}
              onChange={(value) => setPricingField("commissionAmount", value.replace(/[^\d\s]/g, ""))}
              suffix="%"
            />
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Коммунальные</div>
            <div className="flex flex-wrap gap-2">
              {utilitiesModeOptions.map((option) => (
                <FormChip
                  key={option.value}
                  active={form.pricing.utilitiesMode === option.value}
                  onClick={() => setPricingField("utilitiesMode", option.value)}
                >
                  {option.label}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Счётчики</div>
            <div className="flex flex-wrap gap-2">
              {meterModeOptions.map((option) => (
                <FormChip
                  key={option.value}
                  active={form.pricing.meterMode === option.value}
                  onClick={() => setPricingField("meterMode", option.value)}
                >
                  {option.label}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Предоплата, месяцев</div>
            <div className="flex flex-wrap gap-2">
              {prepaymentMonthOptions.map((option) => (
                <FormChip
                  key={option}
                  active={form.pricing.prepaymentMonths === option}
                  onClick={() => setPricingField("prepaymentMonths", option)}
                >
                  {option}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Минимальный срок аренды, месяцев</div>
            <div className="flex flex-wrap gap-2">
              {minimumTermOptions.map((option) => (
                <FormChip
                  key={option}
                  active={form.pricing.minimumRentTermMonths === option}
                  onClick={() => setPricingField("minimumRentTermMonths", option)}
                >
                  {option}
                </FormChip>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

    </FormScreenShell>
  );
}

function OwnerCreateScreen({
  onClose,
  onCreated,
  onOpenCreateObject,
}: {
  onClose: () => void;
  onCreated: (payload: { stageId: string; card: OwnerCrmCard; ownerOption: PropertyOwnerOption }) => void;
  onOpenCreateObject: (owner: PropertyOwnerOption) => void;
}) {
  const ownerStageOptions = useMemo(
    () => funnelCatalog.find((funnel) => funnel.id === "collection")?.stages ?? [],
    [],
  );

  const initialOwnerForm = useMemo<OwnerFormState>(
    () => ({
      fullName: "",
      phone: "",
      phoneType: "Неизвестно",
      comment: "",
      stageKey: ownerStageOptions[0]?.id ?? "no-answer",
      nextAction: "Нет действий",
      nextActionDate: "",
      nextActionTime: "",
      agentExperience: "",
      clientOnlyState: "",
      leadsState: "",
      showingsState: "",
      commissionPercent: "",
      cooperationState: "",
      duplicateState: "",
      exclusiveState: "",
      dealType: "Аренда",
      objectAddress: "",
      objectComplex: "",
      objectPrice: "",
      objectLink: "",
      returnDate: "",
    }),
    [ownerStageOptions],
  );

  const [form, setForm] = useState<OwnerFormState>(initialOwnerForm);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openOwnerSections, setOpenOwnerSections] = useState({
    diagnostics: false,
    object: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const ownerCommentRef = useRef<HTMLTextAreaElement | null>(null);
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  const timePickerRef = useRef<HTMLInputElement | null>(null);

  const setField = <K extends keyof OwnerFormState>(field: K, value: OwnerFormState[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const toggleOwnerSection = (section: "diagnostics" | "object") => {
    setOpenOwnerSections((previous) => ({ ...previous, [section]: !previous[section] }));
  };

  const ownerFieldErrors = {
    fullName: form.fullName.trim() ? "" : "Укажи имя собственника",
    phone: !form.phone.trim()
      ? "Укажи номер телефона"
      : hasCompleteRussianPhone(form.phone)
        ? ""
        : "Укажи корректный номер телефона",
    stageKey: form.stageKey.trim() ? "" : "Выбери статус",
    nextAction: form.nextAction.trim() ? "" : "Выбери действие",
  };

  const objectInfoRequired = form.cooperationState === "Думает";
  const showCreateObjectAction = form.cooperationState === "Дубль" || form.cooperationState === "Эксклюзив";
  const objectFieldErrors = {
    objectAddress: objectInfoRequired && !form.objectAddress.trim() ? "Укажи адрес" : "",
    objectComplex: objectInfoRequired && !form.objectComplex.trim() ? "Укажи ЖК" : "",
    objectPrice: objectInfoRequired && !form.objectPrice.trim() ? "Укажи цену" : "",
    objectLink: objectInfoRequired && !form.objectLink.trim() ? "Укажи ссылку" : "",
  };

  const selectedStage = ownerStageOptions.find((stage) => stage.id === form.stageKey);
  const ownerMissingLabels = [
    !form.fullName.trim() ? "имя" : "",
    !form.phone.trim() ? "телефон" : "",
    !form.stageKey.trim() ? "статус" : "",
    !form.nextAction.trim() ? "действие" : "",
    objectInfoRequired && !form.objectAddress.trim() ? "адрес объекта" : "",
    objectInfoRequired && !form.objectComplex.trim() ? "ЖК" : "",
    objectInfoRequired && !form.objectPrice.trim() ? "цена объекта" : "",
    objectInfoRequired && !form.objectLink.trim() ? "ссылка на объект" : "",
  ].filter(Boolean);

  const ownerCanSave = ownerMissingLabels.length === 0;

  useEffect(() => {
    if (!ownerStageOptions.some((stage) => stage.id === form.stageKey)) {
      setField("stageKey", ownerStageOptions[0]?.id ?? "no-answer");
    }
  }, [form.stageKey, ownerStageOptions]);

  useEffect(() => {
    if (!form.nextAction || form.nextAction === "Нет действий") {
      setForm((previous) => ({
        ...previous,
        nextActionDate: "",
        nextActionTime: "",
      }));
    }
  }, [form.nextAction, setForm]);

  useEffect(() => {
    if (form.cooperationState === "Думает") {
      setOpenOwnerSections((previous) => ({ ...previous, object: true }));
    }
  }, [form.cooperationState]);

  useEffect(() => {
    if (!ownerCommentRef.current) {
      return;
    }

    ownerCommentRef.current.style.height = "0px";
    ownerCommentRef.current.style.height = `${ownerCommentRef.current.scrollHeight}px`;
  }, [form.comment]);

  const openNativePicker = (input: HTMLInputElement | null) => {
    if (!input) {
      return;
    }

    if ("showPicker" in input && typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
  };

  const handleOwnerClose = () => {
    setForm(initialOwnerForm);
    setOpenDropdown(null);
    setOpenOwnerSections({
      diagnostics: false,
      object: false,
    });
    setSaveError("");
    onClose();
  };

  const persistOwner = async () => {
    if (!ownerCanSave) {
      setSaveError("");
      return null;
    }

    const nextActionAt = buildScheduleValue(form.nextActionDate, form.nextActionTime);
    const ownerCardId = createCardId("owner");
    const response = await postJson<{ owner?: { id?: string | number } }>("/api/owners", {
      fullName: form.fullName,
      phone: form.phone,
      phoneType: form.phoneType,
      comment: normalizeCommentText(form.comment),
      stageKey: form.stageKey,
      nextAction: form.nextAction,
      nextActionAt,
      agentExperience: form.agentExperience,
      clientOnlyState: form.clientOnlyState,
      leadsState: form.leadsState,
      showingsState: form.showingsState,
      commissionPercent: form.commissionPercent,
      cooperationState: form.cooperationState,
      duplicateState: form.cooperationState === "Дубль" ? "Да" : "",
      exclusiveState: form.cooperationState === "Эксклюзив" ? "Да" : "",
      dealType: form.dealType,
      objectAddress: form.objectAddress,
      objectComplex: form.objectComplex,
      objectPrice: form.objectPrice,
      objectLink: form.objectLink,
      returnDate: form.returnDate,
      stageTitle: selectedStage?.title ?? "",
    });

    const createdCard: OwnerCrmCard = {
      id: response?.owner?.id ? String(response.owner.id) : ownerCardId,
      cardType: "owner",
      title: form.fullName.trim() || "Собственник",
      price: form.phone.trim() || "Телефон не указан",
      status: selectedStage?.title ?? "Новый собственник",
      person: form.phoneType || "Неизвестно",
      tag: "Собственник",
      fullName: form.fullName.trim() || "Собственник",
      phone: form.phone.trim() || "Телефон не указан",
      phoneType: form.phoneType || "Неизвестно",
      stageTitle: selectedStage?.title ?? "Новый собственник",
      nextAction: form.nextAction,
      nextActionAt,
      touchesCount: 0,
      comment: normalizeCommentText(form.comment),
      agentExperience: form.agentExperience,
      clientOnlyState: form.clientOnlyState,
      leadsState: form.leadsState,
      showingsState: form.showingsState,
      commissionPercent: form.commissionPercent,
      cooperationType: form.cooperationState,
      dealType: form.dealType,
      objectAddress: form.objectAddress.trim(),
      objectComplex: form.objectComplex.trim(),
      objectPrice: form.objectPrice.trim(),
      objectLink: form.objectLink.trim(),
      lastContactAt: "",
      responsible: "LiteLux CRM",
      history: [
        {
          id: createCardId("history"),
          title: "Карточка создана",
          meta: selectedStage?.title ?? "Новый собственник",
          at: new Date().toISOString(),
        },
      ],
    };

    return {
      ownerOption: {
        id: createdCard.id ?? ownerCardId,
        name: createdCard.fullName,
        phone: createdCard.phone,
        phoneType: createdCard.phoneType,
      },
      card: createdCard,
      stageId: form.stageKey,
    };
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError("");
      const result = await persistOwner();

      if (!result) {
        return;
      }

      setForm(initialOwnerForm);
      setOpenOwnerSections({
        diagnostics: false,
        object: false,
      });
      onCreated(result);
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Не удалось сохранить собственника");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormScreenShell
      title="Новый собственник"
      onClose={handleOwnerClose}
      headerMode="backOnly"
      enableSwipeBack
      footer={
        <div className="space-y-3">
          {saveError ? <div className="text-sm text-[#F2A27A]">{saveError}</div> : null}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 w-full rounded-[20px] border border-[#E8C67B]/20 bg-[linear-gradient(180deg,rgba(232,198,123,0.16),rgba(255,255,255,0.03)_100%)] text-[#F7D992] shadow-[0_16px_28px_rgba(0,0,0,0.20)] hover:bg-[linear-gradient(180deg,rgba(232,198,123,0.20),rgba(255,255,255,0.04)_100%)] disabled:opacity-60"
          >
            {isSaving ? "Сохраняем..." : "Сохранить"}
          </Button>
        </div>
      }
    >
      <div className="relative z-10 space-y-4">
        <FormField
          label="Имя"
          value={form.fullName}
          onChange={(value) => setField("fullName", value)}
          placeholder="Имя собственника"
          required
          error={ownerFieldErrors.fullName}
        />

        <FormField
          label="Номер телефона"
          value={form.phone}
          onChange={(value) => setField("phone", normalizeRussianPhone(value))}
          placeholder="+7 999 000-00-00"
          required
          error={ownerFieldErrors.phone}
        />

        <div className="space-y-2">
          <div className="text-[12px] font-medium text-white/62">Тип номера</div>
          <div className="flex flex-wrap gap-2">
            {ownerPhoneTypeOptions.map((option) => (
              <FormChip key={option} active={form.phoneType === option} onClick={() => setField("phoneType", option)}>
                <span className="inline-flex items-center gap-2">
                  {option === "Прямой" ? (
                    <Phone className="h-4 w-4" />
                  ) : option === "Подменный" ? (
                    <PhoneOff className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                  <span>{option}</span>
                </span>
              </FormChip>
            ))}
          </div>
        </div>

        <SelectField
          label="Статус"
          value={selectedStage?.title ?? ""}
          placeholder="Выбери этап воронки"
          open={openDropdown === "stage"}
          onToggle={() => setOpenDropdown((current) => (current === "stage" ? null : "stage"))}
          onClose={() => setOpenDropdown(null)}
          onSelect={(value) => {
            const nextStage = ownerStageOptions.find((stage) => stage.title === value);
            setField("stageKey", nextStage?.id ?? form.stageKey);
            setOpenDropdown(null);
          }}
          options={ownerStageOptions.map((stage) => stage.title)}
          required
          error={ownerFieldErrors.stageKey}
        />

        <SelectField
          label="Действие"
          value={form.nextAction}
          placeholder="Нет действий"
          open={openDropdown === "action"}
          onToggle={() => setOpenDropdown((current) => (current === "action" ? null : "action"))}
          onClose={() => setOpenDropdown(null)}
          onSelect={(value) => {
            setField("nextAction", value);
            setOpenDropdown(null);
          }}
          options={ownerNextActionOptions}
          required
          error={ownerFieldErrors.nextAction}
        />

        <AnimatePresence initial={false}>
          {form.nextAction && form.nextAction !== "Нет действий" ? (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-[1.4fr_1fr] gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => openNativePicker(datePickerRef.current)}
                  className="relative flex h-12 items-center gap-3 rounded-[18px] border border-white/10 bg-[#141922] px-4 text-left transition-all hover:border-white/14"
                >
                  <input
                    ref={datePickerRef}
                    type="date"
                    value={toPickerDateValue(form.nextActionDate)}
                    onChange={(event) => setField("nextActionDate", fromPickerDateValue(event.target.value))}
                    className="pointer-events-none absolute h-0 w-0 opacity-0"
                    tabIndex={-1}
                  />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-[#E8C67B]">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div className={form.nextActionDate ? "text-[14px] text-white" : "text-[14px] text-white/30"}>
                    {form.nextActionDate || "ДД.ММ.ГГГГ"}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openNativePicker(timePickerRef.current)}
                  className="relative flex h-12 items-center gap-3 rounded-[18px] border border-white/10 bg-[#141922] px-4 text-left transition-all hover:border-white/14"
                >
                  <input
                    ref={timePickerRef}
                    type="time"
                    value={form.nextActionTime}
                    onChange={(event) => setField("nextActionTime", normalizeScheduleTime(event.target.value))}
                    className="pointer-events-none absolute h-0 w-0 opacity-0"
                    tabIndex={-1}
                  />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-[#E8C67B]">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div className={form.nextActionTime ? "text-[14px] text-white" : "text-[14px] text-white/30"}>
                    {form.nextActionTime || "18:30"}
                  </div>
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="rounded-[24px] border border-white/[0.08] bg-[#10161E] p-4">
          <div className="mb-3 text-[13px] font-medium text-white/76">Комментарий</div>
          <textarea
            ref={ownerCommentRef}
            value={form.comment}
            onChange={(event) => setField("comment", event.target.value.replace(/\s*\n+\s*/g, " "))}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                void handleSave();
                return;
              }

              if (event.key === "Enter") {
                event.preventDefault();
              }
            }}
            rows={1}
            placeholder="Короткий комментарий"
            className="min-h-[72px] w-full resize-none overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#121821] px-4 py-3 text-[14px] leading-6 text-white outline-none placeholder:text-white/24 whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
          />
        </div>

        {objectInfoRequired ? (
          <FormField
            label="Ссылка"
            value={form.objectLink}
            onChange={(value) => setField("objectLink", value)}
            placeholder="https://..."
            required
            error={objectFieldErrors.objectLink}
          />
        ) : null}

        <InlineAccordionSection
          title="Диагностика"
          open={openOwnerSections.diagnostics}
          onToggle={() => toggleOwnerSection("diagnostics")}
        >
          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Опыт с агентами</div>
            <div className="flex flex-wrap gap-2">
              {ownerAgentExperienceOptions.map((option) => (
                <FormChip key={option} active={form.agentExperience === option} onClick={() => setField("agentExperience", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Только клиенты</div>
            <div className="flex flex-wrap gap-2">
              {ownerClientOnlyOptions.map((option) => (
                <FormChip key={option} active={form.clientOnlyState === option} onClick={() => setField("clientOnlyState", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Тип сотрудничества</div>
            <div className="flex flex-wrap gap-2">
              {ownerCooperationOptions.map((option) => (
                <FormChip key={option} active={form.cooperationState === option} onClick={() => setField("cooperationState", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>

          <FormField
            label="Комиссия"
            value={form.commissionPercent}
            onChange={(value) => setField("commissionPercent", normalizeCommissionPercent(value))}
            placeholder="___"
            suffix="%"
          />

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Отклики</div>
            <div className="flex flex-wrap gap-2">
              {ownerLeadsOptions.map((option) => (
                <FormChip key={option} active={form.leadsState === option} onClick={() => setField("leadsState", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Показы</div>
            <div className="flex flex-wrap gap-2">
              {ownerShowingOptions.map((option) => (
                <FormChip key={option} active={form.showingsState === option} onClick={() => setField("showingsState", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>
        </InlineAccordionSection>

        <InlineAccordionSection
          title="Информация по объекту"
          open={openOwnerSections.object}
          onToggle={() => toggleOwnerSection("object")}
        >
          {showCreateObjectAction ? (
            <button
              type="button"
              onClick={async () => {
                try {
                  setIsSaving(true);
                  setSaveError("");
                  const result = await persistOwner();

                  if (!result) {
                    return;
                  }

                  onCreated(result);
                  onOpenCreateObject(result.ownerOption);
                } catch (error) {
                  setSaveError(error instanceof Error ? error.message : "Не удалось открыть создание объекта");
                } finally {
                  setIsSaving(false);
                }
              }}
              className="flex w-full items-center justify-between rounded-[18px] border border-white/10 bg-[#141922] px-4 py-3 text-left transition-all hover:border-[#E8C67B]/36"
            >
              <div className="space-y-1">
                <div className="text-[12px] font-medium text-white/52">Объект</div>
                <div className="text-[14px] font-medium text-white">Добавить объект</div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#E8C67B]">
                <Plus className="h-4 w-4" />
              </div>
            </button>
          ) : null}

          {objectInfoRequired ? (
            <>
              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Тип сделки</div>
                <div className="flex flex-wrap gap-2">
                  {ownerDealTypeOptions.map((option) => (
                    <FormChip key={option} active={form.dealType === option} onClick={() => setField("dealType", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>

              <FormField
                label="Адрес"
                value={form.objectAddress}
                onChange={(value) => setField("objectAddress", value)}
                placeholder="Город, улица, дом"
                required
                error={objectFieldErrors.objectAddress}
              />
              <FormField
                label="ЖК"
                value={form.objectComplex}
                onChange={(value) => setField("objectComplex", value)}
                placeholder="Название ЖК"
                required
                error={objectFieldErrors.objectComplex}
              />
              <FormField
                label="Цена"
                value={form.objectPrice}
                onChange={(value) => setField("objectPrice", value)}
                placeholder="Например 250 000"
                required
                error={objectFieldErrors.objectPrice}
              />
            </>
          ) : null}
        </InlineAccordionSection>
      </div>
    </FormScreenShell>
  );
}

function ClientCreateScreen({ onClose, onCreated }: { onClose: () => void; onCreated: (card: CrmCard) => void }) {
  const [form, setForm] = useState<ClientFormState>(initialClientForm);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(initialClientSections);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const setField = <K extends keyof ClientFormState>(field: K, value: ClientFormState[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const toggleArrayValue = (field: ClientArrayField, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: previous[field].includes(value)
        ? previous[field].filter((item) => item !== value)
        : [...previous[field], value],
    }));
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((previous) => ({ ...previous, [sectionId]: !previous[sectionId] }));
  };

  const clientFieldErrors = {
    fullName: form.fullName.trim() ? "" : "Укажи имя клиента",
    budgetTo: form.budgetTo.trim() ? "" : "Нужен верхний бюджет",
    preferredAreas: form.preferredAreas.trim() ? "" : "Укажи районы поиска",
  };

  const clientMissingLabels = [
    !form.fullName.trim() ? "имя" : "",
    !form.budgetTo.trim() ? "бюджет" : "",
    !form.preferredAreas.trim() ? "районы" : "",
  ].filter(Boolean);

  const clientCanSave = clientMissingLabels.length === 0;

  const handleSave = async () => {
    if (!clientCanSave) {
      setOpenSections((previous) => ({
        ...previous,
        client: previous.client || !form.fullName.trim(),
        location: previous.location || !form.budgetTo.trim() || !form.preferredAreas.trim(),
      }));
      setSaveError(`Заполни обязательные поля: ${clientMissingLabels.join(", ")}`);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError("");

      await postJson("/api/clients", form);
      setForm(initialClientForm);
      setOpenSections(initialClientSections);
      onCreated({
        title: form.fullName.trim() ? `Запрос клиента: ${form.fullName}` : "Новый клиентский запрос",
        price: form.budgetTo ? `Бюджет до ${form.budgetTo} ₽` : "Бюджет не указан",
        status: "Новый запрос",
        person: form.preferredAreas.trim() || "Локация не указана",
        tag: "Клиент",
      });
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Не удалось сохранить клиента");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormScreenShell
      title="Новый клиент"
      onClose={onClose}
      footer={
        <div className="space-y-3">
          {!saveError && !clientCanSave ? (
            <div className="text-sm text-white/42">Нужно заполнить: {clientMissingLabels.join(", ")}</div>
          ) : null}
          {saveError ? <div className="text-sm text-[#F2A27A]">{saveError}</div> : null}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 w-full rounded-[20px] bg-[linear-gradient(180deg,#0E6CFF,#005CDB)] text-white hover:bg-[linear-gradient(180deg,#1874FF,#0563E8)] disabled:opacity-60"
          >
            {isSaving ? "Сохраняем клиента..." : "Сохранить клиента"}
          </Button>
        </div>
      }
    >
      <FormSection
        title="Карточка клиента"
        open={openSections.client}
        onToggle={() => toggleSection("client")}
        summary={form.fullName.trim() ? form.fullName : "Нужно имя"}
        complete={Boolean(form.fullName.trim())}
      >
        <div className="space-y-4">
          <FormField
            label="ФИО"
            value={form.fullName}
            onChange={(value) => setField("fullName", value)}
            placeholder="Имя и фамилия"
            required
            error={clientFieldErrors.fullName}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Telegram" value={form.telegram} onChange={(value) => setField("telegram", value)} placeholder="@username" />
            <FormField label="Email" value={form.email} onChange={(value) => setField("email", value)} placeholder="name@mail.ru" />
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Источник</div>
            <div className="flex flex-wrap gap-2">
              {clientSourceOptions.map((option) => (
                <FormChip key={option} active={form.source === option} onClick={() => setField("source", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Канал связи</div>
            <div className="flex flex-wrap gap-2">
              {clientChannelOptions.map((option) => (
                <FormChip key={option} active={form.preferredChannel === option} onClick={() => setField("preferredChannel", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Запрос"
        open={openSections.request}
        onToggle={() => toggleSection("request")}
        summary={`${form.requestType} · ${form.propertyType}`}
        complete
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Тип запроса</div>
            <div className="flex flex-wrap gap-2">
              <FormChip active={form.requestType === "Долгосрочная аренда"} onClick={() => setField("requestType", "Долгосрочная аренда")}>
                Долгосрочная аренда
              </FormChip>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Тип объекта</div>
            <div className="flex flex-wrap gap-2">
              {clientPropertyTypeOptions.map((option) => (
                <FormChip key={option} active={form.propertyType === option} onClick={() => setField("propertyType", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Комнатность</div>
            <div className="flex flex-wrap gap-2">
              {roomOptions.map((option) => (
                <FormChip key={option} active={form.rooms === option} onClick={() => setField("rooms", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Бюджет и локация"
        open={openSections.location}
        onToggle={() => toggleSection("location")}
        summary={form.preferredAreas.trim() ? form.preferredAreas : "Нужны бюджет и районы"}
        complete={Boolean(form.budgetTo.trim() && form.preferredAreas.trim())}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Бюджет от" value={form.budgetFrom} onChange={(value) => setField("budgetFrom", value)} suffix="₽" />
            <FormField
              label="Бюджет до"
              value={form.budgetTo}
              onChange={(value) => setField("budgetTo", value)}
              suffix="₽"
              required
              error={clientFieldErrors.budgetTo}
            />
          </div>
          <FormField
            label="Районы"
            value={form.preferredAreas}
            onChange={(value) => setField("preferredAreas", value)}
            placeholder="Например Патрики, Хамовники, Сити"
            required
            error={clientFieldErrors.preferredAreas}
          />
          <FormField
            label="Метро"
            value={form.preferredMetro}
            onChange={(value) => setField("preferredMetro", value)}
            placeholder="Например Кропоткинская, Смоленская"
          />
        </div>
      </FormSection>

      <FormSection
        title="Срок и условия"
        open={openSections.conditions}
        onToggle={() => toggleSection("conditions")}
        summary={`${form.moveIn} · ${form.rentTerm}`}
        complete
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Когда нужен въезд</div>
            <div className="flex flex-wrap gap-2">
              {clientMoveInOptions.map((option) => (
                <FormChip key={option} active={form.moveIn === option} onClick={() => setField("moveIn", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Срок аренды</div>
            <div className="flex flex-wrap gap-2">
              {rentTermOptions.map((option) => (
                <FormChip key={option} active={form.rentTerm === option} onClick={() => setField("rentTerm", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Предпочтения</div>
            <div className="flex flex-wrap gap-2">
              {clientPreferenceOptions.map((option) => (
                <FormChip key={option} active={form.preferences.includes(option)} onClick={() => toggleArrayValue("preferences", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Заметки"
        open={openSections.notes}
        onToggle={() => toggleSection("notes")}
        summary={form.notes.trim() ? "Есть комментарий" : "Можно пропустить"}
        complete={Boolean(form.notes.trim())}
      >
        <FormField
          label="Комментарий"
          value={form.notes}
          onChange={(value) => setField("notes", value)}
          placeholder="Пожелания клиента, ограничения, детали коммуникации"
          multiline
        />
      </FormSection>
    </FormScreenShell>
  );
}

function OwnerCardModal({
  card,
  initialCallSheetOpen = false,
  initialEditMode = false,
  onClose,
  onUpdate,
  onCompleteCall,
  onOpenListing,
  onAddObject,
}: {
  card: OwnerCrmCard | null;
  initialCallSheetOpen?: boolean;
  initialEditMode?: boolean;
  onClose: () => void;
  onUpdate: (patch: Partial<OwnerCrmCard>) => void;
  onCompleteCall: (payload: {
    result: OwnerCallResult;
    comment: string;
    nextAction?: string;
    nextActionDate?: string;
    nextActionTime?: string;
  }) => void;
  onOpenListing: () => void;
  onAddObject: () => void;
}) {
  const [commentDraft, setCommentDraft] = useState(card?.comment ?? "");
  const [commentEditing, setCommentEditing] = useState(() => !(card?.comment ?? "").trim());
  const [editMode, setEditMode] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [callSheetOpen, setCallSheetOpen] = useState(false);
  const [callResult, setCallResult] = useState<OwnerCallResult>("Не звонил");
  const [callComment, setCallComment] = useState("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [followUpAction, setFollowUpAction] = useState<OwnerCallFollowUpAction | "">("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [noAnswerPreset, setNoAnswerPreset] = useState<(typeof ownerNoAnswerPresetOptions)[number]["id"] | "">("");
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const callDatePickerRef = useRef<HTMLInputElement | null>(null);
  const callTimePickerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setCommentDraft(card?.comment ?? "");
    setCommentEditing(false);
    setEditMode(initialEditMode);
  }, [card?.id, card?.comment, initialEditMode]);

  useEffect(() => {
    setHistoryExpanded(false);
  }, [card?.id]);

  useEffect(() => {
    setCallSheetOpen(false);
    setCallResult("Не звонил");
    setCallComment("");
    setScheduleEnabled(false);
    setFollowUpAction("");
    setFollowUpDate("");
    setFollowUpTime("");
    setNoAnswerPreset("");
  }, [card?.id]);

  useEffect(() => {
    if (initialCallSheetOpen) {
      setCallSheetOpen(true);
    }
  }, [initialCallSheetOpen]);

  useEffect(() => {
    if (!commentTextareaRef.current) {
      return;
    }

    commentTextareaRef.current.style.height = "0px";
    const nextHeight = Math.min(Math.max(commentTextareaRef.current.scrollHeight, 72), 180);
    commentTextareaRef.current.style.height = `${nextHeight}px`;
  }, [commentDraft, commentEditing]);

  useEffect(() => {
    if (!commentEditing || !commentTextareaRef.current) {
      return;
    }

    commentTextareaRef.current.focus();
    const nextPosition = commentTextareaRef.current.value.length;
    commentTextareaRef.current.setSelectionRange(nextPosition, nextPosition);
  }, [commentEditing]);

  if (!card) {
    return null;
  }

  const objectExists = hasOwnerObjectInfo(card);

  const openNativePicker = (input: HTMLInputElement | null) => {
    if (!input) {
      return;
    }

    if ("showPicker" in input && typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
  };

  const resetCallSheetState = () => {
    setCallSheetOpen(false);
    setCallResult("Не звонил");
    setCallComment("");
    setScheduleEnabled(false);
    setFollowUpAction("");
    setFollowUpDate("");
    setFollowUpTime("");
    setNoAnswerPreset("");
  };

  const handleCallResultSelect = (value: OwnerCallResult) => {
    setCallResult(value);

    if (value === "Нет ответа") {
      setScheduleEnabled(false);
      setFollowUpAction("Перезвонить");
      setFollowUpDate("");
      setFollowUpTime("");
      setNoAnswerPreset("");
      return;
    }

    if (value === "Дозвонились") {
      setNoAnswerPreset("");
      setFollowUpAction("");
      setFollowUpDate("");
      setFollowUpTime("");
      return;
    }

    setScheduleEnabled(false);
    setFollowUpAction("");
    setFollowUpDate("");
    setFollowUpTime("");
    setNoAnswerPreset("");
  };

  const handleNoAnswerPresetSelect = (presetId: (typeof ownerNoAnswerPresetOptions)[number]["id"]) => {
    setNoAnswerPreset(presetId);
    setFollowUpAction("Перезвонить");

    if (presetId === "custom") {
      setFollowUpDate("");
      setFollowUpTime("");
      return;
    }

    const nextSchedule = buildNoAnswerPresetSchedule(presetId);
    setFollowUpDate(nextSchedule.date);
    setFollowUpTime(nextSchedule.time);
  };

  const handleSaveCallResult = () => {
    const nextAction =
      callResult === "Нет ответа"
        ? followUpDate && followUpTime
          ? "Перезвонить"
          : ""
        : callResult === "Дозвонились" && scheduleEnabled && followUpAction && followUpDate && followUpTime
          ? followUpAction
          : "";

    onCompleteCall({
      result: callResult,
      comment: callComment,
      nextAction,
      nextActionDate: nextAction ? followUpDate : "",
      nextActionTime: nextAction ? followUpTime : "",
    });

    resetCallSheetState();
  };

  const overdue = isOwnerCardOverdue(card);
  const visibleHistory = historyExpanded ? card.history : card.history.slice(0, 3);
  const showNoAnswerSchedule = callResult === "Нет ответа";
  const showCustomNoAnswerSchedule = showNoAnswerSchedule && noAnswerPreset === "custom";
  const showAnsweredSchedule = callResult === "Дозвонились" && scheduleEnabled;
  const callSaveDisabled =
    (showCustomNoAnswerSchedule && (!followUpDate || !followUpTime)) ||
    (showAnsweredSchedule && (!followUpAction || !followUpDate || !followUpTime));
  const persistComment = (nextComment: string) => {
    const normalizedComment = normalizeCommentText(nextComment);

    if (normalizedComment === card.comment) {
      return;
    }

    const now = new Date().toISOString();
    onUpdate({
      comment: normalizedComment,
      lastContactAt: now,
      history: [
        {
          id: createCardId("history"),
          title: "Комментарий обновлён",
          meta: normalizedComment ? clampCommentPreview(normalizedComment, 72) : "Комментарий очищен",
          at: now,
        },
        ...card.history,
      ],
    });
  };

  const handleCommentSave = () => {
    persistComment(commentDraft);
    setCommentEditing(false);
    commentTextareaRef.current?.blur();
  };

  const handleCommentDelete = () => {
    setCommentDraft("");
    persistComment("");
    setCommentEditing(false);
    commentTextareaRef.current?.blur();
  };

  return (
    <>
      <button type="button" onClick={onClose} className="fixed inset-0 z-[100] bg-black/78 backdrop-blur-[8px]" aria-label="Закрыть карточку собственника" />
      <div className="fixed inset-x-0 bottom-0 z-[110] flex justify-center px-4 pb-4">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative isolate w-full max-w-[420px]"
        >
          <div className="relative isolate overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#0B1118] shadow-[0_34px_96px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div className="max-h-[84vh] overflow-y-auto px-4 pb-32 pt-5">
              <div className="absolute right-16 top-5 z-20">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode((current) => {
                      const next = !current;
                      if (!next) {
                        setCommentEditing(false);
                        setCommentDraft(card.comment ?? "");
                        commentTextareaRef.current?.blur();
                      }
                      return next;
                    });
                  }}
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full border transition-all",
                    editMode
                      ? "border-[#E8C67B]/24 bg-[linear-gradient(180deg,rgba(232,198,123,0.16),rgba(255,255,255,0.03)_100%)] text-[#F7D992]"
                      : "border-white/[0.08] bg-[#151C25] text-white/72 hover:bg-[#19212C] hover:text-white",
                  ].join(" ")}
                  aria-label={editMode ? "Завершить редактирование" : "Редактировать"}
                >
                  <Pencil className="h-4.5 w-4.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#151C25] text-white/62 transition-all hover:bg-[#19212C] hover:text-white"
                aria-label="Закрыть модалку"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4 flex items-start gap-3 pr-14">
                <div className="min-w-0">
                  <div className="truncate text-[22px] font-semibold tracking-tight text-white">{card.fullName}</div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="truncate text-[16px] text-white/78">{card.phone}</div>
                    <PhoneTypeIndicator phoneType={card.phoneType} />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full rounded-[20px] border border-white/[0.08] bg-[#111824] px-3.5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full border border-white/[0.08] bg-[#161E28] px-2.5 py-1 text-[11px] font-medium text-white/82">
                      {card.stageTitle}
                    </div>
                    <div className={["whitespace-nowrap text-[13px] font-medium", overdue ? "text-[#F29B87]" : "text-[#E8C67B]"].join(" ")}>
                      {formatOwnerActionLine(card)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/[0.08] bg-[#10161E] p-4">
                <div className="mb-3 text-[13px] font-medium text-white/76">Комментарий</div>
                {editMode && commentEditing ? (
                  <div className="space-y-3">
                    <textarea
                      ref={commentTextareaRef}
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                          event.preventDefault();
                          handleCommentSave();
                        }
                      }}
                      rows={1}
                      placeholder="Комментарий по собственнику"
                      className="min-h-[72px] w-full resize-none overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#121821] px-4 py-3 text-[14px] leading-6 text-white outline-none placeholder:text-white/24 whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCommentDelete}
                        className="h-10 rounded-[16px] border border-white/[0.08] bg-[#151D27] px-4 text-[13px] font-medium text-white/76 transition-all hover:bg-[#1A2330] hover:text-white"
                      >
                        Удалить
                      </button>
                      <button
                        type="button"
                        onClick={handleCommentSave}
                        disabled={commentDraft === card.comment}
                        className="h-10 rounded-[16px] border border-[#E8C67B]/20 bg-[linear-gradient(180deg,rgba(232,198,123,0.16),rgba(255,255,255,0.03)_100%)] px-4 text-[13px] font-medium text-[#F7D992] transition-all hover:bg-[linear-gradient(180deg,rgba(232,198,123,0.2),rgba(255,255,255,0.04)_100%)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={[
                      "block min-h-[48px] w-full rounded-[18px] px-1 py-1 text-left text-[14px] leading-6 text-white",
                      editMode ? "cursor-text transition-colors" : "",
                    ].join(" ")}
                    onClick={editMode ? () => setCommentEditing(true) : undefined}
                    role={editMode ? "button" : undefined}
                    tabIndex={editMode ? 0 : undefined}
                    onKeyDown={
                      editMode
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setCommentEditing(true);
                            }
                          }
                        : undefined
                    }
                  >
                    <div className={commentDraft.trim() ? "whitespace-pre-wrap break-words" : "text-white/24"}>
                      {commentDraft.trim() ? commentDraft : "Комментарий по собственнику"}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-[24px] border border-white/[0.08] bg-[#10161E] p-4">
                <div className="mb-3 text-[13px] font-medium text-white/76">Диагностика</div>
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 text-[12px] font-medium text-white/58">Опыт с агентами</div>
                      <div className="flex flex-wrap gap-2">
                        {ownerAgentExperienceOptions.map((option) => (
                          <FormChip key={option} active={card.agentExperience === option} onClick={() => onUpdate({ agentExperience: option })}>
                            {option}
                          </FormChip>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[12px] font-medium text-white/58">Только клиенты</div>
                      <div className="flex flex-wrap gap-2">
                        {ownerClientOnlyOptions.map((option) => (
                          <FormChip key={option} active={card.clientOnlyState === option} onClick={() => onUpdate({ clientOnlyState: option })}>
                            {option}
                          </FormChip>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[12px] font-medium text-white/58">Тип сотрудничества</div>
                      <div className="flex flex-wrap gap-2">
                        {ownerCooperationOptions.map((option) => (
                          <FormChip key={option} active={card.cooperationType === option} onClick={() => onUpdate({ cooperationType: option })}>
                            {option}
                          </FormChip>
                        ))}
                      </div>
                    </div>

                    <FormField
                      label="Комиссия"
                      value={card.commissionPercent}
                      onChange={(value) => onUpdate({ commissionPercent: normalizeCommissionPercent(value) })}
                      placeholder="___"
                      suffix="%"
                    />

                    <div>
                      <div className="mb-2 text-[12px] font-medium text-white/58">Отклики</div>
                      <div className="flex flex-wrap gap-2">
                        {ownerLeadsOptions.map((option) => (
                          <FormChip key={option} active={card.leadsState === option} onClick={() => onUpdate({ leadsState: option })}>
                            {option}
                          </FormChip>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[12px] font-medium text-white/58">Показы</div>
                      <div className="flex flex-wrap gap-2">
                        {ownerShowingOptions.map((option) => (
                          <FormChip key={option} active={card.showingsState === option} onClick={() => onUpdate({ showingsState: option })}>
                            {option}
                          </FormChip>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {[
                      ["Опыт с агентами", card.agentExperience],
                      ["Только клиенты", card.clientOnlyState],
                      ["Тип сотрудничества", card.cooperationType],
                      ["Комиссия", card.commissionPercent ? `${card.commissionPercent}%` : ""],
                      ["Отклики", card.leadsState],
                      ["Показы", card.showingsState],
                    ]
                      .filter(([, value]) => value)
                      .map(([label, value]) => (
                        <OwnerInfoRow key={label} label={label} value={value} />
                      ))}
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-[24px] border border-white/[0.08] bg-[#10161E] p-4">
                <div className="mb-3 text-[13px] font-medium text-white/76">Информация по объекту</div>
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 text-[12px] font-medium text-white/58">Тип сделки</div>
                      <div className="flex flex-wrap gap-2">
                        {ownerDealTypeOptions.map((option) => (
                          <FormChip key={option} active={card.dealType === option} onClick={() => onUpdate({ dealType: option })}>
                            {option}
                          </FormChip>
                        ))}
                      </div>
                    </div>

                    <FormField label="Адрес" value={card.objectAddress} onChange={(value) => onUpdate({ objectAddress: value })} placeholder="Город, улица, дом" />
                    <FormField label="ЖК" value={card.objectComplex} onChange={(value) => onUpdate({ objectComplex: value })} placeholder="Название ЖК" />
                    <FormField label="Цена" value={card.objectPrice} onChange={(value) => onUpdate({ objectPrice: value })} placeholder="Например 250 000 ₽" />
                    <FormField label="Ссылка" value={card.objectLink} onChange={(value) => onUpdate({ objectLink: value })} placeholder="https://..." />

                    <Button
                      type="button"
                      onClick={onAddObject}
                      className="h-11 w-full rounded-[18px] border border-white/[0.08] bg-[#151D27] text-white hover:bg-[#1A2330]"
                    >
                      <Plus className="h-4 w-4" />
                      {objectExists ? "Добавить ещё объект" : "Добавить объект"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {objectExists ? (
                      <OwnerObjectPreviewCard card={card} />
                    ) : (
                      <div className="rounded-[18px] border border-dashed border-white/10 px-3 py-4 text-[12px] text-white/36">
                        Объект пока не добавлен
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={onAddObject}
                      className="h-11 w-full rounded-[18px] border border-white/[0.08] bg-[#151D27] text-white hover:bg-[#1A2330]"
                    >
                      <Plus className="h-4 w-4" />
                      {objectExists ? "Добавить ещё объект" : "Добавить объект"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-[24px] border border-white/[0.08] bg-[#10161E] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-[13px] font-medium text-white/76">История</div>
                  {card.history.length > 3 ? (
                    <button
                      type="button"
                      onClick={() => setHistoryExpanded((current) => !current)}
                      className="text-[11px] font-medium text-[#E8C67B] transition-opacity hover:opacity-80"
                    >
                      {historyExpanded ? "Скрыть" : "Показать все"}
                    </button>
                  ) : null}
                </div>
                <div className="space-y-3">
                  {card.history.length ? (
                    visibleHistory.map((entry) => (
                      <div key={entry.id} className="rounded-[18px] border border-white/[0.07] bg-[#141B24] px-3 py-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[13px] font-medium text-white">{entry.title}</div>
                            {entry.meta ? <div className="mt-1 text-[11px] leading-4 text-white/48">{entry.meta}</div> : null}
                          </div>
                          <div className="shrink-0 text-[10px] text-white/34">{formatHistoryPreview(entry.at)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-white/10 px-3 py-4 text-[12px] text-white/36">
                      История пока пустая
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/[0.08] bg-[#10161E] p-4">
                <div className="mb-3 text-[13px] font-medium text-white/76">Служебное</div>
                <div className="space-y-3">
                  {[
                    { label: "Дата последнего контакта", value: card.lastContactAt ? formatHistoryPreview(card.lastContactAt) : "—" },
                    { label: "Количество касаний", value: `${card.touchesCount}` },
                    { label: "Ответственный", value: card.responsible || "—" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-[16px] border border-white/[0.07] bg-[#141B24] px-3 py-2.5">
                      <div className="text-[12px] text-white/46">{item.label}</div>
                      <div className="text-[12px] font-medium text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-[linear-gradient(180deg,rgba(11,17,24,0)_0%,rgba(11,17,24,0.2)_30%,rgba(11,17,24,0.62)_72%,rgba(11,17,24,1)_100%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-4">
              <div className="pointer-events-auto w-full max-w-[320px] rounded-[28px] bg-[#101720]/88 px-2 py-2 shadow-[0_18px_48px_rgba(0,0,0,0.42)] backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCallSheetOpen(true)}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-[22px] bg-[#151D27]/96 px-4 text-white transition-all hover:bg-[#1A2330]"
                  aria-label="Позвонить"
                >
                  <Phone className="h-5 w-5 text-[#E8C67B]" />
                  <span className="text-[14px] font-medium text-white/86">Позвонить</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenListing}
                  disabled={!card.objectLink.trim()}
                  className={[
                    "flex h-14 w-full items-center justify-center gap-2 rounded-[22px] px-4 transition-all",
                    card.objectLink.trim()
                      ? "bg-[#151D27]/96 text-white hover:bg-[#1A2330]"
                      : "cursor-not-allowed bg-[#151D27]/50 text-white/30",
                  ].join(" ")}
                  aria-label="Открыть ссылку"
                >
                  <Globe className={["h-5 w-5", card.objectLink.trim() ? "text-[#E8C67B]" : "text-white/22"].join(" ")} />
                  <span className={card.objectLink.trim() ? "text-[14px] font-medium text-white/86" : "text-[14px] font-medium text-white/30"}>Ссылка</span>
                </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {callSheetOpen ? (
            <>
              <button
                type="button"
                onClick={resetCallSheetState}
                className="fixed inset-0 z-[120] bg-black/10"
                aria-label="Закрыть плашку завершения звонка"
              />
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="fixed inset-x-0 bottom-0 z-[130] flex justify-center px-4 pb-4"
              >
                <div className="w-full max-w-[420px] rounded-[28px] border border-white/[0.08] bg-[#0E141C] p-4 shadow-[0_32px_72px_rgba(0,0,0,0.48)]">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[18px] font-semibold text-white">Звонок завершён</div>
                      <div className="mt-1 text-[12px] text-white/46">Выбери результат и при необходимости зафиксируй следующее действие.</div>
                    </div>
                    <button
                      type="button"
                      onClick={resetCallSheetState}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-[#151C25] text-white/64 transition-all hover:bg-[#1A2330] hover:text-white"
                      aria-label="Закрыть плашку звонка"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="mb-2 text-[12px] font-medium text-white/58">Результат</div>
                      <div className="flex flex-wrap gap-2">
                        {ownerCallResultOptions.map((option) => (
                          <FormChip key={option} active={callResult === option} onClick={() => handleCallResultSelect(option)}>
                            {option}
                          </FormChip>
                        ))}
                      </div>
                    </div>

                    {showNoAnswerSchedule ? (
                      <div className="rounded-[20px] border border-white/[0.08] bg-[#121922] p-3">
                        <div className="mb-2 text-[12px] font-medium text-white/58">Перезвонить?</div>
                        <div className="flex flex-wrap gap-2">
                          {ownerNoAnswerPresetOptions.map((option) => (
                            <FormChip key={option.id} active={noAnswerPreset === option.id} onClick={() => handleNoAnswerPresetSelect(option.id)}>
                              {option.label}
                            </FormChip>
                          ))}
                        </div>

                        {followUpDate && followUpTime ? (
                          <div className="mt-3 text-[12px] font-medium text-[#E8C67B]">
                            Перезвонить · {formatSchedulePreview(followUpDate, followUpTime)}
                          </div>
                        ) : null}

                        <AnimatePresence initial={false}>
                          {showCustomNoAnswerSchedule ? (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -4 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -4 }}
                              transition={{ duration: 0.16, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-[1.15fr_0.85fr] gap-3 pt-3">
                                <button
                                  type="button"
                                  onClick={() => openNativePicker(callDatePickerRef.current)}
                                  className="relative flex h-12 items-center gap-3 rounded-[18px] border border-white/10 bg-[#141922] px-4 text-left transition-all hover:border-white/14"
                                >
                                  <input
                                    ref={callDatePickerRef}
                                    type="date"
                                    value={toPickerDateValue(followUpDate)}
                                    onChange={(event) => setFollowUpDate(fromPickerDateValue(event.target.value))}
                                    className="pointer-events-none absolute h-0 w-0 opacity-0"
                                    tabIndex={-1}
                                  />
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-[#E8C67B]">
                                    <CalendarDays className="h-4 w-4" />
                                  </div>
                                  <div className={followUpDate ? "text-[14px] text-white" : "text-[14px] text-white/30"}>{followUpDate || "ДД.ММ.ГГГГ"}</div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openNativePicker(callTimePickerRef.current)}
                                  className="relative flex h-12 items-center gap-3 rounded-[18px] border border-white/10 bg-[#141922] px-4 text-left transition-all hover:border-white/14"
                                >
                                  <input
                                    ref={callTimePickerRef}
                                    type="time"
                                    value={followUpTime}
                                    onChange={(event) => setFollowUpTime(normalizeScheduleTime(event.target.value))}
                                    className="pointer-events-none absolute h-0 w-0 opacity-0"
                                    tabIndex={-1}
                                  />
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-[#E8C67B]">
                                    <Clock3 className="h-4 w-4" />
                                  </div>
                                  <div className={followUpTime ? "text-[14px] text-white" : "text-[14px] text-white/30"}>{followUpTime || "18:30"}</div>
                                </button>
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    ) : null}

                    {callResult === "Дозвонились" ? (
                      <div className="rounded-[20px] border border-white/[0.08] bg-[#121922] p-3">
                        <button
                          type="button"
                          onClick={() => setScheduleEnabled((current) => !current)}
                          className="flex items-center gap-3 text-left text-[13px] font-medium text-white"
                        >
                          <div className={["flex h-5 w-5 items-center justify-center rounded-full border text-[11px]", scheduleEnabled ? "border-[#E8C67B] bg-[#E8C67B] text-black" : "border-white/18 text-transparent"].join(" ")}>
                            ✓
                          </div>
                          Назначить следующее действие
                        </button>

                        <AnimatePresence initial={false}>
                          {showAnsweredSchedule ? (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -4 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -4 }}
                              transition={{ duration: 0.16, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-3 pt-3">
                                <div className="flex flex-wrap gap-2">
                                  {ownerCallFollowUpOptions.map((option) => (
                                    <FormChip
                                      key={option}
                                      active={followUpAction === option}
                                      onClick={() => setFollowUpAction(option)}
                                    >
                                      {option}
                                    </FormChip>
                                  ))}
                                </div>

                                <div className="grid grid-cols-[1.15fr_0.85fr] gap-3">
                                  <button
                                    type="button"
                                    onClick={() => openNativePicker(callDatePickerRef.current)}
                                    className="relative flex h-12 items-center gap-3 rounded-[18px] border border-white/10 bg-[#141922] px-4 text-left transition-all hover:border-white/14"
                                  >
                                    <input
                                      ref={callDatePickerRef}
                                      type="date"
                                      value={toPickerDateValue(followUpDate)}
                                      onChange={(event) => setFollowUpDate(fromPickerDateValue(event.target.value))}
                                      className="pointer-events-none absolute h-0 w-0 opacity-0"
                                      tabIndex={-1}
                                    />
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-[#E8C67B]">
                                      <CalendarDays className="h-4 w-4" />
                                    </div>
                                    <div className={followUpDate ? "text-[14px] text-white" : "text-[14px] text-white/30"}>{followUpDate || "ДД.ММ.ГГГГ"}</div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openNativePicker(callTimePickerRef.current)}
                                    className="relative flex h-12 items-center gap-3 rounded-[18px] border border-white/10 bg-[#141922] px-4 text-left transition-all hover:border-white/14"
                                  >
                                    <input
                                      ref={callTimePickerRef}
                                      type="time"
                                      value={followUpTime}
                                      onChange={(event) => setFollowUpTime(normalizeScheduleTime(event.target.value))}
                                      className="pointer-events-none absolute h-0 w-0 opacity-0"
                                      tabIndex={-1}
                                    />
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-[#E8C67B]">
                                      <Clock3 className="h-4 w-4" />
                                    </div>
                                    <div className={followUpTime ? "text-[14px] text-white" : "text-[14px] text-white/30"}>{followUpTime || "18:30"}</div>
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    ) : null}

                    <div>
                      <div className="mb-2 text-[12px] font-medium text-white/58">Комментарий</div>
                      <textarea
                        value={callComment}
                        onChange={(event) => setCallComment(event.target.value)}
                        rows={2}
                        placeholder="Короткий комментарий"
                        className="w-full resize-none rounded-[18px] border border-white/[0.08] bg-[#121821] px-4 py-3 text-[14px] leading-6 text-white outline-none placeholder:text-white/24"
                      />
                    </div>

                    <Button
                      type="button"
                      disabled={callSaveDisabled}
                      onClick={handleSaveCallResult}
                      className="h-11 w-full rounded-[18px] bg-[#E8C67B] text-black hover:bg-[#f0d48d] disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/34"
                    >
                      Сохранить
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}

function FunnelScreen({
  createRequest,
  onRequestCloseSearch,
  onCreateScreenChange,
}: {
  createRequest: number;
  onRequestCloseSearch: () => void;
  onCreateScreenChange?: (open: boolean) => void;
}) {
  const [selectedFunnel, setSelectedFunnel] = usePersistentState("litelux-crm-selected-funnel", "collection");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStage, setSelectedStage] = usePersistentState("litelux-crm-selected-stage", "no-answer");
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [activeCreateScreen, setActiveCreateScreen] = useState<CreateScreen | null>(null);
  const [extraCards, setExtraCards] = usePersistentState<Record<string, CrmCard[]>>("litelux-crm-extra-cards", {});
  const [ownerCardDrafts, setOwnerCardDrafts] = usePersistentState<Record<string, Partial<OwnerCrmCard>>>("litelux-crm-owner-card-drafts", {});
  const [archivedCardKeys, setArchivedCardKeys] = usePersistentState<string[]>("litelux-crm-archived-cards", []);
  const [persistedOwners, setPersistedOwners] = useState<PropertyOwnerOption[]>([]);
  const [selectedOwnerCardId, setSelectedOwnerCardId] = useState<string | null>(null);
  const [selectedPropertyCardKey, setSelectedPropertyCardKey] = useState<string | null>(null);
  const [callIntentOwnerCardId, setCallIntentOwnerCardId] = useState<string | null>(null);
  const [editIntentOwnerCardId, setEditIntentOwnerCardId] = useState<string | null>(null);
  const [propertyOwnerDraft, setPropertyOwnerDraft] = useState<PropertyOwnerOption | null>(null);
  const [propertyCreateScenario, setPropertyCreateScenario] = useState<PropertyCreateScenario | null>(null);
  const [propertyFormDraft, setPropertyFormDraft] = useState<PropertyFormState | null>(null);
  const [createReturnScreen, setCreateReturnScreen] = useState<CreateScreen | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const touchStartX = useRef<number | null>(null);

  const activeFunnel = useMemo(
    () => funnelCatalog.find((item) => item.id === selectedFunnel) ?? funnelCatalog[0],
    [selectedFunnel],
  );

  const activeStage = useMemo(
    () => activeFunnel.stages.find((item) => item.id === selectedStage) ?? activeFunnel.stages[0],
    [activeFunnel, selectedStage],
  );

  const stageStorageKey = (funnelId: string, stageId: string) => `${funnelId}:${stageId}`;
  const mergeCard = (card: CrmCard): CrmCard => {
    if (!isOwnerCrmCard(card) || !card.id) {
      return card;
    }

    const draft = ownerCardDrafts[card.id];

    if (!draft) {
      return card;
    }

    return {
      ...card,
      ...draft,
      history: draft.history ?? card.history,
    };
  };

  const activeStageCards = [
    ...(extraCards[stageStorageKey(activeFunnel.id, activeStage.id)] ?? []),
    ...activeStage.cards,
  ]
    .map((card, index) => {
      const mergedCard = mergeCard(card);

      return {
        card: mergedCard,
        cardKey: mergedCard.id ?? `${activeFunnel.id}:${activeStage.id}:${card.title}:${card.person}:${index}`,
      };
    })
    .filter(({ cardKey }) => !archivedCardKeys.includes(cardKey));

  const selectedOwnerCard = useMemo(() => {
    if (!selectedOwnerCardId) {
      return null;
    }

    const activeCard = activeStageCards.find(
      ({ card }) => isOwnerCrmCard(card) && card.id === selectedOwnerCardId,
    )?.card;

    return activeCard && isOwnerCrmCard(activeCard) ? activeCard : null;
  }, [activeStageCards, selectedOwnerCardId]);

  const selectedPropertyCard = useMemo(() => {
    if (!selectedPropertyCardKey) {
      return null;
    }

    const match = activeStageCards.find(({ card, cardKey }) => !isOwnerCrmCard(card) && cardKey === selectedPropertyCardKey);
    return match?.card ?? null;
  }, [activeStageCards, selectedPropertyCardKey]);

  const ownerOptions = useMemo<PropertyOwnerOption[]>(() => {
    const baseOwnerCards = funnelCatalog
      .find((funnel) => funnel.id === "collection")
      ?.stages.flatMap((stage) => stage.cards)
      .map(mergeCard)
      .filter(isOwnerCrmCard) ?? [];

    const extraOwnerCards = Object.entries(extraCards)
      .filter(([key]) => key.startsWith("collection:"))
      .flatMap(([, cards]) => cards)
      .map(mergeCard)
      .filter(isOwnerCrmCard);

    const uniqueOwners = new Map<string, PropertyOwnerOption>();

    persistedOwners.forEach((owner) => {
      if (!owner.id) {
        return;
      }

      uniqueOwners.set(owner.id, owner);
    });

    [...extraOwnerCards, ...baseOwnerCards].forEach((card) => {
      if (!card.id) {
        return;
      }

      uniqueOwners.set(card.id, {
        id: card.id,
        name: card.fullName,
        phone: card.phone,
        phoneType: card.phoneType,
      });
    });

    return [...uniqueOwners.values()];
  }, [extraCards, ownerCardDrafts, persistedOwners]);

  useEffect(() => {
    let cancelled = false;

    const loadOwners = async () => {
      try {
        const response = await getJson<{
          owners?: Array<{
            id?: string | number;
            full_name?: string;
            phone?: string;
            phone_type?: string;
            fullName?: string;
            phoneType?: string;
          }>;
        }>("/api/owners");

        if (cancelled) {
          return;
        }

        const nextOwners = (response.owners ?? [])
          .map((owner) => ({
            id: owner.id ? String(owner.id) : "",
            name: owner.full_name ?? owner.fullName ?? "",
            phone: owner.phone ?? "",
            phoneType: owner.phone_type ?? owner.phoneType ?? "Неизвестно",
          }))
          .filter((owner) => owner.id && owner.name);

        setPersistedOwners(nextOwners);
      } catch {
        if (!cancelled) {
          setPersistedOwners([]);
        }
      }
    };

    void loadOwners();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeFunnel.stages.some((stage) => stage.id === selectedStage)) {
      setSelectedStage(activeFunnel.stages[0]?.id ?? "");
    }
  }, [activeFunnel, selectedStage, setSelectedStage]);

  useEffect(() => {
    if (createRequest > 0) {
      setCreateSheetOpen(true);
      setDrawerOpen(false);
    }
  }, [createRequest]);

  useEffect(() => {
    onCreateScreenChange?.(activeCreateScreen !== null);
  }, [activeCreateScreen, onCreateScreenChange]);

  useEffect(() => {
    if (drawerOpen) {
      setCreateSheetOpen(false);
    }
  }, [drawerOpen]);

  const handleStageSelect = (stageId: string) => {
    setSelectedStage(stageId);
  };

  const handleStageStep = (direction: "prev" | "next") => {
    const currentIndex = activeFunnel.stages.findIndex((item) => item.id === selectedStage);
    if (currentIndex < 0) {
      return;
    }

    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    const nextStage = activeFunnel.stages[nextIndex];

    if (nextStage) {
      setSelectedStage(nextStage.id);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = touchStartX.current - endX;
    touchStartX.current = null;

    if (Math.abs(deltaX) < 44) {
      return;
    }

    handleStageStep(deltaX > 0 ? "next" : "prev");
  };

  const createOptions = [
    { id: "client", label: "Клиент", icon: User },
    { id: "owner", label: "Собственник", icon: Crown },
    { id: "property", label: "Объект", icon: Building2 },
  ] as const satisfies ReadonlyArray<{ id: CreateEntityType; label: string; icon: typeof User }>;

  const appendCard = (funnelId: string, stageId: string, card: CrmCard) => {
    const storageKey = stageStorageKey(funnelId, stageId);
    setExtraCards((previous) => ({
      ...previous,
      [storageKey]: [card, ...(previous[storageKey] ?? [])],
    }));
    setSelectedFunnel(funnelId);
    setSelectedStage(stageId);
  };

  const updateOwnerCard = (cardId: string, patch: Partial<OwnerCrmCard>) => {
    setOwnerCardDrafts((previous) => ({
      ...previous,
      [cardId]: {
        ...(previous[cardId] ?? {}),
        ...patch,
      },
    }));
  };

  const openOwnerCard = (cardId: string) => {
    setSelectedPropertyCardKey(null);
    setCallIntentOwnerCardId(null);
    setEditIntentOwnerCardId(null);
    setSelectedOwnerCardId(cardId);
  };

  const openOwnerCardForCall = (cardId: string) => {
    setSelectedPropertyCardKey(null);
    setCallIntentOwnerCardId(cardId);
    setEditIntentOwnerCardId(null);
    setSelectedOwnerCardId(cardId);
  };

  const openOwnerCardForEdit = (cardId: string) => {
    setSelectedPropertyCardKey(null);
    setCallIntentOwnerCardId(null);
    setEditIntentOwnerCardId(cardId);
    setSelectedOwnerCardId(cardId);
  };

  const openPropertyCard = (cardKey: string) => {
    setSelectedOwnerCardId(null);
    setCallIntentOwnerCardId(null);
    setEditIntentOwnerCardId(null);
    setSelectedPropertyCardKey(cardKey);
  };

  const handleOwnerOpenListingByCard = (card: OwnerCrmCard) => {
    if (!card.objectLink?.trim() || typeof window === "undefined") {
      return;
    }

    const normalizedLink = /^https?:\/\//i.test(card.objectLink) ? card.objectLink : `https://${card.objectLink}`;
    window.open(normalizedLink, "_blank", "noopener,noreferrer");
  };

  const handleOwnerCompleteCall = ({
    result,
    comment,
    nextAction,
    nextActionDate,
    nextActionTime,
  }: {
    result: OwnerCallResult;
    comment: string;
    nextAction?: string;
    nextActionDate?: string;
    nextActionTime?: string;
  }) => {
    if (!selectedOwnerCard?.id || result === "Не звонил") {
      return;
    }

    const now = new Date().toISOString();
    const nextActionAt = nextAction ? buildScheduleValue(nextActionDate ?? "", nextActionTime ?? "") : "";

    updateOwnerCard(selectedOwnerCard.id, {
      touchesCount: selectedOwnerCard.touchesCount + 1,
      lastContactAt: now,
      nextAction: nextAction || selectedOwnerCard.nextAction,
      nextActionAt: nextActionAt || selectedOwnerCard.nextActionAt,
      history: [
        {
          id: createCardId("history"),
          title: "Звонок",
          meta: buildOwnerCallHistoryMeta({
            result,
            comment,
            nextAction,
            nextActionAt,
          }),
          at: now,
        },
        ...selectedOwnerCard.history,
      ],
    });
  };

  const handleOwnerOpenListing = () => {
    if (!selectedOwnerCard?.objectLink?.trim() || typeof window === "undefined") {
      return;
    }

    const normalizedLink = /^https?:\/\//i.test(selectedOwnerCard.objectLink)
      ? selectedOwnerCard.objectLink
      : `https://${selectedOwnerCard.objectLink}`;

    window.open(normalizedLink, "_blank", "noopener,noreferrer");
  };

  if (activeCreateScreen === "property-scenario") {
    return (
      <PropertyScenarioScreen
        onClose={() => {
          setActiveCreateScreen(null);
          setPropertyCreateScenario(null);
          setPropertyFormDraft(null);
          setPropertyOwnerDraft(null);
          setCreateReturnScreen(null);
        }}
        onSelect={(scenario) => {
          setPropertyCreateScenario(scenario);
          setCreateReturnScreen("property-scenario");
          setActiveCreateScreen("property");
        }}
      />
    );
  }

  if (activeCreateScreen === "property") {
    return (
      <PropertyCreateScreen
        scenario={propertyCreateScenario}
        initialDraft={propertyFormDraft}
        linkedOwner={propertyOwnerDraft}
        ownerOptions={ownerOptions}
        onDraftChange={setPropertyFormDraft}
        onAddOwner={() => {
          setCreateReturnScreen("property");
          setActiveCreateScreen("owner");
        }}
        onClose={() => {
          if (createReturnScreen === "property-scenario") {
            setActiveCreateScreen("property-scenario");
            return;
          }

          setActiveCreateScreen(null);
          setPropertyCreateScenario(null);
          setPropertyOwnerDraft(null);
          setPropertyFormDraft(null);
          setCreateReturnScreen(null);
        }}
        onCreated={(result) => {
          appendCard("rent", "published", result.card);
          setActiveCreateScreen(null);
          setPropertyCreateScenario(null);
          setPropertyOwnerDraft(null);
          setPropertyFormDraft(null);
          setCreateReturnScreen(null);
        }}
      />
    );
  }

  if (activeCreateScreen === "owner") {
    return (
      <OwnerCreateScreen
        onClose={() => {
          if (createReturnScreen === "property") {
            setActiveCreateScreen("property");
            return;
          }

          setActiveCreateScreen(null);
          setCreateReturnScreen(null);
        }}
        onCreated={({ stageId, card, ownerOption }) => {
          appendCard("collection", stageId, card);

          if (createReturnScreen === "property") {
            setPropertyOwnerDraft(ownerOption);
            setActiveCreateScreen("property");
            return;
          }

          setCreateReturnScreen(null);
        }}
        onOpenCreateObject={(owner) => {
          setPropertyOwnerDraft(owner);
          setPropertyCreateScenario({ dealType: "rent", segment: "residential" });
          setPropertyFormDraft(null);
          setCreateReturnScreen(null);
          setActiveCreateScreen("property");
        }}
      />
    );
  }

  if (activeCreateScreen === "client") {
    return (
      <ClientCreateScreen
        onClose={() => setActiveCreateScreen(null)}
        onCreated={(card) => appendCard("selection", "clarify", card)}
      />
    );
  }

  return (
    <Screen>
      <div className="relative flex min-h-[calc(100dvh-140px)] flex-col px-4 pb-32 pt-4">
        {drawerOpen ? (
          <>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 z-40 bg-black/56 backdrop-blur-[5px]"
              aria-label="Закрыть меню воронок"
            />

            <motion.div
              initial={{ x: -320, opacity: 0.92 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="absolute bottom-2 left-0 top-2 z-50 w-[246px] rounded-[30px] border border-white/12 bg-[#090B10]/98 px-4 pb-4 pt-20 shadow-[26px_0_70px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-[18px]"
            >
              <Button
                type="button"
                onClick={() => {
                  onRequestCloseSearch();
                  setDrawerOpen(false);
                  setCreateSheetOpen(true);
                }}
                className="mb-5 h-11 w-full rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(242,204,122,0.16),rgba(255,255,255,0.03))] text-white hover:bg-[linear-gradient(180deg,rgba(242,204,122,0.20),rgba(255,255,255,0.04))]"
              >
                <Plus className="h-4 w-4" />
                Создать
              </Button>

              <div className="space-y-2.5">
                {funnelCatalog.map((item) => (
                  <motion.button
                    type="button"
                    key={item.id}
                    whileTap={{ scale: 0.985, y: 1 }}
                    onClick={() => {
                      onRequestCloseSearch();
                      setSelectedFunnel(item.id);
                      setDrawerOpen(false);
                    }}
                    className={[
                      "relative flex w-full items-center justify-between overflow-hidden rounded-[18px] border px-4 py-3.5 text-left transition-all",
                      selectedFunnel === item.id
                        ? "border-[#F2CC7A]/85 bg-[linear-gradient(180deg,rgba(242,204,122,0.30),rgba(44,33,19,0.98)_26%,rgba(18,23,31,1)_100%)] text-white shadow-[0_22px_34px_rgba(242,204,122,0.18)]"
                        : "border-white/12 bg-[#141922] text-white/84 shadow-[0_10px_22px_rgba(0,0,0,0.18)] hover:bg-[#181D27]",
                    ].join(" ")}
                  >
                    <div className={["text-[15px] font-medium", selectedFunnel === item.id ? "text-[#FFF2C7]" : "text-white"].join(" ")}>
                      {item.label}
                    </div>
                    <div
                      className={[
                        "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                        selectedFunnel === item.id
                          ? "border-[#F2CC7A] bg-[#F2CC7A]/24 shadow-[0_0_16px_rgba(242,204,122,0.16)]"
                          : "border-white/22 bg-transparent",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "h-2.5 w-2.5 rounded-full",
                          selectedFunnel === item.id ? "bg-[#F2CC7A]" : "bg-white/18",
                        ].join(" ")}
                      />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        ) : null}

        <div className="relative z-[60]">
          <div className="grid grid-cols-[44px_1fr_44px] items-center gap-2">
            <HeaderAction
              active={drawerOpen}
              onClick={() => {
                onRequestCloseSearch();
                setCreateSheetOpen(false);
                setDrawerOpen((value) => !value);
              }}
              className="relative z-[70] border-white/12 bg-white/[0.08] text-white/95 shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
            >
              <Menu className="h-5 w-5" />
            </HeaderAction>
            <div className="text-center text-[24px] font-semibold tracking-tight text-white">{activeFunnel.label}</div>
            <div className="h-11 w-11" />
          </div>

            <div className="mx-auto mt-3 h-px w-full max-w-[300px] bg-gradient-to-r from-transparent via-white/6 to-transparent" />
        </div>

        <div className="relative z-10 mt-3.5 flex flex-1 flex-col gap-4">
            <div
              ref={(node) => {
                sectionRefs.current[selectedFunnel] = node;
              }}
              className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {activeFunnel.stages.map((stage) => {
                const active = stage.id === activeStage.id;
                const stageCardCount = stage.cards.length + (extraCards[stageStorageKey(activeFunnel.id, stage.id)]?.length ?? 0);

                return (
                  <motion.button
                    key={stage.id}
                    type="button"
                    whileTap={{ scale: 0.985, y: 1 }}
                    onClick={() => handleStageSelect(stage.id)}
                    className={[
                      "relative shrink-0 rounded-[18px] border px-4 py-2 text-left whitespace-nowrap transition-all",
                      active
                        ? "border-[#E8C67B]/55 bg-[linear-gradient(180deg,rgba(232,198,123,0.18),rgba(28,24,18,0.92)_42%,rgba(18,20,24,0.96))] shadow-[0_16px_28px_rgba(232,198,123,0.14)]"
                        : "border-white/8 bg-white/[0.025]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-1">
                      <div className={["text-[13px] font-medium", active ? "text-[#F7D992]" : "text-white/78"].join(" ")}>
                        {stage.title}
                      </div>
                      <div className={["ml-0.5 text-[11px] font-medium leading-none", active ? "text-[#F7D992]/80" : "text-white/32"].join(" ")}>
                        {stageCardCount}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <div className="flex h-full w-full flex-col gap-3">
                {activeStageCards.map(({ card, cardKey }) => (
                  <div key={cardKey} className="w-full">
                    <StageCard
                      card={card}
                      onOpen={isOwnerCrmCard(card) ? () => openOwnerCard(card.id ?? "") : undefined}
                      onEdit={isOwnerCrmCard(card) ? () => openOwnerCardForEdit(card.id ?? "") : undefined}
                      onView={!isOwnerCrmCard(card) ? () => openPropertyCard(cardKey) : undefined}
                      onCall={isOwnerCrmCard(card) ? () => openOwnerCardForCall(card.id ?? "") : undefined}
                      onOpenListing={isOwnerCrmCard(card) ? () => handleOwnerOpenListingByCard(card) : undefined}
                      onArchive={() =>
                        setArchivedCardKeys((previous) =>
                          previous.includes(cardKey) ? previous : [...previous, cardKey],
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
        </div>

        <AnimatePresence>
          {createSheetOpen ? (
            <>
              <div
                onClick={() => setCreateSheetOpen(false)}
                className="absolute inset-0 z-20 cursor-default bg-transparent"
                aria-hidden="true"
              />
              <div className="absolute bottom-16 right-4 z-30 flex flex-col items-end gap-2">
                {createOptions.map((option, index) => {
                  const Icon = option.icon;

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      initial={{ y: 16, opacity: 0, scale: 0.92 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: 12, opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.16, delay: index * 0.03, ease: "easeOut" }}
                      whileTap={{ scale: 0.985, y: 1 }}
                      onClick={() => {
                        setCreateSheetOpen(false);
                        if (option.id === "property") {
                          setPropertyFormDraft(null);
                          setPropertyOwnerDraft(null);
                          setPropertyCreateScenario(null);
                        }
                        setCreateReturnScreen(null);
                        setActiveCreateScreen(option.id === "property" ? "property-scenario" : option.id);
                      }}
                      className="flex w-[210px] items-center rounded-full border border-white/10 bg-[#141923]/94 px-3 py-2 text-left text-white shadow-[0_14px_30px_rgba(0,0,0,0.26)] backdrop-blur-[18px]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-[#E8C67B]">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="ml-3 text-[13px] font-medium">{option.label}</div>
                    </motion.button>
                  );
                })}
              </div>
            </>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {selectedOwnerCard ? (
            <OwnerCardModal
              card={selectedOwnerCard}
              initialCallSheetOpen={callIntentOwnerCardId === selectedOwnerCard.id}
              initialEditMode={editIntentOwnerCardId === selectedOwnerCard.id}
              onClose={() => {
                setCallIntentOwnerCardId(null);
                setEditIntentOwnerCardId(null);
                setSelectedOwnerCardId(null);
              }}
              onUpdate={(patch) => {
                if (!selectedOwnerCard.id) {
                  return;
                }

                updateOwnerCard(selectedOwnerCard.id, patch);
              }}
              onCompleteCall={handleOwnerCompleteCall}
              onOpenListing={handleOwnerOpenListing}
              onAddObject={() => {
                if (selectedOwnerCard?.id) {
                  setPropertyOwnerDraft({
                    id: selectedOwnerCard.id,
                    name: selectedOwnerCard.fullName,
                    phone: selectedOwnerCard.phone,
                    phoneType: selectedOwnerCard.phoneType,
                  });
                }
                setPropertyCreateScenario({ dealType: "rent", segment: "residential" });
                setPropertyFormDraft(null);
                setCreateReturnScreen(null);
                setSelectedOwnerCardId(null);
                setActiveCreateScreen("property");
              }}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {selectedPropertyCard ? (
            <PropertyCardModal
              card={selectedPropertyCard}
              onClose={() => {
                setSelectedPropertyCardKey(null);
              }}
            />
          ) : null}
        </AnimatePresence>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            onRequestCloseSearch();
            setDrawerOpen(false);
            setCreateSheetOpen((value) => !value);
          }}
          className="absolute bottom-5 right-4 z-30 flex h-12 w-12 items-center justify-center text-[#E8C67B]"
          aria-label="Добавить элемент"
        >
          <Plus className="h-7 w-7 drop-shadow-[0_0_12px_rgba(232,198,123,0.22)]" />
        </motion.button>
      </div>
    </Screen>
  );
}

function SearchSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-transparent"
        aria-label="Закрыть поиск"
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-4">
        <motion.div
          initial={{ y: 16, opacity: 0.9 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0.9 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="pointer-events-auto w-full max-w-[356px]"
        >
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/28" />
            <Input
              autoFocus
              placeholder="Поиск по всей базе"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  onClose();
                }
              }}
              className="h-12 w-full rounded-[18px] border-white/12 bg-[#23272E]/96 pl-11 text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] placeholder:text-white/32 focus-visible:border-[#F2CC7A]/24 focus-visible:ring-0"
            />
          </label>
        </motion.div>
      </div>
    </>
  );
}

function MessagesScreen() {
  return (
    <Screen>
      <div className="px-4 pb-28 pt-4">
        <div className="mb-4 text-[22px] font-semibold tracking-tight">Сообщения</div>
        <div className="space-y-3">
          {[
            ["Анна Смирнова", "Можно показать квартиру завтра после 19:00"],
            ["Иван Иванов", "Интересует объект ближе к Сити"],
            ["Сергей Морозов", "Когда разместите обновленные фото?"],
          ].map(([name, text]) => (
            <Surface key={name} className="bg-[#121418]">
              <CardContent className="p-4">
                <div className="text-sm text-white">{name}</div>
                <div className="mt-1 text-sm leading-6 text-white/46">{text}</div>
              </CardContent>
            </Surface>
          ))}
        </div>
      </div>
    </Screen>
  );
}

function ProfileScreen() {
  return (
    <Screen>
      <div className="px-4 pb-28 pt-4">
        <div className="mb-4 flex items-center gap-3">
          <Avatar className="h-14 w-14 border border-white/8 bg-white/[0.03]">
            <AvatarFallback className="bg-transparent text-white/70">КП</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-[20px] font-semibold tracking-tight">Профиль</div>
            <div className="mt-1 text-xs text-white/38">Админ · LiteLux CRM</div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            ["Роль", "Администратор"],
            ["Команда", "2 пользователя"],
            ["Активная воронка", "Подбор"],
            ["Настройки", "Доступы, интерфейс, уведомления"],
          ].map(([label, value]) => (
            <Surface key={label} className="bg-[#121418]">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs text-white/36">{label}</div>
                  <div className="mt-1 text-sm text-white">{value}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/28" />
              </CardContent>
            </Surface>
          ))}
        </div>
      </div>
    </Screen>
  );
}

export default function PadluxCrmFrontend() {
  const [active, setActive] = usePersistentState("litelux-crm-active-screen", "crm");
  const [searchOpen, setSearchOpen] = useState(false);
  const [crmCreateRequest, setCrmCreateRequest] = useState(0);
  const [crmCreateScreenOpen, setCrmCreateScreenOpen] = useState(false);

  const handleNavChange = (id: string) => {
    if (id === "crm" && active === "crm") {
      setSearchOpen((previous) => !previous);
      return;
    }

    setSearchOpen(false);
    setCrmCreateScreenOpen(false);
    setActive(id);
  };

  const handleOpenCreateFlow = () => {
    setSearchOpen(false);
    setActive("crm");
    setCrmCreateRequest((previous) => previous + 1);
  };

  const screen = useMemo(() => {
    switch (active) {
      case "dashboard":
        return <DashboardScreen />;
      case "tasks":
        return <TasksScreen onOpenCreate={handleOpenCreateFlow} />;
      case "messages":
        return <MessagesScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return (
          <FunnelScreen
            createRequest={crmCreateRequest}
            onRequestCloseSearch={() => setSearchOpen(false)}
            onCreateScreenChange={setCrmCreateScreenOpen}
          />
        );
    }
  }, [active, crmCreateRequest]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(242,204,122,0.10),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.06),transparent_20%),linear-gradient(180deg,#07080A_0%,#0A0C10_54%,#090A0D_100%)] px-3 py-6">
      <AmbientGlow className="left-[4%] top-0 h-56 w-56 bg-[#F2CC7A]/10" />
      <AmbientGlow className="right-[8%] top-28 h-44 w-44 bg-white/6" />
      <div className="relative mx-auto max-w-[420px]">{screen}</div>
      {!crmCreateScreenOpen ? <SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} /> : null}
      {!crmCreateScreenOpen ? <BottomBar active={active} onChange={handleNavChange} searchOpen={searchOpen} /> : null}
    </div>
  );
}
