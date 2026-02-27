"use client";

import React, { useState, useCallback } from "react";
import { Department, GreenSkill, ViewLevel } from "@/lib/types";
import { getSkillSeverityColor, formatScore, OPT_COLUMNS, formatOptLabel, computeAvgOpt, optScoreColor, skillsForDept } from "@/lib/utils";
import { getTopPrioritySkills, getQuickWins, getComplianceRiskSkills, computeSkillRiskScore, getMaturityLabel, computeDeptRiskScore, getPriorityActions } from "@/lib/gapAnalysis";
import { motion, AnimatePresence } from "framer-motion";
import MethodologyModal from "./MethodologyModal";

interface KPISidebarProps {
  departments: Department[];
  allSkills: GreenSkill[];
  selectedDept: Department | null;
  currentSkills: GreenSkill[];
  viewLevel: ViewLevel;
}

/** Properly escape a CSV cell — quote any value that contains comma, quote, or newline */
function csvCell(val: unknown): string {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function exportCSV(departments: Department[], skills: GreenSkill[]) {
  const headers = [
    "Department", "Skill Family", "Green Skill", "Theme",
    "Current Level", "Required Level", "Gap", "Severity",
    "Priority", "Current Maturity", "Required Maturity", "Risk Score",
    "Description", "Why It Matters",
    ...OPT_COLUMNS.map(c => formatOptLabel(c)),
  ];
  const rows = skills.map(s => [
    s.department, s.skill_family, s.green_skill, s.theme,
    s.current_level, s.required_level, s.gap, s.severity,
    s.priority_level, getMaturityLabel(s.current_level), getMaturityLabel(s.required_level),
    (computeSkillRiskScore(s) * 100).toFixed(0) + "%",
    s.description || "", s.why_it_matters || "",
    ...OPT_COLUMNS.map(c => Number((s as any)[c]) || 0),
  ].map(csvCell));

  const deptHeaders = [
    "Department", "Overall Score", "Gap Severity", "Priority", "Risk Score",
    "Critical Gaps", "Moderate Gaps", "No Gap",
    "Avg Opt Score",
    ...OPT_COLUMNS.map(c => formatOptLabel(c)),
    "Desired Knowledge", "Top Gaps",
  ];
  const deptRows = departments.map(d => [
    d.label, d.overall_score, d.gap_severity, d.priority_level,
    (computeDeptRiskScore(d, skills) * 100).toFixed(0) + "%",
    d.critical_gap_count, d.moderate_gap_count, d.no_gap_count,
    (computeAvgOpt(d) * 100).toFixed(0) + "%",
    ...OPT_COLUMNS.map(c => ((Number((d as any)[c]) || 0) * 100).toFixed(0) + "%"),
    d.desired_knowledge || "", d.top_gaps || "",
  ].map(csvCell));

  const csv = [
    headers.join(","),
    ...rows.map(r => r.join(",")),
    "",
    "DEPARTMENT SUMMARY",
    deptHeaders.join(","),
    ...deptRows.map(r => r.join(",")),
  ].join("\n");

  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `greenpulse_gap_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

type SidebarTab = "overview" | "actions" | "risks";

export default function KPISidebar({ departments, allSkills, selectedDept, currentSkills, viewLevel: _viewLevel }: KPISidebarProps) {
  const [showMethodology, setShowMethodology] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("overview");

  const totalCritical = departments.reduce((s, d) => s + (d.critical_gap_count || 0), 0);
  const totalModerate = departments.reduce((s, d) => s + (d.moderate_gap_count || 0), 0);
  const totalNoGap = departments.reduce((s, d) => s + (d.no_gap_count || 0), 0);
  const totalSkills = totalCritical + totalModerate + totalNoGap;
  const readiness = totalSkills > 0 ? ((totalNoGap / totalSkills) * 100).toFixed(0) : "0";
  const avgOptAll = departments.length > 0
    ? (departments.reduce((s, d) => s + computeAvgOpt(d), 0) / departments.length * 100).toFixed(0)
    : "0";

  const highRiskDepts = [...departments]
    .map(d => ({ dept: d, riskScore: computeDeptRiskScore(d, allSkills) }))
    .sort((a, b) => b.riskScore - a.riskScore)
    .filter(d => d.dept.gap_severity?.toLowerCase() === "critical");

  const sortedDepts = [...departments].sort((a, b) => (b.critical_gap_count || 0) - (a.critical_gap_count || 0));

  const themes = allSkills.reduce((acc, s) => {
    const t = s.theme || "Other";
    if (!acc[t]) acc[t] = { critical: 0, moderate: 0, noGap: 0, total: 0 };
    if (s.severity?.toLowerCase() === "critical") acc[t].critical++;
    else if (s.severity?.toLowerCase() === "moderate") acc[t].moderate++;
    else acc[t].noGap++;
    acc[t].total++;
    return acc;
  }, {} as Record<string, { critical: number; moderate: number; noGap: number; total: number }>);

  // Priority analytics
  const topPrioritySkills = getTopPrioritySkills(allSkills, 8);
  const quickWins = getQuickWins(allSkills);
  const complianceRisks = getComplianceRiskSkills(allSkills);

  const selectedDeptFactors = selectedDept
    ? OPT_COLUMNS.map((col) => ({
        label: formatOptLabel(col),
        val: Number((selectedDept as any)[col]) || 0,
      })).sort((a, b) => b.val - a.val)
    : [];

  const handleExport = useCallback(() => {
    exportCSV(departments, allSkills);
  }, [departments, allSkills]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
        className="w-80 flex-shrink-0 bg-[#0c0c24]/80 backdrop-blur-md border-l border-white/5 flex flex-col overflow-y-auto"
      >
        {/* Logo + Export */}
        <div className="px-5 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" /></svg>
            </div>
            <div className="flex-1">
              <h1 className="text-sm font-bold text-white tracking-tight">GreenPulse</h1>
              <p className="text-[9px] text-white/30">Skills Gap Intelligence Platform</p>
            </div>
            <button onClick={handleExport}
              className="flex items-center gap-1 px-2 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-md text-[10px] text-white/50 hover:text-white/80 transition-colors"
              title="Export CSV">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
              CSV
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="px-5 py-3 border-b border-white/5">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-white/[0.03]">
              <div className="text-xl font-bold text-white">{readiness}<span className="text-xs text-white/40">%</span></div>
              <div className="text-[9px] text-white/40 mt-0.5">Readiness</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/[0.03]">
              <div className="text-xl font-bold text-white">{avgOptAll}<span className="text-xs text-white/40">%</span></div>
              <div className="text-[9px] text-white/40 mt-0.5">Avg Opt</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/[0.03]">
              <div className="text-xl font-bold text-white">{totalSkills}</div>
              <div className="text-[9px] text-white/40 mt-0.5">Total Skills</div>
            </div>
          </div>
        </div>

        {/* Gap Breakdown Bar */}
        <div className="px-5 py-3 border-b border-white/5">
          <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">Organisation Gap Distribution</div>
          <div className="flex h-4 rounded-full overflow-hidden mb-2">
            {totalSkills > 0 && (
              <>
                <div className="bg-red-500 transition-all" style={{ width: `${(totalCritical / totalSkills) * 100}%` }} />
                <div className="bg-amber-500 transition-all" style={{ width: `${(totalModerate / totalSkills) * 100}%` }} />
                <div className="bg-green-500 transition-all" style={{ width: `${(totalNoGap / totalSkills) * 100}%` }} />
              </>
            )}
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-red-400">{totalCritical} Critical</span>
            <span className="text-amber-400">{totalModerate} Moderate</span>
            <span className="text-green-400">{totalNoGap} No Gap</span>
          </div>
        </div>

        {/* === TAB SWITCHER (only when no dept selected) === */}
        {!selectedDept && (
          <div className="flex border-b border-white/5">
            {([
              { key: "overview" as SidebarTab, label: "Overview" },
              { key: "actions" as SidebarTab, label: "Priority Actions" },
              { key: "risks" as SidebarTab, label: "Risks" },
            ]).map(tab => (
              <button key={tab.key} onClick={() => setSidebarTab(tab.key)}
                className={`flex-1 py-2 text-[9px] uppercase tracking-wider transition-colors ${sidebarTab === tab.key ? "text-white bg-white/[0.06] border-b border-white/20" : "text-white/30 hover:text-white/60"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* === OVERVIEW TAB === */}
        {!selectedDept && sidebarTab === "overview" && (
          <>
            {/* High-Risk Departments */}
            {highRiskDepts.length > 0 && (
              <div className="px-5 py-3 border-b border-white/5">
                <div className="text-[9px] uppercase tracking-wider text-red-400/60 mb-2">High-Risk Departments</div>
                <div className="space-y-1">
                  {highRiskDepts.map(({ dept, riskScore }) => (
                    <div key={dept.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-red-500/[0.06] border border-red-500/10">
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" style={{ boxShadow: "0 0 6px #ef444466" }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] text-white/80 font-medium truncate block">{dept.label}</span>
                        <div className="flex gap-2 text-[9px]">
                          <span className="text-red-400">{dept.critical_gap_count} critical</span>
                          <span className="text-white/30">Risk: {(riskScore * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono" style={{ color: optScoreColor(computeAvgOpt(dept)) }}>{(computeAvgOpt(dept) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Departments */}
            <div className="px-5 py-3 border-b border-white/5 flex-1 min-h-0 overflow-y-auto">
              <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">All Departments</div>
              <div className="space-y-1">
                {sortedDepts.map((dept) => {
                  const dAvg = computeAvgOpt(dept);
                  const color = optScoreColor(dAvg);
                  const total = (dept.critical_gap_count || 0) + (dept.moderate_gap_count || 0) + (dept.no_gap_count || 0);
                  return (
                    <div key={dept.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-transparent">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}66` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-white/80 truncate font-medium">{dept.label}</span>
                          <span className="text-[10px] font-mono ml-1" style={{ color }}>{(dAvg * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex h-1 rounded-full overflow-hidden mt-0.5">
                          {total > 0 && (
                            <>
                              <div className="bg-red-500" style={{ width: `${((dept.critical_gap_count || 0) / total) * 100}%` }} />
                              <div className="bg-amber-500" style={{ width: `${((dept.moderate_gap_count || 0) / total) * 100}%` }} />
                              <div className="bg-green-500" style={{ width: `${((dept.no_gap_count || 0) / total) * 100}%` }} />
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] font-medium px-1 py-0.5 rounded" style={{ color, backgroundColor: color + "15" }}>
                        {(dAvg * 100).toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Theme */}
            <div className="px-5 py-3 border-b border-white/5">
              <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">By Theme</div>
              <div className="space-y-1.5">
                {Object.entries(themes).map(([theme, counts]) => (
                  <div key={theme}>
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="text-white/60 truncate">{theme}</span>
                      <div className="flex gap-2">
                        {counts.critical > 0 && <span className="text-red-400">{counts.critical}C</span>}
                        {counts.moderate > 0 && <span className="text-amber-400">{counts.moderate}M</span>}
                        <span className="text-green-400">{counts.noGap}G</span>
                      </div>
                    </div>
                    <div className="flex h-1 rounded-full overflow-hidden">
                      {counts.total > 0 && (
                        <>
                          <div className="bg-red-500" style={{ width: `${(counts.critical / counts.total) * 100}%` }} />
                          <div className="bg-amber-500" style={{ width: `${(counts.moderate / counts.total) * 100}%` }} />
                          <div className="bg-green-500" style={{ width: `${(counts.noGap / counts.total) * 100}%` }} />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* === PRIORITY ACTIONS TAB === */}
        {!selectedDept && sidebarTab === "actions" && (
          <div className="px-5 py-3 flex-1 min-h-0 overflow-y-auto">
            <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Top Priority Skills to Develop</div>
            <p className="text-[9px] text-white/40 mb-3">Ranked by risk score — combining gap severity, sustainability impact, and priority level.</p>
            <div className="space-y-1.5">
              {topPrioritySkills.map(({ skill, riskScore }, i) => {
                const color = getSkillSeverityColor(skill.severity);
                return (
                  <div key={skill.id} className="px-2 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono text-white/25 w-3">#{i + 1}</span>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[10px] text-white/80 font-medium truncate flex-1">{skill.green_skill}</span>
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded" style={{ color: riskScore >= 0.5 ? "#ef4444" : "#f59e0b", backgroundColor: riskScore >= 0.5 ? "#ef444415" : "#f59e0b15" }}>
                        {(riskScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-5 text-[8px]">
                      <span className="px-1 py-0.5 rounded bg-white/5 text-white/40">{skill.department}</span>
                      <span className="px-1 py-0.5 rounded bg-white/5 text-white/40">{skill.skill_family}</span>
                      <span className="px-1 py-0.5 rounded bg-white/5 text-white/40">Gap: {skill.gap}</span>
                      <span className="px-1 py-0.5 rounded bg-white/5 text-white/40">
                        {getMaturityLabel(skill.current_level)} → {getMaturityLabel(skill.required_level)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Wins */}
            {quickWins.length > 0 && (
              <div className="mt-4">
                <div className="text-[9px] uppercase tracking-wider text-green-400/60 mb-1">Quick Wins</div>
                <p className="text-[9px] text-white/40 mb-2">Moderate gaps with high sustainability impact — easy to close, high reward.</p>
                <div className="space-y-1">
                  {quickWins.slice(0, 5).map(skill => (
                    <div key={skill.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-green-500/[0.04] border border-green-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      <span className="text-[10px] text-white/70 truncate flex-1">{skill.green_skill}</span>
                      <span className="text-[8px] text-white/40">{skill.department}</span>
                      <span className="text-[9px] text-green-400/70 font-mono">{(computeAvgOpt(skill) * 100).toFixed(0)}% impact</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === RISKS TAB === */}
        {!selectedDept && sidebarTab === "risks" && (
          <div className="px-5 py-3 flex-1 min-h-0 overflow-y-auto">
            {/* Compliance risk skills */}
            <div className="mb-4">
              <div className="text-[9px] uppercase tracking-wider text-red-400/60 mb-1">Compliance & Regulatory Risk</div>
              <p className="text-[9px] text-white/40 mb-2">Critical gaps in climate/risk-linked skills that expose the organisation to regulatory penalties.</p>
              {complianceRisks.length > 0 ? (
                <div className="space-y-1">
                  {complianceRisks.slice(0, 8).map(skill => (
                    <div key={skill.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-red-500/[0.04] border border-red-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-white/70 truncate block">{skill.green_skill}</span>
                        <div className="flex gap-2 text-[8px] text-white/30">
                          <span>{skill.department}</span>
                          <span>{skill.theme}</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-red-400 font-mono">-{skill.gap}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-white/30">No critical compliance risks identified.</div>
              )}
            </div>

            {/* Department risk ranking */}
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Department Risk Ranking</div>
              <p className="text-[9px] text-white/40 mb-2">Departments ranked by weighted risk score factoring gap severity, opt impact, and priority.</p>
              <div className="space-y-1">
                {[...departments]
                  .map(d => ({ dept: d, risk: computeDeptRiskScore(d, allSkills) }))
                  .sort((a, b) => b.risk - a.risk)
                  .map(({ dept, risk }, i) => {
                    const color = optScoreColor(computeAvgOpt(dept));
                    return (
                      <div key={dept.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02]">
                        <span className="text-[9px] font-mono text-white/20 w-3">#{i + 1}</span>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[10px] text-white/70 truncate flex-1">{dept.label}</span>
                        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${risk * 100}%`,
                            backgroundColor: risk >= 0.5 ? "#ef4444" : risk >= 0.3 ? "#f59e0b" : "#22c55e",
                          }} />
                        </div>
                        <span className="text-[9px] font-mono text-white/40 w-8 text-right">{(risk * 100).toFixed(0)}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* === SELECTED DEPARTMENT DETAIL === */}
        <AnimatePresence>
          {selectedDept && (() => {
            const deptOptAvg = computeAvgOpt(selectedDept);
            const dColor = optScoreColor(deptOptAvg);
            // Derive skills ourselves in case currentSkills is empty due to id mismatch
            const deptSkills = currentSkills.length > 0 ? currentSkills : skillsForDept(allSkills, selectedDept);
            const dCritical = deptSkills.filter(s => s.severity?.toLowerCase() === "critical").length;
            const dModerate = deptSkills.filter(s => s.severity?.toLowerCase() === "moderate").length;
            const dNoGap = deptSkills.filter(s => {
              const sev = s.severity?.toLowerCase();
              return sev === "no gap" || sev === "none" || sev === "healthy";
            }).length;
            return (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dColor, boxShadow: `0 0 6px ${dColor}66` }} />
                  <span className="text-white font-semibold text-[13px]">{selectedDept.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center p-1.5 rounded bg-white/[0.03]">
                    <div className="text-sm font-bold" style={{ color: dColor }}>{(deptOptAvg * 100).toFixed(0)}%</div>
                    <div className="text-[8px] text-white/40">Opt Score</div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-white/[0.03]">
                    <div className="text-sm font-bold text-white">{deptSkills.length}</div>
                    <div className="text-[8px] text-white/40">Skills</div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-white/[0.03]">
                    <div className="text-sm font-bold text-white">{selectedDept.priority_level}</div>
                    <div className="text-[8px] text-white/40">Priority</div>
                  </div>
                </div>
                {/* Gap distribution for this dept */}
                <div className="flex gap-3 text-[10px] mt-2">
                  <span className="text-red-400">{dCritical} Critical</span>
                  <span className="text-amber-400">{dModerate} Moderate</span>
                  <span className="text-green-400">{dNoGap} No Gap</span>
                </div>
                {(dCritical + dModerate + dNoGap) > 0 && (
                  <div className="flex h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-red-500" style={{ width: `${(dCritical / deptSkills.length) * 100}%` }} />
                    <div className="bg-amber-500" style={{ width: `${(dModerate / deptSkills.length) * 100}%` }} />
                    <div className="bg-green-500" style={{ width: `${(dNoGap / deptSkills.length) * 100}%` }} />
                  </div>
                )}
              </div>

              {deptSkills.length > 0 && (
                <div className="px-5 py-3 border-b border-white/5">
                  <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">
                    {selectedDept.label} — {deptSkills.length} Skills
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {deptSkills.map((skill) => {
                      const skillColor = getSkillSeverityColor(skill.severity);
                      return (
                        <div key={skill.id} className="flex items-center gap-2 text-[10px]">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: skillColor }} />
                          <span className="text-white/60 truncate flex-1">{skill.green_skill}</span>
                          <span className="text-white/40">{skill.current_level}/{skill.required_level}</span>
                          <span className="font-mono font-medium" style={{ color: skillColor }}>
                            {skill.gap > 0 ? `-${skill.gap}` : "ok"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="px-5 py-3 border-b border-white/5">
                <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">Optimization Factors</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedDeptFactors.slice(0, 8).map((f) => (
                    <div key={f.label}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-white/50">{f.label}</span>
                        <span className="text-white/70 font-mono">{formatScore(f.val)}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${f.val * 100}%`,
                          backgroundColor: optScoreColor(f.val),
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Immediate Actions */}
              {(() => {
                const actions = getPriorityActions(selectedDept, deptSkills).slice(0, 5);
                if (actions.length === 0) return null;
                return (
                  <div className="px-5 py-3 border-b border-white/5">
                    <div className="text-[9px] uppercase tracking-wider text-amber-400/60 mb-2">Immediate Actions</div>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {actions.map((a, i) => {
                        const aColor = getSkillSeverityColor(a.skill.severity);
                        return (
                          <div key={i} className="px-2 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-mono text-white/25 w-3">#{i + 1}</span>
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: aColor }} />
                              <span className="text-[10px] text-white/80 font-medium truncate flex-1">{a.skill.green_skill}</span>
                              <span className="text-[8px] px-1 py-0.5 rounded font-medium" style={{ color: aColor, backgroundColor: aColor + "15" }}>
                                {a.priority || a.skill.severity}
                              </span>
                            </div>
                            {a.action && (
                              <p className="text-[9px] text-white/50 ml-5 leading-relaxed">{a.action}</p>
                            )}
                            <div className="flex flex-wrap gap-1 ml-5 mt-1 text-[8px]">
                              <span className="px-1 py-0.5 rounded bg-white/5 text-white/40">
                                {a.currentMaturity} → {a.targetMaturity}
                              </span>
                              {a.linkedTheme && (
                                <span className="px-1 py-0.5 rounded bg-white/5 text-white/40">{a.linkedTheme}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="px-5 py-3 border-b border-white/5">
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-white/40">Desired Knowledge</span>
                    <span className="text-white/70">{selectedDept.desired_knowledge}</span>
                  </div>
                  {selectedDept.top_gaps && (
                    <div>
                      <span className="text-white/40">Top Gaps: </span>
                      <span className="text-white/60">{selectedDept.top_gaps}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Methodology + Export */}
        <div className="px-5 py-3 space-y-2">
          <button onClick={() => setShowMethodology(true)}
            className="w-full py-2 px-3 text-[10px] text-white/40 hover:text-white/70 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg transition-colors flex items-center justify-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
            How GreenPulse Works
          </button>
          <button onClick={handleExport}
            className="w-full py-2 px-3 text-[10px] text-white/40 hover:text-white/70 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg transition-colors flex items-center justify-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Export Full Gap Analysis (CSV)
          </button>
        </div>
      </motion.div>

      {showMethodology && <MethodologyModal onClose={() => setShowMethodology(false)} />}
    </>
  );
}
