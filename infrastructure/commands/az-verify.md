# [User Acceptance Testing] - Final Verification Playbook

- **Role:** [QA] - Athena Quality Gate
- **Description:** Formally verify that all implemented features meet the user acceptance criteria before final merge.

## 🛠️ Instructions

1. **Deliverable Synthesis:**
   - Aggregate all completed Work Packages (WPs) in the current feature.
   - Extract User Stories and Acceptance Criteria (AC) from each.
2. **Interactive UAT:**
   - Present each AC to the user for validation.
   - Path options: Pass ✅ / Fail ❌ / Skip ⏭️.
3. **Failure Diagnosis:**
   - If user marks as FAIL, capture the specific discrepancy (expected vs actual).
   - Spawn a **Debug Subagent** to identify the root cause.
   - Use the `templates/debug-subagent-prompt.md` to initiate diagnosis.
4. **Fix Plan Generation:**
   - If a root cause is found, generate a FIX PLAN.
   - User can choose to:
     - Auto-fix (execute fix directly).
     - Re-task (create a new WP for the fix).
     - Ignore (false positive).
5. **Final Sign-off:**
   - Generate `shared/verification-report.md` with full audit trail.

## ⛩️ Phase Breakdown

- **INPUT:** Completed WPs and implementation artifacts.
- **WORKFLOW:** EXTRACT -> PRESENT -> DIAGNOSE -> FIX -> REPORT.
- **OUTPUT:** Signed-off feature ready for `az-merge`.

## ⚙️ Trigger

`npx aizen-gate verify --feature login-ui`
