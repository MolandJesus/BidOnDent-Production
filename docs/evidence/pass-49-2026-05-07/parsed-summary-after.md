# Pass 49 — Lazy-Mount Inline Landing Map: Parsed Trace Summary

## trace-landing-1280-after-noscroll.json

- Events: 144677 · Complete events: 52986 · Long-task burden (>50ms): **892ms**

### Top 10 by event name

| Event | total ms | count | max ms | avg ms |
|---|---:|---:|---:|---:|
| RunTask | 4044.6 | 22587 | 150.3 | 0.18 |
| GPUTask | 570.8 | 1177 | 3.6 | 0.48 |
| UpdateLayoutTree | 263.3 | 585 | 0.9 | 0.45 |
| FunctionCall | 179.8 | 293 | 148.4 | 0.61 |
| Layerize | 179.3 | 585 | 0.6 | 0.31 |
| EventDispatch | 156.3 | 132 | 148.6 | 1.18 |
| V8.StackGuard | 151 | 57 | 148.3 | 2.65 |
| V8.HandleInterrupts | 150.9 | 57 | 148.3 | 2.65 |
| V8.InvokeApiInterruptCallbacks | 149.1 | 2 | 148.3 | 74.53 |
| Paint | 108.4 | 4592 | 0.3 | 0.02 |

### Top 10 by URL (script source)

| URL | total ms | count | max ms |
|---|---:|---:|---:|
| http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | 175.7 | 250 | 148.4 |
| http://localhost:5173/src/app/components/landing/LandingPageHeader.tsx | 2.2 | 7 | 0.4 |
| (blob) | 1 | 2 | 1 |
| http://localhost:5173/src/app/hooks/useParallaxOffset.ts | 0.3 | 28 | 0 |
| http://localhost:5173/src/app/features/notifications/useNotificationEvents.ts | 0.2 | 1 | 0.2 |
| http://localhost:5173/src/app/hooks/useNavigationGpsTracking.ts | 0.2 | 2 | 0.2 |
| https://joint-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js | 0.1 | 2 | 0.1 |
| http://localhost:5173/src/app/components/landing/HeroSection.tsx | 0.1 | 1 | 0.1 |

### Top 10 by JS function

| Function | total ms | count | max ms |
|---|---:|---:|---:|
| dispatchContinuousEvent | 150.5 | 106 | 148.4 |
| performWorkUntilDeadline | 23.1 | 10 | 5.1 |
| handleScroll | 2.3 | 21 | 0.4 |
| dispatchEvent | 2 | 134 | 0.2 |
| o | 0.1 | 1 | 0.1 |

### Longest 10 single tasks (>50ms)

| name | ms | url | fn |
|---|---:|---|---|
| RunTask | 150.3 | (no-url) |  |
| EventDispatch | 148.6 | (no-url) |  |
| FunctionCall | 148.4 | http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | dispatchContinuousEvent |
| V8.StackGuard | 148.3 | (no-url) |  |
| V8.HandleInterrupts | 148.3 | (no-url) |  |
| V8.InvokeApiInterruptCallbacks | 148.3 | (no-url) |  |

## trace-landing-1280-after-scrolled.json

- Events: 211739 · Complete events: 78206 · Long-task burden (>50ms): **670ms**

### Top 10 by event name

| Event | total ms | count | max ms | avg ms |
|---|---:|---:|---:|---:|
| RunTask | 4083.3 | 29644 | 168.8 | 0.14 |
| GPUTask | 325.8 | 1566 | 0.9 | 0.21 |
| UpdateLayoutTree | 309.8 | 661 | 0.9 | 0.47 |
| FunctionCall | 237 | 826 | 21.2 | 0.29 |
| V8.StackGuard | 198.9 | 232 | 167.1 | 0.86 |
| V8.HandleInterrupts | 198.7 | 227 | 167.1 | 0.88 |
| FireAnimationFrame | 191.8 | 256 | 2.6 | 0.75 |
| V8.InvokeApiInterruptCallbacks | 189.7 | 4 | 167.1 | 47.42 |
| Layerize | 130.6 | 651 | 0.5 | 0.2 |
| Paint | 126.4 | 5962 | 0.4 | 0.02 |

