"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarDataItem {
  factor: string;
  value: number;
  fullMark: number;
}

interface OptRadarChartProps {
  data: RadarDataItem[];
  color: string;
}

export default function OptRadarChart({ data, color }: OptRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid
          stroke="rgba(255,255,255,0.08)"
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="factor"
          tick={{
            fill: "rgba(255,255,255,0.4)",
            fontSize: 9,
          }}
          tickLine={false}
        />
        <PolarRadiusAxis
          domain={[0, 1]}
          tick={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 15, 46, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "white",
          }}
          formatter={(value: number | undefined) => [
            `${((value ?? 0) * 100).toFixed(0)}%`,
            "Impact",
          ]}
        />
        <Radar
          name="Optimization"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{
            r: 3,
            fill: color,
            strokeWidth: 0,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
