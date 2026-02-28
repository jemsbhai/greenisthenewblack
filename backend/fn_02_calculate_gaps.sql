-- ============================================================
-- FUNCTION 2: fn_calculate_company_gaps
-- ============================================================
-- Prerequisite tables for per-company results
-- ============================================================

-- Per-company skill gap results
CREATE TABLE IF NOT EXISTS company_skill_gaps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  department        TEXT NOT NULL,
  skill_family      TEXT NOT NULL,
  green_skill       TEXT NOT NULL,
  theme             TEXT,
  required_level    INT,
  current_level     INT,
  gap               INT,
  severity          TEXT,
  -- optimization factors copied from green_skills for easy querying
  opt_carbon_footprint     NUMERIC(5,2),
  opt_renewable_energy     NUMERIC(5,2),
  opt_hvac                 NUMERIC(5,2),
  opt_office_space         NUMERIC(5,2),
  opt_remote_work          NUMERIC(5,2),
  opt_work_schedule        NUMERIC(5,2),
  opt_water_use            NUMERIC(5,2),
  opt_digital_footprint    NUMERIC(5,2),
  opt_ai_compute           NUMERIC(5,2),
  opt_iot_telemetry        NUMERIC(5,2),
  opt_hardware_circularity NUMERIC(5,2),
  opt_supply_chain_emissions NUMERIC(5,2),
  opt_logistics_shipping   NUMERIC(5,2),
  opt_fleet_electrification NUMERIC(5,2),
  opt_employee_commuting   NUMERIC(5,2),
  opt_material_waste       NUMERIC(5,2),
  -- weighted risk score (gap × avg optimization relevance)
  risk_score        NUMERIC(5,2),
  calculated_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, department, green_skill)
);

-- Per-company department-level summary
CREATE TABLE IF NOT EXISTS company_department_scores (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  department        TEXT NOT NULL,
  avg_current_level NUMERIC(3,2),
  avg_required_level NUMERIC(3,2),
  avg_gap           NUMERIC(3,2),
  critical_count    INT DEFAULT 0,
  moderate_count    INT DEFAULT 0,
  no_gap_count      INT DEFAULT 0,
  readiness_pct     NUMERIC(5,1),
  risk_score        NUMERIC(5,2),
  priority_level    TEXT,
  calculated_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, department)
);

CREATE INDEX IF NOT EXISTS idx_csg_company ON company_skill_gaps(company_id);
CREATE INDEX IF NOT EXISTS idx_csg_dept ON company_skill_gaps(department);
CREATE INDEX IF NOT EXISTS idx_csg_severity ON company_skill_gaps(severity);
CREATE INDEX IF NOT EXISTS idx_cds_company ON company_department_scores(company_id);

-- ============================================================
-- CORE FUNCTION: fn_calculate_company_gaps
-- ============================================================
-- Reads assessment responses for a company, maps theme averages
-- to skill current_levels, computes gaps/severity, stores results.
--
-- Theme → Skill mapping:
--   Climate Fluency   → Technical skills (3 per dept)
--   Data & AI         → Knowledgeable skills (3 per dept)
--   Decarbonisation   → Values skills (3 per dept)
--   Risk              → 1st Attitudes skill
--   Circular Practices → 2nd + 3rd Attitudes skills
--
-- Usage:
--   const { data } = await supabase.rpc('fn_calculate_company_gaps', {
--     p_company_id: 'uuid-here'
--   });
-- ============================================================

