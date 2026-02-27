import { Department, GreenSkill } from "./types";
import { OPT_COLUMNS, computeAvgOpt } from "./utils";
import gsipData from "@/data/gsipData.json";

// ─── Maturity Levels ────────────────────────────────────────────
export const MATURITY_LEVELS = [
  { level: 1, label: "Curious Explorer", short: "Explorer", description: "Basic awareness of sustainability terms and environmental impact." },
  { level: 2, label: "Engaged Learner", short: "Learner", description: "Applies basic sustainability principles and identifies impact areas." },
  { level: 3, label: "Active Contributor", short: "Contributor", description: "Consistently integrates sustainability into daily decisions and processes." },
  { level: 4, label: "Conscious Changemaker", short: "Changemaker", description: "Leads strategic sustainability initiatives and drives organisational transformation." },
] as const;

export function getMaturityLabel(level: number): string {
  return MATURITY_LEVELS.find(m => m.level === level)?.label || "Unknown";
}

export function getMaturityShort(level: number): string {
  return MATURITY_LEVELS.find(m => m.level === level)?.short || "—";
}

// ─── Risk Scoring ────────────────────────────────────────────────
// Weighted risk score combining gap severity, opt factor impact, and priority
export function computeSkillRiskScore(skill: GreenSkill): number {
  const gapWeight = skill.gap >= 2 ? 1.0 : skill.gap === 1 ? 0.5 : 0;
  const optImpact = computeAvgOpt(skill); // 0-1, higher = more impact
  const priorityWeight =
    skill.priority_level?.toLowerCase() === "critical" ? 1.0 :
    skill.priority_level?.toLowerCase() === "high" ? 0.75 :
    skill.priority_level?.toLowerCase() === "medium" ? 0.5 : 0.25;
  // Risk = how big the gap is × how impactful the skill is × how urgent the priority
  return gapWeight * 0.4 + optImpact * 0.35 + priorityWeight * 0.25;
}

export function computeDeptRiskScore(dept: Department, skills: GreenSkill[]): number {
  if (skills.length === 0) return 0;
  const deptSkills = skills.filter(s => s.department === dept.id);
  if (deptSkills.length === 0) return 0;
  const totalRisk = deptSkills.reduce((sum, s) => sum + computeSkillRiskScore(s), 0);
  return totalRisk / deptSkills.length;
}

// ─── Priority Actions ────────────────────────────────────────────
export interface PriorityAction {
  skill: GreenSkill;
  riskScore: number;
  action: string;
  contribution: string;
  targetMaturity: string;
  linkedTheme: string;
  priority: string;
  currentMaturity: string;
  requiredMaturity: string;
  learningPathway: string[];
}

// Name matching helper: fuzzy match dept labels to GSIP data keys
function matchDeptKey(deptLabel: string, keys: string[]): string | undefined {
  const label = deptLabel.toLowerCase().replace(/[^a-z0-9]/g, "");
  return keys.find(k => {
    const key = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    return key === label || key.includes(label) || label.includes(key);
  });
}

function matchSkillAction(deptLabel: string, skillName: string) {
  const deptKey = matchDeptKey(deptLabel, Object.keys(gsipData.actions));
  if (!deptKey) return null;
  const deptActions = (gsipData.actions as Record<string, Array<{
    skill_family: string; green_skill: string; action: string;
    contribution: string; target_maturity: string; linked_theme: string; priority: string;
  }>>)[deptKey];
  if (!deptActions) return null;
  const skillLower = skillName.toLowerCase();
  return deptActions.find(a => a.green_skill.toLowerCase() === skillLower) || null;
}

// Build learning pathway from current → required maturity
function buildLearningPathway(currentLevel: number, requiredLevel: number, skillFamily: string): string[] {
  const pathway: string[] = [];
  if (currentLevel >= requiredLevel) return ["Maintain current proficiency through continuous practice"];

  for (let lvl = currentLevel + 1; lvl <= requiredLevel; lvl++) {
    const mat = MATURITY_LEVELS.find(m => m.level === lvl);
    if (!mat) continue;

    if (lvl === 2) {
      if (skillFamily === "Technical") pathway.push("Complete foundational technical sustainability training");
      else if (skillFamily === "Knowledgeable") pathway.push("Study core ESG frameworks and climate regulations");
      else if (skillFamily === "Values") pathway.push("Participate in sustainability values workshops");
      else pathway.push("Attend mindset-shift and awareness sessions");
    }
    if (lvl === 3) {
      if (skillFamily === "Technical") pathway.push("Apply skills in live projects with mentorship");
      else if (skillFamily === "Knowledgeable") pathway.push("Lead cross-functional knowledge-sharing sessions");
      else if (skillFamily === "Values") pathway.push("Champion sustainability values in team decisions");
      else pathway.push("Mentor peers and model sustainability behaviours");
    }
    if (lvl === 4) {
      if (skillFamily === "Technical") pathway.push("Drive strategic sustainability initiatives and innovation");
      else if (skillFamily === "Knowledgeable") pathway.push("Design organisational sustainability learning programmes");
      else if (skillFamily === "Values") pathway.push("Shape organisational sustainability culture and policy");
      else pathway.push("Lead transformational change across the organisation");
    }
  }
  return pathway;
}

