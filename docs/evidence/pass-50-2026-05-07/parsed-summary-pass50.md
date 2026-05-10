# Pass 50 — useParallaxOffset Throttle: Parsed Trace Summary

## trace-landing-1280-after-noscroll-pass50.json

- Events: 148301 · Complete events: 56245 · Long-task burden (>50ms): **926ms**

### Top 10 by event name

| Event | total ms | count | max ms | avg ms |
|---|---:|---:|---:|---:|
| RunTask | 4392.5 | 25284 | 156.8 | 0.17 |
| GPUTask | 617 | 1319 | 3.6 | 0.47 |
| UpdateLayoutTree | 293.2 | 578 | 9.8 | 0.51 |
| FunctionCall | 195.5 | 314 | 154 | 0.62 |
| Layerize | 192.3 | 576 | 0.6 | 0.33 |
| EventDispatch | 163.7 | 133 | 154.1 | 1.23 |
| V8.HandleInterrupts | 156.9 | 64 | 153.9 | 2.45 |
| V8.StackGuard | 156.9 | 62 | 153.9 | 2.53 |
| V8.InvokeApiInterruptCallbacks | 154.8 | 2 | 153.9 | 77.39 |
| Paint | 109.6 | 4664 | 1.4 | 0.02 |

### Top 10 by URL (script source)

| URL | total ms | count | max ms |
|---|---:|---:|---:|
| http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | 185.2 | 251 | 154 |
| http://localhost:5173/src/styles/index.css | 4.8 | 2 | 4.4 |
| http://localhost:5173/@react-refresh | 4.2 | 1 | 4.2 |
| http://localhost:5173/src/app/components/landing/LandingPageHeader.tsx | 3 | 7 | 0.5 |
| http://localhost:5173/src/app/hooks/useParallaxOffset.ts | 1.4 | 32 | 0.4 |
| http://localhost:5173/src/app/components/landing/HeroSection.tsx | 1.3 | 4 | 0.9 |
| (blob) | 1.1 | 2 | 1.1 |
| http://localhost:5173/src/app/components/landing/OperatingRegionsSection.tsx | 0.7 | 3 | 0.6 |
| http://localhost:5173/@vite/client | 0.3 | 1 | 0.3 |
| https://joint-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js | 0.2 | 2 | 0.2 |

### Top 10 by JS function

| Function | total ms | count | max ms |
|---|---:|---:|---:|
| dispatchContinuousEvent | 156.9 | 106 | 154 |
| performWorkUntilDeadline | 26.4 | 14 | 5.2 |
| handleScroll | 3.3 | 21 | 0.5 |
| dispatchEvent | 1.9 | 130 | 0.1 |
| o | 0.2 | 1 | 0.2 |
| handleOrientation | 0 | 2 | 0 |
| IntersectionObserver.rootMargin | 0 | 1 | 0 |
| next | 0 | 8 | 0 |
| entries | 0 | 2 | 0 |
| navigator.geolocation.watchPosition.enableHighAccuracy | 0 | 1 | 0 |

### Longest 10 single tasks (>50ms)

| name | ms | url | fn |
|---|---:|---|---|
| RunTask | 156.8 | (no-url) |  |
| EventDispatch | 154.1 | (no-url) |  |
| FunctionCall | 154 | http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | dispatchContinuousEvent |
| V8.StackGuard | 153.9 | (no-url) |  |
| V8.HandleInterrupts | 153.9 | (no-url) |  |
| V8.InvokeApiInterruptCallbacks | 153.9 | (no-url) |  |

## trace-landing-1280-after-scrolled-pass50.json

- Events: 211210 · Complete events: 78303 · Long-task burden (>50ms): **699ms**

### Top 10 by event name

