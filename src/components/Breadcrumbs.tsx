"use client";

import React from "react";
import { motion } from "framer-motion";
import { ViewLevel, SkillFamily } from "@/lib/types";

interface BreadcrumbsProps {
  level: ViewLevel;
  departmentLabel?: string;
  familyLabel?: SkillFamily;
  onNavigate: (level: ViewLevel) => void;
}

export default function Breadcrumbs({
  level,
  departmentLabel,
  familyLabel,
  onNavigate,
}: BreadcrumbsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-4 py-2 bg-navy-800/80 backdrop-blur-sm border border-white/5 rounded-full"
    >
      <button
        onClick={() => onNavigate("departments")}
        className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
          level === "departments"
            ? "text-white bg-white/10"
            : "text-white/40 hover:text-white/70"
        }`}
      >
        Departments
      </button>

      {(level === "families" || level === "skills") && departmentLabel && (
        <>
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          >
            <path d="M6 4l4 4-4 4" />
          </svg>
          <button
            onClick={() => onNavigate("families")}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
              level === "families"
                ? "text-white bg-white/10"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {departmentLabel}
          </button>
        </>
      )}

      {level === "skills" && familyLabel && (
        <>
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          >
            <path d="M6 4l4 4-4 4" />
          </svg>
          <span className="text-xs px-2 py-0.5 rounded-full text-white bg-white/10">
            {familyLabel}
          </span>
        </>
      )}
    </motion.div>
  );
}