export function getPriorityActions(dept: Department, skills: GreenSkill[]): PriorityAction[] {
  const deptSkills = skills.filter(s => s.department === dept.id);
  const deptLabel = dept.label || dept.department;

  return deptSkills
    .map(skill => {
      const riskScore = computeSkillRiskScore(skill);
      const actionData = matchSkillAction(deptLabel, skill.green_skill);
      const currentMaturity = getMaturityLabel(skill.current_level);
      const requiredMaturity = getMaturityLabel(skill.required_level);
      const learningPathway = buildLearningPathway(skill.current_level, skill.required_level, skill.skill_family);

      return {
        skill,
        riskScore,
        action: actionData?.action || skill.example_behaviours || "",
        contribution: actionData?.contribution || skill.why_it_matters || "",
        targetMaturity: actionData?.target_maturity || requiredMaturity,
        linkedTheme: actionData?.linked_theme || skill.theme || "",
        priority: actionData?.priority || skill.priority_level || "",
        currentMaturity,
        requiredMaturity,
        learningPathway,
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

// ─── Department Directory Data ───────────────────────────────────
export interface DeptDirectoryData {
  definition: string;
  greenSkillsFocus: string;
  exampleGreenJobs: string;
  riskOfNotUpskilling: string;
  maturityLevels: Array<{
    level: string;
    description: string;
    technicalSkill: string;
    knowledgeSkill: string;
    value: string;
    attitude: string;
  }>;
  scorecard: {
    desiredKnowledge: number;
    currentCapability: number;
    gap: number;
    priorityLevel: string;
  };
}

export function getDeptDirectoryData(deptLabel: string): DeptDirectoryData | null {
  const overviewKeys = Object.keys(gsipData.overview);
  const maturityKeys = Object.keys(gsipData.maturity_map);
  const scorecardKeys = Object.keys(gsipData.scorecard);

  const overviewKey = matchDeptKey(deptLabel, overviewKeys);
  const maturityKey = matchDeptKey(deptLabel, maturityKeys);
  const scorecardKey = matchDeptKey(deptLabel, scorecardKeys);

  if (!overviewKey) return null;

  const ov = (gsipData.overview as Record<string, {
    definition: string; green_skills_focus: string;
    example_green_jobs: string; risk_of_not_upskilling: string;
  }>)[overviewKey];

  const mat = maturityKey
    ? (gsipData.maturity_map as Record<string, Array<{
        level: string; description: string; technical_skill: string;
        knowledge_skill: string; value: string; attitude: string;
      }>>)[maturityKey] || []
    : [];

  const sc = scorecardKey
    ? (gsipData.scorecard as Record<string, {
        desired_knowledge: number; current_capability: number;
        gap: number; priority_level: string;
      }>)[scorecardKey]
    : null;

  return {
    definition: ov.definition,
    greenSkillsFocus: ov.green_skills_focus,
    exampleGreenJobs: ov.example_green_jobs,
    riskOfNotUpskilling: ov.risk_of_not_upskilling,
    maturityLevels: mat.map(m => ({
      level: m.level,
      description: m.description,
      technicalSkill: m.technical_skill,
      knowledgeSkill: m.knowledge_skill,
      value: m.value,
      attitude: m.attitude,
    })),
    scorecard: sc
      ? { desiredKnowledge: sc.desired_knowledge, currentCapability: sc.current_capability, gap: sc.gap, priorityLevel: sc.priority_level }
      : { desiredKnowledge: 0, currentCapability: 0, gap: 0, priorityLevel: "Unknown" },
  };
}

// ─── Organisation-wide analytics ─────────────────────────────────
export function getTopPrioritySkills(skills: GreenSkill[], limit = 10): Array<{ skill: GreenSkill; riskScore: number }> {
  return skills
    .map(s => ({ skill: s, riskScore: computeSkillRiskScore(s) }))
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, limit);
}

export function getQuickWins(skills: GreenSkill[]): GreenSkill[] {
  // Moderate gaps with high opt impact — easy to close, high reward
  return skills
    .filter(s => s.gap === 1 && computeAvgOpt(s) >= 0.3)
    .sort((a, b) => computeAvgOpt(b) - computeAvgOpt(a));
}

export function getComplianceRiskSkills(skills: GreenSkill[]): GreenSkill[] {
  // Skills linked to regulatory/compliance themes with critical gaps
  return skills.filter(s => {
    const theme = (s.theme || "").toLowerCase();
    return s.severity?.toLowerCase() === "critical" &&
      (theme.includes("risk") || theme.includes("compliance") || theme.includes("regulation") || theme.includes("climate"));
  });
}
