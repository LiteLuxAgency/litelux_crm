import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Crown,
  LayoutDashboard,
  Layers3,
  Menu,
  MessageSquare,
  Minus,
  Phone,
  Plus,
  Search,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { postJson } from "@/lib/api";

const funnelCatalog = [
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
    id: "collection",
    label: "Набор",
    stages: [
      {
        id: "no-answer",
        title: "Нет ответа",
        cards: [
          {
            title: "Собственник River Side",
            price: "3 касания без ответа",
            status: "Тишина",
            person: "Олег Мельников",
            tag: "Собственник",
          },
        ],
      },
      {
        id: "answered",
        title: "Ответил",
        cards: [
          {
            title: "Ответ по White House",
            price: "Готов обсудить завтра",
            status: "Есть отклик",
            person: "Наталья Ильина",
            tag: "Контакт",
          },
        ],
      },
      {
        id: "meeting",
        title: "Есть созвон / встреча",
        cards: [
          {
            title: "Созвон на 17:00",
            price: "Обсуждение условий",
            status: "Назначено",
            person: "Кирилл Серов",
            tag: "Встреча",
          },
        ],
      },
      {
        id: "in-work",
        title: "Взял в работу",
        cards: [
          {
            title: "Объект у аналитика",
            price: "Проверка рынка и цены",
            status: "В работе",
            person: "Марина Фролова",
            tag: "Работа",
          },
        ],
      },
      {
        id: "reject",
        title: "Отказ",
        cards: [
          {
            title: "Не актуально",
            price: "Причина: уже с агентом",
            status: "Закрыто",
            person: "Виктор Панов",
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

const residentialObjectTypes = [
  "Квартира",
  "Комната",
  "Койко-место",
  "Дом, дача",
  "Коттедж",
  "Таунхаус",
  "Часть дома",
  "Гараж",
] as const;

const roomOptions = ["Студия", "1", "2", "3", "4", "5", "6+", "Свободная планировка"] as const;
const layoutOptions = ["Смежная", "Изолированная", "Смежно-изолированная"] as const;
const realtyKindOptions = ["Квартира", "Апартаменты"] as const;
const windowViewOptions = ["На улицу", "Во двор"] as const;
const renovationOptions = ["Без ремонта", "Косметический", "Евро", "Дизайнерский"] as const;
const entranceOptions = ["Пандус", "Мусоропровод"] as const;
const parkingOptions = ["Наземная", "Многоуровневая", "Подземная", "На крыше"] as const;
const furnitureOptions = ["Без мебели", "На кухне", "В комнатах"] as const;
const bathroomFeatureOptions = ["Ванна", "Душевая кабина"] as const;
const applianceOptions = ["Кондиционер", "Холодильник", "Посудомоечная машина", "Телевизор", "Стиральная машина"] as const;
const connectivityOptions = ["Интернет"] as const;
const utilitiesPayerOptions = ["Собственник", "Арендатор"] as const;
const prepaymentOptions = ["За 1 месяц", "2", "3", "4+"] as const;
const rentTermOptions = ["От года", "Несколько месяцев"] as const;
const livingConditionsOptions = ["Можно с детьми", "Можно с животными"] as const;
const ownerRoleOptions = ["Собственник", "Представитель", "Доверенное лицо"] as const;
const ownerSourceOptions = ["Входящий", "Рекомендация", "Повторный", "Холодный контакт"] as const;
const ownerChannelOptions = ["Telegram", "WhatsApp", "Email"] as const;
const ownerWorkModeOptions = ["Эксклюзив", "Неэксклюзив", "Тестовый запуск"] as const;
const ownerAccessOptions = ["Ключи на руках", "Показы через собственника", "Консьерж / охрана"] as const;
const ownerDocumentOptions = ["Паспорт", "Право собственности", "Доверенность", "План БТИ"] as const;
const clientSourceOptions = ["Входящий", "Рекомендация", "Повторный", "Реклама"] as const;
const clientChannelOptions = ["Telegram", "WhatsApp", "Email"] as const;
const clientMoveInOptions = ["Сразу", "До 2 недель", "До месяца", "Гибко"] as const;
const clientPreferenceOptions = ["Можно с детьми", "Можно с животными", "Нужна мебель", "Нужна парковка"] as const;
const clientPropertyTypeOptions = ["Квартира", "Апартаменты", "Дом, дача", "Пентхаус"] as const;

type PropertyFormState = {
  objectType: string;
  rooms: string;
  totalArea: string;
  livingArea: string;
  kitchenArea: string;
  layout: string;
  ceilingHeight: string;
  floor: string;
  floorsTotal: string;
  address: string;
  apartmentNumber: string;
  cadastralNumber: string;
  realtyKind: string;
  photoCount: number;
  balconyCount: number;
  loggiaCount: number;
  windowViews: string[];
  bathroomSeparate: number;
  bathroomCombined: number;
  renovation: string;
  elevatorPassenger: number;
  elevatorCargo: number;
  entranceFeatures: string[];
  parkingTypes: string[];
  furniture: string[];
  bathroomFeatures: string[];
  appliances: string[];
  connectivity: string[];
  description: string;
  title: string;
  pricePerMonth: string;
  utilitiesPayer: string;
  prepaymentMonths: string;
  deposit: string;
  rentTerm: string;
  livingConditions: string[];
  otherAgentCommission: string;
  renterCommission: string;
};

type PropertyArrayField =
  | "windowViews"
  | "entranceFeatures"
  | "parkingTypes"
  | "furniture"
  | "bathroomFeatures"
  | "appliances"
  | "connectivity"
  | "livingConditions";

type PropertyCounterField =
  | "photoCount"
  | "balconyCount"
  | "loggiaCount"
  | "bathroomSeparate"
  | "bathroomCombined"
  | "elevatorPassenger"
  | "elevatorCargo";

type OwnerFormState = {
  fullName: string;
  telegram: string;
  email: string;
  role: string;
  source: string;
  preferredChannel: string;
  objectType: string;
  rooms: string;
  address: string;
  priceExpectation: string;
  workMode: string;
  accessMode: string[];
  documents: string[];
  notes: string;
};

type OwnerArrayField = "accessMode" | "documents";

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
type CrmCard = {
  title: string;
  price: string;
  status: string;
  person: string;
  tag: string;
};

function AmbientGlow({ className = "" }: { className?: string }) {
  return <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} aria-hidden="true" />;
}

function Screen({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="pointer-events-none absolute -left-8 top-4 h-40 w-40 rounded-full bg-[#F2CC7A]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-30px] top-24 h-36 w-36 rounded-full bg-white/5 blur-3xl" />
      <div
        className={[
          "relative overflow-hidden rounded-[36px] border border-white/10 bg-[#0B0D11]/92 text-white backdrop-blur-[28px]",
          "shadow-[0_24px_70px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.08)]",
          className,
        ].join(" ")}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)_28%,rgba(255,255,255,0.03)_100%)]" />
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
        "relative overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.035] shadow-[0_10px_30px_rgba(0,0,0,0.22)]",
        className,
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_36%)]" />
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

function StageCard({ card }: { card: CrmCard }) {
  return (
    <motion.div whileTap={{ scale: 0.985 }} transition={{ duration: 0.14 }} className="h-full w-full">
      <Surface className="h-full w-full rounded-[20px] border-white/7 bg-[#15191F]/88 shadow-[0_8px_24px_rgba(0,0,0,0.16)]">
        <CardContent className="relative flex h-full flex-col p-2.5">
          <div className="absolute -left-4 top-[-14px] h-12 w-12 rounded-full bg-[#F2CC7A]/10 blur-2xl" />
          <div className="relative mb-1 flex items-start justify-between gap-2">
            <Badge className="rounded-full border-0 bg-white/[0.05] px-2 py-0.5 text-[8px] font-medium text-white/60 hover:bg-white/[0.05]">
              {card.tag}
            </Badge>
            <div className="text-[9px] text-[#C8A56A]">{card.status}</div>
          </div>
          <div className="relative text-[12px] font-medium leading-5 text-white">{card.title}</div>
          <div className="mt-0.5 text-[10px] text-white/44">{card.person}</div>
          <div className="mt-2.5 flex items-center justify-between">
            <div className="text-[12px] font-medium text-white">{card.price}</div>
            <div className="flex items-center gap-1.5 text-white/34">
              <Phone className="h-3 w-3" />
              <CalendarDays className="h-3 w-3" />
            </div>
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
        "rounded-[16px] border px-3 py-2 text-[13px] font-medium transition-all",
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <div className="text-[12px] font-medium text-white/62">{label}</div>
      <div className="relative">
        {multiline ? (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full resize-none rounded-[18px] border border-white/10 bg-[#141922] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/24"
          />
        ) : (
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="h-12 rounded-[18px] border-white/10 bg-[#141922] pr-10 text-white placeholder:text-white/24"
          />
        )}
        {suffix ? (
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-white/34">
            {suffix}
          </div>
        ) : null}
      </div>
    </label>
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
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-[#141922] px-4 py-3">
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
}: React.PropsWithChildren<{ title: string; open: boolean; onToggle: () => void }>) {
  return (
    <Surface className="rounded-[24px] border-white/10 bg-[#11151C]/90">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between px-4 py-4 text-left"
        >
          <div className="text-[16px] font-medium text-white">{title}</div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#E8C67B]">
            {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
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
              <div className="border-t border-white/6 px-4 pb-4 pt-4">{children}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Surface>
  );
}

function FormScreenShell({
  title,
  onClose,
  children,
  footer,
}: React.PropsWithChildren<{ title: string; onClose: () => void; footer: React.ReactNode }>) {
  return (
    <Screen>
      <div className="relative min-h-[calc(100dvh-140px)] px-4 pb-32 pt-4">
        <div className="mb-4 grid grid-cols-[44px_1fr_44px] items-center gap-2">
          <HeaderAction onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </HeaderAction>
          <div className="text-center text-[24px] font-semibold tracking-tight text-white">{title}</div>
          <div className="h-11 w-11" />
        </div>

        <div className="mx-auto mb-4 h-px w-full max-w-[300px] bg-gradient-to-r from-transparent via-white/6 to-transparent" />

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
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(242,204,122,0.16),rgba(255,255,255,0.04)_90%)] shadow-[0_12px_24px_rgba(242,204,122,0.12)]" />
                    <div className="absolute left-1/2 top-[-2px] h-px w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
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

function PropertyCreateScreen({ onClose, onCreated }: { onClose: () => void; onCreated: (card: CrmCard) => void }) {
  const [form, setForm] = useState<PropertyFormState>({
    objectType: "Квартира",
    rooms: "2",
    totalArea: "",
    livingArea: "",
    kitchenArea: "",
    layout: "Изолированная",
    ceilingHeight: "",
    floor: "",
    floorsTotal: "",
    address: "",
    apartmentNumber: "",
    cadastralNumber: "",
    realtyKind: "Квартира",
    photoCount: 0,
    balconyCount: 0,
    loggiaCount: 0,
    windowViews: [],
    bathroomSeparate: 0,
    bathroomCombined: 0,
    renovation: "",
    elevatorPassenger: 0,
    elevatorCargo: 0,
    entranceFeatures: [],
    parkingTypes: [],
    furniture: [],
    bathroomFeatures: [],
    appliances: [],
    connectivity: [],
    description: "",
    title: "",
    pricePerMonth: "",
    utilitiesPayer: "Собственник",
    prepaymentMonths: "За 1 месяц",
    deposit: "",
    rentTerm: "От года",
    livingConditions: [],
    otherAgentCommission: "",
    renterCommission: "",
  });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    format: true,
    params: true,
    location: false,
    photos: false,
    features: false,
    equipment: false,
    description: false,
    price: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const setField = <K extends keyof PropertyFormState>(field: K, value: PropertyFormState[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((previous) => ({ ...previous, [sectionId]: !previous[sectionId] }));
  };

  const toggleArrayValue = (field: PropertyArrayField, value: string) => {
    setForm((previous) => {
      const nextValues = previous[field].includes(value)
        ? previous[field].filter((item) => item !== value)
        : [...previous[field], value];

      return { ...previous, [field]: nextValues };
    });
  };

  const changeCounter = (field: PropertyCounterField, delta: number) => {
    setForm((previous) => ({
      ...previous,
      [field]: Math.max(0, previous[field] + delta),
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError("");

      await postJson("/api/properties", form);
      onCreated({
        title: form.title.trim() || `${form.objectType} · ${form.totalArea || "0"} м²`,
        price: form.pricePerMonth ? `${form.pricePerMonth} ₽/мес` : "Цена не указана",
        status: "Новый объект",
        person: form.address.trim() || "Адрес не заполнен",
        tag: "Объект",
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
            className="h-12 w-full rounded-[20px] bg-[linear-gradient(180deg,#0E6CFF,#005CDB)] text-white hover:bg-[linear-gradient(180deg,#1874FF,#0563E8)] disabled:opacity-60"
          >
            {isSaving ? "Сохраняем объект..." : "Сохранить объект"}
          </Button>
        </div>
      }
    >
          <FormSection title="Формат объекта" open={openSections.format} onToggle={() => toggleSection("format")}>
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="rounded-[16px] border border-[#E8C67B]/55 bg-[linear-gradient(180deg,rgba(232,198,123,0.18),rgba(18,20,24,0.96))] px-3 py-2 text-[13px] font-medium text-[#F7D992]">
                Долгосрочная аренда
              </div>
              <div className="rounded-[16px] border border-[#E8C67B]/55 bg-[linear-gradient(180deg,rgba(232,198,123,0.18),rgba(18,20,24,0.96))] px-3 py-2 text-[13px] font-medium text-[#F7D992]">
                Жилая
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {residentialObjectTypes.map((option) => (
                <FormChip key={option} active={form.objectType === option} onClick={() => setField("objectType", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </FormSection>

          <FormSection title="Параметры квартиры" open={openSections.params} onToggle={() => toggleSection("params")}>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Количество комнат</div>
                <div className="flex flex-wrap gap-2">
                  {roomOptions.map((option) => (
                    <FormChip key={option} active={form.rooms === option} onClick={() => setField("rooms", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <FormField label="Общая площадь" value={form.totalArea} onChange={(value) => setField("totalArea", value)} suffix="м²" />
                <FormField label="Жилая площадь" value={form.livingArea} onChange={(value) => setField("livingArea", value)} suffix="м²" />
                <FormField label="Кухня" value={form.kitchenArea} onChange={(value) => setField("kitchenArea", value)} suffix="м²" />
              </div>

              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Планировка</div>
                <div className="flex flex-wrap gap-2">
                  {layoutOptions.map((option) => (
                    <FormChip key={option} active={form.layout === option} onClick={() => setField("layout", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FormField label="Высота потолков" value={form.ceilingHeight} onChange={(value) => setField("ceilingHeight", value)} suffix="м" />
                <FormField label="Этаж" value={form.floor} onChange={(value) => setField("floor", value)} />
                <FormField label="Этажей в доме" value={form.floorsTotal} onChange={(value) => setField("floorsTotal", value)} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Расположение" open={openSections.location} onToggle={() => toggleSection("location")}>
            <div className="space-y-4">
              <FormField label="Адрес" value={form.address} onChange={(value) => setField("address", value)} placeholder="Город, улица, номер дома" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Номер квартиры" value={form.apartmentNumber} onChange={(value) => setField("apartmentNumber", value)} />
                <FormField label="Кадастровый номер" value={form.cadastralNumber} onChange={(value) => setField("cadastralNumber", value)} />
              </div>
              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Тип недвижимости</div>
                <div className="flex flex-wrap gap-2">
                  {realtyKindOptions.map((option) => (
                    <FormChip key={option} active={form.realtyKind === option} onClick={() => setField("realtyKind", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Фотографии" open={openSections.photos} onToggle={() => toggleSection("photos")}>
            <div className="space-y-4">
              <CounterField label="Фотографий" value={form.photoCount} onChange={(delta) => changeCounter("photoCount", delta)} />
              <Button
                type="button"
                onClick={() => changeCounter("photoCount", 1)}
                className="h-11 w-full rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] text-white hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))]"
              >
                Добавить фото
              </Button>
            </div>
          </FormSection>

          <FormSection title="Особенности квартиры" open={openSections.features} onToggle={() => toggleSection("features")}>
            <div className="space-y-4">
              <CounterField label="Балкон" value={form.balconyCount} onChange={(delta) => changeCounter("balconyCount", delta)} />
              <CounterField label="Лоджия" value={form.loggiaCount} onChange={(delta) => changeCounter("loggiaCount", delta)} />

              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Вид из окна</div>
                <div className="flex flex-wrap gap-2">
                  {windowViewOptions.map((option) => (
                    <FormChip key={option} active={form.windowViews.includes(option)} onClick={() => toggleArrayValue("windowViews", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>

              <CounterField label="Санузел раздельный" value={form.bathroomSeparate} onChange={(delta) => changeCounter("bathroomSeparate", delta)} />
              <CounterField label="Санузел совмещённый" value={form.bathroomCombined} onChange={(delta) => changeCounter("bathroomCombined", delta)} />

              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Ремонт</div>
                <div className="flex flex-wrap gap-2">
                  {renovationOptions.map((option) => (
                    <FormChip key={option} active={form.renovation === option} onClick={() => setField("renovation", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>

              <CounterField label="Лифт пассажирский" value={form.elevatorPassenger} onChange={(delta) => changeCounter("elevatorPassenger", delta)} />
              <CounterField label="Лифт грузовой" value={form.elevatorCargo} onChange={(delta) => changeCounter("elevatorCargo", delta)} />

              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Подъезд</div>
                <div className="flex flex-wrap gap-2">
                  {entranceOptions.map((option) => (
                    <FormChip key={option} active={form.entranceFeatures.includes(option)} onClick={() => toggleArrayValue("entranceFeatures", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Парковка</div>
                <div className="flex flex-wrap gap-2">
                  {parkingOptions.map((option) => (
                    <FormChip key={option} active={form.parkingTypes.includes(option)} onClick={() => toggleArrayValue("parkingTypes", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="В квартире есть" open={openSections.equipment} onToggle={() => toggleSection("equipment")}>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Мебель</div>
                <div className="flex flex-wrap gap-2">
                  {furnitureOptions.map((option) => (
                    <FormChip key={option} active={form.furniture.includes(option)} onClick={() => toggleArrayValue("furniture", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Ванная комната</div>
                <div className="flex flex-wrap gap-2">
                  {bathroomFeatureOptions.map((option) => (
                    <FormChip key={option} active={form.bathroomFeatures.includes(option)} onClick={() => toggleArrayValue("bathroomFeatures", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Техника</div>
                <div className="flex flex-wrap gap-2">
                  {applianceOptions.map((option) => (
                    <FormChip key={option} active={form.appliances.includes(option)} onClick={() => toggleArrayValue("appliances", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Связь</div>
                <div className="flex flex-wrap gap-2">
                  {connectivityOptions.map((option) => (
                    <FormChip key={option} active={form.connectivity.includes(option)} onClick={() => toggleArrayValue("connectivity", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Описание" open={openSections.description} onToggle={() => toggleSection("description")}>
            <div className="space-y-4">
              <FormField
                label="Описание"
                value={form.description}
                onChange={(value) => setField("description", value)}
                placeholder="Опишите объект"
                multiline
              />
              <FormField label="Заголовок" value={form.title} onChange={(value) => setField("title", value)} placeholder="Короткий заголовок" />
            </div>
          </FormSection>

          <FormSection title="Цена и условия" open={openSections.price} onToggle={() => toggleSection("price")}>
            <div className="space-y-4">
              <FormField label="Аренда в месяц" value={form.pricePerMonth} onChange={(value) => setField("pricePerMonth", value)} suffix="₽" />

              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">По счётчикам платит</div>
                <div className="flex flex-wrap gap-2">
                  {utilitiesPayerOptions.map((option) => (
                    <FormChip key={option} active={form.utilitiesPayer === option} onClick={() => setField("utilitiesPayer", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[12px] font-medium text-white/62">Предоплата</div>
                <div className="flex flex-wrap gap-2">
                  {prepaymentOptions.map((option) => (
                    <FormChip key={option} active={form.prepaymentMonths === option} onClick={() => setField("prepaymentMonths", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>

              <FormField label="Залог" value={form.deposit} onChange={(value) => setField("deposit", value)} suffix="₽" />

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
                <div className="text-[12px] font-medium text-white/62">Условия проживания</div>
                <div className="flex flex-wrap gap-2">
                  {livingConditionsOptions.map((option) => (
                    <FormChip key={option} active={form.livingConditions.includes(option)} onClick={() => toggleArrayValue("livingConditions", option)}>
                      {option}
                    </FormChip>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Комиссия от другого агента" value={form.otherAgentCommission} onChange={(value) => setField("otherAgentCommission", value)} suffix="%" />
                <FormField label="Комиссия от арендатора" value={form.renterCommission} onChange={(value) => setField("renterCommission", value)} suffix="%" />
              </div>
            </div>
          </FormSection>

    </FormScreenShell>
  );
}

function OwnerCreateScreen({ onClose, onCreated }: { onClose: () => void; onCreated: (card: CrmCard) => void }) {
  const [form, setForm] = useState<OwnerFormState>({
    fullName: "",
    telegram: "",
    email: "",
    role: "Собственник",
    source: "Входящий",
    preferredChannel: "Telegram",
    objectType: "Квартира",
    rooms: "2",
    address: "",
    priceExpectation: "",
    workMode: "Эксклюзив",
    accessMode: [],
    documents: [],
    notes: "",
  });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    contact: true,
    object: true,
    process: false,
    notes: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const setField = <K extends keyof OwnerFormState>(field: K, value: OwnerFormState[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const toggleArrayValue = (field: OwnerArrayField, value: string) => {
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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError("");

      await postJson("/api/owners", form);
      onCreated({
        title: form.address.trim() || `${form.objectType} собственника`,
        price: form.priceExpectation ? `${form.priceExpectation} ₽` : "Цена не указана",
        status: "Новый собственник",
        person: form.fullName.trim() || "Без имени",
        tag: "Собственник",
      });
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
      onClose={onClose}
      footer={
        <div className="space-y-3">
          {saveError ? <div className="text-sm text-[#F2A27A]">{saveError}</div> : null}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 w-full rounded-[20px] bg-[linear-gradient(180deg,#0E6CFF,#005CDB)] text-white hover:bg-[linear-gradient(180deg,#1874FF,#0563E8)] disabled:opacity-60"
          >
            {isSaving ? "Сохраняем собственника..." : "Сохранить собственника"}
          </Button>
        </div>
      }
    >
      <FormSection title="Контакт собственника" open={openSections.contact} onToggle={() => toggleSection("contact")}>
        <div className="space-y-4">
          <FormField label="ФИО" value={form.fullName} onChange={(value) => setField("fullName", value)} placeholder="Имя и фамилия" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Telegram" value={form.telegram} onChange={(value) => setField("telegram", value)} placeholder="@username" />
            <FormField label="Email" value={form.email} onChange={(value) => setField("email", value)} placeholder="name@mail.ru" />
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Роль</div>
            <div className="flex flex-wrap gap-2">
              {ownerRoleOptions.map((option) => (
                <FormChip key={option} active={form.role === option} onClick={() => setField("role", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Источник</div>
            <div className="flex flex-wrap gap-2">
              {ownerSourceOptions.map((option) => (
                <FormChip key={option} active={form.source === option} onClick={() => setField("source", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Предпочтительный канал</div>
            <div className="flex flex-wrap gap-2">
              {ownerChannelOptions.map((option) => (
                <FormChip key={option} active={form.preferredChannel === option} onClick={() => setField("preferredChannel", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Объект и ожидания" open={openSections.object} onToggle={() => toggleSection("object")}>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Тип объекта</div>
            <div className="flex flex-wrap gap-2">
              {clientPropertyTypeOptions.map((option) => (
                <FormChip key={option} active={form.objectType === option} onClick={() => setField("objectType", option)}>
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

          <FormField label="Адрес объекта" value={form.address} onChange={(value) => setField("address", value)} placeholder="Город, улица, дом" />
          <FormField
            label="Ожидание по цене"
            value={form.priceExpectation}
            onChange={(value) => setField("priceExpectation", value)}
            suffix="₽"
            placeholder="Например 250000"
          />
        </div>
      </FormSection>

      <FormSection title="Формат работы" open={openSections.process} onToggle={() => toggleSection("process")}>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Режим работы</div>
            <div className="flex flex-wrap gap-2">
              {ownerWorkModeOptions.map((option) => (
                <FormChip key={option} active={form.workMode === option} onClick={() => setField("workMode", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Доступ к объекту</div>
            <div className="flex flex-wrap gap-2">
              {ownerAccessOptions.map((option) => (
                <FormChip key={option} active={form.accessMode.includes(option)} onClick={() => toggleArrayValue("accessMode", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-white/62">Документы</div>
            <div className="flex flex-wrap gap-2">
              {ownerDocumentOptions.map((option) => (
                <FormChip key={option} active={form.documents.includes(option)} onClick={() => toggleArrayValue("documents", option)}>
                  {option}
                </FormChip>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Заметки" open={openSections.notes} onToggle={() => toggleSection("notes")}>
        <FormField
          label="Комментарий"
          value={form.notes}
          onChange={(value) => setField("notes", value)}
          placeholder="Что важно знать по собственнику и условиям"
          multiline
        />
      </FormSection>
    </FormScreenShell>
  );
}

function ClientCreateScreen({ onClose, onCreated }: { onClose: () => void; onCreated: (card: CrmCard) => void }) {
  const [form, setForm] = useState<ClientFormState>({
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
  });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    client: true,
    request: true,
    location: false,
    conditions: false,
    notes: false,
  });
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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError("");

      await postJson("/api/clients", form);
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
      <FormSection title="Карточка клиента" open={openSections.client} onToggle={() => toggleSection("client")}>
        <div className="space-y-4">
          <FormField label="ФИО" value={form.fullName} onChange={(value) => setField("fullName", value)} placeholder="Имя и фамилия" />
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

      <FormSection title="Запрос" open={openSections.request} onToggle={() => toggleSection("request")}>
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

      <FormSection title="Бюджет и локация" open={openSections.location} onToggle={() => toggleSection("location")}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Бюджет от" value={form.budgetFrom} onChange={(value) => setField("budgetFrom", value)} suffix="₽" />
            <FormField label="Бюджет до" value={form.budgetTo} onChange={(value) => setField("budgetTo", value)} suffix="₽" />
          </div>
          <FormField
            label="Районы"
            value={form.preferredAreas}
            onChange={(value) => setField("preferredAreas", value)}
            placeholder="Например Патрики, Хамовники, Сити"
          />
          <FormField
            label="Метро"
            value={form.preferredMetro}
            onChange={(value) => setField("preferredMetro", value)}
            placeholder="Например Кропоткинская, Смоленская"
          />
        </div>
      </FormSection>

      <FormSection title="Срок и условия" open={openSections.conditions} onToggle={() => toggleSection("conditions")}>
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

      <FormSection title="Заметки" open={openSections.notes} onToggle={() => toggleSection("notes")}>
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

function FunnelScreen({
  createRequest,
}: {
  createRequest: number;
}) {
  const [selectedFunnel, setSelectedFunnel] = useState("selection");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("clarify");
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [activeCreateScreen, setActiveCreateScreen] = useState<CreateEntityType | null>(null);
  const [extraCards, setExtraCards] = useState<Record<string, CrmCard[]>>({});
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
  const activeStageCards = [
    ...(extraCards[stageStorageKey(activeFunnel.id, activeStage.id)] ?? []),
    ...activeStage.cards,
  ];

  useEffect(() => {
    setSelectedStage(activeFunnel.stages[0]?.id ?? "");
  }, [activeFunnel]);

  useEffect(() => {
    if (createRequest > 0) {
      setCreateSheetOpen(true);
      setDrawerOpen(false);
    }
  }, [createRequest]);

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

  if (activeCreateScreen === "property") {
    return (
      <PropertyCreateScreen
        onClose={() => setActiveCreateScreen(null)}
        onCreated={(card) => appendCard("rent", "published", card)}
      />
    );
  }

  if (activeCreateScreen === "owner") {
    return (
      <OwnerCreateScreen
        onClose={() => setActiveCreateScreen(null)}
        onCreated={(card) => appendCard("collection", "no-answer", card)}
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
              <Button className="mb-5 h-11 w-full rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(242,204,122,0.16),rgba(255,255,255,0.03))] text-white hover:bg-[linear-gradient(180deg,rgba(242,204,122,0.20),rgba(255,255,255,0.04))]">
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
              onClick={() => setDrawerOpen((value) => !value)}
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

            <div className="relative overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <div className="flex h-full w-full flex-col gap-3">
                {activeStageCards.map((card) => (
                  <div key={`${activeFunnel.id}-${activeStage.id}-${card.title}`} className="w-full">
                    <StageCard card={card} />
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
                        setActiveCreateScreen(option.id);
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

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => setCreateSheetOpen((value) => !value)}
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
        className="fixed inset-0 z-40 bg-black/26 backdrop-blur-[2px]"
        aria-label="Закрыть поиск"
      />
      <div className="fixed bottom-28 left-0 right-0 z-50 flex justify-center px-4">
        <motion.div
          initial={{ y: "100%", opacity: 0.96 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0.96 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="w-full max-w-[356px]"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/28" />
            <Input
              autoFocus
              placeholder="Поиск по всей базе"
              className="h-12 w-full rounded-[18px] border-white/14 bg-[#2A2E35]/92 pl-11 text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] placeholder:text-white/32 focus-visible:border-white/20 focus-visible:ring-0"
            />
          </div>
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
  const [active, setActive] = useState("crm");
  const [searchOpen, setSearchOpen] = useState(false);
  const [crmCreateRequest, setCrmCreateRequest] = useState(0);

  const handleNavChange = (id: string) => {
    if (id === "crm" && active === "crm") {
      setSearchOpen(true);
      return;
    }

    setSearchOpen(false);
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
        return <FunnelScreen createRequest={crmCreateRequest} />;
    }
  }, [active, crmCreateRequest]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(242,204,122,0.10),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.06),transparent_20%),linear-gradient(180deg,#07080A_0%,#0A0C10_54%,#090A0D_100%)] px-3 py-6">
      <AmbientGlow className="left-[4%] top-0 h-56 w-56 bg-[#F2CC7A]/10" />
      <AmbientGlow className="right-[8%] top-28 h-44 w-44 bg-white/6" />
      <div className="relative mx-auto max-w-[420px]">{screen}</div>
      <SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />
      <BottomBar active={active} onChange={handleNavChange} searchOpen={searchOpen} />
    </div>
  );
}
