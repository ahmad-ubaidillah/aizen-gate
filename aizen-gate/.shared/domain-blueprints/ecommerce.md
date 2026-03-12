# Ecommerce Architecture Blueprint

## Order Processing Flow

```
[User] → [Cart] → [Checkout] → [Payment] → [Fulfillment] → [Delivery]
                                    ↓
                              [Inventory]
```

## Key Microservices

### 1. Product Service
```typescript
interface Product {
  id: string;
  name: string;
  sku: string;
  price: Money;
  inventory: Inventory;
  categories: string[];
  variants: Variant[];
}
```

### 2. Order Service
```typescript
interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: Money;
  tax: Money;
  shipping: Money;
  total: Money;
  status: OrderStatus;
  payment: Payment;
  shippingAddress: Address;
}
```

### 3. Inventory Service
```typescript
// Reserve inventory during checkout
async function reserveInventory(orderId: string, items: OrderItem[]) {
  for (const item of items) {
    await db.transaction(async (trx) => {
      const product = await trx.products
        .where('id', item.productId)
        .lock('FOR UPDATE')
        .first();

      if (product.inventory < item.quantity) {
        throw new InsufficientInventoryError();
      }

      await trx.products
        .where('id', item.productId)
        .decrement('inventory', item.quantity);

      await trx.reservations.insert({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        expiresAt: addMinutes(new Date(), 15)
      });
    });
  }
}
```

## Event Sourcing

### Events
- `product.created`, `product.updated`, `product.out-of-stock`
- `order.created`, `order.paid`, `order.shipped`, `order.delivered`
- `inventory.reserved`, `inventory.released`

### CQRS Pattern
```typescript
// Commands (Write)
async function createOrder(command: CreateOrderCommand) {
  // Validate, reserve inventory, process payment
}

// Queries (Read)
async function getOrderDetails(id: string): Promise<OrderView> {
  return readDb.orderViews.where('id', id).first();
}
```

## Payment Integration

### Stripe Flow
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: order.total * 100,
  currency: 'usd',
  customer: customer.stripeCustomerId,
  metadata: { orderId: order.id },
  automatic_payment_methods: { enabled: true }
});
```

## Scalability Patterns

| Pattern | Use Case |
|---------|----------|
| Read replicas | Product catalog |
| Caching (Redis) | Product details, sessions |
| CDN | Images, static assets |
| Queue (SQS) | Order processing |
| Event-driven | Inventory updates |

## Cart Abandonment
1. Save cart state in Redis (30 days)
2. Email reminder after 1 hour
3. Offer discount after 24 hours
