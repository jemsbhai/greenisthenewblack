"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { Department, DepartmentEdge } from "@/lib/types";
import { getSeverityGlowColor, computeAvgOpt } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface NetworkGraphProps {
  departments: Department[];
  edges: DepartmentEdge[];
  onNodeClick: (dept: Department) => void;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  dept: Department;
  color: string;
  radius: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  weight: number;
  relationship: string;
}

interface TooltipData {
  dept: Department;
  x: number;
  y: number;
}

export default function NetworkGraph({ departments, edges, onNodeClick }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  const buildGraph = useCallback(() => {
    if (!svgRef.current || departments.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const nodes: SimNode[] = departments.map((dept) => ({
      id: dept.id,
      dept,
      color: getSeverityGlowColor(dept.gap_severity),
      radius: 32,
    }));
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const links: SimLink[] = edges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({ source: e.source, target: e.target, weight: e.weight, relationship: e.relationship }));

    const defs = svg.append("defs");
    nodes.forEach((node) => {
      const grad = defs.append("radialGradient").attr("id", `glow-${node.id}`).attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", node.color).attr("stop-opacity", 0.8);
      grad.append("stop").attr("offset", "60%").attr("stop-color", node.color).attr("stop-opacity", 0.25);
      grad.append("stop").attr("offset", "100%").attr("stop-color", node.color).attr("stop-opacity", 0);
    });
    const filter = defs.append("filter").attr("id", "glow-filter").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const container = svg.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.3, 3]).on("zoom", (event) => container.attr("transform", event.transform));
    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85));

    // Edges
    const linkGroup = container.append("g").selectAll("line").data(links).enter().append("line")
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", (d) => 1 + d.weight * 3)
      .attr("class", "edge-animated");

    // Edge labels
    const edgeLabelGroup = container.append("g").selectAll("text").data(links).enter().append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.15)")
      .attr("font-size", "7px")
      .text((d) => d.relationship === "shared_skill_gap" ? "shared gap" : `dep ${(d.weight * 100).toFixed(0)}%`);

    // Glow halos
    const glowGroup = container.append("g").selectAll("circle").data(nodes).enter().append("circle")
      .attr("r", (d) => d.radius * 2.2)
      .attr("fill", (d) => `url(#glow-${d.id})`)
      .attr("opacity", 0.5)
      .style("pointer-events", "none");

    // Nodes
    const nodeGroup = container.append("g").selectAll("circle").data(nodes).enter().append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => d.color)
      .attr("opacity", 0.9)
      .attr("stroke", "rgba(255,255,255,0.25)")
      .attr("stroke-width", 1.5)
      .attr("filter", "url(#glow-filter)")
      .attr("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 1).attr("stroke-width", 3).attr("stroke", "rgba(255,255,255,0.6)");
        const [x, y] = d3.pointer(event, svgRef.current);
        setTooltip({ dept: d.dept, x, y });
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.9).attr("stroke-width", 1.5).attr("stroke", "rgba(255,255,255,0.25)");
        setTooltip(null);
      })
      .on("click", (_, d) => onNodeClick(d.dept));

    // Avg opt score % inside nodes
    const scoreText = container.append("g").selectAll("text").data(nodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", "0.35em").attr("fill", "white")
      .attr("font-size", "12px").attr("font-weight", "700").style("pointer-events", "none")
      .text((d) => `${(computeAvgOpt(d.dept) * 100).toFixed(0)}%`);

    // Labels below
    const labelText = container.append("g").selectAll("text").data(nodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", (d) => d.radius + 14)
      .attr("fill", "rgba(255,255,255,0.85)").attr("font-size", "11px").attr("font-weight", "600")
      .style("pointer-events", "none").text((d) => d.dept.label);

    // Severity + gap count labels
    const sevText = container.append("g").selectAll("text").data(nodes).enter().append("text")
      .attr("text-anchor", "middle").attr("dy", (d) => d.radius + 26)
      .attr("fill", (d) => d.color).attr("font-size", "9px").attr("font-weight", "500")
      .style("pointer-events", "none")
      .text((d) => {
        const parts = [];
        if (d.dept.critical_gap_count > 0) parts.push(`${d.dept.critical_gap_count} critical`);
        if (d.dept.moderate_gap_count > 0) parts.push(`${d.dept.moderate_gap_count} moderate`);
        if (d.dept.no_gap_count > 0) parts.push(`${d.dept.no_gap_count} ready`);
        return parts.join(" · ");
      });

    // Force simulation
    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force("link", d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(210).strength((d) => 0.15 + d.weight * 0.25))
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(0, 0))
      .force("collision", d3.forceCollide<SimNode>().radius((d) => d.radius + 45))
      .on("tick", () => {
        linkGroup
          .attr("x1", (d) => (d.source as SimNode).x!).attr("y1", (d) => (d.source as SimNode).y!)
          .attr("x2", (d) => (d.target as SimNode).x!).attr("y2", (d) => (d.target as SimNode).y!);
        edgeLabelGroup
          .attr("x", (d) => ((d.source as SimNode).x! + (d.target as SimNode).x!) / 2)
          .attr("y", (d) => ((d.source as SimNode).y! + (d.target as SimNode).y!) / 2 - 4);
        nodeGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        glowGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        scoreText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
        labelText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
        sevText.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
      });

    simulationRef.current = simulation;

    const drag = d3.drag<SVGCircleElement, SimNode>()
      .on("start", (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on("end", (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; });
    nodeGroup.call(drag);
  }, [departments, edges, onNodeClick]);

  useEffect(() => {
    buildGraph();
    const handleResize = () => buildGraph();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); simulationRef.current?.stop(); };
  }, [buildGraph]);

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" style={{ background: "transparent" }} />
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="absolute pointer-events-none z-50 bg-[#0f0f2e]/95 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 shadow-2xl"
            style={{ left: tooltip.x + 15, top: tooltip.y - 10, maxWidth: 320 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getSeverityGlowColor(tooltip.dept.gap_severity), boxShadow: `0 0 8px ${getSeverityGlowColor(tooltip.dept.gap_severity)}66` }} />
              <span className="text-white font-semibold text-sm">{tooltip.dept.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: getSeverityGlowColor(tooltip.dept.gap_severity) + "22", color: getSeverityGlowColor(tooltip.dept.gap_severity) }}>
                {tooltip.dept.gap_severity}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/60">
              <div>Avg Opt Score: <span className="text-white font-medium">{(computeAvgOpt(tooltip.dept) * 100).toFixed(0)}%</span></div>
              <div>Priority: <span className="text-white font-medium">{tooltip.dept.priority_level}</span></div>
              <div>Critical Gaps: <span className="text-red-400 font-medium">{tooltip.dept.critical_gap_count}</span></div>
              <div>Moderate Gaps: <span className="text-amber-400 font-medium">{tooltip.dept.moderate_gap_count}</span></div>
              <div>No Gap: <span className="text-green-400 font-medium">{tooltip.dept.no_gap_count}</span></div>
              <div>Desired Knowledge: <span className="text-white font-medium">{tooltip.dept.desired_knowledge}</span></div>
            </div>
            {tooltip.dept.top_gaps && (
              <div className="mt-2 pt-2 border-t border-white/5 text-xs text-white/50">
                <span className="text-white/30">Top Gaps: </span>{tooltip.dept.top_gaps}
              </div>
            )}
            <div className="text-[10px] text-white/25 mt-2">Click to explore 12 green skills →</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
