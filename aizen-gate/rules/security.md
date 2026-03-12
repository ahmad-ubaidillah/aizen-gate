---
trigger: always_on
---

# SECURITY.MD - Security Guardrails

> **Objective**: Protect the system from common vulnerabilities and human errors.

---

## 1. FORBIDDEN ACTIONS

1. **Hardcode Secrets**:
   - Never write API Key, Password, Token directly in code.
   - Always use `process.env` or environment variables.
2. **Commit Token**:
   - Check `.gitignore` before commit.
   - Ensure `.env` is in `.gitignore`.
3. **Delete Database**:
   - Never run `DROP TABLE` or delete `.sqlite` without explicit user command and 3-step verification.

---

## 2. AUTHENTICATION & AUTHORIZATION

### 2.1 Authentication
1. **Password Storage**: Always hash passwords (Bcrypt/Argon2).
2. **Token Management**: Use JWT with short expiration.
3. **Session**: Implement session timeout (30 min idle).
4. **MFA**: Enable 2FA for sensitive operations.

### 2.2 Authorization
1. **RBAC**: Implement Role-Based Access Control.
2. **Principle of Least Privilege**: Grant minimum required permissions.
3. **API Keys**: Rotate keys every 90 days.

---

## 3. INPUT VALIDATION

### 3.1 Data Sanitization
1. **SQL Injection**: Always use Parameterized Queries or ORM (Prisma/TypeORM). Never concatenate strings into SQL.
2. **XSS (Cross-Site Scripting)**: Sanitize all user input. Use libraries like `dompurify` when rendering HTML.
3. **Command Injection**: Never use user input in shell commands.

### 3.2 Schema Validation
1. **Validate Early**: Validate all input at API entry point.
2. **Type Checking**: Use strict types (TypeScript interfaces).
3. **Length Limits**: Enforce max length on strings.

---

## 4. COMMON VULNERABILITIES

1. **CORS**: Configure exact Origins, never `*` in Production.
2. **Rate Limiting**: Prevent brute-force attacks.
3. **CSRF**: Use anti-CSRF tokens for state-changing operations.
4. **Sensitive Data**: Encrypt at rest and in transit (TLS 1.3).

---

## 5. INCIDENT PROTOCOL

When vulnerability or secret leak is suspected:

1. **STOP**: Halt all current tasks.
2. **REPORT**: Notify user immediately with RED ALERT.
3. **FIX**: Propose key rotation or patch solution.

---

## 6. SECURITY CHECKLIST

- [ ] No secrets in code
- [ ] Passwords are hashed
- [ ] Input validated and sanitized
- [ ] Proper CORS configuration
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Dependencies up to date
- [ ] Security scan in CI/CD