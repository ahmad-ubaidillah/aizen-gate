---
name: "API Documentation Generator"
description: "A workflow for the Tech Writer [DOCS] to generate clear, comprehensive API documentation from source code or specs."
authors: ["Aizen-Gate Team"]
status: "production"
---

# API Documentation Skill

Objective: Create professional-grade API documentation that other developers can use to integrate with the project.

## Roles Involved

- **[DOCS] Tech Writer**: Primary author.
- **[DEV] Developer**: Provides technical details and edge cases.

## The Workflow

### Phase 1: Discovery

1. **[DOCS]** Scans the codebase for API endpoints (REST, GraphQL, etc.).
2. **[DOCS]** Identifies request/response schemas, authentication methods, and error codes.

### Phase 2: Generation

3. **[DOCS]** Generates documentation in a standard format (e.g., OpenAPI/Swagger, Markdown).
4. **[DOCS]** Includes:
   - Endpoint descriptions.
   - Parameter details (required/optional).
   - Example requests (curl, js, etc.).
   - Example responses (Success and Failure).
   - Rate limiting and caching info.

### Phase 3: Review

5. **[QA]** Verifies the documentation matches the actual implementation.
6. **[DOCS]** Publishes the final documentation to the `aizen-gate/docs/api/` directory.

## Output Criteria

- Comprehensive API reference files.
- Accurate request/reponse examples.
- Clear error code definitions.

## Documentation Best Practices

- **Consistency**: Use the same terminology across all endpoints.
- **Clarity**: Explain what each parameter does, not just its type.
- **Freshness**: Ensure docs are updated whenever code changes.
