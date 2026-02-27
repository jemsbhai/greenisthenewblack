"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { Department, DepartmentEdge, GreenSkill, SkillFamily } from "@/lib/types";
import { getSeverityGlowColor, getSkillSeverityColor, OPT_COLUMNS, formatOptLabel, formatScore } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SkillFamilyGraphProps {
  department: Department;
  skills: GreenSkill[];
  edges: DepartmentEdge[];
  allDepartments: Department[];
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

function getDeptInsight(dept: Department, skills: GreenSkill[]): string {
  const sev = dept.gap_severity?.toLowerCase();
  const critSkills = skills.filter(s => s.severity?.toLowerCase() === "critical");
  const modSkills = skills.filter(s => s.severity?.toLowerCase() === "moderate");
  const noGapSkills = skills.filter(s => s.severity?.toLowerCase() === "no gap" || s.severity?.toLowerCase() === "none");

  if (sev === "critical") {
    return `${dept.label} has ${critSkills.length} critical skill gap${critSkills.length !== 1 ? "s" : ""} requiring immediate upskilling investment. ${critSkills.slice(0, 3).map(s => s.green_skill).join(", ")}${critSkills.length > 3 ? ` and ${critSkills.length - 3} more` : ""} are priority areas where current proficiency falls significantly below required levels.`;
  } else if (sev === "moderate") {
    return `${dept.label} shows moderate readiness with ${modSkills.length} skill${modSkills.length !== 1 ? "s" : ""} needing improvement. ${noGapSkills.length} skill${noGapSkills.length !== 1 ? "s" : ""} meet target levels. Focus development on ${modSkills.slice(0, 2).map(s => s.green_skill).join(" and ")} to close remaining gaps.`;
  }
  return `${dept.label} demonstrates strong green readiness with ${noGapSkills.length} of ${skills.length} skills meeting or exceeding targets. Continue maintaining current proficiency and monitor for evolving requirements.`;
}

export default function SkillFamilyGraph({ department, skills, edges, allDepartments, onFamilyClick, onBack }: SkillFamilyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ node: FamilyNode; x: number; y: number } | null>(null);
  const [showPanel, setShowPanel] = useState<"overview" | "factors" | "connections">("overview");

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

    const countText = container.append("g").selectAll("text").data(allNodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", "0.35em").attr("fill", "white")
      .attr("font-size", (d) => d.isHub ? "12px" : "14px").attr("font-weight", "700").style("pointer-events", "none")
      .text((d) => d.isHub ? department.overall_score : (d.skills?.length || 0));

    const labelText = container.append("g").selectAll("text").data(allNodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", (d) => d.radius + 16)
      .attr("fill", "rgba(255,255,255,0.85)").attr("font-size", (d) => d.isHub ? "13px" : "11px")
      .attr("font-weight", "600").style("pointer-events", "none").text((d) => d.label);

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
  const sevColor = getSeverityGlowColor(department.gap_severity);

  // Get all 16 opt factors sorted
  const optFactors = OPT_COLUMNS.map((col) => ({
    key: col,
    label: formatOptLabel(col),
    value: Number((department as any)[col]) || 0,
  })).sort((a, b) => b.value - a.value);

  // Get connected departments
  const connectedDepts = edges
    .filter(e => e.source === department.id || e.target === department.id)
    .map(e => {
      const otherId = e.source === department.id ? e.target : e.source;
      const otherDept = allDepartments.find(d => d.id === otherId);
      return { edge: e, dept: otherDept };
    })
    .filter(c => c.dept);

  return (
    <div className="relative w-full h-full">
      <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
        onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 12L6 8L10 4" /></svg>
        All Departments
      </motion.button>

      {/* Department Analysis Panel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="absolute bottom-4 left-4 z-20 bg-[#0c0c24]/95 backdrop-blur-md border border-white/10 rounded-lg max-w-sm w-[360px] shadow-2xl">

        {/* Panel Header */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sevColor, boxShadow: `0 0 8px ${sevColor}66` }} />
            <span className="text-white font-semibold text-sm">{department.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: sevColor, backgroundColor: sevColor + "22" }}>
              {department.gap_severity}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50">
              Score: {department.overall_score}
            </span>
          </div>
          {/* Gap mini bar */}
          <div className="flex gap-3 text-[10px] mb-1.5">
            <span className="text-red-400">{critCount} Critical</span>
            <span className="text-amber-400">{modCount} Moderate</span>
            <span className="text-green-400">{noGapCount} No Gap</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden">
            {skills.length > 0 && (
              <>
                <div className="bg-red-500" style={{ width: `${(critCount / skills.length) * 100}%` }} />
                <div className="bg-amber-500" style={{ width: `${(modCount / skills.length) * 100}%` }} />
                <div className="bg-green-500" style={{ width: `${(noGapCount / skills.length) * 100}%` }} />
              </>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/5">
          {(["overview", "factors", "connections"] as const).map(tab => (
            <button key={tab} onClick={() => setShowPanel(tab)}
              className={`flex-1 py-2 text-[10px] uppercase tracking-wider transition-colors ${showPanel === tab ? "text-white bg-white/[0.06] border-b border-white/20" : "text-white/30 hover:text-white/60"}`}>
              {tab === "overview" ? "Insight" : tab === "factors" ? "Opt Factors" : "Connections"}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="px-4 py-3 max-h-52 overflow-y-auto">
          {showPanel === "overview" && (
            <div className="space-y-3">
              {/* Verbal insight */}
              <p className="text-[11px] text-white/60 leading-relaxed">
                {getDeptInsight(department, skills)}
              </p>
              {/* Priority & knowledge */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40">Priority Level</span>
                  <span className="text-white/80 font-medium">{department.priority_level}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40">Desired Knowledge</span>
                  <span className="text-white/80 font-medium">{department.desired_knowledge}</span>
                </div>
                {department.top_gaps && (
                  <div className="text-[10px]">
                    <span className="text-white/40">Top Gaps: </span>
                    <span className="text-white/60">{department.top_gaps}</span>
                  </div>
                )}
              </div>
              {/* Critical skills list */}
              {critCount > 0 && (
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-red-400/70 mb-1">Critical Skills</div>
                  <div className="space-y-0.5">
                    {skills.filter(s => s.severity?.toLowerCase() === "critical").map(s => (
                      <div key={s.id} className="flex items-center gap-2 text-[10px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        <span className="text-white/60 truncate flex-1">{s.green_skill}</span>
                        <span className="text-white/40 font-mono">{s.current_level}/{s.required_level}</span>
                        <span className="text-red-400 font-mono font-medium">-{s.gap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {showPanel === "factors" && (
            <div className="space-y-2">
              <div className="text-[10px] text-white/40 mb-1">All 16 optimization factors for {department.label} — higher = more sustainability impact</div>
              {optFactors.map((f) => (
                <div key={f.key}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-white/60">{f.label}</span>
                    <span className="text-white/80 font-mono">{formatScore(f.value)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${f.value * 100}%`,
                      backgroundColor: f.value >= 0.4 ? "#22c55e" : f.value >= 0.2 ? "#f59e0b" : "#ef4444",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {showPanel === "connections" && (
            <div className="space-y-2">
              {connectedDepts.length === 0 ? (
                <div className="text-[10px] text-white/30">No cross-department connections found.</div>
              ) : (
                <>
                  <div className="text-[10px] text-white/40 mb-1">Departments sharing skill dependencies or gaps with {department.label}</div>
                  {connectedDepts.map((c, i) => {
                    const otherColor = getSeverityGlowColor(c.dept!.gap_severity);
                    return (
                      <div key={i} className="bg-white/[0.03] rounded-lg p-2.5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: otherColor }} />
                          <span className="text-white/80 text-[11px] font-medium">{c.dept!.label}</span>
                          <span className="text-[9px] px-1 py-0.5 rounded ml-auto" style={{ color: otherColor, backgroundColor: otherColor + "15" }}>
                            {c.dept!.gap_severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-white/50">
                          <span className={c.edge.relationship === "shared_skill_gap" ? "text-amber-400" : "text-blue-400"}>
                            {c.edge.relationship === "shared_skill_gap" ? "Shared Skill Gap" : "Cross-Dept Dependency"}
                          </span>
                          <span className="text-white/30">·</span>
                          <span>Strength: {(c.edge.weight * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex gap-3 text-[9px] text-white/40 mt-1">
                          <span>Score: {c.dept!.overall_score}</span>
                          <span className="text-red-400/70">{c.dept!.critical_gap_count}C</span>
                          <span className="text-amber-400/70">{c.dept!.moderate_gap_count}M</span>
                          <span className="text-green-400/70">{c.dept!.no_gap_count}G</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
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
