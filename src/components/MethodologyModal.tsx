"use client";

import React from "react";
import { motion } from "framer-motion";

interface MethodologyModalProps {
  onClose: () => void;
}

export default function MethodologyModal({ onClose }: MethodologyModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-navy-800 border border-white/10 rounded-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">How GreenPulse Works</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 text-sm text-white/70">
          <section>
            <h3 className="text-white font-semibold mb-2">
              Green Skills Gap Analysis
            </h3>
            <p>
              GreenPulse maps the sustainability skills landscape across your
              organisation. Each department is assessed across{" "}
              <strong className="text-white/90">12 green skills</strong> grouped
              into 4 families: Technical, Knowledgeable, Values, and Attitudes.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">Gap Calculation</h3>
            <p>
              Each skill has a <strong className="text-white/90">required level</strong>{" "}
              (1–4) and a <strong className="text-white/90">current level</strong>{" "}
              (1–4). The gap = required − current.
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>
                  <strong className="text-red-400">Critical:</strong> Gap ≥ 2
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>
                  <strong className="text-amber-400">Moderate:</strong> Gap = 1
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span>
                  <strong className="text-green-400">No Gap:</strong> Gap = 0
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">
              16 Optimization Factors
            </h3>
            <p>
              Each skill is scored (0.00–1.00) across 16 operational
              sustainability factors — from carbon footprint to material waste.
              These scores indicate{" "}
              <strong className="text-white/90">
                how much each skill impacts real operational sustainability
              </strong>
              .
            </p>
            <p className="mt-2">
              A higher score means the skill has more influence on that factor.
              The average across all 16 factors determines the node&apos;s glow
              color on the network.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">Network Visualization</h3>
            <p>
              The neural network layout shows departments as interconnected
              nodes. Edge thickness reflects interdepartmental relationship
              strength. Drill into any department to explore skill families,
              then individual skills with their full optimization radar profile.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">Node Color Legend</h3>
            <p className="mb-2">
              Department node colors are driven by <strong className="text-white/90">gap severity</strong>{" "}
              calculated from the distribution of critical, moderate, and no-gap
              skills within each department.
            </p>
            <div className="flex gap-4 mt-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 shadow shadow-red-500/50" />
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500 shadow shadow-amber-500/50" />
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 shadow shadow-green-500/50" />
                <span>Healthy</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">CSV Export</h3>
            <p>
              Export a complete gap analysis report including all department
              summaries, skill-level data, severity classifications, and 16
              optimization factor scores. Use the{" "}
              <strong className="text-white/90">Export CSV</strong> button in the
              sidebar.
            </p>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
