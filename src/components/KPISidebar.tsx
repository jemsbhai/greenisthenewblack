"use client";

import React, { useState } from "react";
import { Department, GreenSkill } from "@/lib/types";
import { computeAvgOpt, getGlowColor } from "@/lib/utils";
import { motion } from "framer-motion";
import MethodologyModal from "./MethodologyModal";

interface KPISidebarProps {
  departments: Department[];
  allSkills: GreenSkill[];
}

export default function KPISidebar({ departments }: KPISidebarProps) {
  const [showMethodology, setShowMethodology] = useState(false);

  const totalCritical = departments.reduce(
    (sum, d) => sum + (d.critical_gap_count || 0),
    0
  );
  const totalModerate = departments.reduce(
    (sum, d) => sum + (d.moderate_gap_count || 0),
    0
  );
  const totalNoGap = departments.reduce(
    (sum, d) => sum + (d.no_gap_count || 0),
    0
  );
  const totalSkills = totalCritical + totalModerate + totalNoGap;
  const readiness =
    totalSkills > 0 ? ((totalNoGap / totalSkills) * 100).toFixed(0) : "0";

  // Priority departments (sort by critical gap count descending)
  const priorityDepts = [...departments]
    .sort((a, b) => (b.critical_gap_count || 0) - (a.critical_gap_count || 0))
    .slice(0, 3);

  // Org-wide avg optimization
  const orgAvgOpt =
    departments.length > 0
      ? departments.reduce((sum, d) => sum + computeAvgOpt(d), 0) /
        departments.length
      : 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="w-72 flex-shrink-0 bg-navy-800/60 backdrop-blur-md border-l border-white/5 flex flex-col overflow-y-auto"
      >
        {/* Logo / Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M8 12l3 3 5-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                GreenPulse
              </h1>
              <p className="text-[10px] text-white/40 -mt-0.5">
                Skills Gap Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Readiness Score */}
        <div className="px-5 py-4 border-b border-white/5">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
            Organisation Readiness
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">{readiness}%</span>
            <span className="text-xs text-white/40 mb-1">green-ready</span>
          </div>
          <div className="mt-2 w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${readiness}%`,
                background: `linear-gradient(90deg, #ef4444, #f59e0b, #22c55e)`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/30 mt-1">
            <span>Critical</span>
            <span>Ready</span>
          </div>
        </div>

        {/* Gap Summary */}
        <div className="px-5 py-4 border-b border-white/5">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-3">
            Gap Summary
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                <span className="text-sm text-white/70">Critical Gaps</span>
              </div>
              <span className="text-sm font-semibold text-red-400">
                {totalCritical}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                <span className="text-sm text-white/70">Moderate Gaps</span>
              </div>
              <span className="text-sm font-semibold text-amber-400">
                {totalModerate}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                <span className="text-sm text-white/70">No Gap</span>
              </div>
              <span className="text-sm font-semibold text-green-400">
                {totalNoGap}
              </span>
            </div>
          </div>
        </div>

        {/* Org Avg Optimization */}
        <div className="px-5 py-4 border-b border-white/5">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
            Avg Optimization Score
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: `${getGlowColor(orgAvgOpt)}22`,
                color: getGlowColor(orgAvgOpt),
                boxShadow: `0 0 12px ${getGlowColor(orgAvgOpt)}33`,
              }}
            >
              {(orgAvgOpt * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-white/50">
              across {departments.length} departments &amp; 16 sustainability
              factors
            </div>
          </div>
        </div>

        {/* Priority Departments */}
        <div className="px-5 py-4 border-b border-white/5 flex-1">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-3">
            Priority Departments
          </div>
          <div className="space-y-2">
            {priorityDepts.map((dept, i) => {
              const avgOpt = computeAvgOpt(dept);
              return (
                <div
                  key={dept.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
                >
                  <span className="text-xs text-white/30 w-4">{i + 1}.</span>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: getGlowColor(avgOpt),
                      boxShadow: `0 0 6px ${getGlowColor(avgOpt)}66`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80 truncate">
                      {dept.label || dept.department}
                    </div>
                    <div className="text-[10px] text-white/40">
                      {dept.critical_gap_count} critical gaps
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Methodology Button */}
        <div className="px-5 py-4">
          <button
            onClick={() => setShowMethodology(true)}
            className="w-full py-2 px-3 text-xs text-white/50 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            How It Works
          </button>
        </div>
      </motion.div>

      {showMethodology && (
        <MethodologyModal onClose={() => setShowMethodology(false)} />
      )}
    </>
  );
}
