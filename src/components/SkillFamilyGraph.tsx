"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { Department, GreenSkill, SkillFamily } from "@/lib/types";
import { getSeverityGlowColor, getSkillSeverityColor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SkillFamilyGraphProps {
  department: Department;
  skills: GreenSkill[];
  onFamilyClick: (family: SkillFamily, skills: GreenSkill[]) => void;
  onBack: () => void;
}

interface FamilyNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  isHub: boolean;
  color: string;
  radius: number;
  family?: SkillFamily;
  skills?: GreenSkill[];
  critCount?: number;
  modCount?: number;
  noGapCount?: number;
}

const FAMILIES: SkillFamily[] = ["Technical", "Knowledgeable", "Values", "Attitudes"];

function getFamilyColor(skills: GreenSkill[]): string {
  if (skills.length === 0) return "#6b7280";
  const crit = skills.filter(s => s.severity?.toLowerCase() === "critical").length;
  const mod = skills.filter(s => s.severity?.toLowerCase() === "moderate").length;
  if (crit > 0) return "#ef4444";
  if (mod > 0) return "#f59e0b";
  return "#22c55e";
}

export default function SkillFamilyGraph({ department, skills, onFamilyClick, onBack }: SkillFamilyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ node: FamilyNode; x: number; y: number } | null>(null);

  const buildGraph = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const hubColor = getSeverityGlowColor(department.gap_severity);
    const hubNode: FamilyNode = { id: "hub", label: department.label, isHub: true, color: hubColor, radius: 38 };

    const familyNodes: FamilyNode[] = FAMILIES.map((family) => {
      const familySkills = skills.filter((s) => s.skill_family === family);
      const color = getFamilyColor(familySkills);
      return {
        id: family, label: family, isHub: false, color, radius: 30, family,
        skills: familySkills,
        critCount: familySkills.filter(s => s.severity?.toLowerCase() === "critical").length,
        modCount: familySkills.filter(s => s.severity?.toLowerCase() === "moderate").length,
        noGapCount: familySkills.filter(s => s.severity?.toLowerCase() === "no gap" || s.severity?.toLowerCase() === "none").length,
      };
    });

    const allNodes = [hubNode, ...familyNodes];
    const links = familyNodes.map((fn) => ({ source: "hub", target: fn.id }));

    const defs = svg.append("defs");
    allNodes.forEach((node) => {
      const grad = defs.append("radialGradient").attr("id", `sfglow-${node.id}`).attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", node.color).attr("stop-opacity", 0.8);
      grad.append("stop").attr("offset", "60%").attr("stop-color", node.color).attr("stop-opacity", 0.25);
      grad.append("stop").attr("offset", "100%").attr("stop-color", node.color).attr("stop-opacity", 0);
    });
    const filter = defs.append("filter").attr("id", "sf-glow-filter").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const container = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const linkGroup = container.append("g").selectAll("line").data(links).enter().append("line")
      .attr("stroke", "rgba(255,255,255,0.12)").attr("stroke-width", 2).attr("class", "edge-animated");

    const glowGroup = container.append("g").selectAll("circle").data(allNodes).enter().append("circle")
      .attr("r", (d) => d.radius * 2).attr("fill", (d) => `url(#sfglow-${d.id})`).attr("opacity", 0.5).style("pointer-events", "none");

    const nodeGroup = container.append("g").selectAll("circle").data(allNodes).enter().append("circle")
      .attr("r", (d) => d.radius).attr("fill", (d) => d.color).attr("opacity", 0.9)
      .attr("stroke", "rgba(255,255,255,0.2)").attr("stroke-width", 1.5).attr("filter", "url(#sf-glow-filter)")
      .attr("cursor", (d) => d.isHub ? "default" : "pointer")
      .on("mouseover", function (event, d) {
        if (!d.isHub) { d3.select(this).attr("opacity", 1).attr("stroke-width", 3); }
        const [x, y] = d3.pointer(event, svgRef.current);
        setTooltip({ node: d, x, y });
      })
      .on("mouseout", function (_, d) {
        if (!d.isHub) { d3.select(this).attr("opacity", 0.9).attr("stroke-width", 1.5); }
        setTooltip(null);
      })
      .on("click", (_, d) => { if (!d.isHub && d.family && d.skills) onFamilyClick(d.family, d.skills); });

    // Skill count inside family nodes
    const countText = container.append("g").selectAll("text").data(allNodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", "0.35em").attr("fill", "white")
      .attr("font-size", (d) => d.isHub ? "12px" : "14px").attr("font-weight", "700").style("pointer-events", "none")
      .text((d) => d.isHub ? department.overall_score : (d.skills?.length || 0));

    const labelText = container.append("g").selectAll("text").data(allNodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", (d) => d.radius + 16)
      .attr("fill", "rgba(255,255,255,0.85)").attr("font-size", (d) => d.isHub ? "13px" : "11px")
      .attr("font-weight", "600").style("pointer-events", "none").text((d) => d.label);

    // Gap stats below family nodes
    const statsText = container.append("g").selectAll("text").data(familyNodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", (d) => d.radius + 28)
      .attr("fill", (d) => d.color).attr("font-size", "9px").style("pointer-events", "none")
      .text((d) => {
        const parts = [];
        if (d.critCount) parts.push(`${d.critCount}C`);
        if (d.modCount) parts.push(`${d.modCount}M`);
        if (d.noGapCount) parts.push(`${d.noGapCount}G`);
        return parts.join(" ");
      });

    const simulation = d3.forceSimulation<FamilyNode>(allNodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150).strength(0.8))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(0, 0))
      .force("collision", d3.forceCollide<FamilyNode>().radius((d) => d.radius + 25))
      .on("tick", () => {
        hubNode.x = 0; hubNode.y = 0;
        linkGroup.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y).attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
        nodeGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        glowGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        countText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
        labelText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
        statsText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
      });

    return () => { simulation.stop(); };
  }, [department, skills, onFamilyClick]);

  useEffect(() => { const cleanup = buildGraph(); return () => { cleanup?.(); }; }, [buildGraph]);

  const critCount = skills.filter((s) => s.severity?.toLowerCase() === "critical").length;
  const modCount = skills.filter((s) => s.severity?.toLowerCase() === "moderate").length;
  const noGapCount = skills.filter((s) => s.severity?.toLowerCase() === "no gap" || s.severity?.toLowerCase() === "none").length;

  return (
    <div className="relative w-full h-full">
      <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
        onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 12L6 8L10 4" /></svg>
        All Departments
      </motion.button>

      {/* Department info panel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="absolute bottom-4 left-4 z-20 bg-[#0c0c24]/90 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getSeverityGlowColor(department.gap_severity) }} />
          <span className="text-white font-semibold text-sm">{department.label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: getSeverityGlowColor(department.gap_severity), backgroundColor: getSeverityGlowColor(department.gap_severity) + "22" }}>
            {department.gap_severity} · {department.priority_level}
          </span>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-white/70">{critCount} Critical</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-white/70">{modCount} Moderate</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-white/70">{noGapCount} No Gap</span></div>
        </div>
        <div className="text-[10px] text-white/30 mt-1">Score: {department.overall_score} · Desired Knowledge: {department.desired_knowledge}</div>
      </motion.div>

      <svg ref={svgRef} className="w-full h-full" style={{ background: "transparent" }} />

      <AnimatePresence>
        {tooltip && !tooltip.node.isHub && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="absolute pointer-events-none z-50 bg-[#0f0f2e]/95 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 shadow-xl"
            style={{ left: tooltip.x + 15, top: tooltip.y - 10, maxWidth: 280 }}>
            <div className="text-white font-semibold text-sm">{tooltip.node.label}</div>
            <div className="text-xs text-white/60 mt-1">{tooltip.node.skills?.length || 0} skills</div>
            {tooltip.node.skills && tooltip.node.skills.length > 0 && (
              <div className="mt-2 space-y-1">
                {tooltip.node.skills.map((s) => (
                  <div key={s.id} className="flex items-center gap-1.5 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getSkillSeverityColor(s.severity) }} />
                    <span className="text-white/60 truncate">{s.green_skill}</span>
                    <span className="ml-auto text-white/40">{s.current_level}/{s.required_level}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="text-[10px] text-white/25 mt-2">Click to expand →</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
