# Domain Blueprints

## Overview
Industry-specific architecture patterns and best practices for common domain applications.

## Available Blueprints

### 1. Fintech
Financial services require high security, compliance, and reliability.

**Key Characteristics:**
- ACID transactions
- Real-time processing
- Regulatory compliance (PCI-DSS, SOX)
- Audit logging
- Fraud detection

**Common Patterns:**
- Event sourcing for financial events
- Dual-entry bookkeeping
- Idempotency for payments
- Reconciliation systems

### 2. Healthcare
Healthcare applications must protect PHI and follow HIPAA.

**Key Characteristics:**
- PHI protection
- Interoperability (HL7, FHIR)
- Audit trails
- Data retention policies

**Common Patterns:**
- FHIR-based APIs
- Consent management
- De-identification for analytics

### 3. Ecommerce
Ecommerce requires scalable, resilient architectures.

**Key Characteristics:**
- High traffic handling
- Inventory management
- Payment processing
- Order fulfillment

**Common Patterns:**
- Microservices for scalability
- Event-driven architecture
- CQRS for read/write separation
- CDN for static assets
