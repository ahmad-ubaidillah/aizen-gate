# i18n Master - Localization Standards

## Locale Format

### Language Codes
```
en-US  → English (United States)
en-GB  → English (United Kingdom)
es-ES  → Spanish (Spain)
es-MX  → Spanish (Mexico)
fr-FR  → French (France)
de-DE  → German (Germany)
ja-JP  → Japanese (Japan)
zh-CN  → Chinese (Simplified)
zh-TW  → Chinese (Traditional)
pt-BR  → Portuguese (Brazil)
```

### File Structure
```
locales/
  en/
    common.json
    auth.json
    errors.json
  es/
    common.json
    auth.json
    errors.json
```

## Translation Workflow

### 1. Key Naming Convention
```json
{
  "common.buttons.submit": "Submit",
  "common.buttons.cancel": "Cancel",
  "auth.login.title": "Sign In",
  "auth.login.email": "Email address",
  "errors.notFound": "Page not found"
}
```

### 2. Interpolation
```json
{
  "welcome.user": "Welcome, {name}!",
  "items.count": "{count} item(s)",
  "date.format": "{date, date, medium}"
}
```

### 3. Pluralization
```json
{
  "cart.items": "{count, plural, =0 {No items} =1 {1 item} other {# items}}"
}
```

## Date/Time Formatting

### Date Formats
| Locale | Short | Medium | Long |
|--------|-------|--------|------|
| en-US | 1/15/24 | Jan 15, 2024 | Monday, January 15, 2024 |
| ja-JP | 2024/1/15 | 2024年1月15日 | 2024年1月15日(月曜日) |

### Time Formats
```
en-US: 3:30 PM
ja-JP: 15:30
de-DE: 15:30 Uhr
```

## Currency Formatting

```typescript
const formatCurrency = (amount: number, locale: string, currency: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
};

formatCurrency(99.99, 'en-US', 'USD');  // $99.99
formatCurrency(99.99, 'ja-JP', 'JPY');   // ¥100
formatCurrency(99.99, 'de-DE', 'EUR');   // 99,99 €
```

## RTL Support

### CSS Variables
```css
[dir="rtl"] {
  --spacing-left: var(--spacing-right);
  --spacing-right: var(--spacing-left);
}

[dir="rtl"] .icon-chevron-right {
  transform: scaleX(-1);
}
```

### Layout Patterns
- Start-aligned text for LTR, end for RTL
- Mirrored icons for navigation arrows
- Swapped margins/padding for symmetrical elements
