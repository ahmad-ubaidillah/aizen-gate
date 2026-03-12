# Infrastructure Blueprints

## Overview
Terraform, Docker, and infrastructure-as-code patterns for consistent deployments.

## Docker Best Practices

### Multi-Stage Build
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Security
```dockerfile
# Don't run as root
USER node

# Use specific version, not latest
FROM node:20.11.0-alpine3.19

# Scan for vulnerabilities
RUN npm audit --audit-level=moderate
```

## Terraform Structure

### Project Layout
```
terraform/
  ├── environments/
  │   ├── dev/
  │   │   ├── main.tf
  │   │   ├── variables.tf
  │   │   └── outputs.tf
  │   ├── staging/
  │   └── prod/
  ├── modules/
  │   ├── vpc/
  │   ├── ecs/
  │   ├── rds/
  │   └── s3/
  └── backend.tf
```

### Backend Configuration
```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

## ECS/Fargate Deployment

### Task Definition
```json
{
  "family": "my-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "web",
      "image": "my-registry/web:latest",
      "portMappings": [
        { "containerPort": 3000 }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/my-app",
          "awslogs-region": "us-east-1"
        }
      }
    }
  ]
}
```

## Kubernetes Resources

### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    spec:
      containers:
      - name: web
        image: my-registry/web:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
```

## Environment Variables
```
NODE_ENV=production
LOG_LEVEL=info
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379
```
