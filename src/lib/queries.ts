import { supabase } from "./supabase";
import { Department, GreenSkill, DepartmentEdge } from "./types";

export async function fetchDepartments(): Promise<Department[]> {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("id");

  if (error) throw error;
  return data as Department[];
}

export async function fetchDepartment(id: string): Promise<Department | null> {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Department;
}

export async function fetchEdges(): Promise<DepartmentEdge[]> {
  const { data, error } = await supabase
    .from("department_edges")
    .select("*");

  if (error) throw error;
  return data as DepartmentEdge[];
}

export async function fetchSkillsByDepartment(
  departmentId: string
): Promise<GreenSkill[]> {
  const { data, error } = await supabase
    .from("green_skills")
    .select("*")
    .eq("department", departmentId)
    .order("skill_family")
    .order("green_skill");

  if (error) throw error;
  return data as GreenSkill[];
}

export async function fetchAllSkills(): Promise<GreenSkill[]> {
  const { data, error } = await supabase
    .from("green_skills")
    .select("*")
    .order("department")
    .order("skill_family");

  if (error) throw error;
  return data as GreenSkill[];
}

// Add these new functions to the existing queries.ts

export async function fetchCompanyDepartmentScores(companyId: string): Promise<Department[]> {
  const { data, error } = await supabase
  .from("company_department_scores")
  .select("*")
  .eq("company_id", companyId)
  .order("department");
  
  if (error) throw error;
  
  // Map company_department_scores to Department shape
  return (data || []).map((d: any, i: number) => ({
  id: d.department.toLowerCase().replace(/[^a-z0-9]/g, "_"),
  label: d.department,
  department: d.department,
  overall_score: d.readiness_pct || 0,
  gap_severity: d.priority_level || "Low",
  critical_gap_count: d.critical_count || 0,
  moderate_gap_count: d.moderate_count || 0,
  no_gap_count: 12 - (d.critical_count || 0) - (d.moderate_count || 0),
  top_gaps: "",
  desired_knowledge: "",
  priority_level: d.priority_level || "Low",
  opt_carbon_footprint: 0,
  opt_renewable_energy: 0,
  opt_hvac: 0,
  opt_office_space: 0,
  opt_remote_work: 0,
  opt_work_schedule: 0,
  opt_water_use: 0,
  opt_digital_footprint: 0,
  opt_ai_compute: 0,
  opt_iot_telemetry: 0,
  opt_hardware_circularity: 0,
  opt_supply_chain_emissions: 0,
  opt_logistics_shipping: 0,
  opt_fleet_electrification: 0,
  opt_employee_commuting: 0,
  opt_material_waste: 0,
  }));
  }
  
  export async function fetchCompanySkillGaps(companyId: string): Promise<GreenSkill[]> {
  const { data, error } = await supabase
  .from("company_skill_gaps")
  .select("*")
  .eq("company_id", companyId)
  .order("department")
  .order("skill_family");
  
  if (error) throw error;
  
  // Map company_skill_gaps to GreenSkill shape
  return (data || []).map((s: any) => ({
  id: s.id,
  department: s.department,
  skill_family: s.skill_family,
  green_skill: s.green_skill,
  description: "",
  why_it_matters: "",
  example_behaviours: "",
  theme: s.theme,
  required_level: s.required_level,
  current_level: s.current_level,
  gap: s.gap,
  severity: s.severity,
  desired_knowledge: "",
  priority_level: s.severity === "Critical" ? "Critical" : s.severity === "Moderate" ? "High" : "Low",
  opt_carbon_footprint: s.opt_carbon_footprint || 0,
  opt_renewable_energy: s.opt_renewable_energy || 0,
  opt_hvac: s.opt_hvac || 0,
  opt_office_space: s.opt_office_space || 0,
  opt_remote_work: s.opt_remote_work || 0,
  opt_work_schedule: s.opt_work_schedule || 0,
  opt_water_use: s.opt_water_use || 0,
  opt_digital_footprint: s.opt_digital_footprint || 0,
  opt_ai_compute: s.opt_ai_compute || 0,
  opt_iot_telemetry: s.opt_iot_telemetry || 0,
  opt_hardware_circularity: s.opt_hardware_circularity || 0,
  opt_supply_chain_emissions: s.opt_supply_chain_emissions || 0,
  opt_logistics_shipping: s.opt_logistics_shipping || 0,
  opt_fleet_electrification: s.opt_fleet_electrification || 0,
  opt_employee_commuting: s.opt_employee_commuting || 0,
  opt_material_waste: s.opt_material_waste || 0,
  }));
  }
  