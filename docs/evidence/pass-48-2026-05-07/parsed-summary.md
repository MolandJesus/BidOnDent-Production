# Pass 48 — KI-053 Trace Parsed Summary

## trace-landing-1280.json

- Events: 204956 · Complete events: 75914 · Long-task burden (>50ms): **687ms**

### Top 10 by event name

| Event | total ms | count | max ms | avg ms |
|---|---:|---:|---:|---:|
| RunTask | 4244.7 | 29303 | 172.7 | 0.14 |
| UpdateLayoutTree | 398.5 | 663 | 1.2 | 0.6 |
| GPUTask | 325.3 | 1218 | 1 | 0.27 |
| FunctionCall | 217.4 | 790 | 21.3 | 0.28 |
| V8.StackGuard | 201.6 | 259 | 171.3 | 0.78 |
| V8.HandleInterrupts | 201.4 | 249 | 171.3 | 0.81 |
| V8.InvokeApiInterruptCallbacks | 192.5 | 4 | 171.3 | 48.11 |
| FireAnimationFrame | 175.7 | 219 | 2.6 | 0.8 |
| Paint | 121 | 5610 | 0.3 | 0.02 |
| Layerize | 112.3 | 654 | 0.6 | 0.17 |

### Top 10 by URL (script source)

| URL | total ms | count | max ms |
|---|---:|---:|---:|
| http://localhost:5173/node_modules/.vite/deps/maplibre-gl.js | 182.1 | 374 | 2.6 |
| (blob) | 22.6 | 14 | 21.3 |
| http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | 11.3 | 396 | 1 |
| http://localhost:5173/src/app/hooks/useNavigationGpsTracking.ts | 0.6 | 2 | 0.6 |
| http://localhost:5173/src/app/components/landing/HeroSection.tsx | 0.6 | 2 | 0.6 |
| https://joint-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js | 0.2 | 2 | 0.2 |
| (inline data:) | 0 | 1 | 0 |

### Top 10 by JS function

| Function | total ms | count | max ms |
|---|---:|---:|---:|
| dispatchContinuousEvent | 5.7 | 236 | 0.5 |
| handleEvent | 5.1 | 70 | 0.5 |
| handleWindowEvent | 4.1 | 59 | 0.4 |
| performWorkUntilDeadline | 2.4 | 3 | 1 |
| dispatchEvent | 1.2 | 120 | 0.1 |
| dispatchDiscreteEvent | 0.7 | 34 | 0.1 |
| Tp._channel.port2.onmessage | 0.2 | 6 | 0.1 |
| o | 0.2 | 1 | 0.2 |
| suppressClickInternal | 0 | 4 | 0 |

### Longest 10 single tasks (>50ms)

| name | ms | url | fn |
|---|---:|---|---|
| RunTask | 172.7 | (no-url) |  |
| V8.StackGuard | 171.3 | (no-url) |  |
| V8.HandleInterrupts | 171.3 | (no-url) |  |
| V8.InvokeApiInterruptCallbacks | 171.3 | (no-url) |  |

## trace-dialog-1280.json

- Events: 194290 · Complete events: 67743 · Long-task burden (>50ms): **0ms**

### Top 10 by event name

| Event | total ms | count | max ms | avg ms |
|---|---:|---:|---:|---:|
| RunTask | 3287.3 | 24967 | 37.7 | 0.13 |
| UpdateLayoutTree | 387.4 | 652 | 1.3 | 0.59 |
| GPUTask | 214.3 | 965 | 1.3 | 0.22 |
| Layerize | 123.9 | 643 | 0.6 | 0.19 |
| Paint | 117 | 5833 | 0.3 | 0.02 |
| Commit | 93.6 | 643 | 0.4 | 0.15 |
| PrePaint | 77.2 | 803 | 0.3 | 0.1 |
| V8.StackGuard | 39.6 | 15 | 37 | 2.64 |
| V8.HandleInterrupts | 39.6 | 15 | 37 | 2.64 |
| V8.InvokeApiInterruptCallbacks | 38.7 | 3 | 37 | 12.9 |

