-- ============================================================
-- GreenPulse — Assessment System Tables + Seed Data
-- 250 questions (25 per department × 10 departments)
-- 5 themes × 5 questions per theme per department
-- ============================================================

-- ========================
-- TABLE: company_profiles
-- ========================
DROP TABLE IF EXISTS assessment_responses CASCADE;
DROP TABLE IF EXISTS assessment_questions CASCADE;
DROP TABLE IF EXISTS company_profiles CASCADE;

CREATE TABLE company_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id),
  company_name  TEXT NOT NULL,
  industry      TEXT,
  company_size  TEXT,
  location      TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- TABLE: assessment_questions
-- ========================
CREATE TABLE assessment_questions (
  id              SERIAL PRIMARY KEY,
  department      TEXT NOT NULL REFERENCES departments(department),
  theme           TEXT NOT NULL,
  question_number INT NOT NULL,
  question        TEXT NOT NULL,
  best_practice   TEXT,
  developing      TEXT,
  emerging        TEXT,
  beginner        TEXT,
  linked_skills   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(department, question_number)
);

-- ========================
-- TABLE: assessment_responses
-- ========================
CREATE TABLE assessment_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  question_id     INT NOT NULL REFERENCES assessment_questions(id),
  score           INT NOT NULL CHECK (score BETWEEN 1 AND 4),
  answered_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, question_id)
);

