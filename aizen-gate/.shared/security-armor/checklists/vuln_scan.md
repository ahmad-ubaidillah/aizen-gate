# Vulnerability Scan Checklist

## Pre-Scan Preparation
- [ ] Notify stakeholders of scan window
- [ ] Verify backups are current
- [ ] Review previous scan results
- [ ] Prepare remediation plan
- [ ] Ensure staging environment is accessible

## Automated Scanning

### SAST (Static Application Security Testing)
- [ ] Run on every PR
- [ ] Check for: SQL injection, XSS, CSRF
- [ ] Verify secure coding patterns

### DAST (Dynamic Application Security Testing)
- [ ] Scan production-like environment
- [ ] Test authentication flows
- [ ] Crawl all endpoints
- [ ] Check for exposed sensitive data

### SCA (Software Composition Analysis)
- [ ] Scan dependencies
- [ ] Check for known CVEs
- [ ] Review license compliance
- [ ] Update vulnerable packages

## Manual Testing

### Authentication
- [ ] Test password reset flows
- [ ] Verify session management
- [ ] Check for privilege escalation
- [ ] Test 2FA if implemented

### Authorization
- [ ] Test horizontal privilege access
- [ ] Test vertical privilege access
- [ ] Verify role-based access

### Input Validation
- [ ] Test file upload functionality
- [ ] Test API inputs
- [ ] Test search parameters

## Post-Scan Actions

### Risk Assessment
| Severity | Action | Timeline |
|----------|--------|----------|
| Critical | Immediate fix | 24 hours |
| High | Schedule fix | 1 week |
| Medium | Plan fix | 1 month |
| Low | Track fix | Next sprint |

### Remediation
- [ ] Fix identified vulnerabilities
- [ ] Re-test fixes
- [ ] Update documentation
- [ ] Share learnings with team

### Reporting
- [ ] Executive summary
- [ ] Technical details
- [ ] Remediation status
- [ ] Trend comparison
