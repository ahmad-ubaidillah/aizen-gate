# API Standards

## RESTful Principles

### HTTP Methods
| Method | Usage | Idempotent |
|--------|-------|------------|
| GET | Retrieve resources | Yes |
| POST | Create resources | No |
| PUT | Replace resources | Yes |
| PATCH | Partial update | No |
| DELETE | Remove resources | Yes |

### Status Codes
```
2xx Success
  200 - OK
  201 - Created
  204 - No Content (successful delete)

4xx Client Errors
  400 - Bad Request (validation failed)
  401 - Unauthorized (missing/invalid auth)
  403 - Forbidden (no permission)
  404 - Not Found
  409 - Conflict (state mismatch)
  422 - Unprocessable Entity
  429 - Too Many Requests (rate limit)

5xx Server Errors
  500 - Internal Server Error
  502 - Bad Gateway
  503 - Service Unavailable
  504 - Gateway Timeout
```

## Naming Conventions

### Endpoints
```
/resources          # GET list, POST create
/resources/{id}     # GET one, PUT update, DELETE
/resources/{id}/sub # Nested resource

# Plural nouns for collections
/users, /orders, /products

# Use kebab-case for multi-word
/user-profiles, /order-items

# No trailing slashes
/api/users     ✓
/api/users/    ✗
```

### Query Parameters
```
?page=1&limit=20&sort=created_at&order=desc
?filter=status:active&search=john
```

### Versioning
```
/api/v1/users
/api/v2/users
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  }
}
```

## Best Practices
- Use JSON for all responses
- Include rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)
- Support ETag for caching
- Implement pagination for all list endpoints
- Use ISO 8601 for dates
