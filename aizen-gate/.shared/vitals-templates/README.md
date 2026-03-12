# Vitals Templates

## Overview
Performance benchmarks, SLA definitions, and metrics for system vitals monitoring.

## Core Web Vitals

### LCP (Largest Contentful Paint)
| Score | Time | Status |
|-------|------|--------|
| Good | < 2.5s | ✅ |
| Needs Improvement | 2.5s - 4s | ⚠️ |
| Poor | > 4s | ❌ |

### FID (First Input Delay)
| Score | Time | Status |
|-------|------|--------|
| Good | < 100ms | ✅ |
| Needs Improvement | 100ms - 300ms | ⚠️ |
| Poor | > 300ms | ❌ |

### CLS (Cumulative Layout Shift)
| Score | Value | Status |
|-------|-------|--------|
| Good | < 0.1 | ✅ |
| Needs Improvement | 0.1 - 0.25 | ⚠️ |
| Poor | > 0.25 | ❌ |

## SLA Definitions

### Standard Tier
| Metric | Target |
|--------|--------|
| Uptime | 99.9% |
| API Response (p95) | 500ms |
| Error Rate | < 1% |
| Support Response | 24 hours |

### Premium Tier
| Metric | Target |
|--------|--------|
| Uptime | 99.99% |
| API Response (p95) | 200ms |
| Error Rate | < 0.1% |
| Support Response | 4 hours |

## Performance Budget

### JavaScript
- Initial bundle: < 170KB gzipped
- Total JS: < 500KB gzipped
- Third-party: < 200KB gzipped

### CSS
- Total CSS: < 50KB gzipped

### Images
- Next-gen formats (WebP/AVIF)
- Lazy load below fold
- Responsive images

### Fonts
- Subset for language
- Preload critical
- Use font-display: swap

## Monitoring Tools

### Real User Monitoring
- Google Analytics
- Sentry
- Datadog

### Synthetic Monitoring
- Lighthouse CI
- WebPageTest
- Calibre
