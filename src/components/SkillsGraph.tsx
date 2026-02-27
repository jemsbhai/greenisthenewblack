"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { GreenSkill, SkillFamily } from "@/lib/types";
import { getSkillSeverityColor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SkillsGraphProps {
  family: SkillFamily;
  skills: GreenSkill[];
  departmentLabel: string;
  onSkillClick: (skill: GreenSkill) => void;
  onBack: () => void;
}

interface SkillNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  isHub: boolean;
  color: string;
  radius: number;
  skill?: GreenSkill;
}

export default function SkillsGraph({ family, skills, departmentLabel, onSkillClick, onBack }: SkillsGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ node: SkillNode; x: number; y: number } | null>(null);

  const buildGraph = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Determine hub color from worst skill severity
    const hasCritical = skills.some(s => s.severity?.toLowerCase() === "critical");
    const hasModerate = skills.some(s => s.severity?.toLowerCase() === "moderate");
    const hubColor = hasCritical ? "#ef4444" : hasModerate ? "#f59e0b" : "#22c55e";

    const hubNode: SkillNode = { id: "hub", label: family, isHub: true, color: hubColor, radius: 32 };

    const skillNodes: SkillNode[] = skills.map((skill) => ({
      id: `skill-${skill.id}`,
      label: skill.green_skill,
      isHub: false,
      color: getSkillSeverityColor(skill.severity),
      radius: 24,
      skill,
    }));

    const allNodes = [hubNode, ...skillNodes];
    const links = skillNodes.map((sn) => ({ source: "hub", target: sn.id }));

    const defs = svg.append("defs");
    allNodes.forEach((node) => {
      const grad = defs.append("radialGradient").attr("id", `skglow-${node.id}`).attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", node.color).attr("stop-opacity", 0.8);
      grad.append("stop").attr("offset", "60%").attr("stop-color", node.color).attr("stop-opacity", 0.25);
      grad.append("stop").attr("offset", "100%").attr("stop-color", node.color).attr("stop-opacity", 0);
    });
    const filter = defs.append("filter").attr("id", "sk-glow-filter").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const container = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const linkGroup = container.append("g").selectAll("line").data(links).enter().append("line")
      .attr("stroke", "rgba(255,255,255,0.12)").attr("stroke-width", 2).attr("class", "edge-animated");

    const glowGroup = container.append("g").selectAll("circle").data(allNodes).enter().append("circle")
      .attr("r", (d) => d.radius * 2).attr("fill", (d) => `url(#skglow-${d.id})`).attr("opacity", 0.5).style("pointer-events", "none");

    const nodeGroup = container.append("g").selectAll("circle").data(allNodes).enter().append("circle")
      .attr("r", (d) => d.radius).attr("fill", (d) => d.color).attr("opacity", 0.9)
      .attr("stroke", "rgba(255,255,255,0.2)").attr("stroke-width", 1.5).attr("filter", "url(#sk-glow-filter)")
      .attr("cursor", (d) => d.isHub ? "default" : "pointer")
      .on("mouseover", function (event, d) {
        if (!d.isHub) { d3.select(this).attr("opacity", 1).attr("stroke-width", 3); }
        const [x, y] = d3.pointer(event, svgRef.current);
        if (!d.isHub) setTooltip({ node: d, x, y });
      })
      .on("mouseout", function (_, d) {
        if (!d.isHub) { d3.select(this).attr("opacity", 0.9).attr("stroke-width", 1.5); }
        setTooltip(null);
      })
      .on("click", (_, d) => { if (!d.isHub && d.skill) onSkillClick(d.skill); });

    // Gap number inside skill nodes
    const gapText = container.append("g").selectAll("text").data(allNodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", "0.35em").attr("fill", "white")
      .attr("font-size", "11px").attr("font-weight", "700").style("pointer-events", "none")
      .text((d) => {
        if (d.isHub) return family.slice(0, 4);
        if (d.skill) return d.skill.gap > 0 ? `-${d.skill.gap}` : "✓";
        return "";
      });

    // Labels
    const labelText = container.append("g").selectAll("text").data(allNodes).enter()
      .append("text").attr("text-anchor", "middle").attr("dy", (d) => d.radius + 14)
      .attr("fill", "rgba(255,255,255,0.8)").attr("font-size", "10px").attr("font-weight", "500")
      .style("pointer-events", "none");

    labelText.each(function (d) {
      const text = d3.select(this);
      const label = d.label;
      if (label.length > 18 && !d.isHub) {
        const words = label.split(" ");
        const mid = Math.ceil(words.length / 2);
        text.append("tspan").attr("x", 0).attr("dy", 0).text(words.slice(0, mid).join(" "));
        text.append("tspan").attr("x", 0).attr("dy", "1.1em").text(words.slice(mid).join(" "));
      } else {
        text.text(label);
      }
    });

    // Level label under skill nodes
    const levelText = container.append("g").selectAll("text").data(skillNodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", (d) => d.radius + 28)
      .attr("fill", (d) => d.color).attr("font-size", "8px").style("pointer-events", "none")
      .text((d) => d.skill ? `Lvl ${d.skill.current_level}/${d.skill.required_level} · ${d.skill.severity}` : "");

    const simulation = d3.forceSimulation<SkillNode>(allNodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(130).strength(0.8))
      .force("charge", d3.forceManyBody().strength(-250))
      .force("center", d3.forceCenter(0, 0))
      .force("collision", d3.forceCollide<SkillNode>().radius((d) => d.radius + 25))
      .on("tick", () => {
        hubNode.x = 0; hubNode.y = 0;
        linkGroup.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y).attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
        nodeGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        glowGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        gapText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
        labelText.each(function (d) {
          d3.select(this).selectAll("tspan").attr("x", d.x!);
          if (d3.select(this).selectAll("tspan").empty()) d3.select(this).attr("x", d.x!);
          d3.select(this).attr("y", d.y!);
        });
        levelText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
      });

    return () => { simulation.stop(); };
  }, [family, skills, onSkillClick]);

  useEffect(() => { const cleanup = buildGraph(); return () => { cleanup?.(); }; }, [buildGraph]);

  return (
    <div className="relative w-full h-full">
      <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
        onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 12L6 8L10 4" /></svg>
        {departmentLabel}
      </motion.button>

      {/* Skills table panel */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
        className="absolute bottom-4 left-4 z-20 bg-[#0c0c24]/90 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 max-w-sm">
        <div className="text-[9px] uppercase tracking-wider text-white/30 mb-2">{family} Skills — {departmentLabel}</div>
        <div className="space-y-1">
          {skills.map((s) => (
            <button key={s.id} onClick={() => onSkillClick(s)}
              className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-white/5 transition-colors">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getSkillSeverityColor(s.severity) }} />
              <span className="text-[10px] text-white/70 truncate flex-1">{s.green_skill}</span>
              <span className="text-[9px] text-white/40 font-mono">{s.current_level}/{s.required_level}</span>
              <span className="text-[9px] font-mono font-medium" style={{ color: getSkillSeverityColor(s.severity) }}>
                {s.gap > 0 ? `-${s.gap}` : "✓"}
              </span>
              <span className="text-[8px] px-1 rounded" style={{ color: getSkillSeverityColor(s.severity), backgroundColor: getSkillSeverityColor(s.severity) + "15" }}>
                {s.severity}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <svg ref={svgRef} className="w-full h-full" style={{ background: "transparent" }} />

      <AnimatePresence>
        {tooltip && tooltip.node.skill && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="absolute pointer-events-none z-50 bg-[#0f0f2e]/95 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 shadow-xl"
            style={{ left: tooltip.x + 15, top: tooltip.y - 10, maxWidth: 300 }}>
            <div className="text-white font-semibold text-sm">{tooltip.node.skill.green_skill}</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-white/60 mt-1.5">
              <div>Gap: <span className="font-medium" style={{ color: getSkillSeverityColor(tooltip.node.skill.severity) }}>{tooltip.node.skill.gap}</span></div>
              <div>Severity: <span style={{ color: getSkillSeverityColor(tooltip.node.skill.severity) }}>{tooltip.node.skill.severity}</span></div>
              <div>Current: <span className="text-white">{tooltip.node.skill.current_level}</span></div>
              <div>Required: <span className="text-white">{tooltip.node.skill.required_level}</span></div>
              <div>Theme: <span className="text-white/80">{tooltip.node.skill.theme}</span></div>
              <div>Priority: <span className="text-white/80">{tooltip.node.skill.priority_level}</span></div>
            </div>
            {tooltip.node.skill.description && (
              <div className="mt-2 text-[10px] text-white/40 line-clamp-2">{tooltip.node.skill.description}</div>
            )}
            <div className="text-[10px] text-white/25 mt-2">Click for full detail →</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
