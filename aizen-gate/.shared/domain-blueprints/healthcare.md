# Healthcare Architecture Blueprint

## HIPAA Compliance

### PHI (Protected Health Information) Categories
1. Patient identifiers (name, SSN, DOB)
2. Medical records
3. Payment/billing information
4. Any information linking to patient

### Technical Safeguards

#### Encryption
```typescript
// Encrypt PHI at rest
const encryptPHI = (data: string): string => {
  const key = await getEncryptionKey();
  return crypto.AES.encrypt(data, key).toString();
};

// Encrypt PHI in transit (always use TLS)
const options = {
  https: {
    key: fs.readFileSync('private.key'),
    cert: fs.readFileSync('certificate.crt')
  }
};
```

#### Access Control
```typescript
// Role-based access to PHI
const accessMatrix = {
  'physician': ['read', 'write', 'patient_data'],
  'nurse': ['read', 'patient_data'],
  'billing': ['read', 'billing_info'],
  'admin': ['read', 'write', 'audit_logs']
};
```

### Audit Logging
```sql
CREATE TABLE phi_audit_log (
    id UUID PRIMARY KEY,
    user_id UUID,
    action VARCHAR(50),
    patient_id UUID,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent VARCHAR(500),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN
);
```

## FHIR Integration

### Resources
- Patient, Practitioner
- Encounter, Observation
- MedicationRequest, DiagnosticReport
- Appointment, Schedule

### API Example
```bash
GET /fhir/Patient?name=John&birthdate=1980-01-01
GET /fhir/Observation?patient=Patient/123&category=vital-signs
POST /fhir/Patient
```

## Data Retention
| Data Type | Retention Period |
|-----------|------------------|
| Medical Records | 7 years minimum |
| Billing Records | 7 years |
| Audit Logs | 6 years |
| Imaging | 5 years |

## Breach Notification
- Notify HHS within 60 days
- Notify affected individuals
- Press release for >500 records
