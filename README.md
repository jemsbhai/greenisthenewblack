# GreenPulse

**Know your climate gaps before they know you.**

> A Green Skills Gap Intelligence platform for enterprise workforce climate readiness — built for the Velric Miami Hackathon 2026, Sustainability Track, powered by Sustained Futures.

---

## What it does

GreenPulse helps identify exactly where an organisation is not climate-ready — by role, department, and skill family — in under 3 minutes.

It maps green skills across departments, scores current capability against required maturity levels, and calculates **operational optimisation impact scores** across 16 real-world sustainability factors — including HVAC efficiency, renewable energy adoption, carbon footprint, solar/fleet electrification, supply chain emissions, water use, digital footprint, AI compute, IoT telemetry, hardware circularity, and more. These factors are used to weight each skill's risk score: a gap in a high-impact area (e.g. a team responsible for HVAC or logistics with zero renewable energy capability) scores far higher than a gap in a low-impact area.

All of this is rendered as an **interactive neural network graph** — departments appear as nodes, sized and coloured by risk, connected by relationship edges. Critical gaps pulse red. Click any node to drill through skill families and individual skills, with live KPI metrics updating in the sidebar as you navigate.

## Live demo

https://greenpath-onboard.lovable.app/
---

## What you can do in 2–3 minutes

1. **Land on the dashboard** — see the full department network graph with risk-coloured nodes at a glance
2. **Click a department** — drill into skill families (Technical, Knowledgeable, Values, Attitudes) with gap severity shown visually
3. **Click a skill family** — see individual green skills, their current vs required maturity level, and gap severity
4. **Read the KPI sidebar** — live-calculated metrics: overall gap score, critical gaps, quick wins, compliance risk skills, risk score, and priority actions
5. **Export a CSV** — full skills gap report downloadable in one click

---

## How gap scoring works

Gap = `required_level − current_level`

Severity categories:
- **Critical** — gap ≥ 2
- **Moderate** — gap = 1
- **No Gap** — gap = 0

Risk score per skill (0–1):

```
risk = (gap_weight × 0.4) + (opt_impact × 0.35) + (priority_weight × 0.25)
```

Where `opt_impact` is the average of 16 operational optimisation factors (HVAC, carbon footprint, renewable energy, supply chain emissions, etc.) stored per skill and department in Supabase. This gives higher risk scores to skills that are both behind AND operationally impactful.

Department risk score = average of all skill risk scores for that department.

Maturity scale (4-point):
| Level | Label |
|---|---|
| 1 | Curious Explorer |
| 2 | Engaged Learner |
| 3 | Active Contributor |
| 4 | Conscious Changemaker |

---

## Data

- **Skills data**: ~200+ green skills across departments, seeded into Supabase (`green_skills` table) from the GSIP dataset
- **Department data**: department-level aggregates including overall score, gap severity, opt factors (`departments` table)
- **GSIP narrative content**: priority actions, learning pathways, assessments, sector intelligence — stored in `src/data/gsipData.json`
- All opt scores (HVAC, carbon footprint, renewable energy, etc.) are real values from the dataset, not mocked

---

## Tech stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Supabase (PostgreSQL)
- **Visualisation**: D3.js (force-directed network graph, skill family graph)
- **UI**: Tailwind CSS, Framer Motion
- **Charts**: Recharts
- **Deployment**: Vercel & Lovable

---

## Setup

### Prerequisites
- Node.js 18+
- A Supabase project with the `departments`, `green_skills`, and `department_edges` tables seeded

### 1. Clone and install

```bash
git clone https://github.com/xfifixq/hackathon-velric.git
cd hackathon-velric
npm install --legacy-peer-deps
```

### 2. Configure environment

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project structure

```
src/
├── app/
│   └── page.tsx          # Main page — data loading and view routing
├── components/
│   ├── NetworkGraph.tsx   # D3 force-directed department graph
│   ├── SkillFamilyGraph.tsx  # Skill family drill-down graph
│   ├── SkillsGraph.tsx    # Individual skills view
│   ├── KPISidebar.tsx     # Live KPI panel + CSV export
│   ├── SkillDetailDrawer.tsx # Skill detail slide-out
│   └── Breadcrumbs.tsx    # Navigation breadcrumbs
├── lib/
│   ├── queries.ts         # Supabase data fetching
│   ├── gapAnalysis.ts     # Gap scoring, risk calculation, priority actions
│   ├── utils.ts           # Opt scoring, colour mapping, helpers
│   └── types.ts           # TypeScript interfaces
└── data/
    └── gsipData.json      # GSIP narrative content (actions, pathways, assessments)
```

---

## Built at

Velric Miami Hackathon 2026 · Sustainability Track · Powered by Sustained Futures
By Fifi Siddiqui and Muntaser Syed