| Event | total ms | count | max ms | avg ms |
|---|---:|---:|---:|---:|
| RunTask | 4226.8 | 29826 | 175.9 | 0.14 |
| GPUTask | 353.6 | 1681 | 1.1 | 0.21 |
| UpdateLayoutTree | 296.7 | 660 | 0.9 | 0.45 |
| FunctionCall | 251.8 | 863 | 21.7 | 0.29 |
| V8.StackGuard | 208 | 254 | 174.3 | 0.82 |
| V8.HandleInterrupts | 207.9 | 244 | 174.3 | 0.85 |
| FireAnimationFrame | 206.3 | 293 | 2.9 | 0.7 |
| V8.InvokeApiInterruptCallbacks | 196 | 3 | 174.3 | 65.32 |
| Layerize | 130.4 | 651 | 0.7 | 0.2 |
| Paint | 124.5 | 5956 | 0.2 | 0.02 |

### Top 10 by URL (script source)

| URL | total ms | count | max ms |
|---|---:|---:|---:|
| http://localhost:5173/node_modules/.vite/deps/maplibre-gl.js | 211.2 | 448 | 2.9 |
| (blob) | 23 | 14 | 21.7 |
| http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | 16.9 | 390 | 1.9 |
| http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js | 0.2 | 3 | 0.2 |
| https://joint-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js | 0.2 | 2 | 0.2 |
| http://localhost:5173/src/app/hooks/useNavigationGpsTracking.ts | 0.2 | 3 | 0.1 |
| http://localhost:5173/src/app/components/landing/HeroSection.tsx | 0.1 | 2 | 0.1 |
| http://localhost:5173/ | 0.1 | 1 | 0.1 |
| (inline data:) | 0 | 1 | 0 |

### Top 10 by JS function

| Function | total ms | count | max ms |
|---|---:|---:|---:|
| dispatchContinuousEvent | 7.1 | 236 | 1.2 |
| performWorkUntilDeadline | 5.7 | 5 | 1.9 |
| handleEvent | 5.2 | 70 | 0.6 |
| handleWindowEvent | 4 | 59 | 0.2 |
| dispatchEvent | 1.6 | 112 | 0.1 |
| dispatchDiscreteEvent | 0.9 | 34 | 0.2 |
| Tp._channel.port2.onmessage | 0.2 | 6 | 0.1 |
| o | 0.2 | 1 | 0.2 |
| navigator.geolocation.watchPosition.enableHighAccuracy | 0.1 | 1 | 0.1 |
| suppressClickInternal | 0 | 4 | 0 |

### Longest 10 single tasks (>50ms)

| name | ms | url | fn |
|---|---:|---|---|
| RunTask | 175.9 | (no-url) |  |
| V8.StackGuard | 174.3 | (no-url) |  |
| V8.HandleInterrupts | 174.3 | (no-url) |  |
| V8.InvokeApiInterruptCallbacks | 174.3 | (no-url) |  |

## trace-landing-375-after-noscroll-pass50.json

- Events: 75851 · Complete events: 28813 · Long-task burden (>50ms): **1352ms**

### Top 10 by event name

| Event | total ms | count | max ms | avg ms |
|---|---:|---:|---:|---:|
| RunTask | 5966.3 | 16039 | 196.7 | 0.37 |
| GPUTask | 1414.8 | 784 | 196.7 | 1.8 |
| FunctionCall | 176.8 | 220 | 148.6 | 0.8 |
| EventDispatch | 154.2 | 94 | 148.7 | 1.64 |
| V8.StackGuard | 151.6 | 70 | 148.5 | 2.17 |
| V8.HandleInterrupts | 151.6 | 70 | 148.5 | 2.17 |
| V8.InvokeApiInterruptCallbacks | 149.6 | 4 | 148.5 | 37.39 |
| UpdateLayoutTree | 68.3 | 350 | 0.7 | 0.2 |
| Layerize | 64.3 | 339 | 0.3 | 0.19 |
| Paint | 37.5 | 746 | 0.2 | 0.05 |

### Top 10 by URL (script source)

| URL | total ms | count | max ms |
|---|---:|---:|---:|
| http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | 173.4 | 176 | 148.6 |
| http://localhost:5173/src/app/components/landing/LandingPageHeader.tsx | 1.3 | 7 | 0.3 |
| (blob) | 1.2 | 2 | 1.2 |
| http://localhost:5173/src/app/hooks/useParallaxOffset.ts | 0.3 | 28 | 0 |
| http://localhost:5173/src/app/features/notifications/useNotificationEvents.ts | 0.2 | 1 | 0.2 |
| https://joint-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js | 0.1 | 2 | 0.1 |
| http://localhost:5173/src/app/hooks/useNavigationGpsTracking.ts | 0.1 | 2 | 0.1 |
| http://localhost:5173/src/app/components/landing/HeroSection.tsx | 0.1 | 1 | 0.1 |
| http://localhost:5173/src/app/hooks/useScrollAnimation.ts | 0 | 1 | 0 |

