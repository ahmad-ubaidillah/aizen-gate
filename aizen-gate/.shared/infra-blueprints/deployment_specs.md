# Deployment Specifications

## Deployment Strategies

### 1. Blue-Green Deployment
- Two identical production environments
- Traffic switches instantly
- Quick rollback
- Double infrastructure cost

### 2. Canary Deployment
- Gradually shift traffic (5% → 25% → 100%)
- Monitor metrics for issues
- Automatic rollback on threshold breach

### 3. Rolling Deployment
- Update instances one at a time
- No additional infrastructure
- Slower rollout

## CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - uses: docker/build-push@v5
        with:
          push: true
          tags: my-registry/app:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: |
          aws ecs update-service \
            --cluster my-cluster \
            --service my-service \
            --force-new-deployment
```

## Health Checks

### Application Health
```typescript
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now(),
    checks: {
      database: db.isConnected,
      redis: redis.isConnected
    }
  };

  const allHealthy = Object.values(health.checks).every(Boolean);
  res.status(allHealthy ? 200 : 503).json(health);
});
```

### Readiness vs Liveness

| Probe | Purpose | Failure Action |
|-------|---------|----------------|
| Liveness | Is the container running? | Restart container |
| Readiness | Can it handle traffic? | Remove from load balancer |

## Secrets Management

### Environment Variables
```bash
# Don't commit secrets to git
# Use .env files (added to .gitignore)
# Or secret manager (AWS Secrets Manager, HashiCorp Vault)
```

### AWS Secrets Manager
```typescript
const secrets = await secretsManager
  .getSecretValue({ SecretId: 'my-db-credentials' })
  .promise();

const { username, password } = JSON.parse(secrets.SecretString);
```
