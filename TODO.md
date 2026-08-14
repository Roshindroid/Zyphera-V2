# Task: Fix blank map on EditServiceLocation & pin drag not reflecting on Services.jsx

## Root Causes
- `useGoogleMaps.js` permanently caches a single module-level `sdkPromise`. If the
  Google script / `importLibrary('maps')` ever rejects (network, ad-block), that
  **rejected promise is cached forever**, so every later `useGoogleMaps()` returns it
  and the map never initialises (blank box).
- `MapPicker.jsx` init effect runs only once with no try/catch/retry, so a transient
  failure leaves the map permanently blank until a full reload.
- `MapPicker.jsx` never re-centers the map / moves the marker when `location_data`
  loads asynchronously, so the marker sits at the default center instead of the
  saved location.

## Root Cause (confirmed by feedback)
- The Google Maps API was loaded with the **legacy loader** (`maps/api/js?key=...&libraries=...&loading=async`),
  which does **not** define `google.maps.importLibrary`. Switched to the **Inline Bootstrap Loader**
  with `v=weekly` + a `callback`, which initializes `importLibrary` before the API finishes loading.
- `Services.jsx` injected its own independent Google script which overwrote the shared callback and
  called `init()` on `onload` **before** `importLibrary` was ready → "importLibrary is not a function".
- `MapPicker.jsx` only updated the form coordinates AFTER `await reverseGeocode(...)`. If the user dragged
  and clicked Save before geocoding resolved, the form still held the old coordinates → saved the old
  location but showed "updated successfully".

## Steps
- [x] 1. Rewrite `useGoogleMaps.js` with a shared `onGoogleMapsReady`/`ensureScript` bootstrap-loader registry (no callback collision, no premature init, no caching of rejected promises).
- [x] 2. Make `MapPicker.jsx` robust: try/catch with visible error, retry, re-center/move marker when `value.latitude`/`value.longitude` change, and update form coordinates IMMEDIATELY on drag (before geocoding).
- [x] 3. Update `Services.jsx` to use the shared `onGoogleMapsReady` loader instead of its own script injection.
- [x] 4. Verify the fix (vite build passes).
