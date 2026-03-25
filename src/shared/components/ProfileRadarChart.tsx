import Svg, { Circle, G, Line, Polygon, Text as SvgText } from "react-native-svg";
import { StyleSheet, View } from "react-native";

import { APP_FONT_FAMILY } from "@/constants/typography";

export type RadarMetric = {
  key: string;
  label: string;
  value: number;
};

type ProfileRadarChartProps = {
  metrics: RadarMetric[];
  size?: number;
};

type Point = {
  x: number;
  y: number;
};

const GRID_LEVELS = 5;

function clamp(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function getPoints(center: Point, radius: number, count: number, ratio: number): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (-Math.PI / 2) + (index * (Math.PI * 2)) / count;
    return {
      x: center.x + Math.cos(angle) * radius * ratio,
      y: center.y + Math.sin(angle) * radius * ratio,
    };
  });
}

function toPolygonPoints(points: Point[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function getTextAnchor(point: Point, center: Point): "start" | "middle" | "end" {
  if (Math.abs(point.x - center.x) < 12) {
    return "middle";
  }

  return point.x > center.x ? "start" : "end";
}

export function ProfileRadarChart(props: ProfileRadarChartProps): JSX.Element {
  const { metrics, size = 268 } = props;
  const chartWidth = size;
  const chartHeight = size;
  const center = { x: chartWidth / 2, y: chartHeight / 2 + 8 };
  const radius = size * 0.28;
  const axisCount = metrics.length;

  const outerPoints = getPoints(center, radius, axisCount, 1);
  const dataPoints = metrics.map((metric, index) => {
    const ratio = clamp(metric.value) / 100;
    return getPoints(center, radius, axisCount, ratio)[index];
  });

  return (
    <View style={styles.container}>
      <Svg height={chartHeight} width={chartWidth}>
        <G>
          {Array.from({ length: GRID_LEVELS }, (_, index) => {
            const ratio = (index + 1) / GRID_LEVELS;
            return (
              <Polygon
                fill="none"
                key={`grid-${ratio}`}
                points={toPolygonPoints(getPoints(center, radius, axisCount, ratio))}
                stroke="#c7d0db"
                strokeDasharray="4 6"
                strokeWidth={1}
              />
            );
          })}

          {outerPoints.map((point, index) => (
            <Line
              key={`axis-${metrics[index]?.key ?? index}`}
              stroke="#d2d9e2"
              strokeWidth={1}
              x1={center.x}
              x2={point.x}
              y1={center.y}
              y2={point.y}
            />
          ))}

          <Polygon
            fill="rgba(59,130,246,0.22)"
            points={toPolygonPoints(dataPoints)}
            stroke="#3b82f6"
            strokeWidth={2.5}
          />

          {dataPoints.map((point, index) => (
            <Circle
              cx={point.x}
              cy={point.y}
              fill="#3b82f6"
              key={`point-${metrics[index]?.key ?? index}`}
              r={4}
            />
          ))}

          {outerPoints.map((point, index) => {
            const metric = metrics[index];
            const labelOffsetY = point.y > center.y + 8 ? 18 : -8;
            const scoreOffsetY = point.y > center.y + 8 ? 34 : 8;
            const anchor = getTextAnchor(point, center);
            const fontProps = APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {};

            return (
              <G key={`label-${metric.key}`}>
                <SvgText
                  {...fontProps}
                  fill="#1f2937"
                  fontSize="13"
                  fontWeight="700"
                  textAnchor={anchor}
                  x={point.x}
                  y={point.y + labelOffsetY}
                >
                  {metric.label}
                </SvgText>
                <SvgText
                  {...fontProps}
                  fill="#6b7280"
                  fontSize="11"
                  fontWeight="500"
                  textAnchor={anchor}
                  x={point.x}
                  y={point.y + scoreOffsetY}
                >
                  {`${clamp(metric.value)}/100`}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12,
  },
});