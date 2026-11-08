# Photobooth Filter V1.2 – Testable four-frame pipeline

This component implements the **filter state machine**, not a replacement camera.

### API contract

```js
const {PhotoboothFilter} = require('./js/PhotoboothFilter.js');
const multiShot = new PhotoboothFilter();
await multiShot.capture(async () => cameraCallbackReturnFrame());
await multiShot.capture(async () => cameraCallbackReturnFrame());
await multiShot.capture(async () => cameraCallbackReturnFrame());
await multiShot.capture(async () => cameraCallbackReturnFrame());
const image = multiShot.compose((frames,config) => renderComposition(config,frames), config);
```

Frame input must be supplied by the host app through a trusted callback. The filter supports sequential capture, re-taking a chosen frame, completing four frames and passing them to the already-written compositor. 40 caption presets and Photobooth's PNG/GIF/video renderer remain available in the project. No paywall or account requirement.

### Acceptance

`node photobooth/test-multishot.cjs` verifies frame order, replacement, reset, guards and that missing camera frames do not produce a false completed state.

### Native Locket / Shadowrocket compatibility

**Not achieved.** The scripts run in a separate JavaScript environment and have no access to the native Locket shutter, camera frames, editor view, or UI events. A RAW GitHub URL is a way to distribute code, not a runtime injection into Locket. Turning on VPN, HTTPS MITM and a CA certificate does not create such access. Importing this JS file as an http-response script would not make the filter appear inside Locket. Consequently **no fake Locket .sgmodule** is provided.

Do not intercept Locket photos, auth headers or private requests for debugging. No secrets or user media are collected. The only way to claim native compatibility is to identify an actual supported extension point in Locket or have authorization to modify its native source.
