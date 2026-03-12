# Metrics & Observability

## Overview
Performance benchmarks, logging standards, and telemetry for production systems.

## Logging Standards

### Log Levels
```
DEBUG  - Detailed diagnostic info
INFO   - General events
WARN   - Warning conditions
ERROR  - Error conditions
FATAL  - Critical failures
```

### Structured Logging
```typescript
logger.info('User purchased', {
  userId: user.id,
  orderId: order.id,
  amount: order.total,
  currency: 'USD',
  productCount: order.items.length,
  timestamp: new Date().toISOString(),
  service: 'orders-api'
});
```

### JSON Log Format
```json
{
  "level": "info",
  "message": "Request completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "api",
  "traceId": "abc123",
  "userId": "usr_456",
  "duration": 245,
  "statusCode": 200,
  "path": "/api/orders",
  "method": "GET"
}
```

## Performance Benchmarks

### API Response Times
| Endpoint Type | Target | Warning | Critical |
|---------------|--------|---------|----------|
| Simple read | < 100ms | > 200ms | > 500ms |
| Complex query | < 300ms | > 500ms | > 1000ms |
| Write operation | < 200ms | > 400ms | > 800ms |
| File upload | < 2s | > 5s | > 10s |

### Resource Limits
| Resource | Limit |
|----------|-------|
| CPU | 80% average |
| Memory | 85% average |
| Disk | 70% |
| Database connections | 80% pool |

## Metrics Collection

### Prometheus Metrics
```typescript
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5]
});
```

### Key Metrics
- Request rate (RPS)
- Error rate
- Latency (p50, p95, p99)
- Saturation (CPU, memory)
- Throughput

## Tracing

### Distributed Tracing
```typescript
const span = tracer.startSpan('processOrder');
span.setAttribute('orderId', order.id);
span.setAttribute('userId', user.id);

try {
  await processPayment(order);
  span.setAttribute('payment', 'success');
} catch (e) {
  span.setAttribute('payment', 'failed');
  span.recordException(e);
} finally {
  span.end();
}
```

## Alerting Rules

### Critical Alerts
- Error rate > 5%
- p99 latency > 2s
- Memory > 90%
- Disk > 85%
- 5xx errors > threshold
