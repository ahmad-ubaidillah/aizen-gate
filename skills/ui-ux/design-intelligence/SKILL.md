# 🎨 Design System Intelligence Engine [Skill]

- **Role:** [DESIGN] - UI UX Pro Max
- **Description:** Industrial-strength design reasoning for creating premium digital interfaces.

## 🛠️ Reasoning Rules (Samples)

1. **Fintech/Banking:** Prioritize trust (Deep Blues, Emerald Greens). Clear, legible sans-serif for numbers. High contrast with zero visual clutter.
2. **Creative Portfolio:** Brutalist or Editorial aesthetic. Experimental layouts, large typography, high-impact imagery. Mono-weight borders.
3. **E-commerce:** "Conversion-first" design. Prominent CTAs (Brand Primary), clear hierarchy, focus on product imagery.
4. **Developer Tools:** Dark mode by default. Monospace fonts for logic, high contrast, information-dense but organized.

## ⛩️ Design System Token Mapper

| Category      | Recommendation |
| ------------- | -------------- |
| **Fintech**   | `#003366`      |
| **Creative**  | `#000000`      |
| **Dev Tools** | `#0A0A0A`      |

## 🛡️ Anti-Patterns (Refuse these)

- Neon colors for corporate/banking sectors.
- Excessive shadows/gradients in minimal editorial layouts.
- Low contrast (WCAG < AA) in mission-critical info displays.

## ⚙️ Trigger

- **Command:** `npx aizen-gate identify-style --product fintech`
- **Output:** Writes to `aizen-gate/shared/design-system.md`.
