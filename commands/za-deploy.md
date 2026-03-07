---
name: "za-deploy"
description: "Deploy the current build to the target environment and run E2E verification tests."
authors: ["Aizen-Gate Team"]
status: "beta"
---

# Command: za-deploy

The deployment and production verification phase.

**[SA] Time to go live!** I'm calling in @ops and @qa.

## 1. Environment Preparation (Via [OPS] Stark)

- **[OPS] Stark** prepares the target:
  - Validates environment variables and API keys.
  - Builds the production bundle (`npm run build`).
  - Provisions infrastructure (if necessary).

## 2. Autonomous Deployment (Via [OPS] Stark)

- **[OPS] Stark** executes the deployment:
  - Pushes to the target (GitHub Actions, Vercel, AWS, etc.).
  - Monitors the health logs during the rollout.

## 3. E2E Verification (Via [QA] Argus)

- **[QA] Argus** runs the verification suite:
  - Invokes browser-based E2E tests (Playwright/Cypress).
  - Performs smoke tests on key endpoints.
  - Verifies "Success Criteria" from the PRD in the live environment.

---

**[SA] Deployment successful.** The project is live and verified. Ready for the next feature?
