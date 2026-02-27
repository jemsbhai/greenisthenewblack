"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { GreenSkill, SkillFamily } from "@/lib/types";
import { computeAvgOpt, getGlowColor, getSeverityColor } from "@/lib/utils";
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
  avgOpt: number;
  radius: number;
  skill?: GreenSkill;
}

export default function SkillsGraph({
  family,
  skills,
  departmentLabel,
  onSkillClick,
  onBack,
}: SkillsGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    node: SkillNode;
    x: number;
    y: number;
  } | null>(null);

  const buildGraph = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const familyAvgOpt =
      skills.length > 0
        ? skills.reduce((sum, s) => sum + computeAvgOpt(s), 0) / skills.length
        : 0;

    const hubNode: SkillNode = {
      id: "hub",
      label: family,
      isHub: true,
      avgOpt: familyAvgOpt,
      radius: 30,
    };

    const skillNodes: SkillNode[] = skills.map((skill) => ({
      id: `skill-${skill.id}`,
      label: skill.green_skill,
      isHub: false,
      avgOpt: computeAvgOpt(skill),
      radius: 22,
      skill,
    }));

    const allNodes = [hubNode, ...skillNodes];
    const links = skillNodes.map((sn) => ({
      source: "hub",
      target: sn.id,
    }));

    const defs = svg.append("defs");
    allNodes.forEach((node) => {
      const color = getGlowColor(node.avgOpt);
      const grad = defs
        .append("radialGradient")
        .attr("id", `skglow-${node.id}`)
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
      .attr("id", "sk-glow-filter")
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

    const container = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

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
      .attr("fill", (d) => `url(#skglow-${d.id})`)
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
      .attr("filter", "url(#sk-glow-filter)")
      .attr("cursor", (d) => (d.isHub ? "default" : "pointer"))
      .on("mouseover", function (event, d) {
        if (!d.isHub) {
          d3.select(this).attr("opacity", 1).attr("stroke-width", 3);
          const [x, y] = d3.pointer(event, svgRef.current);
          setTooltip({ node: d, x, y });
        }
      })
      .on("mouseout", function (_, d) {
        if (!d.isHub) {
          d3.select(this).attr("opacity", 0.85).attr("stroke-width", 1.5);
        }
        setTooltip(null);
      })
      .on("click", (_, d) => {
        if (!d.isHub && d.skill) {
          onSkillClick(d.skill);
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
      .attr("dy", (d) => d.radius + 16)
      .attr("fill", "rgba(255,255,255,0.75)")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .style("pointer-events", "none")
      .each(function (d) {
        const text = d3.select(this);
        const label = d.label;
        // Wrap long labels
        if (label.length > 20 && !d.isHub) {
          const words = label.split(" ");
          const mid = Math.ceil(words.length / 2);
          text
            .append("tspan")
            .attr("x", 0)
            .attr("dy", 0)
            .text(words.slice(0, mid).join(" "));
          text
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "1.1em")
            .text(words.slice(mid).join(" "));
        } else {
          text.text(label);
        }
      });

    // Force simulation
    const simulation = d3
      .forceSimulation<SkillNode>(allNodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(130)
          .strength(0.8)
      )
      .force("charge", d3.forceManyBody().strength(-250))
      .force("center", d3.forceCenter(0, 0))
      .force(
        "collision",
        d3.forceCollide<SkillNode>().radius((d) => d.radius + 20)
      )
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
          .selectAll<SVGTextElement, SkillNode>("g:last-child text")
          .each(function (d) {
            d3.select(this)
              .selectAll("tspan")
              .attr("x", d.x!);
            if (d3.select(this).selectAll("tspan").empty()) {
              d3.select(this).attr("x", d.x!);
            }
            d3.select(this).attr("y", d.y!);
          });
      });

    return () => simulation.stop();
  }, [family, skills, onSkillClick]);

  useEffect(() => {
    const cleanup = buildGraph();
    return () => { cleanup?.(); };
  }, [buildGraph]);

  return (
    <div className="relative w-full h-full">
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
        {departmentLabel}
      </motion.button>

      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: "transparent" }}
      />

      <AnimatePresence>
        {tooltip && !tooltip.node.isHub && tooltip.node.skill && (
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
            <div className="text-white font-semibold text-sm">
              {tooltip.node.skill.green_skill}
            </div>
            <div className="text-xs text-white/60 mt-1 space-y-0.5">
              <div>
                Gap: {tooltip.node.skill.gap} | Severity:{" "}
                <span
                  style={{
                    color: getSeverityColor(tooltip.node.skill.severity),
                  }}
                >
                  {tooltip.node.skill.severity}
                </span>
              </div>
              <div>
                Level: {tooltip.node.skill.current_level}/
                {tooltip.node.skill.required_level}
              </div>
            </div>
            <div className="text-[10px] text-white/30 mt-1">
              Click for details
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
