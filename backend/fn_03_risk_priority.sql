-- ============================================================
-- FUNCTION 3: fn_get_risk_priority
-- ============================================================
-- Returns a ranked list of skill gaps for a company, ordered by
-- risk_score (gap × optimization impact). This answers:
-- "Which gaps should we close FIRST for maximum impact?"
--
-- Usage:
--   const { data } = await supabase.rpc('fn_get_risk_priority', {
--     p_company_id: 'uuid-here'
--   });
--
-- Optional filters:
--   p_department: filter to one department
--   p_severity: 'Critical', 'Moderate', or NULL for all
--   p_limit: how many to return (default 20)
-- ============================================================

CREATE OR REPLACE FUNCTION fn_get_risk_priority(
  p_company_id UUID,
  p_department TEXT DEFAULT NULL,
  p_severity   TEXT DEFAULT NULL,
  p_limit      INT  DEFAULT 20
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM company_skill_gaps WHERE company_id = p_company_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No gap data found. Run fn_calculate_company_gaps first.'
    );
  END IF;

  RETURN (
    SELECT jsonb_build_object(
      'success', true,
      'company_id', p_company_id,
      'total_results', COUNT(*),
      'priorities', jsonb_agg(row_data ORDER BY rank_num)
    )
    FROM (
      SELECT
        ROW_NUMBER() OVER (ORDER BY csg.risk_score DESC, csg.gap DESC) AS rank_num,
        jsonb_build_object(
          'rank', ROW_NUMBER() OVER (ORDER BY csg.risk_score DESC, csg.gap DESC),
          'department', csg.department,
          'green_skill', csg.green_skill,
          'skill_family', csg.skill_family,
          'theme', csg.theme,
          'required_level', csg.required_level,
          'current_level', csg.current_level,
          'gap', csg.gap,
          'severity', csg.severity,
          'risk_score', csg.risk_score,
          -- Top 3 optimization factors for this skill (what closing this gap improves)
          'top_impact_factors', (
            SELECT jsonb_agg(factor_pair ORDER BY factor_score DESC)
            FROM (
              SELECT jsonb_build_object('factor', f.factor_name, 'score', f.factor_score) AS factor_pair,
                     f.factor_score
              FROM (VALUES
                ('carbon_footprint', csg.opt_carbon_footprint),
                ('renewable_energy', csg.opt_renewable_energy),
                ('hvac', csg.opt_hvac),
                ('office_space', csg.opt_office_space),
                ('remote_work', csg.opt_remote_work),
                ('work_schedule', csg.opt_work_schedule),
                ('water_use', csg.opt_water_use),
                ('digital_footprint', csg.opt_digital_footprint),
                ('ai_compute', csg.opt_ai_compute),
                ('iot_telemetry', csg.opt_iot_telemetry),
                ('hardware_circularity', csg.opt_hardware_circularity),
                ('supply_chain_emissions', csg.opt_supply_chain_emissions),
                ('logistics_shipping', csg.opt_logistics_shipping),
                ('fleet_electrification', csg.opt_fleet_electrification),
                ('employee_commuting', csg.opt_employee_commuting),
                ('material_waste', csg.opt_material_waste)
              ) AS f(factor_name, factor_score)
              WHERE f.factor_score > 0.3
              ORDER BY f.factor_score DESC
              LIMIT 3
            ) top3
          )
        ) AS row_data
      FROM company_skill_gaps csg
      WHERE csg.company_id = p_company_id
        AND csg.gap > 0
        AND (p_department IS NULL OR csg.department = p_department)
        AND (p_severity IS NULL OR csg.severity = p_severity)
      ORDER BY csg.risk_score DESC, csg.gap DESC
      LIMIT p_limit
    ) ranked
  );
END;
$$;

-- ============================================================
-- FUNCTION 3b: fn_get_department_risk_summary
-- ============================================================
-- Returns department-level risk rankings for a company.
-- Used for the executive overview / heatmap.
--
-- Usage:
--   const { data } = await supabase.rpc('fn_get_department_risk_summary', {
--     p_company_id: 'uuid-here'
--   });
-- ============================================================

