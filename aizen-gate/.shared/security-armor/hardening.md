# Security Hardening Guide

## OS Hardening

### Linux Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw enable

# Disable unnecessary services
sudo systemctl disable telnet
sudo systemctl disable rsh
sudo systemctl disable rlogin

# Set password policy
sudo vim /etc/login.defs
# PASS_MIN_LEN 12
# PASS_MAX_DAYS 90
```

### SSH Hardening
```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
```

## Application Hardening

### Dependency Scanning
```bash
# npm audit
npm audit
npm audit fix

# Snyk
npx snyk test

# OWASP Dependency Check
./dependency-check.sh --project myapp
```

### Code Scanning
```bash
# Static analysis
npm run lint
npx eslint .

# Secret scanning
git-secrets --scan
```

## Network Security

### WAF Rules
```
# Block common attacks
- Block SQL injection patterns
- Block XSS patterns  
- Rate limit by IP
- Block known malicious IPs
```

### TLS Configuration
```nginx
# nginx.conf
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
```

## Monitoring & Response

### Intrusion Detection
- File integrity monitoring
- Log analysis
- Anomaly detection
- Alerting on suspicious activity

### Incident Response Plan
1. Identify and contain
2. Assess scope
3. Eradicate threat
4. Recover systems
5. Post-incident review
