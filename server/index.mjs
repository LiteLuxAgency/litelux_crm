import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import multer from "multer";
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
const crmDb = supabase.schema("crm");
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "crm-photos";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 20,
    fileSize: 15 * 1024 * 1024,
  },
});
const allowedPhotoMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
let bucketReady = false;

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

const toSlug = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "photo";

const resolvePhotoExtension = (file) => {
  const originalExtension = path.extname(file.originalname || "").toLowerCase();
  if (originalExtension) {
    return originalExtension;
  }

  const mimeMap = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/heic": ".heic",
    "image/heif": ".heif",
  };

  return mimeMap[file.mimetype] || ".jpg";
};

const ensureStorageBucket = async () => {
  if (bucketReady) {
    return;
  }

  const { error: bucketError } = await supabase.storage.getBucket(storageBucket);

  if (bucketError) {
    const { error: createError } = await supabase.storage.createBucket(storageBucket, {
      public: true,
      fileSizeLimit: 15 * 1024 * 1024,
      allowedMimeTypes: [...allowedPhotoMimeTypes],
    });

    if (createError && !/already exists/i.test(createError.message)) {
      throw createError;
    }
  }

  bucketReady = true;
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

const readLocalRecords = async (fileName) => {
  await fs.mkdir(dataDir, { recursive: true });
  const filePath = path.join(dataDir, fileName);

  return fs
    .readFile(filePath, "utf8")
    .then((content) => JSON.parse(content))
    .catch(() => []);
};

app.get("/", (_req, res) => {
  res.status(200).type("text/plain").send("LiteLux CRM API работает. Открой фронт на http://127.0.0.1:4175");
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, schema: "crm" });
});

const handleListOwners = async (_req, res) => {
  const { data: owners, error } = await crmDb
    .from("owners")
    .select("id, full_name, phone, phone_type")
    .order("updated_at", { ascending: false });

  if (error) {
    const localOwners = await readLocalRecords("owners.json");
    return res.status(200).json({ owners: localOwners, storage: "local", warning: error.message });
  }

  return res.status(200).json({ owners: owners ?? [] });
};

app.get("/api/owners", handleListOwners);
app.get(/^\/api\/owners\/?$/, handleListOwners);

