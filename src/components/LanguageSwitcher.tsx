import { SelectField } from "@/components/SelectField";
import { LANGUAGE_OPTIONS } from "@/constants/profile-options";
import { useI18n } from "@/core/i18n/LanguageProvider";
import type { SupportedLanguage } from "@/types/profile.types";

type LanguageSwitcherProps = {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
  label?: string;
};

export function LanguageSwitcher(props: LanguageSwitcherProps): JSX.Element {
  const { value, onChange, label } = props;
  const { t } = useI18n();
  const resolvedLabel = label ?? t("common.language");

  return (
    <SelectField
      label={resolvedLabel}
      placeholder={resolvedLabel}
      value={value}
      options={LANGUAGE_OPTIONS}
      onChange={(nextValue) => onChange(nextValue as SupportedLanguage)}
    />
  );
}
