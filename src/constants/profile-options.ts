export type SelectOption = {
  label: string;
  value: string;
};

export type ProvinceGroup = {
  label: string;
  value: string;
  districts: SelectOption[];
};

export const COUNTRY_OPTIONS: SelectOption[] = [
  { label: "Vietnam", value: "VN" },
];

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { label: "Vietnamese", value: "vi" },
  { label: "Korean", value: "ko" },
  { label: "English", value: "en" },
];

export const ACCOUNT_TYPE_OPTIONS: SelectOption[] = [
  { label: "\uC120\uC218", value: "player" },
  { label: "\uC2EC\uD310", value: "referee" },
  { label: "\uC2DC\uC124 \uAD00\uB9AC\uC790", value: "facility_manager" },
];

export const POSITION_OPTIONS: SelectOption[] = [
  { label: "Goalkeeper (GK)", value: "GK" },
  { label: "Center Back (CB)", value: "CB" },
  { label: "Full Back (FB)", value: "FB" },
  { label: "Defensive Midfielder (DM)", value: "DM" },
  { label: "Central Midfielder (CM)", value: "CM" },
  { label: "Attacking Midfielder (AM)", value: "AM" },
  { label: "Winger (WG)", value: "WG" },
  { label: "Striker (ST)", value: "ST" },
];

export const FOOT_OPTIONS: SelectOption[] = [
  { label: "\uC624\uB978\uBC1C", value: "right" },
  { label: "\uC67C\uBC1C", value: "left" },
  { label: "\uC591\uBC1C", value: "both" },
];

export const TOP_SIZE_OPTIONS: SelectOption[] = [
  { label: "XS", value: "XS" },
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
  { label: "2XL", value: "2XL" },
  { label: "3XL", value: "3XL" },
  { label: "4XL", value: "4XL" },
];

export const SHOE_SIZE_OPTIONS: SelectOption[] = [
  { label: "235", value: "235" },
  { label: "240", value: "240" },
  { label: "245", value: "245" },
  { label: "250", value: "250" },
  { label: "255", value: "255" },
  { label: "260", value: "260" },
  { label: "265", value: "265" },
  { label: "270", value: "270" },
  { label: "275", value: "275" },
  { label: "280", value: "280" },
  { label: "285", value: "285" },
  { label: "290", value: "290" },
  { label: "295", value: "295" },
  { label: "300", value: "300" },
  { label: "305", value: "305" },
];