CREATE OR REPLACE FUNCTION fn_get_department_risk_summary(
  p_company_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM company_department_scores WHERE company_id = p_company_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No department scores found. Run fn_calculate_company_gaps first.'
    );
  END IF;

  RETURN (
    SELECT jsonb_build_object(
      'success', true,
      'company_id', p_company_id,
      'departments', jsonb_agg(
        jsonb_build_object(
          'rank', ROW_NUMBER() OVER (ORDER BY cds.risk_score DESC),
          'department', cds.department,
          'priority_level', cds.priority_level,
          'readiness_pct', cds.readiness_pct,
          'avg_gap', cds.avg_gap,
          'risk_score', cds.risk_score,
          'critical_count', cds.critical_count,
          'moderate_count', cds.moderate_count,
          'no_gap_count', cds.no_gap_count,
          -- Top critical skills in this dept
          'top_critical_skills', (
            SELECT COALESCE(jsonb_agg(
              jsonb_build_object(
                'skill', csg.green_skill,
                'gap', csg.gap,
                'risk_score', csg.risk_score
              ) ORDER BY csg.risk_score DESC
            ), '[]'::jsonb)
            FROM company_skill_gaps csg
            WHERE csg.company_id = p_company_id
              AND csg.department = cds.department
              AND csg.severity = 'Critical'
            LIMIT 5
          ),
          -- Optimization heatmap: which factors this dept impacts most
          'optimization_profile', (
            SELECT jsonb_build_object(
              'carbon_footprint', ROUND(AVG(csg.opt_carbon_footprint), 2),
              'renewable_energy', ROUND(AVG(csg.opt_renewable_energy), 2),
              'digital_footprint', ROUND(AVG(csg.opt_digital_footprint), 2),
              'supply_chain_emissions', ROUND(AVG(csg.opt_supply_chain_emissions), 2),
              'material_waste', ROUND(AVG(csg.opt_material_waste), 2),
              'employee_commuting', ROUND(AVG(csg.opt_employee_commuting), 2)
            )
            FROM company_skill_gaps csg
            WHERE csg.company_id = p_company_id
              AND csg.department = cds.department
          )
        ) ORDER BY cds.risk_score DESC
      )
    )
    FROM company_department_scores cds
    WHERE cds.company_id = p_company_id
  );
END;
$$;

-- ============================================================
-- FUNCTION 3c: fn_get_optimization_impact
-- ============================================================
-- Answers: "Across ALL gaps, which optimization factors are
-- most impacted?" Used for the optimization priority chart.
--
-- Usage:
--   const { data } = await supabase.rpc('fn_get_optimization_impact', {
--     p_company_id: 'uuid-here'
--   });
-- ============================================================

CREATE OR REPLACE FUNCTION fn_get_optimization_impact(
  p_company_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'success', true,
      'company_id', p_company_id,
      'factors', jsonb_agg(
        jsonb_build_object(
          'factor', f.factor_name,
          'weighted_impact', f.weighted_impact,
          'avg_relevance', f.avg_relevance,
          'skills_affected', f.skills_affected
        ) ORDER BY f.weighted_impact DESC
      )
    )
    FROM (
      -- For each factor, sum (gap × factor_score) across all gapped skills
      SELECT
        u.factor_name,
        ROUND(SUM(u.gap_val * u.factor_score), 2) AS weighted_impact,
        ROUND(AVG(u.factor_score), 2) AS avg_relevance,
        COUNT(*) AS skills_affected
      FROM (
        SELECT csg.gap AS gap_val, 'carbon_footprint' AS factor_name, csg.opt_carbon_footprint AS factor_score FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'renewable_energy', csg.opt_renewable_energy FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'hvac', csg.opt_hvac FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'office_space', csg.opt_office_space FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'remote_work', csg.opt_remote_work FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'work_schedule', csg.opt_work_schedule FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'water_use', csg.opt_water_use FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'digital_footprint', csg.opt_digital_footprint FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'ai_compute', csg.opt_ai_compute FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'iot_telemetry', csg.opt_iot_telemetry FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'hardware_circularity', csg.opt_hardware_circularity FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'supply_chain_emissions', csg.opt_supply_chain_emissions FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'logistics_shipping', csg.opt_logistics_shipping FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'fleet_electrification', csg.opt_fleet_electrification FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'employee_commuting', csg.opt_employee_commuting FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
        UNION ALL
        SELECT csg.gap, 'material_waste', csg.opt_material_waste FROM company_skill_gaps csg WHERE csg.company_id = p_company_id AND csg.gap > 0
      ) u
      WHERE u.factor_score > 0
      GROUP BY u.factor_name
    ) f
  );
END;
$$;
