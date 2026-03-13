---
trigger: glob
glob: "**/*.{test,spec}.{js,ts,jsx,tsx,py,rs,go,java}"
---

# TESTING-STANDARD.MD - Quality Assurance Protocol

> **Objective**: "Code without tests is dead code". Ensure every feature works as designed before Production.

---

## 1. THE TESTING PYRAMID

Follow the golden ratio in testing:

1. **Unit Tests (70%)**:
   - Test smallest function/method.
   - Requirements: Extremely fast (<1ms/test), no real IO/Network (must Mock).
2. **Integration Tests (20%)**:
   - Test combination between modules (API + DB, Component + Store).
   - Requirements: Use Docker Testing DB or In-memory DB.
3. **E2E Tests (10%)**:
   - Test real user journey.
   - Tools: Playwright, Cypress.

---

## 2. NAMING CONVENTIONS

### File Name
- Use `*.test.ts` or `*.spec.ts`

### Structure
```typescript
describe('AuthService', () => {           // Module Name
  describe('login()', () => {             // Function Name
    it('should return token when creds are valid', () => {
      // Test expected behavior
    });
    
    it('should throw 401 when password wrong', () => {
      // Edge case
    });
  });
});
```

---

## 3. MOCKING STRATEGY

### External Services
- **REQUIRED**: Mock all 3rd-party APIs (Stripe, SendGrid, Google Auth).
- **NEVER**: Call real APIs in tests.

### Database
- **Unit Test**: Use Repository Pattern with Mock Repository.
- **Integration Test**: Use Test Database (SQLite/Docker).

---

## 4. COVERAGE REQUIREMENTS

| Component | Coverage Target |
|-----------|-----------------|
| Core Logic | > 80% Statement Coverage |
| Utils/Helpers | > 90% Coverage |
| UI Components | Test behavior, not implementation |

---

## 5. TESTING WORKFLOW

**Red - Green - Refactor**:
1. Write failing test first (Red).
2. Write code to pass test (Green).
3. Optimize code (Refactor).

---

## 6. TEST QUALITY RULES

1. **Independent**: Tests must not depend on each other.
2. **Deterministic**: Same input always produces same output.
3. **Fast**: Unit tests under 100ms.
4. **Isolated**: Each test verifies one behavior.
5. **Readable**: Test names describe what they verify.

---

## 7. TYPES OF TESTS

| Type | What | When |
|------|------|------|
| Unit | Function logic | Every PR |
| Integration | Module interaction | Feature complete |
| E2E | User journey | Before release |
| Performance | Load/stress | Before release |
| Security | Vulnerability scan | Before release |