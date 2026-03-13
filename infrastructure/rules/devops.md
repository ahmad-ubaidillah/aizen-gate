---
trigger: glob
glob: "**/dockerfile,**/docker-compose.yml,**/.github/workflows/*.yml,**/jenkinsfile,**/terraform/**/*,**/k8s/**/*"
---

# DEVOPS.MD - Deployment & Infrastructure Mastery

> **Objective**: Maximize automation, safe deployment, and scalable infrastructure.

---

## 1. CONTAINERIZATION (DOCKER)

### 1.1 Best Practices
1. **Multi-stage Builds**: Reduce image size by keeping only final artifact.
2. **Non-root User**: Run application as non-root user for security.
3. **Environment**: Use `.env`, never hardcode config in image.

### 1.2 Dockerfile Example
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --production
USER node
CMD ["node", "dist/index.js"]
```

---

## 2. CI/CD PIPELINE

### 2.1 Pipeline Stages
1. **Lint**: Run linter (ESLint, Biome).
2. **Test**: Run Unit and Integration tests.
3. **Build**: Compile/bundle application.
4. **Security Scan**: Scan for vulnerabilities (Snyk, Trivy).
5. **Deploy**: Deploy to staging/production.

### 2.2 Quality Gates
- Pipeline must fail if tests fail.
- Security scan must pass.
- Linting must pass.

### 2.3 Deployment Strategy
- **Canary**: Deploy to small subset, then expand.
- **Blue/Green**: Zero-downtime swap.
- **Rolling**: Gradual replacement.

---

## 3. INFRASTRUCTURE AS CODE (IaC)

### 3.1 Tools
- **Declarative**: Prefer Terraform or CloudFormation.
- **State Management**: Use Remote State with locking.

### 3.2 Modularity
- Split infrastructure into reusable modules.
- Separate environments (dev/staging/prod).

---

## 4. MONITORING & LOGGING

1. **Metrics**: CPU, Memory, Request latency.
2. **Logging**: Centralized log aggregation (ELK, CloudWatch).
3. **Alerts**: Set up alerts for critical issues.

---

## 5. DEPLOYMENT CHECKLIST

- [ ] Tests pass in CI
- [ ] Security scan passes
- [ ] Docker image builds successfully
- [ ] Environment variables configured
- [ ] Health checks implemented
- [ ] Rollback plan in place