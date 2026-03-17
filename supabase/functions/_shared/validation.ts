import type { AccountType, SupportedFoot, SupportedLanguage, SupportedPosition } from "./types.ts";

const SUPPORTED_LANGUAGES = ["vi", "ko", "en"] as const;
const ACCOUNT_TYPES = ["player", "referee", "facility_manager"] as const;
const SUPPORTED_FEET = ["left", "right", "both"] as const;
const SUPPORTED_POSITIONS = ["GK", "CB", "FB", "DM", "CM", "AM", "WG", "ST"] as const;

const VIETNAM_PROVINCES: Record<string, readonly string[]> = {
  HCM: ["HCM-D1", "HCM-D3", "HCM-D7", "HCM-BTH", "HCM-TP", "HCM-TD"],
  HAN: ["HAN-BD", "HAN-HK", "HAN-DD", "HAN-CG", "HAN-HD", "HAN-NTL"],
  DAD: ["DAD-HC", "DAD-TK", "DAD-ST", "DAD-NHS", "DAD-CL", "DAD-LC"],
  HUE: ["HUE-PH", "HUE-PB", "HUE-TH", "HUE-HT", "HUE-HY", "HUE-PD"],
  HPH: ["HPH-HB", "HPH-NQ", "HPH-LC", "HPH-KA", "HPH-HA", "HPH-DK"],
  CTO: ["CTO-NK", "CTO-BT", "CTO-CR", "CTO-OM", "CTO-TN", "CTO-PD"],
  BDU: ["BDU-TDM", "BDU-DAN", "BDU-TA", "BDU-BC", "BDU-TU", "BDU-BB"],
  DNA: ["DNA-BH", "DNA-LK", "DNA-NT", "DNA-TB", "DNA-LT", "DNA-VC"],
  BRV: ["BRV-VT", "BRV-BR", "BRV-PM", "BRV-LD", "BRV-DD", "BRV-XM"],
  KHH: ["KHH-NT", "KHH-CR", "KHH-NH", "KHH-DK", "KHH-CL", "KHH-VN"],
  LDO: ["LDO-DL", "LDO-BL", "LDO-DT", "LDO-DL2", "LDO-LD", "LDO-DD"],
  DLK: ["DLK-BMT", "DLK-EK", "DLK-KP", "DLK-CMG", "DLK-BD", "DLK-KA"],
  QNI: ["QNI-HL", "QNI-CP", "QNI-UB", "QNI-MC", "QNI-QY", "QNI-DT"],
  BNH: ["BNH-BNC", "BNH-TS", "BNH-YP", "BNH-QV", "BNH-TT", "BNH-TD"],
  HDU: ["HDU-HDC", "HDU-CL", "HDU-CG", "HDU-KM", "HDU-NS", "HDU-TK"],
  QNA: ["QNA-TK", "QNA-HA", "QNA-DB", "QNA-NT", "QNA-DX", "QNA-TB"],
  BDI: ["BDI-QN", "BDI-AN", "BDI-HN", "BDI-TP", "BDI-PC", "BDI-TS"],
  PYE: ["PYE-TH", "PYE-SC", "PYE-DH", "PYE-TH2", "PYE-TA", "PYE-SH"],
  LAN: ["LAN-TA", "LAN-BL", "LAN-DH", "LAN-CG", "LAN-CD", "LAN-KT"],
  AGI: ["AGI-LX", "AGI-CD", "AGI-TC", "AGI-CP", "AGI-CM", "AGI-TS"],
  KGG: ["KGG-RG", "KGG-PQ", "KGG-HT", "KGG-KL", "KGG-HD", "KGG-CT"],
  DTP: ["DTP-CL", "DTP-SD", "DTP-HN", "DTP-LV", "DTP-TM", "DTP-TB"],
  BTE: ["BTE-BTC", "BTE-CL", "BTE-GT", "BTE-MCN", "BTE-BT", "BTE-BD"],
  SOC: ["SOC-STC", "SOC-NN", "SOC-VC", "SOC-MX", "SOC-KS", "SOC-TD"],
  VLG: ["VLG-VLC", "VLG-LH", "VLG-MT", "VLG-TB", "VLG-TO", "VLG-BM"],
  TVI: ["TVI-TVC", "TVI-CL", "TVI-CK", "TVI-TC", "TVI-DH", "TVI-CN"],
  CAA: ["CAA-CMC", "CAA-NC", "CAA-CN", "CAA-DD", "CAA-TVT", "CAA-UM"],
};

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

export function readOptionalNullableNumber(
  body: Record<string, unknown>,
  key: string
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

export function assertRegion(countryCode: string, provinceCode: string, districtCode: string): void {
  if (countryCode !== "VN") {
    throw new Error("MVP currently supports only country_code=VN.");
  }

  const districts = VIETNAM_PROVINCES[provinceCode];

  if (!districts) {
    throw new Error("Unsupported province_code.");
  }

  if (!districts.includes(districtCode)) {
    throw new Error("district_code does not belong to the selected province_code.");
  }
}
