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
            <h3 className="text-white font-semibold mb-2">Green Skills Intelligence Platform</h3>
            <p>
              GreenPulse maps <strong className="text-white/90">120+ green skills</strong> across{" "}
              <strong className="text-white/90">10 departments</strong>, specifically mapped to
              compliance and regulation per department, theme, and maturity levels.
              Each department is assessed across 12 green skills grouped into 4 families:
              Technical, Knowledgeable, Values, and Attitudes.
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
                <span><strong className="text-red-400">Critical:</strong> Gap ≥ 2 — Immediate upskilling required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span><strong className="text-amber-400">Moderate:</strong> Gap = 1 — Development focus needed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span><strong className="text-green-400">No Gap:</strong> Gap = 0 — Meets or exceeds target</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">Risk Scoring</h3>
            <p>
              Each skill receives a <strong className="text-white/90">weighted risk score</strong> combining:
            </p>
            <ul className="mt-1 space-y-1 ml-4 list-disc text-white/60">
              <li><strong className="text-white/80">Gap severity</strong> (40%) — How far below the required level</li>
              <li><strong className="text-white/80">Sustainability impact</strong> (35%) — Average across 16 optimisation factors</li>
              <li><strong className="text-white/80">Priority level</strong> (25%) — Strategic urgency from the organisation</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">4-Level Maturity Framework</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50 flex-shrink-0">1</div>
                <div><strong className="text-white/80">Curious Explorer</strong> — Basic awareness of sustainability terms and impact</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50 flex-shrink-0">2</div>
                <div><strong className="text-white/80">Engaged Learner</strong> — Applies basic sustainability principles</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50 flex-shrink-0">3</div>
                <div><strong className="text-white/80">Active Contributor</strong> — Integrates sustainability into daily processes</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50 flex-shrink-0">4</div>
                <div><strong className="text-white/80">Conscious Changemaker</strong> — Drives organisational transformation</div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">Green Skills Directory</h3>
            <p>
              Click any department node to access the <strong className="text-white/90">Green Skills Directory</strong> — a
              complete catalogue of all 12 skills for that department with descriptions,
              themes, maturity progressions, severity, and priority levels.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">Priority Actions & Learning Pathways</h3>
            <p>
              For each team, GreenPulse maps <strong className="text-white/90">mindset, maturity,
              vital green skills gaps, risks & rewards, and suggested learning pathways</strong>.
              The Priority Actions tab ranks skills by risk score and provides specific actions
              and step-by-step development pathways.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">5 Green Themes</h3>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="px-2 py-1 rounded bg-white/5 text-white/60">Climate Fluency</div>
              <div className="px-2 py-1 rounded bg-white/5 text-white/60">Decarbonisation</div>
              <div className="px-2 py-1 rounded bg-white/5 text-white/60">Data & AI Maturity</div>
              <div className="px-2 py-1 rounded bg-white/5 text-white/60">Risk</div>
              <div className="px-2 py-1 rounded bg-white/5 text-white/60">Circular Practices</div>
            </div>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2">Node Color Legend</h3>
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
              Export a complete gap analysis report including department summaries, risk scores,
              maturity levels, all skill-level data, and 16 optimisation factor scores.
            </p>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
