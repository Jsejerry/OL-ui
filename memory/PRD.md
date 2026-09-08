# One Latur - Customer Grocery App

## MVP Overview
A Blinkit-style grocery shopping mobile app for One Latur (Latur, MH). Customer app with 10-minute delivery focus, local store discovery, coupons, live order tracking, reorder, and store follow.

## Features Implemented
- **Home (Blinkit-style)**: Dark location header, search bar, horizontal Discover chip scroll bar (pastel traffic colors), pastel category grid, Buy Again carousel, Local Stores rail, Fresh Picks grid.
- **Followed Stores rail** on Home (pastel pink) - shows only when user follows at least one store.
- **Store Profile**: 2×2 media header (2 videos + 2 images) with playable video tiles, overlapping centered logo, metadata pills, tags, **Follow button** (heart), category chip filter with real names, product grid.
- **Product Detail**: Hero image, price/MRP/savings, features, sticky Add-to-Cart CTA with stepper.
- **Cart**:
  - Item list with steppers, delivery card, free-delivery nudge (₹199+).
  - **Coupon input** with Apply/Remove, validates via `/api/coupons/apply` (LATUR10 10%, FRESH50 ₹50, WELCOME ₹25).
  - Bill details with items, discount, coupon line, delivery fee, grand total, savings banner.
  - Sticky checkout bar that creates an order via `/api/orders` and navigates to live tracking.
- **Live Order Tracking (`/order/[id]`)**: ETA countdown, animated rider 🛵 moving along an SVG dashed route with store→home markers, rider profile card + call CTA, status timeline (Placed → Packed → Out → Delivered) that progresses over time, order items list, grand total.
- **My Orders (`/orders`)**: Past orders list with product thumbnails, status pill, **Track** + **Reorder** (one-tap adds all items back to cart) with haptic + "Added" confirmation.
- **Categories tab** + **Category Detail** with pastel header.
- **Account tab**: Profile, "My Orders" row deep-links to `/orders`.

## Tech
- Expo Router file-based tabs + stack
- FastAPI + Mongo (orders persisted). Products/categories/stores/banners/coupons seeded in memory.
- Cart persisted in AsyncStorage; followed stores persisted in AsyncStorage.
- react-native-reanimated + react-native-svg for the rider animation.
- Design tokens in `src/theme.ts` (One Latur dark brand + Blinkit yellow accent + pastel traffic colors).

## Auth
Deferred per user request. App launches directly to Home.
