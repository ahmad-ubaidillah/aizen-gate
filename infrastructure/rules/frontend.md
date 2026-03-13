---
trigger: glob
glob: "**/*.{js,jsx,ts,tsx,css,scss,html,vue,svelte,dart,swift,kt,xml}"
---

# FRONTEND.MD - Client-Side Mastery

> **Objective**: Unified management of Web & Mobile UI. One source of truth for user experience.

---

## 1. PREMIUM UX/UI

### 1.1 Aesthetics
1. **Colors**: Use tuned HSL colors.
2. **Typography**: Standard fonts (Inter/Roboto).
3. **Spacing**: 4px/8px grid system. Whitespace is luxury.

### 1.2 Visual Feedback
1. **Interactions**: Every click/tap must have immediate visual response.
2. **Loading States**: Show spinners or skeletons during async operations.
3. **Error States**: Display clear error messages with recovery options.

---

## 2. MOBILE & RESPONSIVE

### 2.1 Touch Targets
1. **Size**: Buttons minimum 44x44px (thumb standard).
2. **Spacing**: Adequate spacing between tappable elements.

### 2.2 Mobile-First
1. **CSS**: Code for mobile first, override for desktop.
2. **Safe Areas**: Respect notch and home indicator on iOS/Android.
3. **Viewport**: Proper meta viewport tag.

---

## 3. PERFORMANCE DOMAIN

### 3.1 Core Web Vitals
- LCP < 2.5s
- CLS < 0.1
- FID < 100ms

### 3.2 Optimistic UI
- Update UI BEFORE API returns (Zalo/Facebook style).
- Rollback on error with clear feedback.

### 3.3 Asset Optimization
- Use WebP for images.
- Lazy load videos.
- Code split for routes.

---

## 4. STATE & COMPONENT

### 4.1 Atomic Design
- Small, reusable components (`<Button />`, `<Input />`).
- Compose complex UI from simple parts.

### 4.2 State Management
- **Server State**: Use TanStack Query (React Query).
- **Client State**: Use Zustand or Context.
- **Form State**: Use React Hook Form or similar.

---

## 5. ACCESSIBILITY (A11Y)

1. **ARIA**: Proper roles and labels.
2. **Keyboard**: Full keyboard navigation.
3. **Contrast**: WCAG AA minimum (4.5:1).
4. **Focus**: Visible focus indicators.

---

## 6. CODE ORGANIZATION

```
src/
  components/    # Reusable UI components
  pages/         # Route pages
  hooks/         # Custom hooks
  services/     # API calls
  stores/        # State management
  utils/         # Helper functions
  types/         # TypeScript definitions