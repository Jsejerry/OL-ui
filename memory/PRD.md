# OneCity — Hyperlocal Shopping & Discovery

## Subcategory reference-layout refinement (current)
- User requested: "i want you to make a small change i want this type of scroll animation and same layout for subcategory"; clarified "make it look almost similar and position of everything search bar timer items". Keep existing company theme and persistent bottom navigation.
- Scoped to `/category/[id]` and category-only components; shared product cards on Home/collections remain unchanged.
- Reference-positioned back/title/delivery-address/share/search header; search icon expands local search. Delivery address uses existing global location editor/state. Header compresses 65→52px as products scroll; solid sticky Filters/Sort/Brand/Type row and independently scrollable ~23%-width sidebar.
- Borderless two-column product tiles: photo + top-right save heart, weight band + overlapping outlined ADD, derived per-100g/ml cost when pack data allows, price/MRP, green discount, name, actual sample rating and delivery-minute estimate. No fabricated stock counts/reviews/nutrition/bought-earlier badges.
- Filters, price/rating sorting, brand, pack size sheets. Local saved products persist via AsyncStorage and can be filtered; responsive widths preserve two columns at360/390. Spring entrance respects reduced-motion settings. Product details/cart increment/decrement/popups retained.
- Subcategory-only centred compact cart pill with product thumbnails, View cart, item count/subtotal and arrow, above unchanged bottom navigation. Other pages retain their larger cart strip.
- TypeScript passed; loaded390px screenshots confirm reference layout, ADD and compact cart, sort sheet. Comprehensive focused testing pending.

## Current update — categories, navigation and missing-media restoration
User requests incremental updates only: Instamart-inspired categories while keeping company lime/forest theme; 5 themed stores with original 3D bags, Indian Ganesh Chaturthi/Navratri animation and subdued fitness animation; compact catalogue, long scrolling Home/categories, scroll-away departments; back and persistent bottom navigation on all pages; global add animation; many demo brands; richer AI. Follow-up bug: all previous icons and illustrations missing after import.

### Implemented and verified
- Root cause of missing images: imported MongoDB contained **zero catalog_assets records**. Re-ran legacy managed imports (seed_media.py, seed_city_media.py, seed_motion_assets.py, transcode_reels.py), restored 5 department icons/5 vendor illustrations, logo, product photos and browser/native reel files. Installed missing CairoSVG dependency. Replaced unavailable butter source with explicit illustrative artwork. Added bounded retry for transient storage PUT 500/502/503; no retries for quota/auth errors.
- 46 approved demo brands, 84 products, 32 categories; existing IDs preserved. New module store_catalog.py provides themed collections and product/brand expansion. seed_store_assets.py imports 5 individually generated bags and 18 isolated product illustrations into managed storage.
- Categories now scrolls with Home/department behaviour: 5-store rail, celebration banner, 8 category groups with 4-column tiles, budget shelves, brands, events and AI shortcut.
- /collection/[id]: Festive Time, Sports & Fitness, Trending Now, Gourmet Treats, Everyday Essentials; unique animated motifs, 2 festival modes, within-store search, budget/category filters, brand collections and dense products. Animations respect reduced motion.
- /category/[id]: compact 2-column products and image sidebar; search, price sorting, under-₹99 and brand filters; loading/retry/empty states.
- Root-level BottomNavigation replaces tab-only bar, remains on detail/search/assistant/checkout pages. Back buttons with direct-entry fallback; shared compact search/back after main headers scroll away. All major original routes retained.
- Global cart spring popup uses cart context add events from every source. Existing animated floating cart retained. Cards reduced to 99px images/140px rails with accessible 44px add controls. Persisted media URLs rebind to current backend after import.
- AI: real existing GPT-5.4 stream retained, 5 shopping starters, basket budgets ₹300/₹500/₹1000, vegetarian preference, trusted catalogue-derived cart review, context-aware collection prompt, validated recommendation totals and add-missing-items basket. No automatic cart changes or live price claims.
- Self-checks: TypeScript passes; modified Python/components lint pass. Pre-existing root icon prewarm lint warning remains. Mobile screenshots show restored 5 store bags, Home/category hub, festive/Navratri switching, and global add popup.
- Testing agent iteration7: existing backend tests15/15, new3/4; responsive UI/navigation/store/cart/AI/reels checks passed. Found one dead legacy store thumbnail. Replaced it with managed snacks, then preserved ALL other external legacy photographs in managed storage with `seed_legacy_media.py`. Catalogue/store/banner runtime payloads now use managed images only. Saved cart/order image fields refresh to canonical product images without changing prices/quantities.
- Testing agent iteration8 POST-FIX: iteration7 full suite4/4 and focused media/cart/orders3/3. All media decoded, all requested icons and illustrations load, previously missing product/store images restored. UI confirms cart reload persistence, order images and bottom nav. Reports `/app/test_reports/iteration_7.json`, `/app/test_reports/iteration_8.json`; no open bugs reported. Final store ordering prioritises each theme’s primary category (e.g. fitness equipment before snacks).

### P0 / P1 / P2
- P0: no open issues in verified update scope; await user feedback.
- P1: native iOS/Android haptics/voice/keyboard testing; live catalogue/fulfilment not part of current demo request.
- P2: saved themed shopping lists / seasonal collections.

### Architecture and data boundaries
Existing Expo Router + React Native frontend, FastAPI backend and MongoDB unchanged. Catalog data is explicitly user-approved demonstration content, not merchant integrations. Media is stored through existing managed storage proxy. Assistant sessions and sample orders/enquiries persist in MongoDB; cart persists in AsyncStorage. Current source files and original implementation documentation follow below.

