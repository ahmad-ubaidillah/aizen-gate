---
name: "Design System Intelligence & UI Generation"
description: "A workflow for the [DESIGN] agent to create consistent, high-end, editorial-quality design systems and implement stunning UIs."
authors: ["Aizen-Gate Team"]
status: "premium"
---

# UI/UX Design System Skill

The goal of this skill is to provide the **"Editorial Aesthetic"** to the user. Every project should look premium, minimalist, and high-contrast by default.

## Roles Involved

- **[DESIGN] Designer**: Primary owner of the vision and system.
- **[DEV] Developer**: Implementation and styling.
- **[SA] Scrum Master**: Quality and style gatekeeper.

## The Workflow

### Phase 1: Context & Strategy (Generation)

1. **[DESIGN]** Analyzes project requirements and product category (SaaS, Healthcare, E-commerce, etc.).
2. **[DESIGN]** Selects a core style (Minimalism, Glassmorphism, Aurora UI, Bento Grid) and color palette.
3. **[DESIGN]** Defines the **typography pairing** (Inter + Outfit or Playfair Display + Montserrat).
4. **[DESIGN]** Creates a **Design System Plan** (similar to `design-system/MASTER.md`).

### Phase 2: Design Assets & Tokens

5. **[DESIGN]** Generates the necessary design system tokens (colors, fonts, spacing, shadows).
6. **[DESIGN]** Creates SVG icons using a library like Lucide or Heroicons (NO emojis as icons).
7. **[DESIGN]** Defines the grid and responsive breakpoints (375px, 768px, 1024px, 1440px).

### Phase 3: High-Fidelity Implementation

8. **[DEV]** Implements the UI using the Design System Plan.
9. **[DESIGN]** Reviews the UI for adherence to the editorial aesthetic.
10. **[DESIGN]** Adds **subtle micro-animations** (150-300ms transitions, hover states, entrance effects).

## UI/UX Reasoning Rules (Inspired by Pro-Max)

- **Contrast is King**: Ensure a minimum 4.5:1 contrast ratio for all text.
- **Micro-animations**: Use 200-300ms transitions for all hover and click states.
- **Bento Grids**: Use for dashboards and feature showcases to keep layouts organized.
- **Organic Shapes**: Use subtle border radii (8-16px) for a soft, premium feel.
- **Negative Space**: Leave room for elements to breathe. Minimalist style requires generous padding.
- **Dark Mode by Design**: Every design system MUST include a dark mode variant.

## Anti-Patterns to Avoid

- **No AI Gradients**: Avoid the generic purple/pink/blue AI gradients unless specifically requested.
- **No Emojis as UI**: Always use professional SVG icons.
- **Avoid Defaults**: Never use browser-default buttons or fonts like Times New Roman or Arial.
- **No Hardcoded Colors**: Always use design tokens for primary, secondary, and background colors.

## Verification Checklist

- [ ] Does the UI follow the Design System Plan?
- [ ] Is it responsive across all breakpoints?
- [ ] Is the primary CTA above the fold?
- [ ] Are all interactive elements clear and provide feedback?
- [ ] Does it work in both light and dark modes?
- [ ] Is the contrast sufficient for accessibility (WCAG AA)?
- [ ] Does it FEEL premium?
