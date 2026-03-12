# UI/UX Pro Max

## Overview
Advanced interaction patterns, animations, and micro-interactions for premium user experiences.

## Animation Guidelines

### Transitions
```css
/* Page Transitions */
.page-enter {
  opacity: 0;
  transform: translateY(10px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

/* Modal */
.modal-enter {
  opacity: 0;
  transform: scale(0.95);
}
.modal-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: all 200ms ease-out;
}
```

### Micro-Interactions

#### Button Press
```css
.btn {
  transition: transform 100ms ease;
}
.btn:hover {
  transform: scale(1.02);
}
.btn:active {
  transform: scale(0.98);
}
```

#### Loading States
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}
```

#### Success Feedback
```css
.success-icon {
  animation: checkmark 0.4s ease-out forwards;
}
@keyframes checkmark {
  0% { stroke-dashoffset: 50; }
  100% { stroke-dashoffset: 0; }
}
```

## Advanced Patterns

### Skeleton Loading
```tsx
const UserCardSkeleton = () => (
  <div className="card">
    <div className="skeleton avatar" />
    <div className="skeleton text" style={{ width: '60%' }} />
    <div className="skeleton text" style={{ width: '40%' }} />
  </div>
);
```

### Infinite Scroll
```tsx
const useInfiniteScroll = (fetchMore) => {
  const observer = useRef();

  const lastElement = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return lastElement;
};
```

## Performance

### Animation Checklist
- Use transform/opacity only
- Avoid layout-triggering properties
- Use will-change sparingly
- Test on low-end devices
- Prefer CSS over JS animations