CREATE OR REPLACE FUNCTION fn_calculate_company_gaps(
  p_company_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_dept          RECORD;
  v_theme_avg     RECORD;
  v_skill         RECORD;
  v_current       INT;
  v_gap           INT;
  v_severity      TEXT;
  v_risk          NUMERIC(5,2);
  v_opt_avg       NUMERIC(5,2);
  v_total_skills  INT := 0;
  v_total_gaps    INT := 0;
  v_depts_scored  INT := 0;
  v_attitudes_rank INT;
BEGIN
  -- Validate company
  IF NOT EXISTS (SELECT 1 FROM company_profiles WHERE id = p_company_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Company not found');
  END IF;

  -- Check they have responses
  IF NOT EXISTS (SELECT 1 FROM assessment_responses WHERE company_id = p_company_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'No assessment responses found');
  END IF;

  -- Clear previous results for this company
  DELETE FROM company_skill_gaps WHERE company_id = p_company_id;
  DELETE FROM company_department_scores WHERE company_id = p_company_id;

  -- For each department that has assessment responses...
  FOR v_dept IN
    SELECT DISTINCT aq.department
    FROM assessment_responses ar
    JOIN assessment_questions aq ON aq.id = ar.question_id
    WHERE ar.company_id = p_company_id
  LOOP
    v_depts_scored := v_depts_scored + 1;

    -- For each skill in this department, calculate current_level from theme average
    -- Reset attitudes counter per department
    v_attitudes_rank := 0;

    FOR v_skill IN
      SELECT gs.department, gs.skill_family, gs.green_skill, gs.theme,
             gs.required_level, gs.description,
             gs.opt_carbon_footprint, gs.opt_renewable_energy, gs.opt_hvac,
             gs.opt_office_space, gs.opt_remote_work, gs.opt_work_schedule,
             gs.opt_water_use, gs.opt_digital_footprint, gs.opt_ai_compute,
             gs.opt_iot_telemetry, gs.opt_hardware_circularity,
             gs.opt_supply_chain_emissions, gs.opt_logistics_shipping,
             gs.opt_fleet_electrification, gs.opt_employee_commuting,
             gs.opt_material_waste
      FROM green_skills gs
      WHERE gs.department = v_dept.department
      ORDER BY
        CASE gs.skill_family
          WHEN 'Technical' THEN 1
          WHEN 'Knowledgeable' THEN 2
          WHEN 'Values' THEN 3
          WHEN 'Attitudes' THEN 4
        END,
        gs.id
    LOOP
      -- Map skill_family to assessment theme for lookup
      -- Technical → Climate Fluency
      -- Knowledgeable → Data & AI
      -- Values → Decarbonisation
      -- Attitudes → Risk (1st) or Circular Practices (2nd, 3rd)
      IF v_skill.skill_family = 'Attitudes' THEN
        v_attitudes_rank := v_attitudes_rank + 1;
      END IF;

      -- Get the average score for the mapped theme
      SELECT ROUND(AVG(ar.score))::INT INTO v_current
      FROM assessment_responses ar
      JOIN assessment_questions aq ON aq.id = ar.question_id
      WHERE ar.company_id = p_company_id
        AND aq.department = v_dept.department
        AND aq.theme = CASE
          WHEN v_skill.skill_family = 'Technical'     THEN 'Climate Fluency'
          WHEN v_skill.skill_family = 'Knowledgeable'  THEN 'Data & AI'
          WHEN v_skill.skill_family = 'Values'         THEN 'Decarbonisation'
          WHEN v_skill.skill_family = 'Attitudes' AND v_attitudes_rank = 1 THEN 'Risk'
          WHEN v_skill.skill_family = 'Attitudes' AND v_attitudes_rank > 1 THEN 'Circular Practices'
        END;

      -- Default to 1 if no responses for this theme
      v_current := COALESCE(v_current, 1);
      -- Clamp to 1-4
      v_current := GREATEST(1, LEAST(4, v_current));

      -- Calculate gap
      v_gap := v_skill.required_level - v_current;

      -- Determine severity
      v_severity := CASE
        WHEN v_gap >= 2 THEN 'Critical'
        WHEN v_gap = 1  THEN 'Moderate'
        ELSE 'No Gap'
      END;

      -- Calculate risk_score = gap × average optimization factor relevance
      v_opt_avg := (
        COALESCE(v_skill.opt_carbon_footprint, 0) +
        COALESCE(v_skill.opt_renewable_energy, 0) +
        COALESCE(v_skill.opt_hvac, 0) +
        COALESCE(v_skill.opt_office_space, 0) +
        COALESCE(v_skill.opt_remote_work, 0) +
        COALESCE(v_skill.opt_work_schedule, 0) +
        COALESCE(v_skill.opt_water_use, 0) +
        COALESCE(v_skill.opt_digital_footprint, 0) +
        COALESCE(v_skill.opt_ai_compute, 0) +
        COALESCE(v_skill.opt_iot_telemetry, 0) +
        COALESCE(v_skill.opt_hardware_circularity, 0) +
        COALESCE(v_skill.opt_supply_chain_emissions, 0) +
        COALESCE(v_skill.opt_logistics_shipping, 0) +
        COALESCE(v_skill.opt_fleet_electrification, 0) +
        COALESCE(v_skill.opt_employee_commuting, 0) +
        COALESCE(v_skill.opt_material_waste, 0)
      ) / 16.0;

      v_risk := ROUND(GREATEST(v_gap, 0) * v_opt_avg, 2);

      -- Insert skill gap result
      INSERT INTO company_skill_gaps (
        company_id, department, skill_family, green_skill, theme,
        required_level, current_level, gap, severity,
        opt_carbon_footprint, opt_renewable_energy, opt_hvac,
        opt_office_space, opt_remote_work, opt_work_schedule,
        opt_water_use, opt_digital_footprint, opt_ai_compute,
        opt_iot_telemetry, opt_hardware_circularity,
        opt_supply_chain_emissions, opt_logistics_shipping,
        opt_fleet_electrification, opt_employee_commuting,
        opt_material_waste, risk_score
      ) VALUES (
        p_company_id, v_skill.department, v_skill.skill_family,
        v_skill.green_skill, v_skill.theme,
        v_skill.required_level, v_current, v_gap, v_severity,
        v_skill.opt_carbon_footprint, v_skill.opt_renewable_energy, v_skill.opt_hvac,
        v_skill.opt_office_space, v_skill.opt_remote_work, v_skill.opt_work_schedule,
        v_skill.opt_water_use, v_skill.opt_digital_footprint, v_skill.opt_ai_compute,
        v_skill.opt_iot_telemetry, v_skill.opt_hardware_circularity,
        v_skill.opt_supply_chain_emissions, v_skill.opt_logistics_shipping,
        v_skill.opt_fleet_electrification, v_skill.opt_employee_commuting,
        v_skill.opt_material_waste, v_risk
      )
      ON CONFLICT (company_id, department, green_skill)
      DO UPDATE SET
        current_level = v_current,
        gap = v_gap,
        severity = v_severity,
        risk_score = v_risk,
        calculated_at = now();

      v_total_skills := v_total_skills + 1;
      IF v_gap > 0 THEN v_total_gaps := v_total_gaps + 1; END IF;
    END LOOP; -- end skills loop

    -- Now compute department-level summary for this dept
    INSERT INTO company_department_scores (
      company_id, department,
      avg_current_level, avg_required_level, avg_gap,
      critical_count, moderate_count, no_gap_count,
      readiness_pct, risk_score, priority_level
    )
    SELECT
      p_company_id,
      csg.department,
      ROUND(AVG(csg.current_level)::numeric, 2),
      ROUND(AVG(csg.required_level)::numeric, 2),
      ROUND(AVG(GREATEST(csg.gap, 0))::numeric, 2),
      COUNT(*) FILTER (WHERE csg.severity = 'Critical'),
      COUNT(*) FILTER (WHERE csg.severity = 'Moderate'),
      COUNT(*) FILTER (WHERE csg.severity = 'No Gap'),
      ROUND(
        (COUNT(*) FILTER (WHERE csg.severity = 'No Gap'))::numeric
        / NULLIF(COUNT(*), 0) * 100, 1
      ),
      ROUND(AVG(csg.risk_score), 2),
      CASE
        WHEN COUNT(*) FILTER (WHERE csg.severity = 'Critical') >= 4 THEN 'Critical'
        WHEN COUNT(*) FILTER (WHERE csg.severity = 'Critical') >= 2 THEN 'High'
        WHEN COUNT(*) FILTER (WHERE csg.severity = 'Moderate') >= 3 THEN 'Medium'
        ELSE 'Low'
      END
    FROM company_skill_gaps csg
    WHERE csg.company_id = p_company_id
      AND csg.department = v_dept.department
    GROUP BY csg.department
    ON CONFLICT (company_id, department)
    DO UPDATE SET
      avg_current_level = EXCLUDED.avg_current_level,
      avg_required_level = EXCLUDED.avg_required_level,
      avg_gap = EXCLUDED.avg_gap,
      critical_count = EXCLUDED.critical_count,
      moderate_count = EXCLUDED.moderate_count,
      no_gap_count = EXCLUDED.no_gap_count,
      readiness_pct = EXCLUDED.readiness_pct,
      risk_score = EXCLUDED.risk_score,
      priority_level = EXCLUDED.priority_level,
      calculated_at = now();

  END LOOP; -- end dept loop

  RETURN jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'departments_scored', v_depts_scored,
    'total_skills_scored', v_total_skills,
    'total_gaps_found', v_total_gaps
  );
END;
$$;
