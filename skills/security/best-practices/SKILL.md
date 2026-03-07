---
name: best-practices
description: "You MUST use this for all design and implementation. It provides 25+ standards for security, performance, and accessibility."
---

# Skill: Leading Security & Best Practices

## Overview

The [SEC] and [ARCH] agents use this skill to ensure all code matches the **OWASP Top 10** and **Modern Engineering Performance** benchmarks.

## Core Pillars

### 1. Security by Design

- **Zero Secrets**: Never hardcode keys. Use `.env` or secret managers.
- **Input Sanitization**: Always sanitize user input (SQLi, XSS, CSRF prevention).
- **Least Privilege**: Only request necessary permissions.

### 2. Efficiency (Big O Aware)

- **Latent Optimization**: No synchronous blocks on the main thread (JS/Python).
- **Reduced Payloads**: Minimize bundle size. Use Gzip/Brotli.
- **Query Precision**: No `SELECT *`. Only fetch what you need.

### 3. Accessibility (a11y)

- **WCAG Compliance**: ARIA labels, semantic HTML, keyboard navigability.
- **Inclusive Design**: Contrast testing, font readability.

---

**[SEC] Security standards applied.** Zero vulnerabilities is the only acceptable baseline.
