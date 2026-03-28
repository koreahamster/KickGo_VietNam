import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getRefereeSystemCopy } from "@/features/referee/referee.copy";
import { TeamMatchInlineHeader } from "@/features/team-matches/components/TeamMatchInlineHeader";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useDeleteAvailability, useMyAvailability, useRegisterAvailability } from "@/hooks/useRefereeQuery";
import { getVietnamProvinceOptions } from "@/shared/regions/vietnam-regions";
import type { RefereeAvailability } from "@/types/referee.types";

function toDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildCalendarDays(monthDate: Date, slots: RefereeAvailability[]): Array<{ key: string; label: string; date: string | null; isToday: boolean; hasOpen: boolean; hasBooked: boolean }> {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const todayKey = toDateKey(new Date());
  const slotMap = new Map<string, RefereeAvailability[]>();

  slots.forEach((slot) => {
    const list = slotMap.get(slot.available_date) ?? [];
    list.push(slot);
    slotMap.set(slot.available_date, list);
  });

  const cells: Array<{ key: string; label: string; date: string | null; isToday: boolean; hasOpen: boolean; hasBooked: boolean }> = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    cells.push({ key: `empty-${index}`, label: "", date: null, isToday: false, hasOpen: false, hasBooked: false });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day);
    const key = toDateKey(date);
    const daySlots = slotMap.get(key) ?? [];
    cells.push({
      key,
      label: `${day}`,
      date: key,
      isToday: key === todayKey,
      hasOpen: daySlots.some((slot) => !slot.is_booked),
      hasBooked: daySlots.some((slot) => slot.is_booked),
    });
  }

  return cells;
}

