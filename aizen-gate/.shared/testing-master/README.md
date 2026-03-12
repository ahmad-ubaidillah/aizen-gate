# Testing Master

## Overview
TDD strategies, E2E testing patterns, and test coverage guidelines.

## Testing Pyramid

```
        /\
       /  \      E2E Tests (10%)
      /----\     Few, slow, expensive
     /      \
    /--------\  Integration Tests (20%)
   /          \ More, medium speed
  /------------\ Unit Tests (70%)
 /              \ Many, fast, cheap
```

## Unit Testing

### Structure (AAA Pattern)
```typescript
describe('OrderService', () => {
  describe('calculateTotal', () => {
    it('should calculate total with tax', () => {
      // Arrange
      const order = {
        items: [
          { price: 100, quantity: 2 },
          { price: 50, quantity: 1 }
        ],
        taxRate: 0.1
      };

      // Act
      const total = calculateTotal(order);

      // Assert
      expect(total).toBe(275); // (100*2 + 50*1) * 1.1
    });
  });
});
```

### Best Practices
- Test one thing per test
- Use descriptive names: `it('should...')`
- Avoid test interdependencies
- Use beforeEach for setup

## Integration Testing

### API Testing
```typescript
describe('POST /api/orders', () => {
  it('should create order with valid data', async () => {
    const order = {
      items: [{ productId: 'prod_123', quantity: 1 }],
      customerId: 'cust_456'
    };

    const response = await request(app)
      .post('/api/orders')
      .send(order)
      .expect(201);

    expect(response.body.id).toBeDefined();
  });
});
```

## E2E Testing

### Playwright Example
```typescript
import { test, expect } from '@playwright/test';

test('user can checkout', async ({ page }) => {
  await page.goto('/products');

  await page.click('[data-product-id="123"]');
  await page.click('text=Add to Cart');

  await page.click('text=Checkout');
  await page.fill('[name="email"]', 'test@example.com');

  await page.click('text=Place Order');

  await expect(page.locator('text=Order confirmed')).toBeVisible();
});
```

## Coverage Targets

| Level | Target | Minimum |
|-------|--------|---------|
| Unit | 80% | 70% |
| Integration | 60% | 50% |
| E2E | Critical paths | Critical paths |

### What to Test
- Business logic
- Edge cases
- Error handling
- Authentication/authorization
