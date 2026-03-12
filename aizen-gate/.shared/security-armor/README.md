# Security Armor

## Overview
Hardening guidelines, security best practices, and vulnerability scanning procedures.

## Security Headers

### Required Headers
```typescript
// Express.js security headers
app.use(helmet());

// Custom configuration
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}));

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true
}));
```

### HSTS Configuration
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Authentication

### Password Requirements
```typescript
const passwordSchema = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};
```

### Rate Limiting
```typescript
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  message: { error: 'Too many requests' }
}));

// Strict endpoint limiting
app.use('/api/auth/login', rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Account locked' }
}));
```

## Input Validation

### SQL Injection Prevention
```typescript
// Never concatenate user input into queries
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);
```

### XSS Prevention
```typescript
// Sanitize user input
import DOMPurify from 'isomorphic-dompurify';

const sanitized = DOMPurify.sanitize(userInput);
```

## Data Protection

### Encryption
```typescript
// AES-256 for data at rest
const encrypt = (plaintext: string, key: Buffer) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { iv, encrypted, authTag };
};
```

### Environment Variables
```bash
# Never commit secrets
# Use .env files
NODE_ENV=production
SECRET_KEY=@#$%^&*()  # from secret manager
DB_PASSWORD=@#$%^&*() # from secret manager
```
