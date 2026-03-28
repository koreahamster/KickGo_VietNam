import { Pressable, StyleSheet, Text, View } from "react-native";

import type { TeamMatchesCopy } from "@/features/team-matches.copy";
import type { MonthGridCell } from "@/features/team-matches/team-matches.helpers";
import { getWeekdayLabels } from "@/features/team-matches/team-matches.helpers";

type TeamMatchMonthGridProps = {
  cells: MonthGridCell[];
  copy: TeamMatchesCopy;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
};

export function TeamMatchMonthGrid(props: TeamMatchMonthGridProps): JSX.Element {
  const { cells, copy, selectedDate, onSelectDate } = props;
  const weekdayLabels = getWeekdayLabels(copy);

  return (
    <View style={styles.wrapper}>
      <View style={styles.weekRow}>
        {weekdayLabels.map((label) => (
          <View key={label} style={styles.weekCell}>
            <Text style={styles.weekLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          const isSelected = Boolean(cell.isoDate) && cell.isoDate === selectedDate;
          return (
            <Pressable
              key={cell.key}
              disabled={!cell.isoDate}
              onPress={() => onSelectDate(isSelected ? null : cell.isoDate)}
              style={({ pressed }) => [styles.dayCell, pressed && cell.isoDate ? styles.dayCellPressed : null]}
            >
              {cell.isoDate ? (
                <View style={[styles.dayBadge, cell.isToday ? styles.dayToday : null, isSelected ? styles.daySelected : null]}>
                  <Text style={[styles.dayNumber, cell.isToday ? styles.dayNumberToday : null, isSelected ? styles.dayNumberSelected : null]}>
                    {cell.dayNumber}
                  </Text>
                </View>
              ) : null}
              {cell.isoDate && cell.hasMatch ? <View style={styles.dot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
  },
  weekRow: {
    flexDirection: "row",
  },
  weekCell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    justifyContent: "center",
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dayCellPressed: {
    opacity: 0.85,
  },
  dayBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayToday: {
    borderWidth: 1,
    borderColor: "#0f172a",
  },
  daySelected: {
    backgroundColor: "#0f766e",
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  dayNumberToday: {
    color: "#0f172a",
  },
  dayNumberSelected: {
    color: "#ffffff",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#ff3b30",
  },
});