# Pagination & Sorting Standards

## Pagination

### Offset-Based Pagination
```bash
GET /api/users?page=1&limit=20
```
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### Cursor-Based Pagination
```bash
GET /api/users?cursor=eyJpZCI6MTAwfQ&limit=20
```
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTIwfQ",
    "prev_cursor": "eyJpZCI6ODB9",
    "has_more": true
  }
}
```

### When to Use Each

| Type | Use Case | Pros |
|------|----------|------|
| Offset | Stable datasets, jump to page | Simple |
| Cursor | Real-time data, large datasets | Performance |

## Sorting

### Syntax
```bash
# Single field ascending
GET /api/users?sort=name

# Single field descending
GET /api/users?sort=-created_at

# Multiple fields
GET /api/users?sort=status,-created_at
```

### Allowed Sort Fields
- Whitelist sortable fields in code
- Default sort: `-created_at`

### Example
```bash
GET /api/orders?sort=-created_at,total&status=active
```

## Limits
- Default limit: 20
- Max limit: 100
- Return error if limit > 100
