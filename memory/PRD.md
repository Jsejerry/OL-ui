# OneCity — Hyperlocal Shopping & Discovery

## Latest request (iteration4)
Rebrand to **OneCity** with uploaded small logo above location; exact #76EC00 gradient across header AND home ad area. Five departments now **Food, Groceries, Shops, Pharmacy & Beauty, Book It**. User approved sample fashion/electronics/homeware for Shops, explicitly wants real AI photo/voice search, demo wallet, and a floaty, curved, translucent UI with smaller text/icons. Reels need Shop Now and tappable brand logos linking a multi-product collection, starting Amul cheese.

### Implemented this iteration
- Updated header with managed uploaded OneCity logo, location beneath, top-right wallet/cart/profile and full-width search with working mic/camera routes.
- Seamless matching header/ad gradients per department. Important: tab/stack scenes must remain opaque to avoid seeing retained screens behind translucent content. Header ends at palette.mid and BrandSpotlight starts at same color.
- Animated organic BrandSpotlight instead of ad cards; floating packshot and glass stickers; home story switcher. Reduced-motion preference honoured.
- Groceries includes Amul, Shops adds Nike/boAt/Home Edit, Care combines old pharmacy+beauty. Old routes still lead to combined page.
- Brand collections at `/brand/[id]`: Amul four products, follow and store profile, real cart integration.
- Reels: Amul and NIVEA sample motion ads plus McDonald's stock clip. Logos open brand collection, Shop Now opens featured product, prior likes/share/cart retained. NativeMP4 and browserWebM stored in managed object storage.
- Demo wallet with starting₹250, local demo₹100 top-up/activity; not real money, cannot be used at checkout.
- Real AI image search via OpenAI **gpt-5.4**, Whisper voice transcription followed by GPT-5.4 catalogue matching. Existing server-only universal key. Backend `ai_search.py`, frontend `smart-search.tsx` and `voice-search-control.tsx`.
- Image multipart -> JPEG normalisation -> private managed object storage -> transient base64 vision SDK. No public route for private search photos. Voice up to20s decoded/validated to temporary WAV, transcribed and discarded. Error/loading/retry/permission states; Mongo-backed global demo budget60searches/hour.
- Expo audio/image-picker/image-manipulator added; iOS/Android permission descriptions configured. Native device permission flows still require device verification.
- AI playbooks: installed emergentintegrations0.2.0 source verified `OpenAISpeechToText.transcribe` is **async**, accepts binary file plus model. Ignore earlier inaccurate tool recipe claiming sync/path-only. `LlmChat.stream_message` used for structured catalogue inference.

### Verification this iteration
- TypeScript and new-code lints pass.
- Real photo search recognised Amul cheese and returned catalogue a1.
- Mobile screenshots: logo/header/new Shops, reel playback/Amul logo->collection, demo wallet top-up verified. Follow-up adjusted seamless gradients and reel contrast.
- Comprehensive iteration4 testing pending; MUST include actual voice+photo backend and UI, new/old navigation, wallet persistence and regression shopping flows.
- Product images audited: original bbassets file name misleading. Actual imagea1 = Amul Pure Milk Cheese1kg; a4 = Cheese Cubes200g. Listings corrected. Butter replaced with actual dairy packshot. Generated isolated Amul illustration used only in sample ad.

### Pending separate request
Security audit of deployed app was requested but never started: asked for deployed URL; user instead continued with this redesign. Only preview URL available. Do not claim security audit performed.

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