### Top 10 by URL (script source)

| URL | total ms | count | max ms |
|---|---:|---:|---:|
| http://localhost:5173/node_modules/.vite/deps/maplibre-gl.js | 197.5 | 411 | 2.6 |
| (blob) | 23.6 | 14 | 21.2 |
| http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | 15.2 | 390 | 1.7 |
| http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js | 0.2 | 3 | 0.1 |
| http://localhost:5173/src/app/hooks/useNavigationGpsTracking.ts | 0.2 | 3 | 0.1 |
| http://localhost:5173/src/app/components/landing/HeroSection.tsx | 0.1 | 2 | 0.1 |
| https://joint-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js | 0.1 | 2 | 0.1 |
| http://localhost:5173/ | 0.1 | 1 | 0.1 |
| (inline data:) | 0 | 1 | 0 |

### Top 10 by JS function

| Function | total ms | count | max ms |
|---|---:|---:|---:|
| performWorkUntilDeadline | 5.7 | 5 | 1.7 |
| dispatchContinuousEvent | 5.6 | 236 | 0.9 |
| handleEvent | 5 | 70 | 0.5 |
| handleWindowEvent | 4 | 59 | 0.2 |
| dispatchEvent | 1.6 | 112 | 0.3 |
| dispatchDiscreteEvent | 0.9 | 34 | 0.2 |
| Tp._channel.port2.onmessage | 0.2 | 6 | 0.1 |
| navigator.geolocation.watchPosition.enableHighAccuracy | 0.1 | 1 | 0.1 |
| o | 0.1 | 1 | 0.1 |
| suppressClickInternal | 0 | 4 | 0 |

### Longest 10 single tasks (>50ms)

| name | ms | url | fn |
|---|---:|---|---|
| RunTask | 168.8 | (no-url) |  |
| V8.StackGuard | 167.1 | (no-url) |  |
| V8.HandleInterrupts | 167.1 | (no-url) |  |
| V8.InvokeApiInterruptCallbacks | 167.1 | (no-url) |  |

## trace-landing-375-after-noscroll.json

- Events: 73803 · Complete events: 28226 · Long-task burden (>50ms): **1269ms**

### Top 10 by event name

| Event | total ms | count | max ms | avg ms |
|---|---:|---:|---:|---:|
| RunTask | 5766.5 | 15754 | 151.5 | 0.37 |
| GPUTask | 1274.8 | 795 | 151.5 | 1.6 |
| FunctionCall | 177.2 | 220 | 149.3 | 0.81 |
| EventDispatch | 155.1 | 96 | 149.5 | 1.62 |
| V8.HandleInterrupts | 151.9 | 67 | 149.2 | 2.27 |
| V8.StackGuard | 151.9 | 66 | 149.2 | 2.3 |
| V8.InvokeApiInterruptCallbacks | 149.9 | 3 | 149.2 | 49.97 |
| UpdateLayoutTree | 67.2 | 340 | 0.6 | 0.2 |
| Layerize | 60.8 | 328 | 0.3 | 0.19 |
| Paint | 37.4 | 731 | 0.3 | 0.05 |

### Top 10 by URL (script source)

| URL | total ms | count | max ms |
|---|---:|---:|---:|
| http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | 173.7 | 176 | 149.3 |
| http://localhost:5173/src/app/components/landing/LandingPageHeader.tsx | 1.4 | 7 | 0.3 |
| (blob) | 0.9 | 2 | 0.8 |
| http://localhost:5173/src/app/hooks/useNavigationGpsTracking.ts | 0.5 | 2 | 0.5 |
| http://localhost:5173/src/app/hooks/useParallaxOffset.ts | 0.3 | 28 | 0 |
| https://joint-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js | 0.2 | 2 | 0.1 |
| http://localhost:5173/src/app/components/landing/HeroSection.tsx | 0.1 | 1 | 0.1 |
| http://localhost:5173/src/app/features/notifications/useNotificationEvents.ts | 0 | 1 | 0 |
| http://localhost:5173/src/app/hooks/useScrollAnimation.ts | 0 | 1 | 0 |

