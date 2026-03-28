import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { MonthGridCell } from "@/features/team-matches/team-matches.helpers";

type TeamMatchCalendarStripProps = {
  days: MonthGridCell[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

export function TeamMatchCalendarStrip(props: TeamMatchCalendarStripProps): JSX.Element {
  const { days, selectedDate, onSelectDate } = props;
  const visibleDays = days.filter((day) => Boolean(day.isoDate));

  return (
    <ScrollView contentContainerStyle={styles.content} horizontal showsHorizontalScrollIndicator={false}>
      {visibleDays.map((day) => {
        const isActive = selectedDate === day.isoDate;
        return (
          <Pressable
            key={day.key}
            onPress={() => day.isoDate && onSelectDate(day.isoDate)}
            style={[styles.dayCard, isActive ? styles.dayCardActive : null, day.isToday ? styles.dayCardToday : null]}
          >
            <Text style={[styles.dayNumber, isActive ? styles.dayLabelActive : null]}>{day.dayNumber}</Text>
            <View style={[styles.dot, day.hasMatch ? styles.dotActive : styles.dotHidden]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingBottom: 4,
  },
  dayCard: {
    width: 56,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dayCardActive: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e",
  },
  dayCardToday: {
    borderColor: "#10b981",
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  dayLabelActive: {
    color: "#ffffff",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#ff3b30",
  },
  dotHidden: {
    backgroundColor: "transparent",
  },
});