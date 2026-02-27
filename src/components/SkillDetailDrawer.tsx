"use client";

import React from "react";
import { motion } from "framer-motion";
import { GreenSkill } from "@/lib/types";
import {
  computeAvgOpt,
  getOptColor,
  getSkillSeverityColor,
  OPT_COLUMNS,
  formatOptLabel,
} from "@/lib/utils";
import OptRadarChart from "./OptRadarChart";

interface SkillDetailDrawerProps {
  skill: GreenSkill;
  onClose: () => void;
}

export default function SkillDetailDrawer({
  skill,
  onClose,
}: SkillDetailDrawerProps) {
  const avgOpt = computeAvgOpt(skill);
  const glowColor = getOptColor(avgOpt);
  const sevColor = getSkillSeverityColor(skill.severity);
  const levelPercent =
    skill.required_level > 0
      ? (skill.current_level / skill.required_level) * 100
      : 0;

  // Radar data
  const radarData = OPT_COLUMNS.map((col) => ({
    factor: formatOptLabel(col),
    value: Number(skill[col]) || 0,
    fullMark: 1,
  }));

  // Top optimization factors
  const topFactors = [...radarData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex justify-end bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-navy-800/95 backdrop-blur-md border-l border-white/10 h-full overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: glowColor,
                    boxShadow: `0 0 8px ${glowColor}66`,
                  }}
                />
                <span className="text-xs text-white/40 uppercase tracking-wider">
                  {skill.skill_family}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {skill.green_skill}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/80 transition-colors ml-2 mt-1"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span
              className="text-[11px] px-2 py-0.5 rounded-full border font-medium"
              style={{
                color: sevColor,
                borderColor: `${sevColor}44`,
                backgroundColor: `${sevColor}11`,
              }}
            >
              {skill.severity}
            </span>
            {skill.theme && (
              <span className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 text-white/50 bg-white/[0.03]">
                {skill.theme}
              </span>
            )}
            {skill.priority_level && (
              <span className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 text-white/50 bg-white/[0.03]">
                Priority: {skill.priority_level}
              </span>
            )}
          </div>
        </div>

        {/* Level Bar */}
        <div className="px-6 py-4 border-b border-white/5">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
            Skill Level
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">
                  Current: {skill.current_level}
                </span>
                <span className="text-white/60">
                  Required: {skill.required_level}
                </span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(levelPercent, 100)}%`,
                    background:
                      levelPercent >= 100
                        ? "#22c55e"
                        : levelPercent >= 50
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                />
                {/* Required level marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-white/40"
                  style={{ left: "100%" }}
                />
              </div>
            </div>
            <div
              className="text-xl font-bold min-w-[40px] text-center"
              style={{ color: sevColor }}
            >
              {skill.gap > 0 ? `-${skill.gap}` : skill.gap === 0 ? "✓" : skill.gap}
            </div>
          </div>
        </div>

        {/* Description */}
        {skill.description && (
          <div className="px-6 py-4 border-b border-white/5">
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
              Description
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              {skill.description}
            </p>
          </div>
        )}

        {/* Why it matters */}
        {skill.why_it_matters && (
          <div className="px-6 py-4 border-b border-white/5">
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
              Why It Matters
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              {skill.why_it_matters}
            </p>
          </div>
        )}

        {/* Example behaviours */}
        {skill.example_behaviours && (
          <div className="px-6 py-4 border-b border-white/5">
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
              Example Behaviours
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              {skill.example_behaviours}
            </p>
          </div>
        )}

        {/* Radar Chart */}
        <div className="px-6 py-4 border-b border-white/5">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-3">
            Optimization Factor Profile
          </div>
          <div className="h-72 -mx-2">
            <OptRadarChart data={radarData} color={glowColor} />
          </div>
        </div>

        {/* Top Factors */}
        <div className="px-6 py-4">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-3">
            Top Impact Factors
          </div>
          <div className="space-y-2">
            {topFactors.map((f) => (
              <div key={f.factor} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/70 truncate">
                    {f.factor}
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${f.value * 100}%`,
                        backgroundColor: glowColor,
                      }}
                    />
                  </div>
                </div>
                <span
                  className="text-xs font-mono min-w-[35px] text-right"
                  style={{ color: glowColor }}
                >
                  {(f.value * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
