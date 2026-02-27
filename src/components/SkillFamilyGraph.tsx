"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { Department, DepartmentEdge, GreenSkill, SkillFamily } from "@/lib/types";
import { getSeverityGlowColor, getSkillSeverityColor, OPT_COLUMNS, formatOptLabel, formatScore } from "@/lib/utils";
import { getDeptDirectoryData, getPriorityActions, getMaturityLabel, MATURITY_LEVELS, type PriorityAction } from "@/lib/gapAnalysis";
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

type PanelTab = "directory" | "actions" | "maturity" | "factors" | "connections";

export default function SkillFamilyGraph({ department, skills, edges, allDepartments, onFamilyClick, onBack }: SkillFamilyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ node: FamilyNode; x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>("directory");
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  // Get enriched data from GSIP spreadsheet
  const deptLabel = department.label || department.department;
  const directoryData = getDeptDirectoryData(deptLabel);
  const priorityActions = getPriorityActions(department, skills);

  const buildGraph = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const hubColor = getSeverityGlowColor(department.gap_severity);
    const hubNode: FamilyNode = { id: "hub", label: deptLabel, isHub: true, color: hubColor, radius: 38 };

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

    container.append("g").selectAll("line").data(links).enter().append("line")
      .attr("stroke", "rgba(255,255,255,0.12)").attr("stroke-width", 2).attr("class", "edge-animated");

    container.append("g").selectAll("circle").data(allNodes).enter().append("circle")
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
        const linkSel = container.selectAll("line");
        linkSel.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y).attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
        nodeGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        container.selectAll("circle").filter((_, i, nodes) => !d3.select(nodes[i]).attr("cursor")).attr("cx", (d: any) => d.x!).attr("cy", (d: any) => d.y!);
        countText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
        labelText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
        statsText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
      });

    return () => { simulation.stop(); };
  }, [department, skills, onFamilyClick, deptLabel]);

  useEffect(() => { const cleanup = buildGraph(); return () => { cleanup?.(); }; }, [buildGraph]);

  const critCount = skills.filter((s) => s.severity?.toLowerCase() === "critical").length;
  const modCount = skills.filter((s) => s.severity?.toLowerCase() === "moderate").length;
  const noGapCount = skills.filter((s) => s.severity?.toLowerCase() === "no gap" || s.severity?.toLowerCase() === "none").length;
  const sevColor = getSeverityGlowColor(department.gap_severity);

  const optFactors = OPT_COLUMNS.map((col) => ({
    key: col,
    label: formatOptLabel(col),
    value: Number((department as any)[col]) || 0,
  })).sort((a, b) => b.value - a.value);

  const connectedDepts = edges
    .filter(e => e.source === department.id || e.target === department.id)
    .map(e => {
      const otherId = e.source === department.id ? e.target : e.source;
      const otherDept = allDepartments.find(d => d.id === otherId);
      return { edge: e, dept: otherDept };
    })
    .filter(c => c.dept);

  const TABS: { key: PanelTab; label: string }[] = [
    { key: "directory", label: "Skills Directory" },
    { key: "actions", label: "Priority Actions" },
    { key: "maturity", label: "Maturity" },
    { key: "factors", label: "Factors" },
    { key: "connections", label: "Links" },
  ];

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
        className="absolute bottom-4 left-4 z-20 bg-[#0c0c24]/95 backdrop-blur-md border border-white/10 rounded-lg w-[420px] shadow-2xl">

        {/* Panel Header */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sevColor, boxShadow: `0 0 8px ${sevColor}66` }} />
            <span className="text-white font-semibold text-sm">{deptLabel}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: sevColor, backgroundColor: sevColor + "22" }}>
              {department.gap_severity}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50">
              Score: {department.overall_score}
            </span>
          </div>
          {/* Risk alert */}
          {directoryData && (
            <p className="text-[10px] text-red-400/80 leading-relaxed mb-1.5">
              Risk: {directoryData.riskOfNotUpskilling}
            </p>
          )}
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
        <div className="flex border-b border-white/5 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-3 py-2 text-[9px] uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === tab.key ? "text-white bg-white/[0.06] border-b border-white/20" : "text-white/30 hover:text-white/60"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="px-4 py-3 max-h-64 overflow-y-auto">

          {/* ═══ GREEN SKILLS DIRECTORY ═══ */}
          {activeTab === "directory" && (
            <div className="space-y-2">
              {directoryData && (
                <div className="mb-3">
                  <p className="text-[10px] text-white/50 leading-relaxed mb-2">{directoryData.greenSkillsFocus}</p>
                  {directoryData.exampleGreenJobs && (
                    <div className="text-[9px] text-white/30 mb-2">
                      <span className="text-white/50">Green Roles: </span>{directoryData.exampleGreenJobs}
                    </div>
                  )}
                </div>
              )}

              {/* Skills grouped by family */}
              {FAMILIES.map(family => {
                const familySkills = skills.filter(s => s.skill_family === family);
                if (familySkills.length === 0) return null;
                return (
                  <div key={family} className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getFamilyColor(familySkills) }} />
                      <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">{family}</span>
                      <span className="text-[9px] text-white/30">{familySkills.length} skills</span>
                    </div>
                    <div className="space-y-0.5 ml-4">
                      {familySkills.map(s => {
                        const isExpanded = expandedSkill === `${s.id}`;
                        const skillColor = getSkillSeverityColor(s.severity === "No Gap" ? "healthy" : s.severity);
                        return (
                          <div key={s.id}>
                            <button onClick={() => setExpandedSkill(isExpanded ? null : `${s.id}`)}
                              className="flex items-center gap-2 w-full text-left py-0.5 hover:bg-white/[0.03] rounded px-1 transition-colors">
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: skillColor }} />
                              <span className="text-[10px] text-white/70 truncate flex-1">{s.green_skill}</span>
                              <span className="text-[9px] text-white/40 font-mono">{s.current_level}/{s.required_level}</span>
                              <span className="text-[9px] font-mono font-medium" style={{ color: skillColor }}>
                                {s.gap > 0 ? `-${s.gap}` : "ok"}
                              </span>
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5"
                                className={`text-white/20 transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                                <path d="M3 1.5L5.5 4L3 6.5" />
                              </svg>
                            </button>
                            {isExpanded && (
                              <div className="ml-4 pl-2 border-l border-white/5 py-1 space-y-1">
                                <div className="text-[9px] text-white/50">{s.description}</div>
                                {s.why_it_matters && (
                                  <div className="text-[9px]"><span className="text-white/30">Why: </span><span className="text-white/50">{s.why_it_matters}</span></div>
                                )}
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{s.theme}</span>
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                                    Maturity: {getMaturityLabel(s.current_level)} → {getMaturityLabel(s.required_level)}
                                  </span>
                                  <span className="text-[8px] px-1.5 py-0.5 rounded font-medium" style={{ color: skillColor, backgroundColor: skillColor + "15" }}>
                                    {s.severity} | Priority: {s.priority_level}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ PRIORITY ACTIONS ═══ */}
          {activeTab === "actions" && (
            <div className="space-y-2">
              <div className="text-[10px] text-white/40 mb-2">
                Ranked by risk score — address these skills first to reduce organisational exposure.
              </div>
              {priorityActions.map((pa, i) => {
                const skillColor = getSkillSeverityColor(pa.skill.severity === "No Gap" ? "healthy" : pa.skill.severity);
                const riskPct = (pa.riskScore * 100).toFixed(0);
                return (
                  <div key={pa.skill.id} className="bg-white/[0.03] rounded-lg p-2.5 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono text-white/30 w-4">#{i + 1}</span>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: skillColor }} />
                      <span className="text-[11px] text-white/80 font-medium truncate flex-1">{pa.skill.green_skill}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ color: Number(riskPct) >= 50 ? "#ef4444" : "#f59e0b", backgroundColor: Number(riskPct) >= 50 ? "#ef444415" : "#f59e0b15" }}>
                        Risk: {riskPct}%
                      </span>
                    </div>
                    <div className="text-[9px] text-white/50 mb-1.5">{pa.action}</div>
                    <div className="flex flex-wrap gap-1.5 text-[8px]">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/40">{pa.skill.skill_family}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/40">{pa.currentMaturity} → {pa.targetMaturity}</span>
                      {pa.priority && <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/40">Priority: {pa.priority}</span>}
                    </div>
                    {pa.learningPathway.length > 0 && (
                      <div className="mt-1.5 pl-2 border-l border-green-500/20">
                        <div className="text-[8px] text-green-400/60 uppercase tracking-wider mb-0.5">Learning Pathway</div>
                        {pa.learningPathway.map((step, j) => (
                          <div key={j} className="text-[9px] text-white/40 flex items-start gap-1">
                            <span className="text-green-400/40 mt-0.5">›</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ MATURITY MAP ═══ */}
          {activeTab === "maturity" && (
            <div className="space-y-3">
              {directoryData?.maturityLevels && directoryData.maturityLevels.length > 0 ? (
                <>
                  <div className="text-[10px] text-white/40 mb-1">
                    4-level maturity progression for {deptLabel} — from awareness to transformation.
                  </div>
                  {directoryData.maturityLevels.map((ml, i) => {
                    const isCurrentLevel = i + 1 <= Math.round(
                      skills.reduce((s, sk) => s + sk.current_level, 0) / (skills.length || 1)
                    );
                    return (
                      <div key={i} className={`rounded-lg p-2.5 border ${isCurrentLevel ? "bg-green-500/[0.06] border-green-500/20" : "bg-white/[0.02] border-white/5"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${isCurrentLevel ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/30"}`}>
                            {i + 1}
                          </div>
                          <span className={`text-[11px] font-semibold ${isCurrentLevel ? "text-green-400" : "text-white/60"}`}>{ml.level}</span>
                          {isCurrentLevel && <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400/70">Current Avg</span>}
                        </div>
                        <p className="text-[9px] text-white/40 mb-1.5 ml-7">{ml.description}</p>
                        <div className="grid grid-cols-2 gap-1 ml-7">
                          <div className="text-[8px]"><span className="text-blue-400/50">Tech: </span><span className="text-white/50">{ml.technicalSkill}</span></div>
                          <div className="text-[8px]"><span className="text-purple-400/50">Know: </span><span className="text-white/50">{ml.knowledgeSkill}</span></div>
                          <div className="text-[8px]"><span className="text-amber-400/50">Value: </span><span className="text-white/50">{ml.value}</span></div>
                          <div className="text-[8px]"><span className="text-pink-400/50">Attitude: </span><span className="text-white/50">{ml.attitude}</span></div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Scorecard */}
                  {directoryData.scorecard && (
                    <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/5">
                      <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1.5">Scorecard</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <div className="text-sm font-bold text-white">{(directoryData.scorecard.desiredKnowledge * 100).toFixed(0)}%</div>
                          <div className="text-[8px] text-white/40">Target</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-white">{(directoryData.scorecard.currentCapability * 100).toFixed(0)}%</div>
                          <div className="text-[8px] text-white/40">Current</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-red-400">{(directoryData.scorecard.gap * 100).toFixed(0)}%</div>
                          <div className="text-[8px] text-white/40">Gap</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-[10px] text-white/30">Maturity data not available for this department.</div>
              )}
            </div>
          )}

          {/* ═══ OPT FACTORS ═══ */}
          {activeTab === "factors" && (
            <div className="space-y-2">
              <div className="text-[10px] text-white/40 mb-1">16 sustainability optimisation factors — higher = more impact potential</div>
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

          {/* ═══ CONNECTIONS ═══ */}
          {activeTab === "connections" && (
            <div className="space-y-2">
              {connectedDepts.length === 0 ? (
                <div className="text-[10px] text-white/30">No cross-department connections found.</div>
              ) : (
                <>
                  <div className="text-[10px] text-white/40 mb-1">Departments sharing skill dependencies or gaps with {deptLabel}</div>
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
