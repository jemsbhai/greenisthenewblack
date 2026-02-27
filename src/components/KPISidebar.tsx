"use client";

import React, { useState, useCallback } from "react";
import { Department, GreenSkill, ViewLevel } from "@/lib/types";
import { getSeverityGlowColor, formatScore, OPT_COLUMNS, formatOptLabel } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import MethodologyModal from "./MethodologyModal";

interface KPISidebarProps {
  departments: Department[];
  allSkills: GreenSkill[];
  selectedDept: Department | null;
  currentSkills: GreenSkill[];
  viewLevel: ViewLevel;
}

function exportCSV(departments: Department[], skills: GreenSkill[]) {
  // Build comprehensive CSV with all skill data
  const headers = [
    "Department", "Skill Family", "Green Skill", "Theme",
    "Current Level", "Required Level", "Gap", "Severity",
    "Priority", "Description", "Why It Matters",
    ...OPT_COLUMNS.map(c => formatOptLabel(c)),
  ];

  const rows = skills.map(s => [
    s.department,
    s.skill_family,
    s.green_skill,
    s.theme,
    s.current_level,
    s.required_level,
    s.gap,
    s.severity,
    s.priority_level,
    `"${(s.description || "").replace(/"/g, '""')}"`,
    `"${(s.why_it_matters || "").replace(/"/g, '""')}"`,
    ...OPT_COLUMNS.map(c => Number((s as any)[c]) || 0),
  ]);

  // Department summary section
  const deptHeaders = ["Department", "Overall Score", "Gap Severity", "Priority", "Critical Gaps", "Moderate Gaps", "No Gap", "Desired Knowledge", "Top Gaps"];
  const deptRows = departments.map(d => [
    d.label, d.overall_score, d.gap_severity, d.priority_level,
    d.critical_gap_count, d.moderate_gap_count, d.no_gap_count,
    `"${(d.desired_knowledge || "").replace(/"/g, '""')}"`,
    `"${(d.top_gaps || "").replace(/"/g, '""')}"`,
  ]);

  const csv = [
    "=== DEPARTMENT SUMMARY ===",
    deptHeaders.join(","),
    ...deptRows.map(r => r.join(",")),
    "",
    "=== FULL SKILLS DATA ===",
    headers.join(","),
    ...rows.map(r => r.join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `greenpulse_gap_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function KPISidebar({ departments, allSkills, selectedDept, currentSkills, viewLevel: _viewLevel }: KPISidebarProps) {
  const [showMethodology, setShowMethodology] = useState(false);

  const totalCritical = departments.reduce((s, d) => s + (d.critical_gap_count || 0), 0);
  const totalModerate = departments.reduce((s, d) => s + (d.moderate_gap_count || 0), 0);
  const totalNoGap = departments.reduce((s, d) => s + (d.no_gap_count || 0), 0);
  const totalSkills = totalCritical + totalModerate + totalNoGap;
  const readiness = totalSkills > 0 ? ((totalNoGap / totalSkills) * 100).toFixed(0) : "0";
  const totalScore = departments.reduce((s, d) => s + (d.overall_score || 0), 0);
  const avgScore = departments.length > 0 ? (totalScore / departments.length).toFixed(0) : "0";

  // High-risk departments (critical severity, sorted by critical gap count)
  const highRiskDepts = [...departments]
    .filter(d => d.gap_severity?.toLowerCase() === "critical")
    .sort((a, b) => (b.critical_gap_count || 0) - (a.critical_gap_count || 0));

  const sortedDepts = [...departments].sort((a, b) => (b.critical_gap_count || 0) - (a.critical_gap_count || 0));

  // Theme breakdown from skills
  const themes = allSkills.reduce((acc, s) => {
    const t = s.theme || "Other";
    if (!acc[t]) acc[t] = { critical: 0, moderate: 0, noGap: 0, total: 0 };
    if (s.severity?.toLowerCase() === "critical") acc[t].critical++;
    else if (s.severity?.toLowerCase() === "moderate") acc[t].moderate++;
    else acc[t].noGap++;
    acc[t].total++;
    return acc;
  }, {} as Record<string, { critical: number; moderate: number; noGap: number; total: number }>);

  // Department × Theme heatmap data
  const themeNames = Object.keys(themes);
  const heatmapData = departments.map(dept => {
    const deptSkills = allSkills.filter(s => s.department === dept.id);
    const byTheme: Record<string, { crit: number; mod: number; noGap: number }> = {};
    themeNames.forEach(t => { byTheme[t] = { crit: 0, mod: 0, noGap: 0 }; });
    deptSkills.forEach(s => {
      const t = s.theme || "Other";
      if (byTheme[t]) {
        if (s.severity?.toLowerCase() === "critical") byTheme[t].crit++;
        else if (s.severity?.toLowerCase() === "moderate") byTheme[t].mod++;
        else byTheme[t].noGap++;
      }
    });
    return { dept, byTheme };
  });

  // Selected dept opt factors (all 16)
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
              <div className="text-xl font-bold text-white">{avgScore}</div>
              <div className="text-[9px] text-white/40 mt-0.5">Avg Score</div>
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

        {/* HIGH-RISK ROLES TABLE */}
        {highRiskDepts.length > 0 && !selectedDept && (
          <div className="px-5 py-3 border-b border-white/5">
            <div className="text-[9px] uppercase tracking-wider text-red-400/60 mb-2">High-Risk Departments</div>
            <div className="space-y-1">
              {highRiskDepts.map((dept) => (
                <div key={dept.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-red-500/[0.06] border border-red-500/10">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" style={{ boxShadow: "0 0 6px #ef444466" }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-white/80 font-medium truncate block">{dept.label}</span>
                    <div className="flex gap-2 text-[9px]">
                      <span className="text-red-400">{dept.critical_gap_count} critical</span>
                      <span className="text-white/30">Priority: {dept.priority_level}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/50 font-mono">{dept.overall_score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEPARTMENT×THEME HEATMAP */}
        {!selectedDept && (
          <div className="px-5 py-3 border-b border-white/5">
            <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">Department × Theme Heatmap</div>
            <div className="overflow-x-auto">
              <table className="w-full text-[9px]">
                <thead>
                  <tr>
                    <th className="text-left text-white/30 font-normal pb-1 pr-1">Dept</th>
                    {themeNames.map(t => (
                      <th key={t} className="text-center text-white/30 font-normal pb-1 px-0.5" title={t}>
                        {t.length > 8 ? t.slice(0, 7) + "…" : t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map(({ dept, byTheme }) => (
                    <tr key={dept.id}>
                      <td className="text-white/50 pr-1 py-0.5 truncate max-w-[80px]" title={dept.label}>
                        {dept.label.length > 10 ? dept.label.slice(0, 9) + "…" : dept.label}
                      </td>
                      {themeNames.map(t => {
                        const cell = byTheme[t];
                        const total = cell.crit + cell.mod + cell.noGap;
                        // Color intensity based on severity
                        let bg = "transparent";
                        if (total > 0) {
                          if (cell.crit > 0) bg = `rgba(239,68,68,${0.15 + (cell.crit / total) * 0.4})`;
                          else if (cell.mod > 0) bg = `rgba(245,158,11,${0.15 + (cell.mod / total) * 0.3})`;
                          else bg = `rgba(34,197,94,${0.15 + (cell.noGap / total) * 0.3})`;
                        }
                        return (
                          <td key={t} className="text-center py-0.5 px-0.5">
                            <div className="rounded px-1 py-0.5 text-white/70 font-mono" style={{ backgroundColor: bg }} title={`${dept.label} - ${t}: ${cell.crit}C ${cell.mod}M ${cell.noGap}G`}>
                              {total > 0 ? total : "—"}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[8px] text-white/30">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-red-500/40" /> Critical</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-amber-500/40" /> Moderate</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-green-500/40" /> No Gap</div>
            </div>
          </div>
        )}

        {/* All Departments List (shown when no dept selected) */}
        {!selectedDept && (
          <div className="px-5 py-3 border-b border-white/5 flex-1 min-h-0 overflow-y-auto">
            <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">All Departments</div>
            <div className="space-y-1">
              {sortedDepts.map((dept) => {
                const color = getSeverityGlowColor(dept.gap_severity);
                const total = (dept.critical_gap_count || 0) + (dept.moderate_gap_count || 0) + (dept.no_gap_count || 0);
                return (
                  <div key={dept.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-transparent">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}66` }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-white/80 truncate font-medium">{dept.label}</span>
                        <span className="text-[10px] text-white/50 ml-1">{dept.overall_score}</span>
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
                      {dept.gap_severity?.slice(0, 4)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Theme Breakdown */}
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

        {/* === SELECTED DEPARTMENT DETAIL SECTION === */}
        <AnimatePresence>
          {selectedDept && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              {/* Department header */}
              <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getSeverityGlowColor(selectedDept.gap_severity), boxShadow: `0 0 6px ${getSeverityGlowColor(selectedDept.gap_severity)}66` }} />
                  <span className="text-white font-semibold text-[13px]">{selectedDept.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center p-1.5 rounded bg-white/[0.03]">
                    <div className="text-sm font-bold text-white">{selectedDept.overall_score}</div>
                    <div className="text-[8px] text-white/40">Score</div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-white/[0.03]">
                    <div className="text-sm font-bold" style={{ color: getSeverityGlowColor(selectedDept.gap_severity) }}>{selectedDept.gap_severity}</div>
                    <div className="text-[8px] text-white/40">Severity</div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-white/[0.03]">
                    <div className="text-sm font-bold text-white">{selectedDept.priority_level}</div>
                    <div className="text-[8px] text-white/40">Priority</div>
                  </div>
                </div>
              </div>

              {/* Skills list for selected dept */}
              {currentSkills.length > 0 && (
                <div className="px-5 py-3 border-b border-white/5">
                  <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">
                    {selectedDept.label} — {currentSkills.length} Skills
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {currentSkills.map((skill) => {
                      const skillColor = getSeverityGlowColor(skill.severity === "No Gap" ? "healthy" : skill.severity);
                      return (
                        <div key={skill.id} className="flex items-center gap-2 text-[10px]">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: skillColor }} />
                          <span className="text-white/60 truncate flex-1">{skill.green_skill}</span>
                          <span className="text-white/40">{skill.current_level}/{skill.required_level}</span>
                          <span className="font-mono font-medium" style={{ color: skillColor }}>
                            {skill.gap > 0 ? `-${skill.gap}` : "✓"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All 16 Opt Factors for selected dept */}
              <div className="px-5 py-3 border-b border-white/5">
                <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">
                  {selectedDept.label} — All Optimization Factors
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {selectedDeptFactors.map((f) => (
                    <div key={f.label}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-white/50">{f.label}</span>
                        <span className="text-white/70 font-mono">{formatScore(f.val)}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${f.val * 100}%`,
                          backgroundColor: f.val >= 0.4 ? "#22c55e" : f.val >= 0.2 ? "#f59e0b" : "#6b7280",
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dept additional info */}
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
          )}
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
