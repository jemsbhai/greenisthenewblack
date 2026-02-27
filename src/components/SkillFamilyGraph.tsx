"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { Department, GreenSkill, SkillFamily } from "@/lib/types";
import { computeAvgOpt, getGlowColor } from "@/lib/utils";
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
  avgOpt: number;
  radius: number;
  family?: SkillFamily;
  skills?: GreenSkill[];
}

interface TooltipData {
  node: FamilyNode;
  x: number;
  y: number;
}

const FAMILIES: SkillFamily[] = [
  "Technical",
  "Knowledgeable",
  "Values",
  "Attitudes",
];

export default function SkillFamilyGraph({
  department,
  skills,
  onFamilyClick,
  onBack,
}: SkillFamilyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const buildGraph = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const deptAvgOpt = computeAvgOpt(department);

    // Create hub node
    const hubNode: FamilyNode = {
      id: "hub",
      label: department.label || department.department,
      isHub: true,
      avgOpt: deptAvgOpt,
      radius: 35,
    };

    // Create family nodes
    const familyNodes: FamilyNode[] = FAMILIES.map((family) => {
      const familySkills = skills.filter((s) => s.skill_family === family);
      let avgOpt = 0;
      if (familySkills.length > 0) {
        avgOpt =
          familySkills.reduce((sum, s) => sum + computeAvgOpt(s), 0) /
          familySkills.length;
      }
      return {
        id: family,
        label: family,
        isHub: false,
        avgOpt,
        radius: 28,
        family,
        skills: familySkills,
      };
    });

    const allNodes = [hubNode, ...familyNodes];

    const links = familyNodes.map((fn) => ({
      source: "hub",
      target: fn.id,
    }));

    // Defs
    const defs = svg.append("defs");
    allNodes.forEach((node) => {
      const color = getGlowColor(node.avgOpt);
      const grad = defs
        .append("radialGradient")
        .attr("id", `sfglow-${node.id}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");
      grad
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.9);
      grad
        .append("stop")
        .attr("offset", "60%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.3);
      grad
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0);
    });

    const filter = defs
      .append("filter")
      .attr("id", "sf-glow-filter")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "blur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const container = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Draw edges
    const linkGroup = container
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "rgba(255,255,255,0.15)")
      .attr("stroke-width", 2)
      .attr("class", "edge-animated");

    // Draw glow halos
    const glowGroup = container
      .append("g")
      .selectAll("circle")
      .data(allNodes)
      .enter()
      .append("circle")
      .attr("r", (d) => d.radius * 2)
      .attr("fill", (d) => `url(#sfglow-${d.id})`)
      .attr("opacity", 0.5)
      .style("pointer-events", "none");

    // Draw nodes
    const nodeGroup = container
      .append("g")
      .selectAll("circle")
      .data(allNodes)
      .enter()
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => getGlowColor(d.avgOpt))
      .attr("opacity", 0.85)
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", 1.5)
      .attr("filter", "url(#sf-glow-filter)")
      .attr("cursor", (d) => (d.isHub ? "default" : "pointer"))
      .on("mouseover", function (event, d) {
        if (!d.isHub) {
          d3.select(this).attr("opacity", 1).attr("stroke-width", 3);
        }
        const [x, y] = d3.pointer(event, svgRef.current);
        setTooltip({ node: d, x, y });
      })
      .on("mouseout", function (_, d) {
        if (!d.isHub) {
          d3.select(this).attr("opacity", 0.85).attr("stroke-width", 1.5);
        }
        setTooltip(null);
      })
      .on("click", (_, d) => {
        if (!d.isHub && d.family && d.skills) {
          onFamilyClick(d.family, d.skills);
        }
      });

    // Labels
    container
      .append("g")
      .selectAll("text")
      .data(allNodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.radius + 18)
      .attr("fill", "rgba(255,255,255,0.8)")
      .attr("font-size", (d) => (d.isHub ? "13px" : "11px"))
      .attr("font-weight", (d) => (d.isHub ? "600" : "500"))
      .style("pointer-events", "none")
      .text((d) => d.label);

    // Force simulation
    const simulation = d3
      .forceSimulation<FamilyNode>(allNodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(140)
          .strength(0.8)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(0, 0))
      .force(
        "collision",
        d3.forceCollide<FamilyNode>().radius((d) => d.radius + 20)
      )
      // Pin the hub to center
      .on("tick", () => {
        hubNode.x = 0;
        hubNode.y = 0;

        linkGroup
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

        nodeGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        glowGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);

        container
          .selectAll<SVGTextElement, FamilyNode>("text")
          .attr("x", (d) => d.x!)
          .attr("y", (d) => d.y!);
      });

    return () => simulation.stop();
  }, [department, skills, onFamilyClick]);

  useEffect(() => {
    const cleanup = buildGraph();
    return () => { cleanup?.(); };
  }, [buildGraph]);

  const critCount = skills.filter((s) => s.severity?.toLowerCase() === "critical").length;
  const modCount = skills.filter((s) => s.severity?.toLowerCase() === "moderate").length;
  const noGapCount = skills.filter(
    (s) => s.severity?.toLowerCase() === "no gap" || s.severity?.toLowerCase() === "none"
  ).length;

  return (
    <div className="relative w-full h-full">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
        onClick={onBack}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10 12L6 8L10 4" />
        </svg>
        All Departments
      </motion.button>

      {/* Gap breakdown panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-4 left-4 z-20 bg-navy-800/90 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3"
      >
        <div className="text-xs text-white/50 mb-2 uppercase tracking-wider">
          Gap Breakdown
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-white/80">
              {critCount} Critical
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-white/80">
              {modCount} Moderate
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-white/80">
              {noGapCount} No Gap
            </span>
          </div>
        </div>
      </motion.div>

      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: "transparent" }}
      />

      <AnimatePresence>
        {tooltip && !tooltip.node.isHub && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute pointer-events-none z-50 bg-navy-800/95 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 shadow-xl"
            style={{
              left: tooltip.x + 15,
              top: tooltip.y - 10,
              maxWidth: 260,
            }}
          >
            <div className="text-white font-semibold text-sm">
              {tooltip.node.label}
            </div>
            <div className="text-xs text-white/60 mt-1">
              {tooltip.node.skills?.length || 0} skills | Avg Opt:{" "}
              {(tooltip.node.avgOpt * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-white/30 mt-1">
              Click to view skills
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
