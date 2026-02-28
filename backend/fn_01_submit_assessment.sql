-- ============================================================
-- FUNCTION 1: fn_submit_assessment
-- ============================================================
-- Called when a user submits assessment answers.
-- Accepts a company_id and a JSON array of {question_id, score} pairs.
-- Upserts into assessment_responses (idempotent — safe to call multiple times).
--
-- Frontend usage:
--   const { data, error } = await supabase.rpc('fn_submit_assessment', {
--     p_company_id: 'uuid-here',
--     p_responses: [
--       { question_id: 1, score: 3 },
--       { question_id: 2, score: 2 },
--       ...
--     ]
--   });
-- ============================================================

CREATE OR REPLACE FUNCTION fn_submit_assessment(
  p_company_id UUID,
  p_responses  JSONB  -- array of { "question_id": int, "score": int }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item       JSONB;
  v_qid        INT;
  v_score      INT;
  v_count      INT := 0;
  v_errors     INT := 0;
BEGIN
  -- Validate company exists
  IF NOT EXISTS (SELECT 1 FROM company_profiles WHERE id = p_company_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Company not found: ' || p_company_id::text
    );
  END IF;

  -- Loop through each response and upsert
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_responses)
  LOOP
    v_qid   := (v_item ->> 'question_id')::INT;
    v_score := (v_item ->> 'score')::INT;

    -- Validate score range
    IF v_score < 1 OR v_score > 4 THEN
      v_errors := v_errors + 1;
      CONTINUE;
    END IF;

    -- Validate question exists
    IF NOT EXISTS (SELECT 1 FROM assessment_questions WHERE id = v_qid) THEN
      v_errors := v_errors + 1;
      CONTINUE;
    END IF;

    -- Upsert response
    INSERT INTO assessment_responses (company_id, question_id, score, answered_at)
    VALUES (p_company_id, v_qid, v_score, now())
    ON CONFLICT (company_id, question_id)
    DO UPDATE SET score = v_score, answered_at = now();

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'responses_saved', v_count,
    'errors_skipped', v_errors,
    'company_id', p_company_id
  );
END;
$$;

-- ============================================================
-- HELPER: fn_create_company
-- ============================================================
-- Creates a company profile and returns the ID.
-- Frontend calls this first during onboarding.
--
-- Usage:
--   const { data } = await supabase.rpc('fn_create_company', {
--     p_user_id: session.user.id,
--     p_company_name: 'Acme Corp',
--     p_industry: 'Manufacturing',
--     p_company_size: '500-1000',
--     p_location: 'London, UK'
--   });
-- ============================================================

CREATE OR REPLACE FUNCTION fn_create_company(
  p_user_id      UUID,
  p_company_name TEXT,
  p_industry     TEXT DEFAULT NULL,
  p_company_size TEXT DEFAULT NULL,
  p_location     TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  INSERT INTO company_profiles (user_id, company_name, industry, company_size, location)
  VALUES (p_user_id, p_company_name, p_industry, p_company_size, p_location)
  RETURNING id INTO v_company_id;

  RETURN jsonb_build_object(
    'success', true,
    'company_id', v_company_id,
    'company_name', p_company_name
  );
END;
$$;

-- ============================================================
-- HELPER: fn_get_assessment_questions
-- ============================================================
-- Returns questions for a specific department (or all).
-- Frontend calls this to render the assessment form.
--
-- Usage:
--   const { data } = await supabase.rpc('fn_get_assessment_questions', {
--     p_department: 'Operations'
--   });
-- ============================================================

CREATE OR REPLACE FUNCTION fn_get_assessment_questions(
  p_department TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', aq.id,
        'department', aq.department,
        'theme', aq.theme,
        'question_number', aq.question_number,
        'question', aq.question,
        'options', jsonb_build_object(
          '4', aq.best_practice,
          '3', aq.developing,
          '2', aq.emerging,
          '1', aq.beginner
        ),
        'linked_skills', aq.linked_skills
      )
      ORDER BY aq.department, aq.question_number
    )
    FROM assessment_questions aq
    WHERE (p_department IS NULL OR aq.department = p_department)
  );
END;
$$;