### Top 10 by JS function

| Function | total ms | count | max ms |
|---|---:|---:|---:|
| dispatchContinuousEvent | 150.7 | 82 | 148.6 |
| performWorkUntilDeadline | 21.7 | 10 | 4.6 |
| handleScroll | 1.4 | 21 | 0.3 |
| dispatchEvent | 1 | 84 | 0.1 |
| o | 0.1 | 1 | 0.1 |
| IntersectionObserver.threshold.threshold | 0 | 1 | 0 |

### Longest 10 single tasks (>50ms)

| name | ms | url | fn |
|---|---:|---|---|
| RunTask | 196.7 | (no-url) |  |
| GPUTask | 196.7 | (no-url) |  |
| RunTask | 150.2 | (no-url) |  |
| EventDispatch | 148.7 | (no-url) |  |
| FunctionCall | 148.6 | http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | dispatchContinuousEvent |
| V8.StackGuard | 148.5 | (no-url) |  |
| V8.HandleInterrupts | 148.5 | (no-url) |  |
| V8.InvokeApiInterruptCallbacks | 148.5 | (no-url) |  |
| RunTask | 66 | (no-url) |  |

## trace-landing-375-after-scrolled-pass50.json

- Events: 141725 · Complete events: 42027 · Long-task burden (>50ms): **617ms**

### Top 10 by event name

| Event | total ms | count | max ms | avg ms |
|---|---:|---:|---:|---:|
| RunTask | 2024.8 | 16114 | 154.4 | 0.13 |
| Layerize | 155.4 | 602 | 0.4 | 0.26 |
| V8.StackGuard | 155.4 | 10 | 154.2 | 15.54 |
| V8.HandleInterrupts | 155.4 | 10 | 154.2 | 15.54 |
| V8.InvokeApiInterruptCallbacks | 154.9 | 2 | 154.2 | 77.47 |
| UpdateLayoutTree | 96.8 | 602 | 0.5 | 0.16 |
| V8.GC_MC_BACKGROUND_MARKING | 69.2 | 50 | 3 | 1.38 |
| Paint | 59.8 | 1850 | 0.2 | 0.03 |
| Commit | 58.6 | 602 | 0.2 | 0.1 |
| PrePaint | 47.6 | 602 | 0.2 | 0.08 |

### Top 10 by URL (script source)

| URL | total ms | count | max ms |
|---|---:|---:|---:|
| http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | 4.1 | 67 | 1.5 |
| (blob) | 0.8 | 2 | 0.8 |
| http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js | 0.2 | 3 | 0.1 |
| http://localhost:5173/src/app/hooks/useNavigationGpsTracking.ts | 0.2 | 3 | 0.1 |
| https://joint-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js | 0.1 | 2 | 0.1 |
| http://localhost:5173/ | 0.1 | 1 | 0.1 |
| http://localhost:5173/src/app/components/landing/HeroSection.tsx | 0.1 | 1 | 0.1 |

### Top 10 by JS function

| Function | total ms | count | max ms |
|---|---:|---:|---:|
| performWorkUntilDeadline | 3.1 | 3 | 1.5 |
| dispatchEvent | 1 | 64 | 0.2 |
| o | 0.1 | 1 | 0.1 |
| navigator.geolocation.watchPosition.enableHighAccuracy | 0.1 | 1 | 0.1 |

### Longest 10 single tasks (>50ms)

| name | ms | url | fn |
|---|---:|---|---|
| RunTask | 154.4 | (no-url) |  |
| V8.StackGuard | 154.2 | (no-url) |  |
| V8.HandleInterrupts | 154.2 | (no-url) |  |
| V8.InvokeApiInterruptCallbacks | 154.2 | (no-url) |  |
