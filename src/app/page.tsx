"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Department,
  DepartmentEdge,
  GreenSkill,
  SkillFamily,
  ViewLevel,
} from "@/lib/types";
import {
  fetchDepartments,
  fetchEdges,
  fetchAllSkills,
} from "@/lib/queries";
import { skillsForDept } from "@/lib/utils";
import NetworkGraph from "@/components/NetworkGraph";
import SkillFamilyGraph from "@/components/SkillFamilyGraph";
import SkillsGraph from "@/components/SkillsGraph";
import SkillDetailDrawer from "@/components/SkillDetailDrawer";
import KPISidebar from "@/components/KPISidebar";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Home() {
  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [edges, setEdges] = useState<DepartmentEdge[]>([]);
  const [allSkills, setAllSkills] = useState<GreenSkill[]>([]);
  const [currentSkills, setCurrentSkills] = useState<GreenSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation state
  const [viewLevel, setViewLevel] = useState<ViewLevel>("departments");
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<SkillFamily | null>(null);
  const [familySkills, setFamilySkills] = useState<GreenSkill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<GreenSkill | null>(null);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [depts, edgesData, skills] = await Promise.all([
          fetchDepartments(),
          fetchEdges(),
          fetchAllSkills(),
        ]);
        setDepartments(depts);
        setEdges(edgesData);
        setAllSkills(skills);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(
          "Failed to connect to database. Please check your Supabase configuration."
        );
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle department click
  const handleDeptClick = useCallback(
    (dept: Department) => {
      setSelectedDept(dept);
      setViewLevel("families");
      const deptSkills = skillsForDept(allSkills, dept);
      setCurrentSkills(deptSkills);
    },
    [allSkills]
  );

  // Handle family click
  const handleFamilyClick = useCallback(
    (family: SkillFamily, skills: GreenSkill[]) => {
      setSelectedFamily(family);
      setFamilySkills(skills);
      setViewLevel("skills");
    },
    []
  );

  // Handle skill click
  const handleSkillClick = useCallback((skill: GreenSkill) => {
    setSelectedSkill(skill);
  }, []);

  // Navigate breadcrumbs
  const handleNavigate = useCallback((level: ViewLevel) => {
    if (level === "departments") {
      setViewLevel("departments");
      setSelectedDept(null);
      setSelectedFamily(null);
      setFamilySkills([]);
      setCurrentSkills([]);
    } else if (level === "families") {
      setViewLevel("families");
      setSelectedFamily(null);
      setFamilySkills([]);
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a1a]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-green-500/40 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-green-500/60" />
          </div>
          <p className="text-white/60 text-sm">Loading GreenPulse...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="text-center max-w-md px-6">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <h2 className="text-white font-semibold mb-2">Connection Error</h2>
          <p className="text-white/50 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-sm text-white/70 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-[#0a0a1a] overflow-hidden">
      {/* Main canvas area */}
      <div className="flex-1 relative">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Breadcrumbs */}
        <Breadcrumbs
          level={viewLevel}
          departmentLabel={selectedDept?.label || selectedDept?.department}
          familyLabel={selectedFamily || undefined}
          onNavigate={handleNavigate}
        />

        {/* Graph views with animated transitions */}
        <AnimatePresence mode="wait">
          {viewLevel === "departments" && (
            <motion.div
              key="departments"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <NetworkGraph
                departments={departments}
                edges={edges}
                allSkills={allSkills}
                onNodeClick={handleDeptClick}
              />
            </motion.div>
          )}

          {viewLevel === "families" && selectedDept && (
            <motion.div
              key={`families-${selectedDept.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <SkillFamilyGraph
                department={selectedDept}
                skills={currentSkills}
                edges={edges}
                allDepartments={departments}
                onFamilyClick={handleFamilyClick}
                onBack={() => handleNavigate("departments")}
              />
            </motion.div>
          )}

          {viewLevel === "skills" && selectedFamily && selectedDept && (
            <motion.div
              key={`skills-${selectedDept.id}-${selectedFamily}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <SkillsGraph
                family={selectedFamily}
                skills={familySkills}
                departmentLabel={
                  selectedDept.label || selectedDept.department
                }
                onSkillClick={handleSkillClick}
                onBack={() => handleNavigate("families")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* KPI Sidebar */}
      <KPISidebar departments={departments} allSkills={allSkills} selectedDept={selectedDept} currentSkills={currentSkills} viewLevel={viewLevel} />

      {/* Skill Detail Drawer */}
      <AnimatePresence>
        {selectedSkill && (
          <SkillDetailDrawer
            skill={selectedSkill}
            onClose={() => setSelectedSkill(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
