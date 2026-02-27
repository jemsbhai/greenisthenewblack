export interface Department {
  id: string;
  label: string;
  department: string;
  overall_score: number;
  gap_severity: string;
  critical_gap_count: number;
  moderate_gap_count: number;
  no_gap_count: number;
  top_gaps: string;
  desired_knowledge: string;
  priority_level: string;
  opt_carbon_footprint: number;
  opt_renewable_energy: number;
  opt_hvac: number;
  opt_office_space: number;
  opt_remote_work: number;
  opt_work_schedule: number;
  opt_water_use: number;
  opt_digital_footprint: number;
  opt_ai_compute: number;
  opt_iot_telemetry: number;
  opt_hardware_circularity: number;
  opt_supply_chain_emissions: number;
  opt_logistics_shipping: number;
  opt_fleet_electrification: number;
  opt_employee_commuting: number;
  opt_material_waste: number;
}

export interface GreenSkill {
  id: number;
  department: string;
  skill_family: string;
  green_skill: string;
  description: string;
  why_it_matters: string;
  example_behaviours: string;
  theme: string;
  required_level: number;
  current_level: number;
  gap: number;
  severity: string;
  desired_knowledge: string;
  priority_level: string;
  opt_carbon_footprint: number;
  opt_renewable_energy: number;
  opt_hvac: number;
  opt_office_space: number;
  opt_remote_work: number;
  opt_work_schedule: number;
  opt_water_use: number;
  opt_digital_footprint: number;
  opt_ai_compute: number;
  opt_iot_telemetry: number;
  opt_hardware_circularity: number;
  opt_supply_chain_emissions: number;
  opt_logistics_shipping: number;
  opt_fleet_electrification: number;
  opt_employee_commuting: number;
  opt_material_waste: number;
}

export interface DepartmentEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

export type SkillFamily = "Technical" | "Knowledgeable" | "Values" | "Attitudes";

export interface SkillFamilyGroup {
  family: SkillFamily;
  skills: GreenSkill[];
  avgOpt: number;
}

export type ViewLevel = "departments" | "families" | "skills";