export const VIETNAM_PROVINCE_GROUPS: ProvinceGroup[] = [
  {
    label: "Ho Chi Minh City",
    value: "HCM",
    districts: [
      { label: "District 1", value: "HCM-D1" },
      { label: "District 3", value: "HCM-D3" },
      { label: "District 7", value: "HCM-D7" },
      { label: "Binh Thanh", value: "HCM-BTH" },
      { label: "Tan Phu", value: "HCM-TP" },
      { label: "Thu Duc", value: "HCM-TD" },
    ],
  },
  {
    label: "Hanoi",
    value: "HAN",
    districts: [
      { label: "Ba Dinh", value: "HAN-BD" },
      { label: "Hoan Kiem", value: "HAN-HK" },
      { label: "Dong Da", value: "HAN-DD" },
      { label: "Cau Giay", value: "HAN-CG" },
      { label: "Ha Dong", value: "HAN-HD" },
      { label: "Nam Tu Liem", value: "HAN-NTL" },
    ],
  },
  {
    label: "Da Nang",
    value: "DAD",
    districts: [
      { label: "Hai Chau", value: "DAD-HC" },
      { label: "Thanh Khe", value: "DAD-TK" },
      { label: "Son Tra", value: "DAD-ST" },
      { label: "Ngu Hanh Son", value: "DAD-NHS" },
      { label: "Cam Le", value: "DAD-CL" },
      { label: "Lien Chieu", value: "DAD-LC" },
    ],
  },
  {
    label: "Hue",
    value: "HUE",
    districts: [
      { label: "Phu Hoi", value: "HUE-PH" },
      { label: "Phu Bai", value: "HUE-PB" },
      { label: "Thuan Hoa", value: "HUE-TH" },
      { label: "Huong Tra", value: "HUE-HT" },
      { label: "Huong Thuy", value: "HUE-HY" },
      { label: "Phong Dien", value: "HUE-PD" },
    ],
  },
  {
    label: "Hai Phong",
    value: "HPH",
    districts: [
      { label: "Hong Bang", value: "HPH-HB" },
      { label: "Ngo Quyen", value: "HPH-NQ" },
      { label: "Le Chan", value: "HPH-LC" },
      { label: "Kien An", value: "HPH-KA" },
      { label: "Hai An", value: "HPH-HA" },
      { label: "Duong Kinh", value: "HPH-DK" },
    ],
  },
  {
    label: "Can Tho",
    value: "CTO",
    districts: [
      { label: "Ninh Kieu", value: "CTO-NK" },
      { label: "Binh Thuy", value: "CTO-BT" },
      { label: "Cai Rang", value: "CTO-CR" },
      { label: "O Mon", value: "CTO-OM" },
      { label: "Thot Not", value: "CTO-TN" },
      { label: "Phong Dien", value: "CTO-PD" },
    ],
  },
  {
    label: "Binh Duong",
    value: "BDU",
    districts: [
      { label: "Thu Dau Mot", value: "BDU-TDM" },
      { label: "Di An", value: "BDU-DAN" },
      { label: "Thuan An", value: "BDU-TA" },
      { label: "Ben Cat", value: "BDU-BC" },
      { label: "Tan Uyen", value: "BDU-TU" },
      { label: "Bau Bang", value: "BDU-BB" },
    ],
  },
  {
    label: "Dong Nai",
    value: "DNA",
    districts: [
      { label: "Bien Hoa", value: "DNA-BH" },
      { label: "Long Khanh", value: "DNA-LK" },
      { label: "Nhon Trach", value: "DNA-NT" },
      { label: "Trang Bom", value: "DNA-TB" },
      { label: "Long Thanh", value: "DNA-LT" },
      { label: "Vinh Cuu", value: "DNA-VC" },
    ],
  },
  {
    label: "Ba Ria - Vung Tau",
    value: "BRV",
    districts: [
      { label: "Vung Tau", value: "BRV-VT" },
      { label: "Ba Ria", value: "BRV-BR" },
      { label: "Phu My", value: "BRV-PM" },
      { label: "Long Dien", value: "BRV-LD" },
      { label: "Dat Do", value: "BRV-DD" },
      { label: "Xuyen Moc", value: "BRV-XM" },
    ],
  },
  {
    label: "Khanh Hoa",
    value: "KHH",
    districts: [
      { label: "Nha Trang", value: "KHH-NT" },
      { label: "Cam Ranh", value: "KHH-CR" },
      { label: "Ninh Hoa", value: "KHH-NH" },
      { label: "Dien Khanh", value: "KHH-DK" },
      { label: "Cam Lam", value: "KHH-CL" },
      { label: "Van Ninh", value: "KHH-VN" },
    ],
  },
  {
    label: "Lam Dong",
    value: "LDO",
    districts: [
      { label: "Da Lat", value: "LDO-DL" },
      { label: "Bao Loc", value: "LDO-BL" },
      { label: "Duc Trong", value: "LDO-DT" },
      { label: "Di Linh", value: "LDO-DL2" },
      { label: "Lac Duong", value: "LDO-LD" },
      { label: "Don Duong", value: "LDO-DD" },
    ],
  },
  {
    label: "Dak Lak",
    value: "DLK",
    districts: [
      { label: "Buon Ma Thuot", value: "DLK-BMT" },
      { label: "Ea Kar", value: "DLK-EK" },
      { label: "Krong Pac", value: "DLK-KP" },
      { label: "Cu M'gar", value: "DLK-CMG" },
      { label: "Buon Don", value: "DLK-BD" },
      { label: "Krong Ana", value: "DLK-KA" },
    ],
  },
  {
    label: "Quang Ninh",
    value: "QNI",
    districts: [
      { label: "Ha Long", value: "QNI-HL" },
      { label: "Cam Pha", value: "QNI-CP" },
      { label: "Uong Bi", value: "QNI-UB" },
      { label: "Mong Cai", value: "QNI-MC" },
      { label: "Quang Yen", value: "QNI-QY" },
      { label: "Dong Trieu", value: "QNI-DT" },
    ],
  },
  {
    label: "Bac Ninh",
    value: "BNH",
    districts: [
      { label: "Bac Ninh City", value: "BNH-BNC" },
      { label: "Tu Son", value: "BNH-TS" },
      { label: "Yen Phong", value: "BNH-YP" },
      { label: "Que Vo", value: "BNH-QV" },
      { label: "Thuan Thanh", value: "BNH-TT" },
      { label: "Tien Du", value: "BNH-TD" },
    ],
  },
  {
    label: "Hai Duong",
    value: "HDU",
    districts: [
      { label: "Hai Duong City", value: "HDU-HDC" },
      { label: "Chi Linh", value: "HDU-CL" },
      { label: "Cam Giang", value: "HDU-CG" },
      { label: "Kinh Mon", value: "HDU-KM" },
      { label: "Nam Sach", value: "HDU-NS" },
      { label: "Tu Ky", value: "HDU-TK" },
    ],
  },
  {
    label: "Quang Nam",
    value: "QNA",
    districts: [
      { label: "Tam Ky", value: "QNA-TK" },
      { label: "Hoi An", value: "QNA-HA" },
      { label: "Dien Ban", value: "QNA-DB" },
      { label: "Nui Thanh", value: "QNA-NT" },
      { label: "Duy Xuyen", value: "QNA-DX" },
      { label: "Thang Binh", value: "QNA-TB" },
    ],
  },
  {
    label: "Binh Dinh",
    value: "BDI",
    districts: [
      { label: "Quy Nhon", value: "BDI-QN" },
      { label: "An Nhon", value: "BDI-AN" },
      { label: "Hoai Nhon", value: "BDI-HN" },
      { label: "Tuy Phuoc", value: "BDI-TP" },
      { label: "Phu Cat", value: "BDI-PC" },
      { label: "Tay Son", value: "BDI-TS" },
    ],
  },
  {
    label: "Phu Yen",
    value: "PYE",
    districts: [
      { label: "Tuy Hoa", value: "PYE-TH" },
      { label: "Song Cau", value: "PYE-SC" },
      { label: "Dong Hoa", value: "PYE-DH" },
      { label: "Tay Hoa", value: "PYE-TH2" },
      { label: "Tuy An", value: "PYE-TA" },
      { label: "Son Hoa", value: "PYE-SH" },
    ],
  },
  {
    label: "Long An",
    value: "LAN",
    districts: [
      { label: "Tan An", value: "LAN-TA" },
      { label: "Ben Luc", value: "LAN-BL" },
      { label: "Duc Hoa", value: "LAN-DH" },
      { label: "Can Giuoc", value: "LAN-CG" },
      { label: "Can Duoc", value: "LAN-CD" },
      { label: "Kien Tuong", value: "LAN-KT" },
    ],
  },
  {
    label: "An Giang",
    value: "AGI",
    districts: [
      { label: "Long Xuyen", value: "AGI-LX" },
      { label: "Chau Doc", value: "AGI-CD" },
      { label: "Tan Chau", value: "AGI-TC" },
      { label: "Chau Phu", value: "AGI-CP" },
      { label: "Cho Moi", value: "AGI-CM" },
      { label: "Thoai Son", value: "AGI-TS" },
    ],
  },
  {
    label: "Kien Giang",
    value: "KGG",
    districts: [
      { label: "Rach Gia", value: "KGG-RG" },
      { label: "Phu Quoc", value: "KGG-PQ" },
      { label: "Ha Tien", value: "KGG-HT" },
      { label: "Kien Luong", value: "KGG-KL" },
      { label: "Hon Dat", value: "KGG-HD" },
      { label: "Chau Thanh", value: "KGG-CT" },
    ],
  },
  {
    label: "Dong Thap",
    value: "DTP",
    districts: [
      { label: "Cao Lanh", value: "DTP-CL" },
      { label: "Sa Dec", value: "DTP-SD" },
      { label: "Hong Ngu", value: "DTP-HN" },
      { label: "Lai Vung", value: "DTP-LV" },
      { label: "Thap Muoi", value: "DTP-TM" },
      { label: "Tan Binh", value: "DTP-TB" },
    ],
  },
  {
    label: "Ben Tre",
    value: "BTE",
    districts: [
      { label: "Ben Tre City", value: "BTE-BTC" },
      { label: "Cho Lach", value: "BTE-CL" },
      { label: "Giong Trom", value: "BTE-GT" },
      { label: "Mo Cay Nam", value: "BTE-MCN" },
      { label: "Ba Tri", value: "BTE-BT" },
      { label: "Binh Dai", value: "BTE-BD" },
    ],
  },
  {
    label: "Soc Trang",
    value: "SOC",
    districts: [
      { label: "Soc Trang City", value: "SOC-STC" },
      { label: "Nga Nam", value: "SOC-NN" },
      { label: "Vinh Chau", value: "SOC-VC" },
      { label: "My Xuyen", value: "SOC-MX" },
      { label: "Ke Sach", value: "SOC-KS" },
      { label: "Tran De", value: "SOC-TD" },
    ],
  },
  {
    label: "Vinh Long",
    value: "VLG",
    districts: [
      { label: "Vinh Long City", value: "VLG-VLC" },
      { label: "Long Ho", value: "VLG-LH" },
      { label: "Mang Thit", value: "VLG-MT" },
      { label: "Tam Binh", value: "VLG-TB" },
      { label: "Tra On", value: "VLG-TO" },
      { label: "Binh Minh", value: "VLG-BM" },
    ],
  },
  {
    label: "Tra Vinh",
    value: "TVI",
    districts: [
      { label: "Tra Vinh City", value: "TVI-TVC" },
      { label: "Cang Long", value: "TVI-CL" },
      { label: "Cau Ke", value: "TVI-CK" },
      { label: "Tieu Can", value: "TVI-TC" },
      { label: "Duyen Hai", value: "TVI-DH" },
      { label: "Cau Ngang", value: "TVI-CN" },
    ],
  },
  {
    label: "Ca Mau",
    value: "CAA",
    districts: [
      { label: "Ca Mau City", value: "CAA-CMC" },
      { label: "Nam Can", value: "CAA-NC" },
      { label: "Cai Nuoc", value: "CAA-CN" },
      { label: "Dam Doi", value: "CAA-DD" },
      { label: "Tran Van Thoi", value: "CAA-TVT" },
      { label: "U Minh", value: "CAA-UM" },
    ],
  },
];

export function getProvinceOptions(countryCode: string | null): SelectOption[] {
  if (countryCode !== "VN") {
    return [];
  }

  return VIETNAM_PROVINCE_GROUPS.map((province) => ({
    label: province.label,
    value: province.value,
  }));
}

export function getDistrictOptions(provinceCode: string | null): SelectOption[] {
  if (!provinceCode) {
    return [];
  }

  return VIETNAM_PROVINCE_GROUPS.find((province) => province.value === provinceCode)?.districts ?? [];
}

export function getOptionLabel(options: SelectOption[], value: string | null): string | null {
  if (!value) {
    return null;
  }

  return options.find((option) => option.value === value)?.label ?? null;
}
