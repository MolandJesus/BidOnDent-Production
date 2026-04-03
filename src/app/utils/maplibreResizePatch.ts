/**
 * MapLibre resize / render safety patch
 *
 * MapLibre's constructor calls _resizeInternal() before the projection
 * matrix is initialized, causing _calcMatrices to crash with
 * "Cannot read properties of null (reading '0')". This corrupts the map's
 * transform state (center, zoom) and prevents the style/tiles from loading.
 *
 * We patch three internal paths:
 * 1. _render         — top-level animation frame entry point
 * 2. resize          — external callers (react-map-gl ResizeObserver)
 * 3. _resizeInternal — called by the constructor before projection is ready
 *
 * For _resizeInternal we let the call proceed (skipping causes downstream
 * errors) but catch the failure and reset corrupted transform values so the
 * map can recover when the projection is initialized.
 *
 * Must be imported BEFORE any Map components are created.
 */
import maplibregl from "maplibre-gl";

/* eslint-disable @typescript-eslint/no-explicit-any */
const proto = maplibregl.Map.prototype as any;

// 1. Patch _render — the top-level animation frame entry point
const originalRender = proto._render;
if (originalRender) {
  proto._render = function (...args: unknown[]) {
    try {
      return originalRender.apply(this, args);
    } catch {
      // Map not fully initialized — schedule retry on next frame
      if (typeof this.triggerRepaint === "function") {
        this._requestedUpdate = false;
        this.triggerRepaint();
      }
    }
  };
}

// 2. Patch resize — external callers (react-map-gl ResizeObserver)
const originalResize = proto.resize;
if (originalResize) {
  proto.resize = function (...args: unknown[]) {
    try {
      return originalResize.apply(this, args);
    } catch {
      setTimeout(() => {
        try {
          originalResize.apply(this, args);
        } catch {
          // Will be retried by next render/resize cycle
        }
      }, 300);
      return this;
    }
  };
}

// 3. Patch _resizeInternal — constructor path. Let the call proceed but catch
//    the crash and repair the corrupted transform so subsequent init steps don't
//    cascade-fail.
const originalResizeInternal = proto._resizeInternal;
if (originalResizeInternal) {
  proto._resizeInternal = function (...args: unknown[]) {
    try {
      return originalResizeInternal.apply(this, args);
    } catch {
      // The partial execution corrupted the transform's zoom/center.
      // Patch them back to safe defaults so the rest of the constructor
      // can complete without NaN propagation.
      const t = this.transform;
      if (t) {
        if (t.zoom == null || !Number.isFinite(t.zoom)) t._zoom = 11;
        if (t._zoom == null || !Number.isFinite(t._zoom)) t._zoom = 11;
      }
      // Schedule deferred retry so the map can re-init dimensions once
      // the projection is fully set up.
      setTimeout(() => {
        try {
          originalResizeInternal.apply(this, args);
        } catch {
          // Will succeed on the next resize/render cycle
        }
      }, 200);
    }
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