### Top 10 by URL (script source)

| URL | total ms | count | max ms |
|---|---:|---:|---:|
| http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | 13.9 | 108 | 2 |
| http://localhost:5173/src/app/components/landing/LandingPageHeader.tsx | 4.3 | 6 | 0.8 |
| http://localhost:5173/node_modules/.vite/deps/maplibre-gl.js | 3.1 | 44 | 0.4 |
| (blob) | 1.8 | 2 | 1.8 |
| ...int-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5.125.10/dist/framework_clerk.browser_75d171_5.125.10.js | 0.4 | 1 | 0.4 |
| http://localhost:5173/src/app/hooks/useParallaxOffset.ts | 0.4 | 24 | 0.1 |
| https://joint-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js | 0.1 | 2 | 0.1 |
| http://localhost:5173/src/app/components/landing/HeroSection.tsx | 0.1 | 1 | 0.1 |
| http://localhost:5173/src/app/hooks/useScrollAnimation.ts | 0 | 2 | 0 |
| http://localhost:5173/src/app/hooks/useNavigationGpsTracking.ts | 0 | 2 | 0 |

### Top 10 by JS function

| Function | total ms | count | max ms |
|---|---:|---:|---:|
| performWorkUntilDeadline | 12.1 | 9 | 2 |
| handleScroll | 4.4 | 18 | 0.8 |
| handleWindowEvent | 3.1 | 44 | 0.4 |
| dispatchEvent | 1.3 | 92 | 0.1 |
| nO | 0.4 | 1 | 0.4 |
| dispatchDiscreteEvent | 0.2 | 3 | 0.1 |
| dispatchContinuousEvent | 0.2 | 4 | 0.1 |
| o | 0.1 | 1 | 0.1 |
| IntersectionObserver.threshold.threshold | 0 | 2 | 0 |

### Longest 10 single tasks (>50ms)

| name | ms | url | fn |
|---|---:|---|---|

## trace-landing-375.json

- Events: 151940 · Complete events: 57538 · Long-task burden (>50ms): **897ms**

### Top 10 by event name

| Event | total ms | count | max ms | avg ms |
|---|---:|---:|---:|---:|
| RunTask | 4248.9 | 28871 | 231.2 | 0.15 |
| GPUTask | 242.1 | 1239 | 1.7 | 0.2 |
| V8.StackGuard | 198.5 | 298 | 166.4 | 0.67 |
| V8.HandleInterrupts | 198.2 | 291 | 166.4 | 0.68 |
| V8.InvokeApiInterruptCallbacks | 188.6 | 4 | 166.4 | 47.15 |
| FunctionCall | 188.4 | 766 | 22.2 | 0.25 |
| Layerize | 145.2 | 627 | 0.6 | 0.23 |
| FireAnimationFrame | 142 | 195 | 2.2 | 0.73 |
| UpdateLayoutTree | 112.5 | 637 | 0.6 | 0.18 |
| V8.GC_MC_BACKGROUND_MARKING | 86.9 | 51 | 3.5 | 1.7 |

### Top 10 by URL (script source)

| URL | total ms | count | max ms |
|---|---:|---:|---:|
| http://localhost:5173/node_modules/.vite/deps/maplibre-gl.js | 150.6 | 368 | 2.2 |
| (blob) | 25.9 | 32 | 22.2 |
| http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | 11.4 | 360 | 1 |
| http://localhost:5173/src/app/components/landing/HeroSection.tsx | 0.4 | 2 | 0.3 |
| https://joint-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js | 0.1 | 2 | 0.1 |
| http://localhost:5173/src/app/hooks/useNavigationGpsTracking.ts | 0.1 | 2 | 0 |
| (inline data:) | 0 | 1 | 0 |

### Top 10 by JS function