function formatMonthTitle(date: Date, language: "ko" | "en" | "vi"): string {
  if (language === "ko") {
    return `${date.getFullYear()}³â ${date.getMonth() + 1}¿ù`;
  }
  if (language === "vi") {
    return `Thang ${date.getMonth() + 1}/${date.getFullYear()}`;
  }
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatSlotLabel(slot: RefereeAvailability): string {
  return `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`;
}

const WEEK_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

export default function RefereeAvailabilityScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getRefereeSystemCopy(language);
  const { user } = useAuth();
  const { profileBundle } = useProfile({ enabled: Boolean(user?.id) });
  const availabilityQuery = useMyAvailability(user?.id ?? null, Boolean(user?.id));
  const registerMutation = useRegisterAvailability();
  const deleteMutation = useDeleteAvailability();

  const [monthDate, setMonthDate] = useState<Date>(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateInput, setDateInput] = useState<string>(toDateKey(new Date()));
  const [startTimeInput, setStartTimeInput] = useState<string>("18:00");
  const [endTimeInput, setEndTimeInput] = useState<string>("20:00");
  const [provinceCode, setProvinceCode] = useState<string>(profileBundle.profile?.province_code ?? "HCM");

  const slots = availabilityQuery.data ?? [];
  const calendarDays = useMemo(() => buildCalendarDays(monthDate, slots), [monthDate, slots]);
  const daySlots = useMemo(
    () => slots.filter((slot) => slot.available_date === selectedDate).sort((left, right) => left.start_time.localeCompare(right.start_time)),
    [selectedDate, slots],
  );
  const provinceOptions = useMemo(() => getVietnamProvinceOptions(), []);

  const handleRegister = async (): Promise<void> => {
    if (!user?.id) {
      return;
    }

    if (!provinceCode) {
      Alert.alert("KickGo", copy.provinceRequired);
      return;
    }

    if (dateInput < toDateKey(new Date())) {
      Alert.alert("KickGo", copy.invalidDate);
      return;
    }

    if (endTimeInput <= startTimeInput) {
      Alert.alert("KickGo", copy.invalidTimeRange);
      return;
    }

    try {
      await registerMutation.mutateAsync({
        refereeId: user.id,
        request: {
          available_date: dateInput,
          start_time: startTimeInput,
          end_time: endTimeInput,
          province_code: provinceCode,
        },
      });
      setSelectedDate(dateInput);
      setMonthDate(startOfMonth(new Date(`${dateInput}T00:00:00`)));
      setIsModalOpen(false);
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.requestFailed);
    }
  };

  const handleDelete = (slot: RefereeAvailability): void => {
    if (!user?.id || slot.is_booked) {
      return;
    }

    Alert.alert(copy.availabilityDeleteTitle, copy.availabilityDeleteBody, [
      { text: copy.assignmentsReject, style: "cancel" },
      {
        text: copy.availabilityDelete,
        style: "destructive",
        onPress: () => {
          void deleteMutation.mutateAsync({ refereeId: user.id, availabilityId: slot.id }).catch((error: unknown) => {
            Alert.alert("KickGo", error instanceof Error ? error.message : copy.requestFailed);
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TeamMatchInlineHeader title={copy.availabilityTitle} onBack={() => router.back()} />

        <View style={styles.introCard}>
          <Text style={styles.introTitle}>{copy.availabilitySubtitle}</Text>
          <Text style={styles.introBody}>{copy.availabilityRequestHint}</Text>
        </View>

        <View style={styles.monthRow}>
          <Pressable onPress={() => setMonthDate((current) => shiftMonth(current, -1))} style={styles.monthButton}>
            <Ionicons color="#0f172a" name="chevron-back" size={18} />
          </Pressable>
          <Text style={styles.monthLabel}>{formatMonthTitle(monthDate, language)}</Text>
          <Pressable onPress={() => setMonthDate((current) => shiftMonth(current, 1))} style={styles.monthButton}>
            <Ionicons color="#0f172a" name="chevron-forward" size={18} />
          </Pressable>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.weekRow}>
            {WEEK_LABELS.map((label) => (
              <Text key={label} style={styles.weekLabel}>{label}</Text>
            ))}
          </View>
          <View style={styles.gridWrap}>
            {calendarDays.map((cell) => {
              const isSelected = cell.date === selectedDate;
              return (
                <Pressable
                  key={cell.key}
                  disabled={!cell.date}
                  onPress={() => cell.date && setSelectedDate(cell.date)}
                  style={[styles.dayCell, isSelected ? styles.dayCellSelected : null]}
                >
                  <Text style={[styles.dayLabel, cell.isToday ? styles.dayLabelToday : null, isSelected ? styles.dayLabelSelected : null]}>{cell.label}</Text>
                  <View style={styles.dotRow}>
                    {cell.hasOpen ? <View style={styles.openDot} /> : null}
                    {cell.hasBooked ? <View style={styles.bookedDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{selectedDate}</Text>
          <View style={styles.summaryPill}><Text style={styles.summaryPillLabel}>{`${copy.availabilityRegisteredDays} ${daySlots.length}`}</Text></View>
        </View>

        {daySlots.length > 0 ? (
          daySlots.map((slot) => (
            <View key={slot.id} style={styles.slotCard}>
              <View style={styles.slotCopy}>
                <Text style={styles.slotTitle}>{formatSlotLabel(slot)}</Text>
                <Text style={styles.slotMeta}>{slot.province_code}</Text>
              </View>
              <View style={styles.slotActions}>
                <View style={[styles.statusPill, slot.is_booked ? styles.statusBooked : styles.statusOpen]}>
                  <Text style={[styles.statusLabel, slot.is_booked ? styles.statusBookedLabel : styles.statusOpenLabel]}>
                    {slot.is_booked ? copy.availabilityBooked : copy.availabilityOpen}
                  </Text>
                </View>
                {!slot.is_booked ? (
                  <Pressable onPress={() => handleDelete(slot)} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonLabel}>{copy.availabilityDelete}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>{copy.availabilityEmpty}</Text></View>
        )}
      </ScrollView>

      <Pressable onPress={() => setIsModalOpen(true)} style={styles.fab}>
        <Ionicons color="#ffffff" name="add" size={26} />
      </Pressable>

      <Modal animationType="slide" onRequestClose={() => setIsModalOpen(false)} transparent visible={isModalOpen}>
        <Pressable onPress={() => setIsModalOpen(false)} style={styles.modalOverlay}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalCard}>
            <Text style={styles.modalTitle}>{copy.availabilityAddTitle}</Text>
            <TextInput onChangeText={setDateInput} placeholder="YYYY-MM-DD" style={styles.input} value={dateInput} />
            <TextInput onChangeText={setStartTimeInput} placeholder="18:00" style={styles.input} value={startTimeInput} />
            <TextInput onChangeText={setEndTimeInput} placeholder="20:00" style={styles.input} value={endTimeInput} />
            <Text style={styles.fieldLabel}>{copy.availabilityProvince}</Text>
            <ScrollView contentContainerStyle={styles.provinceGrid} style={styles.provinceList}>
              {provinceOptions.map((option) => {
                const isActive = option.value === provinceCode;
                return (
                  <Pressable key={option.value} onPress={() => setProvinceCode(option.value)} style={[styles.provinceChip, isActive ? styles.provinceChipActive : null]}>
                    <Text style={[styles.provinceChipLabel, isActive ? styles.provinceChipLabelActive : null]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable disabled={registerMutation.isPending} onPress={() => void handleRegister()} style={[styles.submitButton, registerMutation.isPending ? styles.submitButtonDisabled : null]}>
              <Text style={styles.submitButtonLabel}>{copy.availabilityRegister}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 20, paddingBottom: 120, gap: 16 },
  introCard: { borderRadius: 20, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e5e7eb", padding: 18, gap: 8 },
  introTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  introBody: { fontSize: 13, lineHeight: 20, color: "#64748b" },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  monthButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e5e7eb" },
  monthLabel: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  calendarCard: { borderRadius: 22, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e5e7eb", padding: 14, gap: 12 },
  weekRow: { flexDirection: "row" },
  weekLabel: { width: `${100 / 7}%`, textAlign: "center", fontSize: 11, fontWeight: "700", color: "#94a3b8" },
  gridWrap: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: `${100 / 7}%`, minHeight: 54, alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 14 },
  dayCellSelected: { backgroundColor: "#dcfce7" },
  dayLabel: { fontSize: 14, fontWeight: "700", color: "#334155" },
  dayLabelToday: { color: "#2563eb" },
  dayLabelSelected: { color: "#166534" },
  dotRow: { flexDirection: "row", gap: 4, minHeight: 8 },
  openDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#22c55e" },
  bookedDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#3b82f6" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  summaryPill: { borderRadius: 999, backgroundColor: "#ecfeff", paddingHorizontal: 12, paddingVertical: 8 },
  summaryPillLabel: { fontSize: 12, fontWeight: "700", color: "#0f766e" },
  slotCard: { borderRadius: 18, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e5e7eb", padding: 16, flexDirection: "row", justifyContent: "space-between", gap: 12 },
  slotCopy: { flex: 1, gap: 4 },
  slotTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  slotMeta: { fontSize: 13, color: "#64748b" },
  slotActions: { alignItems: "flex-end", gap: 8 },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusOpen: { backgroundColor: "#dcfce7" },
  statusBooked: { backgroundColor: "#dbeafe" },
  statusLabel: { fontSize: 12, fontWeight: "800" },
  statusOpenLabel: { color: "#166534" },
  statusBookedLabel: { color: "#1d4ed8" },
  deleteButton: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#fee2e2" },
  deleteButtonLabel: { fontSize: 12, fontWeight: "800", color: "#b91c1c" },
  emptyCard: { borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", padding: 24, alignItems: "center" },
  emptyText: { fontSize: 14, fontWeight: "700", color: "#64748b" },
  fab: { position: "absolute", right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center", shadowColor: "#111827", shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.32)" },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: "#ffffff", padding: 20, gap: 12, maxHeight: "75%" },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  input: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 14, fontSize: 14, color: "#111827" },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: "#334155" },
  provinceList: { maxHeight: 180 },
  provinceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  provinceChip: { borderRadius: 999, borderWidth: 1, borderColor: "#cbd5e1", paddingHorizontal: 12, paddingVertical: 8 },
  provinceChipActive: { borderColor: "#16a34a", backgroundColor: "#dcfce7" },
  provinceChipLabel: { fontSize: 12, fontWeight: "700", color: "#475569" },
  provinceChipLabelActive: { color: "#166534" },
  submitButton: { minHeight: 52, borderRadius: 16, backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center", marginTop: 8 },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonLabel: { fontSize: 15, fontWeight: "800", color: "#ffffff" },
});
