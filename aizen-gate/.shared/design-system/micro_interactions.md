# Micro-Interactions Guide

## Button Interactions
```css
/* Hover Scale */
.btn:hover {
  transform: scale(1.02);
  transition: transform 150ms ease;
}

/* Press Effect */
.btn:active {
  transform: scale(0.98);
}

/* Loading Spinner */
.btn.loading {
  pointer-events: none;
}
.btn.loading::after {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
```

## Form Interactions
```css
/* Input Focus */
.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
  outline: none;
}

/* Validation States */
.input.error {
  border-color: var(--color-error);
}
.input.valid {
  border-color: var(--color-success);
}

/* Floating Label */
.input-group {
  position: relative;
}
.input-group label {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: all 150ms ease;
}
.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label {
  top: 0;
  font-size: 12px;
  color: var(--color-primary);
}
```

## Feedback Animations

### Success Checkmark
```css
@keyframes checkmark {
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
}
.checkmark {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: checkmark 0.4s ease forwards;
}
```

### Skeleton Loading
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-200) 25%,
    var(--gray-100) 50%,
    var(--gray-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### Toast Notifications
```css
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.toast {
  animation: slideIn 0.3s ease;
}
@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
.toast.removing {
  animation: slideOut 0.3s ease forwards;
}
```

## Timing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## Duration Standards
| Type | Duration |
|------|----------|
| Instant | 100ms |
| Quick | 150ms |
| Normal | 200ms |
| Slow | 300ms |
| Page transition | 500ms |