| Function | total ms | count | max ms |
|---|---:|---:|---:|
| dispatchContinuousEvent | 5.5 | 236 | 0.4 |
| handleEvent | 4.9 | 70 | 0.6 |
| handleWindowEvent | 3.8 | 59 | 0.2 |
| Tp._channel.port2.onmessage | 2.5 | 15 | 0.4 |
| performWorkUntilDeadline | 2.4 | 3 | 1 |
| dispatchDiscreteEvent | 1.1 | 34 | 0.4 |
| dispatchEvent | 0.9 | 84 | 0.1 |
| o | 0.1 | 1 | 0.1 |
| suppressClickInternal | 0.1 | 4 | 0 |

### Longest 10 single tasks (>50ms)

| name | ms | url | fn |
|---|---:|---|---|
| RunTask | 231.2 | (no-url) |  |
| RunTask | 166.9 | (no-url) |  |
| V8.StackGuard | 166.4 | (no-url) |  |
| V8.HandleInterrupts | 166.4 | (no-url) |  |
| V8.InvokeApiInterruptCallbacks | 166.4 | (no-url) |  |

## trace-dialog-375.json

- Events: 153947 · Complete events: 53553 · Long-task burden (>50ms): **0ms**

### Top 10 by event name

| Event | total ms | count | max ms | avg ms |
|---|---:|---:|---:|---:|
| RunTask | 2578.3 | 25841 | 33.1 | 0.1 |
| Layerize | 158.5 | 644 | 0.4 | 0.25 |
| GPUTask | 153.7 | 853 | 1.8 | 0.18 |
| UpdateLayoutTree | 109.1 | 653 | 0.7 | 0.17 |
| V8.GC_MC_BACKGROUND_MARKING | 102.8 | 60 | 3.4 | 1.71 |
| Commit | 63.1 | 644 | 0.3 | 0.1 |
| Paint | 56.6 | 1286 | 0.5 | 0.04 |
| PrePaint | 53.3 | 838 | 0.1 | 0.06 |
| V8.HandleInterrupts | 33.7 | 10 | 32.6 | 3.37 |
| V8.StackGuard | 33.7 | 10 | 32.6 | 3.37 |

### Top 10 by URL (script source)

| URL | total ms | count | max ms |
|---|---:|---:|---:|
| http://localhost:5173/node_modules/.vite/deps/chunk-KDCVS43I.js | 14.1 | 82 | 1.9 |
| http://localhost:5173/node_modules/.vite/deps/maplibre-gl.js | 3 | 44 | 0.1 |
| http://localhost:5173/src/app/components/landing/LandingPageHeader.tsx | 1.2 | 6 | 0.2 |
| (blob) | 0.7 | 2 | 0.7 |
| ...int-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5.125.10/dist/framework_clerk.browser_75d171_5.125.10.js | 0.4 | 1 | 0.4 |
| http://localhost:5173/src/app/hooks/useParallaxOffset.ts | 0.3 | 24 | 0 |
| http://localhost:5173/src/app/components/landing/HeroSection.tsx | 0.2 | 2 | 0.1 |
| https://joint-oarfish-23.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js | 0.1 | 2 | 0.1 |
| http://localhost:5173/src/app/hooks/useNavigationGpsTracking.ts | 0 | 2 | 0 |
| http://localhost:5173/src/app/hooks/useScrollAnimation.ts | 0 | 1 | 0 |

### Top 10 by JS function

| Function | total ms | count | max ms |
|---|---:|---:|---:|
| performWorkUntilDeadline | 12.8 | 9 | 1.9 |
| handleWindowEvent | 3 | 44 | 0.1 |
| handleScroll | 1.3 | 18 | 0.2 |
| dispatchEvent | 0.9 | 66 | 0.3 |
| nO | 0.4 | 1 | 0.4 |
| dispatchDiscreteEvent | 0.2 | 3 | 0.1 |
| dispatchContinuousEvent | 0.2 | 4 | 0.1 |
| o | 0.1 | 1 | 0.1 |
| IntersectionObserver.threshold.threshold | 0 | 1 | 0 |

### Longest 10 single tasks (>50ms)

| name | ms | url | fn |
|---|---:|---|---|
