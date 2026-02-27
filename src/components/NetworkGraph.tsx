"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { Department, DepartmentEdge } from "@/lib/types";
import { computeAvgOpt, getGlowColor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface NetworkGraphProps {
  departments: Department[];
  edges: DepartmentEdge[];
  onNodeClick: (dept: Department) => void;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  dept: Department;
  avgOpt: number;
  radius: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  weight: number;
  relationship: string;
}

interface TooltipData {
  dept: Department;
  avgOpt: number;
  x: number;
  y: number;
}

export default function NetworkGraph({
  departments,
  edges,
  onNodeClick,
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  const buildGraph = useCallback(() => {
    if (!svgRef.current || departments.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Build nodes
    const nodes: SimNode[] = departments.map((dept) => {
      const avgOpt = computeAvgOpt(dept);
      return {
        id: dept.id,
        dept,
        avgOpt,
        radius: 20 + dept.critical_gap_count * 5,
      };
    });

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // Build links
    const links: SimLink[] = edges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        source: e.source,
        target: e.target,
        weight: e.weight,
        relationship: e.relationship,
      }));

    // Defs for glows
    const defs = svg.append("defs");

    nodes.forEach((node) => {
      const color = getGlowColor(node.avgOpt);
      const grad = defs
        .append("radialGradient")
        .attr("id", `glow-${node.id}`)
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

    // Filter for glow effect
    const filter = defs
      .append("filter")
      .attr("id", "glow-filter")
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

    const container = svg.append("g");

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(0.9)
    );

    // Draw edges
    const linkGroup = container
      .append("g")
      .attr("class", "edges")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "rgba(255,255,255,0.12)")
      .attr("stroke-width", (d) => 1 + d.weight * 2)
      .attr("class", "edge-animated");

    // Draw glow halos
    const glowGroup = container
      .append("g")
      .attr("class", "glows")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => d.radius * 2.2)
      .attr("fill", (d) => `url(#glow-${d.id})`)
      .attr("opacity", 0.6)
      .style("pointer-events", "none");

    // Pulse animation for critical nodes
    glowGroup
      .filter((d) => d.avgOpt < 0.25)
      .append("animate")
      .attr("attributeName", "opacity")
      .attr("values", "0.4;0.8;0.4")
      .attr("dur", "2s")
      .attr("repeatCount", "indefinite");

    // Draw node circles
    const nodeGroup = container
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => {
        const color = getGlowColor(d.avgOpt);
        return color;
      })
      .attr("opacity", 0.85)
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", 1.5)
      .attr("filter", "url(#glow-filter)")
      .attr("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 1).attr("stroke-width", 3);
        const [x, y] = d3.pointer(event, svgRef.current);
        setTooltip({ dept: d.dept, avgOpt: d.avgOpt, x, y });
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.85).attr("stroke-width", 1.5);
        setTooltip(null);
      })
      .on("click", (_, d) => {
        onNodeClick(d.dept);
      });

    // Draw labels
    container
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.radius + 16)
      .attr("fill", "rgba(255,255,255,0.8)")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .style("pointer-events", "none")
      .text((d) => d.dept.label || d.dept.department);

    // Force simulation
    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(180)
          .strength((d) => 0.3 + d.weight * 0.3)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(0, 0))
      .force(
        "collision",
        d3.forceCollide<SimNode>().radius((d) => d.radius + 30)
      )
      .on("tick", () => {
        linkGroup
          .attr("x1", (d) => (d.source as SimNode).x!)
          .attr("y1", (d) => (d.source as SimNode).y!)
          .attr("x2", (d) => (d.target as SimNode).x!)
          .attr("y2", (d) => (d.target as SimNode).y!);

        nodeGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);

        glowGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);

        container
          .select(".labels")
          .selectAll<SVGTextElement, SimNode>("text")
          .attr("x", (d) => d.x!)
          .attr("y", (d) => d.y!);
      });

    simulationRef.current = simulation;

    // Drag behavior
    const drag = d3
      .drag<SVGCircleElement, SimNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGroup.call(drag);
  }, [departments, edges, onNodeClick]);

  useEffect(() => {
    buildGraph();
    const handleResize = () => buildGraph();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      simulationRef.current?.stop();
    };
  }, [buildGraph]);

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: "transparent" }}
      />
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute pointer-events-none z-50 bg-navy-800/95 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 shadow-xl"
            style={{
              left: tooltip.x + 15,
              top: tooltip.y - 10,
              maxWidth: 280,
            }}
          >
            <div className="text-white font-semibold text-sm mb-1">
              {tooltip.dept.label || tooltip.dept.department}
            </div>
            <div className="text-xs text-white/60 space-y-1">
              <div>
                Overall Score:{" "}
                <span className="text-white/90">
                  {tooltip.dept.overall_score}
                </span>
              </div>
              <div>
                Gap Severity:{" "}
                <span
                  style={{
                    color:
                      tooltip.dept.gap_severity === "Critical"
                        ? "#ef4444"
                        : tooltip.dept.gap_severity === "Moderate"
                        ? "#f59e0b"
                        : "#22c55e",
                  }}
                >
                  {tooltip.dept.gap_severity}
                </span>
              </div>
              <div>
                Avg Optimization:{" "}
                <span className="text-white/90">
                  {(tooltip.avgOpt * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                Critical Gaps:{" "}
                <span className="text-red-400">
                  {tooltip.dept.critical_gap_count}
                </span>
              </div>
              {tooltip.dept.top_gaps && (
                <div className="mt-1 text-white/50">
                  Top: {tooltip.dept.top_gaps}
                </div>
              )}
            </div>
            <div className="text-[10px] text-white/30 mt-2">
              Click to explore skills
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
