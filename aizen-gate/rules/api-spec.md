---
trigger: glob
glob: "**/*.{yaml,yml,json,proto}"
---

# API-SPEC.MD - Contract & Interface Standards

> **Objective**: Ensure data contracts between systems (Frontend-Backend, Microservices) are always consistent and transparent.

---

## 1. SPECIFICATION (OPENAPI/SWAGGER)

1. **Source of Truth**: Spec file is the single source of truth. Code must follow Spec, or Spec must be auto-generated from code.
2. **Versioning**: Always include version in URL (e.g., `/api/v1/...`). Never create breaking changes in current version.
3. **Documentation**: Every endpoint must have clear descriptions of Params, Request Body, and Response Schema.

---

## 2. DESIGN BEST PRACTICES

1. **Naming**: Use `kebab-case` for URLs. Use plural nouns (e.g., `/orders`).
2. **Methods**: Use correct HTTP verb meanings (GET, POST, PUT, PATCH, DELETE).
3. **Status Codes**:
   - 200/201: Success.
   - 400: Bad Request (Client error).
   - 401/403: Auth error.
   - 404: Not Found.
   - 500: Server error.

---

## 3. RESPONSE FORMAT

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "ISO8601",
    "version": "1.0"
  }
}
```

---

## 4. SECURITY & VALIDATION

1. **Input Sanitization**: All input must be schema-validated before processing.
2. **Rate Limiting**: Limit requests to prevent brute-force and DDoS.
3. **CORS**: Configure exact Origin, never use `*` in Production.

---

## 5. PAGINATION

1. **Cursor-based**: Prefer cursor-based pagination for large datasets.
2. **Limit**: Always set default and max limits (e.g., default 20, max 100).
3. **Metadata**: Include total count and next/previous cursor in response.

---

## 6. ERROR RESPONSES

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [...]
  }
}
```

---

## 7. VERSIONING STRATEGY

1. **URL-based**: `/api/v1/resource`
2. **Header-based**: `Accept: application/vnd.api.v1+json`
3. **Deprecation**: Provide 6-month notice before removing versions.