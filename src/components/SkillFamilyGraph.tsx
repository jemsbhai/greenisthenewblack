"use client";

import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";
import * as d3 from "d3";
import { Department, DepartmentEdge, GreenSkill, SkillFamily } from "@/lib/types";
import { getSeverityGlowColor, getSkillSeverityColor, OPT_COLUMNS, formatOptLabel, formatScore, computeAvgOpt } from "@/lib/utils";
import {
  getDeptDirectoryData, getPriorityActions, getMaturityLabel, MATURITY_LEVELS,
  getDeptAssessments, getAllSectors, getDeptSectorPriorities, getDeptSkillsMap,
  getDeptActions, getDeptSkillsByFamily, computeSkillRiskScore,
  type PriorityAction, type AssessmentQuestion, type SectorIntel, type SkillMapEntry, type ActionEntry,
} from "@/lib/gapAnalysis";
import { motion, AnimatePresence } from "framer-motion";

interface SkillFamilyGraphProps {
  department: Department;
  skills: GreenSkill[];
  edges: DepartmentEdge[];
  allDepartments: Department[];
  onFamilyClick: (family: SkillFamily, skills: GreenSkill[]) => void;
  onBack: () => void;
}

type NodeKind = "hub" | "maturity" | "family" | "leaf";

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  kind: NodeKind;
  color: string;
  radius: number;
  level?: number;
  description?: string;
  // maturity node fields
  techSkill?: string;
  knowSkill?: string;
  valueSkill?: string;
  attitudeSkill?: string;
  skillCount?: number;
  // family node fields
  familyType?: string; // "Technical" | "Knowledge" | "Values" | "Attitudes"
  familySkillName?: string; // e.g. "Life Cycle Analysis"
  childCount?: number;
  avgOpt?: number;
  aggregateSeverity?: string;
  parentId?: string;
  // leaf skill node fields
  severity?: string;
  gap?: number;
  skillFamily?: string;
  greenSkillName?: string;
}

const MATURITY_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
const FAMILY_COLORS: Record<string, string> = {
  Technical: "#3b82f6",
  Knowledgeable: "#8b5cf6",
  Knowledge: "#8b5cf6",
  Values: "#f59e0b",
  Attitudes: "#ec4899",
};

type DrawerTab = "overview" | "directory" | "actions" | "maturity" | "assessments" | "sectors" | "factors" | "connections";

