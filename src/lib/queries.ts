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
