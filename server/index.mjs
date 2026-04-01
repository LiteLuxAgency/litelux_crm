import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PORT = 4176 } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Не заполнены SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY");
}

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

app.use(cors());
app.use(express.json());

const toInteger = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const normalized = String(value).replace(/[^\d.-]/g, "");
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toReal = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const normalized = String(value).replace(",", ".").replace(/[^\d.-]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const toNullableText = (value) => {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
};

const appendLocalRecord = async (fileName, record) => {
  await fs.mkdir(dataDir, { recursive: true });
  const filePath = path.join(dataDir, fileName);
  const current = await fs
    .readFile(filePath, "utf8")
    .then((content) => JSON.parse(content))
    .catch(() => []);

  const nextRecord = {
    id: Date.now(),
    ...record,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  current.unshift(nextRecord);
  await fs.writeFile(filePath, JSON.stringify(current, null, 2), "utf8");
  return nextRecord;
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/owners", async (req, res) => {
  const payload = req.body ?? {};

  const ownerRecord = {
    full_name: payload.fullName,
    telegram: toNullableText(payload.telegram),
    email: toNullableText(payload.email),
    role: payload.role,
    source: payload.source,
    preferred_channel: payload.preferredChannel,
    object_type: payload.objectType,
    rooms: payload.rooms,
    address: toNullableText(payload.address),
    price_expectation_rub: toInteger(payload.priceExpectation),
    work_mode: payload.workMode,
    access_mode_json: JSON.stringify(payload.accessMode ?? []),
    documents_json: JSON.stringify(payload.documents ?? []),
    notes: toNullableText(payload.notes),
  };

  const { data: owner, error: ownerError } = await supabase.from("owners").insert(ownerRecord).select().single();

  if (ownerError) {
    const localOwner = await appendLocalRecord("owners.json", ownerRecord);
    await appendLocalRecord("funnel_cards.json", {
      funnel_key: "collection",
      stage_key: "no-answer",
      owner_id: localOwner.id,
      title: localOwner.address || `${localOwner.object_type || "Объект"} собственника`,
      amount_text: localOwner.price_expectation_rub ? `${localOwner.price_expectation_rub} ₽` : "Цена не указана",
      status_text: "Новый собственник",
      person_name: localOwner.full_name,
      badge_text: "Собственник",
    });
    return res.status(201).json({ owner: localOwner, storage: "local", warning: ownerError.message });
  }

  await supabase.from("funnel_cards").insert({
    funnel_key: "collection",
    stage_key: "no-answer",
    owner_id: owner.id,
    title: owner.address || `${owner.object_type || "Объект"} собственника`,
    amount_text: owner.price_expectation_rub ? `${owner.price_expectation_rub} ₽` : "Цена не указана",
    status_text: "Новый собственник",
    person_name: owner.full_name,
    badge_text: "Собственник",
  });

  return res.status(201).json({ owner });
});

app.post("/api/clients", async (req, res) => {
  const payload = req.body ?? {};

  const clientRecord = {
    full_name: payload.fullName,
    telegram: toNullableText(payload.telegram),
    email: toNullableText(payload.email),
    source: payload.source,
    preferred_channel: payload.preferredChannel,
    request_type: payload.requestType,
    property_type: payload.propertyType,
    rooms: payload.rooms,
    budget_from_rub: toInteger(payload.budgetFrom),
    budget_to_rub: toInteger(payload.budgetTo),
    preferred_areas: toNullableText(payload.preferredAreas),
    preferred_metro: toNullableText(payload.preferredMetro),
    move_in_window: payload.moveIn,
    rent_term: payload.rentTerm,
    preferences_json: JSON.stringify(payload.preferences ?? []),
    notes: toNullableText(payload.notes),
  };

  const { data: client, error: clientError } = await supabase.from("clients").insert(clientRecord).select().single();

  if (clientError) {
    const localClient = await appendLocalRecord("clients.json", clientRecord);
    const localRequest = await appendLocalRecord("client_requests.json", {
      client_id: localClient.id,
      funnel_key: "selection",
      stage_key: "clarify",
      property_type: localClient.property_type,
      rooms: localClient.rooms,
      budget_from_rub: localClient.budget_from_rub,
      budget_to_rub: localClient.budget_to_rub,
      preferred_areas: localClient.preferred_areas,
      preferred_metro: localClient.preferred_metro,
      move_in_window: localClient.move_in_window,
      rent_term: localClient.rent_term,
      preferences_json: localClient.preferences_json,
      notes: localClient.notes,
    });
    await appendLocalRecord("funnel_cards.json", {
      funnel_key: "selection",
      stage_key: "clarify",
      client_id: localClient.id,
      request_id: localRequest.id,
      title: localClient.full_name ? `Запрос клиента: ${localClient.full_name}` : "Новый клиентский запрос",
      amount_text: localClient.budget_to_rub ? `Бюджет до ${localClient.budget_to_rub} ₽` : "Бюджет не указан",
      status_text: "Новый запрос",
      person_name: localClient.preferred_areas || "Локация не указана",
      badge_text: "Клиент",
    });
    return res.status(201).json({ client: localClient, request: localRequest, storage: "local", warning: clientError.message });
  }

  const { data: request, error: requestError } = await supabase
    .from("client_requests")
    .insert({
      client_id: client.id,
      funnel_key: "selection",
      stage_key: "clarify",
      property_type: client.property_type,
      rooms: client.rooms,
      budget_from_rub: client.budget_from_rub,
      budget_to_rub: client.budget_to_rub,
      preferred_areas: client.preferred_areas,
      preferred_metro: client.preferred_metro,
      move_in_window: client.move_in_window,
      rent_term: client.rent_term,
      preferences_json: client.preferences_json,
      notes: client.notes,
    })
    .select()
    .single();

  if (requestError) {
    return res.status(400).json({ error: requestError.message });
  }

  await supabase.from("funnel_cards").insert({
    funnel_key: "selection",
    stage_key: "clarify",
    client_id: client.id,
    request_id: request.id,
    title: client.full_name ? `Запрос клиента: ${client.full_name}` : "Новый клиентский запрос",
    amount_text: client.budget_to_rub ? `Бюджет до ${client.budget_to_rub} ₽` : "Бюджет не указан",
    status_text: "Новый запрос",
    person_name: client.preferred_areas || "Локация не указана",
    badge_text: "Клиент",
  });

  return res.status(201).json({ client, request });
});

app.post("/api/properties", async (req, res) => {
  const payload = req.body ?? {};

  const propertyRecord = {
    deal_type: "long_rent",
    category: "residential",
    object_type: payload.objectType,
    room_mode: payload.rooms,
    total_area_m2: toReal(payload.totalArea),
    living_area_m2: toReal(payload.livingArea),
    kitchen_area_m2: toReal(payload.kitchenArea),
    layout_type: payload.layout,
    ceiling_height_m: toReal(payload.ceilingHeight),
    floor_number: toInteger(payload.floor),
    floors_total: toInteger(payload.floorsTotal),
    address: payload.address,
    apartment_number: toNullableText(payload.apartmentNumber),
    cadastral_number: toNullableText(payload.cadastralNumber),
    realty_kind: payload.realtyKind,
    photo_count: toInteger(payload.photoCount),
    balcony_count: toInteger(payload.balconyCount),
    loggia_count: toInteger(payload.loggiaCount),
    window_views_json: JSON.stringify(payload.windowViews ?? []),
    bathroom_separate_count: toInteger(payload.bathroomSeparate),
    bathroom_combined_count: toInteger(payload.bathroomCombined),
    renovation_type: toNullableText(payload.renovation),
    elevator_passenger_count: toInteger(payload.elevatorPassenger),
    elevator_cargo_count: toInteger(payload.elevatorCargo),
    entrance_features_json: JSON.stringify(payload.entranceFeatures ?? []),
    parking_types_json: JSON.stringify(payload.parkingTypes ?? []),
    furniture_json: JSON.stringify(payload.furniture ?? []),
    bathroom_features_json: JSON.stringify(payload.bathroomFeatures ?? []),
    appliances_json: JSON.stringify(payload.appliances ?? []),
    connectivity_json: JSON.stringify(payload.connectivity ?? []),
    description: toNullableText(payload.description),
    title: toNullableText(payload.title),
    rent_price_rub: toInteger(payload.pricePerMonth),
    utilities_payer: payload.utilitiesPayer,
    prepayment_months: payload.prepaymentMonths,
    deposit_rub: toInteger(payload.deposit),
    rent_term: payload.rentTerm,
    living_conditions_json: JSON.stringify(payload.livingConditions ?? []),
    other_agent_commission_pct: toReal(payload.otherAgentCommission),
    renter_commission_pct: toReal(payload.renterCommission),
  };

  const { data: property, error: propertyError } = await supabase
    .from("residential_rent_objects")
    .insert(propertyRecord)
    .select()
    .single();

  if (propertyError) {
    const localProperty = await appendLocalRecord("properties.json", propertyRecord);
    await appendLocalRecord("funnel_cards.json", {
      funnel_key: "rent",
      stage_key: "published",
      object_id: localProperty.id,
      title: localProperty.title || `${localProperty.object_type} · ${localProperty.total_area_m2 || 0} м²`,
      amount_text: localProperty.rent_price_rub ? `${localProperty.rent_price_rub} ₽/мес` : "Цена не указана",
      status_text: "Новый объект",
      person_name: localProperty.address,
      badge_text: "Объект",
    });
    return res.status(201).json({ property: localProperty, storage: "local", warning: propertyError.message });
  }

  await supabase.from("funnel_cards").insert({
    funnel_key: "rent",
    stage_key: "published",
    object_id: property.id,
    title: property.title || `${property.object_type} · ${property.total_area_m2 || 0} м²`,
    amount_text: property.rent_price_rub ? `${property.rent_price_rub} ₽/мес` : "Цена не указана",
    status_text: "Новый объект",
    person_name: property.address,
    badge_text: "Объект",
  });

  return res.status(201).json({ property });
});

app.listen(Number(PORT), "127.0.0.1", () => {
  console.log(`API ready on http://127.0.0.1:${PORT}`);
});
