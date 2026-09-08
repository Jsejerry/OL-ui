# One Latur - Customer Grocery App

## MVP Overview
A Blinkit-style grocery shopping mobile app for One Latur (Latur, MH). Customer app with 10-minute delivery focus, local store discovery, and Blinkit-familiar UX.

## Features Implemented
- **Home (Blinkit-style)**: Dark location header (One Latur brand), search bar, horizontal Discover chip scroll bar (pastel traffic colors), promotional banner carousel, pastel category grid, Buy Again product carousel, Local Stores rail, Fresh Picks product grid.
- **Discover chips**: Horizontal scrollable filter row at top of Home (Trending, New, Fresh, Bestseller, Under ₹99, Local, Organic, Combo) with pastel red/yellow/green/blue backgrounds.
- **Store Profile**: 2x2 media header (2 videos + 2 images) with playable video tiles, overlapping centered circular store logo, store name/tagline/rating/delivery, category chip filter, full product grid.
- **Product Detail**: Large hero image, delivery pill, price/MRP/savings, feature callouts, sticky Add-to-Cart CTA with stepper.
- **Cart**: Item list with steppers, bill details with savings & free-delivery threshold (₹199+), sticky glass-style checkout bar, success state.
- **Categories tab**: Full pastel category grid.
- **Category Detail**: All products in category with pastel header.
- **Account tab**: Profile card, common account rows.

## Tech
- Expo Router file-based tabs + stack
- FastAPI + Mongo (models via Pydantic; seeded in-memory catalog for now)
- React Query, expo-image, expo-video, react-native-vector-icons/ionicons, expo-haptics
- Cart persisted in AsyncStorage
- Design tokens in `src/theme.ts` (One Latur dark brand + Blinkit yellow accent + pastel traffic colors)

## Auth
Auth deferred per user request. App launches directly to Home tab.
