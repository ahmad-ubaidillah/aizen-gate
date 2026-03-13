---
trigger: glob
glob: "**/*.{py,js,ts,go,rs,sql,php,java,dockerfile,tf,yaml,yml}"
---

# BACKEND.MD - Systems & Logic Standards

> **Objective**: Single rule set to manage all Logic, Data, and Infrastructure. High performance - No overlap.

---

## 1. ARCHITECTURE & API

### 1.1 Clean Architecture
- Clear separation: Controller -> Service -> Repository -> Database.
- Each layer has single responsibility.

### 1.2 API Standards
- **RESTful**: `GET /resources`, `POST /resources`, etc.
- **GraphQL**: Clear schema definition, avoid N+1.
- **Response Format**:
  ```json
  { "success": true, "data": any, "error": null }
  ```

### 1.3 Stateless
- Server doesn't store user state (use Redis/JWT).
- Horizontal scaling capability.

---

## 2. DATABASE MASTERY

### 2.1 Schema Design
- Follow 3NF (Third Normal Form).
- Use `snake_case` for table/column names.
- Always include `created_at`, `updated_at`.

### 2.2 Performance
- **Indexes**: Required for FK and search columns.
- **Migration**: Never edit columns directly in Production.

---

## 3. ERROR HANDLING

### 3.1 Structured Logging
- Logs must be parseable (JSON).
- **NEVER**: Use `print` or `console.log` in production.

### 3.2 Graceful Failure
- Database down: API returns 503, never hang request.
- External service failure: Fail gracefully with fallback.

### 3.3 Error Codes
- Use consistent error codes across API.
- Include correlation IDs for tracing.

---

## 4. CONFIGURATION

### 4.1 12-Factor App
- Config from Environment Variables.
- No hardcoded configuration in code.

### 4.2 Secrets Management
- Use environment variables for secrets.
- Never commit secrets to version control.

---

## 5. SCALABILITY PATTERNS

1. **Caching**: Redis for frequently accessed data.
2. **Queue**: Async processing for long tasks.
3. **Rate Limiting**: Protect against abuse.
4. **Connection Pooling**: Database connection reuse.

---

## 6. API CHECKLIST

- [ ] RESTful conventions followed
- [ ] Proper HTTP status codes
- [ ] Input validation at entry point
- [ ] Structured JSON logging
- [ ] Error handling with graceful degradation
- [ ] Pagination for list endpoints