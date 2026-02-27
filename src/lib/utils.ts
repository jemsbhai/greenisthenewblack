import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const OPT_COLUMNS = [
  "opt_carbon_footprint",
  "opt_renewable_energy",
  "opt_hvac",
  "opt_office_space",
  "opt_remote_work",
  "opt_work_schedule",
  "opt_water_use",
  "opt_digital_footprint",
  "opt_ai_compute",
  "opt_iot_telemetry",
  "opt_hardware_circularity",
  "opt_supply_chain_emissions",
  "opt_logistics_shipping",
  "opt_fleet_electrification",
  "opt_employee_commuting",
  "opt_material_waste",
] as const;

export const OPT_LABELS: Record<string, string> = {
  opt_carbon_footprint: "Carbon Footprint",
  opt_renewable_energy: "Renewable Energy",
  opt_hvac: "HVAC",
  opt_office_space: "Office Space",
  opt_remote_work: "Remote Work",
  opt_work_schedule: "Work Schedule",
  opt_water_use: "Water Use",
  opt_digital_footprint: "Digital Footprint",
  opt_ai_compute: "AI Compute",
  opt_iot_telemetry: "IoT Telemetry",
  opt_hardware_circularity: "Hardware Circularity",
  opt_supply_chain_emissions: "Supply Chain Emissions",
  opt_logistics_shipping: "Logistics & Shipping",
  opt_fleet_electrification: "Fleet Electrification",
  opt_employee_commuting: "Employee Commuting",
  opt_material_waste: "Material Waste",
};

export type OptColumn = (typeof OPT_COLUMNS)[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function computeAvgOpt(row: any): number {
  let sum = 0;
  let count = 0;
  for (const col of OPT_COLUMNS) {
    const val = Number(row[col]);
    if (!isNaN(val)) {
      sum += val;
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

export function getGlowColor(avgOpt: number): string {
  if (avgOpt < 0.25) return "#ef4444"; // red
  if (avgOpt <= 0.5) return "#f59e0b"; // amber
  return "#22c55e"; // green
}

export function getGlowClass(avgOpt: number): string {
  if (avgOpt < 0.25) return "glow-red";
  if (avgOpt <= 0.5) return "glow-amber";
  return "glow-green";
}

export function getSeverityColor(severity: string): string {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "#ef4444";
    case "moderate":
      return "#f59e0b";
    case "no gap":
    case "none":
      return "#22c55e";
    default:
      return "#6b7280";
  }
}

export function formatOptLabel(key: string): string {
  return OPT_LABELS[key] || key.replace("opt_", "").replace(/_/g, " ");
}