-- ============================================================
-- SEED: assessment_questions (250 rows)
-- ============================================================

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Climate Fluency', 1, 'How well do you understand the climate impact of products and services developed by R&D?', 'Deep understanding across lifecycle stages; I apply GHG Protocol Product Standard and lifecycle assessment tools like SimaPro or GaBi in my work.', 'Good understanding of main impact areas (e.g., energy intensity, material sourcing) but limited in detailed quantification.', 'Limited awareness of environmental impacts beyond general concepts.', 'No awareness of climate impacts related to R&D.', '• Sustainable Design\n• Low-Carbon Prototyping\n• Lifecycle Impact');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Climate Fluency', 2, 'How confident are you integrating climate considerations into innovation processes?', 'Very confident; I consistently embed carbon footprint reduction, climate adaptation features, and circularity into design briefs and development sprints.', 'Somewhat confident; I include sustainability criteria in some projects.', 'Limited confidence; I need guidance from sustainability specialists.', 'Not confident; I have not included climate considerations in innovation.', '• Sustainable Design\n• Low-Carbon Prototyping\n• Lifecycle Impact');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Climate Fluency', 3, 'How familiar are you with science-based design frameworks (e.g., cradle-to-cradle, PAS 2050)?', 'Very familiar; I reference these frameworks to validate product sustainability claims and inform material choices.', 'Some familiarity; I have reviewed these standards but don’t apply them routinely.', 'Limited awareness; I’ve heard of them but never used them.', 'No awareness of these frameworks.', '• Sustainable Design\n• Low-Carbon Prototyping\n• Lifecycle Impact');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Climate Fluency', 4, 'How often do you engage teams on sustainable innovation and climate literacy?', 'Regularly; I lead workshops and embed sustainability goals into project charters and KPIs.', 'Occasionally; I share resources and updates when relevant.', 'Rarely; only when requested.', 'Never discussed sustainability with teams.', '• Sustainable Design\n• Low-Carbon Prototyping\n• Lifecycle Impact');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Climate Fluency', 5, 'How proactive are you in identifying opportunities to design low-carbon solutions?', 'Very proactive; I actively scan emerging technologies and materials aligned with SBTi pathways and regenerative design principles.', 'Somewhat proactive; I explore options when prompted by clients or leadership.', 'Occasionally; I consider alternatives in select projects.', 'Not proactive; I rely on others to suggest improvements.', '• Sustainable Design\n• Low-Carbon Prototyping\n• Lifecycle Impact');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Data & AI', 6, 'How advanced are your tools to assess environmental impacts of innovation?', 'Fully integrated digital tools (e.g., lifecycle assessment software, real-time emissions dashboards) are part of standard workflows.', 'Partially integrated; tools are available but not consistently used.', 'Basic tools with limited data coverage.', 'No tools or systems to assess impacts.', '• Circular Innovation\n• Eco-Material Knowledge\n• Climate Solutions');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Data & AI', 7, 'How confident are you using ESG data to guide innovation decisions?', 'Very confident; ESG metrics directly influence design choices, go/no-go decisions, and R&D investment.', 'Somewhat confident; I consider data in evaluations.', 'Limited confidence; I refer to data occasionally.', 'Not confident; I don’t use ESG data.', '• Circular Innovation\n• Eco-Material Knowledge\n• Climate Solutions');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Data & AI', 8, 'Do you use AI to model sustainability outcomes or optimize design?', 'Yes; AI tools (e.g., predictive modeling for energy efficiency, material selection algorithms) are routinely applied.', 'Sometimes; AI used for select analyses or pilots.', 'Rarely; AI considered but not widely adopted.', 'Never used AI for sustainability modeling.', '• Circular Innovation\n• Eco-Material Knowledge\n• Climate Solutions');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Data & AI', 9, 'How often do you validate sustainability data accuracy for R&D?', 'Regularly audited by third parties or internal specialists to ensure data credibility.', 'Occasionally validated; checks are informal.', 'Rarely validated; data is assumed accurate.', 'Never validated sustainability data.', '• Circular Innovation\n• Eco-Material Knowledge\n• Climate Solutions');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Data & AI', 10, 'How familiar are you with digital lifecycle assessment tools?', 'Very familiar; tools like OpenLCA or EcoInvent are standard in my workflow.', 'Some familiarity; used in a few projects.', 'Limited awareness of tools.', 'No awareness.', '• Circular Innovation\n• Eco-Material Knowledge\n• Climate Solutions');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Decarbonisation', 11, 'How aligned is R&D strategy with decarbonisation targets (e.g., SBTi commitments)?', 'Fully aligned; product roadmaps and KPIs are structured to achieve Science-Based Targets and decarbonisation milestones.', 'Partially aligned; decarbonisation goals are referenced but not fully operationalized in R&D.', 'Limited alignment; considered in a few isolated projects.', 'Not aligned; no link between decarbonisation targets and R&D priorities.', '• Regenerative Thinking\n• Future Orientation\n• Impact Awareness');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Decarbonisation', 12, 'How confident are you designing low-carbon products and services?', 'Very confident; I lead development using tools like lifecycle carbon footprinting (PAS 2050), low-carbon material sourcing, and energy optimization analysis.', 'Somewhat confident; I include low-carbon considerations in select projects.', 'Limited confidence; I rely heavily on external expertise.', 'Not confident; I have no experience designing low-carbon products.', '• Regenerative Thinking\n• Future Orientation\n• Impact Awareness');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Decarbonisation', 13, 'Do you set clear emissions reduction targets within innovation projects?', 'Always; targets are embedded in project charters, tracked during development, and verified post-launch.', 'Often; targets set for priority projects but not all.', 'Occasionally; targets are informal or loosely defined.', 'Never set emissions reduction targets in R&D.', '• Regenerative Thinking\n• Future Orientation\n• Impact Awareness');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Decarbonisation', 14, 'How familiar are you with renewable materials and energy-efficient design methods?', 'Very familiar; I specify renewable feedstocks, low-carbon polymers, and efficient manufacturing techniques (e.g., additive manufacturing to reduce waste).', 'Some familiarity; I have used renewable or efficient options in some projects.', 'Limited awareness; I know basic concepts but lack experience applying them.', 'No awareness of these approaches.', '• Regenerative Thinking\n• Future Orientation\n• Impact Awareness');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Decarbonisation', 15, 'How proactive are you in identifying decarbonisation opportunities in innovation pipelines?', 'Very proactive; I initiate carbon hotspot analyses, engage suppliers on decarbonisation roadmaps, and champion pilots for low-carbon technologies.', 'Somewhat proactive; I respond to opportunities when identified by others.', 'Occasionally proactive; I consider improvements in select cases.', 'Not proactive; I wait for direction from sustainability teams.', '• Regenerative Thinking\n• Future Orientation\n• Impact Awareness');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Risk', 16, 'How aware are you of climate-related risks affecting product development (e.g., resource scarcity, regulatory bans)?', 'Very aware; I assess supply chain and regulatory risks using tools like lifecycle-based risk mapping and horizon scanning reports.', 'Somewhat aware; I monitor risks during project planning but rely on others for detailed analysis.', 'Limited awareness; I only consider risks when issues arise.', 'No awareness of climate-related risks in development.', '• Curiosity Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Risk', 17, 'How confident are you addressing compliance risks for sustainability claims (e.g., greenwashing)?', 'Very confident; I review claims against ISO 14021, EU Green Claims Directive, and consult legal teams before publication.', 'Somewhat confident; I use templates and guidelines but sometimes need extra guidance.', 'Limited confidence; I often defer to compliance colleagues.', 'Not confident; I have not worked on claims compliance.', '• Curiosity Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Risk', 18, 'How integrated are ESG risks in your innovation risk assessments and project reviews?', 'Fully integrated; ESG and climate risks are part of all stage-gate reviews, project charters, and risk registers.', 'Partially integrated; included in priority projects but not consistently tracked.', 'Limited integration; added on an ad hoc basis.', 'Not integrated; ESG risks are not considered.', '• Curiosity Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Risk', 19, 'How prepared are you for ESG regulations affecting product development (e.g., EU Ecodesign, Extended Producer Responsibility)?', 'Fully prepared; we have documented plans and product pipelines aligned to comply with emerging regulations.', 'Somewhat prepared; plans are in development but not finalized.', 'Limited preparation; awareness exists but no action yet.', 'Not prepared; no plans in place.', '• Curiosity Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Risk', 20, 'How often do you assess potential liabilities related to sustainability in innovation projects?', 'Regularly; I conduct risk assessments in partnership with legal and compliance teams during early design stages.', 'Occasionally; I participate in assessments when required.', 'Rarely; liabilities are assessed late or reactively.', 'Never; liabilities are not considered in R&D.', '• Curiosity Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Circular Practices', 21, 'How familiar are you with circular design principles (e.g., modularity, design for disassembly, cradle-to-cradle certification)?', 'Very familiar; I embed these principles in product design and validate them through recognized certifications (e.g., Cradle to Cradle Certified).', 'Some familiarity; I use guidelines occasionally but not systematically.', 'Limited awareness; I have read about these concepts but don’t apply them.', 'No awareness of circular design principles.', '• Challenge Acceptance\n• Experimentation Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Circular Practices', 22, 'Do you prioritize circular economy approaches (e.g., reuse, refurbishment) in product development?', 'Always; circularity is embedded in design briefs, material selection, and supplier requirements.', 'Often; considered in major projects and tenders.', 'Occasionally; applied in isolated cases.', 'Never considered in development.', '• Challenge Acceptance\n• Experimentation Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Circular Practices', 23, 'How confident are you embedding circularity into design and innovation processes?', 'Very confident; I have led projects incorporating recycled materials, closed-loop models, and product take-back schemes.', 'Somewhat confident; I have contributed to circular initiatives but not led them.', 'Limited confidence; I rely on experts for guidance.', 'Not confident; I have not worked on circular innovation.', '• Challenge Acceptance\n• Experimentation Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Circular Practices', 24, 'How often do you measure and report on circularity performance (e.g., % recycled content, reuse potential)?', 'Always; circularity metrics are tracked as standard KPIs and included in reports.', 'Occasionally; metrics are collected for key launches.', 'Rarely; metrics are ad hoc.', 'Never measured or reported.', '• Challenge Acceptance\n• Experimentation Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('R&D', 'Circular Practices', 25, 'Do you collaborate with supply chain and partners to advance circular innovation?', 'Regularly; I co-develop circular solutions with suppliers, recyclers, and R&D partners.', 'Occasionally; I engage stakeholders in select projects.', 'Rarely; collaboration is informal or limited.', 'Never; I do not engage on circular initiatives.', '• Challenge Acceptance\n• Experimentation Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Climate Fluency', 1, 'How well do you understand the environmental impact of marketing activities (e.g., digital advertising, print media, events)?', 'Deep understanding; I quantify impacts using tools like AdGreen and apply carbon budgets to all campaigns.', 'Good understanding; I consider impacts for major campaigns but don''t quantify them consistently.', 'Basic awareness; I recognise marketing has environmental impacts but haven''t assessed them in detail.', 'Limited awareness; I haven''t considered the environmental footprint of marketing activities.', '• Green Storytelling\n• Anti-Greenwashing\n• Sustainable Campaigns');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Climate Fluency', 2, 'How confident are you communicating your organisation''s sustainability story without overstating claims?', 'Very confident; I follow CMA Green Claims Code and substantiate every claim with verified data.', 'Fairly confident; I review claims for accuracy but don''t always reference formal standards.', 'Somewhat confident; I try to be honest but sometimes lack the data to back up claims.', 'Not confident; I''m unsure how to communicate sustainability without risking greenwashing.', '• Green Storytelling\n• Anti-Greenwashing\n• Sustainable Campaigns');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Climate Fluency', 3, 'How familiar are you with sustainability frameworks relevant to marketing (e.g., CMA Green Claims Code, EU Green Claims Directive)?', 'Very familiar; I apply these frameworks to campaign sign-off processes and train team members on them.', 'Familiar; I''ve read the key guidelines and reference them for major campaigns.', 'Somewhat familiar; I''ve heard of them but haven''t applied them directly.', 'Not familiar; I''m not aware of specific sustainability marketing frameworks.', '• Green Storytelling\n• Anti-Greenwashing\n• Sustainable Campaigns');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Climate Fluency', 4, 'How often do you engage your team on the connection between marketing decisions and climate outcomes?', 'Regularly; I lead briefings on sustainable marketing and embed climate literacy into team development.', 'Sometimes; I raise sustainability in team meetings but don''t have a structured approach.', 'Rarely; I mention it occasionally but it''s not part of regular team discussions.', 'Never; sustainability isn''t part of our team conversations.', '• Green Storytelling\n• Anti-Greenwashing\n• Sustainable Campaigns');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Climate Fluency', 5, 'How proactive are you in identifying opportunities to reduce the environmental footprint of campaigns and channels?', 'Very proactive; I actively seek low-carbon alternatives for media buying, production, and distribution.', 'Fairly proactive; I consider greener options when they''re available but don''t always seek them out.', 'Somewhat; I''d choose a greener option if presented but don''t actively look for them.', 'Not proactive; environmental footprint isn''t a factor in my campaign planning.', '• Green Storytelling\n• Anti-Greenwashing\n• Sustainable Campaigns');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Data & AI', 6, 'How integrated is ESG data in your marketing analytics and performance dashboards?', 'Fully integrated; I use real-time dashboards combining engagement metrics, lifecycle emissions (Scope3.io), and circularity KPIs.', 'Partially integrated; ESG data is tracked in separate reports.', 'Limited integration; only basic ESG data included occasionally.', 'Not integrated; no ESG metrics tracked.', '• Sustainability Storytelling\n• Behavioural Insights\n• Circular Promotion');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Data & AI', 7, 'How confident are you using data to measure sustainability performance of campaigns?', 'Very confident; I regularly use carbon calculators, WFA Planet Pledge templates, and third-party verification tools to inform decisions.', 'Somewhat confident; I interpret data with occasional support.', 'Limited confidence; I rarely use ESG data in planning.', 'Not confident; I don’t measure sustainability performance.', '• Sustainability Storytelling\n• Behavioural Insights\n• Circular Promotion');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Data & AI', 8, 'How familiar are you with AI tools to optimize low-carbon marketing (e.g., dynamic targeting, resource allocation)?', 'Very familiar; I apply AI tools to reduce media wastage, optimize delivery emissions, and track impact.', 'Some familiarity; I have explored pilots but haven’t scaled them.', 'Limited awareness; I know basic concepts.', 'No awareness of AI applications in this area.', '• Sustainability Storytelling\n• Behavioural Insights\n• Circular Promotion');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Data & AI', 9, 'How often do you validate the accuracy of ESG data for campaigns and reporting?', 'Always; I ensure data is verified by internal audit or independent assurance providers.', 'Often; validated for major campaigns only.', 'Occasionally; spot-checked without formal process.', 'Never; no validation conducted.', '• Sustainability Storytelling\n• Behavioural Insights\n• Circular Promotion');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Data & AI', 10, 'Do you collaborate with analytics and data teams to improve ESG data quality in marketing?', 'Regularly; I co-develop metrics, dashboards, and methodologies for campaign reporting.', 'Occasionally collaborate to align definitions and tools.', 'Rarely collaborate; minimal coordination.', 'Never collaborate.', '• Sustainability Storytelling\n• Behavioural Insights\n• Circular Promotion');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Decarbonisation', 11, 'How often do you consider and measure the carbon footprint of campaigns and channels?', 'Always; I use tools like AdGreen Carbon Calculator and Scope3.io to quantify emissions in every project.', 'Often; I measure emissions for key campaigns but not systematically.', 'Occasionally; estimates are made without verification.', 'Never considered or measured.', '• Authentic Messaging\n• Honesty in Claims\n• Social Responsibility');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Decarbonisation', 12, 'How familiar are you with low-carbon event and campaign design practices (e.g., ISO 20121, hybrid events)?', 'Very familiar; I apply ISO 20121 standards and track emissions reductions for each event.', 'Some familiarity; I have used sustainable design guidelines occasionally.', 'Limited awareness; I know some concepts.', 'No awareness.', '• Authentic Messaging\n• Honesty in Claims\n• Social Responsibility');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Decarbonisation', 13, 'Do you set specific, quantified emissions reduction targets for marketing activities?', 'Always; annual emissions reduction targets are documented and aligned with Ad Net Zero commitments.', 'Often; informal targets set for priority projects.', 'Occasionally; general aspirations stated but no tracking.', 'Never set targets.', '• Authentic Messaging\n• Honesty in Claims\n• Social Responsibility');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Decarbonisation', 14, 'How confident are you leading low-carbon initiatives (e.g., sustainable media buying, supplier engagement)?', 'Very confident; I lead initiatives to decarbonise media plans, work with suppliers, and embed targets in contracts.', 'Somewhat confident; I contribute to projects led by others.', 'Limited confidence; I rely on sustainability colleagues.', 'Not confident.', '• Authentic Messaging\n• Honesty in Claims\n• Social Responsibility');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Decarbonisation', 15, 'How often do you measure lifecycle emissions of marketing materials (print, digital, OOH)?', 'Always; cradle-to-grave emissions quantified and reported for all campaigns.', 'Sometimes; measured for major campaigns only.', 'Rarely; estimates used without validation.', 'Never measured or reported.', '• Authentic Messaging\n• Honesty in Claims\n• Social Responsibility');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Risk', 16, 'How aware are you of reputational risks from inaccurate sustainability claims and greenwashing?', 'Very aware; I conduct detailed reviews of all claims against the CMA Green Claims Code, ISO 14021, and EU Green Claims Directive, and flag risks in campaign plans.', 'Somewhat aware; I consider reputational risks in campaign approvals but rely on compliance colleagues for detailed checks.', 'Limited awareness; I only think about risks when prompted by others.', 'No awareness; I have not assessed these risks.', '• Customer Centricity');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Risk', 17, 'How confident are you managing compliance with sustainability marketing regulations?', 'Very confident; I lead compliance processes, apply the CMA and ISO standards, and ensure all campaigns are legally reviewed before launch.', 'Somewhat confident; I follow guidelines and templates but occasionally need advice.', 'Limited confidence; I defer most decisions to legal teams.', 'Not confident; I do not manage compliance.', '• Customer Centricity');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Risk', 18, 'How integrated are ESG risks in your marketing risk assessments and approvals?', 'Fully integrated; ESG risks are documented in risk registers, evaluated during pre-launch reviews, and included in mitigation plans.', 'Partially integrated; ESG risks are considered for high-profile or regulated campaigns.', 'Limited integration; ESG risks are addressed on an ad hoc basis.', 'Not integrated; ESG risks are not part of risk assessments.', '• Customer Centricity');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Risk', 19, 'How prepared are you for upcoming regulations affecting sustainability communications (e.g., Digital Services Act, EU Green Claims Directive)?', 'Fully prepared; we have documented policies, scenario plans, and training for upcoming regulations.', 'Somewhat prepared; draft plans and guidance are under development.', 'Limited preparation; we are aware of changes but have no plans in place.', 'Not prepared; no action taken.', '• Customer Centricity');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Risk', 20, 'How often do you review compliance and accuracy of sustainability claims?', 'Every campaign undergoes a documented compliance review with legal and marketing sign-off, using checklists aligned to the CMA Green Claims Code.', 'Often reviewed for campaigns over a certain budget or impact threshold.', 'Occasionally reviewed; no consistent process.', 'Never reviewed or documented.', '• Customer Centricity');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Circular Practices', 21, 'How familiar are you with circular approaches in marketing (e.g., reusable displays, recycled materials, modular signage)?', 'Very familiar; I embed circular design principles from Ellen MacArthur Foundation and ISO 14021 into all campaigns.', 'Some familiarity; I consider circularity for priority projects but not consistently.', 'Limited awareness; I know general concepts but lack detail.', 'No awareness of circular approaches.', '• Openness to Feedback\n• Learning Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Circular Practices', 22, 'Do you prioritize low-impact and circular materials in campaign production and procurement?', 'Always; specifications require use of recycled content, modular assets, and materials with certified end-of-life recovery.', 'Often; we request sustainable options but accept conventional if needed.', 'Occasionally considered; depends on project requirements.', 'Never considered or requested.', '• Openness to Feedback\n• Learning Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Circular Practices', 23, 'How confident are you communicating circular economy benefits to customers and stakeholders?', 'Very confident; I develop messaging in compliance with ISO 14021 and use verified claims (e.g., % recycled content, recyclability).', 'Somewhat confident; I include claims when supported by suppliers.', 'Limited confidence; I need help to frame claims accurately.', 'Not confident; I avoid discussing circular benefits.', '• Openness to Feedback\n• Learning Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Circular Practices', 24, 'How often do you measure and report the circularity performance of marketing initiatives (e.g., reuse rates, recycling outcomes)?', 'Always; metrics like % reusable materials and post-campaign recovery rates are tracked and reported in ESG disclosures.', 'Sometimes measured for high-profile or large-scale campaigns.', 'Rarely; informal estimates shared when requested.', 'Never measured or reported.', '• Openness to Feedback\n• Learning Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Marketing', 'Circular Practices', 25, 'Do you collaborate with suppliers and production partners to advance circular solutions in marketing?', 'Regularly; I co-create pilots, set targets for recycled content, and review supplier progress quarterly.', 'Occasionally; I engage suppliers on specific projects.', 'Rarely; ad hoc discussions only.', 'Never; I do not engage suppliers on circular topics.', '• Openness to Feedback\n• Learning Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Climate Fluency', 1, 'How well do you understand the environmental impact of IT operations (e.g., data centers, device lifecycle)?', 'Deep understanding; I apply GHG Protocol ICT sector guidance, measure emissions across data centers, networks, and end-user devices, and track Scope 2 and Scope 3 impacts.', 'Good understanding of primary impact areas (energy, e-waste) but limited experience quantifying them comprehensively.', 'Limited awareness; I know energy use is significant but lack lifecycle knowledge.', 'No awareness of environmental impacts related to IT.', '• Green Software Design\n• Cloud Efficiency\n• Data Footprint Reduction');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Climate Fluency', 2, 'How confident are you explaining IT’s role in the organization’s decarbonisation strategy?', 'Very confident; I regularly brief leadership on IT’s contributions to SBTi targets, cloud decarbonisation, and renewable procurement.', 'Somewhat confident; I can explain main points but need help with technical detail.', 'Limited confidence; I only discuss when asked.', 'Not confident.', '• Green Software Design\n• Cloud Efficiency\n• Data Footprint Reduction');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Climate Fluency', 3, 'How often do you engage your team on digital sustainability topics (e.g., green cloud, energy-efficient coding)?', 'Regularly; sustainability KPIs, training, and objectives are built into team goals.', 'Occasionally; we discuss in team meetings or projects.', 'Rarely; only when prompted by external teams.', 'Never discussed sustainability topics.', '• Green Software Design\n• Cloud Efficiency\n• Data Footprint Reduction');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Climate Fluency', 4, 'How familiar are you with standards like ISO 50001 (energy), BREEAM (data centers), and Energy Star (hardware)?', 'Very familiar; I use these standards in design, procurement, and reporting decisions.', 'Some familiarity; I reference standards but don’t apply them consistently.', 'Limited awareness; I’ve heard of them but never used them.', 'No awareness.', '• Green Software Design\n• Cloud Efficiency\n• Data Footprint Reduction');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Climate Fluency', 5, 'Do you consider climate impacts when planning IT investments (e.g., hardware refresh, cloud migration)?', 'Always; lifecycle carbon impacts, energy efficiency, and end-of-life considerations are factored into business cases.', 'Often considered in major procurements.', 'Occasionally considered informally.', 'Never considered.', '• Green Software Design\n• Cloud Efficiency\n• Data Footprint Reduction');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Data & AI', 6, 'How advanced are your systems to track emissions and energy use in IT operations?', 'Fully integrated; real-time monitoring with tools like DCIM software, ISO 50001-compliant reporting, and Scope 2/3 dashboards.', 'Partially integrated; some manual tracking and separate spreadsheets.', 'Basic tracking; limited or estimated data.', 'No tracking systems.', '• ESG Data Management\n• AI Ethics Knowledge\n• Cyber-ESG Risk');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Data & AI', 7, 'How confident are you using ESG data to guide IT decisions (e.g., vendor selection, infrastructure optimization)?', 'Very confident; I integrate ESG data into procurement scoring, asset management, and cloud strategies.', 'Somewhat confident; I use ESG criteria in some decisions.', 'Limited confidence; I rely on sustainability teams.', 'Not confident.', '• ESG Data Management\n• AI Ethics Knowledge\n• Cyber-ESG Risk');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Data & AI', 8, 'How familiar are you with AI tools for optimizing energy and emissions (e.g., workload scheduling, predictive cooling)?', 'Very familiar; I lead projects implementing AI-based optimization (e.g., carbon-aware scheduling, dynamic cooling).', 'Some familiarity; I have piloted tools in specific contexts.', 'Limited awareness; I have read about options.', 'No awareness.', '• ESG Data Management\n• AI Ethics Knowledge\n• Cyber-ESG Risk');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Data & AI', 9, 'How often do you validate ESG data accuracy for IT reporting?', 'Regularly; internal audits and third-party assurance validate data before disclosure.', 'Occasionally; validations conducted for large reports.', 'Rarely; data assumed accurate.', 'Never validated ESG data.', '• ESG Data Management\n• AI Ethics Knowledge\n• Cyber-ESG Risk');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Data & AI', 10, 'Do you collaborate with data, finance, and sustainability teams to improve ESG metrics for IT?', 'Regularly; I co-create metrics, dashboards, and data pipelines.', 'Occasionally collaborate on shared reports.', 'Rarely collaborate.', 'Never collaborate.', '• ESG Data Management\n• AI Ethics Knowledge\n• Cyber-ESG Risk');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Decarbonisation', 11, 'How aligned is IT strategy with decarbonisation targets (e.g., renewable energy, Scope 2 and Scope 3 reduction)?', 'Fully aligned; roadmaps include renewable energy procurement, green software design, and carbon-neutral cloud strategies.', 'Partially aligned; initiatives cover priority areas but lack full scope.', 'Limited alignment; efforts are reactive and project-based.', 'Not aligned.', '• Digital Responsibility\n• Transparency Culture\n• Privacy Respect');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Decarbonisation', 12, 'How confident are you implementing low-carbon IT practices (e.g., efficient coding, green hosting)?', 'Very confident; I lead initiatives including energy-efficient architecture reviews, cloud decarbonisation, and hardware reuse programs.', 'Somewhat confident; I contribute to decarbonisation efforts but don’t lead them.', 'Limited confidence; I defer to sustainability teams.', 'Not confident.', '• Digital Responsibility\n• Transparency Culture\n• Privacy Respect');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Decarbonisation', 13, 'Do you set quantified emissions reduction targets for IT operations?', 'Always; annual targets aligned to SBTi tracked via ISO 14064 frameworks.', 'Often; targets set for data centers or cloud contracts.', 'Occasionally; informal goals only.', 'Never set targets.', '• Digital Responsibility\n• Transparency Culture\n• Privacy Respect');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Decarbonisation', 14, 'How familiar are you with renewable sourcing and energy-efficient hardware practices (e.g., Energy Star, TCO Certified)?', 'Very familiar; I specify certified hardware and renewable sourcing in all contracts.', 'Some familiarity; I consider them selectively.', 'Limited awareness.', 'No awareness.', '• Digital Responsibility\n• Transparency Culture\n• Privacy Respect');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Decarbonisation', 15, 'How proactive are you identifying decarbonisation opportunities in IT?', 'Very proactive; I lead audits, carbon hotspot analyses, and supplier engagement.', 'Somewhat proactive; I contribute when opportunities arise.', 'Occasionally proactive.', 'Not proactive.', '• Digital Responsibility\n• Transparency Culture\n• Privacy Respect');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Risk', 16, 'How aware are you of ESG risks in IT (e.g., regulatory non-compliance, reputational damage)?', 'Very aware; I track risks in IT risk registers, referencing CSRD and EU Taxonomy criteria.', 'Somewhat aware; risks are reviewed annually.', 'Limited awareness.', 'No awareness.', '• Innovation Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Risk', 17, 'How confident are you managing compliance with digital sustainability regulations (e.g., EU Taxonomy, CSRD)?', 'Very confident; I oversee compliance plans and prepare disclosures.', 'Somewhat confident; I participate in compliance reviews.', 'Limited confidence; I defer to legal.', 'Not confident.', '• Innovation Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Risk', 18, 'How integrated are ESG risks in IT risk registers and governance processes?', 'Fully integrated; risks reviewed quarterly, with mitigation plans documented.', 'Partially integrated in major programs.', 'Limited integration.', 'Not integrated.', '• Innovation Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Risk', 19, 'How prepared are you for evolving sustainability regulations (e.g., data center disclosures, energy performance)?', 'Fully prepared; documented policies, training, and audit trails in place.', 'Somewhat prepared; draft policies underway.', 'Limited preparation.', 'Not prepared.', '• Innovation Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Risk', 20, 'How often do you review ESG risk mitigation plans?', 'Regularly; plans reviewed every quarter with cross-functional teams.', 'Occasionally reviewed.', 'Rarely reviewed.', 'Never reviewed.', '• Innovation Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Circular Practices', 21, 'How familiar are you with circular IT practices (e.g., reuse, refurbishment, recycling)?', 'Very familiar; I apply principles from ISO 20400 and track performance with suppliers.', 'Some familiarity; I integrate them in some projects.', 'Limited awareness.', 'No awareness.', '• Problem Solving\n• Adaptive Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Circular Practices', 22, 'Do you prioritize refurbished and circular equipment in procurement?', 'Always; policies mandate minimum recycled content and refurb options.', 'Often prioritized where available.', 'Occasionally considered.', 'Never considered.', '• Problem Solving\n• Adaptive Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Circular Practices', 23, 'How confident are you embedding circularity in IT operations (e.g., take-back programs)?', 'Very confident; I lead circular asset programs and supplier partnerships.', 'Somewhat confident; I participate in initiatives.', 'Limited confidence.', 'Not confident.', '• Problem Solving\n• Adaptive Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Circular Practices', 24, 'How often do you measure circularity metrics (e.g., reuse, recycling rates)?', 'Always measured and included in ESG reports.', 'Sometimes measured.', 'Rarely measured.', 'Never measured.', '• Problem Solving\n• Adaptive Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('IT', 'Circular Practices', 25, 'Do you collaborate with suppliers to improve IT circularity?', 'Regularly; I set targets, monitor progress, and co-develop solutions.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• Problem Solving\n• Adaptive Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Climate Fluency', 1, 'How familiar are you with climate-related legal obligations and regulations (e.g., CSRD, CSDDD, TCFD)?', 'Very familiar; I interpret, apply, and update policies to comply with these regulations.', 'Some familiarity; I reference them in reviews but need support for complex details.', 'Limited awareness; I’ve read about them but don’t use them consistently.', 'No awareness of climate obligations.', '• ESG Contract Clauses\n• Greenwashing Defense\n• Circular Policy Drafting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Climate Fluency', 2, 'How confident are you advising the business on compliance with climate disclosure and reporting requirements?', 'Very confident; I prepare disclosures, train teams, and review statements.', 'Somewhat confident; I participate in reviews but don’t lead them.', 'Limited confidence; I defer to external advisors.', 'Not confident.', '• ESG Contract Clauses\n• Greenwashing Defense\n• Circular Policy Drafting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Climate Fluency', 3, 'How often do you monitor emerging climate-related regulations and standards?', 'Always; I maintain horizon-scanning processes and share regular updates.', 'Often; I track updates quarterly.', 'Occasionally; I review when requested.', 'Never monitored.', '• ESG Contract Clauses\n• Greenwashing Defense\n• Circular Policy Drafting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Climate Fluency', 4, 'How well do you understand the legal risks of failing to meet decarbonisation or ESG targets?', 'Deep understanding; I advise on litigation, penalties, and contractual liabilities.', 'Good understanding; I know major risks but lack detailed expertise.', 'Limited awareness; I rely on compliance teams.', 'No awareness.', '• ESG Contract Clauses\n• Greenwashing Defense\n• Circular Policy Drafting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Climate Fluency', 5, 'How proactive are you embedding climate considerations into policies, contracts, and disclosures?', 'Very proactive; I draft templates and integrate climate clauses systematically.', 'Somewhat proactive; I contribute when prompted.', 'Occasionally proactive; I react to external requests.', 'Not proactive.', '• ESG Contract Clauses\n• Greenwashing Defense\n• Circular Policy Drafting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Data & AI', 6, 'How confident are you reviewing ESG data accuracy and integrity in disclosures?', 'Very confident; I validate ESG data, conduct compliance reviews, and ensure audit trails.', 'Somewhat confident; I participate in reviews with guidance.', 'Limited confidence; I rely on sustainability teams.', 'Not confident.', '• Environmental Regulations\n• Climate Disclosure Rules\n• Due Diligence Law');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Data & AI', 7, 'How often do you collaborate with sustainability and finance teams on ESG reporting compliance?', 'Regularly; I co-develop disclosures and review reports.', 'Occasionally collaborate on key disclosures.', 'Rarely collaborate.', 'Never collaborate.', '• Environmental Regulations\n• Climate Disclosure Rules\n• Due Diligence Law');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Data & AI', 8, 'How familiar are you with digital tools for tracking ESG regulations and compliance (e.g., regulatory horizon scanning platforms)?', 'Very familiar; I use tools like LexisNexis, Diligent ESG, and Thomson Reuters for monitoring.', 'Some familiarity; I use tools occasionally.', 'Limited awareness.', 'No awareness.', '• Environmental Regulations\n• Climate Disclosure Rules\n• Due Diligence Law');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Data & AI', 9, 'How integrated is ESG data validation in your legal compliance processes?', 'Fully integrated; data reviews are mandatory for approvals.', 'Partially integrated in high-risk areas.', 'Limited integration; ad hoc checks.', 'Not integrated.', '• Environmental Regulations\n• Climate Disclosure Rules\n• Due Diligence Law');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Data & AI', 10, 'Do you assess AI-related risks in sustainability reporting and compliance?', 'Always; I lead reviews of AI model transparency and auditability.', 'Often; I participate in assessments.', 'Occasionally; I review when flagged.', 'Never assessed AI risks.', '• Environmental Regulations\n• Climate Disclosure Rules\n• Due Diligence Law');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Decarbonisation', 11, 'How often do you review contracts and agreements for decarbonisation obligations (e.g., carbon reduction targets, supplier commitments)?', 'Always; decarbonisation clauses included in all relevant contracts.', 'Often reviewed for priority contracts.', 'Occasionally reviewed.', 'Never reviewed.', '• Fairness Focus\n• Compliance Ethos\n• Justice Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Decarbonisation', 12, 'How familiar are you with contractual structures supporting low-carbon solutions (e.g., sustainability-linked contracts)?', 'Very familiar; I draft and negotiate low-carbon performance obligations.', 'Some familiarity; I contribute to negotiations.', 'Limited awareness.', 'No awareness.', '• Fairness Focus\n• Compliance Ethos\n• Justice Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Decarbonisation', 13, 'Do you proactively integrate decarbonisation commitments in legal templates and policies?', 'Always; standard templates include decarbonisation obligations.', 'Often; clauses added where relevant.', 'Occasionally; added upon request.', 'Never integrated.', '• Fairness Focus\n• Compliance Ethos\n• Justice Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Decarbonisation', 14, 'How confident are you managing legal risks related to decarbonisation failures?', 'Very confident; I develop mitigation plans and advise executives.', 'Somewhat confident; I participate in discussions.', 'Limited confidence.', 'Not confident.', '• Fairness Focus\n• Compliance Ethos\n• Justice Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Decarbonisation', 15, 'How often do you assess potential liabilities arising from decarbonisation non-compliance?', 'Always; liabilities reviewed and documented in risk registers.', 'Often assessed.', 'Occasionally assessed.', 'Never assessed.', '• Fairness Focus\n• Compliance Ethos\n• Justice Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Risk', 16, 'How integrated are ESG risks in your legal risk registers and governance frameworks?', 'Fully integrated; ESG risks reviewed quarterly and linked to enterprise governance.', 'Partially integrated in selected areas.', 'Limited integration.', 'Not integrated.', '• Integrity Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Risk', 17, 'How confident are you advising on reputational risks linked to sustainability and greenwashing?', 'Very confident; I lead reviews aligned to ISO 14021 and CMA Green Claims Code.', 'Somewhat confident; I contribute to reviews.', 'Limited confidence.', 'Not confident.', '• Integrity Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Risk', 18, 'How prepared are you for litigation or regulatory action over ESG performance?', 'Fully prepared; response plans and legal strategies in place.', 'Somewhat prepared; draft plans developed.', 'Limited preparation.', 'Not prepared.', '• Integrity Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Risk', 19, 'How often do you review compliance with evolving ESG regulations (e.g., EU Green Claims Directive)?', 'Always; compliance reviewed quarterly and embedded in controls.', 'Often reviewed.', 'Occasionally reviewed.', 'Never reviewed.', '• Integrity Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Risk', 20, 'How aware are you of potential penalties and liabilities for non-compliance with ESG regulations?', 'Very aware; I maintain an updated compliance register.', 'Somewhat aware.', 'Limited awareness.', 'No awareness.', '• Integrity Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Circular Practices', 21, 'How familiar are you with legal considerations in circular economy models (e.g., warranties, liability)?', 'Very familiar; I draft contracts supporting take-back schemes and extended producer responsibility.', 'Some familiarity; I advise when required.', 'Limited awareness.', 'No awareness.', '• Risk Awareness\n• Critical Analysis');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Circular Practices', 22, 'Do you prioritize circular economy requirements in supplier agreements and procurement templates?', 'Always; circular clauses included in all templates.', 'Often; included when relevant.', 'Occasionally; added case by case.', 'Never included.', '• Risk Awareness\n• Critical Analysis');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Circular Practices', 23, 'How confident are you advising on compliance with circular economy regulations (e.g., WEEE Directive)?', 'Very confident; I interpret regulations and train teams.', 'Somewhat confident; I advise with support.', 'Limited confidence.', 'Not confident.', '• Risk Awareness\n• Critical Analysis');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Circular Practices', 24, 'How often do you review contracts for circularity obligations (e.g., reuse, refurbishment)?', 'Always; every contract reviewed for alignment.', 'Often reviewed.', 'Occasionally reviewed.', 'Never reviewed.', '• Risk Awareness\n• Critical Analysis');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Legal', 'Circular Practices', 25, 'Do you collaborate with procurement and operations teams to embed circularity into contracts?', 'Regularly; I co-develop standard clauses and monitor compliance.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• Risk Awareness\n• Critical Analysis');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Climate Fluency', 1, 'How familiar are you with climate-related supply chain risks (e.g., emissions hotspots, resource scarcity)?', 'Very familiar; I conduct Scope 3 hotspot mapping using GHG Protocol, CDP Supply Chain, and engage suppliers to quantify risks.', 'Some familiarity; I understand key emissions drivers but need guidance for detailed analysis.', 'Limited awareness; I rely on sustainability teams for assessments.', 'No awareness of climate-related risks.', '• Carbon Hotspot Mapping\n• Low-Emission Transport\n• Circular Inventory');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Climate Fluency', 2, 'How confident are you explaining climate risks and expectations to suppliers?', 'Very confident; I lead supplier workshops, develop engagement plans, and translate requirements into contractual language.', 'Somewhat confident; I communicate expectations during major procurement cycles.', 'Limited confidence; I defer to colleagues for supplier engagement.', 'Not confident.', '• Carbon Hotspot Mapping\n• Low-Emission Transport\n• Circular Inventory');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Climate Fluency', 3, 'How often do you engage suppliers on decarbonisation and climate targets?', 'Regularly; I co-develop decarbonisation roadmaps and track progress quarterly.', 'Occasionally; engagement occurs during contract renewals or audits.', 'Rarely; only when compliance requires it.', 'Never engage.', '• Carbon Hotspot Mapping\n• Low-Emission Transport\n• Circular Inventory');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Climate Fluency', 4, 'How familiar are you with standards like ISO 20400, SBTi Supplier Engagement Guidance, and GRI 308?', 'Very familiar; I embed these standards in sourcing processes and supplier evaluation.', 'Some familiarity; I reference them as needed.', 'Limited awareness; I’ve read about them but don’t apply them.', 'No awareness.', '• Carbon Hotspot Mapping\n• Low-Emission Transport\n• Circular Inventory');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Climate Fluency', 5, 'Do you integrate climate considerations into sourcing and category strategies?', 'Always; climate impacts and emissions reductions are weighted as core criteria in supplier selection.', 'Often; considered in high-impact categories.', 'Occasionally; evaluated reactively.', 'Never considered.', '• Carbon Hotspot Mapping\n• Low-Emission Transport\n• Circular Inventory');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Data & AI', 6, 'How advanced are your systems to track emissions and supplier sustainability performance?', 'Fully integrated; I use Scope 3 dashboards, lifecycle analysis platforms (e.g., EcoVadis, CDP), and automated data pipelines.', 'Partially integrated; data compiled manually for key suppliers.', 'Basic tracking; limited coverage and accuracy.', 'No tracking in place.', '• Circular Logistics\n• Scope 3 Visibility\n• Climate Risk Planning');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Data & AI', 7, 'How confident are you using ESG data to evaluate and manage supplier risks?', 'Very confident; I integrate ESG metrics into supplier scorecards, risk registers, and sourcing decisions.', 'Somewhat confident; I review data during procurement.', 'Limited confidence; I rely on others for interpretation.', 'Not confident.', '• Circular Logistics\n• Scope 3 Visibility\n• Climate Risk Planning');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Data & AI', 8, 'How familiar are you with AI tools for emissions forecasting and supply chain risk modeling?', 'Very familiar; I pilot AI solutions for predictive emissions modeling and scenario analysis.', 'Some familiarity; I’ve explored tools but not scaled them.', 'Limited awareness.', 'No awareness.', '• Circular Logistics\n• Scope 3 Visibility\n• Climate Risk Planning');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Data & AI', 9, 'How often do you validate supplier ESG data accuracy and completeness?', 'Always; data verified through audits, third-party assurance, and traceability documentation.', 'Often; validations conducted for strategic suppliers.', 'Rarely; spot-checked without formal process.', 'Never validated.', '• Circular Logistics\n• Scope 3 Visibility\n• Climate Risk Planning');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Data & AI', 10, 'Do you collaborate with procurement, sustainability, and finance teams to improve ESG data?', 'Regularly; I co-develop supplier questionnaires and reporting frameworks.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• Circular Logistics\n• Scope 3 Visibility\n• Climate Risk Planning');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Decarbonisation', 11, 'How aligned is your supply chain strategy with decarbonisation targets (e.g., SBTi, net zero commitments)?', 'Fully aligned; decarbonisation targets cascaded to suppliers with contractual KPIs.', 'Partially aligned; commitments documented for priority suppliers.', 'Limited alignment; addressed on an ad hoc basis.', 'Not aligned.', '• Responsible Sourcing\n• Resource Stewardship\n• Fair Trade Values');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Decarbonisation', 12, 'How confident are you supporting suppliers to reduce emissions and implement low-carbon solutions?', 'Very confident; I lead decarbonisation capability-building programs and monitor supplier progress.', 'Somewhat confident; I engage suppliers periodically.', 'Limited confidence; I rely on others to lead.', 'Not confident.', '• Responsible Sourcing\n• Resource Stewardship\n• Fair Trade Values');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Decarbonisation', 13, 'Do you embed emissions reduction requirements in supplier contracts and tenders?', 'Always; decarbonisation obligations and reporting clauses are standard.', 'Often; included for high-value contracts.', 'Occasionally; included case by case.', 'Never included.', '• Responsible Sourcing\n• Resource Stewardship\n• Fair Trade Values');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Decarbonisation', 14, 'How familiar are you with low-carbon sourcing practices (e.g., renewable materials, sustainable logistics)?', 'Very familiar; I incorporate low-carbon sourcing in strategies and contracts.', 'Some familiarity; considered for selected categories.', 'Limited awareness.', 'No awareness.', '• Responsible Sourcing\n• Resource Stewardship\n• Fair Trade Values');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Decarbonisation', 15, 'How proactive are you in identifying decarbonisation opportunities with suppliers?', 'Very proactive; I conduct annual reviews and initiate collaborative pilots.', 'Somewhat proactive; I contribute when opportunities arise.', 'Occasionally proactive.', 'Not proactive.', '• Responsible Sourcing\n• Resource Stewardship\n• Fair Trade Values');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Risk', 16, 'How aware are you of ESG compliance risks (e.g., deforestation, human rights, environmental breaches)?', 'Very aware; I maintain a compliance register aligned with EU Deforestation Regulation, CSDDD, and Modern Slavery Act.', 'Somewhat aware; risks reviewed in annual audits.', 'Limited awareness.', 'No awareness.', '• Resilience Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Risk', 17, 'How confident are you managing supplier breaches and ESG-related non-compliance?', 'Very confident; I lead corrective actions, legal escalations, and remediation plans.', 'Somewhat confident; I support compliance teams.', 'Limited confidence.', 'Not confident.', '• Resilience Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Risk', 18, 'How integrated are ESG risks in supply chain risk registers and governance processes?', 'Fully integrated; reviewed quarterly and linked to business continuity and procurement governance.', 'Partially integrated for high-risk suppliers.', 'Limited integration.', 'Not integrated.', '• Resilience Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Risk', 19, 'How prepared are you for regulatory changes affecting supply chain sustainability (e.g., CSDDD, CBAM)?', 'Fully prepared; documented processes, supplier engagement, and legal reviews in place.', 'Somewhat prepared; policies in development.', 'Limited preparation.', 'Not prepared.', '• Resilience Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Risk', 20, 'How often do you review mitigation plans for supply chain ESG risks?', 'Regularly; reviews occur quarterly with procurement and compliance teams.', 'Occasionally reviewed.', 'Rarely reviewed.', 'Never reviewed.', '• Resilience Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Circular Practices', 21, 'How familiar are you with circular practices in supply chain management (e.g., reverse logistics, closed-loop models)?', 'Very familiar; I apply ISO 20400 principles and track reuse, refurbishment, and recovery rates.', 'Some familiarity; applied selectively.', 'Limited awareness.', 'No awareness.', '• Partnership Mindset\n• Systems Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Circular Practices', 22, 'Do you prioritize suppliers with strong circular economy capabilities?', 'Always; supplier evaluations include circularity criteria.', 'Often prioritized for relevant categories.', 'Occasionally considered.', 'Never considered.', '• Partnership Mindset\n• Systems Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Circular Practices', 23, 'How confident are you embedding circularity requirements in contracts and procurement policies?', 'Very confident; I draft contractual obligations for take-back, reuse, and material recovery.', 'Somewhat confident; I contribute to negotiations.', 'Limited confidence.', 'Not confident.', '• Partnership Mindset\n• Systems Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Circular Practices', 24, 'How often do you measure and report on circularity performance (e.g., % recycled content, reuse rates)?', 'Always; tracked and reported in ESG disclosures and supplier reviews.', 'Sometimes measured.', 'Rarely measured.', 'Never measured.', '• Partnership Mindset\n• Systems Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Supply Chain', 'Circular Practices', 25, 'Do you collaborate with suppliers to develop circular solutions?', 'Regularly; I co-develop pilots and integrate lessons learned into sourcing strategies.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• Partnership Mindset\n• Systems Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Climate Fluency', 1, 'How familiar are you with climate-related people risks (e.g., health and safety, workforce transitions)?', 'Very familiar; I assess risks using GRI 401, ILO guidelines, and integrate them into workforce plans.', 'Some familiarity; I understand risks in broad terms.', 'Limited awareness; I rely on sustainability teams.', 'No awareness.', '• Green Workforce Planning\n• Sustainable Benefits\n• Net Zero Onboarding');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Climate Fluency', 2, 'How confident are you supporting leaders and employees to understand climate strategy?', 'Very confident; I develop training, policies, and communications about decarbonisation and adaptation.', 'Somewhat confident; I contribute to materials when asked.', 'Limited confidence.', 'Not confident.', '• Green Workforce Planning\n• Sustainable Benefits\n• Net Zero Onboarding');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Climate Fluency', 3, 'How often do you engage employees on climate and sustainability topics (e.g., green skills, values alignment)?', 'Regularly; sustainability is embedded in onboarding, training, and culture programs.', 'Occasionally discussed in specific initiatives.', 'Rarely discussed.', 'Never discussed.', '• Green Workforce Planning\n• Sustainable Benefits\n• Net Zero Onboarding');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Climate Fluency', 4, 'How familiar are you with standards and regulations influencing workforce sustainability (e.g., ISO 30414, EU Social Taxonomy)?', 'Very familiar; I apply them in policy development and reporting.', 'Some familiarity; referenced occasionally.', 'Limited awareness.', 'No awareness.', '• Green Workforce Planning\n• Sustainable Benefits\n• Net Zero Onboarding');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Climate Fluency', 5, 'Do you integrate climate and sustainability into talent strategies and workforce planning?', 'Always; ESG competencies, learning, and incentives are embedded in talent frameworks.', 'Often considered in priority functions.', 'Occasionally considered.', 'Never considered.', '• Green Workforce Planning\n• Sustainable Benefits\n• Net Zero Onboarding');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Data & AI', 6, 'How advanced are your systems to track sustainability training and workforce metrics?', 'Fully integrated; systems track participation, impact, and ESG competencies using HRIS platforms.', 'Partially integrated; tracked manually in some areas.', 'Limited tracking.', 'No tracking.', '• ESG Training Knowledge\n• Climate Policy Awareness\n• Diversity Integration');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Data & AI', 7, 'How confident are you using workforce ESG data to inform people strategy?', 'Very confident; ESG data is embedded in culture, engagement, and development KPIs.', 'Somewhat confident; I use data selectively.', 'Limited confidence.', 'Not confident.', '• ESG Training Knowledge\n• Climate Policy Awareness\n• Diversity Integration');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Data & AI', 8, 'How familiar are you with AI tools for workforce sustainability (e.g., skill gap mapping, climate scenario planning)?', 'Very familiar; I lead pilots using AI for green skills and transition risk modeling.', 'Some familiarity; I’ve explored tools in limited pilots.', 'Limited awareness.', 'No awareness.', '• ESG Training Knowledge\n• Climate Policy Awareness\n• Diversity Integration');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Data & AI', 9, 'How often do you validate ESG workforce data accuracy?', 'Always; validated through audits and assurance processes.', 'Sometimes validated for annual reports.', 'Rarely validated.', 'Never validated.', '• ESG Training Knowledge\n• Climate Policy Awareness\n• Diversity Integration');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Data & AI', 10, 'Do you collaborate with sustainability and finance teams to improve ESG reporting?', 'Regularly; I co-develop metrics and reporting frameworks.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• ESG Training Knowledge\n• Climate Policy Awareness\n• Diversity Integration');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Decarbonisation', 11, 'How aligned is HR strategy with decarbonisation and Just Transition principles?', 'Fully aligned; reskilling, workforce planning, and incentives reflect net zero commitments.', 'Partially aligned; considered in selected programs.', 'Limited alignment; ad hoc efforts only.', 'Not aligned.', '• Inclusion Commitment\n• Purpose Driven\n• Wellbeing Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Decarbonisation', 12, 'How confident are you designing learning programs for decarbonisation skills?', 'Very confident; I lead design and delivery of green skills and climate literacy programs.', 'Somewhat confident; I contribute to content.', 'Limited confidence.', 'Not confident.', '• Inclusion Commitment\n• Purpose Driven\n• Wellbeing Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Decarbonisation', 13, 'Do you embed decarbonisation goals into reward and recognition systems?', 'Always; ESG targets influence incentives and performance management.', 'Often; applied to senior roles.', 'Occasionally; informal recognition only.', 'Never embedded.', '• Inclusion Commitment\n• Purpose Driven\n• Wellbeing Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Decarbonisation', 14, 'How familiar are you with frameworks for workforce decarbonisation (e.g., Just Transition guidelines, WBCSD principles)?', 'Very familiar; I reference them in workforce strategy.', 'Some familiarity; I’ve reviewed them.', 'Limited awareness.', 'No awareness.', '• Inclusion Commitment\n• Purpose Driven\n• Wellbeing Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Decarbonisation', 15, 'How proactive are you identifying workforce decarbonisation opportunities?', 'Very proactive; I lead gap analyses and planning.', 'Somewhat proactive.', 'Occasionally proactive.', 'Not proactive.', '• Inclusion Commitment\n• Purpose Driven\n• Wellbeing Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Risk', 16, 'How aware are you of climate-related people risks (e.g., mental health, reskilling risks)?', 'Very aware; risks documented in HR risk registers and mitigation plans.', 'Somewhat aware; considered in strategic planning.', 'Limited awareness.', 'No awareness.', '• Culture Building');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Risk', 17, 'How confident are you managing compliance with workforce sustainability regulations?', 'Very confident; I develop policies aligned to EU Social Taxonomy and local labor laws.', 'Somewhat confident.', 'Limited confidence.', 'Not confident.', '• Culture Building');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Risk', 18, 'How integrated are ESG risks in HR governance and risk registers?', 'Fully integrated; reviewed quarterly.', 'Partially integrated in selected areas.', 'Limited integration.', 'Not integrated.', '• Culture Building');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Risk', 19, 'How prepared are you for regulatory changes affecting workforce sustainability?', 'Fully prepared; documented plans and training in place.', 'Somewhat prepared.', 'Limited preparation.', 'Not prepared.', '• Culture Building');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Risk', 20, 'How often do you review ESG risk mitigation plans?', 'Regularly; reviewed with leadership.', 'Occasionally reviewed.', 'Rarely reviewed.', 'Never reviewed.', '• Culture Building');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Circular Practices', 21, 'How familiar are you with circular economy concepts applied to HR (e.g., circular jobs, workforce upskilling)?', 'Very familiar; I embed principles into job design and talent strategy.', 'Some familiarity.', 'Limited awareness.', 'No awareness.', '• Empathy Orientation\n• Open Communication');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Circular Practices', 22, 'Do you prioritize workforce development for circular economy roles?', 'Always; integrated into skills frameworks and training.', 'Often prioritized.', 'Occasionally considered.', 'Never considered.', '• Empathy Orientation\n• Open Communication');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Circular Practices', 23, 'How confident are you enabling workforce transition to circular economy jobs?', 'Very confident; I lead reskilling and mobility programs.', 'Somewhat confident.', 'Limited confidence.', 'Not confident.', '• Empathy Orientation\n• Open Communication');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Circular Practices', 24, 'How often do you measure progress in workforce circularity capabilities?', 'Always; tracked and reported as part of ESG disclosures.', 'Sometimes measured.', 'Rarely measured.', 'Never measured.', '• Empathy Orientation\n• Open Communication');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('HR', 'Circular Practices', 25, 'Do you collaborate with sustainability teams to build circular capabilities?', 'Regularly; I co-develop training and career pathways.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• Empathy Orientation\n• Open Communication');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Climate Fluency', 1, 'How familiar are you with climate-related financial and operational risks (e.g., TCFD, ISSB, CSRD)?', 'Very familiar; I oversee disclosures, risk assessments, and align strategy to regulatory frameworks.', 'Some familiarity; I review summaries but rely on experts for detail.', 'Limited awareness; I depend fully on sustainability teams.', 'No awareness.', '• ESG Strategy Design\n• Decarbonisation Roadmapping\n• Sustainable Investment');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Climate Fluency', 2, 'How confident are you leading the integration of climate considerations into business strategy?', 'Very confident; I sponsor decarbonisation roadmaps, approve targets, and monitor execution.', 'Somewhat confident; I participate in planning but do not lead.', 'Limited confidence; I engage reactively.', 'Not confident.', '• ESG Strategy Design\n• Decarbonisation Roadmapping\n• Sustainable Investment');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Climate Fluency', 3, 'How often do you engage investors and stakeholders on climate-related performance?', 'Regularly; I lead engagements and disclose progress in alignment with TCFD and ISSB.', 'Occasionally engaged when required.', 'Rarely; only involved when escalated.', 'Never engaged.', '• ESG Strategy Design\n• Decarbonisation Roadmapping\n• Sustainable Investment');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Climate Fluency', 4, 'How familiar are you with climate scenario planning and risk modeling?', 'Very familiar; I integrate scenarios (e.g., 1.5°C pathways) into strategic decisions.', 'Some familiarity; I review outputs periodically.', 'Limited awareness.', 'No awareness.', '• ESG Strategy Design\n• Decarbonisation Roadmapping\n• Sustainable Investment');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Climate Fluency', 5, 'Do you embed climate literacy in board and leadership development?', 'Always; training and climate governance are standard in leadership programs.', 'Often included in select training.', 'Occasionally considered.', 'Never included.', '• ESG Strategy Design\n• Decarbonisation Roadmapping\n• Sustainable Investment');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Data & AI', 6, 'How advanced are your systems for tracking and reporting ESG and climate data?', 'Fully integrated; ESG data embedded in executive dashboards and reviewed quarterly.', 'Partially integrated; tracked in separate reports.', 'Limited integration; only high-level summaries.', 'No systems in place.', '• Climate Governance\n• Regulatory Mastery\n• TCFD Familiarity');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Data & AI', 7, 'How confident are you using ESG data to guide strategic and financial decisions?', 'Very confident; ESG metrics shape capital allocation, M&A, and risk appetite.', 'Somewhat confident; data considered alongside financials.', 'Limited confidence; ESG seen as compliance-only.', 'Not confident.', '• Climate Governance\n• Regulatory Mastery\n• TCFD Familiarity');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Data & AI', 8, 'How familiar are you with AI tools for ESG forecasting and reporting?', 'Very familiar; I oversee pilots using AI to predict climate and regulatory risks.', 'Some familiarity; I am aware but not actively involved.', 'Limited awareness.', 'No awareness.', '• Climate Governance\n• Regulatory Mastery\n• TCFD Familiarity');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Data & AI', 9, 'How often do you validate ESG data accuracy before disclosure?', 'Always; internal audits and external assurance are standard.', 'Often validated in major disclosures.', 'Occasionally reviewed.', 'Never validated.', '• Climate Governance\n• Regulatory Mastery\n• TCFD Familiarity');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Data & AI', 10, 'Do you collaborate with finance, risk, and sustainability teams on ESG data governance?', 'Regularly; I chair steering committees and review metrics.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• Climate Governance\n• Regulatory Mastery\n• TCFD Familiarity');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Decarbonisation', 11, 'How aligned is your corporate strategy with net zero and SBTi targets?', 'Fully aligned; decarbonisation KPIs embedded in business plans and board oversight.', 'Partially aligned; some commitments tracked.', 'Limited alignment; managed reactively.', 'Not aligned.', '• Visionary Leadership\n• Stewardship Values\n• Systemic Responsibility');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Decarbonisation', 12, 'How confident are you approving investments in low-carbon technologies and processes?', 'Very confident; I prioritize funding and track ROI on decarbonisation.', 'Somewhat confident; I approve when proposals are justified.', 'Limited confidence; I rely on others for recommendations.', 'Not confident.', '• Visionary Leadership\n• Stewardship Values\n• Systemic Responsibility');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Decarbonisation', 13, 'Do you set clear emissions reduction targets with accountability at the executive level?', 'Always; targets linked to incentives and board reporting.', 'Often; targets exist but accountability varies.', 'Occasionally; targets aspirational only.', 'Never set targets.', '• Visionary Leadership\n• Stewardship Values\n• Systemic Responsibility');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Decarbonisation', 14, 'How familiar are you with low-carbon transition risks and opportunities in your sector?', 'Very familiar; I assess implications for business models and growth.', 'Some familiarity.', 'Limited awareness.', 'No awareness.', '• Visionary Leadership\n• Stewardship Values\n• Systemic Responsibility');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Decarbonisation', 15, 'How proactive are you identifying decarbonisation initiatives and strategic shifts?', 'Very proactive; I sponsor transformation programs and industry collaborations.', 'Somewhat proactive.', 'Occasionally proactive.', 'Not proactive.', '• Visionary Leadership\n• Stewardship Values\n• Systemic Responsibility');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Risk', 16, 'How aware are you of ESG-related legal, financial, and reputational risks?', 'Very aware; risks embedded in enterprise risk management aligned with CSRD and TCFD.', 'Somewhat aware; reviewed in annual planning.', 'Limited awareness.', 'No awareness.', '• Bold Commitment');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Risk', 17, 'How confident are you overseeing ESG compliance and performance monitoring?', 'Very confident; I lead board discussions and approve controls.', 'Somewhat confident.', 'Limited confidence.', 'Not confident.', '• Bold Commitment');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Risk', 18, 'How integrated are ESG risks in board risk registers and controls?', 'Fully integrated; reviewed quarterly and linked to executive performance.', 'Partially integrated in key areas.', 'Limited integration.', 'Not integrated.', '• Bold Commitment');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Risk', 19, 'How prepared are you for regulatory changes affecting ESG disclosures and performance (e.g., CSRD, ISSB)?', 'Fully prepared; policies, training, and scenarios in place.', 'Somewhat prepared.', 'Limited preparation.', 'Not prepared.', '• Bold Commitment');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Risk', 20, 'How often do you review ESG risk mitigation and progress?', 'Regularly; part of quarterly board reporting.', 'Occasionally reviewed.', 'Rarely reviewed.', 'Never reviewed.', '• Bold Commitment');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Circular Practices', 21, 'How familiar are you with circular economy opportunities and risks in your value chain?', 'Very familiar; I sponsor assessments and strategic plans for circular models.', 'Some familiarity.', 'Limited awareness.', 'No awareness.', '• Accountability Driven\n• Adaptive Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Circular Practices', 22, 'Do you prioritize circular business models in corporate strategy?', 'Always; circularity is a strategic pillar with investment targets.', 'Often prioritized in product strategy.', 'Occasionally considered.', 'Never considered.', '• Accountability Driven\n• Adaptive Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Circular Practices', 23, 'How confident are you communicating circular economy progress to stakeholders?', 'Very confident; I approve disclosures aligned to ISO 14021 and EU Green Claims Directive.', 'Somewhat confident.', 'Limited confidence.', 'Not confident.', '• Accountability Driven\n• Adaptive Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Circular Practices', 24, 'How often do you measure and report progress against circularity KPIs?', 'Always; metrics disclosed in ESG reports and investor updates.', 'Sometimes measured.', 'Rarely measured.', 'Never measured.', '• Accountability Driven\n• Adaptive Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('CxO / Executive', 'Circular Practices', 25, 'Do you collaborate across functions to embed circularity in governance and strategy?', 'Regularly; I chair committees and monitor implementation.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• Accountability Driven\n• Adaptive Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Climate Fluency', 1, 'How familiar are you with the climate impacts of operational activities (e.g., energy, waste, logistics)?', 'Very familiar; I track impacts using GHG Protocol, ISO 14001, and lifecycle assessments.', 'Some familiarity; I understand main impacts but lack detailed quantification.', 'Limited awareness; I rely on sustainability teams.', 'No awareness.', '• Energy Efficiency\n• Circular Process Design\n• Waste Reduction');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Climate Fluency', 2, 'How confident are you explaining operational decarbonisation priorities to teams?', 'Very confident; I train teams and integrate decarbonisation into SOPs and KPIs.', 'Somewhat confident; I communicate priorities when needed.', 'Limited confidence; I defer to sustainability leads.', 'Not confident.', '• Energy Efficiency\n• Circular Process Design\n• Waste Reduction');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Climate Fluency', 3, 'How often do you engage staff on climate and sustainability topics?', 'Regularly; training, updates, and engagement are built into operations management.', 'Occasionally during project rollouts.', 'Rarely; only when required.', 'Never discussed.', '• Energy Efficiency\n• Circular Process Design\n• Waste Reduction');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Climate Fluency', 4, 'How familiar are you with operational standards (e.g., ISO 50001 energy management, LEAN for sustainability)?', 'Very familiar; I apply standards in continuous improvement and reporting.', 'Some familiarity; I reference them selectively.', 'Limited awareness.', 'No awareness.', '• Energy Efficiency\n• Circular Process Design\n• Waste Reduction');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Climate Fluency', 5, 'Do you integrate climate considerations into operational decision-making and investments?', 'Always; decarbonisation impacts are core to business cases.', 'Often considered.', 'Occasionally considered.', 'Never considered.', '• Energy Efficiency\n• Circular Process Design\n• Waste Reduction');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Data & AI', 6, 'How advanced are your systems to track operational emissions, energy use, and waste?', 'Fully integrated; real-time dashboards monitor Scope 1 and 2 impacts.', 'Partially integrated; data tracked manually.', 'Limited tracking.', 'No tracking systems.', '• Process Footprinting\n• Emissions Tracking\n• ESG Compliance');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Data & AI', 7, 'How confident are you using ESG data to optimize operational performance?', 'Very confident; I use data for performance management and continuous improvement.', 'Somewhat confident; I reference data occasionally.', 'Limited confidence.', 'Not confident.', '• Process Footprinting\n• Emissions Tracking\n• ESG Compliance');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Data & AI', 8, 'How familiar are you with AI tools for optimizing energy use, waste reduction, and emissions?', 'Very familiar; I lead pilots applying AI for predictive maintenance and resource efficiency.', 'Some familiarity; I’ve trialed tools.', 'Limited awareness.', 'No awareness.', '• Process Footprinting\n• Emissions Tracking\n• ESG Compliance');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Data & AI', 9, 'How often do you validate operational ESG data accuracy?', 'Always; subject to internal audits and third-party assurance.', 'Sometimes validated for key reports.', 'Rarely validated.', 'Never validated.', '• Process Footprinting\n• Emissions Tracking\n• ESG Compliance');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Data & AI', 10, 'Do you collaborate with sustainability and finance teams to improve data and reporting?', 'Regularly; I co-create metrics and dashboards.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• Process Footprinting\n• Emissions Tracking\n• ESG Compliance');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Decarbonisation', 11, 'How aligned is operations strategy with decarbonisation targets?', 'Fully aligned; operational KPIs, budgets, and roadmaps support SBTi targets.', 'Partially aligned in major areas.', 'Limited alignment; ad hoc projects.', 'Not aligned.', '• Operational Integrity\n• Resource Responsibility\n• Transparency Ethos');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Decarbonisation', 12, 'How confident are you driving decarbonisation initiatives (e.g., energy efficiency, fuel switching)?', 'Very confident; I lead execution and track ROI.', 'Somewhat confident; I support delivery.', 'Limited confidence.', 'Not confident.', '• Operational Integrity\n• Resource Responsibility\n• Transparency Ethos');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Decarbonisation', 13, 'Do you set emissions reduction targets for operational performance?', 'Always; targets are monitored and reported quarterly.', 'Often; targets set in selected areas.', 'Occasionally; informal goals.', 'Never set targets.', '• Operational Integrity\n• Resource Responsibility\n• Transparency Ethos');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Decarbonisation', 14, 'How familiar are you with low-carbon technologies in operations (e.g., electrification, renewable sourcing)?', 'Very familiar; I integrate options in investment planning.', 'Some familiarity; considered in evaluations.', 'Limited awareness.', 'No awareness.', '• Operational Integrity\n• Resource Responsibility\n• Transparency Ethos');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Decarbonisation', 15, 'How proactive are you identifying decarbonisation opportunities?', 'Very proactive; I lead assessments and improvement plans.', 'Somewhat proactive.', 'Occasionally proactive.', 'Not proactive.', '• Operational Integrity\n• Resource Responsibility\n• Transparency Ethos');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Risk', 16, 'How aware are you of ESG risks in operations (e.g., compliance, environmental incidents)?', 'Very aware; risks mapped, mitigated, and reviewed quarterly.', 'Somewhat aware; considered in annual planning.', 'Limited awareness.', 'No awareness.', '• Improvement Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Risk', 17, 'How confident are you managing compliance with operational ESG requirements?', 'Very confident; I oversee controls and ensure audits are passed.', 'Somewhat confident.', 'Limited confidence.', 'Not confident.', '• Improvement Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Risk', 18, 'How integrated are ESG risks in operational risk registers and governance?', 'Fully integrated; reviewed quarterly with senior leadership.', 'Partially integrated.', 'Limited integration.', 'Not integrated.', '• Improvement Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Risk', 19, 'How prepared are you for regulatory changes affecting operations (e.g., energy efficiency standards)?', 'Fully prepared; policies and training in place.', 'Somewhat prepared.', 'Limited preparation.', 'Not prepared.', '• Improvement Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Risk', 20, 'How often do you review ESG risk mitigation plans?', 'Regularly; reviewed and updated quarterly.', 'Occasionally reviewed.', 'Rarely reviewed.', 'Never reviewed.', '• Improvement Focus');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Circular Practices', 21, 'How familiar are you with circular practices in operations (e.g., closed-loop processes, material recovery)?', 'Very familiar; I integrate ISO 14001 and circular economy principles.', 'Some familiarity; considered selectively.', 'Limited awareness.', 'No awareness.', '• Ownership Culture\n• Results Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Circular Practices', 22, 'Do you prioritize circularity in operational design and processes?', 'Always; criteria embedded in process design.', 'Often prioritized.', 'Occasionally considered.', 'Never considered.', '• Ownership Culture\n• Results Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Circular Practices', 23, 'How confident are you embedding circular practices in operations?', 'Very confident; I lead implementation and track metrics.', 'Somewhat confident.', 'Limited confidence.', 'Not confident.', '• Ownership Culture\n• Results Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Circular Practices', 24, 'How often do you measure and report circularity metrics (e.g., reuse rates, waste diversion)?', 'Always; metrics reported in ESG disclosures.', 'Sometimes measured.', 'Rarely measured.', 'Never measured.', '• Ownership Culture\n• Results Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Operations', 'Circular Practices', 25, 'Do you collaborate across functions to scale circular initiatives?', 'Regularly; I co-develop programs with other teams.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• Ownership Culture\n• Results Orientation');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Climate Fluency', 1, 'How well do you understand climate-related financial risks and opportunities (e.g., transition, physical, liability risks)?', 'Deep understanding; I apply TCFD guidance to identify and quantify risks in financial planning.', 'Good understanding; I consider major risks but lack detailed quantification experience.', 'Limited awareness; I understand high-level concepts but not specifics.', 'No awareness of climate-related financial risks.', '• ESG Risk Modelling\n• Carbon Costing\n• Impact Investing');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Climate Fluency', 2, 'How confident are you explaining climate risks and decarbonisation impacts to investors and leadership?', 'Very confident; I prepare disclosures, scenario analyses, and respond to investor queries.', 'Somewhat confident; I can explain core concepts but rely on sustainability leads.', 'Limited confidence; I only contribute when prompted.', 'Not confident.', '• ESG Risk Modelling\n• Carbon Costing\n• Impact Investing');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Climate Fluency', 3, 'How familiar are you with sustainability reporting frameworks (e.g., TCFD, ISSB, EU Taxonomy)?', 'Very familiar; I integrate these frameworks into financial statements and investor reports.', 'Some familiarity; I reference them when needed.', 'Limited awareness; I’ve read about them but don’t apply them.', 'No awareness.', '• ESG Risk Modelling\n• Carbon Costing\n• Impact Investing');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Climate Fluency', 4, 'How often do you integrate climate considerations into capital allocation and budgeting?', 'Always; climate risk and decarbonisation potential are included in ROI and investment criteria.', 'Often; considered in major investment decisions.', 'Occasionally; evaluated if flagged by leadership.', 'Never considered.', '• ESG Risk Modelling\n• Carbon Costing\n• Impact Investing');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Climate Fluency', 5, 'How proactive are you in assessing the financial impacts of climate scenarios (e.g., 1.5°C pathways)?', 'Very proactive; I conduct scenario modeling and stress testing annually.', 'Somewhat proactive; I contribute to assessments led by others.', 'Occasionally proactive; I review outputs only.', 'Not proactive.', '• ESG Risk Modelling\n• Carbon Costing\n• Impact Investing');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Data & AI', 6, 'How advanced are your systems to track ESG and climate data for financial reporting?', 'Fully integrated; ESG and climate data embedded in enterprise systems and financial dashboards.', 'Partially integrated; ESG tracked in separate reports.', 'Basic tracking; limited datasets.', 'No tracking.', '• Green Finance Principles\n• Regulatory Compliance\n• TCFD Knowledge');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Data & AI', 7, 'How confident are you using ESG data to inform financial decisions (e.g., risk assessments, valuations)?', 'Very confident; I integrate ESG data into financial modeling and scenario analysis.', 'Somewhat confident; I use ESG data selectively.', 'Limited confidence; I rely on external advisors.', 'Not confident.', '• Green Finance Principles\n• Regulatory Compliance\n• TCFD Knowledge');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Data & AI', 8, 'How familiar are you with AI and advanced analytics tools for ESG risk modeling?', 'Very familiar; I lead pilots using AI-based climate risk assessment tools.', 'Some familiarity; I’ve explored tools but haven’t implemented them fully.', 'Limited awareness.', 'No awareness.', '• Green Finance Principles\n• Regulatory Compliance\n• TCFD Knowledge');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Data & AI', 9, 'How often do you validate ESG data accuracy in financial reporting?', 'Always; ESG metrics are audited internally and externally.', 'Sometimes validated for disclosures.', 'Rarely validated.', 'Never validated.', '• Green Finance Principles\n• Regulatory Compliance\n• TCFD Knowledge');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Data & AI', 10, 'Do you collaborate with sustainability, risk, and data teams to improve ESG financial metrics?', 'Regularly; I co-develop methodologies and reporting frameworks.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• Green Finance Principles\n• Regulatory Compliance\n• TCFD Knowledge');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Decarbonisation', 11, 'How aligned is finance strategy with decarbonisation targets and net zero commitments?', 'Fully aligned; decarbonisation KPIs and funding requirements embedded in financial strategy.', 'Partially aligned; targets reflected in select budgets.', 'Limited alignment; addressed reactively.', 'Not aligned.', '• Stewardship Commitment\n• Integrity Orientation\n• Purpose Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Decarbonisation', 12, 'How confident are you integrating decarbonisation costs and benefits into investment cases?', 'Very confident; I quantify emissions reduction ROI and lifecycle costs.', 'Somewhat confident; I include estimates when available.', 'Limited confidence; I need support from other teams.', 'Not confident.', '• Stewardship Commitment\n• Integrity Orientation\n• Purpose Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Decarbonisation', 13, 'Do you set internal carbon pricing or shadow pricing to guide financial decisions?', 'Always; internal carbon pricing used in investment appraisal and project budgets.', 'Often; considered for high-impact projects.', 'Occasionally; used informally.', 'Never used or considered.', '• Stewardship Commitment\n• Integrity Orientation\n• Purpose Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Decarbonisation', 14, 'How familiar are you with climate finance instruments (e.g., green bonds, sustainability-linked loans)?', 'Very familiar; I structure and monitor green finance instruments.', 'Some familiarity; I have worked on some deals.', 'Limited awareness.', 'No awareness.', '• Stewardship Commitment\n• Integrity Orientation\n• Purpose Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Decarbonisation', 15, 'How proactive are you in identifying decarbonisation funding opportunities and incentives?', 'Very proactive; I regularly source grants, incentives, and investment options.', 'Somewhat proactive; I respond to opportunities when presented.', 'Occasionally proactive.', 'Not proactive.', '• Stewardship Commitment\n• Integrity Orientation\n• Purpose Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Risk', 16, 'How aware are you of climate-related risks in financial planning (e.g., stranded assets, regulatory fines)?', 'Very aware; risks mapped and integrated into enterprise risk management.', 'Somewhat aware; considered in scenario analysis.', 'Limited awareness.', 'No awareness.', '• Long-Term Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Risk', 17, 'How confident are you managing compliance with climate disclosure regulations (e.g., TCFD, CSRD)?', 'Very confident; I lead compliance processes and reporting.', 'Somewhat confident; I contribute to compliance reviews.', 'Limited confidence; I rely on legal.', 'Not confident.', '• Long-Term Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Risk', 18, 'How integrated are ESG risks in finance risk registers and controls?', 'Fully integrated; reviewed quarterly and linked to operational and strategic risks.', 'Partially integrated for key areas.', 'Limited integration.', 'Not integrated.', '• Long-Term Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Risk', 19, 'How prepared are you for evolving climate and ESG regulations affecting finance (e.g., ISSB standards)?', 'Fully prepared; documented plans and training in place.', 'Somewhat prepared; policies in development.', 'Limited preparation.', 'Not prepared.', '• Long-Term Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Risk', 20, 'How often do you review mitigation plans for climate and ESG risks?', 'Regularly; reviews part of quarterly governance.', 'Occasionally reviewed.', 'Rarely reviewed.', 'Never reviewed.', '• Long-Term Thinking');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Circular Practices', 21, 'How familiar are you with financial considerations of circular business models (e.g., leasing, reuse)?', 'Very familiar; I assess ROI, risks, and tax implications of circular strategies.', 'Some familiarity; I support assessments when needed.', 'Limited awareness.', 'No awareness.', '• Accountability Culture\n• Results Focused');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Circular Practices', 22, 'Do you prioritize funding or incentives for circular economy initiatives?', 'Always; budgets and incentives allocated to circular projects.', 'Often prioritized when feasible.', 'Occasionally considered.', 'Never considered.', '• Accountability Culture\n• Results Focused');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Circular Practices', 23, 'How confident are you assessing the financial impact of circular strategies (e.g., asset recovery, material reuse)?', 'Very confident; I model scenarios and track performance.', 'Somewhat confident; I contribute to evaluations.', 'Limited confidence.', 'Not confident.', '• Accountability Culture\n• Results Focused');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Circular Practices', 24, 'How often do you track and report financial KPIs related to circularity?', 'Always; metrics reported in ESG and financial disclosures.', 'Sometimes tracked for major initiatives.', 'Rarely tracked.', 'Never tracked.', '• Accountability Culture\n• Results Focused');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Finance', 'Circular Practices', 25, 'Do you collaborate with sustainability and operations teams on funding circular projects?', 'Regularly; I co-develop business cases and secure funding.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• Accountability Culture\n• Results Focused');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Climate Fluency', 1, 'How familiar are you with climate-related procurement risks (e.g., Scope 3 emissions, raw material scarcity)?', 'Very familiar; I conduct supplier risk mapping and integrate Scope 3 considerations into sourcing strategy using ISO 20400.', 'Some familiarity; I understand major risks but rely on sustainability teams for details.', 'Limited awareness; I have high-level knowledge only.', 'No awareness.', '• Sustainable Sourcing\n• Life Cycle Analysis\n• Low-Carbon Contracting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Climate Fluency', 2, 'How confident are you explaining decarbonisation expectations to suppliers?', 'Very confident; I develop training, embed requirements in RFQs, and lead supplier engagements.', 'Somewhat confident; I communicate expectations during negotiations.', 'Limited confidence; I defer to sustainability colleagues.', 'Not confident.', '• Sustainable Sourcing\n• Life Cycle Analysis\n• Low-Carbon Contracting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Climate Fluency', 3, 'How often do you engage suppliers about emissions reduction targets and performance?', 'Regularly; I co-create roadmaps and track progress quarterly.', 'Occasionally; engagement during contract renewals.', 'Rarely; only when required by regulation.', 'Never engage.', '• Sustainable Sourcing\n• Life Cycle Analysis\n• Low-Carbon Contracting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Climate Fluency', 4, 'How familiar are you with standards (e.g., SBTi Supplier Engagement, GRI 308)?', 'Very familiar; I apply standards to sourcing processes and supplier assessments.', 'Some familiarity; I reference them selectively.', 'Limited awareness.', 'No awareness.', '• Sustainable Sourcing\n• Life Cycle Analysis\n• Low-Carbon Contracting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Climate Fluency', 5, 'Do you integrate climate impacts into procurement decisions and supplier selection?', 'Always; decarbonisation and climate risk criteria weighted in all tenders.', 'Often; considered for critical suppliers.', 'Occasionally considered.', 'Never considered.', '• Sustainable Sourcing\n• Life Cycle Analysis\n• Low-Carbon Contracting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Data & AI', 6, 'How advanced are your systems to track supplier ESG data and emissions?', 'Fully integrated; real-time dashboards, third-party platforms (e.g., EcoVadis, CDP Supply Chain), and automated reporting.', 'Partially integrated; some manual data collection.', 'Basic tracking; limited accuracy.', 'No systems in place.', '• Supplier Emissions Data\n• Circular Procurement\n• Scope 3 Reporting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Data & AI', 7, 'How confident are you using ESG data to assess and manage supplier risks?', 'Very confident; I embed ESG metrics in supplier scorecards and performance evaluations.', 'Somewhat confident; I reference data periodically.', 'Limited confidence.', 'Not confident.', '• Supplier Emissions Data\n• Circular Procurement\n• Scope 3 Reporting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Data & AI', 8, 'How familiar are you with AI tools for supply chain emissions forecasting?', 'Very familiar; I pilot AI solutions to model Scope 3 risks and predict supplier performance.', 'Some familiarity; I have explored tools in pilot projects.', 'Limited awareness.', 'No awareness.', '• Supplier Emissions Data\n• Circular Procurement\n• Scope 3 Reporting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Data & AI', 9, 'How often do you validate ESG supplier data accuracy?', 'Always; verified via audits, certifications, and third-party assurance.', 'Often validated for strategic suppliers.', 'Rarely validated.', 'Never validated.', '• Supplier Emissions Data\n• Circular Procurement\n• Scope 3 Reporting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Data & AI', 10, 'Do you collaborate with sustainability and finance teams to improve ESG data?', 'Regularly; I co-create supplier reporting frameworks.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• Supplier Emissions Data\n• Circular Procurement\n• Scope 3 Reporting');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Decarbonisation', 11, 'How aligned is procurement strategy with corporate decarbonisation targets?', 'Fully aligned; decarbonisation KPIs cascaded into procurement objectives and contracts.', 'Partially aligned in priority categories.', 'Limited alignment; addressed ad hoc.', 'Not aligned.', '• Ethical Purchasing\n• Transparency Focus\n• Responsibility Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Decarbonisation', 12, 'How confident are you embedding emissions reduction commitments in contracts?', 'Very confident; I lead negotiations and enforce contractual obligations.', 'Somewhat confident; I include clauses when requested.', 'Limited confidence.', 'Not confident.', '• Ethical Purchasing\n• Transparency Focus\n• Responsibility Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Decarbonisation', 13, 'Do you set supplier emissions reduction targets in sourcing agreements?', 'Always; targets and reporting requirements standard in all contracts.', 'Often included for high-impact categories.', 'Occasionally included.', 'Never included.', '• Ethical Purchasing\n• Transparency Focus\n• Responsibility Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Decarbonisation', 14, 'How familiar are you with low-carbon procurement practices (e.g., renewable materials, local sourcing)?', 'Very familiar; I embed practices in sourcing strategy and criteria.', 'Some familiarity; considered in some tenders.', 'Limited awareness.', 'No awareness.', '• Ethical Purchasing\n• Transparency Focus\n• Responsibility Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Decarbonisation', 15, 'How proactive are you identifying decarbonisation opportunities with suppliers?', 'Very proactive; I lead assessments, co-develop plans, and monitor outcomes.', 'Somewhat proactive.', 'Occasionally proactive.', 'Not proactive.', '• Ethical Purchasing\n• Transparency Focus\n• Responsibility Mindset');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Risk', 16, 'How aware are you of ESG compliance risks (e.g., human rights violations, deforestation, non-compliance with regulations)?', 'Very aware; I maintain compliance registers aligned to EU Deforestation Regulation and CSDDD.', 'Somewhat aware; risks reviewed annually.', 'Limited awareness.', 'No awareness.', '• Proactive Engagement');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Risk', 17, 'How confident are you managing supplier ESG breaches?', 'Very confident; I oversee corrective actions, legal escalations, and terminations.', 'Somewhat confident; I support compliance teams.', 'Limited confidence.', 'Not confident.', '• Proactive Engagement');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Risk', 18, 'How integrated are ESG risks in procurement risk registers and controls?', 'Fully integrated; reviewed quarterly with legal and sustainability.', 'Partially integrated in critical categories.', 'Limited integration.', 'Not integrated.', '• Proactive Engagement');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Risk', 19, 'How prepared are you for regulatory changes (e.g., CSDDD, EU Green Claims Directive)?', 'Fully prepared; policies, training, and supplier guidance in place.', 'Somewhat prepared.', 'Limited preparation.', 'Not prepared.', '• Proactive Engagement');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Risk', 20, 'How often do you review mitigation plans for supplier ESG risks?', 'Regularly; reviewed and updated quarterly.', 'Occasionally reviewed.', 'Rarely reviewed.', 'Never reviewed.', '• Proactive Engagement');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Circular Practices', 21, 'How familiar are you with circular procurement practices (e.g., design for reuse, end-of-life recovery)?', 'Very familiar; I integrate ISO 20400 and Ellen MacArthur Foundation principles into processes.', 'Some familiarity; considered in select categories.', 'Limited awareness.', 'No awareness.', '• Continuous Improvement\n• Collaboration Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Circular Practices', 22, 'Do you prioritize suppliers with strong circular economy capabilities?', 'Always; criteria embedded in supplier selection and evaluations.', 'Often prioritized.', 'Occasionally considered.', 'Never considered.', '• Continuous Improvement\n• Collaboration Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Circular Practices', 23, 'How confident are you embedding circularity requirements in contracts?', 'Very confident; I draft obligations and monitor compliance.', 'Somewhat confident.', 'Limited confidence.', 'Not confident.', '• Continuous Improvement\n• Collaboration Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Circular Practices', 24, 'How often do you measure circularity performance in the supply base?', 'Always; metrics tracked and reported annually.', 'Sometimes measured.', 'Rarely measured.', 'Never measured.', '• Continuous Improvement\n• Collaboration Driven');

INSERT INTO assessment_questions (department, theme, question_number, question, best_practice, developing, emerging, beginner, linked_skills) VALUES
('Procurement', 'Circular Practices', 25, 'Do you collaborate with suppliers to develop circular solutions?', 'Regularly; I co-create pilots and share learnings.', 'Occasionally collaborate.', 'Rarely collaborate.', 'Never collaborate.', '• Continuous Improvement\n• Collaboration Driven');

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_aq_department ON assessment_questions(department);
CREATE INDEX idx_aq_theme ON assessment_questions(theme);
CREATE INDEX idx_ar_company ON assessment_responses(company_id);
CREATE INDEX idx_ar_question ON assessment_responses(question_id);
CREATE INDEX idx_cp_user ON company_profiles(user_id);