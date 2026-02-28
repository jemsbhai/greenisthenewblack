# Prompt: Generate a GreenPulse Hackathon Slide Deck

You are building a pitch deck for **GreenPulse**, a Green Skills Gap Intelligence MVP built for the **Velric Miami Hackathon — Sustainability Track**, powered by Sustained Futures.

Generate a clean, compelling slide deck (12–15 slides) in the format I specify at the end. The deck should be presentable in 3–5 minutes and make a judge immediately understand what GreenPulse does, why it matters, and how the gap scoring works.

---

## Context

**Hackathon theme:** Build a Green Skills Gap Intelligence MVP for enterprise workforce climate readiness.

**What GreenPulse is:** A real-time, interactive Green Skills Gap Intelligence platform that helps HR leaders and ESG teams instantly visualize where their workforce is — and isn't — climate-ready. It pulls live data from Supabase, renders it as explorable force-directed network graphs, and surfaces prioritized actions through a rich analytics dashboard.

**Tech stack:** Next.js 14 (App Router), Supabase (PostgreSQL), D3.js (force-directed graphs with zoom/pan/drag), Framer Motion, Tailwind CSS, TypeScript.

---

## Slide Structure

### Slide 1 — Title
- **GreenPulse** — Green Skills Gap Intelligence Platform
- Velric Miami Hackathon | Sustainability Track
- Team name / members
- One-liner: "See where your workforce isn't climate-ready — in seconds."

### Slide 2 — The Problem
- Companies are under pressure to meet climate targets (CSRD, ISSB, net-zero commitments)
- But most don't know whether their people have the skills to execute
- Green skills gaps are invisible — buried across departments, roles, and functions
- HR leaders have no fast way to identify which gaps are critical vs. manageable

### Slide 3 — The Opportunity
- 70%+ of companies report a green skills shortage (cite LinkedIn Green Economy Report / Deloitte)
- Workforce climate readiness is the missing link between sustainability commitments and actual execution
- The first company to map, measure, and close these gaps gains a real competitive advantage

### Slide 4 — What We Built
- A working MVP that a judge can click through in 2–3 minutes
- End-to-end flow: Departments → Green Skills → Gap Assessment → Severity → Prioritized Dashboard
- Not a static dashboard — an interactive intelligence layer powered by live data

### Slide 5 — Architecture Overview
- Show a simple diagram:
  - **Supabase** (departments, green_skills, department_edges tables)
  - **Next.js** (App Router, server components)
  - **D3.js** (force-directed network graphs)
  - **Framer Motion** (transitions)
  - **Tailwind** (dark theme UI)
- Mention: all data is live from PostgreSQL, not hardcoded

### Slide 6 — The Data Model
- **Departments** (8 functions: Procurement, Operations, Finance, HR, etc.)
- **Green Skills** (50+ skills across 4 families: Technical, Knowledgeable, Values, Attitudes)
- **Each skill has:** current_level, required_level, gap, severity, theme, priority_level
- **16 sustainability optimization factors** per department (opt_carbon_mgmt, opt_circular_economy, etc.)
- **Department edges** for cross-department skill dependencies

### Slide 7 — Gap Calculation Logic
- **Gap = Required Level − Current Level** (per skill)
- **Severity classification:**
  - Critical: gap ≥ 2
  - Moderate: gap = 1
  - No Gap: gap ≤ 0
- **Risk Score** (weighted composite): gap severity × sustainability optimization impact × priority level
- **Department Risk**: aggregated from all mapped skills, computed live — never stale
- **4-level maturity scale**: Curious Explorer → Informed Practitioner → Strategic Integrator → Conscious Changemaker

### Slide 8 — Demo: Department Network View
- Screenshot/recording of the main department graph
- Each department is a color-coded node (green/amber/red by optimization score)
- Zoom, pan, drag to explore
- Click any department to drill in
- KPI sidebar always visible: Readiness %, Avg Opt, Total Skills, Gap Distribution

### Slide 9 — Demo: Department Deep-Dive
- Screenshot/recording of the SkillFamilyGraph view
- Force graph: center hub (department) → 16 optimization factor nodes → individual skill leaf nodes
- 8-tab drawer: Overview, Skills Directory, Actions & Dev, Maturity Map, Assessment, Sector Intel, Opt Factors, Connections
- All panels are resizable by drag

### Slide 10 — Demo: Executive Dashboard (KPI Sidebar)
- Always-visible sidebar with:
  - Readiness % (skills with no gap / total)
  - Avg Optimization Score (mean of 16 factors across all departments)
  - Gap Distribution Bar (Critical / Moderate / No Gap)
  - High-Risk Departments (ranked by weighted risk score)
  - Priority Actions tab (top 8 skills by risk score)
  - Quick Wins (moderate gaps with high sustainability impact)
  - Risks tab (compliance/regulatory exposure + department risk ranking)
  - CSV Export (full gap analysis for reporting)

### Slide 11 — Assessment & Maturity Framework
- 25 assessment questions across 5 sustainability themes
- Each scored 1–4 with rubric (Best Practice → Beginner)
- Maturity Map: 4-level progression with Technical/Knowledge/Value/Attitude breakdowns per level
- Sector Intelligence: 6 industries with pain points, priority skills, quick wins, regulatory horizon

### Slide 12 — How It Meets the Brief
Show a checklist mapping brief requirements to our implementation:
| Requirement | GreenPulse |
|---|---|
| Roles & functions | 8 departments from Supabase |
| Green skills directory | 50+ skills, 4 families, pre-seeded |
| Assessment / scoring | 25 questions, 4-point maturity scale |
| Gap calculation | Required − Current, severity categorization |
| Dashboard with risk & priority | KPI sidebar + priority actions + risk ranking |
| Critical gaps highlighted | Red nodes, high-risk section, compliance risks |
| Heatmap / distribution | Gap bars at org + dept level, color-coded nodes |
| CSV export | One-click full export |
| End-to-end demo | Single-page app, click-through in 2–3 min |

### Slide 13 — What Makes GreenPulse Different
- **Not a static report** — it's an interactive, explorable intelligence layer
- **Force-directed network graphs** — relationships between departments and skills are visible, not tabular
- **Live data** — all metrics computed from Supabase in real-time, not pre-baked
- **Resizable, draggable UI** — feels like a real enterprise tool
- **Sector intelligence built in** — not just internal gaps, but industry context
- **One-click CSV export** — ready for boardroom reporting

### Slide 14 — What's Next (Post-Hackathon Vision)
- Google SSO authentication
- Company onboarding flow (industry, size, location)
- Role creation with auto-skill assignment
- Employee self-assessment flow
- Multi-company benchmarking
- AI-powered skill recommendations

### Slide 15 — Thank You / Q&A
- Team name and members
- GitHub repo link
- Live demo URL
- "GreenPulse — See where your workforce isn't climate-ready."

---

## Output Format

Generate the slide deck as a **structured markdown document** where each slide is a section with:
- Slide number and title as an H2
- Bullet points for content
- Speaker notes in a blockquote block under each slide
- Indicate where screenshots or diagrams should be placed with `[SCREENSHOT: description]` or `[DIAGRAM: description]`

Keep the tone professional but energetic — this is a hackathon pitch, not a corporate proposal. The judges want to see that it works, the logic is correct, and the UX is clean.

Total presentation time: 3–5 minutes. Keep each slide to 3–5 bullet points max. Let the visuals and demo do the heavy lifting.
