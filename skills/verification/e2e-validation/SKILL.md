---
name: e2e-validation
description: "You MUST use this for production readiness checks. It provides a workflow for end-to-end testing of user flows and deployments."
---

# Skill: End-to-End (E2E) Validation

## Overview

Total verification of the application from the user's perspective. Ensures that business logic, UI, and integrations work perfectly in sync across the entire stack.

## Tools & Frameworks

- **Playwright / Cypress**: For browser-based automation and visual regression.
- **Postman / Newman**: For API collection testing and contract validation.
- **Lighthouse**: For performance, SEO, and accessibility audits.

## Process Flow

### 1. Identify Critical Paths

- High-value user flows (Auth, Checkout, Onboarding).
- Integration points with external APIs/MCP servers.
- Error boundaries (404, 500, Unauthorized).

### 2. Implementation Specifications

- Define "Happy Path" expected outcomes.
- Record "Edge Case" failure modes.
- Use `templates/VALIDATION.md` to document the test results.

### 3. Automated Regression

- Run tests in every `az-auto` loop.
- Generate a "Health Heatmap" to identify fragile components.

---

**[QA] E2E standards applied.** If a user can see it, we must verify it.
