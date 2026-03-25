import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const API_URL = process.env.VIETNAM_REGION_SOURCE_URL ?? "https://provinces.open-api.vn/api/v1/?depth=2";
const OUTPUT_PATH = path.resolve(process.cwd(), "shared", "regions", "vietnam-regions.provider.json");

function ensureString(value) {
  return typeof value === "string" ? value : "";
}

function ensureNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeProvince(item) {
  const districts = Array.isArray(item.districts) ? item.districts : [];

  return {
    name: ensureString(item.name),
    code: ensureNumber(item.code),
    codename: ensureString(item.codename),
    division_type: ensureString(item.division_type),
    phone_code: ensureNumber(item.phone_code),
    districts: districts.map((district) => ({
      name: ensureString(district.name),
      code: ensureNumber(district.code),
      codename: ensureString(district.codename),
      division_type: ensureString(district.division_type),
      province_code: ensureNumber(district.province_code),
    })),
  };
}

async function main() {
  console.log(`[regions:sync] Fetching provider snapshot from ${API_URL}`);

  const response = await fetch(API_URL, {
    headers: {
      accept: "application/json",
      "user-agent": "FootGo Region Sync Script",
    },
  });

  if (!response.ok) {
    throw new Error(`Provider request failed with HTTP ${response.status}`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error("Unexpected provider response shape.");
  }

  const provinces = payload.map(normalizeProvince).filter((province) => province.name && province.code !== null);

  const snapshot = {
    source: "Province Open API v1",
    source_url: API_URL,
    synced_at: new Date().toISOString(),
    note: "Provider snapshot only. Runtime app data still uses shared/regions/vietnam-regions.ts until manual reconciliation.",
    province_count: provinces.length,
    district_count: provinces.reduce((total, province) => total + province.districts.length, 0),
    provinces,
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  console.log(`[regions:sync] Wrote ${snapshot.province_count} provinces and ${snapshot.district_count} districts to ${OUTPUT_PATH}`);
  console.log("[regions:sync] Next step: review provider snapshot and reconcile internal runtime codes in shared/regions/vietnam-regions.ts.");
}

main().catch((error) => {
  console.error("[regions:sync] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});