app.post("/api/uploads/property-photos", upload.array("photos", 20), async (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];

  if (files.length === 0) {
    return res.status(400).json({ error: "Не выбраны файлы для загрузки" });
  }

  try {
    await ensureStorageBucket();

    const uploadedFiles = [];

    for (const file of files) {
      if (!allowedPhotoMimeTypes.has(file.mimetype)) {
        return res.status(400).json({ error: `Формат ${file.mimetype} не поддерживается` });
      }

      const extension = resolvePhotoExtension(file);
      const objectPath = `properties/${new Date().toISOString().slice(0, 10)}/${toSlug(file.originalname)}-${randomUUID()}${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(objectPath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicFile } = supabase.storage.from(storageBucket).getPublicUrl(objectPath);

      uploadedFiles.push({
        name: file.originalname,
        path: objectPath,
        publicUrl: publicFile.publicUrl,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    return res.status(201).json({ files: uploadedFiles, bucket: storageBucket });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Не удалось загрузить фотографии",
    });
  }
});

app.delete("/api/uploads/property-photos", async (req, res) => {
  const paths = Array.isArray(req.body?.paths) ? req.body.paths.filter(Boolean) : [];

  if (paths.length === 0) {
    return res.json({ ok: true });
  }

  const { error } = await supabase.storage.from(storageBucket).remove(paths);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.json({ ok: true, removed: paths.length });
});

app.post("/api/owners", async (req, res) => {
  const payload = req.body ?? {};
  const stageKey = payload.stageKey || "no-answer";
  const stageTitle = payload.stageTitle || "Нет ответа";

  const ownerRecord = {
    full_name: payload.fullName,
    phone: toNullableText(payload.phone),
    phone_type: toNullableText(payload.phoneType) ?? "неизвестно",
    telegram: null,
    email: null,
    role: "Собственник",
    source: "Входящий",
    preferred_channel: "Телефон",
    object_type: null,
    rooms: null,
    address: toNullableText(payload.objectAddress),
    price_expectation_rub: toInteger(payload.objectPrice),
    work_mode: toNullableText(payload.exclusiveState) ?? "думает",
    access_mode_json: "[]",
    documents_json: "[]",
    stage_key: stageKey,
    next_action: toNullableText(payload.nextAction),
    next_action_at: toNullableText(payload.nextActionAt),
    notes: toNullableText(payload.comment),
    agent_experience: toNullableText(payload.agentExperience),
    leads_state: toNullableText(payload.leadsState),
    showings_state: toNullableText(payload.showingsState),
    commission_pct: toReal(payload.commissionPercent),
    cooperation_state: toNullableText(payload.cooperationState),
    duplicate_state: toNullableText(payload.duplicateState),
    exclusive_state: toNullableText(payload.exclusiveState),
    deal_type: toNullableText(payload.dealType),
    object_complex: toNullableText(payload.objectComplex),
    object_price_text: toNullableText(payload.objectPrice),
    object_link: toNullableText(payload.objectLink),
    return_at: toNullableText(payload.returnDate),
    last_contact_at: null,
    touch_count: 0,
    responsible: null,
  };

  const { data: owner, error: ownerError } = await crmDb.from("owners").insert(ownerRecord).select().single();

  if (ownerError) {
    const localOwner = await appendLocalRecord("owners.json", ownerRecord);
    await appendLocalRecord("funnel_cards.json", {
      funnel_key: "collection",
      stage_key: stageKey,
      owner_id: localOwner.id,
      title: localOwner.full_name || "Собственник",
      amount_text: localOwner.phone || "Телефон не указан",
      status_text: localOwner.next_action || "Без действия",
      person_name: stageTitle,
      badge_text: "Собственник",
    });
    return res.status(201).json({ owner: localOwner, storage: "local", warning: ownerError.message });
  }

  await crmDb.from("funnel_cards").insert({
    funnel_key: "collection",
    stage_key: stageKey,
    owner_id: owner.id,
    title: owner.full_name || "Собственник",
    amount_text: owner.phone || "Телефон не указан",
    status_text: owner.next_action || "Без действия",
    person_name: stageTitle,
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

  const { data: client, error: clientError } = await crmDb.from("clients").insert(clientRecord).select().single();

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

  const { data: request, error: requestError } = await crmDb
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

  await crmDb.from("funnel_cards").insert({
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
  const basicInfo = payload.basicInfo ?? {};
  const location = payload.location ?? {};
  const pricing = payload.pricing ?? {};
  const layout = payload.layout ?? {};
  const interior = payload.interior ?? {};
  const building = payload.building ?? {};
  const media = payload.media ?? {};
  const publication = payload.publication ?? {};
  const crmMeta = payload.crmMeta ?? {};

  const composedAddress = [
    toNullableText(location.city),
    toNullableText(location.street),
    toNullableText(location.houseNumber),
  ]
    .filter(Boolean)
    .join(", ");

  const propertyType = payload.propertyType === "apartments" ? "apartments" : "flat";
  const externalId =
    toNullableText(publication.externalId) ??
    `LL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const propertyRecord = {
    owner_id: toInteger(payload.ownerId) || null,
    deal_type: payload.dealType === "rent" ? "rent" : "rent",
    rent_type: payload.rentType === "long_term" ? "long_term" : "long_term",
    status: payload.status || "draft",
    category: "residential",
    object_type: propertyType,
    property_type: propertyType,
    realty_kind: propertyType === "apartments" ? "Апартаменты" : "Квартира",
    title: toNullableText(basicInfo.internalTitle),
    internal_title: toNullableText(basicInfo.internalTitle),
    residential_complex_name: toNullableText(basicInfo.residentialComplexName),
    short_description: toNullableText(basicInfo.shortDescription),
    full_description: toNullableText(basicInfo.fullDescription),
    description: toNullableText(basicInfo.fullDescription),
    city: toNullableText(location.city),
    street: toNullableText(location.street),
    house_number: toNullableText(location.houseNumber),
    building_number: toNullableText(location.buildingNumber),
    block_number: toNullableText(location.blockNumber),
    entrance_number: toNullableText(location.entranceNumber),
    address: composedAddress,
    floor_number: toInteger(location.floorNumber) || null,
    floors_total: toInteger(location.totalFloors) || null,
    apartment_number: toNullableText(location.apartmentNumber),
    cadastral_number: toNullableText(location.cadastralNumber),
    underground_station: toNullableText(location.undergroundStation),
    underground_time_minutes: toInteger(location.undergroundTimeMinutes) || null,
    underground_transport_type: toNullableText(location.undergroundTransportType),
    lat: toReal(location.lat),
    lng: toReal(location.lng),
    rent_price_rub: toInteger(pricing.rentPrice),
    currency: "RUB",
    deposit_amount: toReal(pricing.depositAmount),
    deposit_rub: toInteger(pricing.depositAmount),
    commission_amount: toReal(pricing.commissionAmount),
    commission_type: toNullableText(pricing.commissionType),
    utilities_mode: toNullableText(pricing.utilitiesMode),
    utilities_comment: toNullableText(pricing.utilitiesComment),
    prepayment_months: toInteger(pricing.prepaymentMonths) || null,
    minimum_rent_term_months: toInteger(pricing.minimumRentTermMonths) || null,
    total_area_m2: toReal(layout.totalArea),
    living_area_m2: toReal(layout.livingArea),
    kitchen_area_m2: toReal(layout.kitchenArea),
    layout_type: toNullableText(layout.layoutType),
    is_studio: Boolean(layout.isStudio),
    is_free_layout: Boolean(layout.isFreeLayout),
    ceiling_height_m: toReal(layout.ceilingHeight),
    balcony_count: toInteger(layout.balconyCount),
    loggia_count: toInteger(layout.loggiaCount),
    bathroom_separate_count: toInteger(layout.bathroomSeparateCount),
    bathroom_combined_count: toInteger(layout.bathroomCombinedCount),
    windows_view: toNullableText(layout.windowsView),
    window_views_json: JSON.stringify(layout.windowsView ? [layout.windowsView] : []),
    repair_type: toNullableText(interior.repairType),
    renovation_type: toNullableText(interior.repairType),
    furniture_mode: toNullableText(interior.furnitureMode),
    furniture_json: JSON.stringify(
      [
        interior.hasBath ? "bath" : null,
        interior.hasShower ? "shower" : null,
        interior.hasConditioner ? "conditioner" : null,
        interior.hasRefrigerator ? "refrigerator" : null,
        interior.hasDishwasher ? "dishwasher" : null,
        interior.hasTv ? "tv" : null,
        interior.hasWasher ? "washer" : null,
        interior.hasInternet ? "internet" : null,
        interior.hasPhone ? "phone" : null,
        interior.hasWardrobeRoom ? "wardrobe_room" : null,
        interior.hasStorageRoom ? "storage_room" : null,
        interior.hasPanoramicWindows ? "panoramic_windows" : null,
        interior.hasTerrace ? "terrace" : null,
        interior.hasFireplace ? "fireplace" : null,
      ].filter(Boolean),
    ),
    bathroom_features_json: JSON.stringify(
      [interior.hasBath ? "bath" : null, interior.hasShower ? "shower" : null].filter(Boolean),
    ),
    appliances_json: JSON.stringify(
      [
        interior.hasConditioner ? "conditioner" : null,
        interior.hasRefrigerator ? "refrigerator" : null,
        interior.hasDishwasher ? "dishwasher" : null,
        interior.hasTv ? "tv" : null,
        interior.hasWasher ? "washer" : null,
      ].filter(Boolean),
    ),
    connectivity_json: JSON.stringify(
      [interior.hasInternet ? "internet" : null, interior.hasPhone ? "phone" : null].filter(Boolean),
    ),
    has_bath: Boolean(interior.hasBath),
    has_shower: Boolean(interior.hasShower),
    has_conditioner: Boolean(interior.hasConditioner),
    has_refrigerator: Boolean(interior.hasRefrigerator),
    has_dishwasher: Boolean(interior.hasDishwasher),
    has_tv: Boolean(interior.hasTv),
    has_washer: Boolean(interior.hasWasher),
    has_internet: Boolean(interior.hasInternet),
    has_phone: Boolean(interior.hasPhone),
    has_wardrobe_room: Boolean(interior.hasWardrobeRoom),
    has_storage_room: Boolean(interior.hasStorageRoom),
    has_panoramic_windows: Boolean(interior.hasPanoramicWindows),
    has_terrace: Boolean(interior.hasTerrace),
    has_fireplace: Boolean(interior.hasFireplace),
    passenger_lifts_count: toInteger(building.passengerLiftsCount),
    cargo_lifts_count: toInteger(building.cargoLiftsCount),
    elevator_passenger_count: toInteger(building.passengerLiftsCount),
    elevator_cargo_count: toInteger(building.cargoLiftsCount),
    has_ramp: Boolean(building.hasRamp),
    has_garbage_chute: Boolean(building.hasGarbageChute),
    has_concierge: Boolean(building.hasConcierge),
    has_security: Boolean(building.hasSecurity),
    entrance_features_json: JSON.stringify(
      [
        building.hasRamp ? "ramp" : null,
        building.hasGarbageChute ? "garbage_chute" : null,
        building.hasConcierge ? "concierge" : null,
        building.hasSecurity ? "security" : null,
      ].filter(Boolean),
    ),
    parking_types_json: JSON.stringify(Array.isArray(building.parkingTypes) ? building.parkingTypes : []),
    photo_count: Array.isArray(media.photos) ? media.photos.length : 0,
    photo_files_json: JSON.stringify(Array.isArray(media.photos) ? media.photos : []),
    video_url: toNullableText(media.videoUrl),
    vk_video_url: toNullableText(media.vkVideoUrl),
    tour_3d_url: toNullableText(media.tour3dUrl),
    layout_image_url: toNullableText(media.layoutImageUrl),
    external_id: externalId,
    xml_category: publication.xmlCategory || "flatRent",
    is_ready_for_export: Boolean(publication.isReadyForExport),
    manager_id: toNullableText(crmMeta.managerId),
    liquidity_level: toNullableText(crmMeta.liquidityLevel),
    market_price_level: toNullableText(crmMeta.marketPriceLevel),
    agent_comment: toNullableText(crmMeta.agentComment),
    basic_info_json: JSON.stringify(basicInfo),
    location_json: JSON.stringify(location),
    pricing_json: JSON.stringify(pricing),
    layout_json: JSON.stringify(layout),
    interior_json: JSON.stringify(interior),
    building_json: JSON.stringify(building),
    media_json: JSON.stringify(media),
    publication_json: JSON.stringify({ ...publication, externalId }),
    crm_meta_json: JSON.stringify(crmMeta),
  };

  const propertyTitle =
    propertyRecord.internal_title ||
    `${propertyRecord.property_type === "apartments" ? "Апартаменты" : "Квартира"}${propertyRecord.total_area_m2 ? ` · ${propertyRecord.total_area_m2} м²` : ""}`;
  const propertyPerson = composedAddress || "Адрес не заполнен";

  const { data: property, error: propertyError } = await crmDb
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
      title: propertyTitle,
      amount_text: localProperty.rent_price_rub ? `${localProperty.rent_price_rub} ₽/мес` : "Цена не указана",
      status_text: "Новый объект",
      person_name: propertyPerson,
      badge_text: "Объект",
    });
    return res.status(201).json({ property: localProperty, storage: "local", warning: propertyError.message });
  }

  await crmDb.from("funnel_cards").insert({
    funnel_key: "rent",
    stage_key: "published",
    object_id: property.id,
    title: propertyTitle,
    amount_text: property.rent_price_rub ? `${property.rent_price_rub} ₽/мес` : "Цена не указана",
    status_text: "Новый объект",
    person_name: propertyPerson,
    badge_text: "Объект",
  });

  return res.status(201).json({ property });
});

const server = app.listen(Number(PORT), "127.0.0.1", () => {
  console.log(`API ready on http://127.0.0.1:${PORT}`);
});

let shuttingDown = false;

const shutdown = (signal) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`API stopping by ${signal}...`);

  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 5000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// В некоторых non-interactive запусках процесс Node завершался сразу после listen.
// Отдельный таймер удерживает event loop активным до сигнала завершения.
const keepAliveTimer = setInterval(() => {}, 60_000);