export default function SkillFamilyGraph({ department, skills, edges, allDepartments, onFamilyClick, onBack }: SkillFamilyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ node: GraphNode; x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [assessmentTheme, setAssessmentTheme] = useState<string | null>(null);

  const deptLabel = department.label || department.department;
  const directoryData = useMemo(() => getDeptDirectoryData(deptLabel), [deptLabel]);
  const priorityActions = useMemo(() => getPriorityActions(department, skills), [department, skills]);
  const assessments = useMemo(() => getDeptAssessments(deptLabel), [deptLabel]);
  const sectors = useMemo(() => getAllSectors(), []);
  const sectorPriorities = useMemo(() => getDeptSectorPriorities(deptLabel), [deptLabel]);
  const skillsMap = useMemo(() => getDeptSkillsMap(deptLabel), [deptLabel]);
  const deptActions = useMemo(() => getDeptActions(deptLabel), [deptLabel]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Build maturity-level nodes with skill family intermediates
  const buildGraph = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // ── Hub node ──
    const hubColor = getSeverityGlowColor(department.gap_severity);
    const hubNode: GraphNode = { id: "hub", label: deptLabel, kind: "hub", color: hubColor, radius: 42 };

    // ── Maturity persona nodes ──
    const maturityNodes: GraphNode[] = (directoryData?.maturityLevels || []).map((ml, i) => ({
      id: `maturity-${i}`,
      label: ml.level,
      kind: "maturity" as NodeKind,
      color: MATURITY_COLORS[i],
      radius: 30,
      level: i + 1,
      description: ml.description,
      techSkill: ml.technicalSkill,
      knowSkill: ml.knowledgeSkill,
      valueSkill: ml.value,
      attitudeSkill: ml.attitude,
    }));
    // Fallback
    if (maturityNodes.length === 0) {
      for (let i = 0; i < 4; i++) {
        const ml = MATURITY_LEVELS[i];
        maturityNodes.push({
          id: `maturity-${i}`, label: ml.label, kind: "maturity", color: MATURITY_COLORS[i],
          radius: 30, level: i + 1, description: ml.description,
        });
      }
    }

    // ── Skill family intermediate nodes ──
    // For each maturity level, create up to 4 family nodes (Tech, Knowledge, Values, Attitudes)
    const familyNodes: GraphNode[] = [];
    const FAMILY_KEYS: { key: string; matField: "techSkill" | "knowSkill" | "valueSkill" | "attitudeSkill"; dbFamily: string }[] = [
      { key: "Technical", matField: "techSkill", dbFamily: "Technical" },
      { key: "Knowledge", matField: "knowSkill", dbFamily: "Knowledgeable" },
      { key: "Values", matField: "valueSkill", dbFamily: "Values" },
      { key: "Attitudes", matField: "attitudeSkill", dbFamily: "Attitudes" },
    ];

    maturityNodes.forEach((mn) => {
      FAMILY_KEYS.forEach((fk) => {
        const familySkillName = (mn as any)[fk.matField] as string | undefined;
        if (!familySkillName) return;
        const childSkills = skills.filter(s => s.required_level === mn.level && s.skill_family === fk.dbFamily);
        // Aggregate severity: if any critical → critical, else if any moderate → moderate, else healthy
        const hasCritical = childSkills.some(s => s.severity?.toLowerCase() === "critical");
        const hasModerate = childSkills.some(s => s.severity?.toLowerCase() === "moderate");
        const aggSev = hasCritical ? "critical" : hasModerate ? "moderate" : "no gap";
        const aggColor = getSkillSeverityColor(aggSev);
        // Average opt across child skills
        const avgOpt = childSkills.length > 0
          ? childSkills.reduce((sum, s) => sum + computeAvgOpt(s), 0) / childSkills.length
          : 0;

        familyNodes.push({
          id: `fam-${mn.id}-${fk.key}`,
          label: familySkillName,
          kind: "family",
          color: aggColor,
          radius: 20,
          level: mn.level,
          parentId: mn.id,
          familyType: fk.key,
          familySkillName,
          childCount: childSkills.length,
          avgOpt,
          aggregateSeverity: aggSev,
          description: `${fk.key} skill at Level ${mn.level}`,
        });
      });
    });

    // ── Leaf green skill nodes ──
    const leafNodes: GraphNode[] = [];
    familyNodes.forEach((fn) => {
      const fk = FAMILY_KEYS.find(f => f.key === fn.familyType);
      if (!fk) return;
      const childSkills = skills.filter(s => s.required_level === fn.level && s.skill_family === fk.dbFamily);
      childSkills.forEach((s, j) => {
        leafNodes.push({
          id: `leaf-${fn.id}-${j}`,
          label: s.green_skill,
          kind: "leaf",
          color: getSkillSeverityColor(s.severity),
          radius: 10,
          level: fn.level,
          parentId: fn.id,
          severity: s.severity,
          gap: s.gap,
          skillFamily: s.skill_family,
          greenSkillName: s.green_skill,
          avgOpt: computeAvgOpt(s),
        });
      });
    });

    // ── Assemble all nodes & links ──
    const allNodes = [hubNode, ...maturityNodes, ...familyNodes, ...leafNodes];
    const links: { source: string; target: string }[] = [];
    // Hub → maturity
    maturityNodes.forEach(mn => links.push({ source: "hub", target: mn.id }));
    // Chain maturity levels
    for (let i = 0; i < maturityNodes.length - 1; i++) {
      links.push({ source: maturityNodes[i].id, target: maturityNodes[i + 1].id });
    }
    // Maturity → family
    familyNodes.forEach(fn => links.push({ source: fn.parentId!, target: fn.id }));
    // Family → leaves
    leafNodes.forEach(ln => links.push({ source: ln.parentId!, target: ln.id }));

    // ── SVG defs ──
    const defs = svg.append("defs");
    allNodes.forEach((node) => {
      const glowOpacity = node.kind === "leaf" ? 0.5 : node.kind === "family" ? 0.6 : 0.8;
      const grad = defs.append("radialGradient").attr("id", `sfglow-${node.id}`).attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", node.color).attr("stop-opacity", glowOpacity);
      grad.append("stop").attr("offset", "60%").attr("stop-color", node.color).attr("stop-opacity", glowOpacity * 0.3);
      grad.append("stop").attr("offset", "100%").attr("stop-color", node.color).attr("stop-opacity", 0);
    });
    const filter = defs.append("filter").attr("id", "sf-glow-filter").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const fMerge = filter.append("feMerge");
    fMerge.append("feMergeNode").attr("in", "blur");
    fMerge.append("feMergeNode").attr("in", "SourceGraphic");
    const leafFilter = defs.append("filter").attr("id", "sf-leaf-glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    leafFilter.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "blur");
    const lMerge = leafFilter.append("feMerge");
    lMerge.append("feMergeNode").attr("in", "blur");
    lMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const container = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);
    const coreNodes = [hubNode, ...maturityNodes];

    // ── Links ──
    const linkGroup = container.append("g").selectAll("line").data(links).enter().append("line")
      .attr("stroke", (d) => {
        const tgt = allNodes.find(n => n.id === (typeof d.target === "string" ? d.target : (d.target as any).id));
        if (tgt?.kind === "leaf") return tgt.color + "30";
        if (tgt?.kind === "family") return tgt.color + "40";
        return "rgba(255,255,255,0.12)";
      })
      .attr("stroke-width", (d) => {
        const tgt = allNodes.find(n => n.id === (typeof d.target === "string" ? d.target : (d.target as any).id));
        return tgt?.kind === "leaf" ? 0.8 : tgt?.kind === "family" ? 1.2 : 2;
      });

    // ── Glow + circles: hub & maturity ──
    const glowGroup = container.append("g").selectAll("circle").data(coreNodes).enter().append("circle")
      .attr("r", (d) => d.radius * 2).attr("fill", (d) => `url(#sfglow-${d.id})`).attr("opacity", 0.5).style("pointer-events", "none");

    const nodeGroup = container.append("g").selectAll("circle").data(coreNodes).enter().append("circle")
      .attr("r", (d) => d.radius).attr("fill", (d) => d.color).attr("opacity", 0.9)
      .attr("stroke", "rgba(255,255,255,0.2)").attr("stroke-width", 1.5).attr("filter", "url(#sf-glow-filter)")
      .attr("cursor", (d) => d.kind === "hub" ? "default" : "pointer")
      .on("mouseover", function (event, d) {
        if (d.kind !== "hub") d3.select(this).attr("opacity", 1).attr("stroke-width", 3);
        const [x, y] = d3.pointer(event, svgRef.current);
        setTooltip({ node: d, x, y });
      })
      .on("mouseout", function (_, d) {
        if (d.kind !== "hub") d3.select(this).attr("opacity", 0.9).attr("stroke-width", 1.5);
        setTooltip(null);
      })
      .on("click", (_, d) => {
        if (d.kind === "maturity" && d.level) {
          setActiveTab("maturity");
          setDrawerOpen(true);
          toggleExpanded(`maturity-${d.level}`);
        }
      });

    // ── Family nodes (intermediate skill family circles) ──
    const famGlowGroup = container.append("g").selectAll("circle").data(familyNodes).enter().append("circle")
      .attr("r", (d) => d.radius * 1.6).attr("fill", (d) => `url(#sfglow-${d.id})`).attr("opacity", 0.4).style("pointer-events", "none");

    const famNodeGroup = container.append("g").selectAll("circle").data(familyNodes).enter().append("circle")
      .attr("r", (d) => d.radius).attr("fill", (d) => d.color).attr("opacity", 0.9)
      .attr("stroke", (d) => FAMILY_COLORS[d.familyType || ""] || d.color).attr("stroke-width", 2).attr("stroke-opacity", 0.5)
      .attr("filter", "url(#sf-glow-filter)").attr("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 1).attr("stroke-width", 3).attr("stroke-opacity", 0.9);
        const [x, y] = d3.pointer(event, svgRef.current);
        setTooltip({ node: d, x, y });
      })
      .on("mouseout", function (_, d) {
        d3.select(this).attr("opacity", 0.9).attr("stroke-width", 2).attr("stroke-opacity", 0.5);
        setTooltip(null);
      })
      .on("click", (_, d) => {
        setActiveTab("directory");
        setDrawerOpen(true);
      });

    // Family node inner text (family initial)
    const famInnerText = container.append("g").selectAll("text").data(familyNodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", "0.35em").attr("fill", "white")
      .attr("font-size", "9px").attr("font-weight", "700").style("pointer-events", "none")
      .text((d) => (d.familyType || "")[0]); // T, K, V, A

    // Family node labels below
    const famLabelGroup = container.append("g").selectAll("text").data(familyNodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", (d) => d.radius + 11)
      .attr("fill", (d) => d.color).attr("font-size", "7px").attr("font-weight", "600")
      .style("pointer-events", "none").attr("opacity", 0.85)
      .text((d) => {
        const name = d.familySkillName || d.label;
        return name.length > 20 ? name.slice(0, 18) + "…" : name;
      });

    // ── Leaf skill nodes ──
    const leafGlowGroup = container.append("g").selectAll("circle").data(leafNodes).enter().append("circle")
      .attr("r", (d) => d.radius * 1.6).attr("fill", (d) => `url(#sfglow-${d.id})`).attr("opacity", 0.3).style("pointer-events", "none");

    const leafNodeGroup = container.append("g").selectAll("circle").data(leafNodes).enter().append("circle")
      .attr("r", (d) => d.radius).attr("fill", (d) => d.color).attr("opacity", 0.85)
      .attr("stroke", (d) => d.color).attr("stroke-width", 0.8).attr("stroke-opacity", 0.3)
      .attr("filter", "url(#sf-leaf-glow)").attr("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 1).attr("stroke-width", 2).attr("stroke-opacity", 0.8).attr("r", d.radius + 2);
        const [x, y] = d3.pointer(event, svgRef.current);
        setTooltip({ node: d, x, y });
      })
      .on("mouseout", function (_, d) {
        d3.select(this).attr("opacity", 0.85).attr("stroke-width", 0.8).attr("stroke-opacity", 0.3).attr("r", d.radius);
        setTooltip(null);
      });

    const leafLabelGroup = container.append("g").selectAll("text").data(leafNodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", (d) => d.radius + 9)
      .attr("fill", (d) => d.color).attr("font-size", "6px").attr("font-weight", "500")
      .style("pointer-events", "none").attr("opacity", 0.7)
      .text((d) => {
        const name = d.greenSkillName || d.label;
        return name.length > 14 ? name.slice(0, 12) + "…" : name;
      });

    // ── Core text layers ──
    const countText = container.append("g").selectAll("text").data(coreNodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", d => d.kind === "hub" ? "-0.2em" : "0.35em").attr("fill", "white")
      .attr("font-size", (d) => d.kind === "hub" ? "12px" : "14px").attr("font-weight", "700").style("pointer-events", "none")
      .text((d) => d.kind === "hub" ? department.overall_score : (d.level || ""));

    const hubSub = container.append("g").selectAll("text").data([hubNode]).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", "1em").attr("fill", "rgba(255,255,255,0.5)")
      .attr("font-size", "8px").style("pointer-events", "none").text("score");

    const labelText = container.append("g").selectAll("text").data(coreNodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", (d) => d.radius + 14)
      .attr("fill", "rgba(255,255,255,0.85)").attr("font-size", (d) => d.kind === "hub" ? "12px" : "9px")
      .attr("font-weight", "600").style("pointer-events", "none")
      .text((d) => d.kind === "hub" ? deptLabel : d.label);

    // ── Force simulation ──
    const simulation = d3.forceSimulation<GraphNode>(allNodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id)
        .distance((d: any) => {
          const tgt = typeof d.target === "object" ? d.target : allNodes.find(n => n.id === d.target);
          if (tgt?.kind === "leaf") return 45;
          if (tgt?.kind === "family") return 75;
          return 140;
        })
        .strength((d: any) => {
          const tgt = typeof d.target === "object" ? d.target : allNodes.find(n => n.id === d.target);
          if (tgt?.kind === "leaf") return 1.0;
          if (tgt?.kind === "family") return 0.9;
          return 0.5;
        }))
      .force("charge", d3.forceManyBody<GraphNode>().strength((d) =>
        d.kind === "leaf" ? -30 : d.kind === "family" ? -100 : -350
      ))
      .force("center", d3.forceCenter(0, 0).strength(0.04))
      .force("collision", d3.forceCollide<GraphNode>().radius((d) =>
        d.kind === "leaf" ? d.radius + 4 : d.kind === "family" ? d.radius + 10 : d.radius + 25
      ))
      .on("tick", () => {
        hubNode.x = 0; hubNode.y = 0;
        linkGroup.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
        glowGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        nodeGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        famGlowGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        famNodeGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        famInnerText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
        famLabelGroup.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
        leafGlowGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        leafNodeGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        leafLabelGroup.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
        countText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
        hubSub.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
        labelText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
      });

    return () => { simulation.stop(); };
  }, [department, skills, deptLabel, directoryData]);

  useEffect(() => { const cleanup = buildGraph(); return () => { cleanup?.(); }; }, [buildGraph]);

  const critCount = skills.filter((s) => s.severity?.toLowerCase() === "critical").length;
  const modCount = skills.filter((s) => s.severity?.toLowerCase() === "moderate").length;
  const noGapCount = skills.filter((s) => s.severity?.toLowerCase() === "no gap" || s.severity?.toLowerCase() === "none").length;
  const sevColor = getSeverityGlowColor(department.gap_severity);

  const optFactors = OPT_COLUMNS.map((col) => ({
    key: col, label: formatOptLabel(col), value: Number((department as any)[col]) || 0,
  })).sort((a, b) => b.value - a.value);

  const connectedDepts = edges
    .filter(e => e.source === department.id || e.target === department.id)
    .map(e => {
      const otherId = e.source === department.id ? e.target : e.source;
      return { edge: e, dept: allDepartments.find(d => d.id === otherId) };
    }).filter(c => c.dept);

  const assessmentThemes = [...new Set(assessments.map(a => a.theme))];

  const TABS: { key: DrawerTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "directory", label: "Skills Directory" },
    { key: "actions", label: "Actions & Dev" },
    { key: "maturity", label: "Maturity Map" },
    { key: "assessments", label: "Assessment" },
    { key: "sectors", label: "Sector Intel" },
    { key: "factors", label: "Opt Factors" },
    { key: "connections", label: "Connections" },
  ];

  return (
    <div className="relative w-full h-full flex">
      {/* Graph area */}
      <div className="flex-1 relative">
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
          onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 12L6 8L10 4" /></svg>
          All Departments
        </motion.button>

        {/* Toggle drawer button */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute top-4 right-4 z-20 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
          onClick={() => setDrawerOpen(!drawerOpen)}>
          {drawerOpen ? "Hide Panel" : "Show Panel"}
        </motion.button>

        {/* Mini legend */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 text-[9px] text-white/40 bg-[#0c0c24]/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/5">
          {MATURITY_COLORS.map((c, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
              <span>L{i + 1}</span>
            </div>
          ))}
          <span className="text-white/20 mx-1">|</span>
          <span className="text-red-400">{critCount}C</span>
          <span className="text-amber-400">{modCount}M</span>
          <span className="text-green-400">{noGapCount}G</span>
        </div>

        <svg ref={svgRef} className="w-full h-full" style={{ background: "transparent" }} />

        <AnimatePresence>
          {tooltip && tooltip.node.kind !== "hub" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute pointer-events-none z-50 bg-[#0f0f2e]/95 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 shadow-xl"
              style={{ left: tooltip.x + 15, top: tooltip.y - 10, maxWidth: 340 }}>
              {tooltip.node.kind === "leaf" ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tooltip.node.color }} />
                    <span className="text-white font-semibold text-sm">{tooltip.node.greenSkillName || tooltip.node.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] mt-1">
                    <span style={{ color: tooltip.node.color }} className="font-semibold capitalize">{tooltip.node.severity || "Unknown"}</span>
                    <span className="text-white/40">Gap: {tooltip.node.gap ?? "—"}</span>
                    <span className="text-white/40">{tooltip.node.skillFamily}</span>
                  </div>
                  {tooltip.node.avgOpt !== undefined && (
                    <div className="text-[10px] text-white/40 mt-1">Opt impact: {(tooltip.node.avgOpt * 100).toFixed(0)}%</div>
                  )}
                </>
              ) : tooltip.node.kind === "family" ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: FAMILY_COLORS[tooltip.node.familyType || ""] || tooltip.node.color }}>
                      {(tooltip.node.familyType || "")[0]}
                    </div>
                    <span className="text-white font-semibold text-sm">{tooltip.node.familySkillName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] mt-1">
                    <span className="text-white/50">{tooltip.node.familyType}</span>
                    <span className="text-white/30">|</span>
                    <span style={{ color: tooltip.node.color }} className="font-semibold capitalize">{tooltip.node.aggregateSeverity}</span>
                    <span className="text-white/40">Level {tooltip.node.level}</span>
                  </div>
                  {tooltip.node.avgOpt !== undefined && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[9px] text-white/30">Opt Impact</span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${tooltip.node.avgOpt * 100}%`,
                          backgroundColor: tooltip.node.avgOpt >= 0.4 ? "#22c55e" : tooltip.node.avgOpt >= 0.2 ? "#f59e0b" : "#ef4444",
                        }} />
                      </div>
                      <span className="text-[9px] text-white/50 font-mono">{(tooltip.node.avgOpt * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  <div className="text-[9px] text-white/40 mt-1">{tooltip.node.childCount} green skill{tooltip.node.childCount !== 1 ? "s" : ""} at this level</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: tooltip.node.color }}>
                      {tooltip.node.level}
                    </div>
                    <span className="text-white font-semibold text-sm">{tooltip.node.label}</span>
                  </div>
                  <p className="text-[10px] text-white/50 mb-1">{tooltip.node.description}</p>
                  <div className="text-[10px] text-white/25 mt-1">Click to expand maturity details</div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ BIG EXPANDABLE DEPARTMENT DRAWER ═══ */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }} animate={{ width: 440, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="h-full bg-[#0c0c24]/95 backdrop-blur-md border-l border-white/10 flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: sevColor, boxShadow: `0 0 10px ${sevColor}66` }} />
                <span className="text-white font-bold text-base">{deptLabel}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ color: sevColor, backgroundColor: sevColor + "22" }}>
                  {department.gap_severity}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50 ml-auto">
                  Score: {department.overall_score}
                </span>
              </div>
              {directoryData && (
                <p className="text-[11px] text-white/50 leading-relaxed mb-2">{directoryData.definition}</p>
              )}
              {directoryData && (
                <div className="p-2 rounded-lg bg-red-500/[0.06] border border-red-500/10 mb-2">
                  <div className="text-[9px] uppercase tracking-wider text-red-400/60 mb-0.5">Risk of Not Upskilling</div>
                  <p className="text-[10px] text-red-400/80 leading-relaxed">{directoryData.riskOfNotUpskilling}</p>
                </div>
              )}
              <div className="flex gap-3 text-[10px] mb-2">
                <span className="text-red-400">{critCount} Critical</span>
                <span className="text-amber-400">{modCount} Moderate</span>
                <span className="text-green-400">{noGapCount} No Gap</span>
              </div>
              <div className="flex h-2.5 rounded-full overflow-hidden">
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
            <div className="flex flex-wrap border-b border-white/5 flex-shrink-0">
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-2 text-[9px] uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === tab.key ? "text-white bg-white/[0.06] border-b border-white/20" : "text-white/30 hover:text-white/60"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">

              {/* ═══ OVERVIEW ═══ */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {directoryData && (
                    <>
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Green Skills Focus</h4>
                        <p className="text-[11px] text-white/60 leading-relaxed">{directoryData.greenSkillsFocus}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Example Green Roles</h4>
                        <p className="text-[11px] text-white/60 leading-relaxed">{directoryData.exampleGreenJobs}</p>
                      </div>
                      {directoryData.scorecard && (
                        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                          <h4 className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Scorecard</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{(directoryData.scorecard.desiredKnowledge * 100).toFixed(0)}%</div>
                              <div className="text-[9px] text-white/40">Target</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{(directoryData.scorecard.currentCapability * 100).toFixed(0)}%</div>
                              <div className="text-[9px] text-white/40">Current</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-red-400">{(directoryData.scorecard.gap * 100).toFixed(0)}%</div>
                              <div className="text-[9px] text-white/40">Gap</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {/* Sector priorities for this dept */}
                  {Object.keys(sectorPriorities).length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Sector Priority Level</h4>
                      <div className="grid grid-cols-2 gap-1.5">
                        {Object.entries(sectorPriorities).map(([sector, priority]) => (
                          <div key={sector} className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/[0.03] border border-white/5">
                            <span className="text-[10px] text-white/60 truncate flex-1">{sector.replace(/\n/g, ' ')}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${priority === 'H' ? 'text-red-400 bg-red-500/10' : priority === 'M' ? 'text-amber-400 bg-amber-500/10' : 'text-blue-400 bg-blue-500/10'}`}>
                              {priority === 'H' ? 'High' : priority === 'M' ? 'Medium' : 'Foundation'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Desired Knowledge</h4>
                    <p className="text-[11px] text-white/60">{department.desired_knowledge}</p>
                  </div>
                  {department.top_gaps && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Top Gaps</h4>
                      <p className="text-[11px] text-white/60">{department.top_gaps}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ GREEN SKILLS DIRECTORY ═══ */}
              {activeTab === "directory" && (
                <div className="space-y-3">
                  <p className="text-[10px] text-white/40 mb-2">All 12 green skills mapped for {deptLabel} — click to expand full details, descriptions, and behaviours.</p>
                  {(skillsMap.length > 0 ? ["Technical", "Knowledgeable", "Values", "Attitudes"] : []).map(family => {
                    const familySkillsMap = skillsMap.filter(s => s.skillFamily.includes(family));
                    const familySkillsDB = skills.filter(s => s.skill_family === family);
                    if (familySkillsMap.length === 0 && familySkillsDB.length === 0) return null;
                    const displaySkills = familySkillsMap.length > 0 ? familySkillsMap : familySkillsDB.map(s => ({
                      greenSkill: s.green_skill, skillFamily: family, description: s.description,
                      whyItMatters: s.why_it_matters, exampleBehaviours: s.example_behaviours,
                    }));
                    return (
                      <div key={family}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: family === "Technical" ? "#3b82f6" : family === "Knowledgeable" ? "#8b5cf6" : family === "Values" ? "#f59e0b" : "#ec4899" }} />
                          <span className="text-[11px] text-white/80 font-semibold uppercase tracking-wider">{family}</span>
                          <span className="text-[9px] text-white/30">{displaySkills.length} skills</span>
                        </div>
                        <div className="space-y-1 ml-4">
                          {displaySkills.map((s, idx) => {
                            const key = `dir-${family}-${idx}`;
                            const isOpen = expandedItems.has(key);
                            const dbSkill = familySkillsDB.find(sk => sk.green_skill.toLowerCase() === s.greenSkill.toLowerCase());
                            const skillColor = dbSkill ? getSkillSeverityColor(dbSkill.severity) : "#6b7280";
                            return (
                              <div key={key} className="bg-white/[0.02] rounded-lg border border-white/5 overflow-hidden">
                                <button onClick={() => toggleExpanded(key)}
                                  className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-white/[0.03] transition-colors">
                                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: skillColor }} />
                                  <span className="text-[11px] text-white/80 font-medium flex-1">{s.greenSkill}</span>
                                  {dbSkill && (
                                    <>
                                      <span className="text-[9px] text-white/40 font-mono">{dbSkill.current_level}/{dbSkill.required_level}</span>
                                      <span className="text-[9px] font-mono font-medium" style={{ color: skillColor }}>
                                        {dbSkill.gap > 0 ? `-${dbSkill.gap}` : "ok"}
                                      </span>
                                    </>
                                  )}
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
                                    className={`text-white/20 transition-transform ${isOpen ? "rotate-90" : ""}`}>
                                    <path d="M3 1.5L7 5L3 8.5" />
                                  </svg>
                                </button>
                                <AnimatePresence>
                                  {isOpen && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                      <div className="px-3 pb-3 pt-1 space-y-2 border-t border-white/5">
                                        <p className="text-[10px] text-white/50 leading-relaxed">{s.description}</p>
                                        {s.whyItMatters && (
                                          <div><span className="text-[9px] text-white/30">Why it matters: </span><span className="text-[10px] text-white/50">{s.whyItMatters}</span></div>
                                        )}
                                        {s.exampleBehaviours && (
                                          <div><span className="text-[9px] text-white/30">Behaviours: </span><span className="text-[10px] text-white/50">{s.exampleBehaviours}</span></div>
                                        )}
                                        {dbSkill && (
                                          <div className="flex flex-wrap gap-1.5">
                                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{dbSkill.theme}</span>
                                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                                              {getMaturityLabel(dbSkill.current_level)} → {getMaturityLabel(dbSkill.required_level)}
                                            </span>
                                            <span className="text-[8px] px-1.5 py-0.5 rounded font-medium" style={{ color: skillColor, backgroundColor: skillColor + "15" }}>
                                              {dbSkill.severity} | Priority: {dbSkill.priority_level}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {/* Fallback if no skills map */}
                  {skillsMap.length === 0 && skills.length > 0 && (
                    <div className="text-[10px] text-white/30">Showing skills from database. Full spreadsheet descriptions not available for this department.</div>
                  )}
                </div>
              )}

              {/* ═══ ACTIONS & DEVELOPMENT ═══ */}
              {activeTab === "actions" && (
                <div className="space-y-3">
                  <p className="text-[10px] text-white/40 mb-1">Learning & development roadmap — actions, contributions, and target maturity per skill.</p>
                  {deptActions.length > 0 ? (
                    <>
                      {["Technical", "Knowledgeable", "Values", "Attitudes"].map(family => {
                        const famActions = deptActions.filter(a => a.skillFamily === family);
                        if (famActions.length === 0) return null;
                        return (
                          <div key={family}>
                            <div className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mb-1.5">{family}</div>
                            <div className="space-y-1.5">
                              {famActions.map((a, i) => {
                                const key = `action-${family}-${i}`;
                                const isOpen = expandedItems.has(key);
                                const pColor = a.priority === "High" ? "#ef4444" : a.priority === "Medium" ? "#f59e0b" : "#3b82f6";
                                return (
                                  <div key={key} className="bg-white/[0.02] rounded-lg border border-white/5 overflow-hidden">
                                    <button onClick={() => toggleExpanded(key)} className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-white/[0.03] transition-colors">
                                      <span className="text-[11px] text-white/80 font-medium flex-1">{a.greenSkill}</span>
                                      <span className="text-[8px] px-1.5 py-0.5 rounded font-medium" style={{ color: pColor, backgroundColor: pColor + "15" }}>
                                        {a.priority}
                                      </span>
                                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
                                        className={`text-white/20 transition-transform ${isOpen ? "rotate-90" : ""}`}><path d="M3 1.5L7 5L3 8.5" /></svg>
                                    </button>
                                    <AnimatePresence>
                                      {isOpen && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                          <div className="px-3 pb-3 pt-1 space-y-2 border-t border-white/5">
                                            <div><span className="text-[9px] text-white/30">Action: </span><span className="text-[10px] text-white/60">{a.action}</span></div>
                                            <div><span className="text-[9px] text-white/30">Contribution: </span><span className="text-[10px] text-white/50">{a.contribution}</span></div>
                                            <div className="flex flex-wrap gap-1.5">
                                              <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">Target: {a.targetMaturity}</span>
                                              <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{a.linkedTheme}</span>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    /* Fallback to risk-scored priority actions */
                    priorityActions.map((pa, i) => {
                      const skillColor = getSkillSeverityColor(pa.skill.severity);
                      return (
                        <div key={pa.skill.id} className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-mono text-white/30">#{i + 1}</span>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: skillColor }} />
                            <span className="text-[11px] text-white/80 font-medium flex-1">{pa.skill.green_skill}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ color: "#ef4444", backgroundColor: "#ef444415" }}>
                              Risk: {(pa.riskScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-[10px] text-white/50 mb-1">{pa.action}</p>
                          {pa.learningPathway.length > 0 && (
                            <div className="mt-1.5 pl-2 border-l border-green-500/20">
                              <div className="text-[8px] text-green-400/60 uppercase tracking-wider mb-0.5">Learning Pathway</div>
                              {pa.learningPathway.map((step, j) => (
                                <div key={j} className="text-[9px] text-white/40">› {step}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* ═══ MATURITY MAP ═══ */}
              {activeTab === "maturity" && (
                <div className="space-y-3">
                  <p className="text-[10px] text-white/40 mb-1">4-level maturity progression for {deptLabel} — from awareness to transformation.</p>
                  {(directoryData?.maturityLevels || MATURITY_LEVELS.map(m => ({
                    level: m.label, description: m.description,
                    technicalSkill: "", knowledgeSkill: "", value: "", attitude: "",
                  }))).map((ml, i) => {
                    const key = `maturity-${i + 1}`;
                    const isOpen = expandedItems.has(key);
                    const avgLevel = skills.length > 0 ? skills.reduce((s, sk) => s + sk.current_level, 0) / skills.length : 0;
                    const isCurrentLevel = i + 1 <= Math.round(avgLevel);
                    const levelSkills = skills.filter(s => s.required_level === i + 1);
                    return (
                      <div key={i} className={`rounded-lg border overflow-hidden ${isCurrentLevel ? "bg-green-500/[0.06] border-green-500/20" : "bg-white/[0.02] border-white/5"}`}>
                        <button onClick={() => toggleExpanded(key)} className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isCurrentLevel ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/30"}`}>
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className={`text-[12px] font-semibold ${isCurrentLevel ? "text-green-400" : "text-white/70"}`}>{ml.level}</div>
                            <div className="text-[9px] text-white/40">{ml.description?.slice(0, 80)}...</div>
                          </div>
                          {isCurrentLevel && <span className="text-[8px] px-2 py-0.5 rounded bg-green-500/10 text-green-400/70">Current Avg</span>}
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
                            className={`text-white/20 transition-transform ${isOpen ? "rotate-90" : ""}`}><path d="M3 1.5L7 5L3 8.5" /></svg>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                              <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/5">
                                <p className="text-[10px] text-white/50 leading-relaxed">{ml.description}</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-2 rounded bg-blue-500/[0.06] border border-blue-500/10">
                                    <div className="text-[8px] text-blue-400/60 uppercase tracking-wider mb-0.5">Technical</div>
                                    <div className="text-[10px] text-white/70">{ml.technicalSkill || "—"}</div>
                                  </div>
                                  <div className="p-2 rounded bg-purple-500/[0.06] border border-purple-500/10">
                                    <div className="text-[8px] text-purple-400/60 uppercase tracking-wider mb-0.5">Knowledge</div>
                                    <div className="text-[10px] text-white/70">{ml.knowledgeSkill || "—"}</div>
                                  </div>
                                  <div className="p-2 rounded bg-amber-500/[0.06] border border-amber-500/10">
                                    <div className="text-[8px] text-amber-400/60 uppercase tracking-wider mb-0.5">Value</div>
                                    <div className="text-[10px] text-white/70">{ml.value || "—"}</div>
                                  </div>
                                  <div className="p-2 rounded bg-pink-500/[0.06] border border-pink-500/10">
                                    <div className="text-[8px] text-pink-400/60 uppercase tracking-wider mb-0.5">Attitude</div>
                                    <div className="text-[10px] text-white/70">{ml.attitude || "—"}</div>
                                  </div>
                                </div>
                                {levelSkills.length > 0 && (
                                  <div>
                                    <div className="text-[8px] text-white/30 uppercase tracking-wider mb-1">Skills at this target level</div>
                                    {levelSkills.map(s => (
                                      <div key={s.id} className="flex items-center gap-2 text-[10px] py-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getSkillSeverityColor(s.severity) }} />
                                        <span className="text-white/60">{s.green_skill}</span>
                                        <span className="text-white/30 ml-auto font-mono">{s.current_level}/{s.required_level}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ═══ ASSESSMENT QUESTIONS ═══ */}
              {activeTab === "assessments" && (
                <div className="space-y-3">
                  <p className="text-[10px] text-white/40 mb-1">25 assessment questions across 5 themes — each scored 1-4 with best practice descriptors.</p>
                  {assessments.length > 0 ? (
                    <>
                      {/* Theme filter */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <button onClick={() => setAssessmentTheme(null)}
                          className={`text-[9px] px-2 py-1 rounded border transition-colors ${!assessmentTheme ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white/60"}`}>
                          All ({assessments.length})
                        </button>
                        {assessmentThemes.map(t => {
                          const count = assessments.filter(a => a.theme === t).length;
                          return (
                            <button key={t} onClick={() => setAssessmentTheme(assessmentTheme === t ? null : t)}
                              className={`text-[9px] px-2 py-1 rounded border transition-colors ${assessmentTheme === t ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white/60"}`}>
                              {t.replace(/[^\w\s&]/g, '').trim()} ({count})
                            </button>
                          );
                        })}
                      </div>
                      {assessments.filter(a => !assessmentTheme || a.theme === assessmentTheme).map((q, i) => {
                        const key = `assess-${i}`;
                        const isOpen = expandedItems.has(key);
                        const scoreColor = q.score >= 3 ? "#22c55e" : q.score >= 2 ? "#f59e0b" : "#ef4444";
                        return (
                          <div key={key} className="bg-white/[0.02] rounded-lg border border-white/5 overflow-hidden">
                            <button onClick={() => toggleExpanded(key)} className="flex items-start gap-2 w-full text-left px-3 py-2 hover:bg-white/[0.03] transition-colors">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: scoreColor + "20", color: scoreColor }}>
                                {q.score || "—"}
                              </div>
                              <span className="text-[10px] text-white/70 flex-1 leading-relaxed">{q.question}</span>
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
                                className={`text-white/20 transition-transform flex-shrink-0 mt-1 ${isOpen ? "rotate-90" : ""}`}><path d="M3 1.5L7 5L3 8.5" /></svg>
                            </button>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                  <div className="px-3 pb-3 pt-1 space-y-2 border-t border-white/5">
                                    <div className="space-y-1.5">
                                      <div className="p-2 rounded bg-green-500/[0.05] border border-green-500/10">
                                        <div className="text-[8px] text-green-400/60 mb-0.5">Best Practice (4 pts)</div>
                                        <div className="text-[9px] text-white/50">{q.bestPractice}</div>
                                      </div>
                                      <div className="p-2 rounded bg-blue-500/[0.05] border border-blue-500/10">
                                        <div className="text-[8px] text-blue-400/60 mb-0.5">Developing (3 pts)</div>
                                        <div className="text-[9px] text-white/50">{q.developing}</div>
                                      </div>
                                      <div className="p-2 rounded bg-amber-500/[0.05] border border-amber-500/10">
                                        <div className="text-[8px] text-amber-400/60 mb-0.5">Emerging (2 pts)</div>
                                        <div className="text-[9px] text-white/50">{q.emerging}</div>
                                      </div>
                                      <div className="p-2 rounded bg-red-500/[0.05] border border-red-500/10">
                                        <div className="text-[8px] text-red-400/60 mb-0.5">Beginner (1 pt)</div>
                                        <div className="text-[9px] text-white/50">{q.beginner}</div>
                                      </div>
                                    </div>
                                    {q.linkedSkills && (
                                      <div className="text-[9px]"><span className="text-white/30">Linked Skills: </span><span className="text-white/50">{q.linkedSkills}</span></div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="text-[10px] text-white/30">No assessment questions available for this department.</div>
                  )}
                </div>
              )}

              {/* ═══ SECTOR INTELLIGENCE ═══ */}
              {activeTab === "sectors" && (
                <div className="space-y-3">
                  <p className="text-[10px] text-white/40 mb-1">Research-backed sector intelligence — pain points, priority skills, quick wins, and regulatory horizon across 6 industries.</p>
                  {sectors.map((s, i) => {
                    const isOpen = expandedSector === s.sector;
                    const deptPriority = sectorPriorities[s.sector] || sectorPriorities[Object.keys(sectorPriorities).find(k => k.includes(s.sector.split(' ')[0])) || ""] || "";
                    return (
                      <div key={i} className="bg-white/[0.02] rounded-lg border border-white/5 overflow-hidden">
                        <button onClick={() => setExpandedSector(isOpen ? null : s.sector)}
                          className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors">
                          <span className="text-lg">{s.icon}</span>
                          <div className="flex-1">
                            <div className="text-[12px] text-white/80 font-semibold">{s.sector}</div>
                            <div className="text-[9px] text-white/40">{s.overview?.slice(0, 80)}...</div>
                          </div>
                          {deptPriority && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${deptPriority === 'H' ? 'text-red-400 bg-red-500/10' : deptPriority === 'M' ? 'text-amber-400 bg-amber-500/10' : 'text-blue-400 bg-blue-500/10'}`}>
                              {deptPriority === 'H' ? 'High' : deptPriority === 'M' ? 'Medium' : 'Foundation'}
                            </span>
                          )}
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
                            className={`text-white/20 transition-transform ${isOpen ? "rotate-90" : ""}`}><path d="M3 1.5L7 5L3 8.5" /></svg>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                              <div className="px-4 pb-4 pt-2 space-y-3 border-t border-white/5">
                                {s.stats && (
                                  <div className="p-2 rounded bg-blue-500/[0.04] border border-blue-500/10">
                                    <div className="text-[8px] text-blue-400/60 uppercase tracking-wider mb-1">Key Statistics</div>
                                    <div className="text-[9px] text-white/60 leading-relaxed whitespace-pre-line">{s.stats}</div>
                                  </div>
                                )}
                                <div>
                                  <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Overview</div>
                                  <p className="text-[10px] text-white/60 leading-relaxed">{s.overview}</p>
                                </div>
                                {s.painPoints && (
                                  <div>
                                    <div className="text-[9px] text-red-400/60 uppercase tracking-wider mb-1">Key Pain Points</div>
                                    <div className="text-[10px] text-white/50 leading-relaxed whitespace-pre-line">{s.painPoints}</div>
                                  </div>
                                )}
                                {s.whyGreenSkillsMatter && (
                                  <div>
                                    <div className="text-[9px] text-green-400/60 uppercase tracking-wider mb-1">Why Green Skills Matter</div>
                                    <p className="text-[10px] text-white/50 leading-relaxed">{s.whyGreenSkillsMatter}</p>
                                  </div>
                                )}
                                {s.keyRoles && (
                                  <div>
                                    <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Key Roles Emerging</div>
                                    <div className="text-[10px] text-white/50 whitespace-pre-line">{s.keyRoles}</div>
                                  </div>
                                )}
                                {s.prioritySkills && (
                                  <div>
                                    <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Priority Green Skills</div>
                                    <div className="text-[10px] text-white/50 whitespace-pre-line">{s.prioritySkills}</div>
                                  </div>
                                )}
                                {s.quickWins && (
                                  <div className="p-2 rounded bg-green-500/[0.04] border border-green-500/10">
                                    <div className="text-[8px] text-green-400/60 uppercase tracking-wider mb-1">Quick Wins (Top 5 Actions)</div>
                                    <div className="text-[9px] text-white/60 leading-relaxed whitespace-pre-line">{s.quickWins}</div>
                                  </div>
                                )}
                                {s.regulatoryHorizon && (
                                  <div>
                                    <div className="text-[9px] text-amber-400/60 uppercase tracking-wider mb-1">Regulatory Horizon</div>
                                    <p className="text-[10px] text-white/50">{s.regulatoryHorizon}</p>
                                  </div>
                                )}
                                {s.dataSource && (
                                  <div className="text-[8px] text-white/25 pt-1 border-t border-white/5">Source: {s.dataSource}</div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ═══ OPT FACTORS ═══ */}
              {activeTab === "factors" && (
                <div className="space-y-2">
                  <p className="text-[10px] text-white/40 mb-2">16 sustainability optimisation factors — higher = more impact potential.</p>
                  {optFactors.map((f) => (
                    <div key={f.key}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-white/60">{f.label}</span>
                        <span className="text-white/80 font-mono">{formatScore(f.value)}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
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
                      <p className="text-[10px] text-white/40 mb-1">Departments sharing skill dependencies or gaps with {deptLabel}.</p>
                      {connectedDepts.map((c, i) => {
                        const otherColor = getSeverityGlowColor(c.dept!.gap_severity);
                        return (
                          <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: otherColor }} />
                              <span className="text-white/80 text-[12px] font-medium">{c.dept!.label}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded ml-auto" style={{ color: otherColor, backgroundColor: otherColor + "15" }}>
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
        )}
      </AnimatePresence>
    </div>
  );
}
