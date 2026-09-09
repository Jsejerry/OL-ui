# One Latur — Hyperlocal Shopping & Discovery

## Current request
User supplied grocery home screenshot and lime-green/black One Latur logos. Wants header location then company name, search then cart/profile, persistent five-department strip (Food, Grocery Shop, Pharmacy, Beauty, Book It) on all routes except reels, ads/trending/top picks and department showcases, named food brands, grocery imagery, pharmacy/beauty brands and products, movie/event/activity booking options. Bottom navigation: Home, Categories, raised black-circle/lime “1” reels button, Food, Book It. Each department has a distinct visual feel. Product reels have like/share/cart.

User explicitly approved sample brand/product/video content and demo booking enquiries, not actual ticket payments. Auth remains intentionally skipped.

## Architecture
- Expo Router / React Native frontend (installed SDK57 is source of truth), FastAPI backend, MongoDB.
- Global `AppShell` wraps stack and supplies location/company/search/cart/profile and `DepartmentStrip`. Hidden only on `/reels`. Safe area top consumed once; children receive top=0.
- Custom five-item bottom tabs; cart/account/grocery/pharmacy/beauty are hidden tab destinations accessible from header/department strip.
- `src/theme.ts` light theme extended with lime/forest and department-specific food/cyan/rose/purple tokens.
- `src/use-catalog.ts` React Query catalogue, `src/api.ts` backend URL from Constants app config; relative managed-media URLs normalised.
- Existing cart/followed stores and new local reel likes and booking history persisted with AsyncStorage.
- `backend/catalog_data.py` approved sample data extends original product/store/category IDs without breaking orders.
- Mongo persists orders, booking enquiries, curated media metadata. Catalogue itself remains sample in-memory data.
- `backend/media_store.py`: managed object storage handshake and allow-listed public catalogue media proxy with byte ranges; server-only key.
- `backend/seed_media.py` idempotent catalogue image/logo/MP4 import; `transcode_reels.py` browser VP9 alternatives. Native uses original MP4. Browser Chromium in this environment does NOT support H264 (`canPlayType` empty); WebM verified playing. Cache-control was NOT the cause despite an incorrect troubleshooting report.

## Implemented
- Reference-inspired light home with lime accents, promotional photo carousel, Trending cards, Top Picks, Food brands (McDonald's/KFC/Starbucks/Burger King/Domino's), grocery imagery, pharmacy/beauty brand rails and products, Book It previews, neighbourhood stores. Followed stores are placed first.
- Five persistent, distinct department experiences; interactive brand/category filters and no-results reset.
- Header editable sample delivery area, persistent cart badge, profile, live product search with department filters and curated collections.
- All-categories screen spanning every department and movie/event/activity shortcuts.
- Three fullscreen product videos with like persistence, native share/browser copy-link sheet, real cart integration, pause/mute/next, pause offscreen/background, error state, and hidden top strip.
- Book It movies/events/activities, validated date/slot/1–8 guests/contact enquiry, Mongo persistence, reference confirmation and local saved enquiry history. Clear demo notices: no ticket, payment or venue contact.
- Existing store profiles (2 videos/2 images, centred logo, follow), details, cart/coupons, checkout, animated sample rider tracking, orders/reorder preserved.
- Cart coupon recalculation follows quantity changes; minimum spend warning, free delivery at ₹199+, checkout failure feedback, updated bottom spacing.

## Verification
- TypeScript check passes. Python lint passes. New frontend component lint passes.
- Screenshots verified Home/Food/Beauty/Book It, reels playback (`currentTime > 0`), like/add/cart, browser share copied, top strip hidden/restored.
- Comprehensive regression report: `/app/test_reports/iteration_3.json`; backend suite 14/14 passed, core frontend flows verified at 390x844 and 360px.
- Post-report fixes verified: cart checkout occupies reserved non-overlapping space, natural coupon Apply taps pass at both widths; blocked Lays image replaced with managed image (including persisted cart/old order display); discovery chip filters implemented; order-fetch errors show retry and retry recovery was browser-tested.
- Fullscreen video measures390x772 and plays in mobile preview. All five food logos are managed and render. Book It and Beauty final image-loaded screenshots verified.
- Removed direct deprecated pointerEvents/shadow props from app code. One dependency-origin pointerEvents warning remains non-blocking; no render errors. Native device testing not performed; phone browser preview only.

## Backlog
### P0
- No known outstanding functional issues in the requested redesign. Awaiting user verification.
### P1 (requires user request)
- Real onelatur.com catalogue/API connection and real availability.
- Real ticket provider/payment integration; currently demo enquiries only.
- Auth when requested (explicitly deferred).
- Native device verification (video, sharing, keyboard/safe areas).
### P2
- Real merchant product reels and richer personalised discovery.
- Current order tracking is simulated, not live GPS.
- Existing profile contains legacy placeholder account actions; no authentication implemented.

## Credentials
No auth accounts. `memory/test_credentials.md` documents booking test values; server-side managed storage credentials are in backend environment only.

## Managed storage note
Storage integration proxy default URL fallback is the required integration-playbook contract, deliberately retained (not a hardcoded app backend URL). Never expose storage credentials to the frontend.