### Top 10 by JS function

| Function | total ms | count | max ms |
|---|---:|---:|---:|
| dispatchContinuousEvent | 151.4 | 82 | 149.3 |
| performWorkUntilDeadline | 21.3 | 10 | 4.8 |
| handleScroll | 1.5 | 21 | 0.3 |
| dispatchEvent | 1.1 | 84 | 0.1 |
| o | 0.1 | 1 | 0.1 |
| IntersectionObserver.threshold.threshold | 0 | 1 | 0 |

### Longest 10 single tasks (>50ms)

| name | ms | url | fn |
|---|---:|---|---|
| RunTask | 151.5 | (no-url) |  |
| GPUTask | 151.5 | (no-url) |  |
| RunTask | 151 | (no-url) |  |
| EventDispatch | 149.5 | (no-url) |  |
| FunctionCall | 149.3 | http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | dispatchContinuousEvent |
| V8.StackGuard | 149.2 | (no-url) |  |
| V8.HandleInterrupts | 149.2 | (no-url) |  |
| V8.InvokeApiInterruptCallbacks | 149.2 | (no-url) |  |
| RunTask | 68.4 | (no-url) |  |

## trace-landing-375-after-scrolled.json

- Events: 142171 · Complete events: 42138 · Long-task burden (>50ms): **597ms**

### Top 10 by event name

| Event | total ms | count | max ms | avg ms |
|---|---:|---:|---:|---:|
| RunTask | 1933.2 | 16231 | 149.4 | 0.12 |
| V8.HandleInterrupts | 150.1 | 10 | 149.1 | 15.01 |
| V8.StackGuard | 150 | 9 | 149.1 | 16.67 |
| V8.InvokeApiInterruptCallbacks | 149.8 | 2 | 149.1 | 74.92 |
| Layerize | 148.1 | 602 | 0.5 | 0.25 |
| UpdateLayoutTree | 95.4 | 602 | 0.6 | 0.16 |
| V8.GC_MC_BACKGROUND_MARKING | 68.8 | 49 | 2.8 | 1.4 |
| Paint | 59.5 | 1850 | 0.2 | 0.03 |
| Commit | 57.8 | 603 | 0.2 | 0.1 |
| PrePaint | 47.3 | 602 | 0.2 | 0.08 |

### Top 10 by URL (script source)

| URL | total ms | count | max ms |
|---|---:|---:|---:|
| http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | 4.2 | 67 | 1.5 |
| (blob) | 0.8 | 2 | 0.8 |
| http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js | 0.2 | 3 | 0.1 |
| http://localhost:5173/src/app/hooks/useNavigationGpsTracking.ts | 0.2 | 3 | 0.1 |
| https://joint-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js | 0.1 | 2 | 0.1 |
| http://localhost:5173/src/app/components/landing/HeroSection.tsx | 0.1 | 1 | 0.1 |
| http://localhost:5173/ | 0.1 | 1 | 0.1 |

### Top 10 by JS function

| Function | total ms | count | max ms |
|---|---:|---:|---:|
| performWorkUntilDeadline | 3.5 | 3 | 1.5 |
| dispatchEvent | 0.7 | 64 | 0.1 |
| o | 0.1 | 1 | 0.1 |
| navigator.geolocation.watchPosition.enableHighAccuracy | 0.1 | 1 | 0.1 |

### Longest 10 single tasks (>50ms)

| name | ms | url | fn |
|---|---:|---|---|
| RunTask | 149.4 | (no-url) |  |
| V8.StackGuard | 149.1 | (no-url) |  |
| V8.HandleInterrupts | 149.1 | (no-url) |  |
| V8.InvokeApiInterruptCallbacks | 149.1 | (no-url) |  |
