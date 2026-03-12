# Test Scenarios

## Authentication Scenarios
- Valid login → Dashboard
- Invalid credentials → Error message
- Empty fields → Validation errors
- Account locked after 5 failed attempts
- Password reset flow
- Session expiry

## Payment Scenarios
- Successful payment → Order confirmation
- Card declined → Error message
- Invalid card number → Validation
- Payment timeout → Retry option
- Partial refund → Updated total

## Cart Scenarios
- Add item → Cart count updates
- Remove item → Cart updates
- Update quantity → Price recalculates
- Apply coupon → Discount applied
- Empty cart → Empty state shown

## Order Scenarios
- Create order → Confirmation page
- View order history
- Cancel order → Status updates
- Order out of stock → Notification
- Order delivered → Status changes

## Search Scenarios
- Valid search → Results displayed
- No results → Helpful message
- Special characters → Escaped
- Search suggestions → Auto-complete

## API Scenarios
- Valid request → 200 OK
- Unauthorized → 401
- Not found → 404
- Validation error → 422
- Server error → 500

## Edge Cases
- Network offline → Offline indicator
- Session timeout → Redirect to login
- Concurrent updates → Last write wins
- Large file upload → Progress indicator
- Slow network → Timeout handling
