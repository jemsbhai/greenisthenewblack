"use client";

import React, { useState } from "react";
import { Department, GreenSkill } from "@/lib/types";
import { getSeverityGlowColor, formatScore } from "@/lib/utils";
import { motion } from "framer-motion";
import MethodologyModal from "./MethodologyModal";

interface KPISidebarProps {
  departments: Department[];
  allSkills: GreenSkill[];
  selectedDept: Department | null;
  currentSkills: GreenSkill[];
}

export default function KPISidebar({ departments, allSkills, selectedDept, currentSkills }: KPISidebarProps) {
  const [showMethodology, setShowMethodology] = useState(false);

  const totalCritical = departments.reduce((s, d) => s + (d.critical_gap_count || 0), 0);
  const totalModerate = departments.reduce((s, d) => s + (d.moderate_gap_count || 0), 0);
  const totalNoGap = departments.reduce((s, d) => s + (d.no_gap_count || 0), 0);
  const totalSkills = totalCritical + totalModerate + totalNoGap;
  const readiness = totalSkills > 0 ? ((totalNoGap / totalSkills) * 100).toFixed(0) : "0";
  const totalScore = departments.reduce((s, d) => s + (d.overall_score || 0), 0);
  const avgScore = departments.length > 0 ? (totalScore / departments.length).toFixed(0) : "0";

  const sortedDepts = [...departments].sort((a, b) => (b.critical_gap_count || 0) - (a.critical_gap_count || 0));

  // Theme breakdown from skills
  const themes = allSkills.reduce((acc, s) => {
    const t = s.theme || "Other";
    if (!acc[t]) acc[t] = { critical: 0, moderate: 0, noGap: 0 };
    if (s.severity?.toLowerCase() === "critical") acc[t].critical++;
    else if (s.severity?.toLowerCase() === "moderate") acc[t].moderate++;
    else acc[t].noGap++;
    return acc;
  }, {} as Record<string, { critical: number; moderate: number; noGap: number }>);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
        className="w-80 flex-shrink-0 bg-[#0c0c24]/80 backdrop-blur-md border-l border-white/5 flex flex-col overflow-y-auto"
      >
        {/* Logo */}
        <div className="px-5 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" /></svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">GreenPulse</h1>
              <p className="text-[9px] text-white/30">Skills Gap Intelligence Platform</p>
            </div>
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

        {/* All Departments List */}
        <div className="px-5 py-3 border-b border-white/5 flex-1 min-h-0 overflow-y-auto">
          <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">All Departments</div>
          <div className="space-y-1">
            {sortedDepts.map((dept) => {
              const color = getSeverityGlowColor(dept.gap_severity);
              const total = (dept.critical_gap_count || 0) + (dept.moderate_gap_count || 0) + (dept.no_gap_count || 0);
              const isSelected = selectedDept?.id === dept.id;
              return (
                <div key={dept.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${isSelected ? "bg-white/[0.08] border border-white/10" : "bg-white/[0.02] border border-transparent"}`}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}66` }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/80 truncate font-medium">{dept.label}</span>
                      <span className="text-[10px] text-white/50 ml-1">{dept.overall_score}</span>
                    </div>
                    {/* Mini gap bar */}
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

        {/* Theme Breakdown */}
        <div className="px-5 py-3 border-b border-white/5">
          <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">By Theme</div>
          <div className="space-y-1.5">
            {Object.entries(themes).map(([theme, counts]) => (
              <div key={theme} className="flex items-center justify-between text-[10px]">
                <span className="text-white/60 truncate">{theme}</span>
                <div className="flex gap-2">
                  {counts.critical > 0 && <span className="text-red-400">{counts.critical}C</span>}
                  {counts.moderate > 0 && <span className="text-amber-400">{counts.moderate}M</span>}
                  <span className="text-green-400">{counts.noGap}G</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Department Detail */}
        {selectedDept && currentSkills.length > 0 && (
          <div className="px-5 py-3 border-b border-white/5">
            <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">
              {selectedDept.label} — Skills
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {currentSkills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-2 text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: getSeverityGlowColor(skill.severity === "No Gap" ? "healthy" : skill.severity) }} />
                  <span className="text-white/60 truncate flex-1">{skill.green_skill}</span>
                  <span className="text-white/40">{skill.current_level}/{skill.required_level}</span>
                  <span className="font-mono" style={{ color: getSeverityGlowColor(skill.severity === "No Gap" ? "healthy" : skill.severity) }}>
                    {skill.gap > 0 ? `-${skill.gap}` : "✓"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opt Factor Highlights */}
        {selectedDept && (
          <div className="px-5 py-3 border-b border-white/5">
            <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">
              {selectedDept.label} — Top Opt Factors
            </div>
            {(() => {
              const factors = [
                { label: "Carbon Footprint", val: selectedDept.opt_carbon_footprint },
                { label: "Supply Chain", val: selectedDept.opt_supply_chain_emissions },
                { label: "Logistics", val: selectedDept.opt_logistics_shipping },
                { label: "Digital Footprint", val: selectedDept.opt_digital_footprint },
                { label: "Material Waste", val: selectedDept.opt_material_waste },
                { label: "Remote Work", val: selectedDept.opt_remote_work },
                { label: "Fleet Electrification", val: selectedDept.opt_fleet_electrification },
                { label: "Employee Commuting", val: selectedDept.opt_employee_commuting },
              ].sort((a, b) => (b.val || 0) - (a.val || 0)).slice(0, 5);
              return (
                <div className="space-y-1.5">
                  {factors.map((f) => (
                    <div key={f.label}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-white/50">{f.label}</span>
                        <span className="text-white/70 font-mono">{formatScore(f.val)}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500/60" style={{ width: `${(f.val || 0) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Methodology */}
        <div className="px-5 py-3">
          <button onClick={() => setShowMethodology(true)}
            className="w-full py-2 px-3 text-[10px] text-white/40 hover:text-white/70 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg transition-colors flex items-center justify-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
            How GreenPulse Works
          </button>
        </div>
      </motion.div>

      {showMethodology && <MethodologyModal onClose={() => setShowMethodology(false)} />}
    </>
  );
}
