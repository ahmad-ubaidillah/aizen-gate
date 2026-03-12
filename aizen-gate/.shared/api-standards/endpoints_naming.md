# Endpoints Naming Guide

## Resource Naming

### Collections vs Single Resources
```bash
# Collection - plural form
GET    /api/users          # Get all users
POST   /api/users          # Create user

# Single resource - with ID
GET    /api/users/123      # Get user 123
PUT    /api/users/123      # Update user 123
DELETE /api/users/123      # Delete user 123
```

### Nested Resources
```bash
# User's orders
GET    /api/users/123/orders
POST   /api/users/123/orders

# Order's items
GET    /api/orders/456/items
```

### Actions as Resources
```bash
# Instead of POST /users/123/activate
POST   /api/users/123/activation

# Instead of POST /users/123/deactivate
POST   /api/users/123/deactivation

# For non-CRUD actions, use verb endpoint
POST   /api/users/123/verify-email
POST   /api/orders/456/cancel
POST   /api/reports/generate
```

## Filtering & Querying

### Standard Query Params
```bash
?status=active
?type=premium
?created_after=2024-01-01
?created_before=2024-12-31
```

### Search
```bash
?q=search+term
?search=name:john,email:john@example.com
```

### Sorting
```bash
?sort=created_at           # ascending
?sort=-created_at          # descending
?sort=name,-created_at     # multiple
```

## Examples

| Action | Method | Endpoint |
|--------|--------|----------|
| List users | GET | /users |
| Get user | GET | /users/{id} |
| Create user | POST | /users |
| Update user | PUT | /users/{id} |
| Delete user | DELETE | /users/{id} |
| User's orders | GET | /users/{id}/orders |
| Activate user | POST | /users/{id}/activate |