## Latest request — interactive motion refresh (September 2026)
User explicitly requested incremental changes only: smaller logo, uploaded folded lime 1 button, tap -> Instagram-style Discover ad grid; long hold -> AI shopping assistant; preserve fullscreen reel layout. Instamart-inspired floating animated cart, Cart/One Saver tabs, scroll-away search/departments, green/white/black 3D category icons, curvy controls, small readable typography, five vendor illustrations and interactive delivery. Followup emphasized cool interactive animations in floating bars. User approved defaults and existing AI setup.

### Implemented and verified
- Smaller 76x22 existing OneCity header logo; SVG folded 1 matched to supplied reference, tap/hold distinction, glow pulse, press spring, native haptic and reduced-motion handling.
- Discover tab: 3-column mobile grid, filter chips, existing 3 playable ads plus 9 catalogue-derived photo ads (not fake videos). Tile opens selected fullscreen ReelCard; existing like/share/Shop Now/cart/brand flows retained.
- Green/white/black theme updates, curved cards and controls. Five individually generated clay category icons and five matching vendor portraits stored via managed object storage (`*-v2` keys). Seed script `backend/seed_motion_assets.py`; first sprite-sheet cutouts discarded due to loss of white details.
- `src/motion.tsx` scroll context + CityScroll on Home/Food/Groceries/Shops/Care/Book It: header/search/departments naturally translate away, compact Explore/Search pill remains; Explore scrolls to the category strip. Scroll offset tracked per screen.
- Floating cart on main tabs: product arc, spring entry/quantity bump, thumbnails, subtotal, real free-delivery progress and MRP savings. Cart state now emits add events with optional touch origin.
- Cart/One Saver tabs. One Saver fetches actual configured coupons, ranks applicable savings, applies selected coupon through API and returns to Cart. No subscription or paid membership implied.
- Five interactive illustrated packing crews: veggies, dairy (Amul shirt), food, care, shops. Cart wording uses future tense, since not ordered yet. Order page follows server order status; no fabricated packed confirmations. Sample notices retained. Existing checkout remains sample order creation without payment; button says Place sample order rather than falsely suggesting live payment.
- Real GPT-5.4 conversational assistant `/assistant`: streamed answers, Mongo-backed anonymous capability sessions, history, validated catalogue recommendations, add-to-cart cards, sample prices, clear error/retry, new chat, optional Whisper voice input for review before send.
- Backend `/api/assistant/sessions`, `/sessions/{id}`, `/chat` with input limits, per-session busy lease, shared AI rate budget, response timeout, validated product IDs. NDJSON streaming via XMLHttpRequest on Expo native/web.
- External live price retrieval is NOT available with existing integration. Playbook confirmed LlmChat has no supported hosted web search through the configured credentials. UI offers clearly labeled Amazon India/BigBasket/JioMart external searches, not fabricated retailer prices. Catalogue prices remain existing sample values.
- Delivery screen: packing crew, rounded green accents, illustrative route labels, accessible delivery info instead of inert call action, order-load retry. Existing sample timeline/countdown retained.

### Current verification
- TypeScript passes, frontend batch lint and backend modified-file lint pass.
- Testing agent report `/app/test_reports/iteration_6.json`: 15/15 focused new backend tests passed; UI identified preview CORS mismatch, a vendor grouping bug and missing legacy browser video.
- Fixed preview-origin mismatch by using the browser's own origin only on web; iOS/Android still use Constants-configured EXPO_PUBLIC_BACKEND_URL. No protected environment changes. UI then passed real AI session/streaming -> product add -> One Saver coupon apply -> sample checkout -> delivery story.
- Fixed cheeseburger misclassified as dairy: department classification precedes word-boundary dairy matching. Verified all 5 packing crews, wave and next controls; pager shows 1/5.
- Restored missing reel-burger/tomato/pasta WebM assets with existing transcode_reels.py. Verified burger playback advancing and selected 5 reel/photo cards opening correctly.
- Avoided SVG gradient ID collisions across retained screens using unique React IDs; One button now stays visible after assistant/cart navigation.
- Verified all 12 Discover photos loaded; All/Reels counts12/3; filters and full-screen navigation pass. Final image-loaded screenshots captured for Discover, Cart, One Saver, floating cart.
- Home/Food/Groceries/Shops/Care/Book It scroll-away headers and compact Explore restoration verified, including switching active pages. Animated add produces correct count/subtotal/free-delivery progress; removing last item hides bar.
- 390px mobile previews and 360px no horizontal overflow verified. Reduced-motion rendering verified; floating cart immediately visible when motion disabled.
- Re-ran focused real backend tests after fixes:15/15 passed, TypeScript and all frontend/Python changed-code lints pass. See `/app/test_reports/iteration_6_postfix.json`.
- One dependency-origin pointerEvents deprecation warning remains non-blocking. Native device behavior (haptics/microphone/keyboard) not device-tested.
- Final rapid reel navigation exposed Expo web's discarded HTML play() promises. Removed duplicate autoplay, pause on cleanup, and catch expected AbortError through VideoView's exposed web nativeRef; native player API unchanged. Verified rapid open/close, advancing playback and pause with zero browser page errors. Do not suppress global errors or edit node_modules for this.

### Remaining priorities
- P0: no known unresolved core-flow bugs in this update; await user review.
- P1: live retailer price provider (not connected); actual payments/fulfilment remain outside current existing sample infrastructure.
- P2: native device validation of haptics, long press, microphone permissions, and keyboard behavior.

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