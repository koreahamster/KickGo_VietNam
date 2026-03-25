import {
  isValidVietnamDistrictCode,
  isValidVietnamProvinceCode,
} from "../../../shared/regions/vietnam-regions.ts";
import type {
  AccountType,
  ConsentType,
  SupportedFoot,
  SupportedLanguage,
  SupportedPlayStyle,
  SupportedPosition,
  SupportedVisibility,
} from "./types.ts";

const SUPPORTED_LANGUAGES = ["vi", "ko", "en"] as const;
const ACCOUNT_TYPES = ["player", "referee", "facility_manager"] as const;
const CONSENT_TYPES = ["privacy_policy", "marketing"] as const;
const SUPPORTED_FEET = ["left", "right", "both"] as const;
const SUPPORTED_POSITIONS = ["GK", "CB", "FB", "DM", "CM", "AM", "WG", "ST"] as const;
const SUPPORTED_VISIBILITY = ["public", "members_only", "private"] as const;
const SUPPORTED_PLAY_STYLES = [
  "aggressive",
  "defensive",
  "dribbler",
  "build_up",
  "physical",
  "speed",
  "creative",
  "team_player",
  "scorer",
  "defender",
] as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function asOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error("String value is invalid.");
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return trimmedValue;
}

export function readRequiredString(body: Record<string, unknown>, key: string): string {
  const value = body[key];

  if (!isNonEmptyString(value)) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

export function readOptionalString(body: Record<string, unknown>, key: string): string | undefined {
  return asOptionalString(body[key]);
}

export function readRequiredBoolean(body: Record<string, unknown>, key: string): boolean {
  const value = body[key];

  if (typeof value !== "boolean") {
    throw new Error(`${key} must be a boolean.`);
  }

  return value;
}

export function readOptionalNullableNumber(
  body: Record<string, unknown>,
  key: string,
): number | null | undefined {
  const value = body[key];

  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${key} must be a number or null.`);
  }

  return value;
}

export function assertAccountType(value: string): AccountType {
  if ((ACCOUNT_TYPES as readonly string[]).includes(value)) {
    return value as AccountType;
  }

  throw new Error("Unsupported account type.");
}

export function assertConsentType(value: string): ConsentType {
  if ((CONSENT_TYPES as readonly string[]).includes(value)) {
    return value as ConsentType;
  }

  throw new Error("Unsupported consent type.");
}

export function assertLanguage(value: string): SupportedLanguage {
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(value)) {
    return value as SupportedLanguage;
  }

  throw new Error("Unsupported preferred language.");
}

export function assertFoot(value: string): SupportedFoot {
  if ((SUPPORTED_FEET as readonly string[]).includes(value)) {
    return value as SupportedFoot;
  }

  throw new Error("Unsupported foot option.");
}

export function assertPosition(value: string): SupportedPosition {
  if ((SUPPORTED_POSITIONS as readonly string[]).includes(value)) {
    return value as SupportedPosition;
  }

  throw new Error("Unsupported preferred position.");
}

export function assertVisibility(value: string): SupportedVisibility {
  if ((SUPPORTED_VISIBILITY as readonly string[]).includes(value)) {
    return value as SupportedVisibility;
  }

  throw new Error("Unsupported visibility option.");
}

export function assertBirthYear(value: number | null | undefined): number | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }

  const currentYear = new Date().getFullYear();

  if (value < 1900 || value > currentYear) {
    throw new Error("birth_year is out of range.");
  }

  return value;
}

export function readOptionalStringArray(body: Record<string, unknown>, key: string): string[] | undefined {
  const value = body[key];

  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error(`${key} must be an array.`);
  }

  return value.map((item) => {
    if (typeof item !== "string") {
      throw new Error(`${key} contains a non-string value.`);
    }

    const trimmed = item.trim();

    if (!trimmed) {
      throw new Error(`${key} contains an empty value.`);
    }

    return trimmed;
  });
}

export function assertFootSkill(value: number): number {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("Foot skill must be an integer between 1 and 5.");
  }

  return value;
}

export function assertPlayStyles(values: string[]): SupportedPlayStyle[] {
  if (values.length > 3) {
    throw new Error("A maximum of 3 play styles can be selected.");
  }

  const deduped = Array.from(new Set(values));

  for (const value of deduped) {
    if (!(SUPPORTED_PLAY_STYLES as readonly string[]).includes(value)) {
      throw new Error("Unsupported play style option.");
    }
  }

  return deduped as SupportedPlayStyle[];
}

export function assertRegion(countryCode: string, provinceCode: string, districtCode: string): void {
  if (countryCode !== "VN") {
    throw new Error("MVP currently supports only country_code=VN.");
  }

  if (!isValidVietnamProvinceCode(provinceCode)) {
    throw new Error("Unsupported province_code.");
  }

  if (!isValidVietnamDistrictCode(provinceCode, districtCode)) {
    throw new Error("district_code does not belong to the selected province_code.");
  }
}